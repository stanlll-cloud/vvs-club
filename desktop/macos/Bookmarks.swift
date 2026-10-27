import AppKit

struct ClubBookmark: Codable, Equatable {
    var id = UUID().uuidString
    var parent: String?
    var title: String
    var url: String?
    var folder: Bool { url == nil }
}

@MainActor
final class BookmarkStore {
    private(set) var items: [ClubBookmark] = []
    private let file = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Application Support/vvs-club/bookmarks.json")
    var error: String?
    init() {
        if FileManager.default.fileExists(atPath: file.path) {
            do { items = try JSONDecoder().decode([ClubBookmark].self, from: Data(contentsOf: file)) }
            catch { self.error = "书签文件未能读取，已保留原文件。" }
        }
    }
    func children(_ parent: String?) -> [ClubBookmark] { items.filter { $0.parent == parent } }
    func contains(_ url: String) -> Bool { items.contains { $0.url == url } }
    func save(_ next: [ClubBookmark]) -> Bool {
        guard error == nil else { return false }
        do {
            try FileManager.default.createDirectory(at: file.deletingLastPathComponent(), withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
            try JSONEncoder().encode(next).write(to: file, options: .atomic)
            try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: file.path)
            items = next
            return true
        } catch { return false }
    }
    func add(title: String, url: String?, parent: String? = nil) -> Bool {
        save(items + [ClubBookmark(parent: parent, title: title, url: url)])
    }
    func canMove(_ id: String, to parent: String?) -> Bool {
        guard items.contains(where: { $0.id == id }) else { return false }
        var cursor = parent
        var seen = Set<String>()
        while let value = cursor {
            guard value != id, seen.insert(value).inserted,
                  let folder = items.first(where: { $0.id == value && $0.folder }) else { return false }
            cursor = folder.parent
        }
        return true
    }
    func move(_ id: String, to parent: String?, at index: Int) -> Bool {
        guard canMove(id, to: parent), var node = items.first(where: { $0.id == id }) else { return false }
        let siblings = children(parent)
        var position = index < 0 ? siblings.count : min(index, siblings.count)
        if node.parent == parent, let old = siblings.firstIndex(where: { $0.id == id }), old < position { position -= 1 }
        node.parent = parent
        var next = items.filter { $0.id != id }
        let remaining = next.filter { $0.parent == parent }
        let target = position < remaining.count ? next.firstIndex(where: { $0.id == remaining[position].id })! : next.count
        next.insert(node, at: target)
        return save(next)
    }
}

final class BookmarkTreeNode: NSObject {
    let value: ClubBookmark
    init(_ value: ClubBookmark) { self.value = value }
}

