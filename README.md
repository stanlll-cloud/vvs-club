<p align="center">
  <img src="resources/vvs-club.svg" width="100" alt="vvs-club Logo">
</p>

<h1 align="center">vvs-club</h1>

<p align="center">
  <strong>专为 Mac 用户打造的私人原盘放映室 & 影音工作台。</strong><br>
  本地刮削 · 云盘直挂 · 顶级站点聚合 · 纯净无广告沙盒
</p>

<p align="center">
  <a href="desktop/macos/README.md">Mac 快速上手</a> ·
  <a href="desktop/windows/README.md">Windows 预览版</a> ·
  <a href="docs/OPERATIONS.md">运行与架构</a> ·
  <a href="desktop/macos/CLOUD_CONNECTIONS.md">网盘直连指南</a> ·
  <a href="README.en.md">English</a>
</p>

---

![vvs-club Mac Preview](resources/vvs-club-preview.png)

## 为什么是 vvs-club？

厌倦了在各种满是牛皮癣弹窗的站点之间切换？厌倦了网盘里成百上千部原盘杂乱无章、没有海报封面？

**vvs-club** 将你的本地冷存储、挂载云盘以及全网顶级在线放映站，无缝统一收拢进一个纯粹、沉浸、安全的 Mac 原生视窗中。

- ⚡️ **极致纯净沙盒**：内置广告与恶意追踪拦截规则，自动拦截跨站流氓弹窗与重定向，只留原生播放器。
- 📼 **全能影音刮削**：基于成熟媒体管理内核，智能匹配 NFO、演职员表、高分辨率海报与外挂字幕，不篡改源文件。
- ☁️ **云盘生态直连**：提供 115、夸克、阿里、百度及 TeraBox 连接入口；各家账号、扫描与播放的实测状态见网盘说明。
- 🌐 **一键站点轮巡**：预置全球顶级精选站点入口（JAVHDPorn, MissAV, SpankBang, Pornhub, xHamster 等），一键开启独立浏览面板。
- 🔒 **纯本地隐私**：零数据上云，书签和浏览器数据保存在本机，不上传 GitHub；网盘连接的部分 OAuth 授权和令牌刷新经过 `api.oplist.org`，具体范围见网盘说明。

---

## ⚡️ 流畅观影的底层网络支撑

观赏 4K 高码率内容与跨国直连媒体流时，拥堵和频繁断连是最破坏体验的元凶。

如果你厌倦了自建节点频繁换 IP、找机场频繁跑路的折腾，推荐搭配 **Just My Socks（搬瓦工官方直属服务）** 作为网络底座：

* **三网 CN2 GIA 专线直连**：低延迟、晚高峰满速狂飙，专为高码率 4K/8K 视频流设计。
* **IP 自动热漂移无缝换新**：由搬瓦工官方运维调度，彻底告别 IP 污染与断流焦虑。

[![查看高速专线与套餐](resources/jms-button.svg)](https://justmysocks.net/members/aff.php?aff=39372)

---

## Windows 预览版

Windows 10/11 x64 构建入口见 [Windows 说明](desktop/windows/README.md)。安装程序与 ZIP 由 Actions 的 `vvs-club Windows` 工作流生成，只有成功构建和后端启动检查通过后才提供产物。真实 Windows 设备、第三方账号和具体影片仍需验收，尚不能视为已验证的稳定发行版。

源码构建需要 Python 3.14 或更高；Windows 安装包采用内置运行时。

## 快速开始 (macOS)

在装有 Apple Command Line Tools 的 macOS 环境下，克隆本仓库并在根目录运行：

```sh
# 1. 准备环境并构建 Mac 原生壳
python3 desktop/macos/build.py

# 2. 启动应用
open build/vvs-club-macos/vvs-club.app
```

> 详细依赖配置与各网盘 OpenAPI 授权指南，请参阅 [网盘账号连接文档](desktop/macos/CLOUD_CONNECTIONS.md) 与 [运行文档](docs/OPERATIONS.md)。

## 自定义扩展

你可以随时在 `desktop/macos/sites.json` 中添加或修改你的专属私密站点：

```json
{
  "name": "My Vault",
  "url": "https://example.com"
}
```
保存后重新构建即可完成侧边栏集成。

## 免责与开源协议

* **内核来源**：本衍生项目基于 [Peach](https://github.com/peach-mitao/peach) 开源生态打造，遵循 [AGPL-3.0-or-later](LICENSE) 协议。
* **合规说明**：本项目仅为开源媒体管理与浏览器沙盒工具，不存储、不分发任何受版权保护或违法的内容资源。请在当地法律法规与服务条款允许的范围内合理使用。
