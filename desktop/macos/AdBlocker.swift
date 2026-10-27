import WebKit

@MainActor
final class ClubAdBlocker {
    var enabled: Bool {
        didSet { UserDefaults.standard.set(enabled, forKey: "clubAdBlockEnabled") }
    }
    private(set) var failed = false
    private(set) var failureReason: String?
    private var rules: WKContentRuleList?
    private var compiling = false
    private var pending: [(WKContentRuleList?) -> Void] = []
    init() { enabled = UserDefaults.standard.object(forKey: "clubAdBlockEnabled") as? Bool ?? true }
    func apply(to web: WKWebView, completion: @escaping (Bool) -> Void) {
        if let rules = rules { web.configuration.userContentController.remove(rules) }
        guard enabled else { completion(true); return }
        prepare { [weak self, weak web] rule in
            guard let self = self, let web = web else { return }
            if self.enabled, let rule = rule {
                web.configuration.userContentController.remove(rule)
                web.configuration.userContentController.add(rule)
            }
            completion(!self.enabled || rule != nil)
        }
    }
    private func prepare(_ completion: @escaping (WKContentRuleList?) -> Void) {
        if let rules = rules { completion(rules); return }
        pending.append(completion)
        guard !compiling else { return }
        compiling = true
        guard let file = Bundle.main.url(forResource: "adblock-rules", withExtension: "json"),
              let source = try? String(contentsOf: file, encoding: .utf8) else { finish(nil); return }
        WKContentRuleListStore.default().compileContentRuleList(forIdentifier: "vvs-club-ads-v2", encodedContentRuleList: source) { [weak self] result, error in
            self?.failureReason = error?.localizedDescription
            self?.finish(result)
        }
    }
    private func finish(_ result: WKContentRuleList?) {
        rules = result; failed = result == nil; compiling = false
        let callbacks = pending; pending.removeAll()
        for callback in callbacks { callback(result) }
    }
}
