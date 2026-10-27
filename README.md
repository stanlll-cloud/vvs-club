<p align="center"><img src="resources/vvs-club.svg" width="120" alt="vvs-club Logo"></p>

# 私人影院 看片利器

**vvs-club · 你的私人放映空间。**

## 少点维护，多点自己的时间

自建 VPS，除了选机器，还要操心部署、更新和连接故障。想省下这些维护时间，可以了解 **Just My Socks（搬瓦工机场）**。关注 GIA 线路，或需要电信、联通、移动三网方案，可以先按自己的地区和运营商查看套餐，把时间留给真正想看的内容。官方套餐页列有 CT + CU + CM 三网选项；各套餐的线路和适用范围请分别核对。

[![查看线路与套餐 · 注册开通](resources/jms-button.svg)](https://justmysocks.net/members/aff.php?aff=39372)

<sub>推广链接：通过此入口注册或购买，项目维护者可能获得佣金。服务与软件使用无绑定关系。可查看[官方套餐说明](https://justmysocks.net/members/cart.php)后自行选择。</sub>
---

![vvs-club Mac 应用界面](resources/vvs-club-preview.png)

把本地影片、网盘收藏和常用网站，收进一个顺手的 Mac 窗口。整理时专注媒体库，浏览时切换在线站点；想看的网址随手收藏，下次不用重新找。

[Mac 应用](desktop/macos/README.md) · [运行与配置](docs/OPERATIONS.md) · [反馈问题](https://github.com/stanlll-cloud/vvs-club/issues) · [上游与更新](UPSTREAM.md) · [English](README.en.md)

## 从收藏到播放，都有顺手的入口

### 专注整理的媒体库

进入媒体库后，外层导航自动收起，只留下完整的媒体库界面；点标题栏「返回主界面」即可退出。

连接硬盘、NAS 或已挂载的网盘目录，按人物、标签和作品资料浏览收藏。已有 NFO、海报和字幕可以接着用；缺少的信息按已配置的来源补充。扫描时不搬动原文件，改名、移动等整理操作另行执行。

影片版本、观看记录、收藏、筛选与播放偏好沿用 Peach 的本地媒体管理能力。远程来源需要你拥有相应账号和访问权；功能与限制见[运行文档](docs/OPERATIONS.md)和[来源说明](docs/SOURCING.md)。

### 常用网站，随手切换

左侧选择站点，右侧直接浏览。后退、前进、刷新、收藏和广告拦截集中在顶部；「×」关闭网页并回到首页，保留书签和登录状态。已配置的八个入口为 PigAV、JAVHDPorn、SpankBang、Pornhub 中文站、MissAV（中文与英文版）、Jable 和 xHamster；各有独立按钮，不会自动加载站点首页。

内置广告请求和广告位拦截。站内视频的新窗口留在应用中，跨站弹窗默认拒绝；盾牌可关闭广告规则。广告覆盖和播放器兼容性受站点变化影响，实际效果以页面为准。网页内容、账户与播放规则由原站提供。

### 喜欢的网址，收进书签

点顶部星形按钮，一键收藏当前网页。独立书签栏支持多层文件夹、改名、编辑网址、拖拽排序与移动；删除后可撤销。书签只保存在本机。

## 在 Mac 上开始

在安装 Apple Command Line Tools 的 Mac 上，从仓库根目录构建：

```sh
python3 desktop/macos/build.py
```

先按[源码运行说明](docs/OPERATIONS.md#从源码运行windowsmacos)准备仓库的 `.venv`，再打开生成的 `build/vvs-club-macos/vvs-club.app`。选择「本地媒体库」时应用会启动本机服务，首次使用进入可视化设置。「扫描本地」可直接选文件夹；「连接网盘」进入登录授权与云端目录选择，高级入口仍可使用同步或挂载目录。

Mac 外壳按当前机器架构构建，并连接构建时所在的源码与 `.venv`；这两个目录须保留。它没有内置独立 Python 运行时、FFmpeg 或媒体文件，暂不能只复制 `.app` 到其他 Mac。完整便携安装包、Developer ID 签名、公证与自动更新尚未提供。原项目下载站提供 Peach 原版，不是 vvs-club 的安装包。

网盘账号连接已改为「登录授权 → 选择云端目录 → 扫描影片」。五家网盘的连接代码已接入：百度、阿里、115 使用授权回调，夸克、TeraBox 使用官网独立登录会话。阿里、115、夸克已在本机显示已连接并取得文件列表；百度的新登录入口和 TeraBox 仍待真实账号验证，扫描与播放也需按具体文件实测。官网提供哪些扫码或验证码登录方式，以实际页面为准。通过本机 OpenList 连接，部分授权与令牌刷新经过其在线服务；高级入口仍可使用已同步／挂载文件夹。详情见[网盘账号连接](desktop/macos/CLOUD_CONNECTIONS.md)。

## 自己维护入口

网站名称与地址保存在 [sites.json](desktop/macos/sites.json)。新增一项后重新构建，即可添加侧栏按钮。项目不导入系统浏览器凭据，不把个人媒体、数据库或站点 Cookie 上传 GitHub。

本地媒体服务继承上游的配置与可选诊断机制，使用前应查看[诊断字段及开关](docs/DIAGNOSTICS.md)。Mac 外壳本身没有新增遥测服务。

## 跟进更新

[UPSTREAM.md](UPSTREAM.md) 记录已采用的 Peach 提交和定制范围。上游功能、修复和新版本先检查差异，再决定是否合入，避免覆盖 vvs-club 的名称、介绍与在线入口。运行中不会因定期追踪而自动替换软件。

## 来源与许可证

vvs-club 基于 [Peach](https://github.com/peach-mitao/peach) 的开源代码。Peach 原作者：Copyright (C) 2026 longmeidao。vvs-club 的改名文案与 Mac 外壳为本衍生版本的修改；不代表 Peach 官方发布，也与列出的第三方网站不存在官方合作关系。

项目遵循 [AGPL-3.0-or-later](LICENSE)。原作者声明、第三方标识、组件许可及[复用清单](docs/REUSE.md)保留。技术包名 `peach`、CLI、数据库和协议标识维持兼容，不作为产品品牌展示。

仅管理自行持有或获授权使用的媒体，遵守适用法律、版权和来源平台条款；第三方成人站点仅限达到法定年龄且当地允许的使用者。应用不提供媒体资源或付费内容访问权。

源码运行需要 Python 3.14 或更高；安装步骤见[运行文档](docs/OPERATIONS.md)。
