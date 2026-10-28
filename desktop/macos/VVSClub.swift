import AppKit
import WebKit

struct Site: Decodable {
    let name: String
    let url: String
}

// 玻璃的轮廓与反光随系统外观变化，减少透明度时使用实底。
final class ClubGlass: NSVisualEffectView {
    private let sheen = CAGradientLayer()
    override func viewDidMoveToWindow() {
        super.viewDidMoveToWindow()
        wantsLayer = true
        if sheen.superlayer == nil { layer?.insertSublayer(sheen, at: 0) }
        refreshGlass()
    }
    override func layout() { super.layout(); sheen.frame = bounds }
    private func refreshGlass() {
        let dark = effectiveAppearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua
        sheen.colors = [NSColor.white.withAlphaComponent(dark ? 0.13 : 0.55).cgColor,
                        NSColor.white.withAlphaComponent(dark ? 0.035 : 0.12).cgColor,
                        NSColor.white.withAlphaComponent(dark ? 0.08 : 0.30).cgColor]
        sheen.locations = [0, 0.42, 1]
        sheen.startPoint = CGPoint(x: 0, y: 1)
        sheen.endPoint = CGPoint(x: 0.9, y: 0)
        sheen.cornerRadius = 26
        layer?.borderWidth = 1
        layer?.borderColor = NSColor.white.withAlphaComponent(dark ? 0.19 : 0.79).cgColor
        layer?.cornerRadius = 26
    }
    override func viewDidChangeEffectiveAppearance() { super.viewDidChangeEffectiveAppearance(); refreshGlass() }
}

final class ClubBackdrop: NSView {
    override func draw(_ dirtyRect: NSRect) {
        let dark = effectiveAppearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua
        let colors: [NSColor] = dark
            ? [NSColor(white: 0.031, alpha: 1), NSColor(white: 0.031, alpha: 1)]
            : [NSColor(white: 0.965, alpha: 1), NSColor(white: 0.965, alpha: 1)]
        NSGradient(colors: colors)?.draw(in: bounds, angle: -65)
    }
    override func viewDidChangeEffectiveAppearance() { super.viewDidChangeEffectiveAppearance(); needsDisplay = true }
}

final class ClubSidebarButton: NSButton {
    private var hovering = false
    private var tracking: NSTrackingArea?
    override var state: NSControl.StateValue { didSet { needsDisplay = true } }
    override func updateTrackingAreas() {
        if let tracking = tracking { removeTrackingArea(tracking) }
        tracking = NSTrackingArea(rect: bounds, options: [.mouseEnteredAndExited, .activeInKeyWindow, .inVisibleRect], owner: self)
        if let tracking = tracking { addTrackingArea(tracking) }
        super.updateTrackingAreas()
    }
    override func mouseEntered(with event: NSEvent) { hovering = true; needsDisplay = true }
    override func mouseExited(with event: NSEvent) { hovering = false; needsDisplay = true }
    override func viewDidChangeEffectiveAppearance() { super.viewDidChangeEffectiveAppearance(); needsDisplay = true }
    override func draw(_ dirtyRect: NSRect) {
        let dark = effectiveAppearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua
        if state == .on || hovering {
            NSGraphicsContext.saveGraphicsState()
            if state == .on { let shadow = NSShadow(); shadow.shadowColor = NSColor.black.withAlphaComponent(dark ? 0.25 : 0.10); shadow.shadowBlurRadius = 8; shadow.shadowOffset = NSSize(width: 0, height: -2); shadow.set() }
            NSColor.white.withAlphaComponent(state == .on ? (dark ? 0.13 : 0.65) : (dark ? 0.06 : 0.30)).setFill()
            NSBezierPath(roundedRect: bounds.insetBy(dx: 2, dy: 3), xRadius: 14, yRadius: 14).fill()
            NSGraphicsContext.restoreGraphicsState()
        }
        contentTintColor = state == .on ? .labelColor : .secondaryLabelColor
        super.draw(dirtyRect)
    }
}

final class ClubActionButton: NSButton {
    var primary = false
    override func draw(_ dirtyRect: NSRect) {
        let dark = effectiveAppearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua
        let fill = primary ? NSColor.systemBlue : NSColor.white.withAlphaComponent(dark ? 0.09 : 0.70)
        fill.withAlphaComponent(fill.alphaComponent * (isHighlighted ? 0.65 : 1)).setFill()
        NSBezierPath(roundedRect: bounds.insetBy(dx: 1, dy: 1), xRadius: 12, yRadius: 12).fill()
        attributedTitle = NSAttributedString(string: title, attributes: [.font: font ?? NSFont.systemFont(ofSize: 14, weight: .medium), .foregroundColor: primary ? NSColor.white : NSColor.labelColor])
        super.draw(dirtyRect)
    }
}

@MainActor
final class ClubApp: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate {
    private var window: NSWindow!
    private let webHost = NSView()
    private var shellSide: NSView?
    private var shellToolbar: NSView?
    private var shellLayout: [NSLayoutConstraint] = []
    private var libraryLayout: [NSLayoutConstraint] = []
    private var libraryMode = false
    private var libraryExit: NSTitlebarAccessoryViewController?
    private let verificationPanel = NSStackView()
    private var verificationTimer: Timer?

