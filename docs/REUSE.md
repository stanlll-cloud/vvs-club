# 复用清单

## 任务历史关联清理

采用 RAAMENN 的 [PR #151](https://github.com/peach-mitao/peach/pull/151)，固定来源提交 `eb5f6b49210ed330c767166ea204103a8193250a`，许可证沿用本项目 AGPL-3.0-or-later。复用 SQLite 的 `SET NULL` 语义和删除触发器，在外键开关两种连接下维护父任务与根任务关联。当前迁移编号为 `0049`，只清空不存在的任务引用；任务内容、有效关联、活跃后继和媒体记录保留。隔离回归覆盖旧库升级、重放、批量删除回滚及跨任务类型后继，无新增依赖。

## 馆藏任务取消、范围与问题导出

取消复用 `ProcessingControl` 的本机原子记录、安全停点与 `BackgroundJob` 结算；`stopping` 等待在途工作退出，`cancelled` 保留结果并阻止自动恢复。安装暂停与用户暂停沿用原语义。新影片范围复用 `ScanResult.new_ids`、`filelock` 和原子 JSON，接回旧扫描检查点；启动时固定为已有的 `asset_ids` 请求，恢复不重新计算范围。退场资产仅退出当前重试集合，来源离线不按文件消失处理；归档只保存提示选择，不删除问题原文或任务历史。

问题导出采用 kevin552216 的 [PR #172](https://github.com/peach-mitao/peach/pull/172) 中 `issue-export.ts` 的分页 JSON 下载思路，固定来源 head `d1803c28e0b1a2a086d9756a67b0ec313387db29`，AGPL-3.0-or-later。Peach 增加日志内容摘要、总数和页偏移校验，拒绝同任务恢复时混合两份记录；旧完整 `issues` 数组可分页读取，缺失或损坏日志不伪装成空清单。复用既有 `useAction`、AbortSignal 和 Blob 下载，不采用该 PR 的单片重抓、字段保护和来源策略改动，无新增依赖。

状态文件写入沿用 `fsutil.atomic_write_text`。补入 FriendlyPasser 的 [PR #120](https://github.com/peach-mitao/peach/pull/120) 固定提交 `b586ff907aa01b48432e51b6101b7ce4bc7f8126` 的 Windows 读句柄验证，检查实际 WinError、读者关闭、完整 JSON 发布和临时文件清理；不增加另一套保存策略。

## 发布依赖接管来源

依赖清单复用 Dependabot 的独立 PR 差集，版本与完整依赖图由当前清单和锁文件确定。相邻修改保留主线消费者并重算锁；npm vendor 与前端包使用项目入口重建，许可证和来源记录随资源分发。接管器分别识别应用与 amane 桥的清单，并以实际接管提交确认完成；普通 PR 引用不构成采用。

| 来源 PR | 固定来源提交 |
| --- | --- |
| [#129](https://github.com/peach-mitao/peach/pull/129) | `f8899d626f8ef2b4f3c959eb7668ea3c25c56a16` |
| [#133](https://github.com/peach-mitao/peach/pull/133) | `28fb1b8d748183aeb1a912f7c9ef01d9c34cfe09` |
| [#147](https://github.com/peach-mitao/peach/pull/147) | `1c436adf6db7105b63306f06bea7f2f2653c50bb` |
| [#148](https://github.com/peach-mitao/peach/pull/148) | `6de7bd0767d68434297664597caa18e41601a878` |
| [#149](https://github.com/peach-mitao/peach/pull/149) | `eeed8f01cf935574398af2080114f29263fb6274` |
| [#179](https://github.com/peach-mitao/peach/pull/179) | `366740dae787c056762afd59c21400d060d1edb0` |
| [#180](https://github.com/peach-mitao/peach/pull/180) | `c352663209ced88201679727c87539ff12f41980` |
| [#181](https://github.com/peach-mitao/peach/pull/181) | `6611fc77d7ecac7c9e805b508e183a9468f99c28` |
| [#182](https://github.com/peach-mitao/peach/pull/182) | `7394cfeab955cbcb0640f57f10e93ae768045fc8` |
| [#183](https://github.com/peach-mitao/peach/pull/183) | `437f96d76c14c5fe0a00450a6b3a83b3731811d1` |
| [#184](https://github.com/peach-mitao/peach/pull/184) | `3e8960f79220fc29ffe68b5d7aff5ac9f9d88611` |

注册表稳定版本检查补充 FastAPI、Starlette、tzlocal、Sentry 构建依赖和 Python 镜像的更新。Pillow 的兼容与安全说明按[官方发行说明](https://pillow.readthedocs.io/en/stable/releasenotes/13.0.0.html)核对；运行依赖 amane 固定官方稳定版，并按[上游复核](reference-snapshots/upstream-review.md)适配登录失败分类。更新只替换代码、运行环境与构建资源；既有资料继续遵守原字段保护与升级修复契约。

源码与 wheel 的桥安装回执绑定完整依赖锁的 SHA-256；缺少标识或标识不符时，复用现有安装锁和 `uv sync --locked` 重建工具环境，并在离线类加载自检通过后写回执。同一 amane revision 的传递依赖升级也能生效；随包运行环境继续由构建入口按锁生成，不重置媒体、配置或资料。

主应用与独立桥环境共同固定 `curl_cffi 0.17.0`（MIT），采用[官方安全发行说明](https://github.com/lexiforest/curl_cffi/releases/tag/v0.17.0)中的内置 Brotli 1.2.1、证书库及 Windows 撤销列表修正。原生传输在测试中读取实际 libcurl 版本，核对内置 Brotli 的安全版本；Python 的独立 Brotli 包与 libcurl 自带的解码器分别验收。Peach 沿用现有代理、指纹、TLS 和来源边界，不引入 WebSocket 或账户能力。

## 全屏视频比例

采用 simon1561 的 [PR #155](https://github.com/peach-mitao/peach/pull/155)，固定来源提交 `7ee5f2d6e0da03983fe943cb8179bee69c4f5639`，许可沿用本项目 AGPL-3.0-or-later。全屏适配复用现有 CSS `object-fit: contain`，原生全屏、播放器全屏类、属性与 full-window 回退使用同一规则；页面外框、控件和媒体管线保持既有契约，无新增依赖。

社区浏览器用例核对源码及构建样式，在 4:3、16:9 与手机竖屏下检查全屏及退出状态。Windows 由现有完整浏览器入口执行，macOS 的独立入口只加载画面比例用例，不重复运行 Windows 那一份。代码及样式资源替换即可生效，无存量数据转换；视口模拟不代替折叠屏实机验收。

## 叶子证书密钥标识与存量补签

采用 peach-patcher 的 [PR #177](https://github.com/peach-mitao/peach/pull/177)，固定来源提交 `62927d4b975bdad3420ef214bc9330382a4233d6`，许可证沿用本项目 AGPL-3.0-or-later。运行期与两个 TLS 设置脚本复用 OpenSSL 的 [`subjectKeyIdentifier` 和 `authorityKeyIdentifier`](https://docs.openssl.org/3.0/man5/x509v3_config/#authority-key-identifier) 扩展，显式签入叶子证书；标准库 [`ssl.create_default_context`](https://docs.python.org/3.14/library/ssl.html#ssl.create_default_context) 的严格验证策略保持启用。现有签发工具随运行环境提供，无新增依赖。

`certs.reissue_reason` 将缺少 AKI 的叶子证书交给已有补签流程，CA 和已安装信任保持原样；合格叶子沿用 SAN 与到期判据。存量回归采用临时 CA、缺 AKI 的有效叶子、真实严格 TLS 握手和补签后重复检查，核对 CA 保留及叶子备份。社区用例按 OpenSSL 与 LibreSSL 的缺标识签发行为适配，不用跳过测试代替存量验证。未采用 mkcert 或新增 X.509 编码库，现有工具已覆盖签发能力，Peach 仅保留 CA 生命周期和补签策略。

SAN 读取使用两种工具均支持的 `x509 -text`；POSIX 设置脚本允许仅签发本机名称和回环地址，并以成功状态结束。两种签发脚本通过实际执行与严格握手回归验证，不依赖扩展配置的源码字串断言。

## 测试规划与阶段计时

`scripts/test_resume.py` 的 `ImpactPlan` 在一次恢复规划内缓存域集合、测试导入图与路径影响；调用方用当前快照创建计划，检查点输入改变时重新计算。`scripts/test_runner.py` 的 `local_batches` 统一快速检查、普通分片和内部并行容器的执行顺序，`scripts/test_run_progress.py` 的 `phase` 将阶段墙钟写入正式测试记录。沿用标准库与现有单项证明协议，不改变证明有效期、环境身份或完整批次要求。使用范围与计时口径见 [测试与 CI](TESTING.md)。

## 首次设置分步框架

首次设置、已有数据恢复与完成态共用 `frontend/src/react/pages/setup/setup-scene.tsx` 的分栏框架。媒体库卡片复用配置页的图标、来源色、处理方式及目录控件，访问范围使用 `ConfigurationChoice`。场景布局参考和来源见 [取证记录](reference-snapshots/arion-onboarding.md)，设备素材见 [素材说明](../resources/setup/README.md)。没有新增运行时依赖；提交、校验和源码文案编辑沿用现有入口。步骤标题、场景说明和操作区随步骤独立挂载，防止文案草稿映射串到其他步骤。

独立页面的编辑工具条共用 `components/selection-dock.css` 与 `batch-dock/batch-dock.css`，由 `pages/copy-editor-page.css` 将页面的 BoardUI token 对应到工具条 token，并为页面底部留出空间。编辑器核心及官网、演示站同步产物不涉及本次样式接入。

## 扫描路径冲突隔离

路径归组复用 Python 3.14 标准库的 [`PureWindowsPath`](https://docs.python.org/3.14/library/pathlib.html#general-properties) 与现有大小写口径，入库复用 SQLite 的 [UPSERT](https://www.sqlite.org/lang_upsert.html)、扫描检查点和单路径摄取入口，未新增依赖。两者均由现有运行时携带，许可与版本沿用运行时声明。路径相等不决定个人记录归属，Peach 负责将歧义组交给现有任务问题清单，保留每条身份及处置，只更新实际观察到的文件时间；不另建路径解析器或自动合并器。

隔离回归使用临时账本与目录，覆盖大小写和斜杠变体、个人记录保留、缺失文件、多根目录、断点配对和自动发现。真实 ledger 未用于修复演练，部署与报告者验收分别记录。

## 媒体库查询范围与详情类型

React 与应用层的 GET 入口共用 `frontend/src/core/library-scope.ts`：目录和筛选读取当前媒体库，调用方显式提供的 `library` 参数优先，空值表示全部媒体库。查询参数识别复用浏览器原生 `URLSearchParams`，不增加依赖或持久缓存。媒体库选择沿用整页导航，详情按资产 ID 查询并返回账本中的 `medium`，不从文件扩展名推断类型。两项契约随代码与构建资源替换生效，无需数据转换。

## 升级自动处理与更新提示

本地补修复用 `catalog_rules` 的用户识别规则、`field_owners.write_owned_fields`、r18 文字修复与复合别名拆分判据。两个维护脚本调用同一领域模块。结构迁移、SQLite 备份、文件锁和原子回执继续使用项目现有入口；后台复用 `TaskRunStore`、`FollowupRunner`、`Attempts`、来源冷却和影片处理检查点，未新增运行依赖。

派生图复用现有生成锁与原子替换，按规则、来源身份及文件代际记录签名。版本快照复用已有发行版检查与独立包安装状态；页面提示使用 BoardUI 和项目 Banner，文案编辑使用现有源码保存入口。脚本在独立维护源构建后经正式导出器同步，其元数据检查复用脚本管理器 API 和可信发布入口。运行方式与故障恢复见[升级后的自动处理](OPERATIONS.md#升级后的自动处理)，决策见 [ADR-0126](adr/0126-upgrade-effective-repairs.md)。

## 正式测试记录与中断恢复

测试结果继续复用 Python ≥3.14 标准库 `unittest`、`hashlib`、`json` 和项目的内容快照、影响域映射与外部测试结果。互斥复用既有 `filelock 4.2.0`，分片退出后回收其进程树复用开发依赖 `psutil 7.2.2`；版本与许可沿用锁定依赖及第三方许可清单，不新增运行时依赖。Peach 保留输入身份、逐文件覆盖、完成报告、批次来源和 `ready`／`integrate` 验收规则；串行、并行、浏览器与 Vitest 使用同一个恢复模型。

CI 跨作业恢复使用 GitLab Runner 19.5 的原生 [缓存](https://docs.gitlab.com/ci/caching/) 与 [`cache:when`](https://docs.gitlab.com/ci/yaml/#cachewhen)，保存正式证明 JSON，按作业、分支及保护状态隔离。缓存可缺失，Peach 仍负责内容、环境、时效与全量批次校验；不引入缓存 SDK 或独立证明存储。GitLab 克隆地址使用标准库 `urllib.parse` 保留仓库身份并规范化认证值，作业令牌及其密码别名按存在性参与环境身份。

候选比较包括官方 [pytest 缓存文档](https://doc.pytest.org/en/stable/how-to/cache.html) 与 [Turborepo 缓存文档](https://turborepo.dev/docs/crafting-your-repository/caching)。pytest 的失败项选择不能替代当前内容绑定的成功覆盖，不迁移测试框架；Turborepo 的任务缓存不能直接接管 Python 用例结果及集成门槛，不引入其运行时或源码。外部源码版本与许可证未作为采用依据，本次未复制这些项目的实现。

临时输入实证覆盖跨工作树运行时、安装锁 JSON、CI 运行信息、多域混合失败及多份记录搜索；行为回归覆盖失败与中断恢复、旧失败阻止成功恢复、原时间继承、外部文件完成证明、Python 容器后置检查及全量来源约束。运行时、实际依赖、共享夹具、未知输入、执行模式、过期或未来时间变化仍使相关证明失效。测试设施不读写真实 ledger。

## 媒体目录与整理路径映射

PikPak 整理复用项目已有 `PushDiscoverySettings`、`CloudPrefix` 与 `map_cloud_path`，与推送发现共用配置，不引入第二份盘符或 CloudDrive 路径表。CloudDrive RPC 继续使用现有固定版本的 gRPC／protobuf；路径归属与账号内 WebDAV 目录核验属于 Peach 的写入边界。不同盘符、子目录、云端名称、越界与冲突由临时夹具和模拟 RPC 验证，不触碰真实账号或账本。

Windows 系统卷通过系统原生 `GetWindowsDirectoryW` 获取，其他平台使用根卷。此改动没有新增第三方依赖；现有依赖版本与许可继续以 `pyproject.toml`、`uv.lock` 和下文登记为准。

## 文件名包装与补充回归

论坛 URL 包装与明确 BD Remux 尾部番号参考 [PR #123](https://github.com/peach-mitao/peach/pull/123)，固定 revision 为 `edde1fffb2c4690b7b78224dbd70dd7dfed786b3`，沿用本仓库 AGPL-3.0-or-later 许可。包装只解开一层，内部重用现有文件名与用户识别规则；Remux 的括号番号必须是唯一发行身份。普通处理后缀、日期分隔符和「番号＋片名」继续由既有解析器处理，不增加另一套处理词表或递归解析。

普通 HTTP 的浏览器和组件回归采用 [PR #119](https://github.com/peach-mitao/peach/pull/119) 的 `90d4972f9edf8b84dd866869a1a562cc7d1d24eb`；状态保存的短暂拒绝、持续拒绝和并发完整性回归采用 [PR #120](https://github.com/peach-mitao/peach/pull/120) 的 `b586ff907aa01b48432e51b6101b7ce4bc7f8126`。两者保留原作者署名，沿用同一仓库许可。正式随机标识继续复用 `core/random-id`；状态写入继续复用 `fsutil.atomic_write_text` 的同目录随机临时文件、十秒重试与失败清理，不新增依赖或真实 ledger 写入。

## SMB 媒体读写

采用 [smbprotocol 1.17.0](https://github.com/jborean93/smbprotocol/tree/v1.17.0)（MIT，Python ≥3.10，上游测试包含 Python 3.14 与 Windows、macOS、Linux）。固定传递版本见 `uv.lock`；库 wheel 约 128 kB，另有 cryptography、pyspnego 和平台认证依赖。`opensrc path smbprotocol` 未取得源码，改为核对固定 tag 的 `_pool.py`、`_io.py`、`open.py`、`connection.py`。

复用认证、协议消息与解析器、目录分页和偏移读写，以及 `SMBFileTransaction`、`set_info` 和 `FileRenameInformation`／`FileDispositionInformation`／`FileEndOfFileInformation`。Peach 保留固定根目录授权、绝对请求期限、取消、凭据隔离与媒体会话；整理和永久删除沿用既有计划、账本事务与失败恢复。目录条目的 `stat()` 会额外发请求，扫描消费枚举元数据；传输在库响应事件上施加期限，超时取消并断开独占连接。SDK 认证日志保持 WARNING，DFS 与重解析点拒绝。写入不覆盖改名目标、不跨声明根，写权限由共享服务器判定；工具用的回环 HTTP 仍只读。

未采用 fsspec，其 SMB 底层仍是 smbprotocol，无法替代媒体工具输入和取消；pysmb 的 SMB1/2 能力不覆盖同等 SMB3 需求。FFmpeg 原生 SMB 依赖二进制构建，本机工具没有列出该协议，因此使用 HTTP Range 回环桥。隔离回归覆盖认证、读取、并发偏移、配置与扫描配对；实际 FFmpeg 通过合成视频的尾部索引和 seek 抽帧。真实 NAS 吞吐和兼容性未取得，无真实 ledger 写入。

## 第三方标识的发行边界

`resources/marks/` 保存用于实体身份展示的内置标识，来源记录与文件哈希见同目录 `manifest.json`。来源可追溯不等于取得图片版权或商标授权，图片也不因与应用同仓库就自动适用 AGPL。

厂牌与事务所标识按 ADR-0026 随应用分发，包括裸文件、`icon` 和 `logo` 变体；`scripts/sync_brand_marks.py` 同步文件与来源记录。本机缓存、实体来源链接和缺图时的文字／首字回退由既有预览服务处理。

## GitLab 与 R2 发布

Windows 构建路径解析复用 PowerShell 7 的原生 [`GetUnresolvedProviderPathFromPSPath`](https://learn.microsoft.com/en-us/dotnet/api/system.management.automation.pathintrinsics.getunresolvedproviderpathfrompspath)；以当前 PowerShell 工作位置解析尚未创建的文件，无新增依赖或安装体积。安装更新验收使用 GitLab 官方[预定义变量](https://docs.gitlab.com/ci/variables/predefined_variables/)识别受保护版本标签及指定作业，沿用 Windows 注册表的既有安装检查。离线 PowerShell 回归覆盖进程工作目录与脚本工作位置不同的输入；主机检查覆盖受保护作业、未知作业与既有安装登记。

GitLab API、CI 认证和 Release 创建复用官方 [glab 1.124.0](https://gitlab.com/gitlab-org/cli)（MIT，维护中）；GitLab CI 的发布写入使用短期 `CI_JOB_TOKEN` 与官方 CI 自动登录。R2 的 S3 上传复用 [rclone 1.75.2](https://rclone.org/)（MIT，维护中），使用单桶对象读写凭据；版本文件不可覆盖，并由独立 HTTPS 下载校验 SHA-256。两者都是构建期 CLI，不进入应用运行时依赖。

演练产物晋级复用上述传输和 GitLab 作业 API；GitHub 通过官方 [Artifacts REST API](https://docs.github.com/en/rest/actions/artifacts)读取服务端摘要，再由标准库 `urllib.request`、`hashlib` 和 `zipfile` 下载、核验与展开。Peach 负责同一提交、版本、平台和验证任务的身份契约，以及已验收镜像的 image ID。媒体缓存沿用固定源码构建器，缓存二进制与对应源码，按实际构建输入和工具链核对，不新增缓存 SDK。协议与回收边界见 [ADR-0127](adr/0127-verified-release-artifact-promotion.md)。

GitGud 双存储副本复用同一版 glab 的原生 `packages upload` 与官方 [Packages API](https://docs.gitlab.com/api/packages/)，不另写认证或上传协议。Peach 只核对版本、文件名、大小与 `file_sha256`，复用相同内容并拒绝覆盖冲突；登记未完成最多检查三次。R2 下载表与 GitGud 备用资产链接使用不同的 Release 路径。未新增运行时依赖，离线回归覆盖首次上传、重复执行、内容冲突、未登记终止与双来源链接。

轻量安装器的 R2 优先与 GitHub 同版本回退复用 `standalone_update.download`、既有 HTTPX 和内置工具清单；每个来源分别验证大小与 SHA-256。发布后空缓存验收复用 `smoke_split_update.py` 与实际冻结程序的 `--installer-tools` 入口，不新增下载器或依赖。

`fetch_release_tools.py` 从固定版本官方发行站读取 SHA-256 清单，仅提取指定二进制。Python 标准库负责制品清单、版本与提交判据，不另实现 GitLab 认证、S3 签名或多段上传协议。Windows 与 macOS 的 CI 入口复用既有测试、构建和独立制品验收脚本。下载后端及费用边界见[运维说明](OPERATIONS.md#gitlab-发布与下载后端)。

CI 大产物中转复用相同的 rclone 1.75.2 与官方 [R2 S3 适配](https://developers.cloudflare.com/r2/examples/rclone/)，覆盖 Linux amd64、macOS arm64/x86_64 与 Windows amd64；MIT 许可，仅构建期使用。传输、校验和多段上传由 rclone 负责，Peach 只维护流水线身份、输出路径白名单、SHA-256 清单与桶容量预算。macOS 只传 DMG 和构建清单，展开应用保留在构建机器。GitLab job artifacts 只传 JSON 清单；Generic Package 的单文件配额不能保证前置代理接受同等大小的请求。官方 rclone 归档名称与校验清单按实际输入核验，大文件往返使用独立临时仓库验证，不将传输测试当作正式制品验收。无新增 Python 依赖。源码获取复用共享 User-Agent 与 Peach HTTPX 客户端，针对连接中断、超时及暂时性 HTTP 错误最多尝试三次，完成 SHA-256 校验后才登记缓存；可独立构建的对应源码包使用标准库 urllib，包含共享请求标识及其许可证。

细粒度凭据缺少公开 CI 元数据的读取权限时，发版查询可在官方 API 上进行一次匿名 GET，复用 HTTPX、Peach 代理与项目共用 User-Agent；不扩大凭据权限，也不携带本机认证头。私有资源仍须通过服务端权限检查。

外部 HTTP 请求的连接策略复用 `peach_proxy.client_options`，客户端使用固定的 HTTPX 0.28.1（BSD-3-Clause）与 curl_cffi 0.16.3（MIT），没有新增依赖。共享 `HttpxTransport`、浏览器指纹传输、字幕、PikPak、更新、模型与维护脚本使用同一策略；libcurl 通过 `NOPROXY` 明确表达直连及自定义代理，避免继承相反的环境例外。Sentry 2.72.0 的事件、限流与回执仍由 SDK 维护，最终请求复用 HTTPX，保持测试禁发、无重试和无重定向。临时本机代理验证两种传输的实际请求路径；下载大小、SHA-256、重试次数和独立源码归档继续由行为回归核对。无需引入额外代理库或全局改写第三方网络函数。来源显式直连、网盘挂载、本机控制接口和独立工具的边界见[来源连接设置](SOURCING.md)。

npm 安装沿用 Node.js 24 LTS 附带的官方 [`npm ci`](https://docs.npmjs.com/cli/v11/commands/npm-ci/)，锁文件与完整性校验由 npm 维护。`npm_ci.py` 复用既有 `npm_audit.py` 的有限重试方式及 Python 3.14 标准库 `subprocess`（PSF 许可，无额外安装体积），只为明确的 `ECONNRESET`、`ETIMEDOUT`、`EAI_AGAIN` 下载错误重试，最多三次；锁文件、完整性与生命周期错误保留失败。Linux、Windows、macOS CI 和 Windows 打包入口共用此策略，不重试测试失败、不变更包版本。真实锁定安装与注入失败回归覆盖成功、重试耗尽和非网络错误，无新增应用依赖、生产入口或账本改动。

## 真实样本界面预览

用户验收预览复用项目记忆登记的真实账本小样本和已有缓存。启动入口强制调用 `scripts/check_ui_preview.py`，使用标准库 SQLite 的只读连接核对作品、实体、关联和来源清单，产出样本内容摘要；通用契约见 `docs/UI_PREVIEW.md`。核验与图像查看分别记录，隔离自动化测试夹具保留在测试范围内。没有新增依赖或生产数据写入。

## 采集磁盘预估

采集磁盘预估复用 `ProcessingTraffic`、`TrafficPlan` 的待执行与完成范围，以及 `typical_size` 的本地缓存采样。`processing_storage` 仅用 Python 标准库 `shutil.disk_usage` 和文件系统设备编号合并同盘、分别核对跨盘容量；输出读数由现有 `TrafficProgress` 同时用于启动弹窗、运行任务卡和任务通知。网盘挂载缓存保持未观测状态，不把流量数直接算成最终磁盘产物。无新增依赖。

## 状态与同步弹窗

全站滚动区通过 `observeScrollRegions` 按实际 `overflow` 接入现有 `attachOverlayScrollbar`，动态新增子树、样式启用和响应式布局复用同一入口；样式读取与轨道写入分批，行内样式变化只复核当前元素。普通内容区使用同级轨道，定位浮层与原生顶层内的轨道保持在自身层级并补偿滚动位置。组件卸载释放监听、观察器及轨道。横向手势导航保留 `wireHorizontalScroller` 的拖动和渐隐。路由冒烟统一检查所有实际溢出的滚动区，搜索回归覆盖滑块拖动、滚轮、关闭重开和轨道数量。没有新增依赖。

来源筛选与所有表格的显示列弹层共用 `SelectionPopover`，组合现有 React Aria `Popover`、`MenuDialog`、BoardUI `Checkbox` 和按钮。宽度由选项和操作组的内容决定，并受视口上限约束；长选项在限宽内折行。选项靠近触发器，批量操作根据 React Aria 的实际展开方向放在远端，DOM 顺序随之调整。`SelectionActions` 区分短操作并排与长操作铺满整行；来源筛选附带箭头的 `LinkButton` 凭据链接，列设置保留显示全部和默认显示。复核作品样本的全选、清空也复用同一操作条，保留计数及禁用条件。颜色配色器与人物说明浮层的交互含义不同，继续使用各自组件。没有新增依赖。

关注管理使用「关注列表」「添加关注」两个页签。列表复用 `FeedSources` 管理 JAV 订阅，添加页复用 `AddFeed` 的演员卡查询、用户点选与 `follow-name` 写入契约；共享 `FEEDS_KEY` 缓存，开关、移除及拉取各走原接口。来源筛选顶部统一提供凭据设置链接。JavDB 登入页判据复用 `javdb.LOGIN`，主页面与单体作品补拉共用解析入口。脚本检测在桥接文档加载后等待同源回报，加载与回报均有时限；权限指引依据 [Tampermonkey 官方 FAQ](https://www.tampermonkey.net/faq.php#Q209)。没有新增依赖。

连接状态复用 BoardUI `StatusDot` 与 `ConnectionStatus`，圆点和文字保持同一色系；成功为绿、检测中为蓝、离线或待配对为黄、失败为红、未知为灰。稳定任务结果和配置状态复用 `Chip`，由 `StatusLabel` 统一成功、进行、警告、失败和中性状态。暂停状态优先于历史错误；未经检查的来源保持未检查。用户脚本检测与功能启用分开呈现，仍由同源桥接协议核对版本、nonce 和配对回报。HTTP 状态颜色仅表示本次访问结果，删除仍以服务端确认失效的清单为准。

`formModal` 与 `confirmModal` 共用正文覆盖式滚动条，标题及底部操作固定；启动预估的来源明细跟随弹窗正文滚动，运行通知的明细维持独立限高。全部沿用已有组件、主题 token 和依赖。

## 元数据标题原文

持久元数据候选复用 `metadata.extract_peach_fields` 的原文取值和 `metadata_auto_apply` 的统一写入入口。r18 的纯拉丁字母标题需由同一作品快照的原文侧精确印证；缺少快照或只有英文译文时不进入自动结算，人工批准入口同样拒收。来源原文中的拉丁字母片名保留，不按字符集自动翻译。无新增依赖。

## 用户脚本的本机取证与进度

用户脚本的请求错误复用 Tampermonkey GM 存储与 `GM_xmlhttpRequest`，服务端复用 `error_reporting.local_event` 的脱敏与 `support_bundle` 的日志导出。独立的 `userscript` stage 仅写本机；受限字段、体积、频率和去重属于 Peach 协议策略，不接入外部遥测 SDK，不增加依赖。队列锁只保护内存与本机状态，网盘提交在锁外执行，提交幂等仍由现有 DownloadService 的共享提交锁处理。

脚本进度由 DownloadStore 的真实任务投影提供，复用 `STATE_LABELS` 与 `POSTPROCESS_LABELS`，不回传磁力、路径或网盘凭据。整体进度组合生产 `frontend/src/react/components/progress.tsx` 的 SVG、6px 高度、100 份比例和刻度，与 `library-processing/library-processing-notice.tsx` 的完成标记和当前阶段语义；BoardUI 明暗主题配色为同许可快照，固定来源为 Peach `44c347573e47cdd3b2294d35719f363ee5305246`。下载段仅填充实际百分比，其他段按里程碑推进；脚本保持零运行依赖，不嵌入 React。

## 浏览器错误的构建映射

前端复用官方 [`@sentry/vite-plugin` 11.8.0](https://github.com/getsentry/sentry-javascript-bundler-plugins)（MIT，维护中，Node ≥23.2，与项目 Node 24 和 Vite 8 兼容）生成确定性 Debug ID 与 hidden source maps；[`@sentry/cli` 3.8.0](https://github.com/getsentry/sentry-cli)（FSL-1.1-MIT）仅用于构建期本地定位和显式上传。两者精确固定在前端开发依赖，纳入现有 Dependabot；不进入 Python 运行时或独立包依赖。

`frontend/scripts/sentry-build.ts` 只保留 Peach 的公开／私有目录边界与产物匹配检查。官方插件禁用遥测、自动上传与 release 注入，普通构建不需要凭据；私有目录保存 JS/CSS/maps，公开目录只复制四个正式 JS/CSS。显式上传复用官方 CLI，先核对分发字节和 map 身份。没有实现自定义 source map 编解码器或上传协议，也没有为此引入浏览器 SDK、页面回放或性能采集。

回归使用真实 Vite 构建与官方 CLI 本地解析 source map，验证源码文件和行号；相同输入两次构建的文件字节一致，Debug ID 与 map 对应，映射源只使用相对路径。构建体积由 Vite 输出，source maps 只增加私有构建产物，不增加页面分发体积。字段与发布配置见[诊断核验](DIAGNOSTICS.md#可选远程诊断)；真实接收端符号化独立验收。
## 索引标题栏

标签、艺人、卖家、厂牌与事务所共用 `IndexPage`、现有 BoardUI Input／Button、收藏入口和版式分段器。标题与操作保留固定宽度，搜索框使用原生 Flex 的剩余空间；窄屏名册计数独占次行。首屏占位复用 `islandSearchInput`、`islandButton` 与相同布局规则，标签管理入口也预留真实尺寸。浏览器几何回归覆盖 320px 至桌面、断点两侧，以及本地／在线和管理模式。没有新增依赖、API 或 ledger 写入。

## 作品卡片与推荐理由

目录、实体作品区、竖屏条与接着看复用 `MediaCard`。多列网格统一卡片高度，`MediaGrid` 沿用现有 `ResizeObserver` 和 `gridTemplateColumns` 测量方式，单列按实际内容定高。元信息保持一行，容器查询按扣除头像后的文字区宽度决定日期、共演人数与体积的显隐。普通卡片保留最多五枚共演头像，常态按实际紧叠宽度占位，在 45px 至 109px 之间随卡宽压缩。悬停与键盘聚焦时头像浮于文字上方展开并抬起对应头像，不预留展开空间，标题列位置保持稳定；占位文字始终居中，图片沿用原有头像取景。接着看和竖屏条保留两枚头像，新作卡片复用同一几何。稍后看复用已有动作回调、撤销回执与中性填充 token，同步按钮和卡片底色，不渲染状态色块及观看次数。

接着看的推荐理由独占两行，完整内容使用已安装的 React Aria Components 1.22.1（Apache-2.0）`Popover`／`Dialog` 与现有 BoardUI 浮层样式展示，触屏、键盘与鼠标共用同一入口。没有新增依赖、API、迁移或 ledger 写入。

## 空状态与操作入口

React 页面复用 `EmptyState`，HTML 页面复用 `emptyStateHtml`。图标统一为 32px、图标框为 54px；标准区域最小高度为 320px，紧凑区域为 240px，字体、背景和边框共用。统计页上下区域采用标准尺寸。空状态按原因提供添加内容、清除筛选、重试或返回浏览等操作；正常完成状态不增加操作。

已有添加表单使用 `EmptyFocusButton` 聚焦原输入框。筛选清除保留当前页面、版式和本地或在线范围。关注检查复用 `useBackgroundJob` 与 `startCheck`；实体页仅提交该实体绑定且有效的来源 ID，不以空 ID 列表发起全量检查。没有新增依赖或自动采集任务。

同页页签切换调用页面已有状态与地址回调。站内锚点链接由 `navigationLinkPath` 按 `routeMetaOf` 的路由登记统一交给客户端导航；下载、外站、新窗口、修饰键及普通页内锚点保留浏览器行为。不按按钮文字或某条固定地址单独拦截。

## 标签身份与管理

标签浏览与管理复用 `DataTableFooter` 和既有页码算法，每页默认 100 个，可选 50、100、200 个；`useTagPagination` 统一筛选重置与页码边界。搜索输入复用 `IndexSearch`，标签正文与页脚的占位复用 `tagSkeletonHtml`。本地和在线详情的选择器通过 `useOverlayScrollbar` 接入既有覆盖轨道，搜索标题与滚动正文分层，不新增依赖。

标签复用 `entities.merge_entity`、实体别名、兼容投影、SQLite 事务及在线备份。字符宽度归一使用 Python 标准库 `unicodedata.normalize('NFKC', ...)`；同义词和用户别名属于 Peach 的身份规则。当前树、标签改名脚本与 Git 历史提供了关系迁移能力，无需引入通用模糊匹配库；语义近似不足以自动合并。隔离用例覆盖重叠关系、来源证据、隐藏偏好、旧名入库、过期计划和备份。

页面复用已安装的 React Aria 1.22.1、BoardUI Button/Input/Select、标签云和选择操作条。编辑字段沿用同步任务表单的 React portal 接法，外壳共用 `formModal` 与 `confirmModal`，按顺序打开。没有新增依赖。

在线标签复用 `profiles.read_settings` 与 `profile.settings_json` 保存本机名称、来源词成员和隐藏状态；账本版本触发器负责缓存失效，无新增表。读取投影复用 `_follow_tag_index` 的发布组计数和来源类型，标签索引、关注卡片、详情、筛选项与旧名查询共用 `OnlineTagPolicy`，不改写来源 metadata。合并限制在相同来源类型；事务、影响范围预览、过期计划和备份复用标签管理端点。归类属于 Peach 的用户决定，不引入模糊匹配或外部同义词服务。

在线标签收藏复用 `FavoriteButton`、`libraryShortcuts` 设置和既有读写端点，以 `scope=online` 与稳定来源词键区分本地实体；收藏快照经在线归类解析并去重。收藏面板沿用标签分类，以「在线标签」标明去处，链接打开 `/follow` 标签筛选；馆藏实体收藏快照继续供研究和实体标注使用。未新增依赖或存储表。

在线手动标签与内容屏蔽复用 `OnlineTagPolicy`、`profile.settings_json`、`FollowStore.group`、现有标签预览确认端点及账本版本缓存。手动标签以来源和内容编号定位，在读取副本中叠加；来源 metadata 保持独立。内容屏蔽在分页、计数及来源筛选前按完整作品组执行，任一版本命中就隐藏整组；直接详情保留标签管理入口。当前树、标签偏好与 Git 历史已有身份和事务能力；新增部分只定义 Peach 的用户选择与影响范围，无需外部规则引擎或模糊匹配依赖。界面沿用 BoardUI Input／Button、`useAction`、标签云和 `SelectionDock`，无新增依赖、存储表或迁移。

## 检查输入与源码文案

测试差异复用 Git 文件快照、Python AST、标准库 TOML/JSON 解析器及现有 filelock。Python 注释和清单说明字段通过有效内容比较识别；真实依赖、执行模式和无法解析的输入保留完整验证。完整批次按测试文件保存结果，仅补齐受影响范围，不延长结果有效期。

JS/TS 文案复用 [Oxc parser](https://oxc.rs/docs/guide/usage/parser)，开发依赖固定 `oxc-parser@0.154.0`，MIT 许可，来源为 [Oxc 官方仓库](https://github.com/oxc-project/oxc)。项目 Vite/Oxlint 工具链已有 Oxc；独立 Node 检查器解析注释、字符串、模板与 JSX，不进入应用运行包。前端源码解析错误为零。Tree-sitter 的试用在具名元组成员与 JSX 查询参数处产生错误，未采用；不新增 Python 解析器依赖。中文和英文判据集中于 `scripts/copy-rules.json`，含糊词语只提示人工核对。

## macOS 独立构建

macOS 发行包复用 Windows 固定的 FFmpeg 9.0.2、x264、dav1d 1.5.4 和 untrunc `9d86ec9` 源码锁、下载 SHA-256 校验与 `media_tool_bundle.validate`。untrunc 单独静态链接兼容的 FFmpeg 8.1.3；其 [上游 Makefile](https://github.com/anthwlock/untrunc/blob/9d86ec9ef2ffed1bf8131abe80742c0574db52b6/Makefile)提供 macOS 编译依据。头文件用 `-idirafter` 保留 C++ 标准头 `version` 的优先级。FFmpeg/x264 按 GPL-3.0-or-later、dav1d 按 BSD-2-Clause、untrunc 按 GPL-2.0-or-later 分发；完整对应源码归档包含全部上游源码、构建脚本和许可。Peach 仅维护目标架构、静态库组合、清单与拒收判据，不复制 Homebrew dylib。macOS 编译启用 VideoToolbox、AudioToolbox 与 Secure Transport，硬件转码选择仍服从已有产品策略。

编译工具复用 Meson 1.12.1（Apache-2.0）、Ninja 1.13.2（Apache-2.0）、pkgconf 3.0.7.post0（ISC）和 NASM 3.02（BSD-2-Clause），由 `setup_macos_media_tools.py` 安装到构建目录，应用运行无需这些工具。源码提供完整配置，两个架构分别编译；Intel 二进制可在 Rosetta 下验收，但不能视为 Intel 真机测试。对应源码与二进制的体积、架构和系统最低版本由实际产物核对。

cloudflared 采用 [Cloudflare 官方 2026.9.0 发行](https://github.com/cloudflare/cloudflared/releases/tag/2026.9.0)的双架构归档（Apache-2.0）；固定资产 SHA-256 读取官方 Release API 的 `digest`，与发布正文中的旧摘要分别核对。Peach 保留下载校验、包内查找、ad-hoc 签名与进程归属，不新增隧道协议。原生验收运行 `--version`，不因此宣称已连通公网隧道。没有新增 Python 应用运行依赖；合成媒体验收与临时目录不接触真实 ledger。

Windows、macOS 与 wheel 通过 `bundle_resources.data_files` 共用桥脚本、依赖清单和锁文件。桌面制品额外使用项目已有的 PyInstaller 6.22.3 构建独立 amane 运行环境；Docker 在构建阶段按同一锁预装独立 venv。两者随附固定 revision、版本与可执行文件清单，保持子进程边界。源码与 wheel 在首次实际需要时通过 uv 按锁自动安装到数据目录，安装锁复用 FileLock，下载代理复用 Peach 代理并通过子进程环境交给 uv 与 Git。资源定位复用 `settings_file.PROJECT_ROOT`，覆盖源码、wheel 的 `_resources` 和 PyInstaller 的资源根。打包机制沿用官方 [PyInstaller 数据文件约定](https://www.pyinstaller.org/en/stable/runtime-information.html)与 [uv 环境目录配置](https://docs.astral.sh/uv/concepts/projects/config/#project-environment-path)，不新增应用依赖。分发决策见 [ADR-0124](adr/0124-amane-runtime-preparation.md)。

独立应用复用项目已有的 PyInstaller 6.22.3（GPL-2.0-or-later，带发行例外），由 macOS 原生 bootloader 承载 Python 3.14 与 Cocoa 菜单栏，资源与 CLI 入口沿用现有桌面实现。镜像使用系统自带的 `hdiutil`，无需新增运行时依赖。构建与签名依据 [PyInstaller macOS 文档](https://www.pyinstaller.org/en/stable/usage.html)和 [Apple 分发文档](https://developer.apple.com/documentation/xcode/packaging-mac-software-for-distribution)。

Peach 负责独立数据目录、首启、构建身份和资源清单。arm64 与 x86_64 使用各自的 Python 和原生扩展，按 [PyInstaller 架构约束](https://pyinstaller.org/en/stable/feature-notes.html#macos-multi-arch-support)分别生成；不使用 lipo 合并冻结程序。应用不安装系统组件，采用 DMG 拖放安装；PKG 的系统级安装流程不属于这条路径。源码运行的 LaunchAgent 外壳继续使用自己的构建入口。独立制品的启动与读写验收使用隔离数据目录，不改变真实 ledger 或双机配置。

## 硬件转码后端

macOS 复用 FFmpeg 的 VideoToolbox H.264 编码及 H.264、HEVC、AV1 解码，沿用现有 `HardwareTranscoder` 的合成帧探测、命令尝试顺序和软件回退；不新增视频框架或 Python 运行依赖。`-allow_sw 0` 要求编码器实际使用硬件，AV1 硬解显式选择 FFmpeg 原生解码器，软件回退继续使用 dav1d。依据 [FFmpeg 硬件解码选项](https://ffmpeg.org/ffmpeg.html#Advanced-Video-options)和当前固定源码中的 `videotoolbox_av1.c`、`videotoolboxenc.c`；具体可用能力依赖设备与系统，不按 Intel 或 M 系列名称推断。抽帧的编码格式探测复用 `media_probe.probe_file`，按文件世代有界缓存，失败后在同一超时预算内软解。两种加速偏好复用 `media-processing.json`、`FileLock` 与原子写入，抽帧与播放各自保存；服务端新任务读取本机偏好，不调整浏览器解码器，不更改 ledger。桌面和手机自动化回归验证独立切换与保存恢复，合成片分别验收硬件可用路径及失败回退。

## HLS 请求断开清理

断开监听与子进程回归采用 [PR #122](https://github.com/peach-mitao/peach/pull/122) 的固定提交 `b49806a8685e128088a3c4825891fd425e279db1`，沿用本仓库 AGPL-3.0-or-later 许可与原作者署名。Peach 保留主线的会话校验、硬件后端和转码异常契约。

HLS 分片请求复用 Range 传输的 ASGI 断开监听、Python 3.14 的 `asyncio.wait` 与既有 `HlsSegmentService._run` 清理：请求断开时取消该请求的生成任务，终止并等待子进程退出，再移除临时分片。取消以单个请求为单位，同一播放会话的其他请求可继续生成；排队请求退出后不启动转码。

进程管理沿用标准库的 [`asyncio.subprocess`](https://docs.python.org/3.14/library/asyncio-subprocess.html)（PSF 许可，无新增安装体积），不引入进程扫描库或 FFmpeg 命令包装层。当前树、REUSE 与 Git 历史的复用检索确认，分片和整片已具备会话取消，断开监听由传输层提供。临时文件与真实 Python 子进程回归覆盖断开退出、并发隔离、排队取消及同会话重试；macOS 的临时 HTTP 服务用合成 HEVC 和 FFmpeg 8.1.1 实测，断连后子进程退出、临时分片与登记清理完成。Windows 报告环境与真实 GPU 播放验收未取得。无新增依赖、生产入口或真实 ledger 写入。

## 播放转码的硬件选择

整片 MP4 与 HLS 复用现有 FFmpeg 的 CUDA / NVENC、VAAPI、`scale_vaapi` 与 `hwupload`，不引入 Python 命令包装库。Windows 发行工具固定为 FFmpeg 9.0.2（GPL-3.0-or-later，来源清单见 `scripts/ffmpeg-sources.json`）；Linux 镜像使用 Debian trixie 的 FFmpeg、`mesa-va-drivers` 与 `vainfo`，随 Debian 安全更新取得版本，不另行复制驱动代码。Mesa 按上游各组件许可证分发，驱动增加的镜像体积由构建决定，AMD 需要宿主机 amdgpu 与固件。设备参数和硬件解码接口依据 [FFmpeg 官方文档](https://ffmpeg.org/ffmpeg.html#Advanced-Video-options)，驱动范围依据 [Debian VAAPI 说明](https://wiki.debian.org/HardwareVideoAcceleration)。

Peach 只保留设备选择、一次性合成帧探测、命令尝试顺序与失败回退；探测结果由两个服务共享。复用检索覆盖当前 NVENC 链、媒体工具解析器与 Git 历史，没有独立 VAAPI 路径。FFmpeg 已覆盖编解码与滤镜，ffmpeg-python 一类包装层不提供设备驱动或硬件可用性判定，因此沿用项目 subprocess 入口，不新增 Python 依赖。回归用合成输入与进程替身验证 Linux 节点选择、权限和超时、10-bit 转 NV12、整片及分片回退。2026-10-19 的 Windows NVENC 实测使用 640×360 合成帧完成探测，合成 10-bit HEVC 经整片 MP4 与 HLS 两条 CUDA / NVENC 路径输出 H.264 `yuv420p`；128×128 不满足该编码器的最低尺寸，因此探测统一用 640×360。目标 AMD GPU 的驱动初始化、解码与播放验收未取得。无生产入口或真实 ledger 写入。

Windows 复用 FFmpeg 的 D3D11VA 解码与 `h264_amf`、`h264_qsv` 编码，沿用同一套合成帧探测与回退顺序，不新增依赖。D3D11VA 不指定 `-hwaccel_output_format`，解出的帧回到内存，能接任意编码器，只对 H.264、HEVC、VP9、AV1 开启，名单与 CUDA 相同。AMF 从 D3D11 设备派生上下文，只认 AMD 显卡；混合显卡机器的默认序号常是另一块卡，所以用 `-init_hw_device d3d11va=peach:N` 加 `hwupload` 按序号探测，派生失败时退回软件解码加 AMF。Media Foundation 的 `h264_mf` 在 NVIDIA 加 AMD 的实测机器上无论软硬解码都报 `MF_E_UNSUPPORTED_D3D_TYPE`，未接入。QSV 从 D3D11 派生的写法没有 Intel 显卡可验，只接软件解码加 QSV 编码，探测通过才使用。

随包 FFmpeg 编入 NVENC、AMF、QSV 与 D3D11VA，四条路径都不依赖 PATH 上的第三方构建。AMF 只需 GPUOpen 发布的 `AMF-headers` 头文件包，运行时由 AMD 驱动提供 `amfrt64.dll`；QSV 经 FFmpeg 的 `--enable-libvpl` 接入，libvpl 调度器用 MinGW 编成静态库，运行时由 Intel 驱动提供实现。两者都是 MIT 许可，固定版本和哈希写在 `scripts/ffmpeg-sources.json`，许可证随发行目录与对应源码包分发，整体仍按 GPL-3.0-or-later。交叉编译做法参照 [BtbN/FFmpeg-Builds](https://github.com/BtbN/FFmpeg-Builds) 的 `50-amf.sh` 与 `50-onevpl.sh`：libvpl 的 C++ 调度器静态链接时要带 `libstdc++`，Peach 在 CMake 里给它未定义的 `CXX_LIB` 赋值，让生成的 `vpl.pc` 自带这一项，不改写安装后的文件。2026-10-23 在 Ubuntu 24.04 容器里按发布流程的同一组软件包跑通 `build_ffmpeg_windows.sh`，产物列出 `h264_amf`、`hevc_amf`、`av1_amf` 与 `h264_qsv` 等编码器，`-hwaccels` 含 `cuda`、`dxva2`、`qsv`、`d3d11va`、`amf`，发行包校验通过。在 NVIDIA 独显加 AMD 核显的 Windows 机器上，随包构建的 `h264_amf` 与 `h264_nvenc` 都完成 640×360 合成帧编码，D3D11 序号 1 上传加 AMF 可用、序号 0 报 `No such device`；Peach 自动探测得到 NVENC、AMF（序号 1）与 D3D11VA。该机没有 Intel 显卡，`h264_qsv` 报 libvpl 找不到实现（`MFX_ERR_UNSUPPORTED`），探测按预期跳过；QSV 实际编码未取得。

2026-10-23 在 NVIDIA 独显加 AMD 核显的 Windows 机器上，用 gyan FFmpeg 9.0.1 对 20 秒 1080p 10 位 HEVC 合成片测进程 CPU 时间：纯软件解码 21.9 秒、D3D11VA 解码 1.6 秒；libx264 转码 62.0 秒、D3D11VA 解码加 libx264 41.9 秒；软件解码加 AMF 23.3 秒、AMD 序号上的 D3D11VA 加 AMF 3.4 秒；CUDA 加 NVENC 0.7 秒。单帧抽帧在同一片源上从 7.7 秒降到 0.7 秒。整片与 HLS 经自动、AMF、仅 D3D11VA、软件四种配置输出的都是 H.264，时长与片源一致。

## 文件名噪声清理

整理模板与 `scripts/clean_names.py` 共用 `organize_templates.clean_name_symbols` 和 `clean_filename`。字符分类复用 Python 标准库 `unicodedata`，按 Unicode 类别清除装饰图形、emoji、替代字符、控制字符和私用区噪声；Peach 保留常用标点、文字组合音标、单位、算术符号、扩展名与空名称保护。不新增依赖。

外部候选核对了 [pathvalidate 的文件名清洗](https://pathvalidate.readthedocs.io/en/latest/pages/examples/sanitize.html)与 [ftfy 的编码修复](https://ftfy.readthedocs.io/en/latest/)。前者主要处理文件系统非法字符，其通用符号替换还会删掉番号连接号和扩展名句点；后者通过启发式还原编码，超出本次删除噪声的范围，因此不引入。隔离用例覆盖装饰符号、复合 emoji、不可见字符、乱码替代字形、正常中日文与重音字母、空名称、重复执行和改名回滚；馆藏只读盘点与逐条预览保存在数据目录的复核产物中。

目录范围复用 `platform.resolve_root`、`location_mounts` 与标准库路径组件比较。界面复用 BoardUI Input、IconButton、已有 `FolderSearchIcon` 和 `/api/pick-folder`；预览、执行及后台任务恢复共用 `path` 参数，目录模板以所选目录为起点。空路径表示整个来源，目录边界按组件匹配，不按文本前缀匹配。

## 独立页面的请求反馈

请求错误文案复用 `core/request-error.ts`，实体登记复用 `core/entity-links.ts`。API 直接引用这两个模块，首启与登录页不加载主界面的路由和字素分段初始化；主界面仍通过 `core/index.ts` 导出同一份错误文案。冷启动导入回归核对 API 不构造界面分段器，既有反馈测试覆盖状态码、超时与服务端中文原因。无新增依赖。

## GitHub 项目看板

用户反馈归属应用仓库 `peach-mitao/peach`，维护者项目任务归属 `peach-mitao/peach-roadmap`，共同使用一个公开 Project。集中在应用仓库处理事件并每 6 小时补查规划仓库，凭据仅保留在应用仓库。Issue 关联使用仓库名与编号，迁移映射兼容已存在的关联行；交付版本始终按应用仓库的主线提交和发布制品核验。

看板同步复用 GitHub CLI 的已登录认证、GraphQL Projects API 和 Git 的提交祖先校验；不新增 Python 依赖。官方 [Projects Actions 自动化](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/automating-projects-using-actions)支持独立项目凭据，仓库默认令牌不能写组织 Project。项目原生状态工作流没有发布标签与制品归属判定；通用自动加卡 Action 也不覆盖验收和发布的分别记录，因此由 `scripts/project_board.py` 保留 Peach 的状态规则，传输与认证交给系统已安装的 `gh`。运行依赖是官方维护、MIT 许可的 GitHub CLI 和 GPL-2.0 Git，使用 GitHub 托管 runner 内置版本；本机只读 GraphQL 与标签祖先验证后再应用。无生产服务、ledger 或媒体写入。

## JAV 用户脚本添加

下载渠道复用 `media_sources` 注册表、媒体库名称、`clouddrive_proxy.media_remote_path` 的挂载与推送路径关联，以及现有 CloudDrive2 gRPC 客户端的 `canOfflineDownload` 与 `supportOfflineDownloadManagement` 能力。`LibraryChannels` 在只读探测后生成渠道，PikPak 直连仍使用已有客户端；配置区与专属检查按已声明媒体来源显示。支持任务管理时查询远端列表，仅支持提交时按文件落地确认；取消按钮随渠道能力显示。挂载点关联复用 `CloudPrefix` 和 `map_cloud_path` 完成入库路径转换。渠道标识与媒体来源分别用于提交和落地后处理，未新增依赖、账本表或迁移。账号未实际验证时不把模拟能力视为网盘验收。版本要求与安装入口由上游发布清单传给配置页；配置页安装当前 Peach 随附的同版脚本。

用户脚本由 [peach-mitao/peach-userscript](https://github.com/peach-mitao/peach-userscript)（AGPL-3.0-or-later）独立维护，使用 [Tampermonkey 官方 GM API](https://www.tampermonkey.net/documentation.php) 的本机存储、菜单与 `GM_xmlhttpRequest`；SPA 通知依据 `window.onurlchange` 契约。上游使用 Node.js 24 LTS 内置模块确定性构建，运行时零依赖。Peach 的 `web/integrations/` 消费同一发布的完整安装脚本与站点快照，固定版本、上游提交与 SHA256 见 `jav-userscript-release.json`。安装端点直接返回制品，后端独立校验已登记域名与作品参数；上游导出工具在隔离工作树同步这两份制品和来源记录。Sleazy 热门脚本只提供显式域名与镜像发现证据，不复制其实现或执行第三方代码。宿主扩展由用户安装，兼容性以实际浏览器及脚本管理器授权为准；模拟 GM API 的真实 Chromium 页面完成回归，DMM 与 MGS 实页通过隔离只读 GM 适配核验番号、页面浮层与设置窗口。真实扩展、Peach 与网盘联合下载验收未取得。

Peach 保留页面粗提取与身份冲突提示，服务端复用 `catalog_rules` 的唯一番号规则、`feeds.scan_code`、`web_resource_search.q_resource_search` 的来源顺序与质量排序、`submit_offline_download` 的 infohash 幂等、现有云下载落地与后处理。浏览器添加在共享提交锁内按番号接管已有任务，覆盖其他入口同时提交不同磁力的情况。专用令牌经 `CredentialStore` 仅保存 SHA-256 摘要，不声明跨机同步字段。队列用已有 `atomic_write_text` 保存本机运行状态，关闭功能会撤销令牌并停止尚未提交的添加。

DMM / MGS 的只读商品号识别复用 `sources.dmm` 的 CID 结构与 `catalog_rules.release_code_from_product`。浏览器提交净化后的详情地址及可选厂家番号；DMM 的目录数字头按来源解释，MGS 保留三位发行前缀，尾字母和日期分隔符保留为身份。`release_code_from_text` 继续处理普通文件名的字幕与画质标记，不用文件名噪声规则改写明确商品身份。资源名称的完整商品号匹配复用同一编目模式，元数据身份校验与 DMM 搜索核对尾字母。运行时不新增 HTTP 请求或依赖；已有 DMM／OpenAver 取证与来源协议足以覆盖转换，不引入第二套外部番号库。完整脚本连接临时账本的真实识别接口，联合验证 DMM／MGS 桌面与手机场景；保留基于模拟响应的跨站交互回归。

配置页继续使用 BoardUI Button / Input / Select 与共享 Note。配对信息复用当前页面 origin、签发响应和浏览器 Clipboard API，脚本在用户粘贴时填表，保存后写入 GM 存储。同源子框架桥接只回报脚本版本和当前地址的配置状态，父窗口、origin、协议版本与一次性 nonce 均须匹配，不回传令牌。未收到回报显示「未检测到」，不推断安装列表。桥接路径窄匹配与来源站顶层注入分别处理；实际脚本管理器权限和扩展联合验收未取得。无新增运行依赖、迁移或 ledger 写入。

书签不能执行云下载链路；完整浏览器扩展增加发布与权限管理面；现有外部下载器不承接 Peach 的网盘目标、入库和后处理，因此未引入。临时账本与模拟 115／PikPak 的 API 回归验证搜索、重复点击、重启恢复、失败重试和凭据隔离；用户脚本及配置页通过桌面与 390×844 浏览器回归。无新增 ledger 表或迁移。

## 长跑任务的结果显示

资料采集与关注检查复用已有字段判据、事务和候选复核。全部本地 NFO 先读取并按影片提交；在线资料按来源返回时提交，候选 CSV 仍按时间合并落盘。关注列表的安全 partial 行与逐项详情分别保存，历史边界和整页游标沿用连接器规则。中断保留已提交结果，停止后不再落库。

显示层复用 SQLite `ledger_revision` 触发器、候选与图片目录版本，以及 TanStack Query 5.104.3（MIT）查询失效和任务轮询；不新增推送服务或依赖。应用根按结果版本刷新相关读缓存，任务心跳不使资料失效；慢请求期间的新版本排队，保留当前内容。资源同步扫描同时显示已完成来源，清理仍需完整扫描和确认。隔离账本、暂停的来源调用与手动放行的 Promise 验证中间结果可见及中断保留；无真实抓取或真实 ledger 写入。

## STRM 与挂载来源

诊断输出共用 `reporting_identity` 的环境身份和 `diagnostic_exceptions` 的有限错误分类。媒体 stderr 在通用路径脱敏前归类，SQLite 使用结构化错误码与固定原因类别；本机日志、支持包和远程投影按各自字段契约消费，不引入另一套错误监控 SDK。访问日志只放行固定技术路由与协议状态，查询串整体移除；其余路径继续复用通用脱敏。

任务恢复复用固定版 APScheduler 3.11.3（MIT）和标准库 `datetime.timezone.utc`，与现有关注调度器使用同一时区选择方式。一秒间隔检查不依赖本地 IANA 时区数据库；隔离回归令系统时区读取抛错，仍能创建调度器并注册任务。未新增依赖。

日志的实际主机时区名称复用 `tzlocal` 5.4.4（MIT，纯 Python，支持 Windows、macOS、Linux）的 `get_localzone_name()`，仅读名称，不为取证构造 `ZoneInfo`。该包已由 APScheduler 安装，直接使用处在主依赖中显式固定归属，无新增安装包；本地时间和 UTC 偏移复用 `datetime.astimezone()`，名称读取失败保留可用偏移。浏览器使用标准 `Intl` 与 `Date.getTimezoneOffset()`，与服务主机时区分别保存。

响应头策略复用 Starlette 1.8.0（BSD-3-Clause，项目已有固定依赖）的 `MutableHeaders` 与官方 [ASGI 中间件模式](https://www.starlette.io/middleware/#pure-asgi-middleware)，只在 `http.response.start` 阶段设置缓存、安全及机器人策略。文件响应继续使用同一 `receive` 的断连消息，真实异常直接传播，不维护异常文本匹配或统一忽略网络错误的分支。整片转码继续复用 FFmpeg 和现有回退链，Peach 只保留有界本机证据与隐私投影，无新增依赖。

本机诊断继续复用项目的脱敏日志与 ZIP 导出，浏览器使用标准 `canPlayType()`、MSE、Resource Timing 和有界的 [UA Client Hints](https://developer.mozilla.org/en-US/docs/Web/API/NavigatorUAData/getHighEntropyValues)，服务端复用 Python 3.14 标准库的依赖元数据、磁盘余量、系统信息以及现有媒体探测缓存。字段白名单和本机证据汇总属于 Peach 的诊断边界；浏览器监控 SDK 会扩大依赖与采集范围，不承担这条本机导出链路。依赖沿用 Video.js 10.2.0 与现有 FFmpeg，不增加运行时依赖，不为导出执行媒体读取或硬件压力探测。能力声明与真实播放的区别按 [MDN `canPlayType()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canPlayType) 和 [Video.js 媒体来源契约](https://videojs.org/docs/framework/html/guides/media-sources)核对，隔离回归覆盖无视频请求、编码能力缺失、错误状态、脱敏和仅本机写入。

STRM 采用文本指针、播放时解析的通用行为，参考 SmartStrm 文档、OpenList 的 `drivers/strm` 与 Jellyfin 的 STRM 探测入口；固定 revision、许可证与实际读取位置见 [取证记录](reference-snapshots/strm-source-evidence.md)。SmartStrm 核心闭源，源码未取得。Peach 独立实现受限 HTTP(S) 指针，复用 HTTPX、现有 Range 传输、`m3u8` 解析与播放器计划；无新增运行依赖，也不复制上游应用代码。

光鸭、OneDrive 与其他网盘复用声明挂载根、路径翻译、扫描、文件整理与回滚、隔离删除和空目录清理。所有挂载来源统一开放读写，底层权限或不支持的操作由挂载工具报错；网盘登录与平台 API 由飞牛 OS 原生远程挂载、CloudDrive2 或 OpenList 等挂载工具提供，不新增 SDK 或依赖。本地文件先隔离再提交账本；rclone FUSE 通过挂载表识别并直接删除，避免部分后端的远端改名触发复制，账本事务失败时保留可重试的回收站记录。飞牛 OS 原生挂载 115 的实际文件系统可报告为 `fuse.rclone`，不等于用户单独部署 rclone；其他挂载方式仍须分别验证。临时文件与账本回归覆盖三个来源的整理、回滚、删除、权限拒绝和空目录清理；真实账号兼容性见待办。挂载目录可单独设置代理流量保护，成本投影与批处理使用同一规则。STRM、ISO 跳过后台媒体读取，普通媒体保留按来源策略执行的探测；九宫格和时间轴共用本机视频预览开关。

回收站复用 `platform.translate_ledger_path`、声明来源根与 Python 标准库 `stat`，只将 `FileNotFoundError` 视为文件缺失，权限或 I/O 错误保留记录。Linux 挂载判定读取原生 `/proc/self/mountinfo`，字段、父挂载关系与文件系统类型按 [Linux man-pages 6.19](https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html)；采用最深挂载点，覆盖挂载按父子关系选择，不依赖文本行顺序。转义解码与路径比较属于 Peach 的删除策略，没有复制外部实现。rclone 挂载能力参考其[官方文档](https://rclone.org/commands/rclone_mount/)，不新增 rclone 运行服务；现有 psutil 7.2.2 仅是开发依赖，不为读取一份 Linux 原生挂载表增加运行依赖。未知挂载信息保留本地隔离流程，临时文件回归覆盖带空格挂载点、父目录路径、覆盖挂载、删除失败与混合批次事务失败。

Actions 工作流静态检查复用 actionlint 1.7.12（MIT，`rhysd/actionlint:1.7.12` 官方 Docker 镜像），由本地 Docker action 使用，独立 Docker 目录纳入 Dependabot 与接管入口。GitHub Actions 生态不更新 `docker://` 镜像引用。Windows 官方二进制按发布校验和完成本地 POC；CI 在 Linux 容器检查语法、表达式、任务依赖与脚本。Python 与浏览器回归继续使用现有统一入口及 Playwright；六片浏览器权重来自 [已通过的 CI](https://github.com/peach-mitao/peach/actions/runs/38981261189) 的 69 份 TAP，记录在 `scripts/ci-browser-timings.json`，没有新增应用运行依赖。

目录浏览的 `media_folders` 复用 `PureWindowsPath`、媒体库配置的目录前缀和账本路径，不访问媒体挂载。`folder_rules` 复用 profile 偏好、规范实体、字段归属、身份断言、逐件归属否定和扫描登记入口；规则以 `user:directory-<目录标识>` 保存独立来源，预览摘要绑定资产版本与关系，撤回只处理本来源。已有明确归属保持独立。目录栏复用覆盖式滚动条，按筛选条下沿、目录实际位置与可见视口计算高度；共用查询的错误由正文或手机目录弹窗呈现一次，独立请求保留各自的重试。

界面逐字采用 MIT 许可的 BoardUI Tree View、Breadcrumb 与 Direction，固定源码 SHA-256 见 `frontend/src/react/boardui/ORIGIN.md`；复用现有 React 19.3.0、React Aria Components 1.22.1、Motion 14.1.0 与 Remix Icon 4.9.0，无新增依赖。Peach 的原生链接适配上游 `next/link` 槽，领域逻辑仅承担目录归属、冲突保留、范围确认和来源撤回。能力检索覆盖当前媒体库分组、目录否定、字段归属和 `media_libraries.py` 的 Git 历史；物理目录整理继续使用既有入口。验证只使用临时账本与合成馆藏。

Linux Docker 容器复用 Docker 官方 Python `3.14.8-slim-trixie`、uv `0.13.1`（MIT/Apache-2.0），以及 Docker 官方 Buildx、login-action 和 build-push-action 的「先验收再发布」流程。Python 镜像许可证随上游组件保留，FFmpeg 使用 Debian 包及其许可证。Peach 差异仅为配置重载、资料处理请求与持久化路径；不引入新 Python 依赖，不改写真实 ledger。CloudDrive2 使用其官方独立服务，不复制其代码或打包进 Peach。部署与证据范围见 [Docker 部署](DOCKER.md)。

收藏窗口复用 React Aria 外壳、Peach 设置弹层布局及共用关闭控件 `SettingsDialogClose`。入口为中性星形按钮；实体分类和保存的筛选分别显示，已标记与稍后看位于导航底部。收藏图像复用实体引用、厂牌标识、本地代表作与已绑定在线来源的本地头像代理，通过全站图片回退链逐项尝试，不写入偏好。原始 BoardUI 源码哈希见 `docs/BOARD_UI.md`。Rule34 视频封面使用来源缩略图，图片保留原文件扩展名；失败图片在关注数据刷新时重新尝试。无新增运行时依赖或真实 ledger 写入。

关注封面代理复用来源登记的媒体主机白名单；第三方图片地址及重定向继续执行公网 DNS 校验。

收藏弹层的导航复用设置页液态玻璃、`useViewGlide`、`attachOverlayScrollbar`、入场与退场关键帧及落影，桌面和手机检查实际计算样式。官方预告复用 amane `cc42cee6ecf290cf05af1caa347d2dc2d5aeffcd` 的 Prestige SKU→UUID 协议，通过官方返回的作品身份与公开 MP4 字段取得地址；读取复用既有来源传输、限制和媒体代理，无新增依赖。

媒体 indicator 复用关注详情的半透明灰底胶囊：`rgba(0,0,0,.5)` 底色、无描边、`--pill-radius` 圆角及既有圆点间距。滚动内容复用 `wireHorizontalScroller`、`data-overflow-left/right` 和 `board.css` 的左右渐隐，底衬保持完整。预告优先读取 DMM／厂牌官方声明，其次读取同一番号的 JavDB 详情，匿名 WebUI 作为备选。DMM 复用 `DmmSource` 的 CID 搜索、身份核对、GraphQL、`SourceTransport` 和媒体 Range 代理；`sample2DMovie.highestMovieUrl` 字段已按同一 amane 固定 revision（GPL-3.0，仅作协议证据）及真实官方响应核对，不引入上游代码或新依赖。DMM、JavDB 的正负缓存按来源隔离、每天可再检查；预告缺失与连接失败分别返回。`RCTD-764` 已通过 1 KiB Range 请求确认 206、`video/mp4` 和 MP4 文件头，身份不匹配、来源优先级、WebUI 失败、缓存与媒体主机边界由行为测试覆盖。

## 设计准则参考

Open Claude UI（MIT）只用于[设计准则](DESIGN_GUIDELINES.md)与[源码取舍](reference-snapshots/open-claude-ui.md)，原文锁定在 `reference-sources.json`。采用减少重复外框、语义排版、容器适配、输入法保护、保持阅读位置、可恢复手势、锚点缩放与真实反馈等原则；组件复用现有 BoardUI、React Aria、Motion、Swiper 和滚动入口。示例任务终态、全局样式、宿主、语音与专有协议不进入运行时。源码审阅完成，浏览器 POC 未取得；无新增依赖、生产设置或 ledger 写入。

## 上游应用功能

amane `0.20.0 / cc42cee6ecf290cf05af1caa347d2dc2d5aeffcd`（GPL-3.0）提供实体收藏、
元数据比较图按需请求、结构化失败等行为参考；Peach 独立实现交互，复用现有 profile、
TanStack Query、规范实体、来源结算与复核队列，不引入上游应用数据库或任务引擎。
实体收藏随合并身份继承，命名馆藏筛选只保存现有目录查询条件。

来源连接复用 `SourceTransport`、失败原因表和冷却文件，诊断分开记录连接与解析的最近证据。
amane 的所有正式来源可选逐站直连或公共代理，桥保持一次子进程和 60 秒总时限。
比较图片在点击后请求，30 秒内未取得即可重试；不新增任意 URL 图片代理。

[自定义来源](CUSTOM_SOURCES.md)参考 OpenAver `502278a3e09c7520838ffb00b2ff080323a4cdcb`
（MIT）的声明式配置、番号身份核对和公网目标守卫，使用已固定的 curl_cffi、filelock、
SiteRecord 与候选结算；[外部播放](EXTERNAL_PLAYERS.md)复用既有媒体根检查、HTTP Range、
标准 M3U 与客户端协议，无新增依赖。Python 主程序和独立桥均使用 3.14，独立锁仍隔离依赖树。

## 二维播放墙

Folia（`chthollyphile/folia-major`，AGPL-3.0，revision `9a01e788ed52d25ea01b1f0d37934e5e371ae82b`）提供矩形块模板、镜头／世界坐标、视口裁剪、循环／有限墙及视觉样式；原文保存在 [矩形块模板](reference-snapshots/upstream/folia-block-templates.ts)、[让位表](reference-snapshots/upstream/folia-block-reflows.ts)、[动效参数](reference-snapshots/upstream/folia-wall-reflow-motion.ts) 和 [墙面样式](reference-snapshots/upstream/folia-wall.css)。`frontend/src/react/video-wall/` 在独立 `/wall` 页面使用四套模板及镜像、6×6 原位展开和暗色直角拼贴。封面复用 `ArtSlot`、`cardArtwork` 与人脸／正封取景；全封和正封按磁贴比例选择，只接收有封面的视频。Query、BoardUI、Motion、详情入口、舞台播放器和小窗均使用项目已有能力，不增加依赖。

墙内分卷和版本使用 `item-detail` 的 `queueKey`、`fetchQueue`、`chooseItem`、`nextPart`，列表行复用 `MixQueue`；上一部、下一部和进度控制监听同一 video。换批入口复用首页 `Shuffle` 和原有等待动效。展开卡的封面铺满，标题叠在中下部，播放时封面背景模糊、标题移到上方。

上游当前仓库仍在维护，技术栈为 React 19、TypeScript 7 与 Vite 8。模板与坐标算法没有 Python 或平台依赖，正式消费者是浏览器构建。Three.js、Pixi、歌词和音乐账号体系不适用于视频墙，未引入。探索墙复用现有 Query 分页，按进入视口的实例键分配作品，保留已看位置；未展示作品不足时自动续页，无封面页继续跳过，全范围耗尽后才循环。筛选及实体作品墙使用固定三列与手动续页。几何测试覆盖 80,000 项、负坐标、续页位置稳定和耗尽状态，播放器测试覆盖同一实例交接、取消与来源门槛；见 [播放墙取证](reference-snapshots/folia-video-wall.md)。

高亮复用 Folia 当前播放标记的内侧描边与发光，Peach 同时应用于选中和播放。队列滚轮交给现有 `MixQueue` 的滚动区，墙面不接管；手动换批使用独立等待态，Query 就绪后移动到新区域并恢复墙面。全局入口与沉浸模式一样常驻，非作品页面保留来源与 JAV 语境及返回地址，馆藏和实体作品页继承当前筛选。

## 脚本目录与参数

脚本路径读取 `settings_file` 的目录配置。`sync_sha1_115.py` 的 Cookie 默认位于 `secrets/115-cookies.txt`，复核 CSV 默认位于 `review/115-sha1重复.csv`；可通过 `--cookie-file`、`--dupes-out` 或对应的 `PEACH_115_COOKIE_FILE`、`PEACH_115_DUPES_OUT` 指定现有文件。目录排序偏好使用可重复的 `--deprioritize-dir`。TLS 两种 shell 共用 `resolve_tls_directory.py`，显式 `-OutDir`／`PEACH_TLS_DIR` 优先；`rehome_unknown_jav.py` 的目标账本根由 `--ledger-unknown-root` 明确指定。

## 馆藏处理流量

馆藏处理的流量分账复用最长路径前缀、CloudDrive 账号数据代理配置、`ContextVar`、现有任务快照和断点恢复。`media_sources.cost_for` 只控制逐目录代理保护与工作范围。HTTP 下载复用固定版 HTTPX 0.28.1（BSD-3-Clause）的 [`num_bytes_downloaded`](https://www.python-httpx.org/advanced/clients/#monitoring-download-progress)，按压缩传输字节累计，失败的部分响应保留读数。FFmpeg 输入读取复用 verbose 级别的 AVIO Statistics，NFO 与配套图片累计实际应用读取量；挂载缓存、预读、浏览器与外部采集器使读数仅能作为估算。

`processing_traffic_plan` 是 Peach 的工作量策略，复用 `_missing_fields`、`_scrapes_as_jav`、`_RemoteSession` 的来源链、7 天缓存、`_MissCache` 与 `cover_settled`，按番号合并资料请求；只有实际待补全、未命中缓存的来源进入计划。HTTP 下载共用 `MAX_SOURCE_BYTES`，amane 计划不受该 HTTP 预算裁切。按来源连接设置拆分直连与代理；配套文件检查完毕后，用实际字段与核查范围重算，并将完成阶段和番号持久到任务快照，恢复时继续扣除已完成工作。

已有目录的文件数量与资料工作量预检访问账本和本机缓存，连接配置另向 CloudDrive 只读查询。至多采样 256 张封面与 256 份 NFO 的大小中位数；无样本时采用封面 512 KiB、NFO 32 KiB，待探测媒体 8 MiB、九帧 72 MiB，媒体项受文件大小限制。资料每站按两次、每次约 250 KiB 的采集器工作量基准估算。以上是默认计划值，不是实际下载保证。界面以 `estimated_bytes` / `metered_estimated_bytes` 显示约值，逐盘、代理与全部合计共用一份状态；已用量保留实际累计。领域工作量不引入外部估算库，通用统计、目录索引与数据库复用 Python 标准库；无新增依赖。

`processing_inventory` 复用 `scan._walk`、`walk_root_for`、`medium_of` 和番号识别规则，对尚无登记视频的根目录做只读名称预检。每次 GET 推进一批、增量规划新增文件，令牌只引用服务端已校验的配置和目录，不接受客户端路径；令牌空闲 5 分钟失效，弹窗关闭后无后台遍历任务。已有登记视频的根目录沿用账本，不重复预检。文件数按路径计、部数按可识别番号去重；没有发行证据的文件名识别仍有遗漏与误判，实际配套资料处理负责补充。

`processing_traffic_history` 复用标准库 `statistics.mean`、任务计量上下文及 `atomic_write_text`，保存每组最近 50 次正数样本、至少 3 次才替代默认值。探测／抽帧按目录分组，完整资料下载按来源集合、封面需求和连接方式分组；失败、无下载和外部流量缺测的资料处理不学习。只保存本机统计，不记录番号、URL 或文件名；预检只读历史。通用预测库不能定义 Peach 的缓存、计量覆盖与来源工作量，采用已有任务策略和标准库，不新增依赖。

明细开合复用设置页 `Disclosure` 与 `setCollapseOpen`，可由任务提示同步收起；任务正文的网格高度与同一枚箭头沿用 Collapse 的 200ms 节奏。全局减少动态效果设置关闭这些过渡。网盘标识复用 `SourceLabel`，115、PikPak 等使用已登记的站标。

## Windows 常驻托盘

诊断报告完成窗口复用 Windows `DialogBoxIndirectParamW` 与 `EndDialog` 的系统消息循环，控件和回调声明指针宽度；导出放在独立单实例线程，托盘消息回调可返回。原生隔离进程验证「打开目录」「打开文件」「关闭」、标题栏关闭、Esc 与 Enter，不操作现有托盘。未采用需要 common-controls v6 激活上下文的 `TaskDialogIndirect`，也未为单个窗口引入 GUI 依赖或 PowerShell 子进程；无新增依赖。

独立启动复用 Windows `CreateProcessW`、`STARTUPINFOEX` 与 [`PROC_THREAD_ATTRIBUTE_PARENT_PROCESS`](https://learn.microsoft.com/en-us/windows/win32/api/processthreadsapi/nf-processthreadsapi-updateprocthreadattribute)，经标准库 `ctypes` 调用；父身份及 Job 继承来自当前会话的桌面进程。子进程可以保留系统共享 Job，验收判据为关闭启动器的私有 Job 后仍存活；[嵌套 Job](https://learn.microsoft.com/en-us/windows/win32/procthread/nested-jobs) 可能只允许部分脱离。子进程挂起创建，记录归属后以 `ResumeThread` 执行；创建被拒绝时仅重试一次 `CREATE_BREAKAWAY_FROM_JOB`，恢复主线程失败时回收未执行的子进程。官方系统 API 无额外包、固定版本或第三方许可，适用于项目支持的 Windows，2026-10-15 核对。Peach 保留参数、Peach 数据目录、源码与 PyInstaller 环境处理，并消费一次性交接标记。入口先复用 `SingleInstance` 的只读锁探测，已运行时直接打开页面；锁探测不创建文件，不阻塞子进程取得锁。

当前树与 Git 历史已有 `windows_restart`、`tray_lifecycle` 和 `process_job`，继续复用各自的重启、恢复及子服务清理行为。`DETACHED_PROCESS` 只脱离控制台；`CREATE_BREAKAWAY_FROM_JOB` 依赖所选父进程的 Job 允许脱离；WMI、Shell COM 与计划任务额外引入服务、环境交接或注册生命周期，未采用；`pywin32` 不属于运行依赖，监视器又必须只加载标准库，因此采用原生 API，无新增依赖。源码托盘直接调用基础解释器，按 [CPython 3.14.7 venv 启动器](https://github.com/python/cpython/blob/v3.14.7/PC/venvlauncher.c) 的 `__PYVENV_LAUNCHER__` 协议保留虚拟环境身份。仅参照协议，没有复制 PSF 许可源码。临时进程回归覆盖多层共享 Job、内层自动脱离与启动器私有 kill-on-close Job：普通子进程随启动器退出，桌面子进程仍在共享 Job 中存活，并消费交接标记。另核对 Unicode 参数、环境、工作目录、虚拟环境身份与进程清理；真实 Explorer 不加入测试 Job。诊断只记录可取得的进程成员状态和调用进程直接 Job 的原始限制值，位定义复用 [Microsoft 文档](https://learn.microsoft.com/en-us/windows/win32/api/winnt/ns-winnt-jobobject_basic_limit_information)；完整句柄链与所有者未取得时明确标记，不通过全系统提权扫描推断。

## 西方人像与官方封面

Babepedia 主图库和 Vixen 网络公开 GraphQL 的字段核对 [Stash CommunityScrapers](https://github.com/stashapp/CommunityScrapers/tree/d0f75013e09a0469b70365fef3294ca915edcf8c) 的 Babepedia、vixenNetwork 采集器（AGPL-3.0；2026-10-07 获取的 revision）。该项目使用 Python，可经插件在 Windows 上运行；Cloudflare 限流和上游字段变化可能导致未取得。只参考公开协议和身份字段，不复制 AGPL 实现，不恢复已关闭的 Stash 适配器，也不引入依赖。HTTP、HTML、图像检查、内容缓存、头像安装和封面边车分别复用现有 `HttpxTransport`、BeautifulSoup 4.15.0、`avatar_provider`、`avatar_picker`、`cover_artwork`。

真实只读试验取得 Angel Smalls、Christy White、Lena Anderson、Melody Marks、Sweet Sophia 的主图库；Babepedia 的 Blaire Ivory 档案明确列出别名 Lena Anderson。Tushy 2019-08-14《Cam To Me》、Vixen 2019-04-09《I Want It All》的官方封面均已取得。搜索还返回 Lena Paul 等人的作品；Peach 用厂牌、完整名字、发行日和唯一结果筛选，并对详情再核对。没有番号的官方封面按 `ASSET-ID-<id>` 保存，资产字段保持原值。头像保留主图库候选，已有头像不自动覆盖；官方完整出演名单参与合演保护，多人封面需要框选。采集入口 `harvest_western_artwork.py` 每轮至多 16 位，默认只预览，输出来源回执；封面边车记 `auto:western-artwork@<时间>`，由 `revert_auto_landing.py` 按批撤回。

## 实体身份与职业

本地作品的创作者引用由 `web_catalog.attach_creator_reference_details` 批量附上可信浏览分类与资料页同源的代表作头像。`avatarInner`、队列和详情共用实体图优先、可用代表作回退的取图契约；发布账号的代表作保留「非本人」提示。卖家是账号角色，详情按可信 `identity_categories` 展示「卖家」，不推导出演身份。

公司资料复用 `entity.metadata_json`、HTTPX、官网公司概要表和定义列表与标识采集器。`company_profiles` 只有通用判据（概要标签、服务条款订立方原句），按字段保存出处、原文和批次，只填空；一页多张公司表时按法人名对实体名与别名选表，公司成立与品牌启动分列，集团与分工关系不由代码推导，只作候选。`harvest_company_profiles.py` 默认产复核 JSON，`--input --apply --backup --batch auto:company-profile@…` 按缓存页重放判据后落库，清单里的别名、链接与第三方页面不写。`revert_auto_landing.py` 可撤回同批公司字段及标识，无新增依赖。

Babepedia 资料采集复用 `babepedia_page` 的主名与别名交叉核对、`performer_profiles` 的整行来源保护和 `performer_alias_followup.land` 的占用检查。英文艺名只在明确允许的来源中登记，单个罗马字词只在它就是页面主名时登记，JAV 后继保留自己的名字策略。真人账号与出演者共用资料表、别名分组与头像候选；保留账号角色及旧地址，与已登记账号说法不一的链接只进回执。出演者主图经 `avatar_followup.match_gallery` 与单人作品封面比上脸才补空头像，账号与本人档案图库仅作候选，推荐人物排除，单图失败继续其余有限候选；候选表只认判词「命中」的档案地址。`harvest_western_profiles.py` 每轮至多 16 位，计划、备份、回执与批次撤回齐备；既有资料和头像保留。真实只读复核取得 Ria Kurumi 等 16 份匹配档案，无新增依赖。

身份分类复用 `entity`、来源关系、`field_owners`、SQLite 迁移与版本触发器。职业与账号角色使用独立多值断言，跨角色身份使用可撤回关系；[Schema.org Person](https://schema.org/Person) 的 `hasOccupation`、`sameAs` 与 [Role](https://schema.org/Role) 提供语义参照，2026-10-06 已核对官方文档。实现不复制外部解析器或新增依赖。目录推断和搜索命中只存候选，公开来源事实与用户复核分别保留状态。

FC2 卖家名册复用 `sources/fc2.py` 的 `label`、`seller_url` 来源契约、`normalise_code_key`、`upsert_asset_entity`、职业断言和 SQLite 备份。`import_fc2_sellers.py` 读取已有作品快照，不发起采集；账号地址、来源作品号和馆藏作品号必须一致。同名不同账号、作品来源冲突保留在复核产物，既有身份和资料不覆盖；计划按摄取同一判据把集合名归到已有账号，摄取不收的作品记跳过，回收站作品不挂卖家。写入归属为 `script:fc2-seller@<批次>`，统一撤回入口 `revert_auto_landing.py` 同时处理账号链接、别名、外部编号、卖家断言及来源关系；有后续资料或引用的实体保留。导航复用 `BoardTabs`，动画作者保留 `creator` 身份与资料路由，通过艺人分类浏览。不新增依赖或外部解析器。

关注作者建档（`follow_creators`，ADR-0096）复用关注页的作者归组 `follow_identity.name_key`／`author_name`、`canonicalize_entity_name` 的平台名闸、`follow_sources.profile_link_identity` 的名片识别和后继派发（ADR-0040）。链接与别名按 `auto:follow-creator@<批次>` 记归属，`revert_auto_landing.py` 统一撤回；实体有其他引用时保留。资料页的同名确认复用 `Note` 与 Board `Button`，不新增依赖。

在线作者资料页复用关注页的 `FollowCard`、照片墙与 `author_facets`；本地与在线视图共用实体身份。在线头像候选复用 `follow_avatar` 的官方主机解析、`follow_media_resolver` 与 `open_upstream` 的凭据边界、`follow_cover_service` 的有界封面请求和 `avatar_picker_cache` 的裁剪安装。候选限当前实体绑定且可见的内容，社媒自动解析覆盖 X、Patreon、pixiv 与 FANBOX；其他来源由用户提供图片地址，无新增依赖。

关注页的创作者行与卡片头像、署名复用 `FollowAuthorLink` 和来源的唯一实体绑定，进入创作者资料页；卡片按实际发布者取身份。未建档作者沿用关注筛选。创作者行横滚访问全部作者。筛选条件与卡片悬停面留 16px；首页、关注页和资料页共用交集条。`useViewGlide` 复用 `ResizeObserver` 监听显隐与相邻控件尺寸，`moveGlidePane` 在重新落位时取消位移和形变动画，无新增依赖。

JAV 发现卡复用馆藏的 `data-media-card` 网格与悬停面、`coverImage` 封面取景、`cardRatio` 大小图比例和 `feedIdentity` 身份头像；筛选复用 `FilterGlassRows`、`FilterPill`、`Segments` 与 `SortKeys`。出演者引用由 `web_catalog.entity_ref` 提供图片版本与取景；标题保留两行，操作区贴底。发现查询复用口味汇总与 `related.rank_related` 的 IDF/MMR，输出相关度和实际选择分，支持口味、发行日期、来源评分、时长、番号排序。来源资料复用 `PublicAPI`、`BackgroundJob(runs=None)`、`fsutil.atomic_write_text` 与标准库 `ContextVar`；固定至多 100 部，真实 HTTP 预算 202 次、16 MiB、900 秒，3 秒串行间隔。资料边车有效期 6 小时、最多 2,048 条、失败冷却 15 分钟，完成或停止后由显式刷新续跑。`WantMagnets` 以 `queryUrl` 共用作品详情和想要清单的资源布局，按资源区容器宽度排列操作，缓存按来源分开，容量复用 `fmtSize`。JAV 与名册的静态搜索框复用 `islandSearchInput`。资料扩展见 [JAV 发现](JAV_DISCOVERY.md)，无新增依赖。

JAV 作品详情与馆藏视频共用 `IdentityCell` 的头像、标识和首字回退，标题折叠复用 `useFoldedTitle`。厂牌大小写唯一匹配与 `sources.javdb.maker_writing` 的日英组合解析只用于来源身份投影，标识按规范名读取。评论、资源复用 `Disclosure` 和 `setCollapseOpen`；来源与评论评分共用按小数裁切填充的星星。桌面右栏以 `contain:size` 排除正文的固有高度贡献，媒体区决定框体高度，正文在右栏内滚动。写操作取 `/healthz` 的账本只读状态，与运行配置权限分别处理。图片切换由 `MediaCarousel` 同时服务关注、库外 JAV 与馆藏详情，提供环形翻页、横向缩略图和位置圆点。缩略图与圆点复用浏览器原生 `overflow-x:auto`、`wireHorizontalScroller`，选中项在切图、循环和容器缩窄时保持可见。缩略图使用 `IntersectionObserver` 按可见范围挂载，馆藏经 `/sample-thumb`，来源图片共享查询缓存，关注优先取附件小图；Swiper 14.3.0 留给灯箱。馆藏样张复用 `sample_images.detail_refs` 和 `/sample-image`，`/api/item` 只读本地序号、最多 30 项；查看图片暂停正片，返回保留位置。推荐分标签复用 BoardUI `Chip` 与共享 Tooltip。视频预览的 `mountPreviewPlayer` 复用已固定的 Video.js 10.2.0（Apache-2.0）、官方 HLS 媒体组件、`mountPlayerQualityControl`、`mountPlayerSeekPreview` 和 `mountPlayerSpinner`，安装共用控制条、设置、时间、音量与窄宽度折叠。来源给定的 HLS 直接由播放器请求；片源代理、馆藏 ID 和观看上报沿用各自入口。播放器生命周期由当前详情管理，异步加载完成前离开会取消挂载，切换与关闭会停止并销毁实例。

卡片多选由 `MediaCard`、`FollowCard` 的 `selectMode` 统一控制：保留选择入口，单项保存、已看、忽略、稍后看、预览跳转和回收站操作不挂载；退出多选恢复单项操作。首页、实体页、关注与回收站沿用同一组组件。

配置页中的来源凭据复用 `Section`、`Stack` 与 `SettingsSectionLabel`；独立凭据页面保留自己的面板层级。自定义来源表单和卸载开关只使用一层正文间距，列表与表单操作区复用 `Footer`；空来源列表的添加入口放在 `Stack` 正文中。PikPak 直接显示账号表单，两种登录动作同排。在线、离线等连接状态复用 BoardUI `StatusDot`；权限、任务和凭据结果复用 `Chip`。作品资料站点标识经 `/site-mark` 读取本地缓存，资源搜索帮助直达 [详细配置说明](RESOURCE_SEARCH.md)。不新增运行时依赖，不修改凭据内容或 ledger。

账号归属复用 `review_decision`、`creator_collection_base`、`write_owned_fields` 和全库归属审计。明确拒绝的资产与账号组合在自动摄取时跳过；用户写入保留复核入口。网黄博主只命中可信个人、内容创作者或发布账号断言，未分类账号保留全部名册入口。`attach_avatar_availability` 集中处理资料页、索引、搜索与统计的作品头像：发布账号缺少本人或出演职业证据时作品帧照常兜底，另标 `avatar_stand_in`，已安装图片独立保留。个人博主的补头像复用 `avatar_cover_face.face_square`、`readable_cut` 与 ADR-0074 的 `agreeing` 两部互证，画面取自接触印相九格（ADR-0099）。来源核查清单、逐关系回执和备份存于 `peach-data/review/`。

`entity_identity_research` 与 `apply_entity_identity_research.py` 复用规范实体写入、字段归属保护、只读预览、SQLite 备份及冻结计划。逐行撤回回执核对后续修改，新增实体有额外引用时拒绝删除；观看历史和人工判断不被回滚覆盖。资料站调研复用 `performer_alias_followup.WikiSitePages`（包着 `sources/seesaa.py` 的 `WikiPages`，加 404 记忆与按站冷却）、作品表解析 `rows()` 与 `person_profile`，以及 EUC-JP 页名直取写法，不新增依赖；`creator_identity_followup` 的后继壳照抄补厂牌、补别名两条。

## 发现推荐缓存

搜索推荐复用 `/api/items`、馆藏范围的 `/api/jav/discoveries`、`/api/follow`、`/api/follow/authors` 与 `/api/feeds/discoveries`，图片复用 `coverImage`、`feedNewCoverHtml`、`avatarInner` 和 `authorAvatarHtml`。JAV 保留 IDF/MMR 口味排序，关注取全部状态的随机作品，视频与图片复用 `groupMediaKinds`、`itemForMedia` 和附件缩略图；署名沿用 `followIdentity` 的发布者判据。搜索框不启动库外资料补齐；详情与订阅分别沿用现有作品、作者、关注管理路由。无新增依赖、迁移或 ledger 写入。

发现推荐的浏览证据复用 `taste_history` 私有历史库、规范身份和原子 JSON 写入；按日取证与同地址身份解析独立缓存。缓存只保存实体计数，历史、别名、关注、标签决定和解析规则参与失效；观看反馈不重复解析历史，任务心跳不影响偏好版本。页面预取复用 TanStack Query 的 `ensureQueryData`，无新增依赖。

## 播放器清晰度

作品详情的画框几何由 `react/stage/stage.css` 管理，馆藏与库外 JAV 共用视口高度、媒体行及常驻缩略图预留。小数星星的两层 SVG 共用同一图标框。缩略图滚轮复用 `wireHorizontalScroller` 并在卸载时清理。公开图片缓存使用标准库 `Future` 合并同键请求，缓存锁只覆盖内存读写；图片下载使用三个槽位，资料取数使用独立锁与既有来源间隔，不添加依赖。

待找资源复用 `MagnetSearch` 的来源链、发行时间策略与串行限速，服务端结果使用 `atomic_write_text` 原子保存为私有 JSON 边车。读缓存和网络查询分锁；重启时将原始墙钟时间转换为当前进程的单调时钟。边车最多 128 部、16 MiB，不保存错误，主动刷新失败保留成功结果。浏览器沿用 TanStack Query 和 localStorage，不新增缓存服务或依赖。

清晰度控件复用 Video.js 10.2.0 官方 `@videojs/hlsjs-video` 的 hls.js 引擎。多档播放从实际轨道读取分辨率，自动码率和固定轨道通过引擎选择；单档 HLS 缺少尺寸时读取原生视频元素的实际尺寸，并响应 `loadedmetadata`、`resize`。尺寸未取得时显示「当前画质」，轨道 ID 不作界面名称。来源各自独立的 MP4 档位由 Peach 保留播放位置后切换片源。

画面旋转复用浏览器 CSS `transform` 与 `ResizeObserver`；Peach 仅计算保持比例的显示尺寸、设置菜单及会话释放。采用现有 Video.js 10.2.0，不增加依赖；依赖旧版组件接口的旋转插件不进入运行时。本地播放器复用 Python 标准库 `os.startfile`、`subprocess` 和 macOS `/usr/bin/open`，保留固定播放器名单、媒体根授权、本机直连与 Docker 边界。本机请求判断由 `web_local_access` 供配置与媒体路由共用。媒体路径复用 `media.normalized_path`，Windows 保留可直接读取的挂载盘盘符，不向虚拟文件系统请求最终路径。系统能力随 Python／操作系统发布，无额外许可证或包体积；真实桌面应用唤起与浏览器协议支持分别验收，不能由进程请求成功推断解码成功。用法与上游依据见[外部播放器](EXTERNAL_PLAYERS.md)。

播放器按 [Video.js 10 官方迁移指南](https://videojs.org/docs/framework/html/guides/migrate-from-video-js-8) 和 [10.1.0 源码](https://github.com/videojs/video.js/tree/919ad955a9baf2433c68aba8151654dde0e58b5d/packages)接入 `video-player`、`media-container`、官方按钮／滑条与 HLS／DASH 媒体组件。`@videojs/cdn` 10.1.0（Apache-2.0）提供固定 ESM 模块，构建脚本按静态与字面量动态导入闭包分发并登记哈希；浏览器支持沿用项目目标。Peach 保留片源授权、时长口径、统计、字幕菜单和舞台生命周期，原生视频经 `media` 插槽携带字幕与观看上报。`video.js` 10.1.0 包的旧入口只有带错误码的 shim，不作为运行依赖；v8 的组件和 VHS 不进入产物。真实短片回归覆盖 MP4、HLS 和 DASH 解码，质量档位选择按 HLS 引擎验证，DASH 不声明手动档位能力。生产切换与 ledger 不属于依赖接管工作树。

Peach 播放器皮肤直接装饰 Video.js 10 的 light DOM：右侧控制组用自动左外边距贴住控制条右缘；官方时间滑条承接完整 18 px 命中区，6 px 轨道与唯一的 12 px 滑块分别绘制，悬停和聚焦放大滑块。浏览器回归 `frontend/e2e/player-skin.test.ts` 使用合成短片验证桌面、390×844 手机、进度点击与全屏进出；不增加播放器依赖。

字幕文件加载复用 `subtitles.to_webvtt`，接受 SRT、ASS、SSA、VTT，兼容已有的编码探测；4 MiB 以内的文件经 `/api/subtitles/convert` 转换后挂到当前 video 的 TextTrack，关闭播放器释放 Blob URL。字幕列表、CC 开关与外观选项按用户截图和 [YouTube 官方说明](https://support.google.com/youtube/answer/100078?hl=en) 组织；字体、字号、颜色、不透明度、背景、窗口与边缘样式按视频保存到服务端文件，时间轴仍由浏览器驱动。自有字幕层绘制文字与背景，Chromium／WebKit 的原生字幕容器隐藏。字幕文件不写 ledger，不保存到媒体目录。

字幕面板复用播放器的选项行、描边勾选、设置齿轮和悬停表面；多行轨道名按内容增高并保留上下留白。在线入口按当前作品的番号或片名自动检索，结果保留在当前播放会话，失败可重试。本地和在线字幕可同时保留为独立轨道，当前选择互斥；新加载轨道自动选中。轨道、选择和外观由同一份视频记忆恢复。详情原生 `dialog` 只处理自身的 `cancel`，文件输入框冒泡的取消事件保留详情与字幕菜单（[浏览器事件说明](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/cancel_event)）。播放器模块加载期间只显示海报，原生控制条仅用于加载失败后的播放回退。桌面与手机回归覆盖首次加载、文件取消、菜单 Escape、结果加载及字幕外观。

在线中文字幕只采用 [SubtitleCat](https://www.subtitlecat.com)，复用现有 httpx 与 BeautifulSoup 依赖。来源选择参考 [PotPlayer JAV 中文字幕插件](https://github.com/736368217/PotplayerJavChineseSubs_subtitlecat/tree/0b569fdc3bd2cb27fca2140858ad77bf6d7ddcb8)（MIT；仅参考公开协议与语言选择，不复制代码）。番号检索复用 `catalog_rules` 的规范化、查询变体与身份比较，结合 `feeds.scan_code` 读取结果标题；仅保留同一发行身份，再按每页六条读取详情。标题支持紧凑番号、语言和版本后缀；日期分隔符与未经确认的发行前缀保持区分。片名检索保留用户关键词。只列已有 `zh-CN`／`zh-TW` 文件的结果，最多检查前 60 条，翻页由用户触发；不触发生成翻译。下载限固定 HTTPS 主机、字幕路径与 4 MiB，复用现有转码器。2026-10-18 固定 20 个公开番号均取得中文文件；该小样本不代表全站或馆藏覆盖率，也不证明翻译准确。界面说明可能包含机翻，不声称人工翻译。ASSRT 不接入；JavSub.ai 在同批样本中有 8 个中文条目，7 个需购买、1 个标为免费，但下载返回 403，故不作为在线来源。无需凭据，不增加依赖，不写 ledger 或媒体目录。

## 分级诊断

启动取证复用 Python 3.14 标准库的 `sys.excepthook`、`threading.excepthook`、`sys.unraisablehook`、`logging.Handler`、`faulthandler` 和 `zipfile`（PSF 许可，无额外安装体积）。`error_reporting` 在配置与第三方依赖之前加载，`support_bundle` 仅收集选定日志和系统字段；Peach 保留脱敏、备用目录、本机权限与报告内容策略。已有诊断报告用于页面和运行期导出。临时目录与独立子进程覆盖无控制台、导入失败、线程异常、备用目录、配置损坏和脱敏。

可选远程诊断复用官方 [sentry-sdk 2.72.0](https://github.com/getsentry/sentry-python/tree/2.72.0)（MIT，维护中，支持 Python 3.14）；固定版源码通过 `opensrc path pypi:sentry-sdk` 核对。SDK 负责后台 HTTP、TLS、Sentry 信封和服务端限流；Peach 负责本机选择、技术字段投影、同类错误聚合与每机每日上限。版本统计与错误诊断共用默认勾选的开关，关闭时不构造 SDK；SDK 全局自动集成、追踪、回放、日志、会话与指标采集均关闭。`HttpTransport._send_envelope` 的窄覆盖在真正发送前复查本机选择版本并移除本机传输元数据；它是固定版本的内部接口，升级必须通过真实 SDK 信封回归。无真实外发的内存接收端检查最终字节、停用后队列失效与断网不影响本机取证。新增依赖仅 `sentry-sdk`，复用已声明的 urllib3 / certifi；体积以发行构建为准。未采用自写 Sentry 协议或 Workers 收集后台，避免另行维护传输、去重和查看界面。没有真实 ledger 写入。

故障频率复用已固定的 `filelock`、`fsutil.atomic_write_text` 和 SDK 事件标签，保留 Peach 的同意版本、技术投影、跨进程计数与每日批次策略。`diagnostic_frequency` 保存有界技术样本及待提交增量，首次、每小时和正常退出通过同一 SDK 提交；关闭会清除聚合。Sentry 默认事件数统计批次，不会将自定义次数标签自动求和；汇总按事件的 `occurrence_day` 与 `occurrence_count` 计算。`reporting_transport` 复用官方 `HttpTransport` 的 `_handle_response`、`_handle_request_error` 与队列丢弃回调，取得 HTTP 状态且不重复实现请求、TLS 或重试；固定内部接口以真实 SDK 和模拟 HTTP 回归。`reporting_delivery` 只保存本机有限回执；SDK 入队、HTTP 接收与接收端留存分别解释。用途、环境与公开构建号复用 Sentry 原生字段，测试在同一传输边界拦截外发。未开启 SDK metrics 或新增收集服务：独立指标通道会增加同意边界、额度与交付口径。计数只覆盖已筛选技术故障，发送及保留限制见 [诊断核验](DIAGNOSTICS.md)。没有新增 Python 依赖或真实 ledger 写入。

Windows 连接清理复用 [CPython 3.14.7 的 Proactor 对象协议](https://github.com/python/cpython/blob/v3.14.7/Lib/asyncio/proactor_events.py)（PSF 许可，无新增依赖）。精确识别纯标准库清理回调中的 `WinError 10054`，只补完 socket 关闭、服务端解除登记和关闭状态，不重复通知协议，不全局修改标准库类或替换事件循环。它使用 `_sock`、`_server._detach` 与 `_called_connection_lost` 私有接口，升级 Python 时须核验。真实 socket 和 `asyncio.Server` 配合合成故障验证资源释放；收尾自身失败保留原始异常链并上报。33 次回环实验未复现原始竞争时序，不据此认定客户端来源。协议类别只写本机日志；来源、任务、媒体和浏览器的远程筛选复用现有领域状态，见 [诊断核验](DIAGNOSTICS.md#远程错误筛选核验)。

馆藏与口味群体研究复用 `LedgerDatabase.read_connection`、规范编号、`entities.male_performer_ids`、`taste_evidence.era/length_band`、实体收藏快照、`error_reporting.redact` 与固定版 Sentry 内存附件 API。`library_research` 负责本机去重、用户信号、手动标签和分组评分直方图，这是 Peach 的领域投影；不读取浏览历史或写入偏好缓存。JSON 使用 Python 3.14 标准库 `gzip`（PSF，无新增依赖），固定文件名，gzip 头不含源文件名或生成时间。万条作品投影逐字节还原，真实 SDK 的内存传输验证最终附件、白名单与同意门槛。Sentry 附件接收复用官方 SDK（MIT）；没有引入匿名中继或独立聚合服务，本契约保留逐份投影并披露关联风险。字段、体积上限和验收见[馆藏与口味群体研究](DIAGNOSTICS.md#馆藏与口味群体研究)。

代码展示统一复用 `frontend/src/react/components/code-block.tsx`：BoardUI 已固定版本的 Button、语义颜色、排版与圆角，加现有覆盖式滚动条；包含语言标识、完整原文复制、可聚焦滚动区、剪贴板失败反馈与可选的屏幕截断。用于馆藏上传 JSON、CloudDrive2 TOML 和自定义来源 JSON。2026-10-19 核对 [BoardUI 官方目录](https://www.boardui.com/components) 与 `boardui list`，公开注册表没有独立 Code Block，故以现有原语组合 Peach 包装件；无需引入只为只读文本服务的语法解析依赖，也不复制 Pro 模板。组件测试覆盖原文复制与 HTML 文本安全，布局通过桌面和窄屏浏览器验证。无新增依赖，vendored 上游源文件保持原样。

实体收藏复用 `profiles.read_settings` 与 `library_favorites.favorite_entities`，集中处理规范身份、重定向、标签选择、数量上限与去重，供页面和群体研究共用。命名筛选及 HTTP 展示由网页层负责；数据层不依赖网页模块。

`src/peach/diagnostics.py` 统一生成 CLI 与本机 API 报告；复用 `settings_file`、`health` 的只读迁移校验、`FFmpegResolver`、访问策略和挂载快照。数据库用 SQLite `mode=ro`；写入与端口检查用标准库短暂探针，不新增运行依赖。

应用生命周期复用 `health.inspect_database` 的只读账本与迁移检查；账本可读且结构为 `current` 时才恢复任务、启动追更、订阅、推送发现、下载对账和馆藏聚合预热。账本缺失、空白、损坏或迁移未就绪时保留健康与配置入口，只记录不含路径和 SQL 的状态提示，不创建或迁移账本；账本准备完成后重启服务。`/healthz?ready=1` 的 `checks.background` 反映本次生命周期是否启动了账本后台任务；暂缓启动的实例在重启前保持未就绪。配置与隧道测试复用标准库 `unittest.assertNoLogs` 检查非预期的后台错误，故障注入用 `assertLogs` 核对预期原因，生命周期回归使用 `support.ledger.fresh_ledger` 的真实迁移模板。没有新增依赖或真实 ledger 写入。

聚合预热通过 `asyncio.Event` 接收关停信号，服务退出等待正在执行的 `asyncio.to_thread` 查询释放连接，并跳过剩余聚合。进入关停时 `checks.background` 为 `false`；临时 SQLite 连接与线程事件回归验证服务结束和账本释放的先后顺序。

浏览器网络失败取证复用 Chromium（BSD）的 NetLog 与现有 Playwright 启动入口；`PEACH_E2E_NET_LOG_DIR` 启用 `--log-net-log`，捕获模式固定为 [`HeavilyRedacted`](https://chromium.googlesource.com/chromium/src/net/+/master/log/net_log_capture_mode.h)，保留允许公开的网络事件字段，不采集 URL、主机、IP 或请求头。日志随浏览器正常关闭完成写入，由 CI 与 TAP 一起保存；失败请求仍使测试失败，不重试或过滤 `ERR_NO_BUFFER_SPACE`。番号样张夹具在首次导航前安装响应，直接打开目标页，并在主体等待失败时关闭 context。没有新增依赖或机器资源限额。

已核对 sakuramedia `a10fcef8`（GPL-3.0）的诊断字段与提示组织，仅作产品参考，不复制源码。OpenAver `8cc17e50`（MIT）的 HTTP 健康探针不足以表达分项状态。[fastapi-health 0.4.0](https://pypi.org/project/fastapi-health/)（MIT）在离线试验中将状态字典视为真值；CLI、分级规则和脱敏仍需本项目处理，因此未引入。

诊断页复用同一报告、TanStack Query、BoardUI 设置组合件。库健康参照 javm `dd0e6b62`（MIT）的计数→清单入口，采用 Peach 的资产、封面键与处理日志；作品清单复用现有 TanStack Table、BoardUI Table、排序与分页、跨页选择和复制动作，展示标题、文件名、番号、媒体库、完整路径、时长与大小。单组报告最多加载 500 项，完整计数与已载入数量分别显示。身份字段仅供本机诊断页面使用，分享诊断包继续排除库清单。来源证据复用 `performer_profile_followup` 成功落库来源与 `scraping_access.cooldown_state`，不复用 HTTP 200 作为内容健康。无新增依赖；本机只读试验已核对现有日志与成功记录。

系统诊断作为配置分区，复用配置页签及深链。检查和来源状态复用 BoardUI `Chip`；来源会话各自复用 BoardUI `SettingsCard`，由共用 `SiteMark` 读取已核对的本地 favicon 并提供失败回退，图标保留方形画布；近期解析、历史成功和无记录分别显示。会话列表展示资料平台与连接服务；片商页面及按片商选择站点的路由不单列。默认链之外的可选来源有实际检查或冷却记录时展示。图标来源见 `resources/site-marks/ORIGIN.md`。无新增依赖或 ledger 写入。

## 资源索引器

`resource_search.py` 使用 Torznab 0.2.1（MIT，Python ≥3.10，支持项目 Python 3.14）的 `parse_capabilities` 与 `parse_torznab`。源码固定标签 v0.2.1，项目仍标为 Alpha；离线 XML POC 已覆盖 caps、GUID 磁力、体积、做种、连接数和重复标签。PyPI 包新增一项直接依赖，requests 为已有传递依赖；实际索引器验收需要用户配置端点。

请求复用 HTTPX 0.28.1。SDK 自带 requests 请求层没有响应大小上限，异常可能带完整 URL，故只使用其解析器。Peach 负责每源 caps 和 search 两次请求、至多六份种子、响应上限 2 MiB、每轮最多四源、45 秒预算、禁用重定向、脱敏错误、XML 实体声明拒收，以及体积、做种、黑名单、质量排序和最多五个候选。标题番号复用 `feeds.scan_code`，身份与中字、无码版次复用 `catalog_rules`。凭据复用 `CredentialStore`，不登记跨机同步字段；换端点不会沿用已保存的 API key。

已对照 [Torznab 1.3 规范](https://torznab.github.io/spec-1.3-draft/torznab/Specification-v1.3.html) 与 SakuraMedia `torznab.py`（GPL-3.0，revision `9c6a31915c9a364c9d6717798575daf9445916bd`）的 FC2 查询、磁力字段回退与部分失败边界。SakuraMedia 耦合其 ORM，不作为运行时依赖。候选填入云下载弹层的磁力框，经用户确认后走 `submit_offline_download`。

OneJAV、Free JAV Torrent 只给种子链接。这类条目经索引器同源的下载代理取种子，由 bencode2 0.3.35（MIT，Python ≥3.10，有 cp314 Windows wheel 与纯 Python wheel）解码，再对 info 字典求 SHA-1。实证：真实 sukebei 种子算出的哈希与 Torznab `infohash` 一致；Prowlarr 代理对 OneJAV、Free JAV Torrent 返回 `application/x-bittorrent`。bencode2 和 fastbencode 0.3.11（Apache-2.0）都拒收键乱序的字典，重新编码就是原文。选 bencode2 是因为它有纯 Python 后备。torf（GPL-3.0）功能远超所需，bencode.py（BitTorrent 许可）、bencodepy（2015 年后停更）不采用。

这是实现查找表：每项能力由哪个现成实现承担、Peach 自己只负责哪一段。新增、恢复或重写代码前，按 `.claude/skills/peach-reuse-first/SKILL.md` 先查本文件、当前树、Git 历史和成熟外部实现；旧文件名不存在不等于能力缺失，继任关系见「已删除旧实现与当前继任者」。

安装依赖的精确版本由 [Python 清单](../pyproject.toml)、[Python 锁文件](../uv.lock)、[前端清单](../frontend/package.json) 和 [静态依赖清单](../package.json) 维护。本页记录用途、许可证与取舍；取证版本和提交号只代表对应证据。

## 挂载可达性

`mount_reachability.py` 参考 OpenAver 的 `core/source_reachability.py`（MIT，Copyright 2026 peace；固定 revision `8cc17e50453d9f69a81f5fee1a072df80f7aab73`，2026-10-01）采用正常 600 秒、异常 60 秒的节律、两次失败确认和超时在途去重。Peach 独立实现此算法，未复制上游源码；使用 Python 3.14 标准库线程、事件与 Future，不新增依赖。Peach 的路径映射与首条目录读取归 `platform`，来源接口、健康摘要和托盘共用纯内存快照；最多四个目录探测在途，后台线程不阻塞服务退出。

未采用参考实现的 UNC TCP 445 探测：端口连通不能证明共享目录可读。普通文件也不能作为媒体根，`NotADirectoryError` 单列；权限拒绝、目录不存在与其他读取失败分别报告。APScheduler 已用于定时任务，但其线程执行器不能取消阻塞的文件系统调用；本功能用停止事件驱动调度，保留尚未返回的目录探测。任务中心写入 ledger，不用于此只读探测。

## Board 界面与数值设置

全站 `title` 提示由 `board-tooltip.ts` 共用原生 Popover、Range 和既有滚动锚点判据；完整可见文字不复述，截断原文、图标名称和补充说明可查看。无自身布局盒子的元素按可见子元素定位，文字外链按实际文字定位；弹窗提示留在对应 dialog 内。播放器继续共用带快捷键的 Video.js 提示，无新增依赖。

关注图片瀑布流复用浏览器 [CSS Grid](https://www.w3.org/TR/css-grid-1/#auto-placement-algo)、`ResizeObserver` 和现有 React，不新增依赖。`use-masonry-grid.ts` 按列表顺序固定列归属，按卡片边界生成网格行；轨道数随卡片数增长，图片取得尺寸和续页只影响各自列的后续位置。卡片保留 DOM 顺序、键盘入口和选择范围。图片加载后立即使用固有宽高，固定比例卡面用 `cover`，详情完整显示。

已有实现与历史 `57c42c05`、`91f2c5f0` 提供尺寸占位与学习接口。CSS 多列的 [列平衡](https://www.w3.org/TR/css-multicol-1/#filling-columns) 不满足固定列归属。外部候选 [Masonry 4.2.2](https://github.com/desandro/masonry/blob/v4.2.2/package.json)（MIT、浏览器 DOM 库，依赖 `get-size`、`outlayer`）要求维护另一套定位与图片加载后的 [layout 调用](https://masonry.desandro.com/layout)，不采用。Peach 只维护列归属和测量，定位交给原生 Grid；桌面与 390×844 用例覆盖无尺寸、只读回写拒绝、延迟长图与续页。

页面控件与交互由哪些共用件承担；组件映射、Board 上游证据与许可证见 [BoardUI 适配](BOARD_UI.md)。

- 页面分区复用 `BoardTabs` 与遗留导航的中性填充选中态；显示方式开关使用 `Segmented`。标题位于内容左上角、导航与筛选之前。JAV 馆藏复用目录，推荐和想要的骨架由 `jav-skeleton.ts` 与页面共享容器、列数和封面比例。网盘标识复用 `SourceMark`、`MEDIA_SOURCE_ICONS` 与 `SourceLabel`，不增加图标依赖。
- JAV 推荐通过 `/api/feeds/discoveries` 的 `performer_refs` 匹配口味中的实体身份与规范姓名；引用只来自现有 `entities.resolve_entity`，撞名时不选取身份、不改写来源原文，不在前端维护姓名对照表。

- 外链按钮复用 BoardUI `ButtonLink`，调用处加 `data-button-link`，全站文字外链规则用 `:where` 排除它，保持实体页控件的样式优先级。浏览器验收使用一个渲染进程、进程内音频服务和合成音频输出，给演示服务与媒体进程保留资源预算；入口仍为 `scripts/test.ps1` / `scripts/test.sh`。

- 功能性动效由 `frontend/src/react/components/use-moving-surface.ts`、`modal-frame.tsx`、`selection-dock.tsx` 承担，用现有 Motion 14.0.0（MIT）与 React Aria Components 1.22.0（Apache-2.0）。Fluid Functionalism 只作行为与短程参数参考（[取证](reference-snapshots/fluid-functionalism.md)），不装其 Registry（额外的 Radix、字体与上下文不合 BoardUI 组合）；Peach 保留单一选中底板、键盘即时反馈与原有主题。
- 首页新作与实体资料页共用 `/api/entity/shapes` 和 `feedNewSkeletonHtml`；`home.feed` 按新作列表同一套未入库、未忽略与合集条件判定，有内容才留位；同步设置先于最终横条和网格，同形骨架复用节点。
- 首页、人物页和 JAV「发现」的新作头像共用 `feedIdentity`、`web_catalog.entity_ref` 与 `avatarInner`，携带实体图片版本和人脸取景，多人最多叠三枚，图片缺失时显示首字。已建档人物的头像通往规范资料页，不新增实体、头像采集或运行依赖。
- 作者别名管理复用 `@tanstack/react-table` 9.3.1（MIT）和 BoardUI `Table`、`DataTableFrame`、`DataTableFooter`、`AuthorAvatar` 与既有别名 API。两张表均支持全集排序、分页和跨页选择；待合并表以平台别名为行身份，已保存表以规范创作者键为行身份。批量合并与移除读当前清单的所选行，串行执行并报告部分失败；勾写 `slot={null}`。`frontend/test/react/follow-alias.test.tsx` 验证清单刷新、勾选、合并、保存与移除，不新增依赖。扫描与采集方式收在 BoardUI `Button` 与 React Aria `Popover` 下拉里，行外观复用 `menu-styles.ts`（见 `frontend/src/react/boardui/ORIGIN.md`）。
- 表格自适应列宽复用已固定的 `react-aria-components` 1.22.1（Apache-2.0）`ResizableTableContainer` 与 `Column` 的 `1fr`、像素宽度及调整回调，沿用库内 `TableColumnLayout` 的尺寸分配和键盘调整，不添加布局依赖。Peach 保留各表的最小宽度、操作列默认值、偏好持久化、重置和列显示规则；文件名、路径及地址的中间省略继续复用 `middle-truncate.ts` 的 `ResizeObserver`。
- 数据管理的孤儿记录与链接结果复用 `react/components/data-table.tsx`，由同版 TanStack Table 处理全集排序、行选择与最后一步分页，外观复用 BoardUI `Table` 与 `DataTableFrame`。七张表共用 `table-controls.tsx` 的分页底栏；关注列表保留卡片与表格共享的排序状态，其余表的排序控件复用 `DataTableSort`。工具栏共享 `styles.css` 的 `data-responsive-toolbar`、`data-toolbar-heading` 与 `data-toolbar-actions` 分组，使用 CSS Flexbox 按可用宽度整体换行；列设置与排序方向各有独立原子组，不新增布局依赖。默认每页 20 条，批量动作在选中后使用 `SelectionDock`。`use-table-selection.ts` 在同页表格间互斥选择，保持一份批量栏。孤儿记录批量删除复用 `/api/batch`；链接清理的可选 `ids` 必须属于 `check_id` 对应的失效清单，只重验和处理所选链接，未选行保留。组件回归与临时数据库验证跨页选择、清单刷新、确认和删除范围；不新增依赖。
- 关注列表分页用 `pagination.ts` 的页码范围与边界裁剪（React 与遗留层共用这份纯函数）；默认视图按创作者组，表格按来源。关注列表与 JAV 订阅源表格复用 `@tanstack/react-table` 9.3.1（MIT，https://github.com/TanStack/table ，按 ADR-0031「前端基础库」引入），兼容 React 18+ 与 Node 20+；传递依赖为 `table-core`、`react-store`、`store` 和 `use-sync-external-store`，精确版本由前端锁文件记录。按官方 [React 迁移指南](https://tanstack.com/table/latest/docs/framework/react/guide/migrating) 使用 `useTable`、`tableFeatures` 和带 features 类型的 `createColumnHelper().columns()`，注册分页、行选择、排序与列显隐状态，单元格使用 `getVisibleCells`。Peach 保留共用排序比较器、来源 ID（`getRowId`）、跨视图勾选集合、页码裁剪和批量写入策略；排序作用在全集，分页只切最后一步，频率、日期与数量按原始值排序。`frontend/test/react/follow-manage.test.tsx` 验证排序、取消选择、跨页跨视图勾选、批量写与清单变化。
- 馆藏表格列宽复用 React Aria Components 1.22.1（Apache-2.0）的 `ResizableTableContainer` 与 `ColumnResizer`，按官方 [Table 列宽调整](https://react-aria.adobe.com/Table#column-resizing) 组合现有 BoardUI Table；鼠标、触摸与键盘调整由该组件处理。列隐藏复用 TanStack Table 9.3.1 的 `columnVisibilityFeature` 与现有 Popover、Checkbox；隐藏列仍可参与服务端排序。`RatingStars` 共用馆藏表格、馆藏详情和 JAV 来源评分的图形与颜色，支持交互星级与只读小数填充；评分取值共用 `rating-values.ts`，表格写入复用 `/api/feedback`、`useAction`、查询缓存与操作回执。Peach 维护各列默认值和上下限、浏览器偏好保存与重置；右侧弹性空白列承接剩余宽度，不参与偏好保存。使用现有依赖，无新增包；回归覆盖长名称、缺图、宽屏两种布局、列宽与显示偏好、隐藏列排序、评分保存与取消、失败重试及撤销。
- 所有数据表格通过 `DataTableFrame` 复用 React Aria 的列宽容器、`wireTableScroller` 和覆盖式滚动条，`TableColumnControls` 负责列显示菜单和重置，`useTablePreferences` 按表隔离浏览器列宽与显示偏好。各表只声明列名、默认宽度、上下限和必留身份列，TanStack 的 `columnVisibilityFeature` 负责实际显隐，隐藏字段保留排序入口。拖动沿用 `wireHorizontalScroller` 的阈值、点击拦截与卸载清理，表格关闭滚轮转向、渐隐和回弹。按钮、链接、勾选框及列宽手柄自行处理指针；拖动不触发行选择。馆藏的勾选框由显式多选状态控制，取消动作共用 `setSelectMode(false, true)`。
- 表头选择复用 `TableSelectionHeader`，只统计对应范围内仍存在且可选的行；关注与 JAV 订阅选择当前页，别名和通用管理表选择筛选全集。链接命中范围由共用表格样式和 `SourceLink` 限定为内容宽度；站点图标复用 `SourceIcon`、`SiteLabel` 与缓存端点。
- 别名改名复用现有别名端点和 `FollowStore.rename_author_group`；实体名称更新从既有端点提取为 `entities.prefer_entity_name`，共用名称碰撞检查、原名别名和兼容字段同步。别名组、关联实体与作品字段使用同一 SQLite 事务，冲突整体回滚；测试仅操作临时数据库，无迁移和新依赖。
- 折叠正文复用 `setCollapseRegionOpen`、`setCollapseOpen` 和 `growCollapse`；React 外置按钮通过 `CollapseRegion` 保留挂载内容，原生详情使用 `Disclosure`。`CollapseChevron` 与侧栏、教程的稳定箭头元素使用现有 `--motion-swap`；高度维持共享 Collapse 的 200ms 过渡，快速反向点击由同一代次保护处理，减少动态效果沿用全站样式。
- 排序方向的 React `IconSwap` 与 HTML `iconSwapHtml` 共用 `.iconswap` 状态、模糊与缩放参数；两枚图标保持挂载，BoardUI 按钮通过直属 `data-icon-state` 驱动稳定图标节点，不修改 vendor。换批忙态复用 `#i-shuffle` 的两条描线及既定 2.2s 周期，`FilterIconButton` 仅为此保留图标，其余动作继续使用 Spinner。JAV 标题复用 Stage 的 `revealTexts`，不新增触发计时器或动效依赖。
- 窄屏筛选框共用 `filterScrollState()`、现有滚动帧调度和原生 sticky；同一方向累计 8px 再切换吸顶，保留文档占位与键盘可达性。
- 搜索玻璃用 `glideEase()` 的采样弹簧，`frontend/src/application/search-morph.js` 只管视口边界与轮廓关键帧。
- 横排滚到头的回弹是 `wireHorizontalScroller` 内的 `edgeBounce`，头像排、厂牌排、新作排、筛选条共用；transitions.dev 的 43 条配方里没有（2026-09-23 核对）。越界位移借 UIScrollView 的橡皮筋公式 `(1 - 1/(x·c/d + 1))·d`，c = 0.55，与 use-gesture（MIT）的 `rubberband` 同一条，回弹走 `--spring-pane`。只抄公式不引依赖：拖动与滚轮归属已由 `wireHorizontalScroller` 判定。新作排自动滚动是同文件的 `wireAutoScroll`。
- React 横向导航通过 `useHorizontalScroller` 绑定上述共享行为，适用于页签、分段控件、筛选栏和首字跳转；`data-horizontal-scroll` 隐藏原生滚动条，左右渐隐由实际溢出方向决定。容器和子项尺寸、文本及增删变化都会重算，竖向分类列关闭绑定；表格和代码块继续使用覆盖式滑块，不新增依赖。
- 管理页头及 `manageHeaderSkeletonHtml` 共用一级导航、面包屑、页面标题的顺序，页内分类放在标题之后；管理条保持跨模块导航，面包屑保留上级链接与当前页语义。
- 浮层筛选首页是页面内组件 `catalog-filter`，资料页是 `entity-filter`，共用 `FilterGlassRows` 两排、交集条与排序键，滑动玻璃走 `use-view-glide.ts`。外框管玻璃与吸顶，壳管查询状态和取数，岛只画、动作回壳，按下态在发请求前由壳经 `updateManagedRoute` 推到；身份与观看状态的组合沿用 `/api/items`。
- `web/board.css` 共用正式页面结构。首启、登录与错误三页是独立页面包 `/dist/peach-pages.js` 里的 React 页，服务端只吐 `web_entry.page_shell()` 那一张薄壳，外框是 `frontend/src/react/pages/auth-card.tsx`，SPA 外壳之外的新页面挂进同一个包。
- `frontend/src/number-setting.ts` 共用带单位输入、可选 Switch、整数边界和锚定错误提示；关闭保留上次合法值，异步读取后切换也恢复实际值，保存归调用方。
- 筛选内层的标签胶囊是 `FilterPill`，换一批、排序键与交集条是 `entity-filter-page.tsx` 导出的同一组组件，页面各自提供查询键与读数；`collectionHeaderHtml` 只剩资料页骨架那一排读数。横向行的拖动、滚轮、渐隐与卸载清理归 `wireHorizontalScroller` 同一个生命周期。
- 选择范围与工具条用 `frontend/src/selection.ts`；馆藏、关注与复核保持各自身份、可见顺序、默认选择与写入权限，批量失败项的保留归业务。
- 灰色页签与管理导航使用 `frontend/src/react/components/pill-tabs.tsx`，共用从 BoardUI `PillTabList` 适配的测量与过渡；React Aria 集合通过 Portal 承载装饰层。路由、键盘、纵横布局和选中项仍由调用方维护；减少动态效果时关闭位移过渡。来源与适配边界见 `reference-snapshots/boardui-settings-tabs.md`。
- React 设置分区用 `frontend/src/react/settings/section.tsx`：`Section` 给标题、卡片与表单外壳，`Footer`、`Note`、`ErrorText`、`FactList`、`Progress`、`Disclosure` 补齐 BoardUI 注册表没有的部分。`Rows` 与 `FactList` 标记共享行组，分隔线由行与相邻组边界共同绘制，左侧内缩、右侧通到卡片边缘；设置弹层遵循同一规则，底部操作栏使用通栏线。`service-preferences.tsx` 组合缩略图与订阅采集参数，继续使用已有设置、关注计划和缩略图 API。`use-action.ts` 的 `useAction` 管提交互斥、卸载取消与原位错误，`busy-props.ts` 的 `busyProps` 写忙态；媒体目录行（`folder-rows.tsx`）与密码加确认两格（`password-pair.tsx`）由配置页与首启页共用；密码校验与服务端回执归各分区，不自动重试写入。口味读取、封面采集、amane 桥重建、关注检查与查找共用 `frontend/src/react/background-job.ts` 的 `useBackgroundJob`。
- 增量列表用 `catalog-grid/catalog-grid-page.tsx` 的 `LoadMore`：请求互斥、失败留原位重试、卸载即停；目录、资料页照片墙与关注页注入读取和可用条件。首页页码在读取成功后推进，照片沿用随机种子，关注合并分组；显式页码用 `pagination.ts`。
- 在图上框一块由 `frontend/src/crop-geometry.ts`（纯算术）加 `react/crop/crop-frame.tsx`（四块压暗、一个可拖可缩的框）承担，换头像与裁封面共用；坐标一律是源图像素、右下开区间。不引 `react-image-crop`：换到的只有把手样式，代价是一条依赖和它自己的坐标约定。裁封面通过 Application 的媒体域动作连接 React 裁剪组件（ADR-0031）。
- 后台任务用 `watchJob`、`followJobProgress` 默认面板与 `jobActivityHtml` 的真实计数／未知总量显示，关注、来源扫描、链接检查和扫描采集共用；业务保留启动、终态回执和结果面板，不新增轮询循环。任务本体是 `jobs.BackgroundJob`，不加队列或调度依赖；浏览器由 `frontend/src/jobs.ts` 跟进，刷新后经读接口恢复。可恢复的采集任务由本机恢复记录重放，其他任务只保留终态；`BackgroundJob.update(job_id)` 报阶段与计数，查询不重新执行任务。
- 遗留层反馈控件 `noteHtml`、`progressHtml`、`gaugeHtml`、`projectBannerHtml` 与 `wireContextCard` 集中在共享 UI 模块；信息卡片用原生 Popover 与现有锚定菜单定位，不加浮层依赖。证据见 `reference-snapshots/vercel-geist-note-progress-switch-analytics.md`。
- 资源核对复用 `web_resource_sync` 的目录枚举、离线跳过、写前逐条复验与 BackgroundJob，覆盖 local、115、PikPak；失效记录的永久删除复用 `web_batch.purge_assets`，文件仍在盘上的行进 `blocked`。确认弹层复用 Fieldset、Note、Toast 与 confirmModal：失败留在弹层，危险动作初始聚焦取消，忙态阻止重入与关闭；不引入另一套对话框库。
- 新界面走 BoardUI／React（ADR-0031），遗留层共用的 Geist 控件随页面迁走，不引入 Geist React 运行时。覆盖式滚动条 `attachOverlayScrollbar`（滑块不占宽度）、Collapse 的 `wireCollapse`／`setCollapseOpen`、Geist Select 的 `selectFieldHtml`／`wireSelectField`、来源站标 `MEDIA_SOURCE_ICONS`，以及模板、骨架、确认框等其余共用控件的唯一实现在 `frontend/src/ui-kit/`，Application 与 React 页面直接引用共享源码，随 `/dist/peach-app.js` 发出一份；独立页面包只打入用到的控件；覆盖式滚动条与 `.ui-geist-scroller`（只给两端渐隐）可叠加；整页异步重绘复用导航代际隔离。
- 局部等待复用 `skeleton-sheen`：绝对定位的微光由占位元素自己的 `relative` 或 `absolute` 定位，并在该元素内裁切。JAV 评论占位在折叠正文内预留结构，首次展开按占位高度测量；请求仍按展开触发，收起时不标记等待态。
- 图标按钮统一清除浏览器内边距并居中 SVG，不覆盖业务显隐。Remix Icon 由 `vendor_web_dependencies.mjs` 生成设置导航 symbol；随机按钮保留原有双路径动画。
- 宽字形的比例统一取自 `core/icon-geometry.ts`；遗留模板、React 控件、设置和实体页共用。控件按位置决定高度，Aa 等字形按比例定宽，同级图标以实际轮廓核验。
- 统计页与口味页的柱状、径向、雷达图复用 EvilCharts Recharts 分支（MIT，源码逐字复制进 `frontend/src/react/evilcharts/`，依赖 `recharts`、`motion`、`clsx`），单系列柱状图统一走 `frontend/src/react/charts/bar-card.tsx` 的 `BarCard`，悬停浮层统一走 `charts/chart-tip.tsx` 的 `ChartTip`。星期 × 小时与每日热力图是 `charts/heat-card.tsx` 的 `ActivityHeat`，统计页播放时间与口味页浏览活跃共用；EvilCharts 没有这类图（ADR-0076）。
- `frontend/src/react/taste/taste.ts` 使用 d3-sankey（BSD-3-Clause）及其类型包计算来源网站到创作者线索的流向。布局依赖不读取浏览历史；Peach 提供去重聚合值并负责隐私边界。分发许可随 `web/vendor/d3-LICENSE.txt` 保留。

复核用 Checkbox、Button、Badge、Select 与 `/api/review/decision`，默认勾选、沿用馆藏页 Shift 连选；支持跨组通过／拒绝与无歧义的共同来源选择。按候选数量、来源组合或字段分组，每项只出现一次，切组保留选择；成功移出、失败保留，离开页面即停。整页在 `frontend/src/react/review/`，一条队列一个 `queryKey`，判定后改缓存不重取。React Aria Components 1.22.1 的 `Radio`／`Checkbox` 继续承载原生焦点与方向键；共用 `base.css` 将隐藏输入框的定位归于所属标签，来源切换只滚动卡片正文，分段单选、媒体库图标选择和复选框使用同一定位基线，不新增依赖。批准回执在同一事务中读取实际资产版本，缓存只推进仍持有该次写入前版本的候选；逐项与批量提交共用缓存中的并发凭据。身份候选用创作者页、作品详情与 revealSource 核对样本；来源图与缺图占位共用 220px 预览区，样本支持无缩略图作品，回收站不参与。

本地 NFO 配对复用 `library_nfo`、`catalog_rules` 的番号与分卷识别、标准库 ElementTree 及现有资料补空流程。[Kodi NFO 文档](https://kodi.wiki/view/NFO_files/Movies)的同名文件与 `movie.nfo` 约定于 2026-10-17 核对；只参照公开格式，没有复制外部源码。Peach 保留同番号分卷共享、同名文件优先、多份匹配拒绝、内容番号冲突检查和输入安全限制。Kodi 整套媒体中心没有作为依赖引入；标准库随 Python 3.14 运行，无额外体积或许可证。NFO 读取后复用来源缓存与缺失缓存核查在线字段；`requires_review` 跟随候选保留覆盖复核要求，人工决定保存已展示的候选身份，见 ADR-0108。隔离媒体与账本回归覆盖共用 NFO、不同作品混放、错误 NFO 继续在线补全、补空与覆盖分流，以及连续批准的版本回执；真实反馈的 NFO 样本尚未取得，无新增依赖。

## 本机设置与卸载

- Peach 代理复用 HTTPX 的 `trust_env`、`proxy` 与本机 CredentialStore；来源只选择公共策略或直接连接，地址不回传。单一旧代理可继承，多个地址需明确选择。
- 自启用 Windows WScript.Shell 快捷方式（[微软文档](https://learn.microsoft.com/en-us/troubleshoot/windows-client/admin-development/create-desktop-shortcut-with-wsh)，TargetPath、Arguments 与 Save，自带 COM，不引 pylnk3）和 macOS LaunchAgent；临时中文路径的真实快捷方式读、写、移除通过。
- 独立包卸载用正常托盘退出和 Windows PowerShell 助手；计划限于程序标记、数据直属目录、媒体不重叠，助手拒绝目录链接，会退出仍从程序目录运行的进程并重试删除。完全卸载只把 `config.toml.<说明>-<日期>-<时刻>` 当 Peach 写的设置备份，手工的 `config.toml.bak` 保留；混入被占用文件、数据、媒体与无关文件的真实输入验证只删计划内容与整个解压目录。源码树只给手动卸载说明。
- 扫描与采集统一挂在数据管理；常驻任务卡跳转同一入口。默认排序与方向使用浏览偏好，显式 URL 优先。

目录页进度横幅、缺预览提示与数据管理卡片共读 `LIBRARY_PROCESSING_KEY`（[共享状态](FRONTEND.md#共享状态怎么写)）；启动只提交一次，状态查询接续托盘首次处理。首页进度在完成后收起，失败跳转数据管理；数据管理持续读取阶段与真实计数。Geist Banner 取证与 Peach 差异见 [docs/reference-snapshots/vercel-geist-library-banner.md](reference-snapshots/vercel-geist-library-banner.md)。

缺预览提示复用 `cardArtwork` 的可用性判据，目录、实体作品区与详情共用 `LibraryCompletionPrompt` 和 `ProcessingActions`。`/api/library-processing` 的 `collect` 阶段补资料与本地预览，`previews` 仅生成本地九宫格，`metadata` 仅采集资料；可选 `asset_ids` 限定已存在影片，空数组拒绝，全库扫描不用于定向处理。九宫格复用 `frame_capture`、FFmpegResolver 和 `/poster`，本地阶段先于外部查询执行，沿用任务日志和失败重试；不增加依赖。浏览器回归使用临时演示库和拦截响应验证默认动作、下拉、焦点归还及完成后的卡面更新。

## 独立测试包在线更新

- 任务起跑与安装预约复用已固定的 filelock 4.2.0（MIT，Windows/macOS/Linux，无额外依赖）和原子 JSON。`update_tasks` 在同一数据目录内串行登记任务和预约安装，覆盖各服务进程、任务中心、后继领取和 `job_main` 批处理。安装请求触发采集任务在检查点保存并暂停，任务中心保留 `pending` 行；新采集请求进入等待。安装入口等在途步骤保存进度，随后停止自己的服务，不要求用户等待整轮任务结束。源码批处理保留 PID 锁，写完在途批次后等待安装，结束后由原进程继续。
- 安装器在临时目录展开随包运行时，以 `--installer-prepare` 承接馆藏处理状态并暂停任务；预约归安装器持有，完成或取消时释放。在线更新将预约交给更新助手，切换目录和迁移完成后释放，失败回滚也释放。恢复轮询复用 APScheduler，安装取消时现有服务也会接回任务。不采用新任务队列或更新框架：任务语义、PyInstaller 目录切换和 Inno Setup 生命周期继续由已有实现承担。
- `job_recovery` 保存馆藏处理范围、阶段、指定影片、时间轴密度、单部封面、关注、订阅和想要资料的请求；服务启动或安装结束后只领取未完成记录。暂停任务复用任务中心的同一行，已完成、失败和主动停止的任务不循环重试。馆藏预览在产物登记后保存影片检查点，元数据检查点跟随候选 CSV 成功落盘；未取得结果的项目不记完成。时间轴复用已有索引判定。恢复领取和新任务起跑共用安装闸门，数据仍留在本机 state 目录，不引入 ledger 迁移。

- 自动更新设置用 APScheduler（见「必须复用」表的定时轮询）、共享 HTTPX 发行查询、filelock 与原子 JSON 写入，安装走 `standalone_update`。按 [interval trigger](https://apscheduler.readthedocs.io/en/3.x/modules/triggers/interval.html) 每分钟查是否到期，本机持久时间与文件锁协调多个服务；关闭、6/24/168 小时间隔与源码下载限制归 Peach。默认关闭，下载只准备安装，重启仍需确认；设置存 state 目录的 `automatic-updates.json`。
- 版本与资产信息用 [GitHub Releases REST API](https://docs.github.com/en/rest/releases/assets)（测试通道含预发布），查询与流式下载用项目 HTTPX，ZIP 解压用标准库，互斥用 FileLock。只有已上传完整独立包的发布才进更新，优先选择 `*-update.zip`，历史完整 ZIP 保留原名供旧客户端更新。`package_windows_release.py` 从同一构建目录生成完整包、应用更新包与 FFmpeg、untrunc、cloudflared、人脸模型（`face-models`）工具包；更新包内清单固定工具文件哈希、工具包大小与 SHA-256，运行时只复用校验相符的文件，按需下载不符的工具。清单可以多出本版不认得的工具，读取时只留本版认得的那些，认得的一个都不能少；新增工具包由该工具自己的运行时兜底补齐，不让旧版更新器拒收整个更新包。工具包路径限于对应工具目录，补齐后再次校验并沿用同卷暂存与目录回滚。复用已有 HTTPX、hashlib、zipfile、copy2，无新增依赖；不引入 Velopack 的包格式或二进制差分机制。隔离回归用实际生成的 ZIP 验证工具复用、独立补下载与失败保留现有安装，不使用真实 ledger。
- 安装策略与进度归 Peach：下载校验后在程序同卷暂存，用户确认重启，复制出来的包内助手等原托盘退出再切换完整目录；失败保留或恢复旧目录。配置、数据库与媒体不进更新包。
- 轻量安装包复用应用更新包的工具清单、`standalone_update.prepare_tools` 与既有 HTTPX、hashlib、zipfile。Inno Setup 6.7.3 用 [external 文件](https://jrsoftware.org/ishelp/topic_filessection.htm)安装临时目录中已验证的工具，用[滚动进度页](https://jrsoftware.org/ishelp/topic_isxfunc_createoutputmarqueeprogresspage.htm)显示准备状态；官方 API 已于 2026-10-17 核对。工具先在预检目录准备，成功后才暂停任务并覆盖安装；安装包旁的工具 ZIP 同样按清单校验，不读取馆藏配置或增加依赖。不引入另一套下载器或更新框架，校验及解压路径与在线更新共用。
- 不用 [Velopack](https://docs.velopack.io/packaging/operating-systems/windows)（要求其安装目录与包格式）与 [WinSparkle](https://winsparkle.org/)（要求 appcast 与原生更新界面）：产物是 PyInstaller ZIP、进度在 Web 显示，沿用托盘进程与目录替换协议。
- Web 复用 Fieldset、Progress、confirmModal；状态由 `standalone-update.json` 保存。下载按字节计量，解压按文件数计量，替换使用阶段进度；服务重启期间保留等待状态，恢复连接后核对版本。
- 新版有待应用迁移时，重启安装复用 `migrate upgrade --yes`，先保存 SQLite 备份；迁移或启动失败时恢复数据库与程序。数据库备份位于用户 Peach 数据目录的 `state/update-backups/`。
- 更新事务按当前配置读取 state 与账本路径，助手显式继承所选 Peach 数据目录。已有数据目录恢复复用严格配置解析与位置记录，只接受含配置和账本的目录。`scripts/smoke_desktop.py` 验证恢复及再次启动；`scripts/smoke_online_update.py` 使用真实 Release 包和临时馆藏验证在线更新，可注入无法启动的暂存 EXE 验证回滚。
- 覆盖升级验收复用 `smoke_desktop` 的首启配置、临时 Peach 数据目录、登录和进程退出；`scripts/smoke_overlay_upgrade.py` 使用标准库下载并校验已发布制品，分别走 ZIP 原位解压和 Inno Setup 原位安装。安装包只在没有 Peach 安装登记的 Actions runner 上验收，覆盖安装器停止旧进程、目录记忆、配置与密码保留、账本哨兵、普通启动及卸载保留数据；不新增依赖。

JAV 默认封面（官方封面／预览图）与视频默认大小（大图／小图）独立保存，用 localStorage、共享 Switch 与既有 `/cover`、`/poster`。设置弹窗同步首页与 JAV 的版式，筛选条可单独调当前视图。`frontend/src/jav-artwork.ts` 管作品身份、偏好恢复与缺图回退，首页、接着看、实体作品、详情推荐、Mix 静止与翻图、播放队列共用封面选择。小图展示完整封套，竖版正封完整放入大图卡片；新作封面完成取景才显示，缓存图插入时重算取景。

关注视频与馆藏详情的续播复用 Video.js 10.2.0（Apache-2.0）的元数据事件和 `currentTime`、浏览器 localStorage 与既有活动接口。`player/progress` 按本地资产、关注条目和媒体序号登记秒数，暂停、定位、关闭、小窗销毁、页面退出均保存；原生 video 回退也恢复，明确的时间深链优先，放完从头开始。本地既有记录可按 `leave_ratio × duration` 恢复；最远观看位置与累计观看时长不作为续播秒数。活动请求用 keepalive，销毁同步冲掉末段并清理定时器与监听。此状态属于当前浏览器，未引入账本迁移或跨设备同步，无新增依赖。

详情人物头像复用 `card-art.entityFaceImg` 与 `avatarFrame`，图片直接挂在有尺寸的 `[data-id-face]` 圆框内。取景读取图片的父框几何，`display:contents` 包装层没有可用尺寸。首字与图片由同一段 HTML 承载，图片加载失败时共用回退链，浏览器回归覆盖带人脸框的桌面与手机详情。

图片尺寸档复用 `previews.DerivedImageService`：实体图默认取长边 640 的 `/entity-image?thumb=1`，只有资料页大位取原件；卡片封面按屏幕像素密度从 `/cover?thumb=2`（长边 800）或 `thumb=1`（长边 1600）起步，`framing.upgradeCover` 量过显示尺寸再逐档换到原件。两档封面同在 `generated/cover-thumbs/`，按长边分文件名、按需生成。侧栏与登录卡的站标用 `scripts/generate_brand_assets.py` 缩出的 64 与 128 px 小图，以 `srcset` 挑选。

新作封面复用 `best_cover` 的官方候选与 `cover_artwork.install_cover`，保存本地封面、正封框、人脸坐标与来源证据。JavDB 图片仅作来源复核证据，不进入安装、封面索引、详情封面投影或缺图兜底；`scripts/quarantine_javdb_covers.py` 将有来源证据的历史图片及边车移入可恢复归档。未取得合格来源时显示未取得状态，详见 ADR-0107。

无快照的有码作品由封面入口复用现有 `DmmSource` 的 GraphQL 查询与精确身份核验；成功快照直接展开 DMM 图片候选，r18.dev 与 DMM 使用同一份目录证据。FC2 来源快照通过 `storage_original` 提取发行方存储原件，排除社区图床。目录查询沿用来源冷却，HTTP、网络与解析失败分别保留未取得状态。

官方目录的连接与超时异常按 [HTTPX 异常层次](https://www.python-httpx.org/exceptions/)中的 `TransportError` 隔离，复用已固定的 `httpx 0.28.1`（BSD-3-Clause）与既有候选比较流程，不增加依赖或重试层。目录未作答时仍比较其他候选；没有可用图片时保留可重试状态，只有来源均有确定答复才记录无图。动作预算与编程错误继续向调用方传播。馆藏、库外新作与手动重探共用 `best_cover`，已安装图片和来源边车继续由原子安装入口管理。

官方综合目录的聚合无图记忆按 `upgrade_rules.OFFICIAL_COVER_CATALOG_MISSES` 复用。规则版本不匹配的非 FC2 聚合记录在后续查询时重新核验；FC2 商品图记录、逐站无图记忆、有效图片、资料快照及个人记录保留。查询结果照常写回现有记忆文件，不启动额外全库采集。

批量封面 CSV 用 `outcome` 区分 `not_found` 与 `unavailable`，`catalog_rules` 保存无图判据版本。续跑只跳过当前规则确认的目录无图记录；旧综合目录记录允许重探，FC2 的确定答复与成功来源记录继续复用。读取不改写原日志，实际执行时沿用原子日志写入。

MGS 专属发行先查自营商品目录，Prestige 番号复用 `metadata_routes.maker_sites` 路由后汇总集团官网与 MGS 图片；手上已有候选仍一起比较实际尺寸。专属目录未取得候选时才查综合目录，避免无关目录故障消耗整项预算。

正式封面和商品图以像素面积择优，同尺寸优先商品图，剧照预览保留末档；图片角色不让低清商品图覆盖更大的官方封面。

只有厂牌图片的快照继续补查 DMM 目录；成功的 DMM 来源快照才省略目录查询，按厂牌编号构造的 CDN 地址和 r18.dev 的缺失记忆都不替代 DMM 查询。

人脸缓存使用 `cover-face-v4` 与源图尺寸校验。`detect_cover_faces.py` 自动重算过期记录，逐图核查加 `--refresh-faces` 可在重算整图主脸后再决定版式；无可信书脊的 4:3、√2:1 画布或左侧主脸明显占优的大封按整幅画面取景。安装、批次重算与恢复默认取景读取同一版式标记。

传统正封完整居中，比例留白复用同图派生档的模糊补底，新作与视频流卡片使用同一份取景规则。整幅大封使用卡片纯色底，竖版按主脸填满，横版完整放入容器；图片切换时清理残留背景属性。

取景由 `poster-crop-v13` 管理。Blu-ray 来源标题、明确的版次标签与图片比例共同决定 0.85 正封比例，标题随正封框保留，重算人脸与正封框均读取同一版次；有效宽正封框在没有版次标题的卡片上也完整显示。VR 标记、IENEE、IENFE、SDHS 数字发行拼图，以及可信主脸跨过 DVD 正封先验边界的大封保留整幅画面，由 `cover_frame.layout=still` 传给卡片。两条满高接缝夹出居中正封且两侧纹理均低于正封四分之一时，只显示中间正封。大封在竖版大图按主脸居中填满，横版小图完整显示，均不使用模糊补边；JPEG 软边的书脊识别结合突出度、左忙右静的方向与正封侧基线。手工框保持用户取景。重试队列按最早尝试时间轮转，收起的合集沿用设置跳过；逐番号结果保存在 `feed-cover-attempts/`。资料已齐、只缺封面的新作另派 `feed-cover`（补新作封面）批次，只取图、不写账本，走独立后继通道；排在队里或正在跑的番号不再进下一批。复用现有 HTTP、Pillow、OpenCV 与文件锁，无新增依赖。

馆藏与新作取图共用 `cover_artwork.metadata_snapshots` 和 `best_cover`，片商官网、发行方、R18 与 DMM 的官方候选均参与尺寸比较。馆藏采集将长边 1600px 作为高清重探界限，社区转存图可由官方封面替换；同类官方图按像素面积升级，FC2 保留商品图的来源保护。`scripts/audit_cover_artwork.py` 逐张核对尺寸、来源、版次与取景框，输出 CSV；`scripts/upgrade_audited_covers.py` 按已有官方快照逐番号重探，`--live` 经同一官方链在线补查，保存原件备份与结果检查点。两者只处理可重建图片和边车，不写 ledger。

## 复用决策门槛

每次决定「用现成的还是自己写」都按这四条走，本节其余各条是按这四条做出的具体决定：

- 先用真实输入做无写入 POC，再决定「直接依赖、固定来源实现、保留自研」三者之一。
- 采用项要记录固定版本、许可证、首个消费者和 Peach 保留的领域边界；候选依赖不得空转。
- 保留自研要记录被拒绝的候选和不可替代约束，不能只写「特殊需求」。
- 外部项目不适合作为运行时依赖，但其公开数据模型或算法明显更成熟时，固定 revision 后作为参考
  实现；许可证不允许派生或来源不稳定时只作行为证据，不复制代码。

- Python 安装与构建用 [uv](https://github.com/astral-sh/uv)（MIT/Apache-2.0，`pyproject.toml` 只设下限 `>=0.12.13`，不进依赖图）与官方 setup-uv（MIT，版本见 [测试工作流](../.github/workflows/test.yml)）：uv 项目接口、`uv.lock`、`uv sync --locked`，Dependabot 走官方 `uv` 生态。开发与构建在隔离工作树建环境，生产 venv 不参与精确同步；直接依赖精确固定，传递依赖由锁文件复现。
  测试库复用 `tests/support/ledger.py`：迁移生成模板后复制独立临时库（[耗时](SOURCING.md#依赖与工具实测)），真实迁移测试仍执行迁移；重试测试用已有 sleeper 注入点。CI 用 GitHub Actions 独立 runner 分片与现有 unittest 入口，Peach 只维护影响域策略，不引并发测试框架（见 `TESTING.md`）。
- 访问密码复用 Python 3.14 的 [hashlib.scrypt](https://docs.python.org/3.14/library/hashlib.html) 与 OpenSSL，浏览器会话复用 [ItsDangerous](https://itsdangerous.palletsprojects.com/en/stable/)（Pallets、BSD-3-Clause、纯 Python、wheel 16 KB、无传递依赖），本机原子配置写入用 tempfile/os.replace 与 filelock；认证入口的访问口令、三种拒绝响应与本机配置守卫照旧复用。Starlette SessionMiddleware 统一时长、随响应续期，满足不了每台设备自选截止时间，所以直接用同源签名库，Peach 管可选密码、截止时间与撤销，不带账户体系与迁移。
- Cloudflare Quick Tunnel 用官方 `cloudflared`（Apache-2.0），不自写隧道协议。源码环境只管 PATH／环境变量里的进程；Windows 独立包旁路固定 `2026.9.0`，资产、地址与 SHA-256 在 `scripts/cloudflared-windows.json`，`fetch_cloudflared.ps1` 与构建脚本双重校验。就绪判据是官方 `--pidfile`（首次连上边缘才写），未连上不宣称可用。源码 HTTPS origin 用项目 CA，独立包用回环 HTTP，写请求来源校验带当前进程持有的随机 URL。

- README 交付检查用系统 Git 的 `diff --no-renames -z` 与 [`interpret-trailers --parse`](https://git-scm.com/docs/git-interpret-trailers)，挂在 `agent_worktree.py ready/integrate`；Peach 只定义影响文件与双语声明 policy。原生 hook 不随 clone 安装、判断不了文案语义，所以挂在共有的交付入口上（[README 维护](README_MAINTENANCE.md)）。
- 配置访问判定用 ASGI 连接的 `client` / `server` 地址与标准库 `ipaddress`：本机连接匹配回环地址或服务端 IP，Host 只校验托盘配置的域名或绑定地址、不证明调用方在本机。配置保存用修订号校验、原子替换与 `SetupGate` 重载标记，托盘子服务以 `PEACH_TRAY_MANAGED` 声明重载能力。安装检测用 `winreg`、`shutil.which` 与安装目录，媒体工具用 `FFmpegResolver`，脱盘不判为未安装。下载入口 2026-09-06 核验：[CloudDrive](https://www.clouddrive2.com/download.html)、[WinFsp](https://winfsp.dev/rel/)、[macFUSE](https://macfuse.github.io/)、[FFmpeg](https://ffmpeg.org/download.html)、[OpenSSL](https://openssl-library.org/source/)。
- 发行身份用各来源解析器与 Seesaa 的原始 DTO，数字前缀等价是 Peach 的领域 policy。查询回退不能承担身份确认（[`390JAC-040` 实例](SOURCING.md#依赖与工具实测)），响应按原始查询检查，MGStage 官方详情路径可佐证展示编号别名；外部适配器只取值，首条搜索命中不作 ledger 身份断言。
- Seesaa 作品表用 HTTPX、Beautiful Soup 4.15.0（MIT）与现有 `HostLimiter`、番号规范化、字段候选和快照协议。Javinizer-Go `d9724f239d7e127afcb747fa8ce4358685912f50`（MIT）与 MetaTube `6a5e6128c725187aeaf921d48ed7d9cd9f30671b`（Apache-2.0）都没有 Seesaa 适配器（2026-09-06 核对），所以 `peach.sources.seesaa` 承担 EUC-JP、列映射、精确行身份与未知名单保护，消费者是 `scrape_codes --profile seesaa`（[站点细节](SOURCING.md#seesaa-wiki-作品证据)）。

- 补女优别名后继（ADR-0055、0061、0064）复用 `minnano_av` 检索与资料表解析、`sources.seesaa.WikiPages`、
  `sources.fc2cmadb` 女优栏、`HostLimiter`、`scraping_access` 冷却、`metadata_alias_resolve.is_planning_alias` 与
  `apply_alias_candidates.py` 的四种不写口径，撤回用 `revert_auto_landing.py`。minnano-av 不用 `page_cache.Site`
  （丢跳转后的最终地址、限速器按实例各起、会把 200 的验证页当正文缓存），由 `MinnanoPages` 记最终地址、共用一个
  `HostLimiter`、认出验证页不缓存并记冷却；传输是 `SourceTransport`，被拦时按 `browser_fallback` 走
  `browser_transport.shared`（见 [来源采集](SOURCING.md#minnano-av-的间歇拦截)）。
- 补女优资料后继（`performer_profile_followup`，ADR-0067）复用 `minnano_profile_pages`、名字核对与 `MinnanoPages`
  （加 `source` 冷却键与 `max_age`，avwikidb 与 javdb 也用），排单用 ADR-0053 的 `Attempts`（写成的记号保 30 天）。
  解析在 `minnano_av.profile`（资料表）与 `avwikidb`（JSON-LD），读写在 `performer_profiles`。`kanojo-db/scrapers`
  与 `stashapp/CommunityScrapers` 的 Minnano-AV 规则都不是可装的库（后者是 Stash XPath 配置，ADR-0021）。
  女优页头（ADR-0069）由 `performer_header` 出五项与别名分组，別名栏注记由 `minnano_av.name_entries` 拆，
  拆名字用 `sources.seesaa.split_names`。

文档检查用 seiso（MIT，开发依赖），[文案门槛](../tests/test_copy_final_state.py) 调用其稳定规则；文件分类与第三方原文边界见 [seiso 配置](../seiso.toml)，表达与人工复核见 [文档与界面文案](WRITING.md)。不自建 Markdown 文档职责解析器。

测试与集成用 `test_runner.py`、`agent_worktree.py`，进程互斥用开发依赖 `filelock` 的 [`FileLock`](https://py-filelock.readthedocs.io/en/stable/tutorials.html)。全量验证与集成共用一把锁、最多等待 30 分钟；验证持锁至记录写入完成。临时 Git 仓库回归覆盖互斥、等待和释放；代码、环境和范围记录属于 Peach 的集成约束。记录失效返回 `4`，Windows 托盘据此最多重试三轮，用例失败返回 `1`。两端测试入口通过 `test_environment.py` 复用现有 `find_uv` 与主检出 `Dependencies.check`；隔离工作树使用 uv 官方锁文件同步，不新增包管理实现或运行依赖。同步失败停止测试，主检出只读检查；策略与行为回归见 `test_test_environment.py`。

定向调试复用标准库 unittest 的按名字加载与现有浏览器夹具，记录复用沿用文件清单、影响域和 FileLock，不新增测试框架或缓存服务。局部成功记录保留未受影响域的原验证时间，失败域不能从历史基线恢复；浏览器失败即停。回归覆盖过期、环境差异、未知与共享文件、失败后再次验证、路径越界及不签调试证明，详见 [测试](TESTING.md#定向调试与局部记录)。

提交消息复用 Git 的 [`interpret-trailers --parse`](https://git-scm.com/docs/git-interpret-trailers)，署名与 README 声明判据由 `co_author.py`、`check_readme_impact.py` 共用；`check_commit_message.py` 接到仓库 `commit-msg` 钩子。Git 自身处理注释与多行 trailer，Peach 只检查字段形态和分段。Windows Git 2.55.0.windows.3 的临时仓库回归覆盖拒绝提交、保留暂存、人类与智能体共同署名、amend 和合并消息；不新增解析依赖。具体触发范围见 [README 维护](README_MAINTENANCE.md)。

### 播放、采集、发布与打包

各条的实测与取证见 [复用取证记录](SOURCING.md#播放与控件实证)。

- 页面、框体、操作条与选中项共用一套灰阶，操作条用 `--overlay-5`。
- javdb 属有码与素人链的社区档，候选保留 community 来源性质，不自动写真相字段。
- [JavDB Web UI 实证](reference-snapshots/javdb-web-ui-poc.md)：库外作品详情复用舞台、人物身份、想要、`WantMagnets` 与云下载组件；`javdb_public.PublicAPI` 复用 `HttpxTransport`（httpx 0.28.1，BSD-3-Clause）、`HostLimiter`、Pillow 12.3.0 与标准库 MD5/XOR，独立映射公开协议。匿名详情、两页评论、6 条样本资源、封面与预览图像素已取得；全站完整性和不限流未证明。请求串行、3 秒间隔、6 小时有界缓存，评论最多 8 页，失败保留资料并冷却；发现复用持久资料边车和固定集合补齐，传输层预算由 `ContextVar` 隔离。未新增依赖或写入 ledger。
- 公开签名材料按请求头调用与签名计算式定位，不依赖压缩器生成的变量名，不执行来源脚本；常量长度、唯一赋值与组合结构均核对，格式不匹配时保留来源故障。FC2 搜索使用来源接受的商品号，返回资料仍按原始规范番号及作品 ID 严格核验；其他番号沿用原查询写法。
- 馆藏和库外样图共用 `SourcePicture` 与浏览器图片缓存。组件按作品保持身份，缓存命中在布局阶段揭示，网络图片经原生 `HTMLImageElement.decode()` 就绪后显示；等待时保留已显示的图片，晚到结果按当前地址核对。失败和重试仍按图片地址隔离，无新增依赖。
- 后台诊断导出复用 `BackgroundJob`、本机访问与同源检查、`BufferedFileResponse`，使用 Python 标准库 `zipfile`、`TemporaryFile` 和 `JSONEncoder.iterencode` 分块生成。取消使用线程事件，任务身份核对、同一管理器互斥和未完成文件回收由导出模块负责；不登记 ledger 任务，不新增依赖。普通诊断按压缩字节数决定是否合并刮削详情。
- 慢项跳过复用 `ProcessingControl` 的持久控制文件、`checkpoint` 和 `ActiveDeadline`，按任务及当前资产消费跳过指令；资料来源的逐项发布和失败项重试继续共用现行采集路径。前端共用 `Note`、`useAction` 与现有任务查询，常驻任务浮窗禁止滑动关闭，显式隐藏和恢复入口独立于任务状态。
- 库外 JAV 身份引用复用 `entity_ref` 的本地头像与取景、厂牌 `has_logo` / `logo_version`；来源演员头像按作品演员 ID 取回并由同一 Pillow 路径解码，未知演员不绑定其他实体。性别只投影来源明确字段或规范资料，未知值保留 `unknown`；`MIDA-361` 的一位女优和四位男优与原站演员标记一致。标签投影复用 `genre_decision`、`genre_taxonomy.resolve_genre` 与 `tag_cat`，`tag_refs` 保留来源原词。样本 `MIDA-849` 的两张来源演员头像完整解码成功；其 HLS 清单 GET 200，密钥与媒体 HEAD 200，均允许匿名跨域访问。`MIDA-361` 的 HLS 在隔离实例中实际解码为 1024×576，播放按钮推进超过 2 秒，暂停、设置与卸载通过；未保存媒体帧或视频文件，整段播放未验证。预览仅下发已验证 HTTPS 主机与路径，播放复用既有 Video.js；无需新增代理或依赖。外部候选与版本依据沿用上条只读实证，Peach 保留身份、来源和请求预算策略。
- 候选 `ANDonekey/javapi` revision `9a2a245a659a4008ee75bc148b0af9c7126e7a71` 未归档、最后推送为 2026-05-11，使用 Go 和部署服务，GitHub 未标明许可证，不能作为 Python 依赖或复制其源码。仅以部署公开前端与匿名实测确定协议事实；原始取证脚本及脱敏概要保留在工作树 `build/javdb-public-api/`。`phoenixthrush/javdb-python`（MIT、Python ≥3.11、无运行依赖）解析的是 `javdatabase.com` HTML，站点与协议不匹配；现有 `sources.javdb` 同样只适用于 HTML。Peach 保留番号核对、权限失败、字段投影和缓存策略。
- 编码边界依据 [MDN 视频编码说明](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs) 与 [ffprobe 文档](https://ffmpeg.org/ffprobe.html)，用当前 FFmpeg；Peach 只持有兼容格式判定与缓存策略。
- CloudDrive 引导用现有 `settings_file`、`platform.root_online`、`scan_location` 与 React 配置页，来源为 `local`、`115`、`pikpak`。挂载由用户安装的 CloudDrive 负责（[官方帮助](https://www.clouddrive2.com/help.html)：Windows 用盘符、macOS 用目录挂载点），Peach 不捆绑其二进制，挂载引导不依赖管理 API，路径处理用 `pathlib`、`os.scandir`、`tomllib`；表单、来源归属与扫描选择归 Peach。云下载和账号代理配置经官方 proto 子集（`downloads_clouddrive.proto`，version 1.1.2）走 gRPC，令牌存 CredentialStore，不用非官方 SDK（ADR-0089）。
- 媒体目录校验沿用 `media.normalized_path` 的平台策略：Windows 用标准库 `os.path.abspath` 保留盘符，macOS 用 `Path.resolve` 解析文件系统链接。实现只依赖项目 Python 标准库（PSF 许可），不新增依赖；校验器独立于账本路径翻译与媒体仓储。映射盘转 UNC 的边界由注入文件系统解析结果的回归覆盖，首次设置的本地来源也验证配置保留盘符。直接输入 UNC 仍按盘符路径契约拒绝；真实 NAS 挂载需在目标机器验收。
- 非 Windows 表单的内部路径由 `media_configuration.prepare_sources` 补齐，复用既有来源校验、配置写入和 `platform` 路径转换；不改数据库路径模型或执行迁移。标准库 [PureWindowsPath / PurePosixPath](https://docs.python.org/3.14/library/pathlib.html#pure-paths) 用于比较两种路径，[hashlib.sha256](https://docs.python.org/3.14/library/hashlib.html) 按来源与实际目录生成稳定候选前缀，已有配置和显式输入优先，冲突时换盘符。媒体库名称使用实际目录名，前端复用现有 `Disclosure` 和 `Input`，无新增依赖。
- JAV 入库资源查询复用 `sources.javdb` 的身份核对、`SourceTransport` 的 Cookie 与冷却、`HostLimitedTransport` 的 3 秒间隔、`beautifulsoup4==4.15.0` 和 `downloads.parse_magnet`。JavPack 的 `JavDB.magnet.user.js` 0.0.2（GPL-3.0，仓库 revision `b546e1881147e15796c697e8e086db9d3ac0c5be`）只作页面字段参考；它依赖浏览器用户脚本 API，不能直接作为 Python 服务端依赖。Peach 负责评论链接、协议分流、去重、60 秒缓存和最多三页评论的预算，不新增依赖。2026-10-02 单作品只读实测取得 4 条磁链和含 ed2k 的评论页；评论入口从 `.review-tab[data-url]` 读取，受限评论保留来源限制提示。磁链可交现有云下载服务，ed2k 与其他网页链接提供复制。
- 磁力优先链复用同一套 `SourceTransport`、`HostLimitedTransport`、`downloads.parse_magnet` 与 Torznab 后备，不引入新的抓取运行时。manko.fun 的页面请求实际落到 `healertanker.com/swx`，响应 `data` 是 basE91 包装的 JSON；实现只移植该公开响应形态与编号精确匹配，不复用会话脚本。Sukebei 直接读搜索表格；JavBus、16mag、OneJAV、Free JAV Torrent 由现有自配 Prowlarr／Jackett 索引器续接。Akiba Online 与 Reddit 只作线索，不自动取磁力。候选按分辨率、做种、推广附件数量与正片体积排序；总文件数不再是一票否决，manko.fun 候选绕过水印门槛，其他来源只能标为待到盘检查。
- 云下载后处理复用 `task_run` 后继串行、`process_library(retry_ids=...)`、`junk.isolate`、`organize.build_plan(asset_ids=...)`、SQLite backup 与整理批次日志。没有另造第二套刮削、垃圾词库或移动器。
- `junk.scored_candidates` 统一复核与自动隔离的证据；`junk.isolate` 要求显式资产或来源目录，保护人工决定、个人记录、字幕与正片身份，写前重查证据，仅写可撤销的回收站状态。扫描、推送、媒体探测、资料处理、云下载与维护脚本共用该入口；页面只补展示成本与缩略图字段。复用当前树的词库、目录关系、`record_holders`、`LedgerDatabase` 与历史评分回归，使用 Python 标准库和现有 SQLite JSON 支持，无新增依赖、协议或媒体读取。流程顺序见[垃圾文件](OPERATIONS.md#垃圾文件)。
- 抓取入口的复用缺口见 [来源采集](SOURCING.md) ；跨用户安装、来源网络、Cookie GUI、最高可得画质与图像清单按 [ADR-0024](adr/0024-mark-manifest-not-bundled-bytes.md)。私有后缀判断用 tldextract 5.4.0（BSD-3-Clause），随包 PSL、`suffix_list_urls=()`、`cache_dir=None`、`include_psl_private_domains=True`；Instaloader 4.15.3 与 browser_cookie3 不进正式依赖。HTTPX（BSD-3-Clause）、curl_cffi（MIT）、Pillow、amane 桥与现有候选缓存是正式基础，请求节拍用 `scripting.RateLimiter`／`HostLimiter`。
- 采集 GUI 用 React island、CredentialStore、HTTPX、Pillow 与 BackgroundJob，`jav_cover_fetch` 同时服务界面与 CLI；Peach 保留域内凭据、来源路由、预算、冷却、番号身份与高清替换策略。Cookie 文本用标准库 SimpleCookie／MozillaCookieJar 解析，不导入 pickle。
- 删除失效链接与资源同步的执行阶段用 `BackgroundJob.start_result` 存终态回执；刷新只查状态，写入不自动重放，确认与检查结果过期门槛照旧有效。
- 关注进度用 Fieldset 与 Progress；完成时保留内容取数，按作者检查用 `sources` 范围参数，报错作者用现有身份解析。
- GET 重试归现有连接器：[HTTPX 原生重试](https://www.python-httpx.org/advanced/transports/)只覆盖连接失败，统一不了 HTTPX 与 curl_cffi 的读超时、临时 HTTP 状态与页面进度。POST 不重放，403 单次终止。
- 标签发布用系统 Git、GitHub CLI（MIT）与 [Actions runs REST API](https://docs.github.com/en/rest/actions/workflow-runs)；[release_tag.py](../scripts/release_tag.py) 管版本、主线归属、同提交成功 CI 与不可覆盖策略，工作流用 Release 制品验收。
- 独立 Windows 测试包用 PyInstaller（GPL-2.0-or-later，带 bootloader 分发例外）的 [onedir 与自启动子进程](https://pyinstaller.org/en/stable/common-issues-and-pitfalls.html)：完整目录共享资源、避免重复解包，onefile 托盘入口只用于源码部署；Peach 保留进程所有权、数据目录、配置和扫描策略。
- 首启数据目录定位复用标准库 `pathlib` 和现有 `fsutil.atomic_write_text`，在默认数据目录记录本机绝对路径，读取限定跳转次数并检查循环。目录选择、单实例锁交接及服务环境属于 Peach 生命周期策略，无新增依赖。临时目录回归覆盖保存配置、真实子服务启动、正常首页、再次发现所选位置和锁冲突。
- Windows 安装包用 Inno Setup 6.7.3（Inno Setup License，允许免费分发）与官方 `Files/Languages/Unofficial/ChineseSimplified.isl` 译文（在 `scripts/installer/`）。目录选择与升级目录记忆复用官方 [`DisableDirPage`](https://jrsoftware.org/ishelp/topic_setup_disabledirpage.htm)、[`UsePreviousAppDir`](https://jrsoftware.org/ishelp/topic_setup_usepreviousappdir.htm)；Peach 在目录页和安装前校验独立目录、数据重叠、目录链接、写入权限及已有安装位置，使用现有 Inno Setup，无新增依赖。馆藏与口味上传说明复用 [`CreateOutputMsgMemoPage`](https://jrsoftware.org/ishelp/topic_isxfunc_createoutputmsgmemopage.htm) 的只读滚动页与 `ShouldSkipPage`；Unicode 正文赋给 `RichEditViewer.Text`，仅主动选择上传时显示。`test_desktop_installer.py` 编译正式脚本并运行共用判据的隔离 EXE，覆盖中文和空格路径、原位升级及目录保护，不安装到真实位置、不写 ledger。`.iss` 只管文件、开始菜单项和卸载登记；停托盘、补迁移、撤快捷方式经 `desktop_installer` 调已有入口，自更新与应用内卸载是唯一实现。
- 运行一致性：用 `LedgerDatabase.write_transaction` 的提交边界与 `OrderedDict`；HTTP 导航用 FastAPI/Starlette，图片复验用 `StaticFiles.is_not_modified` 与 `FileResponse` 的 ETag；列表用 SQLite 的 IN/UNION 保留隐藏标签与多标签组合，不引查询框架。
- 馆藏侧栏用 `catalog_filter` 的列表条件，已保存在线卡片用关注来源的标签与封面投影，详情用 `openFollowDetail`、Video.js 与媒体队列；导航范围与标签计数在 `frontend/src/sidebar.ts`。
- wheel 资源用 setuptools 的 `build_py.copy_tree`（[官方包内数据建议](https://setuptools.pypa.io/en/stable/userguide/datafiles.html)），钩子只复制三个既有资源目录，因为源码、桌面构建和前端产物共用其维护位置。

## Peach 必须自研的领域逻辑

以下属于产品行为，继续由 Peach 实现：

- 女优、厂牌、创作者、标签的规范身份、别名和来源；被并实体的旧 id 经 `entity_redirect` 墓碑与 `entities.resolve_entity_id` 找到新实体（ADR-0088）；
- profile 行为、稍后看、播放列表、口味和推荐排序；
- 本地、115、PikPak、在线来源的绑定和回退策略；
- 计费来源授权、隐私分类和候选复核导入；
- 物理资源垃圾候选的跨类型证据、人工复核和回收站语义；空目录清理复用 Python 标准库自底向上的 `os.walk` 与只删空目录的 `Path.rmdir`，Peach 只负责在线来源、根目录保护和 CloudDrive 并发消失边界；
- 垃圾永久删除复用 `purge_assets` 的隔离、数据库回滚与提交后清退，逐文件复核清单核对路径、体积与来源根，不新增依赖；隔离名带 UUID，移动与恢复使用 `os.rename`，目标须不存在，挂载拒绝移动时保留文件与账本行；
- 私有获取来源、出处引用和发现关键词；
- 创作者级视觉采样语义；
- 推理 Provider 与 Agent Provider 的能力契约；
- 任务归属、进度、取消、成本和证据规则。

下面这些是基础设施而不是产品行为，所以单独记下被拒绝的候选和不可替代约束，避免再从「这看起来该有现成库」开始。

| 自研实现 | 被拒绝的候选 | 不可替代约束 |
|---|---|---|
| `mp4index.py` 有界 MP4 关键帧索引 | PyAV、`pymp4`、Bento4 | PyAV 需要 demux，`pymp4` 依赖旧 Construct，Bento4 是额外二进制；都不能证明在云盘文件上保留「只读 moov/stss/stts、避免整片流量」的约束。 |
| `mp4repair.py` 重建缺失的 `ctts`，新头存成边车 | `ffmpeg -c copy` 重封装、`untrunc`、Bento4 `mp4edit` | ffmpeg 的 h264 解复用器拿不回显示顺序（实测重封装后仍有 986/2015 帧倒着走），`untrunc` 修的是截断不是缺表，`mp4edit` 只会原地重写整个文件，而网盘上的片子改一个字节就是几 GB 重传。约束是「原文件一个字节不动、播放时拼出合规 MP4」。 |
| `certs.py` 固定项目 CA 与短期叶证书（编码继续调用 OpenSSL） | mkcert、cryptography | mkcert 会接管本机 CA 安装/私钥，不能保持跨设备固定项目 CA；cryptography 只替换证书编码且增加原生依赖，不能删除 Peach 的 Apple 398 天与 CA 生命周期策略。 |
| `migrations.py` SQLite 迁移 | Alembic | Alembic 会引入 SQLAlchemy/Mako/greenlet；现有范围只需顺序 SQL、校验和、备份与 PyInstaller 资源定位，没有 ORM 消费者。 |
| Gofile API 直接 HTTP | 社区 wrapper | 官方没有维护中的 Python SDK；社区 wrapper 只是薄封装，不能绕过 Premium `contents` 权限，也不能减少 Peach 的 Bearer 隔离与媒体规范化。 |
| `netwatch.py`、streaming/segments、sync、versioning/Windows update | 通用替代实现 | 分别是无 PyObjC 的系统通知、FFmpeg/Starlette 上的会话策略、单 writer ledger 规则和 Git/PyInstaller 更新契约；通用替代会保留同量 policy 或扩大依赖。 |
| `downloads_pikpak.py` PikPak 云下载 | PikPakAPI；云下载直连 115 用的 `p115client` | PikPakAPI 是 GPL-3.0-only、只有 async 接口且吞掉验证页地址，只借协议常量；`p115client` 要另走一套 115 授权，和 CloudDrive2 挂载争授权名额（ADR-0089）。浏览器登录（`downloads_pikpak_browser.py`）照 PikPak Assistant 用户脚本（MIT）读 localStorage 的 `credentials_*`，拉窗口复用 `browser_transport` 的 `attended` 档；用户脚本借网页续期，Peach 取走后自己续期（ADR-0093）。 |
| `organize.py`／`organize_templates.py` 目录收纳 | amane 的整理模板 | 只借占位符与可选分组语义；amane 把文件当可删的派生物，Peach 的媒体原地不动，收纳要用户发起（ADR-0039）。 |
| `wants.py` 想要清单 | SakuraMedia 的想要与订阅 | SakuraMedia 只作行为证据；入库按番号自动对账，按 ADR-0052 直接落库（ADR-0090）。 |
| `jobs.PidFileLock` 批处理进程锁 | `portalocker==4.3.0` | 候选覆盖 PID 写入、持有者、原子替换与陈旧文件清理，但一直没有消费者落地；按「候选依赖不得空转」不引入。 |
| `record_rehome.py` 个人记录接回新文件 | 按文件指纹接回；六张表改 `ON DELETE SET NULL` | 消失的文件读不到、算不出指纹；记录脱离 `asset` 就丢了番号与标题。番号是唯一跨版本稳定的键，无番号的按创作者、文件名主干与时长接回（ADR-0087）。 |

发行物目录折叠与目录广告清理复用 `scripts/flatten_release_dirs.py`、`catalog_rules` 和 SQLite 备份。
路径计划按目录组件建索引并保留操作顺序，覆盖资产及已登记字幕；物理移动携带未登记封面等旁挂文件。
目录图排除文件末层；同名的多个子目录及带媒体扩展名的目录包装按冗余层判定，扩展名复用扫描器分类。
冗余目录独占父目录时使用两次整目录改名及空暂存目录清理；父目录含附带文件或其他版本时，目标条目互不冲突才合并。暂存位置或文件名冲突时拒绝执行。
包装目录占用内容目标名时，先暂存该目录再移出内容，其他版本保留原位。
每条移动先复验真实目录，部分失败立即恢复本条，账本事务失败恢复本批。
不新增依赖；Python 标准库的路径操作和 SQLite 已覆盖底层能力，Peach 保留冗余名称、广告和账本一致性判据。

完整目录分类归位使用 `scripts/organize_library_dirs.py`，复用 `organize._rename`、目录折叠入口、番号解析器、实体分类与进程锁。默认冻结计划，`--apply --backup` 才执行；`--batch` 分开保存计划与回执，失败可恢复。`--stage flatten` 自行生成折叠复核 CSV。同目录已确认作品与缺厂牌配套图作为整包处理；混合目录只移动已知文件组及配对字幕，物理文件去重，未知视频、冲突身份和覆盖目标均保留；同目录附属文件按 `scan.is_sidecar` 判定，带片名的随所属视频走，裸 `poster`、`movie.nfo` 与 `extrafanart` 只在整目录视频都移走时跟随，已登记文件与隔离文件不动。删不掉的源目录连同剩余名字记进回执 `cleanup_errors`。创作者目标只保留规范名那一层之下的结构，规范名之上的容器目录丢弃，路径里没有规范名时只带源目录名；不整体改名的容器目录名见 `resources/naming/container_directory_words.txt`。`--rollback` 按回执逆序撤回已提交条目，复用 `restore_entry`，账本已被改过的条目单独报出不动；不带 `--apply --backup` 只列计划。目录名的发行站、画质和分片标记复用 `release_code_from_filename`；一本道的日期式分隔符匹配复用其官网作品号解析，不跨片商合并日期编号；目标番号目录先对齐已有的等价目录，几处并存时取官网作品号写法。视频文件名自带编号且与账本番号不是同一部作品时不建目录，记为待确认。FC2 发行目录可使用 `FC-` 简写并附带标题；缺番号的 `@fc编号_分片` 同时核对父目录编号与厂牌，目录编号不补写账本。韩国 MIB 按厂牌归置。已有唯一创作者关系但细分类未确认时归入通用「创作者」目录，不提升身份候选。路径同步覆盖资产与已登记字幕，不补写真相字段。

PikPak WebDAV 同来源移动由 `organize_clouddrive.py` 提供，目录入口显式指定 `--pikpak-webdav --location pikpak --batch` 才启用。复用 CloudDrive 已存令牌与官方 `GetDownloadUrlPath` 的认证头；来源固定为 `https://dav.mypikpak.com`，认证不写入地址、日志或账本。协议依据 [PikPak WebDAV 官方说明](https://mypikpak.com/zh-TW/help-center/connected_apps/webdav/how_to) 与 [RFC 4918](https://www.rfc-editor.org/rfc/rfc4918)，HTTP 客户端复用已声明的 `httpx`，消息编码复用已声明的 `protobuf`，不新增依赖。官方 `GetSubFiles(forceRefresh=True)` 从来源根逐层读取完整目录，校验每层成员来源、父目录、重名与体积。同父改名使用官方 `RenameFile`；同来源、保持原名的跨目录移动使用官方 `MoveFile`，冲突策略为 `Skip`，明确关闭跨云移动与递归合并。WebDAV 只用 HTTPS `MKCOL` 创建所需父目录，改名与移动都走官方接口。官方回 false 或拒绝码（`INVALID_ARGUMENT`、`PERMISSION_DENIED` 等）且目录确认原件仍在、目标未出现时，本条记入回执 `failures` 并回滚，续跑跳过；原件与目标都在或都不在时才中止本批。`organize._rename` 对 A 盘默认拒绝，只有经 `organize.verified_renames` 注入官方核验改名时放行，未注入时各执行入口整批拒绝。单次 HTTP 应答上限 2 MiB，遍历上限 10,000 条。提交移动后只刷新涉及目录的缓存，沿完整祖先链取得路径与体积变化证据，再交回现有账本事务；最多四次只读确认，不重复提交移动。状态不确定时保留意图回执并停止，成功应答也必须取得完整成员变化证据。A 盘折叠目录使用不以点号开头的暂存名，保留同一套恢复回执；R 盘不进入该传输路径。

A 盘同父目录改名复用 CloudDrive 官方 `RenameFile`；跨父且改名的操作拆为同父 `RenameFile` 和保留名称的官方 `MoveFile`，中间路径进入恢复回执并禁止覆盖。每步核对完整成员与体积；成功应答不替代路径核验。路径中的 `@` 保留为 URI 路径字符，其他字符使用 UTF-8 百分号编码。认证样本已移动时，最多另查两条馆藏内图片样本，仅提取既有认证，不读取媒体内容。

推广网页资源目录中的横幅、标志和导航图片由 `junk._attachment_junk_reason` 进入复核队列。判据同时要求 `_files`、网址推广套话、域名、导航元素文件名和体积上限；继承的作品番号不豁免网页导航图片，作品图片、字幕、NFO 与普通 `_files` 目录保留。固定命名的推广附件（安装包、宣传视频、二维码卡片、下载站横幅）按扩展名、体积上限与整名收在词库 `resources/junk/promo_attachment_names.json`，由 `junk._promo_name_reason` 读取；命中只计复核档 `JUNK_REVIEW_SCORE`，未探测时长视频的推广目录、推广创作者位与体积证据同样只到复核档，这类分数单独凑不到 `trash_junk.py` 默认的自动移入回收站门槛 `AUTO_TRASH_SCORE`，不凭名称移入回收站或删除。永久删除仍走 `trash_junk.py --purge --review-csv` 和 `purge_assets`。

极短视频附件复用同一垃圾复核评分、`promo_free_key` 的名称比较和 `release_code_from_filename` 的自身番号识别。发行目录须有与目录同名、至少 20 分钟且至少 120 MiB 的活动物理正片；附件须有有效测量值、不超过 30 秒与 32 MiB，正片至少为附件时长的 40 倍、体积的 10 倍。同目录至少 3 条此类附件，或相同体积、毫秒时长与有效分辨率的附件分布在至少 3 个发行目录，才计结构证据。真实创作者归属、自身番号、分卷、独立短动画与普通混合目录受保护；目录继承的番号不能证明附件身份。结构证据只够复核，短、小或同测量值都不能单独证明是广告，默认自动隔离线不接收仅由这些证据凑分的候选。查询只读账本，不读取云盘媒体，不新增依赖。

带站点水印的文件名先核对自身番号与分卷标记，明确分卷排除在垃圾队列外；「方括号来源站名 + 序号」视频只计复核证据，避免把短片的打包水印当作广告。画面取证可复用已有 FFmpeg 抽帧与 `scripts/windows_ocr.ps1`；本机复核先使用缓存缩略图。现有 `opencv-python-headless==5.0.0.93`（Apache-2.0，vision 可选组）提供 [QRCodeDetector](https://docs.opencv.org/4.7.0/de/dc3/classcv_1_1QRCodeDetector.html)，只能定位或解码二维码，不能证明整片是广告；[Windows OcrEngine](https://learn.microsoft.com/en-us/uwp/api/windows.media.ocr.ocrengine.trycreatefromlanguage) 依赖 Windows 与已安装的识别语言。两者均不放进列表请求的同步评分路径，避免平台依赖、图片读取及文字识别失败影响复核队列；内容结论写入仓库外的逐文件复核产物。

普通作品图片和 `images.rar` 保留。CloudDrive WebDAV 的小文件删除复用原生 `Path.unlink`：同目录隔离改名报 WinError 50 时，最多 1 MiB 的文件先用标准库 `shutil.copyfile` 完整备份到 `generated/purge-staging/`，记录原路径、大小和 SHA256，再删除。数据库失败时恢复备份，提交后清退；大文件继续报告阻塞。该路径没有新增依赖，备份和恢复只由 `purge_assets` 管理。

英文媒体文件名分词复用 `wordninja-enhanced==3.2.0`（MIT，2026-09-04 发布，Python ≥3.9，纯 Python，wheel 11.4 MB，无传递依赖）。源码经 `opensrc path pypi:wordninja-enhanced@3.2.0` 读取；原版 wordninja 的发布较旧，增强版提供标点保留和可补充词典。`space_media_names.py` 先出逐文件复核 CSV，只插入空格，保留序号、字符与扩展名，不推断人物或出处；指定目录内的真实文件核验后复用 `organize.apply_plan`、SQLite 备份及回滚日志。领域词汇在 `english_filename_words.txt`（置顶加权，条目宜少：每多一条都会压低 `a`、`of` 等高频词），常被误当成单词的拼接串在 `english_filename_nonwords.txt` 里移出词频表。撇号缩写、全大写缩写、域名与站点编号、十六进制 viewkey 不拆；西里尔形近字母按拉丁字母算切点、原字符保留。已执行批次用 `--recompute-batch <日志>` 按原名重算出复核 CSV，再走 `--apply --review-csv`。

A 盘垃圾隔离使用短名称 `peach-purge-<32 位 UUID>.peach-quarantine`，扫描入口仅跳过这一精确格式；普通媒体和其他 `.tmp` 文件仍需复核。隔离恢复与本地完整备份沿用 `purge_assets` 的事务边界。

推广附件的 A 盘原文件取证复用 CloudDrive 官方 `GetDownloadUrlPath` 的本机原文件代理，不经过 Peach 转码，也不传递认证信息到其他来源；实际二维码副本和视频取证帧见馆藏复核产物。

保留自研不是永久豁免：约束改变或候选实现更新时重新跑 POC，不因本表结论跳过外部检索。

## 已定型的产品行为

每条是一次验收留下的判据，一条一句。改这些行为是产品决定，照着再实现一遍是
重复劳动，动手前先确认这里没有写过。README、[开发约定](../AGENTS.md)、[docs/OPERATIONS.md](OPERATIONS.md)
和 ADR 已经写下的不在这里重复，出处用 `git log -S` 查。

- 本地浏览器直放 MP4/WebM/Ogg，其余容器由 `TranscodeService` 按六秒片段缓存成 H.264/AAC MP4，不改写原媒体；ffprobe 判定可复制的流不重编码，其余在 Windows 走 CUDA/NVDEC。
- 远端 MP4 默认走标准 Range，显式开启的 HLS 使用关键帧对齐片段并在失败时回退 Range。
- 页面共用 SPA、JSON 与 gzip/ETag；侧栏随当前视频集合，已保存在线作品复用关注详情。
- Logo、侧栏「首页」和沉浸模式关闭统一清除分类、搜索与 JAV 筛选，首页默认稳定随机、换批才换种子，再点当前排序回到随机。
- 高亮、竖屏密度、索引骨架已验桌面/390×844，HTTPS 生效；手机命中区 44 px。
- 主题三选一（跟随系统／浅色／深色），只存本机，首帧前由内联脚本写进 `<html>` 的 `data-theme`。
- 同番号的分卷派生（A/B、1/2、CD/Disc/DVD/Part/Vol、「首卷裸名 + 后续卷 `-2`/`-3`」）折叠成一张卡并按时长排除完整版，首页、搜索、资料页网格、版次队列与角标计数共用这套判定。卷号后挂着尾缀时先剥掉组内每个文件名都带、且从分隔符起头的那一段，不按版次词表拆（`1080p` 会被拆成 `10` 加 `80p`）。
- 番号提取复用 `catalog_rules` 的视频容器后缀、日期式番号和 KIRARI 形态：扫描支持的媒体与图片后缀均可剥除，明确卷标后的两位序号保留，日期式序号接受 2～4 位并保留原分隔符。`MKBD-S`／`MKD-S` 共用文本、文件名、自定义规则、无码来源路由和标题与版次投影判据；目录预检、配套资料和资料采集均调用同一解析器。运行时只用标准库 `re`，不引入外部解析器；[NeoAVDC](https://github.com/haoo999/NeoAVDC) 0.0.4（MIT）的 TypeScript 解析器只作边界对照，其全串宽松提取不适用 Peach 的创作者账号与相机编号保护。
- 分卷卡与版次卡（有码／中字／无码）不翻卡（各卷共用同一封套，翻了像卡住），悬浮走分段视频预览；封面只有一个计数（「N 卷」或「N 个版本」），叠层封面格垫 `--page` 挡住模糊衬底的半透明边。分卷详情标题带卷号，因为各卷标题、女优、厂牌逐字相同。
- 本地播放版本复用 `catalog_rules` 的番号、版次、卷号与重复文件判断。`catalog_versions` 先区分版次、探测规格与修复标记，再识别各版分卷；完整文件与分卷同时存在时核对总时长，重复副本保留文件并共用一个版本身份。计数、首页、资料页、详情队列和相关推荐读取同一查询投影，ledger 不变。`scripts/audit_catalog_versions.py` 只读输出全库复核 CSV；没有时长、规格或明确番号证据的关系保留待复核。
  - 文件身份复用 `metadata.identifies_code` 核对 DMM 数字前缀与补零写法；通用文件名须同时有带归属的刮削标题和匹配的番号目录，显式文件号冲突优先拒绝。同名副本的已知时长相差超过 10% 时保持独立，缺测量项不附到有时长冲突的同名组。来源目录时长保留为证据，不代填媒体实测时长；特典、广告与缺内容的取舍记录在逐文件复核产物里。
- [Jellyfin 的多版本命名](https://jellyfin.org/docs/general/server/media/movies/#multiple-versions)以共同作品名和版本后缀区分文件（2026-10-10 核对）；其整套服务器与严格目录前缀不能直接承接 Peach 的 FC2 短番号、分卷合集和跨盘资产。这里只参照作品、版本与文件的分层，不复制 GPL 源码、不引入依赖。最小实证使用 `FC2-PPV-1110408` 的完整文件和两段 4K 修复文件：两个播放版本、三个文件、同版独立分卷队列。
- 合集翻图复用 `use-stack-flip`（`frontend/src/react/components/`）：逐张解码后才显示，失败帧不入队，悬停代际隔离异步结果，退出清理计时器。馆藏与关注详情共用原生 `dialog#stage`，浮窗不参与列表排版，关闭保留关注列表岛；图片灯箱沿用现有实现。
- 关注卡翻卡去重：`follow_faces` 复用 `community_catalog.fingerprint` 的 dHash，另加 8×8 RGB 色块（dHash 分不开同姿势的穿衣版与 nude 版）。阈值的实测依据见 [复用取证记录](SOURCING.md#媒体与关注实测)。
  - 地址相同即同一张；时长都已知且差 ≤1 秒时 dHash ≤6、最大格差 ≤4；时长未知时 dHash ≤2、格差 ≤3。
  - 翻卡按画面去重、不分站，封面计数把跨站同一画面并成一个媒体，并完只剩一个时写「N 个来源」；同站不按画面合并，4K／8K 两个文件和局部差分会混进来。
  - 文件内容哈希相同即同一个媒体，不论同站跨站、不看 alt／WIP 标签：连接器的 `content_hash` 从已存原始地址解析、不发请求（kemono／coomer／pawchive `/data/<h0h1>/<h2h3>/<sha256>`，rule34.xxx `/images/<目录>/<md5>`，paheal `r34i.paheal-cdn.net/<h0h1>/<h2h3>/<md5>`）；fanbox、rule34video、f95zone 的文件名是随机 id 或签名令牌，不参与。
  - 同站相同 `external_id` 与媒体序号标识一份媒体，归档站同时核对服务与作者范围；多个关注来源重复收录只增加收录份数。已知文件哈希不同、不同帖子或不同媒体序号各自计数。
  - 签名由后台线程补进 `generated/posters/follow-faces/`，不进 ledger。
- 关注视频规格复用 `follow_variants`：`4K60fps`、`1080p60fps` 与带空格的规格拆成清晰度、帧率两个版本标记；存量作品键在读取时投影，无需重抓或改写 ledger。
- Rule34Video 封面复用 `FollowCoverService`、HTTPX 与 Pillow，经 `/follow-cover` 缓存静态 poster。自身图片失效时只在当前作品组内寻找其他版本的封面，沿用来源白名单、请求字节上限、并发与缓存锁。该路径不解析正片、不抽帧；首页、作者筛选、详情队列与已保存在线卡片共用缩略图投影。复核记录见 `<私有验证记录>`（仓库外）。
- F95 讨论图片依据已确认的附件身份在采集与读取投影中排除。网盘资源保留，未取得作品预览时显示资源服务图标；不能仅凭 GIF 扩展名过滤作品。
- 普通多女优卡片叠放前 3 个头像、只显示第一位姓名和真实总人数；JAV 小图是整页版式，混入的非番号作品统一为标题、身份、标签三行固定高度。
- JAV 详情持有 `asset.catalog_title`／`original_title` 与官方 Tag 身份，官方标记用常规字重，身份区收齐到同一内容起点。
- JAV 官方封面重探只在面积更大时替换，失败保留原图。
- 播放器按 YouTube 锁定源码对齐控件、状态、图标形变、设置面板动画与悬停提示，倍速五格到 3.0，窄屏按播放器宽度折叠留黑边，沉浸模式按 Shorts 版式，竖屏用居中 9:16 舞台，播放统计两页共用、按传输方式分口径。参考快照在 `docs/reference-snapshots/youtube-*.md`，索引见 [开发约定](../AGENTS.md)；只复用可测量的层级、尺寸和状态语义。
- 图片灯箱在本地照片、番号样张和关注在线图片间复用同一套 Swiper，样张与在线图片只显示来源、合集序号和浏览器实际解析结果；照片标签进入分页图片墙，点开才按原图比例呈现。番号集卡复用播放列表卡的叠层纸边、`mixbadge` 张数与 `mixcopy` 两行字，封面走视频卡同一份 `coverImage`（ADR-0068）。
- 资料页照片与关注在线图片两处图片墙共用大小（顶部按钮）与固定比例／瀑布流（筛选浮层）设置；关注图片的「仅显示图片」独立保存，隐藏卡片文字与角标。瀑布流用 CSS 多栏、`break-inside:avoid` 与图片 `aspect-ratio:auto 1`，懒加载前留非零高度（[MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio)）；`alt` 留给读屏，字色透明。
- 缓存型资产路由先问缓存，不先解析源文件：`media_engine.file_for()` 的存在性检查落在 CloudDrive 网盘上一次 137–402 毫秒。`/photo-thumb` 先问 `photo_service.cached()`，`/sample-thumb` 先问 `SampleCache.cached()`，缓存根从 `photo_root` 推出。
- 远程媒体持久缓存复用 HTTPX 0.28.1 的流式响应、Starlette 1.7.0 的文件 Range、filelock 4.0.12 和 `fsutil.atomic_path`；缓存身份、失败保留与按需取得由 Peach 管理。HLS 清单解析用 [m3u8 6.0.0](https://pypi.org/project/m3u8/)（MIT，Python ≥3.7，纯 Python、24.1 KB wheel、无传递依赖），已读取固定版 `model.py` 并验证嵌套清单、密钥、初始化段和字节范围。Hishel 1.4.0（BSD-3-Clause）已读取 `_sync_cache.py` 与 Range 判据，通用 HTTP 缓存按来源 URL、缓存头和重新验证工作；此处需按稳定条目身份避开签名 URL 更新、永久保留成功媒体，因此复用现有持久文件路径。规则及验收见 [媒体缓存](MEDIA_CACHE.md)。
- 账本路径在 Windows 只做 `abspath`，不 `resolve()`：PikPak 的 A: 是 WinFsp 网络驱动器，`resolve()` 得到 UNC 形态，之后每个经 `file_for()` 的播放请求都慢几个数量级；115 的 B: 不受影响。
- 不兼容片源（HEVC、mp3 以外的音轨、非 MP4 容器）按 6 秒片重编码给 HLS，账本没记时长或为负时用 ffprobe 的时长切，探测也拿不到才回 Range。分片与整片共享硬件后端探测及回退链，见[硬件转码后端](#硬件转码后端)，同一分片只起一个 FFmpeg。Range 响应按 1 MiB 读文件，`BufferedFileResponse` 自己盯 `http.disconnect`（uvicorn 断开后 `send()` 静默返回，Starlette `FileResponse` 不监听），否则拖一次进度条就留下一个把整部片拉完的幽灵读者。
- 有 B 帧却没有 `ctts` 的 MP4 是时间戳错乱，浏览器丢掉倒着走的帧。这类片源不重编码：`mp4repair.py` 重建一份 `moov`（游程编码的 `ctts`、编辑列表补整体平移、`stco`/`co64` 按头长差平移）存成 `transcode_root` 里的 `.mp4hdr` 边车，`/stream` 用「边车的头 + 原文件那段 mdat」按 Range 发。显示顺序取自 `ffprobe -ignore_editlist 1 -show_entries frame=pts`，`pkt_dts` 不能用。边车算出来前走 HLS 转码，同一部片后台只算一次，算不出就跳过。
- 「只采集在线资料」对齐全的行（番号已落库、字段有着落或已在候选表、封面在位）不碰磁盘；文件在不在看目录列表、同目录只列一次，扫描用目录列表自带的大小与时间、不逐个 stat；候选 CSV 每 5 秒写盘一次，被打断也在收尾写全。
- 一个控件在两页出现时，选中态也归它：首页、资料页与关注页的「全部／没看过／稍后看／已标记」共用 `use-view-glide.ts` 那块滑动玻璃与 `[data-view-glide]`，填充只由玻璃给，各排自己不铺底。
- 本地详情与关注详情的「接着看」共用 `RelatedSection`、横滚接线与卡片 `next` 版式，数量读同一设置。空结果复用 `EmptyState`，读取失败复用 `RetryNote`，可原位重试；关闭推荐时不取数。关注推荐复用 `/api/follow` 分页及 TanStack Query 缓存，最多读取三页；优先同创作者和共同标签，排除当前合集、已看、忽略与不同媒体类型。创作者头像链接复用卡片的 hover，下载链接复用舞台操作键几何；未新增依赖，推荐读取不写 ledger。
- 本地与在线详情标签共用 `components/detail-tags.tsx` 与样式：同一标签外观、最近使用、搜索与新建、改名预览及单条删除入口。写入仍由各自的数据层负责；在线来源标签的单条隐藏保存在用户设置，来源原词保留。关注管理的标签页签复用 `TagManager`，支持集中屏蔽和恢复内容。未新增依赖。
- 详情底部共用 `DetailContinuation`：分集队列在左、接着看在右，手机上下排列，两区独立横滚并共用底色。封面共用宽度与 16:9 比例；宽屏标题区通过 CSS subgrid 共用行高，摘要与操作键参与排版。`RelatedSection` 给卡片的 8px 悬停面留出滚动内距；分卷与版本的推荐按队列种子缓存。队列头像共用 `cardIdentity`、`avatarInner`，同时读取列表投影与详情 `entity_refs`，保留图片版本及人脸取景。
- 艺人、卖家名册的 RSS 标记读取 `/api/index` 的 `following`：按实体 ID 汇总已启用的 JAV 新作订阅与关注来源，停用、移除及未确认绑定的同名来源不计入。标记复用 `PeopleGrid`、BoardUI `Chip` 与现有 RSS 字形，不增加取数请求或依赖。
- 统计与口味两页按登录态 Vercel Analytics／Speed Insights 的当前页面重做，排行与数据源共用父网格的引导线。
- 口味页顶部给出结论与可点入口：浏览与 Peach 两侧的共同信号、可探索标签、待补证据的下一步动作。
- 操作回执复用 Toast（Sonner 的栈，`frontend/src/react/toaster.tsx`；壳里只调 `toast()`／`actionReceipt()`）；按钮以 Spinner 和 `aria-busy` 标明忙态。后台任务显示可恢复进度，断线自动重连。
- 实体的统称由用户在资料页自选：菜单只列这条实体名下已有的写法，选中的提为规范名、换下的留成别名，扁平投影跟着改；先过确认弹层并点名两个写法，成功后发可撤销回执；不收自由文本，撞上另一条实体的规范名只报冲突。
  - 艺人入口审计复用 `entry_links` 的 JAV 目录闸与日文名选择、只读 SQLite 和 `review_csv`；`audit_performer_entry_names.py` 覆盖全部 performer，分别记录入口来源、名称选择和中文来源缺口，远端页面未请求时保留「未取得」。译名复核后的原日文名按 `performer-localization` 来源优先。`localize_performer_names.py --mapping-source` 标明 CSV 的真实复核来源，`--only` 限定实体并拒绝不完整的同人合并组；别名、兼容标签、来源留痕和备份沿用已有实现。未新增依赖。
  - MISSAV 入口优先读取 `state/missav-actresses.json` 的实际名录 href，保留原字形、数字前缀与括号艺名；`directory_name_key` 仅对匹配折叠字形及纯汉字、假名名称的空白，英文名称空白保留。同名对应不同路径时不显示入口；明确 `verified=false` 的来源项阻止该名称入口及模板回退，页面重新核验后可解除。未采全名录的缺项保留模板候选，不能判为站点未收录。七沢みあ、逢沢みゆ的 h1 与 canonical 已在用户 Chrome 验证，证据在 `<私有验证记录>`；名录原始分页和全库匹配 CSV 在 `review/missav-directory/`。API 与全库审计共用 `entry_links.build`，派生入口不写 ledger，403 验证页记「未取得」。艺名选择沿用现名、读音排除与来源冲突复核。无新增依赖。
- FC2 作品计数复用 `ordered_multipart_items`，`web_catalog.video_work_key` 按账本代次缓存已确认的合集键；资料、名册、同台艺人、标签与补全共用。`/api/items.work_total` 供作品读数，`total` 仍用于文件分页；不确定分段不归组。出演名单展开复用 BoardUI `Button`。跨角色人工合并走 `merge_entity`，`user:identity-merge:<kind>` 的别名与墓碑共同证明旧资料页地址，单纯同名不跨角色跳转。
- 馆藏分组缓存声明 `asset`、`asset_entity`、`entity` 依赖；下载进度和复核留痕不使分组重算，同键计算串行共用。作品计数通过 SQLite `create_function` 注册资产到作品的只读字典查找，沿用既有版次与分卷判据。下载后处理复用已绑定资产、整理备份及逐项外键基线比较（`performer_alias_followup`）；单部采集只结算本资产候选，进度在 `state/download-processing/`，共享 CSV 仍受全库处理锁保护。资源查询缓存拒收缺字段和来源失败的旧结果。无新增依赖。
- 整理备份的保留复用 `peach.ledger_backups` 的清退规则、完整性拒绝与边车清扫，只多给目录、文件名模式与份数；`organize_backup` 统一写备份、持有在用的那份并清退，下载后整理与手动整理共用，不另写一套清理。
- Application 管理路由与资源，域控制器适配原生宿主。文件检查含本地与网盘，来源等分、共用确认弹层；CloudDrive 分档建议首启与配置页共用。
- 名字里的括号都走 `split_composite_aliases.py`：自动那拨只认罗马字复合人名，`--from-review` 那拨按人工判定清掉不承载名字的尾巴，旧写法留作别名；读音、厂牌消歧和角色出处不拆。`<私有验证记录>` 中的 28 条 creator 注音、575 条 tag 角色出处和 10 条 series 厂牌或载体消歧均保留，不属于待执行批次。
- 全库创作者归属复核走 `scripts/audit_creator_attributions.py` 与 `metadata_creator_attributions`：复用 `code_creators` 的文件番号核对、DMM `matching_cids`、`western_release_identity`、厂牌规范名和别名、`studio_sites.is_platform`、字段归属、SQLite 备份及 `review_csv`。发行站作品号同时核对目录名与媒体文件名；来源目录见 [Legs Japan](https://www.legsjapan.com/en/)、[Fellatio Japan](https://www.fellatiojapan.com/en/)，平台身份见 [myfans 官方说明](https://creators.myfans.jp/)。预览覆盖全部来源关系与无作品实体；执行带冻结计划、备份和回滚记录，在事务内重算。只撤下有文件或发行来源证据的 `legacy:asset` 关系，保留用户判断、外部身份、规范实体和个人记录。月份、画质、份数与合集注记只回归已存在的完整账号；结构目录按整名切分判定，词汇取 `catalog_rules` 标签、`genre_taxonomy` 来源词与 `resources/naming/structural_directory_words.txt`，不登记具体馆藏的目录名；`creator_collection_base` 同时用于审计与摄取。公开厂牌断言可补空厂牌投影及关系，缺少规范厂牌时记录新实体完整快照；`upsert_asset_entity(update_entity_metadata=False)` 保留既有资料。结构目录、已知转载站及可信厂牌不进入自动 creator 摄取。外键检查逐项比较既有悬空；回滚核对字段版本、关系和新实体引用，后续改动拒绝整批恢复。
- 实体链接可安装：`entity_link` 表、`q_entity` 的 `links` 契约、资料页 favicon 与管理页链接管理成套；死链区分「搬走了」和「没了」，`rediscover_entity_links.py` 从站点索引页上溯找新锚，确证没了的由 `link_status.settle_gone` 处置（已隐退女优留成不可点的失效标记，其余删除）。
- 链接管理的主要站点复用 `SiteMark` 与 `/link-mark?id=`；`/api/links` 的 `top_host_link_ids` 为每个主要站点提供一条现有实体链接的 ID，取图范围由账本记录确定，计数使用链接外的中性 `Chip`。整理规则复用 BoardUI `Input`、描边模板按钮与轻量参数按钮；参数插入当前输入框的光标或选区，模板同时填入文件名与目录。`/api/organize/example` 以固定示例字段调用正式模板解析器，随自定义输入显示路径与语法问题，不读取账本或生成计划 CSV。编辑后须重新预览实际整理计划。番号参数使用 `{code}`，解析器接受 `{number}` 别名以读取已保存的规则。无新增依赖或真实 ledger 写入。
- 厂牌社媒核查：`find_studio_socials.py` 用 Beautiful Soup 4.15.0 解析锚点，传输与字符集用 `peach.http`，账号键用 `social_links.handle`，不加浏览器运行时；Peach 负责同站年龄门、已有账号差集与证据表。整页正则会混进帖子与脚本里的地址，不用于账号提取。
- 事务所是实体：57 家各有 `/agencies/<名字>` 页，成员、官网、标签与作品都按 `entity_membership` 算，女优页点得进去，搜名字出这家人的片；原文留在 `metadata.agency`。
- 外链圆标与厂牌标识取站点自己声明的资产，宽扁字标不参加小圆标竞选；`/logo` 的 `variant` 分 `icon`、`logo` 与最清晰的 `large`，大图版式和资料页取 `large`，紧凑版式取 `icon`。头像与标识共用 `nativeImageFit`：按像素密度折算的源尺寸不足框四成时等比居中、不放大、同图模糊补底，框短边小于 64 px 不补底；加载、回落和版式切换都重新度量。
- 共用网站的厂牌专页通过 `site_logos.logo_images(owner=...)` 核对图片的明确归属，只接收名称匹配的标识，不沿用平台页头、推荐厂牌或全站社媒账号；独立官网继续复用站点声明与页头标识。
- 关注的作者头像与来源图标是元数据：`follow_assets` 取回落在 `generated/follow-assets/`，经 `/follow-avatar`、`/source-icon` 给页面；地址只从固定表或固定主机拼，字节先认成图再写盘，到期重取失败继续用旧的并退避一小时，缓存有效期与 `/link-mark` 共用 `web_settings.metadata_refresh_seconds`。视频与图片不存本机。官方头像先认 FANBOX，没有时 `follow_avatar.profile_avatar_tiers` 取名片上的 X 与 Patreon，`follow_assets.largest_image` 留像素最大的那张。
- 厂牌标识由契约位 `has_logo` 决定出不出图：没装标识的厂牌一个 `<img>` 都不发，改用首字母底板，不靠 404 摘。标识 198 张随仓库分发（ADR-0026）。
- Iwara 视频作者订阅复用 [yt-dlp 的 Iwara 提取器](https://github.com/yt-dlp/yt-dlp/blob/9b58cb33d0cd3e823c8d8732f6adce8faa1f37e3/yt_dlp/extractor/iwara.py)（Unlicense，固定 revision `9b58cb33d0cd3e823c8d8732f6adce8faa1f37e3`）的 profile→用户 ID→videos 分页模型与 `X-Version` 文件接口签名；[gallery-dl 的 Iwara 提取器](https://github.com/mikf/gallery-dl/blob/882c8d0bb5c5a3ed4e88726d2f42a1cb7db59bf2/gallery_dl/extractor/iwara.py)（GPL-2.0，固定 revision `882c8d0bb5c5a3ed4e88726d2f42a1cb7db59bf2`）用于交叉核对 `apiq.iwara.tv`、视频文件字段与格式清单，不复制其实现。两者在 2026-10-23 获取时均维护中，Python 客户端可跨平台运行；完整下载器包含 Peach 不使用的下载、账户缓存与大量站点能力，因此只复用公开协议模型和 Unlicense 签名算法，不新增依赖。HTTP 复用现有 `curl_cffi`：匿名只读 POC 中普通 HTTP 对 API 返回 403，Chrome 传输取得作者资料、视频列表两页、详情与三档格式，五次请求约 4.9 KB、4.7 秒，未读取凭据或下载媒体。Peach 保留 DTO、关注状态、历史游标、凭据隔离及媒体代理；可选 `access_token` 仅发送到固定 API，不同步。列表只保存稳定视频页地址，短效文件地址与清晰度仅在播放缓存中保留；外部播放器、权限不足、空历史页、限流与结构错误分别处理。用法见 [Iwara 视频作者订阅](SOURCING.md#iwara-视频作者订阅)。
- Iwara 封面复用 `/follow-image` 的同源缓存，官方缩略图经正式 HTTPX 传输实测取得 200 `image/jpeg`；来源图标采用官网声明且实测为 PNG 的 `/logo.png`。官方头像专用解析路径未取得，作者头像沿用首字母回退；作者主页的用户名与署名复用既有官方别名学习。部分迁移视频没有可用时长或原画分辨率，字段保留未知，播放仍优先选择 `Source` 原画。标签模型另核对 [IwaraTool API 字段说明](https://github.com/Moeary/IwaraTool/blob/1e98c96c422a169699c0d16bcab49b8a7f5238d5/docs/API_zh.md)（MIT，固定 revision `1e98c96c422a169699c0d16bcab49b8a7f5238d5`，仅核对协议，不复制代码）；匿名 `/tags` 与八条视频的 28 个标签均为 `id/type/sensitive` 模型。仅 `type=general` 明确进入 Peach 的通用词表，其他类型与缺少类型的原词保留，原始类型另存 `source_tag_types`，不按词形推断。
- 关注检查分两阶段：列表阶段落 partial 行，详情补全按 provider 额度只补新行和未补齐行。「补齐过」由连接器的 `ENRICHED_MARK` 声明、判据登记在 `follow_store._ENRICHED_PREDICATES`。
- 关注原始证据复用 Python 标准库 `hashlib.sha256` 与既有 `write_immutable`。快照文件名由检查时间和完整说明的摘要组成；说明含正文 SHA-256、脱敏请求地址及候选数量，因此相同正文的不同游标或筛选结果各有独立证据。相同快照可重复保存，已有文件内容冲突仍拒绝覆盖；历史证据按账本保存的相对路径读取，无迁移或新增依赖。临时账本回归遍历登记表中的全部追更来源，覆盖正文、地址及候选数量的独立变化，并经 FANBOX 连接器验证相同正文的历史补足和重复检查。
- 单来源失败边界覆盖取回、整页存储和历史补足；证据内容冲突保留错误，已提交的条目继续保留，其他来源继续检查。Web 与 CLI 共用 `follow_check.run_check` 的失败结果，不把证据冲突记成成功。
- 关注检查失败在本机 `follow-check` 事件中保留来源、来源编号、失败阶段、请求页及异常链；只记录登记来源键与技术状态，不复制作者名称或来源地址。单来源错误仍按既有任务结果返回。
- 关注媒体的本机诊断复用 `error_reporting.event` 与支持包脱敏入口，分别记录来源、资源来源、来源及条目编号、播放／图片／清晰度／大小操作、解析或回源阶段和上游状态码。上游响应正文不进入诊断字段；异常中的地址和凭据由统一入口脱敏，远程诊断字段范围保持既有约定。隔离 API 和支持包回归覆盖 403、429、异常链、无效媒体清单及脱敏保真，无新增依赖。
- 存量行重抓（连接器新学到图片宽高、封面这类字段时，旧行不会自己补上）分两步：把 `ENRICHED_MARK` 换成新字段落库后才有的键并登记判据；再 `POST /api/follow/check` 发 `{"older":true,"backfill_all":true,"rewind":true,"background":true}`（可加 `"sources":[id,…]`），从第 1 页走到站点说没有更多，进度读 `GET /api/follow/check`。`backfill_all`、`rewind` 离开 `older` 被拒收、不进界面，ledger 的回填游标只进不退；长跑任务，重启前按 `peach-batch-jobs` 先查。
- 图片的固有宽高只问文件头：`follow_image_dims.probe_image_dims` 发 `Range: bytes=0-65535`，`dims_from_header` 认 PNG／GIF／WebP（VP8、VP8L、VP8X）／JPEG（跳过 EXIF 到 SOF）；连接器、`backfill_follow_image_dims.py` 与 `/api/follow/image-dims` 落库前都经 `positive_dims` 归一，`FollowStore.set_image_dims` 只补空缺。宽高只为图片视图的卡面预留比例，回填每个条目只问卡面那张；原文件主机拦脚本（pawchive 的 `file.` 子域挂 ddos-guard）时按缩略图量，详情原图取不到也退回缩略图。
- 归档站（kemono、coomer、pawchive）多图或视频的帖子由 `KemonoConnector._media_items` 列进 `media_items`（交付文件排第一、按路径去重），详情轮播与 `/follow-stream?media=N` 按条目自己站点的主机白名单取。
- `/api/related` 用 Tag IDF 加 MMR 排序并缓存；搜索使用 FTS5 trigram，短查询回退 LIKE 并覆盖规范名、别名和检索词，搜索历史在 reader 写入被拒时降级到页面内存。
- 搜索预览复用 `/api/suggest` 的分类总数、二十条上限与菜单滚动容器；多类各预览五条，单类预览二十条。视频总数超过预览时通过「查看全部」进入现有目录连续滚动，不新增分页接口或滚动依赖。
- 复核页覆盖元数据、创作者标签、Logo、头像、身份、番号目录、FC2 证据和片尾出处；抓取与 AI 结果仍是候选，批准后才写真相字段，元数据候选保留 MetaTube 目录证据且不下载 URL。
- 元数据旧决定是否过期只由 `metadata_auto_apply.metadata_decision_is_stale` 判，复核页与自动落库共用；过期后的重判、人批准标签只增不删、FC2 描述性称呼自动否决与两类撤回见 ADR-0079，`pending_genres` 收录后按并集补标签与 `genres_still_pending` 见 ADR-0082。
- 资料页头像圆框角上的换头像入口有五条路：图库同名的其他图与这个人取过的每一张图、本机文件、https 地址、本人作品画面、输入番号取封面。
  - 取到的图按内容哈希进候选缓存，换回去不重新下载。页面只回递服务端列出的 `ref`，地址由服务端按索引拼；手填地址过 `http.public_https_url`。
  - 人像三路（图库与取过的图、手填地址、本机文件）点开先进框选，可整张使用：`POST /api/avatar-frame` → `avatar_picker.framed` 量转正后的尺寸、按 `face_square` 落默认框；手填地址经 `typed_address` 取一次按地址存进 `url/`，之后的 `url:<地址>` 只读本机；本机文件只量不存，确认时框走查询串 `crop=x0,y0,x1,y1`。框出的一块按 `peach:picker/<sha>` 入缓存，原地址仍指整张；EXIF 方向由 `images.upright` 统一转正。
  - 作品画面一部一格，底图在封面和九宫格九格之间换，框出方形再装（`avatar_picker.asset_artwork` 与 `crop`，走 `/avatar-choice`）；服务端每次先核对作品挂在这个人名下（`asset:<id>:cover` 谁都拼得出），裁出新字节，原图不动。
  - 番号取封面（`POST /api/avatar-code-cover` → `avatar_picker.code_cover`）不要求番号在馆藏：本机封面目录优先，没有才走 `jav_cover_fetch.best_cover`，按番号只存对象、不写证据，之后的 `cover:<番号>` 只读本机。
  - 默认框围着 `avatar_picker.cover_focus` 取景：有脸取 `avatar_cover_face.face_square`（要边车里有脸宽与 `px`，缺的 `detect_cover_faces.py --redo`），没脸取 `jav_poster_crop` 的正封，前端不另抄判据。
- 整张作品封面不装成头像：单人作品关联不证明画面里是谁，`cover_fallback` 标身份未核实，采集脚本的安装闸门拒收。图库给不出唯一人像时，补头像后继（`peach.avatar_followup`）从单人作品封面截脸周围一块方图（`peach.avatar_cover_face`，YuNet 脸框放大 2.4 倍），按脸宽像素挑封面、最差是缩略图，其余检得出脸的封面各截一张进候选缓存（至多 8 张）。面具、眼罩照样算脸，检不出的不降门槛去捞（低分框多落在手和身体上）。来源记 `cover-face` 与 `identity_verified: false`。
  - 图库同名多张时先按脸认人（`peach.face_match`，互证与小图作证见 ADR-0056、0057、0062、0066）；封面未匹配时仍允许不同来源、不同照片的图库多数独立互证（ADR-0104）。短边至少 300 像素的档案小图优先于封面裁片（ADR-0102），更小的图在封面落空时兜底。身份判据复用 `match_gallery`，来源标 `gallery_small`，可升级至标准图库人像。
  - 自动封面头像可换为合格档案人像或更清晰封面，人挑的不碰；候选列表按本机内容及默认裁切哈希去重，保留在用状态、具体来源与作品全部底图。展示去重不参与身份判断，不联网取图，不删除历史缓存。
- 外部来源 genre 只在 `peach.genre_taxonomy` 投影：JavDB `類別` 与日英来源词共用词表，非内容分类排除，未收录原文回传登记；查表只有 `resolve_genre` 一处，抓取与复核折叠共用。r18dev 取 `categories[].name_ja`，日文取不到才用英文。有码标签的来源选择复用 `metadata_policy.preferred_tag_source(code)`，排序、采集与复核一致；替换走 `metadata_auto_apply` 的来源归属与人工判断保护（ADR-0100），不另写直写流程。
- 中文来源词的有限简体别名由 `generate_genre_simplified.py` 使用已有开发依赖 OpenCC 1.4.2（Apache-2.0）生成，冲突拒绝；别名保存在 `genre_taxonomy` 的独立区块，历史词表从同一个 Git 版本读取完整规则，运行时无需 OpenCC。覆盖全部登记词的繁简投影测试保留人工决定优先级和未知词出口，无新增依赖或真实账本写入。
- 一件事只留一个标签名：`catalog_rules.RETIRED_TAGS` 存「不该再用的写法 → 规范名」，唯一写入口是 `scripts/rename_retired_tags.py --apply --backup`，实体按 `entities.merge_entity` 并、旧名留作别名；`pixiv_tag` 是作者原话，不参与。规范名取馆藏通行写法（`合集` 来自文件名，`混合集` 全来自已关停的 Stash 导入，ADR-0021）。
- 手动添加标签复用 `current_tags`，API 返回规范名，详情缓存、最近使用与撤销沿用该名称。`core/tags.ts` 在浏览、收藏与编辑中沿用服务端当前名称；来源同义词由实体身份层登记为别名。`OL制服`、`JK制服` 保留完整名称，制服归外观，`秘书OL` 归角色。
- 没有接替者的标签登记在 `catalog_rules.DROPPED_TAGS`（`乳系`、`足系` 这类粗桶）：落库时经 `current_tags` 丢掉，`rename_retired_tags.py` 连实体删掉。映射改了原词去向后，`scripts/reproject_snapshot_tags.py --since <改动前的提交>` 按 `raw_snapshot` 新旧各算一遍、只加减差值；不给 `--since` 是按现映射补缺、一个不删。加的走并集（`auto:metadata-tags@<时间>`，可整批撤回），删的只删那组来源下的行。
- 来源原词经 `genre_taxonomy` 与人工词表投影。`peach.stale_candidates` 识别未收录原词中的整串 ASCII 字母，`scripts/drop_stale_genre_candidates.py --apply` 摘下候选并留备份，下一趟「只采集」按 `_missing_fields` 重取。JavDB 类别使用中文 locale；已有标签切换来源走 `scrape_codes` 番号候选重取。`reproject_snapshot_tags.py --since` 只重投既有快照的映射差异，不代表完成来源切换。
- 未收录 genre 在复核卡上就地收录：`genre_decision`（迁移 0026）存「规范化来源词 → 中文标签」，留空即判非内容词；`peach.genre_decisions` 只管读写，映射仍在 `genre_taxonomy.map_genres`。收录后 `extract_peach_fields`、`scrape_codes.py`、`harvest_kmib.py`、`fetch_fc2_metadata.py` 都当它已知，排队中的候选由 `web_review._fold_genre_decisions` 当场折进值里；收录只改词表，落库仍要按「通过」。候选词表只给静态表已投影到的中文标签。只在 `warnings` 里有中文提示的旧候选由 `genres_in_warning` 反解出原文，不必重抓。
- 补抓按番号发行面分流来源，要求来源认得出所查番号、冷却按连败触发且会过期；无码发行站的片与粘连的版次标记也给得出徽章。
- 「只采集」的「说过没有」记忆与 `_answered_sources` 见 [来源采集](SOURCING.md#按内容类型的来源链)；只有明确答复「没有」（HTTP 404、所有渠道无候选，即 `jav_cover_fetch.NotFound`）才记，超时与网络故障不记。没有番号的视频（创作者作品、裸文件）只登记本地海报，不列为问题项。相机文件名派生的旧伪番号（`VIDEO-2022`、`IMG-1734`）由 `scripts/clear_camera_filename_codes.py` 清掉，用户或复核写下的番号不碰。
- reader 的 `/review` 通过严格 Peach CA HTTPS 读取 writer 的归一化 JSON 并原子缓存；决定按钮和所有关注写操作仍锁定。
- macOS Ledger 同步在共享根判为 `offline` 时先经 NetFS 挂载 `peach-sync` 再重判，挂载失败才保留离线结果，不弹阻塞认证框。
- 浏览历史增量采集使用 SQLite backup API 与 `browserexport`，也接受 Google Takeout ZIP；原始 URL 与标题只留本机私有目录，聚合候选不写 ledger。
- 首次设置的可选历史引导转到 `/taste?onboarding=1`，用现有读取与导入入口；指南链接按 [Google 导出说明](https://support.google.com/accounts/answer/3024190?hl=zh-Hans) 与 [browserexport](https://github.com/purarue/browserexport) 核验（2026-09-06）。
- 实体事实包位于 `resources/seed/entities.json`，维护者显式导出、复核并随应用版本分发。`scripts/seed_pack.py export` 只读账本，继承累计撤销；用户升级后，扫描与采集结算后的种子后继按内容摘要派发导入。wheel、Docker 和桌面构建共用资源清单，缺包即拒绝打包；桌面制品验收核对 v2 格式和摘要。结构校验复用已固定的 Pydantic 2.14.1（MIT），摘要使用 Python 标准库 SHA-256，持久导入历史和纠错复用既有 SQLite 实现，无新增依赖；不引入远端更新器或加密容器。别名保留源 confidence，用户资料由归属保护，种子不含图片，包中缺席不视为错误撤销。维护流程见[实体事实种子](SEED.md)，分发边界见 [ADR-0117](adr/0117-public-entity-seed-distribution.md)，纠错见 [ADR-0106](adr/0106-seed-correction-history-and-explicit-withdrawals.md)。
- 数据管理首屏直接复用实际 `cleanupfieldset` 正文和操作条，只有计数等待取数；资源同步与重复文件网盘操作根据 `/api/sources` 已配置来源显示，离线来源保留入口。资源同步的检查与执行覆盖已配置的 local、115、PikPak，一次检查同时报失效记录、空文件夹与孤儿缓存；按目录清理也支持本地磁盘。

## 必须复用的成熟实现

下表每行是一项能力：中列是必须复用的实现（带固定版本与许可证），右列是 Peach 自己负责的部分和不能越过的约束。

| 能力 | 复用实现 | Peach 负责 |
|---|---|---|
| 本机文件夹对话框 | Windows 自带 `powershell.exe` 经 `Add-Type` 调 Shell 的 `IFileOpenDialog`（带地址栏），STA 线程里 `SetThreadDpiAwarenessContext` 设 Per-Monitor V2；macOS `osascript` 的 `choose folder` | `src/peach/folder_picker.py` 只拼命令、区分取消与失败、一次只开一个，用完恢复原 DPI 上下文（托盘的进程 DPI 不传给子进程）；不引 tkinter 或 GUI 框架。证书子进程用 `CREATE_NO_WINDOW`，保留 OpenSSL 退出码与错误输出 |
| 跨磁盘迁移数据目录 | Windows Shell 的 `SHFileOperationW`（`FO_COPY`，ctypes 直调）：资源管理器自带的复制进度、剩余时间与取消；其他系统用标准库 `shutil.copytree` | `src/peach/data_storage.py` 负责目标校验、复制前后核对文件数与字节、失败删掉已复制部分、改写账本里的数据目录路径与位置记录；同卷只用 `os.rename` |
| HTTP | 全项目共用的 `httpx.Client`/transport；FANBOX 公开 `post.info` 用 `curl_cffi`；对外 UA 统一取 `peach.user_agent.USER_AGENT`（与本机 Chrome 同大版本，ADR-0060），HTTPX、来源连接器、FFmpeg 抽帧与脚本共用 | 来源策略、DTO、脱敏、站点限定、大小上限；不求解机器人质询，标准 UA 不保证放行 |
| 追更来源接口 | FANBOX 公开帖子 API（详情只用用户的可选 Cookie 与 curl_cffi `chrome150`）、kemono 系公开 JSON API（`Accept: text/css`，站点自述的抓取路径）、rule34.xxx 官方 dapi（需 API key）与公开 tag 补全、Paheal 标签/详情页、Gofile contents API（需 Premium token）、f95zone `latest_data.php`、站内搜索（需登录 cookie）、线程页与 masked XHR、simpcity 线程页与站内搜索（需登录 cookie；只请求规范地址，不解 DDoS-Guard 质询） | 连接器边界、凭据隔离、多媒体顺序、文件站目标校验、变体与跨站重复判定、候选复核与批准后的 online asset 投影 |
| XenForo 论坛解析 | gallery-dl `v1.32.11` / `2adf2a8e`（GPL-2.0）的 `extractor/xenforo.py` 只作协议证据（cookie 优先的登录、`article[data-content]` 楼层、`.pageNav` 分页、`data-s9e-mediaembed` 嵌入）；cyberdrop-dl `5.6.21`（GPL-3.0，2024-09 起按站方要求下线 SimpCity）只作历史参照；两者都是完整下载器，不进运行时 | f95zone 与 simpcity 共用 `_xenforo_posts`／`_xenforo_thread_title`／`_xenforo_search_threads`（先取会话绑定的 `_xfToken` 再 POST `/search/search`，带回版块标签）；cookie 只发回来源站，末页由分页导航自算（HTTPX 跟随重定向会丢显式 Cookie），过滤纯讨论楼层。站点 cookie 前缀会轮换（gallery-dl 写死的 `ogaddgmetaprof_user` 已换成 `yMziCv8BrCZz1o7_`），所以不认 cookie 名、只透传整条 Cookie 头 |
| 文件系统事件 | `watchdog`（Apache-2.0）加定期对账，只订阅 `local` 来源的根；网盘挂载不订阅，递归 watcher 在网络挂载上就是轮询。CloudDrive2 的 webhook 请求形态与「云端路径不进 pathlib」取自 `sqzw-x/amane`（GPL，只借设计，见 [docs/reference-snapshots/amane-watcher.md](reference-snapshots/amane-watcher.md)） | `src/peach/push_discovery.py` 负责去抖、大小稳定的写完判定、前缀表映射、共享密钥与来源校验；登记本身调 `scan.ingest_path`，与全量扫描同一条 upsert（ADR-0041） |
| HTML 适配器 | Beautiful Soup 4.15.0（MIT） | 来源专用选择器和来源记录 |
| 位图 | Pillow | 头像/Logo 质量和来源策略 |
| 头像手动选择 | Pillow 12.3.0（HPND）的格式插件、`verify`、`load` 和 `ImageOps.exif_transpose`；[官方格式说明](https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html) | 按实际内容读取 JPEG、PNG、WebP、AVIF、GIF、BMP、TIFF、ICO 与 JPEG 2000。第一帧完整解码并转正，透明图片编码为 PNG，其余使用现有头像 JPEG 质量。候选缓存、内容哈希、裁剪与安装沿用 `AvatarCandidateCache`、`images.crop_to_box` 和实体头像入口。浏览器读取静态转换预览，本机确认仍提交原字节。无新增依赖、原图改写或真实 ledger 写入；HEIF 插件增加编解码依赖，SVG 光栅化不属于头像位图入口，当前不引入二者 |
| SVG 光栅化 | `resvg-py`（resvg，MPL-2.0 绑定） | 只把站点自己的矢量图标转成位图交给 Pillow（threads 的 app 图标只有 SVG，2026-09-02 核对）。不选 cairosvg：它在 Windows 要另装 cairo 原生库，resvg-py 是 abi3 轮子，win_amd64 / macosx_11_0_arm64 / macosx_10_12_x86_64 都有官方预编译。候选发现、比例判定、缓存与回退在 Peach。`images.bake_square_vector` 用标准库 ElementTree 包一层外层 SVG 做方形归一，产物仍是矢量，栅格化只用来判配白底还是深底 |
| 搜索 | SQLite FTS5 | 索引字段、排序、profile 感知筛选 |
| 相关推荐 | OpenAver `8cc17e50453d9f69a81f5fee1a072df80f7aab73` 的 Tag IDF + 系列／片商／出演者规则只作固定算法参考（MIT） | 独立实现规范实体评分、MMR 多样性、稳定 seed、解释原因与负反馈边界；不复制上游 UI／源码 |
| 女优姓名对照 | `li-peifeng/Jav-Actors-Mapping` 的固定 revision，仅作私有输入（仓库未声明许可证，不随 Peach 分发） | 精确匹配、冲突复核、别名、来源与真实 ledger 写入 |
| 女优头像候选 | Gfriends 的 GitHub raw 索引与单张媒体（只作外部 Provider，不克隆图库）；r18.dev 人物对象给出的 DMM 官方 `actjpgs` 缩略图只作精确身份绑定的首次头像 | 名字链、质量档位、格式/尺寸/SHA-256 门槛、候选缓存、provenance、健康统计和人工复核；首次头像只在人物主名精确一致、实体已连到同一资产且没有在位头像时安装。自动档案缩略图未达标准尺寸时进入图库升级核验；没有可靠图库候选则保留档案照。换头像端点记录人工选择，自动后继保留该选择 |
| Gfriends 索引读法 | `src/peach/gfriends.py` | 页面与自动任务共用 `avatar_picker.IndexRefresher`、统一采集出口、失败退避与原子缓存；自动任务等待索引准备，窗口按刷新状态读取新候选，索引内容摘要参与头像重派。`Filetree.json` 解析、名字链匹配、`quality_key` 排序与 raw 地址共用现有实现。**目录前缀是来源优先级，不是清晰度**（上游 README 写的「质量升序」不准）：`0-` 网友投稿、`1-`～`8-` 写真机构与片商官方、往后是原图两三百像素的大型数据库，排第一的是最该先试的一张；`AI-Fix-` 是上游放大去水印版，去掉前缀取原件 |
| 「这个地址能不能让 Peach 替人去取」 | `src/peach/http.py` 的 `public_https_url` + `resolves_publicly` | 追更图片代理与手填头像地址共用：必须 https 与公网域名，不收 IP 字面量与用户信息，解析出的每个地址都要 `is_global`；否则 Peach 就是能访问路由器、NAS 与本机端口的跳板 |
| 头像写入 | `src/peach/avatar_provider.install_entity_avatar` | 采集脚本、复核页与换头像共用：`.img` 经临时文件原子替换，`.ct`、`.provenance.json`、`.face.json` 一起换；检不出脸要删掉旧 `.face.json`，否则页面按上一张的脸框取景且看不出错 |
| 厂牌 Logo 候选 | 厂牌官网确认的社交 handle → unavatar URL 解析 → 平台 CDN 单图 | handle 归属、内容缓存、方形归一、精确/感知哈希、provenance、健康统计与变化复核 |
| 厂牌字标名录 | 发行商与平台自己的厂牌名录，入口在 `harvest_maker_directories.DIRECTORIES`：MGStage `/ppv/makers.php`、Prestige `/api/maker`、KMP `/label`（大半是 SVG）与 jae.tokyo 展会名录 | slug↔账本对账（四路判据，空罗马字形不可比）、按形状分三张指定表（方标装大位、字标烤方两位共用、方标只管小位）、改地址后靠 provenance 边车重新收人、复核 CSV 与安装闸门。存入口不存图片地址（KMP 文件名带时间戳），不推导 URL、不猜名字 |
| JAV 元数据查询 | 每个站只有一个归属（ADR-0048）：自写解析器持有 r18.dev、DMM／FANZA、一本道、FC2、fc2cmadb、FC2PPV-DB、JAVten、JavArchive、AVBase、JavBus、javdb，片商官网与转载站经 amane 桥（ADR-0043、ADR-0044）；MetaTube SDK `6a5e6128c725187aeaf921d48ed7d9cd9f30671b`（Apache-2.0）只作来源身份与丰富字段模型参考；DMM 的 GraphQL 接口地址、`ppvContent` 与 `legacySearchPPV` 两条查询的取法参照 OpenAver（MIT）`core/scrapers/dmm.py`，cid 匹配与身份核对是 Peach 自己的（ADR-0059） | 只发规范番号；Peach 管来源链（`metadata_routes`）、`provider_id`／`content_id`、逐字段优先级、原始与目录证据、健康统计、候选复核与 ledger 投影。amane 的 POC 判据与字段缺口见 [取证](reference-snapshots/amane-crawlers-poc.md) |
| Javinizer-Go 历史快照 | `sources/metadata/javinizer-go/<番号>/<来源>.json`，由 Javinizer-Go v1.5.x（MIT，`dd56998328d078c9baf68ff4fde2e6fcaa2a691a`）在 2026-09 之前取回；二进制与快照留在磁盘，没有调用路径（ADR-0044） | 只作离线证据：封面层读它的 `cover_url` 与 `content_id`，别名解析读企划名义，账本里 `javinizer:<站>:<字段>` 的 provenance 按 `metadata_policy.HISTORICAL_SOURCES` 认级别。`scrape_codes` 写进同一目录的新快照 `provider` 记解析器名、`provider_version` 记 Peach 版本 |
| amane 刮削站点（官方档 makers、prestige、faleno、dahlia、mgstage；转载站 fc2club、freejavbt、airav、avsox） | amane `fd9294fbe5b4aa88ce1df84d534f6816ad9460d5`（v0.22.1，GPL-3.0），经 `tools/amane-bridge/` 薄桥子进程接入（ADR-0043、ADR-0048；`makers` 是 amane 的 `official` 模块）：独立 `pyproject.toml`／`uv.lock` 钉 sha，桌面包通过主锁固定的 PyInstaller 分发独立可执行文件，Docker 携带独立 venv；源码与 wheel 在 `<Peach 数据目录>/tools/amane-bridge/.venv` 自动准备。桥只用 `amane.crawlers.sites.<站>` 与 `amane.net.*`，不碰 `aggregate` | GPL-3.0 与 Peach 的 AGPL-3.0-or-later 以进程边界相接；随包附许可证与完整对应源码。运行时核对版本、revision 和程序路径，构建与制品验收清空 PATH 后离线加载全部站点类；安装包缺失或不匹配时要求重新安装。字段、失败分档与无写入 POC 见 [上游复核](reference-snapshots/upstream-review.md)。Prestige 封套与正封分别投影封面和海报，配信日不作发行日；AIRAV 不解析试看时长。上游 `WebClient` 以 `verify=False` 发公开请求、不带凭据；403/406 可另轮换三次指纹，Peach 保持 60 秒子进程总时限。Peach 管来源链位置、身份核对、冷却、候选与结算 |
| 已确认厂牌的目录归位 | Javinizer-Go v1.5.2 organizer（MIT）只作冲突预检、模板化目录和回滚边界的协议参考，不调用它，不让它持有 Peach ledger | `rehome_unknown_jav.py` 只消费人工确认映射；先出逐文件 CSV，拒绝扁平化重名与厂牌冲突，SQLite 备份后移动文件并同步 Peach 路径／实体 provenance |
| FC2 目录元数据与跨号证据 | 已缓存的 fc2cmadb Inertia `article`／评论；Javinizer-Go v1.5.2 的 FC2 解析器（MIT）只作商品页字段边界参考 | 旧文章仍有标题、原始标签、日期、时长、卖家、FC2 CDN 封面与 `comments`（2026-08-31 登录态实测）；无歧义标签译成现有词表，标题／标签进 `/review`，`w1200` 封面过尺寸与解码门槛落生成产物；pair、合集/分片保护、hash/时长/尺寸佐证、库外 evidence、健康统计与复核归 Peach，不依赖 FC2-Leak-Detector/JavSP，镜像候选不直写 ledger |
| 缺索引 MP4 重建 | untrunc（anthwlock `9d86ec9`，GPL-2.0-or-later）与兼容的 FFmpeg 8.1.3 静态构建，固定来源及哈希见 `scripts/untrunc-sources.json`。Windows 安装包与免安装包携带 `tools/untrunc`，同一 Release 提供完整对应源码；原生样片实测覆盖尾部 `moov` 缺失后的 H.264/AAC 恢复、时长与全片解码。显式 `PEACH_UNTRUNC` 优先，其后依次查随包目录、数据工具与 PATH | `src/peach/mp4recover.py` 挑参照（同目录文件名最近的先试，最多 4 部）、验收（解码错误 ≤3 行、音视频时长差 ≤5%）、换回原路径并把坏原件改名成同目录的 `.文件名.peach-original`；缺整个 `moov` 的片子哪里都打不开，所以结果替换原文件，不像缺 `ctts` 那样另存头。实测见 [取证](SOURCING.md#媒体与关注实测) |
| 媒体探测/转码 | Windows 独立包从固定源码交叉编译 FFmpeg 9.0.2、x264、dav1d、nv-codec-headers、AMF 头文件与 libvpl，按 GPL-3.0-or-later 分发；版本、来源和哈希见 `scripts/ffmpeg-sources.json`。工具与完整对应源码一起构建，安装包和免安装 ZIP 共用经校验的 `tools/ffmpeg`。源码与 CI 媒体测试仍可使用 PATH 工具（[取证](SOURCING.md#依赖与工具实测)） | 容器与编码分别检查：MP4/M4V 的 H.264 8-bit 加兼容音轨直出，其余容器里的 H.264 8-bit 只换 MP4 封装；重编码按[硬件转码后端](#硬件转码后端)及本机播放加速偏好选择 |
| HTML5/HLS/DASH 播放 | Video.js 10.2.0 的 `@videojs/html`、`@videojs/hlsjs-video` 与 `@videojs/dash-video`，通过官方 `@videojs/cdn` 本地固定模块分发（Apache-2.0） | 流方案、授权、稳定时长、回退顺序和统计面板；详情不兼容片源复用 HlsSegmentService 与 FFmpeg 按六秒编码 H.264/AAC，独立缓存、绝对时间轴及会话取消，无整片预转码 |
| 播放器设置与影院布局 | Video.js 10.2.0 的播放器状态、原生媒体事件、播放／静音／全屏／画中画按钮与进度／音量滑条；YouTube `e937390a` 实际 DOM／CSS／JS 给几何、状态、动画和图形证据 | Peach 皮肤组合氛围模式、倍速、真实清晰度和影院模式：59 px 两排控制栏、40→111 px 横向音量、4→6 px 进度、右侧共享胶囊、整行悬停的 274 px 设置菜单、视口级全屏；普通视图 `contain`，全屏 `cover`。播放会话与同一枚原生视频经过舞台和小窗整体搬移，状态、字幕与上报保留；设置、时间、预览、统计、字幕菜单、中央提示和错误反馈属于 Peach。皮肤沿用本地 SVG 与 spinner，不复制上游按钮、滑条或媒体引擎的控制逻辑 |
| 播放器时刻预览 | Video.js 原生进度控件、统一时间索引与 `/timeline?id=&s=`；取不到时退回 `/poster?id=&c=0…8` 九宫格 | `timeline_sources` 读取 Jellyfin Trickplay、Emby／Roku／Plex 导出的 BIF、WebVTT 图片 cue、HLS／DASH 图片轨，复用现有 Pillow、标准库与 `m3u8==6.0.0`，无新增依赖；配对、格式边界及取证见[已有时间轴预览](VIDEO_PREVIEWS.md)。`timeline_sheets` 只对本机缺少可用产物的视频按每 10／30 秒预铺。网盘读取已有图片不触发视频抽帧；原视频抽帧的[流量判据](SOURCING.md#媒体与关注实测)保留。前端专用 VTT／sprite 插件不能承担磁盘索引和 BIF，不引入 |
| 外挂字幕 sidecar | 浏览器原生 `TextTrack` 与 [WebVTT 规范](https://www.w3.org/TR/webvtt1/)；配对复用 `catalog_rules` 的 `VERSION_TAIL_TOKENS` 与 `release_code_from_filename`。行为证据：sakuramediabe `import_service.py`／`movie_numbers.py` 的 `subtitle_matches_movie_number`（同目录、纯番号、不回退同名），NeoAVDC `organizeMedia.ts`／`parseNumber.ts` 的 `isSubtitleFile`（`.srt .ass .sub .vtt .ssa`，按视频主名前缀）；Peach 的判据是两者的并集加顺序 | `subtitles.py` 只做同目录配对（exact／suffix／code／orphan）、`asset_subtitle` 幂等登记、srt/ass/ssa → WebVTT。不用 `pysubs2`（为几十行加运行时依赖）和 FFmpeg（每次起子进程、报不出「编码认不出来」），编码要认 GBK／Big5／Shift_JIS，不用几乎吞下任何字节的 `gb18030`。内封字幕轨不在此列，`media_probe.py` 只取 `v:0`，流信息不落库 |
| 播放偏好与字幕记忆 | 原生 `TextTrack.id`；现有 `filelock==4.2.0` 与 `fsutil.atomic_write_text`，沿用本机状态文件的并发锁与原子替换 | `playerMemory` 与 `SubtitleSession` 供详情、小窗与沉浸播放复用；服务端 `state/player-subtitles/` 按资产、关注条目及帖子内视频分别保留 WebVTT，`subtitles.json` 同存旋转、倍速、字幕外观、轨道身份与最后选择，`null` 表示关闭。偏好以字段补丁在同一文件锁内合并，客户端同身份写入串行，用户操作不受迟到的读取覆盖。旁挂字幕按目录内文件名生成稳定身份，登记与载入顺序不参与身份；已保存的登记 ID 通过轨道别名恢复。同目录发现复用现有配对、转码与读取上限，只读授权目录并与已登记路径去重。内容保存先于成功回执，重复导入按轨道键覆盖；重新播放直接读保存内容。保留转换器与 SubtitleCat 接口，不新增解析器、浏览器数据库依赖或 ledger 迁移 |
| 分卷文件命名 | [Plex 官方命名](https://support.plex.tv/articles/naming-and-organizing-your-movie-media-files/)的 `cd/disc/disk/dvd/part/pt + 数字` 与 [Kodi 官方 File Stacking](https://kodi.wiki/view/File_stacking)只作行为证据；运行时复用当前树的 `part_marker`，不新增扫描器依赖 | 兼容裸数字、紧接番号的 A–H 与 cd 序号、fhd 序号及圈号标题，共有版次尾缀先剥离再取卷标。FC2 的明确数字合集允许缺集和零起始；本篇与唯一 SP、gift、特典可合卡，完整版与数字分卷混合、重复标签不自动合并。每个 asset 与播放会话保留，不拼接或改写媒体 |
| 照片灯箱轮播 | Swiper 14.3.0（MIT，本地固定版本，按需加载 CSS／JS）的 Thumbs / Keyboard / Zoom 模块，由 React 灯箱（`frontend/src/react/photo-lightbox/`）只经核心 API 驱动，不用 Swiper 的 React 封装 | 样式与脚本都就绪才构造轮播，保留 scoped 单 slide 结构样式防首载重叠；Swiper 管轮播、键盘、缩放与缩略图，Peach 管图集来源与顺序、缩略图居中、相对原图百分比、适应窗口／原大小、缩略图缓存与计费口径；图片墙是 CSS 网格，不经 Swiper |
| 浏览器历史 | `react-router` 8.4.0（MIT）的 `createBrowserHistory`（`v5Compat`），由主包里的共享源码提供（`frontend/src/history/`）；不用 `history` 5.3.0（2022 年后不再发版、另带 `@babel/runtime`，条目格式与 React Router 内置的那份并存） | 壳写地址的入口 `shellNavigate`：路径按当前地址解析，清理地址时透传当前条目的状态；一建好就接上唯一的监听位再分发，每次变化领一个导航序号 `seq`，认领写地址保持页面打开序号、无人认领时领新 `openEpoch`；页面元素按页面打开序号挂 key，覆盖元素按 `seq` 挂 key。`useRouteOpen` 在 `pageOpens` 就绪后排进微任务，普通点卡交一次性请求，`initialOverlayOpened` 只允冷启动首次打开；队列由 `QueueRequests` 读 `queueOpens` 接手意图，取齐实际条目后才写地址。背景由条目记下，启动不读，后退前进按条目恢复 |
| 客户端导航 | `react-router` 8.4.0 的 `<Router>`（Declarative 模式）与 `<Routes>`，`navigator` 是上面那一份历史（`frontend/src/react/router/`）；不用 `unstable_HistoryRouter`：它把更新包进 `startTransition`，接连两次变化并成一次渲染 | 每条路径都有元素，按匹配打开；每次没人认领的历史变化领一个页面打开序号，元素按代次重挂重取或就地推（`managed-routes.tsx`、`router/pages/`） |
| 导航排序 | 浏览器原生 HTML Drag and Drop，侧栏 `sidebar/sidebar-island.tsx` 与设置面板 `settings-panel/sidebar-order.tsx` 各接一份 | 桌面鼠标直接拖动、落点提示、上下移动按钮作为键盘与触屏回退、`localStorage` 持久化；不为单列排序引入额外运行时依赖 |
| 播放列表队列拖动排序 | `frontend/src/ui-kit/controls.ts` 的 `wireDragReorder()`，详情页岛经 `helpers.wireDragReorder` 调用 | `dragstart` 标记被拖行，`dragover` 按指针在行的上半或下半给落点线，`drop` 把整份新顺序交给调用方落库；落点线、抓手与焦点样式在共用件里 |
| 图标 | 固定版本的本地 Lucide 子集；Health Icons 24 px outline（CC0）用于领域图标；Phosphor regular 填充字形（MIT）只用在描边说不清的地方（字母表 Aa、播放列表） | 标签、状态和交互设计 |
| 资源文本中间省略 | Vercel Geist `MiddleTruncate` 行为契约 + 浏览器原生 `ResizeObserver`、`Intl.Segmenter`、Canvas 测量 | 文件名、路径、URL、ID 等资源标识用 `data-middle-truncate`；标题、说明、人名、标签等语义文本保留末尾省略；页面源测试登记全部末尾省略选择器，新增截断未先分类会失败 |
| 定时轮询 | APScheduler（MIT，固定稳定版；3.x `BackgroundScheduler` / interval trigger） | 只在 ledger writer 启动、持久频率、首次延迟、单实例、手动/自动互斥、运行状态与来源错误汇总 |
| 局域网发现 | Python zeroconf | 服务生命周期和真实客户端验收 |
| 生成产物跨机同步 | Syncthing 2.1.x，Windows send-only → Mac receive-only | 目录划分、忽略规则、方向固定与「Mac 不发布正式产物」的边界 |
| Windows 托盘 | pystray 0.19.5（LGPLv3）、Pillow、Win32 Per-Monitor V2 DPI | Peach 服务归属、后台更新检查、菜单动作、品牌图标 |
| Windows 托盘恢复 | Windows 自带 `OpenProcess`、`GetProcessTimes`、[`WaitForSingleObject`](https://learn.microsoft.com/en-us/windows/win32/api/synchapi/nf-synchapi-waitforsingleobject)、`GetExitCodeProcess`；Python 3.12+ 标准库 `ctypes` / `subprocess`，无新增依赖或分发体积 | `tray_lifecycle` 保留明确退出意图、创建时间校验、3 次 / 5 分钟预算与重启交接。pystray 0.19.5 的 `_message_handlers` 接收 `WM_STOP` / `WM_ENDSESSION`，已核对安装包源码；Windows 临时进程实验证明强制退出能恢复，明确退出不会恢复。原生 API 随受支持的 Windows 维护；pystray 使用项目固定版本。不采用 Task Scheduler `RestartOnFailure`：它只管理任务启动的实例，桌面快捷方式与现有重启脚本不归其管理；不新增 psutil 运行时依赖，进程句柄已覆盖等待与退出码。已知边界是监视器随整棵进程树被终止时不能恢复。 |
| macOS 菜单栏 | `pyobjc-framework-Cocoa==12.2.2`（MIT）提供 AppKit / PyObjCTools / objc | 附件应用策略、18 pt template 图、服务归属与菜单动作 |
| macOS 拖放安装镜像 | [dmgbuild 1.6.7](https://github.com/dmgbuild/dmgbuild)（MIT，Python ≥3.10，macOS）直接写 Finder 元数据；仅安装于 `build` extra。纯 Python wheel 约 35 KB，依赖 `ds-store`、`mac-alias`；固定传递版本见 `uv.lock` | 已读取固定版的文件复制、背景多分辨率合成与图标布局实现；背景渲染复用 resvg-py 0.5.0，无运行时新增依赖。Peach 提供 640×420 拖放布局、双分辨率背景和应用内许可证；[APFS 设置](https://dmgbuild.readthedocs.io/en/latest/settings.html#filesystem)保留签名资源的 Unicode 文件名。单元验证配置与图片尺寸，macOS 原生回归与发布验收实际挂载镜像，检查严格签名、资源字节及软链。磁盘镜像创建依赖 macOS 的 hdiutil；无需 Finder 自动化权限，挂载或文件系统失败会终止构建 |
| 人脸取景 | `opencv-python-headless==5.0.0.93`（Apache-2.0）的 `cv2.FaceDetectorYN` + opencv_zoo 定版模型 `face_detection_yunet_2023mar.onnx`（MIT，opencv_zoo 提交 `48b10fa5`，sha256 `8f2383e4…52fa4`，232 KB，随安装包放 `tools/face-models/`，没带时放 `peach-data/tools/yunet/`，不进 Git）；MetaTube SDK `6a5e6128c725187aeaf921d48ed7d9cd9f30671b` 的主脸聚类只作算法参考 | 头像／封面离线脚本共用 `peach.face_detect`（主脸、归一化焦点与 sidecar）。`detect` 按长边 320/640/1280 各检一次、分数取中位数；`main_face` 先筛掉分数落后最好那张 0.1 以上的框，再取最大。不用 Haar 级联（OpenCV 5 wheel 里没有、检出率低）与 Pigo v1.4.6（有无脸误报）。[实测](SOURCING.md#人脸与水印实测) |
| 人脸比对 | 同一 OpenCV 的 `cv2.FaceRecognizerSF` + opencv_zoo 定版模型 `face_recognition_sface_2021dec.onnx`（Apache-2.0，同一提交，sha256 `0ba9fbfa…34e79`，与 LFS 指针的 oid 一致，37 MB，随安装包放 `tools/face-models/`，没带时放 `peach-data/tools/sface/`，不进 Git） | `peach.face_match` 提特征、算余弦，阈值用 SFace 官方的 0.363；补头像后继拿图库候选与单人封面截到的脸比（ADR-0056），小脸先放大再检（ADR-0070）。检脸用 `peach.face_detect`，取模型先认随包那份（`bundled_model`，校验 SHA-256，进程内按文件大小与修改时间缓存结论），再走同一条 `fetch_model`；随包文件由 `scripts/fetch_face_models.py` 取齐并附两个目录的 LICENSE，Docker 镜像用 `ADD --checksum` 取同一组文件。不引 `face_recognition`／dlib（要编译、体积大）与 InsightFace（模型限非商用、需 onnxruntime）。[实测](SOURCING.md#人脸与水印实测) |
| 头像水印检出 | 同一 OpenCV 的 `cv2.dnn.TextDetectionModel_DB` + opencv_zoo 定版模型 `text_detection_en_ppocrv3_2023may.onnx`（sha256 `03f550c6…66587`，2.4 MB，放 `peach-data/tools/ppocr/`，不进 Git） | `peach.avatar_watermark` 检出，`scripts/scrub_avatar_watermarks.py` 复核与移除。不用 MSER 自写启发式（抓不到半透明水印）。`MIN_SCORE` 0.9、框宽占图宽 ≥ 4%、框整体落在距边 15% 带内；半透明水印给不出框，所以检出只是候选，人看标注图确认、漏的自己补框。移除优先裁边、不 inpaint。[实测](SOURCING.md#人脸与水印实测) |
| 正封取景 | 同一 OpenCV 的 `cv2.Sobel` 求列向梯度；NeoAVDC `c7a430c64013c97a0213cd8a57e2ff5696793a86`（MIT）与 sakuramediabe `9c6a31915c9a364c9d6717798575daf9445916bd`（GPL-3.0，只作算法边界参考）的封套几何实测值 | `peach.jav_poster_crop` 给出正封取景框（折痕列到右下角、满高），`scripts/poster_crop_boxes.py` 批量写边车，产物是坐标不是图片。折痕判据与边车契约见 [封面取景](COVER_ARTWORK.md)，外部参照、实测与手工框规则见 [取证](SOURCING.md#正封取景实测) |
| 115 文件清单 | `p115client==0.0.9.6.5.1`（MIT） | 只在显式 SHA-1 对账脚本中安装，Peach 负责 ledger 事务、备份与写入门槛 |
| 视频出处/片尾证据 | 现有 FFmpeg 抽帧 + Windows.Media.Ocr WinRT Provider（Windows PowerShell 5.1 固定适配器） | 有界首尾采样、缓存、来源/Full version 分类、健康统计与人工复核 |
| 参考产品行为 | 当前线上交互 + 有版本的公开 DOM/CSS/JS；取不到源码时用精确截图测量 | 证据登记、无障碍、Peach 差异、回归检查 |
| 浏览器历史解析 | `browserexport==0.4.4`（MIT、Python ≥3.9，约 35 KB wheel；Chrome/Firefox/Zen/Safari 的 SQLite 解析） | 消费者是 `/taste` 的本机读取与导出导入；Peach 保留 SQLite backup、Takeout、私有原始存储、域名分析和 candidate 生成，在 Windows 自己关只读连接。按必需列识别格式，以局部 Schema 补可选元数据列，时间与 Visit 转换继续复用上游。国产浏览器目录参考 HackBrowserData，不引入其运行依赖；目录与合成 SQLite 的最小验证、115 下载记录和旧搜狗限制见[浏览器历史导入](BROWSER_HISTORY.md)。跨主机同步须显式导出、传输并按来源去重合并 |
| Rule34.xxx / Paheal 高清封面 | 固定参考 gallery-dl `86047cf67a12bdb6ff1085774f8ad9fc347e8da9`（GPL-2.0，只作协议行为证据，不引入运行时）；运行时复用现有 FFmpeg | booru 按 `sample_url`/`preview_url`/`file_url` 回退，Paheal 只取原始 `file_url` 再抽帧：FFmpeg `blackframe` 的 `lavfi.blackframe.pblack` 在开头 30 秒选第一张黑色像素低于 98% 的帧，版本化缓存键淘汰旧黑帧（不用 GPL、默认取 10% 位置的 ffmpegthumbnailer）。Peach 管 URL 白名单、同源代理、双并发抽帧、缓存与低清回退 |
| FANBOX 正文解析 | PixivUtil2 `v20251112` / `e537e96` 的公开正文模型（BSD-2-Clause，只复用数据模型，不引入整套下载器） | Peach 的独立规范化 DTO 覆盖 image/text/file/article/video/entry、`fileMap`、`embedMap`、`urlEmbedMap` 和旧 HTML 正文，保留正文顺序、稳定去重、可播放媒体与文件页边界；许可证依据写在实现头部，传输固定 `curl_cffi` |
| CloudDrive 传输与代理配置 | `grpcio==1.84.0` 与 `protobuf==7.36.2`（消息代码由 grpcio-tools 1.84.0 生成后提交），消费者 `downloads_clouddrive`、`clouddrive_proxy` | 复用官方 proto v1.1.2 的最小方法子集；账号路径与挂载点绑定、API／数据代理双向读写、密码隔离、修订冲突检查与流量归属归 Peach。未声明的配置字段由 protobuf 保留并回传。没有新增依赖；不采用非官方 SDK，沿用固定依赖和 ADR-0089。协议证据及验证边界见 [CloudDrive 官方 API 接入](CLOUDDRIVE_API.md) |
| 本地 NFO 导入 | Kodi／Jellyfin NFO 协议（2026-09-06 核对 [Kodi](https://kodi.wiki/view/NFO_files/Movies)、[Jellyfin](https://jellyfin.org/docs/general/server/metadata/nfo/)），标准库 ElementTree，图片走项目固定版 Pillow；实现在 `library_nfo.py` | 只适配影片、单集与音乐视频（整剧、专辑、播放记录与远端图片引用不套用），拒绝 DTD、超大输入与越目录图片引用。同名边车优先，`movie.nfo` 与通用海报只用于单影片目录；正片和图片同属一组连号（`(1).mp4` 配 `(1).jpg`…）时同名图是图集的一张。已知内容词投影为中文标签，画质、促销、发行属性与演员编成丢弃，未收录的自定义标签保留；远端补厂牌、导演、发行商、时长与图片出处，人物主名精确一致时补 DMM id、假名、罗马字与首次头像，不替换演员真值。网络复用 R18 JSON 入口、SourceTransport、头像缓存与封面解析器。候选按资产 ID 与路径定位，批准时复核目标，时长证据不覆盖探测时长（ADR-0029） |
| JAV 高清封面 | Javinizer-Go `dd56998328d078c9baf68ff4fde2e6fcaa2a691a`（MIT）的 DMM modern `awsimgsrc.dmm.com/dig/...` 映射与尺寸门槛；Prestige 公开 API 的查询模型参考 MDCX `58e3f930f2e864fceb8a53ceef818716e2a6413d`（GPL-3.0，只作协议证据） | 候选、Range 量尺寸、面积最大者胜出与仅更大才原子升级见 `peach-jav-cover-workflow`。批量流程不请求社区来源，历史快照里的社区站只借厂牌；既有库采集在官方落空时经 `peach.community_catalog` 查 AVBase（取商品号认得出这个番号的店铺条目，名寄せ的标题可能来自合集）、JavBus 与 JavDB，两个图源先按 dHash 求一致，取景不同时用 OpenCV ORB（相似变换内点 ≥60 算同一张）。JavDB 只参与复核，不作为安装候选；其他单一图源留空 `verified_by`，遇验证页不绕过（ADR-0107）。MDC-NG 只证明 Amazon 日本渠道存在，只留 POC 候选。不写 ledger |

CloudDrive2 配置生成复用现有 TOML 模板、mDNS 公布地址和应用服务设置，origin 由现有 `httpx.URL` 处理 IPv6 方括号及端口。HTTP 与 HTTPS 按各自默认端口生成 origin，非默认端口完整保留；配置读取、保存与更换密钥共用生成函数。该差异属于 Peach 部署配置，无需引入协议库或新增依赖；模板沿用现有 CloudDrive2 结构。回归用临时服务验证 HTTP 通知接收、密钥和来源校验，真实 ledger 与生产监听设置不参与验证。

云下载服务地址统一通过 `downloads.clean_address` 校验协议、主机、端口及凭据隔离；设置保存、gRPC 目标与本机自动发现共用该入口，解析失败转成 `DownloadError`。已保存的无效地址按原值呈现在配置表单，其余有效偏好保留，读取不写文件；修正保存后清除提示。渠道发现分别处理 CloudDrive2 与 PikPak 凭据错误，健康渠道继续提供。

配置读取复用 `_read_section` 隔离可选区域，以 `section_errors` 返回区域名称、操作提示和诊断编号；异常交给现有 `error_reporting.event` 留痕。页面复用 TanStack Query 重新读取和 BoardUI Note、Button，在对应分区提供重试；未知媒体来源或计数时隐藏依赖它们的媒体表单。鉴权、本机访问检查及核心设置校验仍由配置入口执行。无新增依赖、ledger 迁移或后台重试。

依赖的第一个消费者及其隔离测试必须在同一改动落地，否则不引入依赖。
表里没有单列的 Python 依赖及首个消费者：`numpy`（vision 组，`face_detect.decode` 直接 import）、`socksio`（PikPak 的 SOCKS 代理）、
`opencc==1.4.2`（naming 组，`harvest_javdb_cn_names` 繁转简与字形表复核）、`psutil`（开发依赖，`agent_worktree.py processes`）。前端每个包的用途见 [前端岛层](FRONTEND.md#依赖清单)，引入时机按 ADR-0031「前端基础库」。
Python、npm 与 GitHub Actions 的版本由 `.github/dependabot.yml` 每周检查；固定前端文件由
`package-lock.json` 和 `scripts/vendor_web_dependencies.mjs` 重建并核对来源、许可证与 SHA-256。

## 来源文字质量与生命周期修复

来源文字中的 Unicode 替换字符 `U+FFFD` 表示解码时已有信息丢失。字段提取、既有候选选择和最终写入共用这一判据；含坏值的字段不参与来源优先级结算，原始快照保留。正常字段与正常中日文、重音字母不受影响，不使用启发式转码猜回原文。

存量文字补修复用字段归属、来源身份核对、候选结算与 `UpgradeRepairs` 的备份、事务和回执。仅机器归属的损坏标量字段可按同番号正常来源恢复；人物规范名及人工判断保留复核。已登记完成的目录补修不随文字规则重放；旧任务范围和队列继续保留。待重采的资产使用独立文字规则身份，先前完成的升级任务不吞掉新补修，尚在运行或已由用户取消的任务保持原状态。

播放生命周期复用 [PR190](https://github.com/peach-mitao/peach/pull/190) 的 `e41222e312443b5d0fc7be87d2f7eca9c1d61055`：共享分片按消费者计数，最后消费者离开才取消生成，并等待子进程回收；文件响应保留外层取消与运行错误。头像确认的图像和数据库工作共用工作线程，安装按实体加锁。当前 ASGI 响应头中间件、SMB 输入和图像预处理保留 Peach 主线实现；未采用该 PR 的界面、依赖和测试调度改动。

匿名签名校验复用 [PR150](https://github.com/peach-mitao/peach/pull/150) 的唯一入口、时间戳表达式及字符串约束，适配已存在的动态变量解析接口。媒体响应复用 [PR131](https://github.com/peach-mitao/peach/pull/131) 的被动类型校验、CSP `sandbox` 和 `nosniff`；HLS 清单继续可读，旧活动文档缓存不命中。以上均使用现有标准库、Starlette 和 filelock，无新增依赖。

## 静态检查

Windows 媒体子进程复用 Python 标准库 `subprocess.CREATE_NO_WINDOW`：入库探测、抽帧、拼图、预览、关注封面与媒体修复均显式设置，输出捕获、超时和取消按各入口原有契约处理。该标记由 Windows 原生支持，不引入依赖；见 [Python 文档](https://docs.python.org/3/library/subprocess.html#subprocess.CREATE_NO_WINDOW) 与 [Windows 创建标记](https://learn.microsoft.com/en-us/windows/win32/procthread/process-creation-flags)。

amane 查询与桥环境重建也使用 `CREATE_NO_WINDOW`，保留标准输出、错误输出、退出码与超时。复核产物读取复用标准库 `csv.DictReader`、`field_size_limit` 与 `strict=True`，支持单字段 16 Mi 个字符的多行证据；进程全局限制只增不减。解析失败报告文件与行号并保留原文件，截断的引号字段不能作为完整候选继续处理；写入沿用 `review_csv.write_rows(atomic=True)`。依据 [Python CSV 文档](https://docs.python.org/3/library/csv.html)，无新增依赖或真实账本写入。

抽帧与拼图通过现有 Pillow 12.3.0（HPND）完整解码输出图像，不按压缩文件大小推断有效性。复用既有 FFmpeg、色彩元数据重试与 `support_bundle`：失败记录包含采样秒数、时长、退出码、超时、工具来源和各次尝试的错误输出，错误原文截断并脱敏。诊断 ZIP 收集处理状态、最近 8 份问题清单及启动、更新、隧道证据。普通日志读取尾部 96 KiB，JSONL 按完整近期记录取尾；完整 JSON 在 16 MiB 内解析，脱敏后按 96 KiB 投影并优先保留任务状态与计数。超限、空文件与坏 JSON 在清单中明确标记，媒体名称留在本机。有效的不足 1 KiB JPEG、中文路径、失败重试和诊断导出均有回归；FFmpeg 参数依据[官方文档](https://ffmpeg.org/ffmpeg.html)，不引入 ffmpeg-python 等命令包装层，不写真实 ledger。核验范围见 [日志与诊断核验](DIAGNOSTICS.md)。

Windows FFmpeg 9.0.2 静态链接 VideoLAN dav1d 1.5.4（BSD-2-Clause，官方源码 1,038,852 字节，Meson + NASM，支持 Windows x64 与 8/10-bit AV1）。版本、HTTPS 来源与 SHA256 固定在 `scripts/ffmpeg-sources.json`，源码和许可证随对应源码归档分发；完整工具的 FFmpeg 二进制增加约 3 MiB，不新增 Python 运行依赖。原生 `av1` 包装器依赖硬件解码，浏览器可播放不能作为 FFmpeg 软件解码证据；CPU 解码直接采用维护中的 dav1d，不为当前仅需解码的链路引入 libaom 编码库。发行验收使用合成 AV1 片段确认 CPU 解码与抽帧。构建参数依据 [FFmpeg libdav1d 文档](https://ffmpeg.org/ffmpeg-codecs.html#libdav1d) 和 [VideoLAN 固定发行源码](https://download.videolan.org/pub/videolan/dav1d/1.5.4/)。

macOS CI 的抽帧与 AV1 软件解码回归使用 [Homebrew FFmpeg formula](https://formulae.brew.sh/formula/ffmpeg) 提供的原生工具，随非 core 测试域安装；实际版本和解码能力由安装日志与媒体回归核对。Windows CI 保留固定版本的 setup-ffmpeg，发布包继续使用自构建工具；不新增 Python 依赖，不改生产入口或真实 ledger。

Python 复用 MIT 许可的 [Ruff](https://docs.astral.sh/ruff/) 0.17.0，版本由开发依赖和 `uv.lock` 固定。规则配置在 `pyproject.toml`；正式入口通过 `tests/test_python_lint.py` 扫描全仓自有 Python 文件，检查 Pyflakes、Ruff 支持的 Pylint 错误规则与四项常见行为隐患。Ruff 的 Pylint 规则覆盖是部分覆盖；需要跨模块推断的问题仍由对应行为回归验证。

复用现有 Oxlint 1.85.0 的 correctness、`eqeqeq` 与 `oxc/no-accumulating-spread`，不新增依赖。源码和测试共用基础规则；shadcn 设计规则仅作用于自有 React 源码。

评估过 MIT 许可的 [anti-slop](https://github.com/dmmulroy/anti-slop/tree/c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b)。固定提交的试跑中，8,243 条诊断里 7,274 条要求空行；其禁止 `unknown`、运行时 `typeof` 和模块 mock 的规则不适合本项目的输入校验与测试替身，因此不引入整套插件。类型安全由 TypeScript、基础 lint 与对应行为回归共同检查。

## 已删除旧实现与当前继任者

找不到某个旧脚本时先查这张表：它的能力通常已经并进右边的实现，不要照旧名重写一份。

| 已删除/旧名称 | 当前实现 | 规则 |
|---|---|---|
| `rm-web.py` / `rm-web.html` | `src/peach/api.py`、`src/peach/web_contract.py`、`web/index.html` | 不得恢复旧 HTTP server |
| `rm-javlookup.py` | `scripts/scrape_codes.py` | 扩展来源适配器，不分叉刮削器 |
| `rm-probe.py` | `src/peach/media_probe.py`（入库时探本机与 115）、`scripts/probe.py`（历史、重探与计流量来源） | 探测与失败记 -1 只有 `media_probe` 一份，保留续跑语义 |
| `rm-sheets.py` | `scripts/sheets.py` | 共用 FFmpeg/任务原语，不新建抽帧管线 |
| `rm-ledger.py`、`scripts/ledger.py` | `peach init`／`peach scan`（`src/peach/cli.py`、`src/peach/scan.py`）+ repository/migrations | 摄取与建库只有 `peach` 一个入口，不放回旧 CLI；Stash 回灌随 ADR-0021 退役 |
| `rm-status.py`、`scripts/status.py` | `peach status`（`src/peach/cli.py`） | 状态命令只读，并且只有一个入口：打包入口转发全部子命令，不单独发脚本 |
| `rm-suggest.py`、`scripts/suggest.py` + `moods.json` | `scripts/taste_history.py` + 馆藏页筛选 | 排序与心情筛选留在应用端口，不放回旧 CLI |
| 各写库脚本私有的 `--database`／`--backup-dir`、自写 backup 与只读连接 | `src/peach/scripting.py`（`open_readonly`、`add_ledger_write_args`、`open_for_write`、`counts_of`、`verify_after_write`、`USER_AGENT`、`RateLimiter`） | 真实写入的参数只有 `--db`／`--apply`／`--backup` 一套；`--apply` 必须同时给 `--backup`，备份走 `peach.migrations.sqlite_backup`，脚本不各写一份 |
| `rm-trafficwatch.py` | `scripts/traffic_watch.py` | 只停止任务拥有的进程树 |
| `rm-sha1.py` | `scripts/sync_sha1_115.py` | 复用 Provider 哈希，不盲目重算网盘媒体 |
| `import_performer_portraits.py`（原 `agent/claude/performer-portraits`） | `scripts/audit_performer_portraits.py` + `scripts/localize_performer_names.py` | 一次性导入已执行完；后继只产 CSV，不写头像文件 |
| `normalize_code_suffix.py`（原 `agent/claude/code-suffix`） | `catalog_rules.jav_display_metadata` + `scripts/audit_jav_display.py` + `scripts/audit_code_creators.py` | 紧凑番号只随发行证据恢复；版本后缀投影为徽章，原始文件身份不丢失；全库审计只读 |
| `dedupe_performer_creator.py`（原 `agent/claude/dedupe-identity`） | `scripts/merge_duplicate_identities.py` | 后继的判据已扩到跨 kind、同 kind 与真子集三轮，旧脚本判据更窄 |
| RSS 适配层（feedparser） | `src/peach/feeds.py`（JavDB 演员页当伪 Feed，ADR-0042、ADR-0047、ADR-0083） | feedparser 不在依赖里；新增发现源先看番号样本，按 `peach.feeds` 的契约接入 |

详情滚动复用 `attachOverlayScrollbar`：尺寸与内容盒子由 ResizeObserver 跟踪，滚动位置按帧更新；子树中的播放器时间文字不触发几何重算。详情开关复用 `data-detail-open` 暂停与恢复底层玻璃背景动画。播放器时间与悬停预览使用 Peach 控件，Video.js 的隐藏时间组件通过组件选项关闭；上游接口见 [PlayProgressBar](https://docs.videojs.com/control-bar_progress-control_play-progress-bar.js.html)。

详情打开时，共用 `wireAutoScroll` 暂停底层横排，关闭后由属性观察器唤醒；播放器氛围色在任一 RGB 通道累计相差至少 6 时刷新继承色。共享 Tooltip 复用浏览器 `popover="manual"` 顶层，挂在触发器所属的模态 Dialog 内；操作键条允许按钮收缩并保持单行。无新增依赖。原生浮层契约见 [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using)。

规范页面地址复用同一份 React Router 历史、`resolve_entity_id`、`resolve_entity`、实体资料查询和 BoardUI 设置面。`history/canonical-path.ts` 处理产品地址，队列属于资产查询参数；`settings-route.ts` 统一设置分区与背景历史。实体 ID 解析取得规范名后复用资料、作品和照片查询。身份缺失、种类校验、实体合并与来源名称的展示属于 Peach 的领域规则；不增加路由或 slug 依赖。页面契约见 [ROUTES.md](ROUTES.md)。

## 当前替换队列

下面是还开着的替换项，以及每一项已经定下的做法。

1. 详情播放由 Video.js 承担；`MediaEngine.stream_plan` 在显式开启时给 115/PikPak 原生 MP4 生成 HLS 临时短片段，默认仍走标准 Range（ADR-0016）。待补自适应码率、多路清单和生产验收。CloudDrive 的虚拟盘固定块预取仍属于来源层成本。
2. `sync_sha1_115.py` 还没有备份闸门（`tests/test_script_policy.py` 的例外表已记账）；其余旧脚本的继任见上表。

## 厂牌名称身份

实体资料页的旧名与大小写变体按账本规范名统一地址：服务端复用 `RedirectResponse` 与 `resolve_entity`，站内复用实体控制器的 replace 导航；查询与片段保留，歧义或未知身份不重定向。规范名沿用账本，不新增独立 slug。

作品列表、分页与筛选统计复用 `entities.resolve_entity` 将名称解析为实体 ID，再用 `web_entity.scope_predicate` 获取关系范围；五类资料实体共用此入口，厂牌覆盖旗下各级 label，事务所覆盖成员作品。未取得唯一身份时返回空集合。

`entities.studio_name_key` 与 `studio_identity_ids` 供入库、元数据落地、名称解析和 `merge_studio_name_variants.py` 共用：NFKC、符号写法及唯一登记别名映射到规范身份。官方标题确认的 [ATTACKERS](https://attackers.net/)、[PREMIUM](https://premium-beauty.com/) 日英并写名和 [kawaii*](https://kawaiikawaii.jp/) 星号写法纳入精确映射。名称冲突保留来源原文；括号两侧须各自唯一指向同一实体；`AVOP` 跨厂牌共用，不作为合并证据。复用项目实体合并、字段归属、SQLite 备份和复核 CSV，无新增依赖。

## 口味来源与偏好

书签复用 `beautifulsoup4==4.15.0`（MIT，现有依赖）解析 Netscape HTML，JSON 和时间戳使用 Python 3.14 标准库；Firefox 复用现有 SQLite 一致快照，私有来源、停止读取、上传及删除入口沿用历史模块。浏览器格式依据 Chromium `BookmarkCodec` 的 `roots/children/type/url/date_added` 与 Mozilla Places 的 `moz_bookmarks/moz_places`，不复制外部实现代码。隔离样本覆盖 HTML 实体、日期缺失、重复 URL、非 HTTP(S) 过滤、Chromium 书签独立资料、Firefox 快照及失败保留；接口与偏好测试使用临时数据库，无新增依赖或 ledger 迁移。

标题题材复用 `genre_taxonomy` 的中英日内容词表、`pyahocorasick==2.3.1` 的最长匹配和现有规范身份别名索引；Peach 保留标题省写过滤、英文词边界、成人上下文及 URL 与标题的同义去重。隔离样本覆盖仅 ID 的详情 URL、标题名称及别名、Rule34 标签交叉证据、全半角、负向条件与普通页面误匹配；不请求原页面，不新增分词或模型依赖。

候选复核（2026-10-17）：[browser-history](https://github.com/browser-history/browser-history) 为 Apache-2.0、纯 Python、跨平台且无依赖，但书签能力明确标为实验性且未受测试覆盖，通用读取先复制文件，无法直接取代 Peach 的一致快照和失败保留策略；[bookmarks-converter](https://github.com/radam9/bookmarks-converter) 为 MIT，声明 Windows/macOS/Linux 与 Python 3.14 支持，HTML 依赖 BeautifulSoup，转换模型还引入 SQLAlchemy。Peach 仅需平面 URL、标题和可缺失日期，采用现有 BeautifulSoup 与标准库承接通用解析，保留最小格式适配和私有证据策略。原始输入只在本机读取，无采集网络流量。

历史快照与导入复用 SQLite backup API 和 `browserexport==0.4.4` 的 Chromium、Firefox、Safari 适配器。`taste_browsers` 管理本机资料目录及启停，配置在私有历史库内，停用保留已导入数据；一份资料未取得不阻塞其他资料。来源规则与账号关联见[口味来源](TASTE_SOURCES.md)，仅复用既有实体链接和启用的关注，不自行确认新身份。

多维偏好复用行为计权、genre 归一和 `related.rank_related` 的 MMR；`taste_preferences` 保存规范身份、证据种类及候选强度。持久缓存复用 `fsutil.atomic_write_text`，按账本、历史库及规则源码版本失效，只读历史连接忽略没有数据帧的 WAL。名称扫描采用 [pyahocorasick 2.3.1](https://github.com/WojciechMula/pyahocorasick)（BSD-3-Clause，Unicode，Python 3.12–3.14，Windows/macOS/Linux）；已读固定版 C 实现，Windows CPython 3.14 wheel 实装通过，新增仅此直接依赖。长标题、多别名、重叠名字及 ASCII 词边界由 Peach 约束。真实只读汇总覆盖七类维度；偏好候选和私有缓存不改写 ledger。

## 卡片与来源头像

回收站复用 `MediaCard`、`/api/batch` 与共享操作回执，视频和资源共用还原按钮及原位失败提示。`asset.disposal_reason` 保存手动、垃圾、重复和文件缺失；还原清空原因，撤销按原原因归组写回，未知原因保持为空。无新增依赖。

卡片 label 复用既有 `javTitleHtml`、`followTitleMarks` 与 `data-media-tags`，分段筛选复用 `SegmentedRadioGroup`。来源头像共用 `PublicAPI` 的已验证图片主机、三个下载槽位、Pillow 解码、单请求合并与六小时缓存；只持久保存没有查询参数的公开静态头像地址。人物使用策略在投影和口味汇总处过滤明确登记的男优，原始来源记录仍完整保留，无新增依赖或 ledger 迁移。

公开作品资料与评论复用 `jav_cache.PublicSnapshots`、既有 `filelock` 和原子写入；`cache_fresh` 与前端 `publicationFresh` 统一日历月边界、每天补齐及满月后的固定快照。`public_cache_scope` 将快照隔离到调用者数据目录，记录实际来源时间；测试显式传临时目录，默认 `PublicAPI()` 只用内存。媒体字节复用媒体缓存，来源 JSON 不承载本地标签决定、想要状态或观看历史。

公开预览复用 HTTPX 0.28.1 的流式响应与已安装的 `curl_cffi` 0.16.3（MIT）浏览器传输。`preview_transport` 只适配响应生命周期与 TLS 连接失败，逐跳主机判据仍复用 `open_upstream`；HTTP 拒绝状态不切换传输。已读取固定版本 SDK 的 `Session.request`、`Response.iter_content` 和 `close`，实际公开 MP4 范围请求取得 206，无新增依赖。HLS 根与嵌套清单使用来源地址作为代际，5 分钟后按需刷新，浏览器核对本机清单；分片、密钥与初始化段继续复用持久缓存。MIKR-122 的来源新清单包含可用的当前签名；作品资料及评论的发行日期缓存独立保存。缓存与协议证据沿用 [媒体缓存](MEDIA_CACHE.md) 中现有 `m3u8` 和 Hishel 评估。

## 原位改字

`frontend/src/copy-editor-core.js` 是应用、官网与演示站的原位编辑核心，以 classic script 注册 `PeachCopyEditorCore`。核心负责文字命中、原位输入、回车和失焦保存、Esc 取消、连续草稿和 JSON 结果解析；`create` 的 `resolve`／`prepare`／`save`／`onSaved` 保留各端来源定位与保存入口。适配器可用 `element` 与 `nodes` 指定连续行内文字的共同编辑区域，`replaceTextParts` 将纯文字修改映射到原有节点，保留未改动片段的样式，并清理无内容且仅带样式属性的行内元素。空字符串可作为删除结果，无法确认的保存响应保留核对提示。切换控件正常响应点击，Alt 点击进入文字编辑。官网与演示站按应用提交与 SHA256 同步核心，适配器先取得原始文字索引再运行页面脚本。

核心的 `createTools()` 提供工具栏、编辑样式、状态、暂停／继续、导出／退出动作、恢复按钮与来源选择；工具栏和悬停范围跟随模态弹层，避让页面底部选择操作条，`destroy()` 清理节点、监听与未完成选择。应用适配器 `scripts/dev/copy-editor.js` 负责源码候选、草稿、自动生效状态与动作回调。源码模式按顺序加载 `/dev/copy-editor-core.js` 与 `/dev/copy-editor.js`，动态文案保留模板占位符。
改字浮条使用多选操作条的 `data-selection-dock`、`data-glass-pane` 与 `data-batch-scope` 样式，几何、玻璃、字体和按钮共享；窄屏状态提示独占一行。
应用的 React 与动态页面使用源码定位、摘要校验和备份入口；演示站使用浏览器草稿。两者只在 `?edit` 启用，无新增依赖。
Python 源文件纳入 `src/peach/library_sharing.py` 与 `src/peach/library_processing.py`。动态句子复用标准库 `ast`、`string.Formatter` 定位 f-string 与相邻字符串，编辑时显示命名占位符，保存时校验占位符齐全且各出现一次。求值表达式与格式保留在 AST 中，当前数量只用于显示；其他 Python 文件不属于改字范围。

生效状态由 `dev_copy_runtime` 持久保存，保存与重试复用项目固定的 FileLock 4.2.0（MIT，纯 Python），文件替换使用 `fsutil.atomic_write_*`。构建沿用锁定的 Vite 8.3.4 与 `npm --prefix frontend run build`，通过 `PEACH_FRONTEND_OUT_DIR` 指定临时产物目录；前端主包和独立页面包均支持。源码服务重载复用托盘的子服务所有权、`runtime_prepare.task_gate` 与就绪检查，不引入额外进程管理器或依赖。隔离用例覆盖失败产物保护、重试、任务拒绝和浏览器自动刷新。

链接检查结果的身份引用复用 `web_catalog.entity_ref`，页面头像沿用 `entityFaceImg` 的取景和回退，地址前的 favicon 复用 `SiteMark` 与 `/link-mark`；两张结果表共用列定义，Peach 资料名称使用 `entityPath` 生成内部链接。明确的 HTTP 状态码使用 BoardUI Chip，解释与长错误使用可展开的普通正文；永久删除入口位于失效清单自己的页脚，说明与分隔线使用中性色。关注列表无来源时使用 `EmptyState` 的 page 外壳，背景、边框与添加入口同属空状态。断链按钮使用现有 Lucide unlink 字形，仅四条短线循环改变透明度，周期沿用 Loading Dots 的 1.2 秒，reduced motion 沿用全局规则。

## 馆藏处理控制与耗时预估

长时任务续跑复用 `job_recovery` 的本机原子记录、`BackgroundJob.checkpoint` 与 `TaskRunHandle.checkpoint`。主任务保留原 `job_id`、`run_id`、开始时间、处理范围和领域检查点；后继重排保留原进度。扫描复用现有 `os.scandir`、SQLite 批次提交、`filelock` 和 `fsutil.atomic_write_text`，保存遍历栈、文件名游标及字幕配对资料。本地资料按影片保存小份证据边车，候选成功落盘后才提交元数据完成集合；整理逐项原子保存同一批次的日志。`scrape_codes.py` 复用流式 CSV 与原始来源快照，续跑只保留已确认完成的番号，未完成番号可以重放。

当前树、扫描与采集的 Git 历史，以及现有任务队列均已核对；不引入新的调度或工作流依赖。项目已固定的 APScheduler 3.11.3（MIT）负责派发，其持久 job store 记录调度任务，不能保存函数执行到哪一条影片或来源页，见[上游调度说明](https://apscheduler.readthedocs.io/en/3.x/userguide.html#adding-jobs)。结果替换沿用 Python 3.14 标准库 [`os.replace`](https://docs.python.org/3.14/library/os.html#os.replace)（PSF），锁沿用项目固定的 `filelock`，没有新增运行时体积或平台要求。隔离实证覆盖目录与目录内批次中断、关注回抓游标、固定来源集合、原任务标识与计数、候选 CSV 保留及同批整理日志；不读取真实媒体、不访问外部采集来源，也不写真实 ledger。

扫描、探测、资料请求和九宫格复用 `process_library`、`scan_location`、`SourceTransport`、`frame_capture` 与已有影片检查点；任务恢复沿用 `BackgroundJob`、`job_recovery` 和 `task_run`，用户暂停意图单独持久保存。当前树及 `library_processing.py` 的 Git 历史已核对，安装暂停只用于安装事务，不能直接代表用户暂停。Python 标准库 `threading.Event` 与 `contextvars.ContextVar` 提供等待唤醒和当前任务隔离，沿用项目 Python 版本，跨 Windows 与 macOS，无额外依赖体积；许可证为 PSF，官方文档与实现见 [threading](https://docs.python.org/3/library/threading.html) 和 [contextvars](https://docs.python.org/3/library/contextvars.html)。现有 APScheduler 3.11.3 用于定时派发，不能暂停已进入媒体读取的函数，因此不承担安全停点。隔离测试使用临时账本、暂停线程与模拟时钟验证安全停点、跨重启意图、低占用间隔和暂停预算补偿，不读取真实媒体、不发外部请求。

`processing_control` 保留 Peach 的阶段、模式与估时策略：启动仅汇总账本文件数和大小，优先使用本机同类完成耗时；未知新增明确不在初始范围内。整趟剩余时间合计当前阶段和待执行阶段；当前阶段采用最近 20 次完成增量，后续阶段使用保守粗估。无番号、无 NFO 的文件完成同目录检查后不计入外部采集数量；任务停滞时读接口撤下旧估时。处理强度为低占用、标准和高强度：低占用采用单线程 FFmpeg 与较大单项间隔，标准采用两个解码、滤镜和编码线程与短间隔，高强度采用工具自动线程且没有额外间隔。amane 低占用逐站查询，其余沿用现有调度；各档均遵守来源限流，单资产流水线与暂停检查点共用。强度只作用于当前任务，历史耗时按档位系数归一，初始与切换时的范围属于粗估，实际样本继续校准。持久状态不修改 ledger schema，不改变生产入口。

配套图片沿用 Pillow 12.3.0（MIT-CMU）解码与 `install_cover` 登记。网盘及未知来源的文件读取和 JPEG 转换放在独立子进程，20 秒超时后终止并等待退出，再登记可重试问题；声明为本地磁盘的来源直接在线程内解码，不逐张启动进程。隔离测试使用 Unicode 路径图片、无效图片与真实超时子进程验证。进程超时复用项目使用的 Python 3.14.7 标准库 [`subprocess.run`](https://docs.python.org/3.14/library/subprocess.html#subprocess.run)（PSF 许可，无新增安装体积），Windows 隐藏窗口，源码模块和独立包 CLI 共用转换函数。线程等待超时不能终止同步文件读取，因此网盘不采用单纯线程包装；FFmpeg 已用于媒体任务，但单张图片继续复用 Pillow，不增加解码依赖。

目录列表与 `SidecarIndex` 在本趟任务内复用，每个目录建一次文件名索引；同名、共享 NFO 与编号图片的归属沿用 `library_nfo`。500 个视频、1,000 个目录条目的隔离夹具中，逐项匹配耗时约 1.01 秒，复用索引约 0.007 秒，输出一致；该数字仅反映文件名匹配，不代表网盘读取或整趟耗时。配套图片与免费来源的媒体属性探测复用标准库 `ThreadPoolExecutor`，三档各领 1、2、4 项，空闲后补位，主线程保存结果并经过暂停停点；计费来源的媒体读取限制与各资料站限流保持原策略。不同阶段仍按实际依赖推进，界面步骤仅展示这些边界。

`_RemoteSession` 按来源与番号复用本趟新取得的原始证据及明确未收录答复；重试首个同番号资产取得新答复，其余资产共用。来源错误和超时仍可重试，不记为未收录。复用结果逐资产生成候选，字段仍经过既有来源和冲突判据，不直接复制其他资产的真相字段。自定义来源配置实时读取，停用和字段映射变化立即生效。

卡片与任务浮层的等待时长以服务端快照为起点，用浏览器单调时钟每秒推进当前文字。新快照重设起点，暂停、结束和卸载清理定时器；每秒重渲染限定在进度子树，不改变两秒一次的状态请求。组件测试核对连续秒数、请求数、换文件复位和卸载清理，桌面与手机浏览器验证实际跳秒。

任务卡复用 Sonner 2.0.8（MIT）的 `toast.custom`、稳定任务 id 与无限停留时间；`processing` 和 `receipts` 两个栈按 `toasterId` 分流，普通回执按任务面板实测高度避让。任务栈启用 `expand` 保持自动高度，详情开合由卡片管理；收起只隐藏正文，暂停、速度与估时仍可见。服务端 `steps` 在实际处理边界更新，完成步骤以勾选与删除线显示。失败浮层只自动展示本次观察到的结束状态或两分钟内的结果，旧失败快照不自动弹出；用户关闭后保持关闭。React Aria 1.22.1 的 Slider、Popover 与现有 BoardUI Button 承担键盘、焦点与浮层行为，三档对应 `low/standard/high`；最高档流光使用 SVG 与 CSS，浮层关闭后卸载，暂停与后台页面停止运动。界面重建依据与差异见 [控件取证](reference-snapshots/processing-task-controls.md)。无新增依赖。问题明细沿用 `state/library-processing-<job_id>.issues.jsonl`，新任务保留其他任务的明细。

任务浮窗的显示选择复用 React 19.3.1 的 `useSyncExternalStore` 与页签级 `sessionStorage`，按任务号同步隐藏和恢复；关闭按钮复用 BoardUI Button，滑动关闭沿用 Sonner。隐藏后查询和完成通知持续工作，数据管理卡片提供恢复入口。该选择仅属于浏览器界面，不写任务控制接口或账本，无新增依赖。

站点强调色检查覆盖进度、焦点、选中态、操作按钮与流光：旧 `--feedback-success` 引用既有强调色色阶；RSS 订阅保留橙色，信息、成功、警告、错误、品牌与图表分类保留语义色。

任务中心的摘要复用结果字段白名单和 `Disclosure`：主区域以中文列表显示处理结果，原始字段与来源报告保留在「技术详情」。云下载复用 TanStack Query 5.104.3（MIT）的 `useInfiniteQuery`，按任务 id 倒序每批读取 20 条，轮询覆盖已加载页面；`has_more` 与 `next_before_id` 指定后续页面，更新状态不改变提交顺序。展示番号复用 `catalog_rules.release_code_from_filename`，优先已保存的番号和已绑定作品的番号，缺失时只展示名称中取得的唯一番号；冲突或未识别时不推断。标题资料按页批量读取已绑定作品的 `catalog_title`／`original_title`，其次使用提交标题和 `jav_fallback_title` 清理后的资源名称；`display_code`／`display_title` 是只读投影，不写真实 ledger。卡片复用 `javTitleParts` 去除标题开头的重复番号，以「番号 · 标题」显示，缺少标题时只显示番号。标题单行截断，状态在桌面与标题同行，窄屏另起一行；完整标题可展开。未新增依赖。

云下载卡片的 `artwork` 只读取已入库任务绑定的本机资产，复用 `attach_artwork_fields`、`attach_card_performers`、`coverImage`、`ArtSlot` 与 `avatarInner`；封面沿用缩略图、版本和正封取景，女优头像沿用实体图片及姓名回退。页面轮询同步入库资料，提交与进度跟踪不等待图片，不额外创建取图任务或请求外部来源。没有封面时保留占位，图片失败使用共享回退处理。未新增依赖或 ledger 写入。

云下载封面复用首页 JAV 大图的 `COVER_FRONT_RATIO`、`data-media-pic` 容器、`coverAnchor` 正封裁切和同图模糊背景。每张卡片使用相同宽度的 3:4 画框，桌面宽 128px，手机宽 80px；右侧标题起点对齐，桌面按钮靠信息区底部排列。不同宽度的传统正封完整居中，比例留白使用同图模糊补底；缺图底色共用 `--color-background-quaternary-default`，明暗主题均与卡片底色区分。展开的完整标题位于卡片信息区下方，封面高度保持稳定。已入库且具有 `asset_id` 的任务，封面和标题使用原生链接打开 `/assets/:id`，同时保留新标签页与键盘访问；其他任务不提供详情链接。

任务中心复用 `CodeBlock` 展示可复制的 JSON 技术详情。`task_results.result_counts` 将链接检查、资源扫描、追更、订阅、来源查找及浏览记录分析的明细折算为领域数量，供后台结算与读取投影共用；读取投影只补同一轮已结束的恢复检查点，不写 ledger。想要资料任务按作品保存未完整取得的结果，续跑时逐项更新数量。页面保留失败、访问失败、未能清理等结果，有问题的完成任务显示“发现问题”并独立展示；摘要里的能力缺失标记（`face_match_unavailable`，人脸模型取不到时退回旧判据的那一轮）同样算问题。原始任务执行状态仍由任务服务维护。未新增依赖。

人脸模型（YuNet、SFace）是全进程共用的一次性能力。`face_detect.fetch_model` 每次联网取模型的结果经 `face_detect.observer` 报给 `face_models.Reporter`，它只按转变写 `face-models` 任务记录：从能用到取不到一条失败，取回来一条成功，同一次失败反复撞上只留一条。任务卡只记历史；活动中心页顶「需要处理」读 `face_models.status(contract.task_runs)`：只查最新一条记录和两个模型在不在（随包那份校验通过，或数据目录里有文件），不联网，返回 `state`（`ready`／`missing`／`failed`／`downloading`）、失败时刻与原因、对应任务卡的 `run_id` 和 `retry_url`。那一行的「立即重试」调 `POST /api/face-models`，走普通 `BackgroundJob`；取到后 `face_detect.downloads` 加一，常驻的 `avatar_face.FaceProbe` 据此提前结束重试窗口。未新增依赖。

普通 Toast 与扫描任务卡共用 Agent Progress 外框，16px 半径由通知栈内的既有 token 解析，细边框与接触阴影分别复用 `border-button-default`、`elevation-xs`，不改变内容排版。浏览器回归核对桌面、手机和明暗主题下的外框一致性，并以同一任务、同一内容回放外框基线生成对比图。

## 本地附属媒体识别

附属媒体识别复用 `catalog_rules.local_extra_type`、`is_local_extra` 与现有 `scan.is_sidecar`，兼容 Plex、Kodi、Emby、Jellyfin 的显式文件标记和专用目录。规则来源、完整标记及边界见[附属媒体命名证据](reference-snapshots/local-trailer-evidence.md)。

分类模型和末尾数字处理参照 Jellyfin 的 `Emby.Naming`，固定提交 [`c7ce6a1b56ee7dcc1896250df0f2f9deaa828a81`](https://github.com/jellyfin/jellyfin/tree/c7ce6a1b56ee7dcc1896250df0f2f9deaa828a81/Emby.Naming)，项目为持续维护的媒体服务器；该模块声明 GPL-3.0-only，目标框架为 .NET 10，并依赖 `MediaBrowser.Common` 和 `MediaBrowser.Model`。已通过 opensrc 阅读规则与解析实现，并将三个缓存文件与固定提交的上游原始文件逐字节核对。Peach 参照规则事实与解析边界，用 Python 3.14 标准库 `pathlib`、字串操作及 `functools` 实现自身策略，不复制上游源文件或引入 .NET 服务、运行时和媒体服务器依赖；没有新增 Python 依赖及安装体积。

同一分类器用于扫描、推送发现、首次预检、后台探测、资料采集、馆藏列表、版本组、实体数量与库存统计。专用目录支持嵌套，按最长已声明媒体库根截断路径；媒体库根本身即使叫 `Shorts` 或 `Extras`，其中的普通影片也不按附属目录处理。明确文件名标记照常生效；不根据时长、分辨率或片名中间的单词推测。旧记录在普通馆藏与后台工作量中排除，单项详情、媒体、评分和播放历史保留；不增加迁移或清理真实 ledger。临时目录和账本回归覆盖四家命名、编号、嵌套目录、库根保护、跨平台路径和只读性。

## 媒体读取与单项超时

`media_io` 复用 `local_poster` 的短生命周期子进程方式，以及标准库 [`subprocess.run(timeout=…)`](https://docs.python.org/3.14/library/subprocess.html#subprocess.run)。目录枚举、NFO、图片引用、路径解析和文件属性在只读子进程中取得；超时后先终止并回收进程，再处理下一项。NFO 解析和图片引用边界仍由 `library_nfo` 维护，扫描继续使用 `scan_location` 的批量登记与检查点。任务层缓存本趟失败的目录，避免逐部影片重复等候同一故障。

预览生成复用 `frame_capture` 与 `processing_control.deadline_after`，同一影片的抽帧和拼图共享截止时间；用户暂停不占活动预算。公共状态、证据和产物保存失败向任务层传播，只有媒体读取或来源取证失败进入单项问题清单。测试覆盖超时进程回收、相邻目录继续、NFO 失败后保留番号、预览总时限和公共写入中断。标准库随 Python 运行时维护，PSF 许可，支持 Windows/macOS/Linux，未新增依赖。

## 媒体库与根目录身份

身份生成复用 Python 3.14 标准库 [`uuid`](https://docs.python.org/3.14/library/uuid.html) 的 UUIDv4、UUIDv5（PSF 许可，随运行时维护，Windows/macOS/Linux，无新增安装体积）；路径归属复用 `platform.resolve_root`、`PureWindowsPath`，配置写入复用 `fsutil.atomic_write_text`，扫描沿用 SQLite upsert 与现有断点。当前树与 Git 中的媒体库分组、目录索引、来源探测和下载渠道共同消费这些身份。

媒体库与根目录的归属是 Peach 的领域模型，不引入 Jellyfin/Emby 等独立媒体服务器或数据库 ORM：这些方案不能直接维护现有账本、个人记录和 Windows 账本路径契约。只读旧配置使用确定性升级，显式保存持久化身份；新增实体的随机 UUID 与显示名称无关。隔离用例覆盖配置往返、同名库、重排、重定位、根目录离线及扫描个人记录保护；实现与验收边界见 [ADR-0115](adr/0115-library-and-storage-root-identity.md)。未新增依赖，不自动写真实 ledger。


## 浏览器品牌图标与本地文件身份

口味页浏览器标识使用本地静态资源，不在展示时请求品牌网站。通用图标来自 [browser-logos](https://github.com/alrra/browser-logos/tree/58881b84c4d73adc03c06fa2c275a7abee02d935)，固定 revision 为 `58881b84c4d73adc03c06fa2c275a7abee02d935`；品牌商标归原持有人。其余品牌的来源、摘要、类型和别名记录在 `resources/browser-icons/manifest.json`。115 使用已安装浏览器 PE 的 `IDR_MAINFRAME` 主图标，未加载或执行程序；不能用网站标记替代应用图标。未知品牌继续使用通用图标，不按 Chromium 内核冒充 Chrome。

本地发现继续复用 `watchdog` 原生文件事件。缺少配置时开启本地目录监控，保留显式关闭；网盘挂载不递归订阅。空队列等待事件，不增加定期目录遍历。本地移动事件传递旧路径，已积累的系统文件身份用于同卷改名和移动后的 ID 保留；标准库文件属性与 `FileLock`、原子写入承接私有缓存，不新增哈希遍历或媒体读取。跨卷副本、旧路径仍存在的文件不自动合并。升级前没有身份记录且停机期间已经移动的文件仍需全库维护或人工确认，不能仅凭大小和文件名接回。

## vvs-club 本机网盘连接

Mac 外壳复用未修改的 OpenList v4.2.9 官方 lite 发布资产与 AGPL-3.0 许可，固定构建摘要见 `desktop/macos/build.py`，对应源码见 https://github.com/OpenListTeam/OpenList/tree/v4.2.9 。网盘协议、令牌刷新和视频代理归 OpenList；vvs-club 只维护账号入口、私有本机连接桥、目录选择、扫描索引与 STRM 资料库交接，不复制平台 SDK。授权交互参考 OpenList-APIPages 提交 `4322fd1f0f5e4e77454fd8a5edb89727854b0092` 的公开回调协议。真实账号与播放兼容性未验证前不标为完成，范围与凭据路径见 `desktop/macos/CLOUD_CONNECTIONS.md`。

## vvs-club Windows 桌面

Windows 10/11 x64 外壳复用 Electron 45.0.0 的 WebContentsView、隔离预加载桥和原生窗口管理；打包使用 electron-builder 26.18.0，依赖锁在 desktop/windows/package-lock.json 并登记 Dependabot 与接管 recipe。远程网站不启用 Node，只有本地应用页面可请求明确列出的操作。媒体服务、网盘连接、固定版本 OpenList 与广告规则复用现有实现。FFmpeg 复用固定源码的 Windows 构建与对应源码交付流程。平台运行结果以 Windows 工作流和真实账号验收为准。

依据：[Electron WebContentsView](https://www.electronjs.org/docs/latest/api/web-contents-view)、[隔离上下文](https://www.electronjs.org/docs/latest/tutorial/context-isolation)。