@MainActor
final class BookmarkPanel: NSObject, NSOutlineViewDataSource, NSOutlineViewDelegate {
    let view = NSView()
    private let store: BookmarkStore
    private let outline = NSOutlineView()
    private let hint = NSTextField(labelWithString: "双击打开书签；拖到文件夹内或条目之间可移动和排序。")
    private let dragType = NSPasteboard.PasteboardType("cloud.stanlll.vvs-club.bookmark")
    private var undoItems: [ClubBookmark]?
    private var nodes: [String: BookmarkTreeNode] = [:]
    var onOpen: ((String, String) -> Void)?
    var onChange: (() -> Void)?
    init(store: BookmarkStore) {
        self.store = store
        super.init()
        let title = NSTextField(labelWithString: "书签管理")
        title.font = .systemFont(ofSize: 28, weight: .bold)
        let bar = NSStackView()
        bar.spacing = 10
        for (name, action) in [("新建文件夹", #selector(newFolder)), ("编辑", #selector(edit)), ("移动到…", #selector(moveSelected)), ("删除", #selector(remove)), ("撤销删除", #selector(undoDelete))] {
            let button = NSButton(title: name, target: self, action: action)
            button.bezelStyle = .rounded
            bar.addArrangedSubview(button)
        }
        hint.textColor = .secondaryLabelColor
        hint.lineBreakMode = .byTruncatingTail
        let name = NSTableColumn(identifier: NSUserInterfaceItemIdentifier("name"))
        name.title = "名称"; name.width = 300; name.minWidth = 180
        let url = NSTableColumn(identifier: NSUserInterfaceItemIdentifier("url"))
        url.title = "网址"; url.width = 450
        outline.addTableColumn(name); outline.addTableColumn(url)
        outline.outlineTableColumn = name
        outline.dataSource = self; outline.delegate = self
        outline.rowHeight = 42; outline.allowsMultipleSelection = false
        outline.target = self; outline.doubleAction = #selector(openSelected)
        outline.registerForDraggedTypes([dragType]); outline.setDraggingSourceOperationMask(.move, forLocal: true)
        outline.setAccessibilityLabel("书签和文件夹")
        let scroll = NSScrollView()
        scroll.documentView = outline; scroll.hasVerticalScroller = true; scroll.hasHorizontalScroller = true
        for child in [title, bar, hint, scroll] { child.translatesAutoresizingMaskIntoConstraints = false; view.addSubview(child) }
        NSLayoutConstraint.activate([
            title.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 28), title.topAnchor.constraint(equalTo: view.topAnchor, constant: 24),
            bar.leadingAnchor.constraint(equalTo: title.leadingAnchor), bar.topAnchor.constraint(equalTo: title.bottomAnchor, constant: 20),
            hint.leadingAnchor.constraint(equalTo: title.leadingAnchor), hint.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -28), hint.topAnchor.constraint(equalTo: bar.bottomAnchor, constant: 16),
            scroll.leadingAnchor.constraint(equalTo: title.leadingAnchor), scroll.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -28), scroll.topAnchor.constraint(equalTo: hint.bottomAnchor, constant: 18), scroll.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -24)
        ])
        refresh()
    }
    func refresh() { nodes = Dictionary(uniqueKeysWithValues: store.items.map { ($0.id, BookmarkTreeNode($0)) }); outline.reloadData(); outline.expandItem(nil, expandChildren: true); hint.stringValue = store.error ?? (store.items.isEmpty ? "还没有书签。打开网站后，点击顶部星形按钮即可收藏当前网址。" : "双击打开书签；拖到文件夹内或条目之间可移动和排序。") }
    private var selected: ClubBookmark? { (outline.item(atRow: outline.selectedRow) as? BookmarkTreeNode)?.value }
    private func finish(_ success: Bool) { if success { refresh(); onChange?() } else { hint.stringValue = store.error ?? "保存失败，原有书签已保留，请重试。" } }
    func outlineView(_ outlineView: NSOutlineView, numberOfChildrenOfItem item: Any?) -> Int { store.children((item as? BookmarkTreeNode)?.value.id).count }
    func outlineView(_ outlineView: NSOutlineView, child index: Int, ofItem item: Any?) -> Any { nodes[store.children((item as? BookmarkTreeNode)?.value.id)[index].id]! }
    func outlineView(_ outlineView: NSOutlineView, isItemExpandable item: Any) -> Bool { (item as? BookmarkTreeNode)?.value.folder ?? false }
    func outlineView(_ outlineView: NSOutlineView, viewFor tableColumn: NSTableColumn?, item: Any) -> NSView? {
        guard let node = (item as? BookmarkTreeNode)?.value else { return nil }
        let text = NSTextField(labelWithString: tableColumn?.identifier.rawValue == "name" ? (node.folder ? "▸  " : "☆  ") + node.title : node.url ?? "文件夹")
        text.lineBreakMode = .byTruncatingMiddle; text.toolTip = node.url ?? node.title
        return text
    }
    func outlineView(_ outlineView: NSOutlineView, pasteboardWriterForItem item: Any) -> NSPasteboardWriting? {
        guard let node = (item as? BookmarkTreeNode)?.value else { return nil }
        let writer = NSPasteboardItem(); writer.setString(node.id, forType: dragType); return writer
    }
    func outlineView(_ outlineView: NSOutlineView, validateDrop info: NSDraggingInfo, proposedItem item: Any?, proposedChildIndex index: Int) -> NSDragOperation {
        guard let id = info.draggingPasteboard.string(forType: dragType), info.draggingSource as? NSOutlineView === outline,
              item == nil || (item as? BookmarkTreeNode)?.value.folder == true, store.canMove(id, to: (item as? BookmarkTreeNode)?.value.id) else { return [] }
        return .move
    }
    func outlineView(_ outlineView: NSOutlineView, acceptDrop info: NSDraggingInfo, item: Any?, childIndex index: Int) -> Bool {
        guard let id = info.draggingPasteboard.string(forType: dragType) else { return false }
        let success = store.move(id, to: (item as? BookmarkTreeNode)?.value.id, at: index); finish(success); return success
    }
    @objc private func newFolder() {
        let prompt = NSAlert(); prompt.messageText = "新建文件夹"; prompt.addButton(withTitle: "创建"); prompt.addButton(withTitle: "取消")
        let field = NSTextField(string: "新文件夹"); field.frame = NSRect(x: 0, y: 0, width: 320, height: 26); prompt.accessoryView = field
        guard prompt.runModal() == .alertFirstButtonReturn else { return }
        let name = field.stringValue.trimmingCharacters(in: .whitespacesAndNewlines); guard !name.isEmpty else { return }
        let parent = selected.flatMap { $0.folder ? $0.id : $0.parent }
        finish(store.add(title: name, url: nil, parent: parent))
    }
    @objc private func edit() {
        guard let node = selected else { hint.stringValue = "请先选择一个书签或文件夹。"; return }
        let prompt = NSAlert(); prompt.messageText = node.folder ? "重命名文件夹" : "编辑书签"; prompt.addButton(withTitle: "保存"); prompt.addButton(withTitle: "取消")
        let stack = NSStackView(); stack.orientation = .vertical; stack.spacing = 12; stack.frame = NSRect(x: 0, y: 0, width: 400, height: node.folder ? 30 : 70)
        let name = NSTextField(string: node.title); name.widthAnchor.constraint(equalToConstant: 400).isActive = true; stack.addArrangedSubview(name)
        let address = NSTextField(string: node.url ?? ""); if !node.folder { address.widthAnchor.constraint(equalToConstant: 400).isActive = true; stack.addArrangedSubview(address) }
        prompt.accessoryView = stack
        guard prompt.runModal() == .alertFirstButtonReturn, !name.stringValue.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        if !node.folder { guard let url = URL(string: address.stringValue), ["http", "https"].contains(url.scheme ?? ""), url.host != nil, url.user == nil, url.password == nil else { hint.stringValue = "请输入不含账号密码的 HTTP 或 HTTPS 网址。"; return } }
        var next = store.items; if let index = next.firstIndex(where: { $0.id == node.id }) { next[index].title = name.stringValue; if !node.folder { next[index].url = address.stringValue }; finish(store.save(next)) }
    }
    @objc private func openSelected() { guard let node = selected else { return }; if node.folder { if let item = nodes[node.id] { if outline.isItemExpanded(item) { outline.collapseItem(item) } else { outline.expandItem(item) } } } else if let url = node.url { onOpen?(node.title, url) } }
    @objc private func remove() {
        guard let node = selected else { return }
        var ids: Set<String> = [node.id]
        var count = 0
        repeat { count = ids.count; for item in store.items where item.parent.map({ ids.contains($0) }) == true { ids.insert(item.id) } } while count != ids.count
        let prompt = NSAlert(); prompt.messageText = "删除“\(node.title)”？"; prompt.informativeText = "将删除 \(ids.count) 个书签或文件夹，可点「撤销删除」恢复。"; prompt.addButton(withTitle: "取消"); prompt.addButton(withTitle: "删除")
        guard prompt.runModal() == .alertSecondButtonReturn else { return }
        undoItems = store.items.filter { ids.contains($0.id) }; finish(store.save(store.items.filter { !ids.contains($0.id) }))
    }
    @objc private func undoDelete() { guard let deleted = undoItems else { return }; if store.save(store.items + deleted) { undoItems = nil; refresh(); onChange?() } }
    @objc private func moveSelected() {
        guard let node = selected else { return }
        let destinations = store.items.filter { $0.folder && store.canMove(node.id, to: $0.id) }
        let prompt = NSAlert(); prompt.messageText = "移动到文件夹"; prompt.addButton(withTitle: "移动"); prompt.addButton(withTitle: "取消")
        let menu = NSPopUpButton(frame: NSRect(x: 0, y: 0, width: 360, height: 30)); menu.addItem(withTitle: "书签栏（顶层）")
        for folder in destinations { menu.addItem(withTitle: folder.title) }; prompt.accessoryView = menu
        guard prompt.runModal() == .alertFirstButtonReturn else { return }
        finish(store.move(node.id, to: menu.indexOfSelectedItem == 0 ? nil : destinations[menu.indexOfSelectedItem - 1].id, at: -1))
    }
}
