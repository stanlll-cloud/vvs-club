# vvs-club Mac 应用

同一窗口里，左侧选择入口，右侧浏览网页。在线站点各自保留页面，切换时无需重新打开首页；后退、前进与刷新只作用于当前站点。页面会使用 macOS WebKit，使用体验取决于网站对 Safari/WebKit 的支持。

## 构建与打开

需要 macOS 13 或更新版本，以及 Apple Command Line Tools。在仓库根目录执行：

```sh
python3 desktop/macos/build.py
```

构建结果是 `build/vvs-club-macos/vvs-club.app`，按当前 Mac 架构生成。此包使用本地签名，没有 Apple Developer ID 签名或公证；跨机器分发需要单独准备签名与兼容性验证。

## 在线影视区

入口由 [sites.json](sites.json) 维护，每个项目包含 `name` 和 HTTPS `url`。当前包含使用者指定的 PigAV、JAVHDPorn、SpankBang 与 Pornhub 中文站。修改后重新构建即可。站点之间不复用应用的访问密码，也不会从系统浏览器导入登录信息。

右侧是独立的顶层 `WKWebView`，没有使用 iframe，也不移除网站响应头、修改证书信任或代理网站内容。网站的登录、年龄、地区与访问验证仍由使用者在原站完成。自动弹窗不启用；新窗口链接由默认浏览器打开。站点若不兼容，可使用工具栏的外部打开按钮。

应用不提供视频资源、不解析真实播放地址、不绕过会员或 DRM，也不保证第三方站点始终可访问或可播放。网站无法连接时显示失败提示；主界面不自动打开任何在线站点。

## 本地媒体库

Mac 外壳不捆绑 Python 媒体服务、FFmpeg 或媒体资料。先按仓库的[运行与配置](../../docs/OPERATIONS.md)准备并启动本地服务，再选择「本地媒体库」。默认连接 `http://127.0.0.1:8900`，可以在「设置本地地址」中修改。应用不会在后台静默安装或启动服务。

账户、Cookie 和站点数据由系统 WebKit 的应用数据存储管理。不要把登录信息、个人媒体或数据库放进仓库。

## 来源

此 Mac 外壳是 vvs-club 的新增部分，本地媒体服务基于 [Peach](https://github.com/peach-mitao/peach)。整个衍生项目遵循 [AGPL-3.0-or-later](../../LICENSE)，原作者及第三方许可保留。