    private let welcome = NSStackView()
    private let sidebar = NSStackView()
    private var sites: [Site] = []
    private var tabs: [Int: WKWebView] = [:]
    private var buttons: [NSButton] = []
    private var current: Int?
    private var localURL: String?
    private var service: Process?
    private var servicePipe: Pipe?
    private var serviceBuffer = ""
    private var libraryRoute = "/"
    private var cloudPanel: NSScrollView?
    private var cloudCoordinator: CloudCoordinator?
    private let cloudNames = ["百度网盘", "阿里网盘", "夸克网盘", "TeraBox", "115 网盘"]
    private var themeButton: NSButton!
    private var darkTheme = UserDefaults.standard.object(forKey: "clubDarkTheme") as? Bool ?? (NSApp.effectiveAppearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua)
    private var historyObservation: [NSKeyValueObservation] = []
    private let pageTitle = NSTextField(labelWithString: "你的影片空间")
    private let locationLabel = NSTextField(labelWithString: "选择左侧入口")
    private let status = NSTextField(labelWithString: "")
    private var back: NSButton!
    private var forward: NSButton!
    private var reload: NSButton!
    private var external: NSButton!
    private var favorite: NSButton!
    private var adBlockButton: NSButton!
    private let adBlocker = ClubAdBlocker()
    private let bookmarkStore = BookmarkStore()
    private var bookmarkPanel: BookmarkPanel?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        buildMenu()
        if let path = Bundle.main.url(forResource: "sites", withExtension: "json"),
           let data = try? Data(contentsOf: path),
           let decoded = try? JSONDecoder().decode([Site].self, from: data) {
            sites = decoded.filter { validURL($0.url) != nil }
        }
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1220, height: 800),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable],
                          backing: .buffered, defer: false)
        window.title = "vvs-club"
        window.minSize = NSSize(width: 880, height: 780)
        window.center()
        window.isReleasedWhenClosed = false
        window.titlebarAppearsTransparent = true
        window.appearance = NSAppearance(named: darkTheme ? .darkAqua : .aqua)
        let root = ClubBackdrop()
        window.contentView = root

        let side = ClubGlass()
        side.material = .sidebar
        side.blendingMode = .withinWindow
        side.wantsLayer = true
        side.layer?.cornerRadius = 26
        side.layer?.masksToBounds = true
        side.state = .active
        sidebar.orientation = .vertical
        sidebar.alignment = .leading
        sidebar.spacing = 6
        add(side, to: root)
        let sideScroll = NSScrollView()
        sideScroll.drawsBackground = false
        sideScroll.hasVerticalScroller = true
        sideScroll.autohidesScrollers = true
        let sideDocument = NSView()
        sideDocument.translatesAutoresizingMaskIntoConstraints = false
        sideScroll.documentView = sideDocument
        add(sideScroll, to: side)
        add(sidebar, to: sideDocument)
        NSLayoutConstraint.activate([
            sideScroll.leadingAnchor.constraint(equalTo: side.leadingAnchor), sideScroll.trailingAnchor.constraint(equalTo: side.trailingAnchor),
            sideScroll.topAnchor.constraint(equalTo: side.topAnchor),
            sideDocument.leadingAnchor.constraint(equalTo: sideScroll.contentView.leadingAnchor), sideDocument.topAnchor.constraint(equalTo: sideScroll.contentView.topAnchor),
            sideDocument.widthAnchor.constraint(equalTo: sideScroll.contentView.widthAnchor), sideDocument.heightAnchor.constraint(greaterThanOrEqualTo: sideScroll.contentView.heightAnchor)
        ])
        let brand = NSTextField(labelWithString: "VVS / CLUB")
        brand.font = .systemFont(ofSize: 19, weight: .bold)
        let brandRow = NSStackView()
        brandRow.spacing = 8
        if let mark = Bundle.main.url(forResource: "vvs-club", withExtension: "png"), let image = NSImage(contentsOf: mark) {
            NSApp.applicationIconImage = image
            let icon = NSImageView(image: image)
            icon.widthAnchor.constraint(equalToConstant: 34).isActive = true
            icon.heightAnchor.constraint(equalToConstant: 34).isActive = true
            brandRow.addArrangedSubview(icon)
        }
        brand.font = .systemFont(ofSize: 16, weight: .bold)
        brandRow.addArrangedSubview(brand)
        sidebar.addArrangedSubview(brandRow)
        let tagline = NSTextField(labelWithString: "你的私人放映空间")
        tagline.textColor = .secondaryLabelColor
        tagline.font = .systemFont(ofSize: 13)
        sidebar.addArrangedSubview(tagline)
        sidebar.setCustomSpacing(28, after: tagline)
        addSection("我的空间")
        addButton("本地媒体库", symbol: "film.stack", tag: -1)
        addButton("扫描本地", symbol: "folder.badge.plus", tag: -2)
        addButton("连接网盘", symbol: "icloud", tag: -4)
        addSection("在线影视区")
        addButton("书签", symbol: "book.closed", tag: -5)
        for (index, site) in sites.enumerated() {
            addButton(site.name, symbol: "play.rectangle", tag: index)
        }
        let spacer = NSView()
        spacer.heightAnchor.constraint(greaterThanOrEqualToConstant: 20).isActive = true
        sidebar.addArrangedSubview(spacer)
        let sponsor = NSTextField(labelWithString: "搬瓦工机场")
        sponsor.font = .systemFont(ofSize: 20, weight: .semibold)
        sponsor.textColor = .labelColor
        let sponsorCopy = NSTextField(wrappingLabelWithString: "3网GIA 线路直连")
        sponsorCopy.font = .systemFont(ofSize: 16)
        sponsorCopy.textColor = .secondaryLabelColor
        let sponsorButton = ClubActionButton(title: "立即开通 ↗", target: self, action: #selector(openSponsor))
        sponsorButton.isBordered = false
        sponsorButton.font = .systemFont(ofSize: 16, weight: .semibold)
        sponsorButton.heightAnchor.constraint(equalToConstant: 44).isActive = true
        sponsorButton.primary = true
        let promotion = NSStackView(views: [sponsor, sponsorCopy, sponsorButton])
        promotion.orientation = .vertical
        promotion.alignment = .leading
        promotion.spacing = 10
        add(promotion, to: side)
        sponsorButton.widthAnchor.constraint(equalTo: promotion.widthAnchor).isActive = true
        NSLayoutConstraint.activate([
            promotion.leadingAnchor.constraint(equalTo: side.leadingAnchor, constant: 14),
            promotion.trailingAnchor.constraint(equalTo: side.trailingAnchor, constant: -14),
            promotion.bottomAnchor.constraint(equalTo: side.bottomAnchor, constant: -20),
            sideScroll.bottomAnchor.constraint(equalTo: promotion.topAnchor, constant: -18)
        ])

        let right = NSView()
        add(right, to: root)
        shellSide = side
        let toolbarGlass = ClubGlass()
        shellToolbar = toolbarGlass
        toolbarGlass.material = .headerView
        toolbarGlass.blendingMode = .withinWindow
        toolbarGlass.state = .active
        toolbarGlass.wantsLayer = true
        toolbarGlass.layer?.cornerRadius = 26
        toolbarGlass.layer?.masksToBounds = true
        add(toolbarGlass, to: right)
        let toolbar = NSStackView()
        toolbar.spacing = 8
        toolbar.distribution = .fill
        toolbar.alignment = .centerY
        back = tool("chevron.left", "后退", #selector(goBack))
        forward = tool("chevron.right", "前进", #selector(goForward))
        reload = tool("arrow.clockwise", "刷新", #selector(refresh))
        external = tool("arrow.up.right.square", "在默认浏览器打开", #selector(openExternal))
        toolbar.addArrangedSubview(back)
        toolbar.addArrangedSubview(forward)
        toolbar.addArrangedSubview(reload)
        let labels = NSStackView(views: [pageTitle, locationLabel])
        labels.orientation = .vertical
        labels.alignment = .leading
        labels.spacing = 3
        pageTitle.font = .systemFont(ofSize: 16, weight: .semibold)
        locationLabel.font = .systemFont(ofSize: 12)
        locationLabel.textColor = .secondaryLabelColor
        locationLabel.lineBreakMode = .byTruncatingMiddle
        labels.setContentHuggingPriority(NSLayoutConstraint.Priority(1), for: .horizontal)
        toolbar.addArrangedSubview(labels)
        favorite = tool("star", "收藏当前网址", #selector(saveBookmark))
        adBlockButton = tool("shield.lefthalf.filled", "广告拦截已开启，点击关闭", #selector(toggleAdBlock))
        toolbar.addArrangedSubview(adBlockButton)
        toolbar.addArrangedSubview(favorite)
        toolbar.addArrangedSubview(external)
        themeButton = tool(darkTheme ? "sun.max" : "moon", "切换深色或浅色", #selector(toggleTheme))
        toolbar.addArrangedSubview(themeButton)
        toolbar.addArrangedSubview(tool("xmark", "关闭网页，返回首页", #selector(resetBrowser)))
        add(toolbar, to: toolbarGlass)
        add(webHost, to: right)
        add(status, to: right)
        status.textColor = .secondaryLabelColor
        status.font = .systemFont(ofSize: 11)
        status.lineBreakMode = .byTruncatingTail
        webHost.wantsLayer = true
        webHost.layer?.cornerRadius = 26
        webHost.layer?.masksToBounds = true
        buildWelcome()
        verificationPanel.orientation = .vertical
        verificationPanel.alignment = .leading
        verificationPanel.spacing = 10
        verificationPanel.wantsLayer = true
        verificationPanel.layer?.cornerRadius = 14
        verificationPanel.layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
        verificationPanel.edgeInsets = NSEdgeInsets(top: 14, left: 16, bottom: 14, right: 16)
        let verificationText = NSTextField(wrappingLabelWithString: "网站安全验证尚未完成。内置浏览器可能不受网站支持；请手动完成验证，或选择下方操作。")
        verificationText.font = .systemFont(ofSize: 14)
        verificationPanel.addArrangedSubview(verificationText)
        let verificationActions = NSStackView()
        for (name, action) in [("重新加载", #selector(refresh)), ("关闭广告规则后重试", #selector(retryWithoutAdRules)), ("在默认浏览器打开", #selector(openExternal)), ("收起", #selector(hideVerification))] {
            let button = NSButton(title: name, target: self, action: action)
            button.bezelStyle = .rounded
            verificationActions.addArrangedSubview(button)
        }
        verificationPanel.addArrangedSubview(verificationActions)
        add(verificationPanel, to: webHost)
        NSLayoutConstraint.activate([
            verificationPanel.leadingAnchor.constraint(equalTo: webHost.leadingAnchor, constant: 20),
            verificationPanel.trailingAnchor.constraint(equalTo: webHost.trailingAnchor, constant: -20),
            verificationPanel.bottomAnchor.constraint(equalTo: webHost.bottomAnchor, constant: -20)
        ])
        verificationPanel.isHidden = true
        shellLayout = [
            right.leadingAnchor.constraint(equalTo: side.trailingAnchor),
            webHost.topAnchor.constraint(equalTo: toolbarGlass.bottomAnchor, constant: 14),
            webHost.leadingAnchor.constraint(equalTo: right.leadingAnchor, constant: 14),
            webHost.trailingAnchor.constraint(equalTo: right.trailingAnchor, constant: -14),
            webHost.bottomAnchor.constraint(equalTo: status.topAnchor, constant: -8)
        ]
        libraryLayout = [
            right.leadingAnchor.constraint(equalTo: root.leadingAnchor),
            webHost.topAnchor.constraint(equalTo: right.topAnchor),
            webHost.leadingAnchor.constraint(equalTo: right.leadingAnchor),
            webHost.trailingAnchor.constraint(equalTo: right.trailingAnchor),
            webHost.bottomAnchor.constraint(equalTo: right.bottomAnchor)
        ]
        NSLayoutConstraint.activate(shellLayout)
        let exit = NSTitlebarAccessoryViewController()
        exit.layoutAttribute = .right
        let exitView = NSView(frame: NSRect(x: 0, y: 0, width: 150, height: 28))
        let exitButton = NSButton(title: "返回主界面", target: self, action: #selector(resetBrowser))
        exitButton.bezelStyle = .rounded
        exitButton.image = NSImage(systemSymbolName: "arrow.backward", accessibilityDescription: nil)
        exitButton.imagePosition = .imageLeading
        exitButton.setAccessibilityLabel("返回主界面")
        exitButton.toolTip = "退出媒体库，返回主界面"
        exitButton.frame = NSRect(x: 4, y: 2, width: 138, height: 24)
        exitView.addSubview(exitButton)
        exit.view = exitView
        libraryExit = exit
        NSLayoutConstraint.activate([
            side.leadingAnchor.constraint(equalTo: root.leadingAnchor, constant: 12),
            side.topAnchor.constraint(equalTo: root.topAnchor, constant: 12),
            side.bottomAnchor.constraint(equalTo: root.bottomAnchor, constant: -12),
            side.widthAnchor.constraint(equalToConstant: 248),
            sidebar.leadingAnchor.constraint(equalTo: sideDocument.leadingAnchor, constant: 14),
            sidebar.trailingAnchor.constraint(equalTo: sideDocument.trailingAnchor, constant: -14),
            sidebar.topAnchor.constraint(equalTo: sideDocument.topAnchor, constant: 28),
            sidebar.bottomAnchor.constraint(equalTo: sideDocument.bottomAnchor, constant: -20),
            right.trailingAnchor.constraint(equalTo: root.trailingAnchor),
            right.topAnchor.constraint(equalTo: root.topAnchor),
            right.bottomAnchor.constraint(equalTo: root.bottomAnchor),
            toolbarGlass.topAnchor.constraint(equalTo: right.topAnchor, constant: 12),
            toolbarGlass.leadingAnchor.constraint(equalTo: right.leadingAnchor, constant: 14),
            toolbarGlass.trailingAnchor.constraint(equalTo: right.trailingAnchor, constant: -14),
            toolbarGlass.heightAnchor.constraint(equalToConstant: 56),
            toolbar.leadingAnchor.constraint(equalTo: toolbarGlass.leadingAnchor, constant: 10),
            toolbar.trailingAnchor.constraint(equalTo: toolbarGlass.trailingAnchor, constant: -10),
            toolbar.centerYAnchor.constraint(equalTo: toolbarGlass.centerYAnchor),
            toolbar.heightAnchor.constraint(equalToConstant: 44),
            status.leadingAnchor.constraint(equalTo: right.leadingAnchor, constant: 16),
            status.trailingAnchor.constraint(equalTo: right.trailingAnchor, constant: -16),
            status.bottomAnchor.constraint(equalTo: right.bottomAnchor, constant: -8),
            status.heightAnchor.constraint(equalToConstant: 16)
        ])
        syncToolbar()
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    private func add(_ child: NSView, to parent: NSView) {
        child.translatesAutoresizingMaskIntoConstraints = false
        parent.addSubview(child)
    }
    private func addSection(_ title: String) {
        let label = NSTextField(labelWithString: title)
        label.font = .systemFont(ofSize: 12, weight: .semibold)
        label.textColor = .secondaryLabelColor
        sidebar.addArrangedSubview(label)
    }
    private func addButton(_ title: String, symbol: String, tag: Int) {
        let button = ClubSidebarButton(title: "  " + title, target: self, action: #selector(selectSite(_:)))
        button.tag = tag
        button.bezelStyle = .regularSquare
        button.isBordered = false
        button.font = .systemFont(ofSize: 16, weight: .regular)
        button.alignment = .left
        button.image = NSImage(systemSymbolName: symbol, accessibilityDescription: nil)?.withSymbolConfiguration(NSImage.SymbolConfiguration(pointSize: 18, weight: .regular))
        button.imagePosition = .imageLeading
        button.setButtonType(.pushOnPushOff)
        sidebar.addArrangedSubview(button)
        button.widthAnchor.constraint(equalTo: sidebar.widthAnchor).isActive = true
        button.heightAnchor.constraint(equalToConstant: 44).isActive = true
        buttons.append(button)
    }
    private func tool(_ symbol: String, _ title: String, _ action: Selector) -> NSButton {
        let button = NSButton(image: NSImage(systemSymbolName: symbol, accessibilityDescription: title)!, target: self, action: action)
        button.toolTip = title
        button.setAccessibilityLabel(title)
        button.contentTintColor = .labelColor
        button.bezelStyle = .texturedRounded
        button.widthAnchor.constraint(equalToConstant: 40).isActive = true
        button.heightAnchor.constraint(equalToConstant: 40).isActive = true
        return button
    }
    private func buildWelcome() {
        welcome.orientation = .vertical
        welcome.alignment = .leading
        welcome.spacing = 18
        let title = NSTextField(labelWithString: "私人影院 看片利器")
        title.font = .systemFont(ofSize: 42, weight: .bold)
        let body = NSTextField(wrappingLabelWithString: "属于你的私人影院。\n整理本地收藏，或打开喜欢的在线站点。")
        body.font = .systemFont(ofSize: 16)
        body.textColor = .secondaryLabelColor
        let note = NSTextField(wrappingLabelWithString: "本地媒体库：整理影片、补全资料、播放与管理收藏。\n在线影视区：点击站点，在右侧浏览。\n第三方网站的登录与访问验证需由你完成。")
        note.font = .systemFont(ofSize: 14)
        note.textColor = .secondaryLabelColor
        if let mark = Bundle.main.url(forResource: "vvs-club", withExtension: "png"), let image = NSImage(contentsOf: mark) {
            let icon = NSImageView(image: image)
            icon.widthAnchor.constraint(equalToConstant: 84).isActive = true
            icon.heightAnchor.constraint(equalToConstant: 84).isActive = true
            welcome.addArrangedSubview(icon)
        }
        welcome.addArrangedSubview(title)
        welcome.addArrangedSubview(body)
        let actions = NSStackView()
        actions.spacing = 14
        for (name, tag) in [("打开媒体库", -1), ("添加影片文件夹", -2), ("连接网盘", -4)] {
            let action = ClubActionButton(title: name, target: self, action: #selector(selectSite(_:)))
            action.tag = tag
            action.primary = tag == -1
            action.isBordered = false
            action.font = .systemFont(ofSize: 14, weight: .medium)
            action.widthAnchor.constraint(greaterThanOrEqualToConstant: 140).isActive = true
            action.heightAnchor.constraint(equalToConstant: 44).isActive = true
            actions.addArrangedSubview(action)
        }
        welcome.addArrangedSubview(actions)
        welcome.setCustomSpacing(34, after: actions)
        welcome.addArrangedSubview(note)
        add(welcome, to: webHost)
        NSLayoutConstraint.activate([
            welcome.leadingAnchor.constraint(equalTo: webHost.leadingAnchor, constant: 52),
            welcome.centerYAnchor.constraint(equalTo: webHost.centerYAnchor, constant: -30),
            welcome.trailingAnchor.constraint(lessThanOrEqualTo: webHost.trailingAnchor, constant: -40)
        ])
    }
    private func validURL(_ text: String) -> URL? {
        guard let url = URL(string: text), let host = url.host, !host.isEmpty,
              ["https", "http"].contains(url.scheme?.lowercased() ?? ""),
              url.user == nil, url.password == nil else { return nil }
        return url
    }
    @objc private func selectSite(_ sender: NSButton) {
        if sender.tag == -5 { showBookmarks(); return }
        if sender.tag == -2 { chooseFolder(name: "本地影片", cloud: false); return }
        if sender.tag == -3 || sender.tag == -4 { showClouds(sender.tag); return }
        if sender.tag == -1 { libraryRoute = "/" }
        show(sender.tag)
    }
    private func chooseFolder(name: String, cloud: Bool) {
        let picker = NSOpenPanel()
        picker.title = cloud ? "选择\(name)在这台 Mac 上的文件夹" : "选择存放影片的文件夹"
        picker.prompt = "使用这个文件夹"
        picker.canChooseDirectories = true
        picker.canChooseFiles = false
        picker.allowsMultipleSelection = false
        guard picker.runModal() == .OK, let folder = picker.url else { return }
        var route = URLComponents()
        route.path = "/settings/library"
        route.queryItems = [URLQueryItem(name: "vvs_folder", value: folder.path),
                            URLQueryItem(name: "vvs_library", value: name),
                            URLQueryItem(name: "vvs_cloud", value: cloud ? "1" : "0"),
                            URLQueryItem(name: "vvs_source", value: ["百度网盘": "baidu", "阿里网盘": "aliyun", "夸克网盘": "quark", "TeraBox": "terabox", "115 网盘": "115"][name] ?? (cloud ? "mounted" : "local"))]
        libraryRoute = route.string ?? "/settings/library"
        show(-1)
        if let view = tabs[-1], let base = localURL ?? UserDefaults.standard.string(forKey: "libraryURL"),
           let target = URL(string: base + libraryRoute) { view.load(URLRequest(url: target)) }
        status.stringValue = "文件夹已选好：在右侧确认设置并保存，再开始扫描。"
    }
    @objc private func connectCloud(_ sender: NSButton) {
        guard cloudNames.indices.contains(sender.tag) else { return }
        chooseFolder(name: cloudNames[sender.tag], cloud: true)
    }
    private func showClouds(_ key: Int) {
        hideVerification()
        setLibraryMode(false)
        bookmarkPanel?.view.isHidden = true
        current = nil
        welcome.isHidden = true
        cloudPanel?.isHidden = true
        for tab in tabs.values { tab.isHidden = true }
        for button in buttons { button.state = button.tag == key ? .on : .off }
        if cloudCoordinator == nil {
            let coordinator = CloudCoordinator()
            coordinator.onMounted = { [weak self] in self?.showMountedClouds(-4) }
            coordinator.onImport = { [weak self] path, provider in self?.importCloudIndex(path, provider: provider) }
            cloudCoordinator = coordinator
            add(coordinator.view, to: webHost)
            NSLayoutConstraint.activate([
                coordinator.view.leadingAnchor.constraint(equalTo: webHost.leadingAnchor),
                coordinator.view.trailingAnchor.constraint(equalTo: webHost.trailingAnchor),
                coordinator.view.topAnchor.constraint(equalTo: webHost.topAnchor),
                coordinator.view.bottomAnchor.constraint(equalTo: webHost.bottomAnchor)
            ])
        }
        cloudCoordinator?.view.isHidden = false
        cloudCoordinator?.show(dark: darkTheme)
        pageTitle.stringValue = "连接网盘"
        locationLabel.stringValue = "登录授权 → 选择云端目录 → 扫描影片"
        status.stringValue = "扫描与播放使用这台电脑当前的网络。"
        syncToolbar()
    }
    private func importCloudIndex(_ path: String, provider: String) {
        let names = ["baidu": "百度网盘", "aliyun": "阿里网盘", "115": "115 网盘"]
        var route = URLComponents()
        route.path = "/settings/library"
        route.queryItems = [URLQueryItem(name: "vvs_folder", value: path),
            URLQueryItem(name: "vvs_library", value: names[provider] ?? "网盘影片"),
            URLQueryItem(name: "vvs_cloud", value: "1"), URLQueryItem(name: "vvs_source", value: provider)]
        libraryRoute = route.string ?? "/settings/library"
        show(-1)
        if let view = tabs[-1], let base = localURL ?? UserDefaults.standard.string(forKey: "libraryURL"), let url = URL(string: base + libraryRoute) { view.load(URLRequest(url: url)) }
        status.stringValue = "影片索引已准备好，确认媒体库设置后即可入库。"
    }
    private func showMountedClouds(_ key: Int) {
        setLibraryMode(false)
        cloudCoordinator?.view.isHidden = true
        current = nil
        for button in buttons { button.state = button.tag == key ? .on : .off }
        for view in tabs.values { view.isHidden = true }
        welcome.isHidden = true
        cloudPanel?.removeFromSuperview()
        let scroll = NSScrollView()
        scroll.hasVerticalScroller = true
        scroll.drawsBackground = false
        let content = NSStackView()
        content.orientation = .vertical
        content.alignment = .leading
        content.spacing = 18
        content.edgeInsets = NSEdgeInsets(top: 32, left: 32, bottom: 32, right: 32)
        let title = NSTextField(labelWithString: key == -3 ? "扫描网盘里的影片" : "连接你的网盘")
        title.font = .systemFont(ofSize: 27, weight: .bold)
        content.addArrangedSubview(title)
        let intro = NSTextField(wrappingLabelWithString: "先用网盘官方客户端同步，或用你已有的工具将网盘挂载到 Mac。\n在下面选择网盘，再选择它的文件夹，即可交给媒体库整理。")
        intro.textColor = .secondaryLabelColor
        content.addArrangedSubview(intro)
        let scope = NSTextField(wrappingLabelWithString: "当前连接方式：同步／挂载文件夹。尚未提供这些网盘的账号直连和扫码登录。仅登录网页不会把网盘文件接入媒体库。")
        scope.font = .systemFont(ofSize: 12)
        scope.textColor = .secondaryLabelColor
        content.addArrangedSubview(scope)
        for (index, name) in cloudNames.enumerated() {
            let row = NSStackView()
            row.spacing = 16
            let label = NSTextField(labelWithString: name)
            label.font = .systemFont(ofSize: 15, weight: .semibold)
            label.widthAnchor.constraint(equalToConstant: 150).isActive = true
            row.addArrangedSubview(label)
            let button = NSButton(title: "选择网盘文件夹…", target: self, action: #selector(connectCloud(_:)))
            button.tag = index
            button.bezelStyle = .rounded
            row.addArrangedSubview(button)
            let card = ClubGlass()
            card.material = .popover
            card.blendingMode = .withinWindow
            card.state = .active
            add(row, to: card)
            content.addArrangedSubview(card)
            let detail = NSTextField(labelWithString: "未连接 · 选择文件夹并保存后可扫描")
            detail.font = .systemFont(ofSize: 11)
            detail.textColor = .secondaryLabelColor
            add(detail, to: card)
            NSLayoutConstraint.activate([
                card.widthAnchor.constraint(equalTo: content.widthAnchor, constant: -64),
                card.heightAnchor.constraint(equalToConstant: 100),
                row.leadingAnchor.constraint(equalTo: card.leadingAnchor, constant: 22),
                row.topAnchor.constraint(equalTo: card.topAnchor, constant: 16),
                row.trailingAnchor.constraint(lessThanOrEqualTo: card.trailingAnchor, constant: -22),
                detail.leadingAnchor.constraint(equalTo: row.leadingAnchor),
                detail.topAnchor.constraint(equalTo: row.bottomAnchor, constant: 12)
            ])
        }
        content.translatesAutoresizingMaskIntoConstraints = false
        scroll.documentView = content
        add(scroll, to: webHost)
        NSLayoutConstraint.activate([
            scroll.leadingAnchor.constraint(equalTo: webHost.leadingAnchor),
            scroll.trailingAnchor.constraint(equalTo: webHost.trailingAnchor),
            scroll.topAnchor.constraint(equalTo: webHost.topAnchor),
            scroll.bottomAnchor.constraint(equalTo: webHost.bottomAnchor),
            content.leadingAnchor.constraint(equalTo: scroll.contentView.leadingAnchor),
            content.trailingAnchor.constraint(equalTo: scroll.contentView.trailingAnchor),
            content.topAnchor.constraint(equalTo: scroll.contentView.topAnchor)
        ])
        cloudPanel = scroll
        pageTitle.stringValue = key == -3 ? "扫描网盘" : "连接网盘"
        locationLabel.stringValue = "选择网盘和文件夹，无需填写 IP 地址"
        status.stringValue = "文件仍由原来的网盘客户端或挂载工具提供。"
        syncToolbar()
    }
    private func show(_ key: Int) {
        hideVerification()
        setLibraryMode(key == -1)
        bookmarkPanel?.view.isHidden = true
        cloudCoordinator?.view.isHidden = true
        cloudPanel?.isHidden = true
        if key == -1 && UserDefaults.standard.string(forKey: "libraryURL") == nil && localURL == nil {
            current = -1
            for button in buttons { button.state = button.tag == key ? .on : .off }
            pageTitle.stringValue = "本地媒体库"
            status.stringValue = "正在启动本地媒体库…"
            startService()
            return
        }
        let raw = key == -1 ? UserDefaults.standard.string(forKey: "libraryURL") ?? localURL ?? "http://127.0.0.1:8900" : sites[key].url
        guard let url = validURL(raw) else { return }
        for button in buttons { button.state = button.tag == key ? .on : .off }
        for view in tabs.values { view.isHidden = true }
        welcome.isHidden = true
        current = key
        status.stringValue = key == -1 ? "连接本地媒体服务…" : "正在打开站点…"
        if let existing = tabs[key] {
            existing.isHidden = false
            status.stringValue = ""
        } else {
            let config = WKWebViewConfiguration()
            config.websiteDataStore = .default()
            config.preferences.javaScriptCanOpenWindowsAutomatically = false
            config.allowsAirPlayForMediaPlayback = true
            if key == -1 {
                config.userContentController.addUserScript(WKUserScript(source: themeScript, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
            }
            let view = WKWebView(frame: .zero, configuration: config)
            view.underPageBackgroundColor = .clear
            view.navigationDelegate = self
            view.uiDelegate = self
            view.allowsBackForwardNavigationGestures = true
            add(view, to: webHost)
            NSLayoutConstraint.activate([
                view.leadingAnchor.constraint(equalTo: webHost.leadingAnchor),
                view.trailingAnchor.constraint(equalTo: webHost.trailingAnchor),
                view.topAnchor.constraint(equalTo: webHost.topAnchor),
                view.bottomAnchor.constraint(equalTo: webHost.bottomAnchor)
            ])
            tabs[key] = view
            historyObservation.append(view.observe(\.estimatedProgress) { [weak self] _, _ in
                DispatchQueue.main.async { self?.syncToolbar() }
            })
            let target = key == -1 ? URL(string: raw + libraryRoute) ?? url : url
            if key >= 0 {
                adBlocker.apply(to: view) { [weak self, weak view] success in
                    guard let view = view else { return }
                    if !success { self?.status.stringValue = "广告规则未能加载，当前网页未受拦截保护。" }
                    view.load(URLRequest(url: target))
                }
            } else { view.load(URLRequest(url: target)) }
        }
        syncToolbar()
    }
    private var themeScript: String {
        let choice = darkTheme ? "dark" : "light"
        return "document.documentElement.classList.add('vvs-club-glass');document.documentElement.dataset.theme='\(choice)';document.documentElement.classList.toggle('dark',\(darkTheme));"
    }
    @objc private func toggleTheme() {
        darkTheme.toggle()
        cloudCoordinator?.applyTheme(darkTheme)
        UserDefaults.standard.set(darkTheme, forKey: "clubDarkTheme")
        window.appearance = NSAppearance(named: darkTheme ? .darkAqua : .aqua)
        themeButton.image = NSImage(systemSymbolName: darkTheme ? "sun.max" : "moon", accessibilityDescription: "切换深色或浅色")
        if let local = tabs[-1] {
            local.configuration.userContentController.removeAllUserScripts()
            local.configuration.userContentController.addUserScript(WKUserScript(source: themeScript, injectionTime: .atDocumentEnd, forMainFrameOnly: true))
            local.evaluateJavaScript(themeScript, completionHandler: nil)
        }
    }
    private var active: WKWebView? { current.flatMap { tabs[$0] } }
    private func syncToolbar() {
        back?.isEnabled = active?.canGoBack ?? false
        forward?.isEnabled = active?.canGoForward ?? false
        reload?.isEnabled = active != nil
        external?.isEnabled = current != nil
        adBlockButton?.isEnabled = (current ?? -1) >= 0
        let adTitle = adBlocker.enabled ? (adBlocker.failed ? "广告规则加载失败，点击关闭" : "广告拦截已开启，点击关闭") : "广告拦截已关闭，点击开启"
        adBlockButton?.toolTip = adBlocker.enabled && adBlocker.failed ? adTitle + "：" + (adBlocker.failureReason ?? "未知规则错误") : adTitle
        adBlockButton?.setAccessibilityLabel(adTitle)
        adBlockButton?.image = NSImage(systemSymbolName: adBlocker.enabled ? "shield.lefthalf.filled" : "shield.slash", accessibilityDescription: adTitle)
        let canSave = (current ?? -1) >= 0 && active?.url.flatMap { validURL($0.absoluteString) } != nil
        favorite?.isEnabled = canSave
        let saved = active?.url.map { bookmarkStore.contains($0.absoluteString) } ?? false
        favorite?.image = NSImage(systemSymbolName: saved ? "star.fill" : "star", accessibilityDescription: saved ? "已收藏当前网址" : "收藏当前网址")
        favorite?.setAccessibilityLabel(saved ? "已收藏当前网址" : "收藏当前网址")
        if let key = current {
            pageTitle.stringValue = key == -1 ? "本地媒体库" : sites[key].name
            locationLabel.stringValue = active?.url?.host ?? "正在连接…"
        }
    }
    @objc private func toggleAdBlock() {
        adBlocker.enabled.toggle()
        for (key, web) in tabs where key >= 0 {
            adBlocker.apply(to: web) { [weak self, weak web] success in
                if self?.active === web { web?.reload() }
                if !success { self?.status.stringValue = "广告规则未能加载，请重新打开应用。" }
            }
        }
        syncToolbar()
    }
    @objc private func saveBookmark() {
        guard (current ?? -1) >= 0, let url = active?.url, validURL(url.absoluteString) != nil else { return }
        if bookmarkStore.contains(url.absoluteString) { status.stringValue = "此网址已在书签中，可在左侧「书签」管理。"; return }
        if bookmarkStore.add(title: active?.title ?? url.host ?? "未命名书签", url: url.absoluteString) {
            status.stringValue = "已收藏到书签栏"; bookmarkPanel?.refresh(); syncToolbar()
        } else { status.stringValue = bookmarkStore.error ?? "书签保存失败，请重试。" }
    }
    private func showBookmarks() {
        hideVerification()
        setLibraryMode(false)
        current = nil; welcome.isHidden = true; cloudPanel?.isHidden = true; cloudCoordinator?.view.isHidden = true
        for tab in tabs.values { tab.isHidden = true }
        for button in buttons { button.state = button.tag == -5 ? .on : .off }
        if bookmarkPanel == nil {
            let panel = BookmarkPanel(store: bookmarkStore)
            panel.onOpen = { [weak self] title, raw in
                guard let self = self, self.validURL(raw) != nil else { return }
                if let index = self.sites.firstIndex(where: { $0.url == raw }) { self.show(index) }
                else { self.sites.append(Site(name: title, url: raw)); self.show(self.sites.count - 1) }
            }
            panel.onChange = { [weak self] in self?.syncToolbar() }
            bookmarkPanel = panel; add(panel.view, to: webHost)
            NSLayoutConstraint.activate([panel.view.leadingAnchor.constraint(equalTo: webHost.leadingAnchor), panel.view.trailingAnchor.constraint(equalTo: webHost.trailingAnchor), panel.view.topAnchor.constraint(equalTo: webHost.topAnchor), panel.view.bottomAnchor.constraint(equalTo: webHost.bottomAnchor)])
        }
        bookmarkPanel?.refresh(); bookmarkPanel?.view.isHidden = false
        pageTitle.stringValue = "书签"; locationLabel.stringValue = "文件夹 · 拖拽整理 · 双击打开"; status.stringValue = "书签仅保存在这台 Mac。"; syncToolbar()
    }
    private func setLibraryMode(_ enabled: Bool) {
        guard enabled != libraryMode else { return }
        libraryMode = enabled
        NSLayoutConstraint.deactivate(enabled ? shellLayout : libraryLayout)
        shellSide?.isHidden = enabled
        shellToolbar?.isHidden = enabled
        status.isHidden = enabled
        webHost.layer?.cornerRadius = enabled ? 0 : 22
        NSLayoutConstraint.activate(enabled ? libraryLayout : shellLayout)
        if let exit = libraryExit {
            if enabled { window.addTitlebarAccessoryViewController(exit) }
            else if let index = window.titlebarAccessoryViewControllers.firstIndex(where: { $0 === exit }) {
                window.removeTitlebarAccessoryViewController(at: index)
            }
        }
    }
    @objc private func resetBrowser() {
        hideVerification()
        setLibraryMode(false)
        current = nil
        for web in tabs.values {
            web.pauseAllMediaPlayback(completionHandler: nil)
            web.stopLoading()
            web.navigationDelegate = nil
            web.uiDelegate = nil
            web.removeFromSuperview()
        }
        tabs.removeAll()
        historyObservation.removeAll()
        bookmarkPanel?.view.isHidden = true
        cloudPanel?.isHidden = true
        cloudCoordinator?.view.isHidden = true
        for button in buttons { button.state = .off }
        welcome.isHidden = false
        pageTitle.stringValue = "你的影片空间"
        locationLabel.stringValue = "选择左侧入口"
        status.stringValue = ""
        syncToolbar()
    }
    @objc private func hideVerification() {
        verificationTimer?.invalidate()
        verificationTimer = nil
        verificationPanel.isHidden = true
    }
    @objc private func retryWithoutAdRules() {
        guard adBlocker.enabled else { active?.reload(); return }
        toggleAdBlock()
    }
    private func checkVerification(_ web: WKWebView) {
        guard web === active, (current ?? -1) >= 0 else { return }
        let script = "Boolean(document.querySelector('#challenge-running, #challenge-stage, #cf-challenge-running') || /正在进行安全验证|Checking your browser|Verifying you are human|Just a moment/i.test(document.title + ' ' + (document.body?.innerText || '').slice(0, 1800)))"
        web.evaluateJavaScript(script) { [weak self, weak web] result, _ in
            guard let self = self, let web = web, web === self.active, result as? Bool == true else { return }
            self.verificationPanel.removeFromSuperview()
            self.webHost.addSubview(self.verificationPanel)
            NSLayoutConstraint.activate([
                self.verificationPanel.leadingAnchor.constraint(equalTo: self.webHost.leadingAnchor, constant: 20),
                self.verificationPanel.trailingAnchor.constraint(equalTo: self.webHost.trailingAnchor, constant: -20),
                self.verificationPanel.bottomAnchor.constraint(equalTo: self.webHost.bottomAnchor, constant: -20)
            ])
            self.verificationPanel.isHidden = false
            self.status.stringValue = "网站验证仍未完成；应用不会自动点击验证码。"
        }
    }
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        if webView === active { hideVerification() }
    }
    @objc private func goBack() { active?.goBack() }
    @objc private func goForward() { active?.goForward() }
    @objc private func refresh() { active?.reload() }
    @objc private func openExternal() {
        guard let key = current else { return }
        let configured = key == -1 ? UserDefaults.standard.string(forKey: "libraryURL") ?? localURL ?? "http://127.0.0.1:8900" : sites[key].url
        if let url = active?.url ?? validURL(configured), validURL(url.absoluteString) != nil { NSWorkspace.shared.open(url) }
    }
    @objc private func configureLocal() {
        let alert = NSAlert()
        alert.messageText = "本地媒体库地址"
        alert.informativeText = "填写已运行的媒体服务地址。此操作只修改连接地址，不会启动或安装后台服务。"
        let field = NSTextField(frame: NSRect(x: 0, y: 0, width: 360, height: 26))
        field.stringValue = UserDefaults.standard.string(forKey: "libraryURL") ?? "http://127.0.0.1:8900"
        alert.accessoryView = field
        alert.addButton(withTitle: "保存地址")
        alert.addButton(withTitle: "取消")
        guard alert.runModal() == .alertFirstButtonReturn else { return }
        guard let url = validURL(field.stringValue.trimmingCharacters(in: .whitespacesAndNewlines)) else {
            let invalid = NSAlert()
            invalid.messageText = "请输入完整的 HTTP 或 HTTPS 地址"
            invalid.runModal()
            return
        }
        UserDefaults.standard.set(url.absoluteString, forKey: "libraryURL")
        tabs[-1]?.removeFromSuperview()
        tabs.removeValue(forKey: -1)
        if current == -1 { show(-1) }
    }
    private func startService() {
        if service?.isRunning == true { return }
        guard let configURL = Bundle.main.url(forResource: "runtime", withExtension: "json"),
              let data = try? Data(contentsOf: configURL),
              let config = try? JSONSerialization.jsonObject(with: data) as? [String: String],
              let root = config["backendRoot"] else {
            status.stringValue = "未找到本地媒体服务，请设置已有服务地址。"
            return
        }
        let python = URL(fileURLWithPath: root).appendingPathComponent(".venv/bin/python")
        let entry = URL(fileURLWithPath: root).appendingPathComponent("desktop/macos/service.py")
        guard FileManager.default.isExecutableFile(atPath: python.path),
              FileManager.default.fileExists(atPath: entry.path) else {
            status.stringValue = "本地依赖尚未准备好，请按仓库说明安装后重新打开。"
            return
        }
        let process = Process()
        let pipe = Pipe()
        process.executableURL = python
        process.arguments = ["-u", entry.path]
        process.currentDirectoryURL = URL(fileURLWithPath: root)
        process.standardOutput = pipe
        process.standardError = FileHandle.nullDevice
        serviceBuffer = ""
        pipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let bytes = handle.availableData
            guard !bytes.isEmpty, let text = String(data: bytes, encoding: .utf8) else { return }
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.serviceBuffer += text
                while let newline = self.serviceBuffer.firstIndex(of: "\n") {
                    let line = String(self.serviceBuffer[..<newline])
                    self.serviceBuffer.removeSubrange(...newline)
                    if line.hasPrefix("VVS_READY=") {
                        let raw = String(line.dropFirst(10))
                        if let url = self.validURL(raw), url.host == "127.0.0.1" {
                            self.localURL = raw
                            if self.current == -1 {
                                self.tabs[-1]?.removeFromSuperview()
                                self.tabs.removeValue(forKey: -1)
                                self.show(-1)
                            }
                        }
                    } else if line.hasPrefix("VVS_ERROR=") {
                        self.status.stringValue = String(line.dropFirst(10))
                    }
                }
            }
        }
        do {
            try process.run()
            service = process
            servicePipe = pipe
        } catch {
            status.stringValue = "本地媒体服务未能启动，请检查运行环境。"
        }
    }
    func applicationWillTerminate(_ notification: Notification) {
        cloudCoordinator?.stop()
        servicePipe?.fileHandleForReading.readabilityHandler = nil
        if service?.isRunning == true { service?.terminate() }
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if webView === active, (current ?? -1) >= 0 {
            verificationTimer?.invalidate()
            verificationTimer = Timer.scheduledTimer(withTimeInterval: 20, repeats: false) { [weak self, weak webView] _ in
                MainActor.assumeIsolated { if let web = webView { self?.checkVerification(web) } }
            }
        }
        if webView === active { status.stringValue = (current ?? -1) >= 0 && adBlocker.enabled && adBlocker.failed ? "广告规则未能加载，当前网页未受拦截保护。" : ""; syncToolbar() }
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        if (error as NSError).code == NSURLErrorCancelled { return }
        if webView === active {
            status.stringValue = current == -1 ? "本地服务未连接：请先启动媒体服务，或检查本地地址。" : "页面未能加载，可刷新或在默认浏览器打开。"
        }
    }
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        self.webView(webView, didFailProvisionalNavigation: navigation, withError: error)
    }
    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        if webView === active { status.stringValue = "网页进程已退出，点击刷新重新加载。" }
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        let allowed = validURL(url.absoluteString) != nil || url.absoluteString == "about:blank"
        decisionHandler(allowed ? .allow : .cancel)
    }
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if navigationAction.targetFrame == nil, let url = navigationAction.request.url,
           validURL(url.absoluteString) != nil {
            // 在线站点的新窗口永不自动交给系统浏览器。
            // 站内视频的新窗口请求改为当前页导航；广告跨站弹窗直接丢弃。
            if webView === tabs[-1] {
                if navigationAction.navigationType == .linkActivated { webView.load(URLRequest(url: url)) }
            } else if let source = webView.url, isSameOnlineSite(source, url) {
                webView.load(URLRequest(url: url))
            }
        }
        return nil
    }
    private func isSameOnlineSite(_ source: URL, _ target: URL) -> Bool {
        guard let from = source.host?.lowercased(), let to = target.host?.lowercased() else { return false }
        if from == to { return true }
        let families = ["pornhub.com", "xhamster.com", "spankbang.com", "pigav.com", "javhdporn.net", "missav.ai", "jable.tv"]
        return families.contains { root in
            (from == root || from.hasSuffix("." + root)) && (to == root || to.hasSuffix("." + root))
        }
    }
    private func buildMenu() {
        let menu = NSMenu()
        let item = NSMenuItem()
        menu.addItem(item)
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "关于 vvs-club", action: #selector(about), keyEquivalent: "")
        appMenu.addItem(withTitle: "检查更新…", action: #selector(checkForUpdates), keyEquivalent: "u")
        appMenu.addItem(withTitle: "高级：连接其他媒体服务…", action: #selector(configureLocal), keyEquivalent: "")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "退出 vvs-club", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        item.submenu = appMenu
        let edit = NSMenuItem()
        menu.addItem(edit)
        let editMenu = NSMenu(title: "编辑")
        editMenu.addItem(withTitle: "剪切", action: #selector(NSText.cut(_:)), keyEquivalent: "x")
        editMenu.addItem(withTitle: "复制", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "粘贴", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "全选", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        edit.submenu = editMenu
        NSApp.mainMenu = menu
    }
    @objc private func openSponsor() {
        if let url = URL(string: "https://justmysocks.net/members/aff.php?aff=39372") { NSWorkspace.shared.open(url) }
    }
    @objc private func checkForUpdates() {
        guard let url = URL(string: "https://api.github.com/repos/stanlll-cloud/vvs-club/releases/latest") else { return }
        var request = URLRequest(url: url)
        request.setValue("application/vnd.github.v3+json", forHTTPHeaderField: "Accept")
        request.setValue("vvs-club-macos", forHTTPHeaderField: "User-Agent")
        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                guard let data = data, error == nil,
                      let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                      let tagName = json["tag_name"] as? String else {
                    let alert = NSAlert()
                    alert.messageText = "检查更新失败"
                    alert.informativeText = "无法连接至更新服务器，请稍后重试或访问 GitHub 主页。"
                    alert.addButton(withTitle: "确定")
                    alert.addButton(withTitle: "打开项目主页")
                    if alert.runModal() == .alertSecondButtonReturn {
                        if let u = URL(string: "https://github.com/stanlll-cloud/vvs-club") { NSWorkspace.shared.open(u) }
                    }
                    return
                }
                let currentVer = "0.1.0"
                let remoteVer = tagName.trimmingCharacters(in: CharacterSet(charactersIn: "vV"))
                let isNewer = remoteVer.compare(currentVer, options: .numeric) == .orderedDescending
                let htmlUrl = json["html_url"] as? String ?? "https://github.com/stanlll-cloud/vvs-club/releases"
                let body = json["body"] as? String ?? "全新版本已发布，体验更强性能与新特性。"

                let alert = NSAlert()
                if isNewer {
                    alert.messageText = "发现新版本 \(tagName)！"
                    alert.informativeText = "当前版本：v\(currentVer)\n\n更新内容：\n\(body.prefix(300))\n\n是否立即前往下载最新版本？"
                    alert.addButton(withTitle: "立即升级")
                    alert.addButton(withTitle: "稍后再说")
                    if alert.runModal() == .alertFirstButtonReturn {
                        if let targetUrl = URL(string: htmlUrl) { NSWorkspace.shared.open(targetUrl) }
                    }
                } else {
                    alert.messageText = "已是最新版本"
                    alert.informativeText = "当前版本 v\(currentVer) 已经是最新版，暂无可用更新。"
                    alert.addButton(withTitle: "好的")
                    alert.runModal()
                }
            }
        }.resume()
    }
    @objc private func about() {
        NSApp.orderFrontStandardAboutPanel(options: [
            .applicationName: "vvs-club", .applicationVersion: "0.1.0",
            .credits: NSAttributedString(string: "Mac 浏览器外壳由本衍生项目维护。\n本地媒体服务基于 Peach，Copyright © 2026 longmeidao。\n源码：https://github.com/stanlll-cloud/vvs-club\n许可证：AGPL-3.0-or-later。")
        ])
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

@main
struct ClubMain {
    static func main() {
        MainActor.assumeIsolated {
            let app = NSApplication.shared
            let delegate = ClubApp()
            app.delegate = delegate
            app.run()
        }
    }
}
