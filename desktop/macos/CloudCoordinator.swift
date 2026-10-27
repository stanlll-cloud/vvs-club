import AppKit
import WebKit

@MainActor
final class CloudCoordinator: NSObject, WKScriptMessageHandler {
    let view = NSView()
    var onMounted: (() -> Void)?
    var onImport: ((String, String) -> Void)?
    private var web: WKWebView?
    private var process: Process?
    private var pipe: Pipe?
    private var buffer = ""
    private var base: URL?
    private var capability = ""
    private var dark = false
    private var authorization: CloudAuthorization?
    private var pendingProvider: String?
    private let loading = NSTextField(wrappingLabelWithString: "正在准备网盘连接组件…")

    override init() {
        super.init()
        loading.translatesAutoresizingMaskIntoConstraints = false
        loading.font = .systemFont(ofSize: 18)
        loading.textColor = .secondaryLabelColor
        view.addSubview(loading)
        NSLayoutConstraint.activate([
            loading.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            loading.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),
            loading.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
    func show(dark: Bool) {
        self.dark = dark
        applyTheme(dark)
        if process == nil { launch() }
    }
    func applyTheme(_ dark: Bool) {
        self.dark = dark
        web?.evaluateJavaScript("window.setClubTheme?.(\(dark))", completionHandler: nil)
    }
    private func launch() {
        guard let configURL = Bundle.main.url(forResource: "runtime", withExtension: "json"),
              let data = try? Data(contentsOf: configURL),
              let config = try? JSONSerialization.jsonObject(with: data) as? [String: String],
              let root = config["backendRoot"],
              let binary = Bundle.main.url(forResource: "openlist", withExtension: nil) else {
            loading.stringValue = "未找到网盘连接组件，请使用包含 OpenList 的新版应用。"
            return
        }
        let python = URL(fileURLWithPath: root).appendingPathComponent(".venv/bin/python")
        let entry = URL(fileURLWithPath: root).appendingPathComponent("desktop/macos/cloud_service.py")
        let task = Process()
        let channel = Pipe()
        task.executableURL = python
        task.arguments = ["-u", entry.path, "--binary", binary.path]
        task.currentDirectoryURL = URL(fileURLWithPath: root)
        task.standardOutput = channel
        task.standardError = FileHandle.nullDevice
        channel.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let bytes = handle.availableData
            guard !bytes.isEmpty, let text = String(data: bytes, encoding: .utf8) else { return }
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.buffer += text
                while let newline = self.buffer.firstIndex(of: "\n") {
                    let line = String(self.buffer[..<newline])
                    self.buffer.removeSubrange(...newline)
                    if line.hasPrefix("VVS_CLOUD_READY=") {
                        let payload = Data(line.dropFirst(16).utf8)
                        if let settings = try? JSONSerialization.jsonObject(with: payload) as? [String: String],
                           let text = settings["url"], let url = URL(string: text),
                           url.scheme == "http", url.host == "127.0.0.1", let cap = settings["capability"] {
                            self.base = url
                            self.capability = cap
                            self.loadPage()
                        }
                    } else if line.hasPrefix("VVS_CLOUD_ERROR=") {
                        self.loading.stringValue = "网盘组件未能启动，请重新打开应用。"
                    }
                }
            }
        }
        do { try task.run(); process = task; pipe = channel }
        catch { loading.stringValue = "网盘连接组件未能启动，请检查应用安装。" }
    }
    private func loadPage() {
        guard let base = base else { return }
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        config.userContentController.add(self, name: "cloudAction")
        config.userContentController.addUserScript(WKUserScript(source: "document.documentElement.classList.toggle('dark',\(dark));", injectionTime: .atDocumentEnd, forMainFrameOnly: true))
        let browser = WKWebView(frame: .zero, configuration: config)
        browser.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(browser)
        NSLayoutConstraint.activate([
            browser.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            browser.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            browser.topAnchor.constraint(equalTo: view.topAnchor),
            browser.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        loading.isHidden = true
        web = browser
        var components = URLComponents(url: base, resolvingAgainstBaseURL: false)!
        components.path = "/"
        components.fragment = "cap=" + capability
        browser.load(URLRequest(url: components.url!))
    }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, let base = base,
              message.frameInfo.securityOrigin.host == "127.0.0.1",
              message.frameInfo.securityOrigin.port == base.port,
              message.frameInfo.securityOrigin.protocol == "http",
              let body = message.body as? [String: String], let action = body["action"] else { return }
        if action == "mounted" { onMounted?(); return }
        guard let provider = body["provider"], ["baidu", "aliyun", "115", "quark", "terabox"].contains(provider) else { return }
        if action == "import", let path = body["path"] {
            let expected = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Application Support/vvs-club/cloud/index/" + provider).standardizedFileURL.path
            if URL(fileURLWithPath: path).standardizedFileURL.path == expected { onImport?(path, provider) }
        } else if action == "login" { beginAuthorization(provider) }
    }
    private func beginAuthorization(_ provider: String) {
        guard authorization == nil, pendingProvider == nil else { return }
        let drivers = ["baidu": "baiduyun_go", "aliyun": "alicloud_go", "115": "115cloud_go", "quark": "quark_cookie", "terabox": "terabox_cookie"]
        guard let driver = drivers[provider] else { failure("该网盘尚未接通账号登录。"); return }
        let flow = CloudAuthorization(provider: provider, driver: driver) { [weak self] tokens in
            guard let self = self else { return }
            guard let tokens = tokens else { self.authorization = nil; self.failure("登录窗口已关闭。"); return }
            self.connect(provider, tokens: tokens)
        }
        authorization = flow
        flow.open()
    }
    private func connect(_ provider: String, tokens: [String: Any]) {
        guard let base = base else { return }
        pendingProvider = provider
        if let value = jsonLiteral(provider) { web?.evaluateJavaScript("window.cloudConnecting?.(\(value))", completionHandler: nil) }
        var request = URLRequest(url: base.appendingPathComponent("api/connect"))
        request.httpMethod = "POST"
        request.setValue(capability, forHTTPHeaderField: "X-VVS-Capability")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try? JSONSerialization.data(withJSONObject: ["provider": provider, "tokens": tokens])
        request.timeoutInterval = 90
        let configuration = URLSessionConfiguration.ephemeral
        configuration.connectionProxyDictionary = [:]
        let session = URLSession(configuration: configuration)
        session.dataTask(with: request) { [weak self] data, response, _ in
            let valid = (response as? HTTPURLResponse)?.statusCode == 200
            DispatchQueue.main.async {
                guard let self = self else { return }
                self.pendingProvider = nil
                if valid, let encoded = self.jsonLiteral(provider) {
                    self.authorization?.connectionVerified()
                    self.authorization = nil
                    self.web?.evaluateJavaScript("window.cloudConnected?.(\(encoded))", completionHandler: nil)
                } else {
                    if self.authorization?.connectionFailed() != true { self.authorization = nil }
                    self.failure("授权尚未连接成功，请检查网盘授权或稍后重试。")
                }
            }
            session.finishTasksAndInvalidate()
        }.resume()
    }
    private func jsonLiteral(_ value: String) -> String? {
        guard let data = try? JSONSerialization.data(withJSONObject: value, options: [.fragmentsAllowed]) else { return nil }
        return String(data: data, encoding: .utf8)
    }
    private func failure(_ message: String) {
        if let text = jsonLiteral(message) { web?.evaluateJavaScript("window.cloudFailure?.(\(text))", completionHandler: nil) }
    }
    func stop() {
        authorization?.cancel()
        authorization = nil
        web?.configuration.userContentController.removeScriptMessageHandler(forName: "cloudAction")
        pipe?.fileHandleForReading.readabilityHandler = nil
        if process?.isRunning == true { process?.terminate() }
    }
}

@MainActor
final class CloudAuthorization: NSObject, WKNavigationDelegate, WKUIDelegate, NSWindowDelegate {
    private let provider: String
    private let driver: String
    private var completed = false
    private var verifying = false
    private var automaticAttempted = false
    private var loginTimer: Timer?
    private var webSession: Bool { provider == "quark" || provider == "terabox" }
    private let loginHint = NSTextField(wrappingLabelWithString: "请在网盘官网完成登录。扫码、短信或邮箱验证码以该网盘实际提供的方式为准。")
    private var window: NSWindow!
    private var browser: WKWebView!
    private let completion: ([String: Any]?) -> Void
    init(provider: String, driver: String, completion: @escaping ([String: Any]?) -> Void) {
        self.provider = provider
        self.driver = driver
        self.completion = completion
    }
    func open() {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        config.preferences.javaScriptCanOpenWindowsAutomatically = false
        browser = WKWebView(frame: .zero, configuration: config)
        browser.navigationDelegate = self
        browser.uiDelegate = self
        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 800, height: 720), styleMask: [.titled, .closable, .resizable], backing: .buffered, defer: false)
        window.title = "网盘登录授权 · OpenList"
        if webSession {
            let root = NSView()
            let toolbar = NSStackView()
            toolbar.spacing = 12
            let done = NSButton(title: "我已完成登录，连接网盘", target: self, action: #selector(confirmWebSessionManually))
            done.bezelStyle = .rounded
            done.heightAnchor.constraint(equalToConstant: 44).isActive = true
            loginHint.textColor = .secondaryLabelColor
            loginHint.font = .systemFont(ofSize: 12)
            toolbar.addArrangedSubview(loginHint)
            toolbar.addArrangedSubview(done)
            toolbar.translatesAutoresizingMaskIntoConstraints = false
            browser.translatesAutoresizingMaskIntoConstraints = false
            root.addSubview(toolbar)
            root.addSubview(browser)
            NSLayoutConstraint.activate([
                toolbar.leadingAnchor.constraint(equalTo: root.leadingAnchor, constant: 16),
                toolbar.trailingAnchor.constraint(equalTo: root.trailingAnchor, constant: -16),
                toolbar.topAnchor.constraint(equalTo: root.topAnchor, constant: 10),
                toolbar.heightAnchor.constraint(equalToConstant: 60),
                browser.topAnchor.constraint(equalTo: toolbar.bottomAnchor, constant: 8),
                browser.leadingAnchor.constraint(equalTo: root.leadingAnchor),
                browser.trailingAnchor.constraint(equalTo: root.trailingAnchor),
                browser.bottomAnchor.constraint(equalTo: root.bottomAnchor)
            ])
            window.contentView = root
        } else { window.contentView = browser }
        window.isReleasedWhenClosed = false
        window.delegate = self
        window.center()
        window.makeKeyAndOrderFront(nil)
        if webSession {
            let target = provider == "quark" ? "https://pan.quark.cn" : "https://www.terabox.com"
            browser.load(URLRequest(url: URL(string: target)!))
            loginTimer = Timer.scheduledTimer(withTimeInterval: 2, repeats: true) { [weak self] _ in
                MainActor.assumeIsolated { self?.tryAutomaticLogin() }
            }
            return
        }
        let prefixes = ["baidu": "baiduyun", "aliyun": "alicloud", "115": "115cloud"]
        var url = URLComponents(string: "https://api.oplist.org/\(prefixes[provider]!)/requests")!
        url.queryItems = [URLQueryItem(name: "driver_txt", value: driver), URLQueryItem(name: "server_use", value: "true"), URLQueryItem(name: "client_uid", value: ""), URLQueryItem(name: "client_key", value: ""), URLQueryItem(name: "secret_key", value: "")]
        browser.load(URLRequest(url: url.url!))
    }
    private func allowed(_ url: URL) -> Bool {
        guard url.scheme == "https", let host = url.host?.lowercased(), url.user == nil, url.password == nil else { return false }
        if webSession {
            let domains = provider == "quark" ? ["quark.cn", "uc.cn"] : ["terabox.com", "terabox.app", "1024terabox.com", "dubox.com", "accounts.google.com", "facebook.com"]
            return domains.contains { host == $0 || host.hasSuffix("." + $0) }
        }
        let domains = ["api.oplist.org"] + (provider == "baidu" ? ["baidu.com"] : provider == "aliyun" ? ["alipan.com", "aliyundrive.com", "aliyun.com", "taobao.com"] : ["115.com"])
        return domains.contains { host == $0 || host.hasSuffix("." + $0) }
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else { decisionHandler(.cancel); return }
        if !webSession, navigationAction.targetFrame?.isMainFrame != false, url.host == "api.oplist.org", url.path == "/", let raw = url.fragment, !raw.isEmpty {
            decisionHandler(.cancel)
            guard raw.utf8.count <= 65536, let fragment = raw.removingPercentEncoding,
                  let data = Data(base64Encoded: fragment),
                  let tokens = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  tokens["driver_txt"] as? String == driver,
                  tokens["refresh_token"] is String else { finish(nil); return }
            finish(tokens)
            return
        }
        decisionHandler(allowed(url) || url.absoluteString == "about:blank" ? .allow : .cancel)
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard !webSession, webView.url?.host == "api.oplist.org", webView.url?.path.hasSuffix("/requests") == true else { return }
        webView.evaluateJavaScript("document.body.innerText") { [weak self] result, _ in
            guard let self = self, !self.completed, let text = result as? String,
                  let data = text.data(using: .utf8),
                  let response = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let target = response["text"] as? String, let url = URL(string: target), self.allowed(url) else {
                self?.showError()
                return
            }
            self.browser.load(URLRequest(url: url))
        }
    }
    private func tryAutomaticLogin() {
        guard !automaticAttempted, !verifying, !completed, let url = browser?.url else { return }
        // 官网可在首页通过单页路由完成登录，不能只依赖 /list 等地址变化。
        // 下层仅在取得本网盘必需的会话 Cookie 后提交，并以真实目录读取确认连接。
        if allowed(url) { confirmWebSession(automatic: true) }
    }
    @objc private func confirmWebSessionManually() { confirmWebSession(automatic: false) }
    private func confirmWebSession(automatic: Bool) {
        guard webSession, !completed, !verifying else { return }
        browser.configuration.websiteDataStore.httpCookieStore.getAllCookies { [weak self] cookies in
            guard let self = self, !self.completed else { return }
            let domains = self.provider == "quark" ? ["quark.cn"] : ["terabox.com", "1024terabox.com", "dubox.com"]
            let valid = cookies.filter { cookie in
                let domain = cookie.domain.trimmingCharacters(in: CharacterSet(charactersIn: "."))
                return domains.contains { domain == $0 || domain.hasSuffix("." + $0) }
                    && !cookie.name.contains("\n") && !cookie.value.contains("\n")
                    && !cookie.name.contains("\r") && !cookie.value.contains("\r")
            }
            let required = self.provider == "quark" ? "__puus" : "ndus"
            guard valid.contains(where: { $0.name == required && !$0.value.isEmpty }) else {
                if !automatic { self.loginHint.stringValue = "尚未取得网盘登录状态。请先在下方官网完成登录，再点右侧按钮。" }
                return
            }
            if automatic { self.automaticAttempted = true }
            let cookie = valid.map { "\($0.name)=\($0.value)" }.joined(separator: "; ")
            self.finish(["driver_txt": self.driver, "cookie": cookie])
        }
    }
    private func showError() {
        let alert = NSAlert()
        alert.messageText = "网盘授权页暂时无法打开"
        alert.informativeText = "请检查当前网络后重试。没有读取或修改你的网盘文件。"
        alert.runModal()
        finish(nil)
    }
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        if (error as NSError).code != NSURLErrorCancelled { showError() }
    }
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if let url = navigationAction.request.url, allowed(url) { browser.load(URLRequest(url: url)) }
        return nil
    }
    func connectionVerified() { closeLoginWindow() }
    func connectionFailed() -> Bool {
        verifying = false
        if webSession {
            loginHint.stringValue = "登录会话已取得，但目录验证失败。请保持登录，点右侧按钮重试。"
            return true
        }
        closeLoginWindow()
        return false
    }
    private func closeLoginWindow() {
        completed = true
        loginTimer?.invalidate()
        loginTimer = nil
        window?.orderOut(nil)
        window?.delegate = nil
        browser?.stopLoading()
        browser?.navigationDelegate = nil
    }
    private func finish(_ tokens: [String: Any]?) {
        guard !completed, !verifying || tokens == nil else { return }
        if let tokens = tokens {
            verifying = true
            loginHint.stringValue = "正在验证云端文件列表，请稍候…"
            completion(tokens)
            return
        }
        completed = true
        loginTimer?.invalidate()
        loginTimer = nil
        window?.orderOut(nil)
        window?.delegate = nil
        browser?.stopLoading()
        browser?.navigationDelegate = nil
        completion(tokens)
    }
    func cancel() { finish(nil) }
    func windowWillClose(_ notification: Notification) { finish(nil) }
}
