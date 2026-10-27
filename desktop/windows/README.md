---
kind: howto
---

# vvs-club Windows

Windows 10/11 x64 的桌面版本使用 Electron 独立浏览器视图，不用 iframe 嵌入网站。界面沿用 Mac 版本的深浅主题、侧栏、书签、广告拦截与推广入口。进入媒体库隐藏外层导航，点击「返回主界面」恢复。

## 构建与下载

仓库 Actions 的 `vvs-club Windows` 工作流手动构建安装程序与 ZIP，产物保留 14 天。只有构建和临时后端启动检查成功后才上传完整产物；构建成功不代替真实 Windows 电脑、第三方登录和具体影片播放验收。新版本尚未完成这些验收时不能称为已验证的稳定发行版。

在 Windows 源码目录准备 Python 3.14、Node 24 和 uv，然后执行：

```powershell
uv sync --locked --extra build
python desktop/windows/prepare.py
cd desktop/windows
npm ci
npm run build
```

完整构建需要先取得工作流从固定源码构建的 `build/ffmpeg-windows/ffmpeg` 及对应源码 ZIP。安装包内含冻结的 Python 后端、OpenList 与 FFmpeg，无需用户另外安装 Python 或 Node。包未购买代码签名证书，系统可能显示发布者未知；应用不会自动关闭系统保护。

## 功能与数据

- 在线站点默认拦截已知广告请求、广告位与跨站新窗口；同站视频窗口留在应用内。顶部盾牌可切换广告规则，不能保证屏蔽全部广告。
- 星形按钮收藏当前网址，书签管理支持多层文件夹、编辑、删除撤销与拖拽移动。
- 本地媒体库复用已有媒体后端，包括资料、封面和字幕功能。扫描与播放能力需按真实素材检查。
- 五家网盘复用本机 OpenList 连接，登录窗口独立隔离，扫码、密码、验证码与授权均由用户完成；平台提供的登录方式和兼容性以实际页面为准。部分 OAuth 令牌经 `api.oplist.org`；夸克与 TeraBox 会话只交给本机组件。
- 网站不获得 Node.js、任意文件读写或桌面操作权限。浏览器证书验证保持开启，安全验证不能自动完成或绕过，Chromium 内核也不保证 Cloudflare 接受内置浏览器。
- Windows 数据保存在当前用户的应用数据目录，退出仅停止本应用的进程，卸载不主动删除媒体、书签或授权数据。Mac 的现有账号、数据与浏览器凭据不会复制到 Windows。

## 组件与许可

Electron 45.0.0、electron-builder 26.18.0 的完整依赖锁在 `package-lock.json`。OpenList v4.2.9 官方 Windows lite 资产及摘要固定在 `prepare.py`。FFmpeg 复用项目固定源码构建流程，包内附对应源码。原项目、OpenList、EasyList 及其他组件的声明和许可保留。

OpenList 对应源码：[v4.2.9](https://github.com/OpenListTeam/OpenList/tree/v4.2.9)。
