import AppKit
import WebKit

struct Site: Decodable {
    let name: String
    let url: String
}

@MainActor
final class ClubApp: NSObject, NSApplicationDelegate, WKNavigationDelegate, WKUIDelegate {
    private var window: NSWindow!
    private let webHost = NSView()
    private let welcome = NSStackView()
    private let sidebar = NSStackView()
    private var sites: [Site] = []
    private var tabs: [Int: WKWebView] = [:]
    private var buttons: [NSButton] = []
    private var current: Int?
    private var historyObservation: [NSKeyValueObservation] = []
    private let pageTitle = NSTextField(labelWithString: "你的影片空间")
    private let locationLabel = NSTextField(labelWithString: "选择左侧入口")
    private let status = NSTextField(labelWithString: "")
    private var back: NSButton!
    private var forward: NSButton!
    private var reload: NSButton!
    private var external: NSButton!

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
        window.minSize = NSSize(width: 880, height: 580)
        window.center()
        window.isReleasedWhenClosed = false
        let root = NSView()
        window.contentView = root

        let side = NSVisualEffectView()
        side.material = .sidebar
        side.blendingMode = .behindWindow
        side.state = .active
        sidebar.orientation = .vertical
        sidebar.alignment = .leading
        sidebar.spacing = 10
        add(side, to: root)
        add(sidebar, to: side)
        let brand = NSTextField(labelWithString: "vvs-club")
        brand.font = .systemFont(ofSize: 26, weight: .bold)
        sidebar.addArrangedSubview(brand)
        let tagline = NSTextField(labelWithString: "好片有去处，收藏有条理。")
        tagline.textColor = .secondaryLabelColor
        tagline.font = .systemFont(ofSize: 11)
        sidebar.addArrangedSubview(tagline)
        sidebar.setCustomSpacing(28, after: tagline)
        addSection("我的空间")
        addButton("本地媒体库", symbol: "film.stack", tag: -1)
        let settings = NSButton(title: "设置本地地址…", target: self, action: #selector(configureLocal))
        settings.bezelStyle = .inline
        sidebar.addArrangedSubview(settings)
        sidebar.setCustomSpacing(22, after: settings)
        addSection("在线影视区")
        for (index, site) in sites.enumerated() {
            addButton(site.name, symbol: "play.rectangle", tag: index)
        }
        let spacer = NSView()
        spacer.heightAnchor.constraint(greaterThanOrEqualToConstant: 20).isActive = true
        sidebar.addArrangedSubview(spacer)
        let footer = NSTextField(wrappingLabelWithString: "网页由各站点提供\n登录与播放规则以原站为准")
        footer.font = .systemFont(ofSize: 11)
        footer.textColor = .secondaryLabelColor
        sidebar.addArrangedSubview(footer)

        let right = NSView()
        add(right, to: root)
        let toolbar = NSStackView()
        toolbar.spacing = 8
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
        pageTitle.font = .systemFont(ofSize: 14, weight: .semibold)
        locationLabel.font = .systemFont(ofSize: 11)
        locationLabel.textColor = .secondaryLabelColor
        locationLabel.lineBreakMode = .byTruncatingMiddle
        labels.setContentHuggingPriority(.defaultLow, for: .horizontal)
        toolbar.addArrangedSubview(labels)
        toolbar.addArrangedSubview(external)
        add(toolbar, to: right)
        add(webHost, to: right)
        add(status, to: right)
        status.textColor = .secondaryLabelColor
        status.font = .systemFont(ofSize: 11)
        status.lineBreakMode = .byTruncatingTail
        buildWelcome()
        NSLayoutConstraint.activate([
            side.leadingAnchor.constraint(equalTo: root.leadingAnchor),
            side.topAnchor.constraint(equalTo: root.topAnchor),
            side.bottomAnchor.constraint(equalTo: root.bottomAnchor),
            side.widthAnchor.constraint(equalToConstant: 226),
            sidebar.leadingAnchor.constraint(equalTo: side.leadingAnchor, constant: 18),
            sidebar.trailingAnchor.constraint(equalTo: side.trailingAnchor, constant: -18),
            sidebar.topAnchor.constraint(equalTo: side.topAnchor, constant: 28),
            sidebar.bottomAnchor.constraint(equalTo: side.bottomAnchor, constant: -20),
            right.leadingAnchor.constraint(equalTo: side.trailingAnchor),
            right.trailingAnchor.constraint(equalTo: root.trailingAnchor),
            right.topAnchor.constraint(equalTo: root.topAnchor),
            right.bottomAnchor.constraint(equalTo: root.bottomAnchor),
            toolbar.topAnchor.constraint(equalTo: right.topAnchor, constant: 12),
            toolbar.leadingAnchor.constraint(equalTo: right.leadingAnchor, constant: 16),
            toolbar.trailingAnchor.constraint(equalTo: right.trailingAnchor, constant: -16),
            toolbar.heightAnchor.constraint(equalToConstant: 44),
            webHost.topAnchor.constraint(equalTo: toolbar.bottomAnchor, constant: 10),
            webHost.leadingAnchor.constraint(equalTo: right.leadingAnchor),
            webHost.trailingAnchor.constraint(equalTo: right.trailingAnchor),
            webHost.bottomAnchor.constraint(equalTo: status.topAnchor, constant: -8),
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
        label.font = .systemFont(ofSize: 11, weight: .semibold)
        label.textColor = .secondaryLabelColor
        sidebar.addArrangedSubview(label)
    }
    private func addButton(_ title: String, symbol: String, tag: Int) {
        let button = NSButton(title: title, target: self, action: #selector(selectSite(_:)))
        button.tag = tag
        button.bezelStyle = .rounded
        button.alignment = .left
        button.image = NSImage(systemSymbolName: symbol, accessibilityDescription: nil)
        button.imagePosition = .imageLeading
        button.setButtonType(.pushOnPushOff)
        sidebar.addArrangedSubview(button)
        button.widthAnchor.constraint(equalTo: sidebar.widthAnchor).isActive = true
        button.heightAnchor.constraint(equalToConstant: 34).isActive = true
        buttons.append(button)
    }
    private func tool(_ symbol: String, _ title: String, _ action: Selector) -> NSButton {
        let button = NSButton(image: NSImage(systemSymbolName: symbol, accessibilityDescription: title)!, target: self, action: action)
        button.toolTip = title
        button.setAccessibilityLabel(title)
        button.bezelStyle = .texturedRounded
        return button
    }
    private func buildWelcome() {
        welcome.orientation = .vertical
        welcome.alignment = .leading
        welcome.spacing = 18
        let title = NSTextField(labelWithString: "今天，想看点什么？")
        title.font = .systemFont(ofSize: 32, weight: .bold)
        let body = NSTextField(wrappingLabelWithString: "本地收藏，在线站点，都从这里打开。\n选择左侧入口，网页会在右侧加载。")
        body.font = .systemFont(ofSize: 16)
        body.textColor = .secondaryLabelColor
        let note = NSTextField(wrappingLabelWithString: "本地媒体库需要先启动随仓库提供的服务。\n在线站点可以独立打开，不依赖本地媒体服务。\n第三方网站的登录、地区与年龄验证需由你完成。")
        note.font = .systemFont(ofSize: 12)
        note.textColor = .secondaryLabelColor
        welcome.addArrangedSubview(title)
        welcome.addArrangedSubview(body)
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
    @objc private func selectSite(_ sender: NSButton) { show(sender.tag) }
    private func show(_ key: Int) {
        let raw = key == -1 ? UserDefaults.standard.string(forKey: "libraryURL") ?? "http://127.0.0.1:8900" : sites[key].url
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
            let view = WKWebView(frame: .zero, configuration: config)
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
            view.load(URLRequest(url: url))
        }
        syncToolbar()
    }
    private var active: WKWebView? { current.flatMap { tabs[$0] } }
    private func syncToolbar() {
        back?.isEnabled = active?.canGoBack ?? false
        forward?.isEnabled = active?.canGoForward ?? false
        reload?.isEnabled = active != nil
        external?.isEnabled = active?.url != nil
        if let key = current {
            pageTitle.stringValue = key == -1 ? "本地媒体库" : sites[key].name
            locationLabel.stringValue = active?.url?.host ?? "正在连接…"
        }
    }
    @objc private func goBack() { active?.goBack() }
    @objc private func goForward() { active?.goForward() }
    @objc private func refresh() { active?.reload() }
    @objc private func openExternal() {
        if let url = active?.url, validURL(url.absoluteString) != nil { NSWorkspace.shared.open(url) }
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
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if webView === active { status.stringValue = ""; syncToolbar() }
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
           validURL(url.absoluteString) != nil { NSWorkspace.shared.open(url) }
        return nil
    }
    private func buildMenu() {
        let menu = NSMenu()
        let item = NSMenuItem()
        menu.addItem(item)
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "关于 vvs-club", action: #selector(about), keyEquivalent: "")
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
    @objc private func about() {
        NSApp.orderFrontStandardAboutPanel(options: [
            .applicationName: "vvs-club", .applicationVersion: "0.1.0",
            .credits: NSAttributedString(string: "Mac 浏览器外壳由本衍生项目维护。\n本地媒体服务基于 Peach，Copyright © 2026 longmeidao。\n源码：https://github.com/stanlll-cloud/vvs-club\n许可证：AGPL-3.0-or-later。")
        ])
    }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

MainActor.assumeIsolated {
    let app = NSApplication.shared
    let delegate = ClubApp()
    app.delegate = delegate
    app.run()
}
