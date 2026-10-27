"""单页界面本体、它的静态资产，以及所有前端路由的落点。

这里的路由全部指向同一份 `index.html`：前端自己按 URL 渲染，服务端只负责让刷新
和直接粘地址都能进来。所以 `client_route` 的那一长串装饰器不是重复，是「前端有哪些
路由」的声明，新增页面必须在这里补一行，否则刷新就是 404。

`index` 的 401 走跳登录页，`/app.css`、`/board.css`、主包和 `/dev/` 走 PlainText 提示：
资产被浏览器直接请求，重定向到登录页只会让它把 HTML 当脚本解析。

缓存也分两档：`index.html` 是 `no-store`，它是所有资产 URL 的来源；静态资产走
`asset_response()` 的 ETag 复验，更新语义与 `no-store` 相同但没变时零传输。

`/app.css` 是唯一一个不对应单个文件的资产：样式表按分区拆在 `web/css/` 下，这里
按文件名顺序拼起来交付，见 `stylesheet_response()`。
"""
from __future__ import annotations

import gzip
import hashlib
import json
import os
import sys
import threading
from collections import OrderedDict
from collections.abc import Mapping, Sequence
import re

from pathlib import Path
from urllib.parse import quote, urlencode

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import (
    FileResponse,
    HTMLResponse,
    JSONResponse,
    PlainTextResponse,
    RedirectResponse,
    Response,
)

from . import distribution, onboarding, settings_file
from .config import PROJECT_ROOT
from .diagnostic_browser import BUNDLE_CHUNK_NAME
from .entities import resolve_entity, resolve_entity_id
from .media_libraries import LIBRARY_ICONS
from .routes_auth import query_auth_redirect, require_asset_auth, require_page_auth, set_auth_cookie
from .web_entry import page_shell, runtime_fact_entries
from .web_state import FAVICON

router = APIRouter()

#: 整站的收录态度，`api.py` 的中间件给每个响应都挂上这一份。Peach 是一个人的私人
#: 馆藏，任何一次公网暴露都不该在搜索引擎里留下痕迹：不收录、不跟随、不留快照。
ROBOTS_TAG = "noindex, nofollow, noarchive"
ROBOTS_TXT = "User-agent: *\nDisallow: /\n"

#: 回环地址的三种写法。既用来判提交端点的调用方，也用来判「只有这台电脑」那个监听选择。
_LOOPBACK = frozenset({"127.0.0.1", "::1", "localhost"})

#: 首启页共用的文件夹与媒体库图标。
_SETUP_SYMBOLS = re.compile(r'<symbol id="i-(?:' + '|'.join(sorted({"folder-search", *LIBRARY_ICONS}))
                           + r')"[^>]*>.*?</symbol>')

#: 键 -> 页面上的题目与一句说明。顺序、默认值与校验仍然来自 `onboarding.questions()`，
#: 这里只决定同一道题在浏览器里怎么称呼：命令行那份题面要把可选值写进去，页面用控件表达。
_SETUP_COPY = {
    "data_root": ("数据目录", "Peach 数据库、封面、预览图和缓存都放在这里，馆藏较大时会占用数十 GB。"
                              "系统盘空间紧张时，请选择其他磁盘上的文件夹；之后也可在设置页迁移。"),
    "media_dir": ("媒体目录", "选择存放视频和图片的现有文件夹，也可以使用外置硬盘。"),
    "host": ("谁可以访问", ""),
    "port": ("端口", "浏览器地址里冒号后面的数字，一般不用改。"),
    "mdns_name": ("局域网访问地址", "选了「同一局域网的设备」之后，其他设备在浏览器里输入这个地址就能打开 Peach。"),
}
#: 「谁可以访问」在页面上的顺序：局域网在左边，也是默认选项——Peach 的本意就是给
#: 同一局域网里的设备看。命令行问答按 `HOST_OPTIONS` 的编号顺序念，两边取值一致。
_HOST_ORDER = ("2", "1")


def setup_shell() -> str:
    """首次运行页的 HTML 模板：题目、表单与完成态都由 `/dist/peach-pages.js` 按 `/api/setup/questions` 画出来。

    字形从 `web/index.html` 的雪碧图里按名字摘。
    """
    index = (PROJECT_ROOT / "web/index.html").read_text(encoding="utf-8")
    return page_shell("vvs-club · 首次设置", "setup", symbols="".join(_SETUP_SYMBOLS.findall(index)))


def error_page(status: int, message: str) -> str:
    """浏览器导航撞上 HTTP 错误时给人看的那一页，不是一行 JSON。

    标题、说明的显隐与「返回首页」归页面包，这里只给状态码和已换成中文的说明。
    """
    return page_shell("Peach", "error", {"status": str(status), "detail": message})


def _copy_for(key: str, fallback: str) -> tuple[str, str]:
    return _SETUP_COPY.get(key, (fallback, ""))


#: 非 Windows 表单说明实际目录的填写位置。
_POSIX_MEDIA_NOTE = "填写这台设备实际读取媒体的文件夹；Docker 部署填写容器内目录，例如 /media。"


#: 有一行媒体来源选了云盘时，媒体库底下出现的那句提示和它的帮助链接。
_CLOUD_HELP = "请先将 CloudDrive2 或 OpenList 中的网盘挂载为本机文件夹；Windows 读取 NAS 共享时，请先映射为盘符，再选择对应文件夹。本机安装提示仅适用于在本机运行 CloudDrive。文件操作需要挂载工具和网盘账号授予写入权限；光鸭云盘的上传、建文件夹、改名和移动需要 CloudDrive2 v1.1.0 或更高版本，删除和复制暂不支持。"
_CLOUD_HELP_URL = "https://www.clouddrive2.com/help.html"
_CLOUD_HELP_LABEL = "挂载帮助"


def missing_mount_dependencies(*, windows: bool) -> list[dict[str, str]]:
    """云盘挂载缺的软件：每项一句「未检测到」和它的下载入口，由 `/api/setup/questions` 交给首启页。"""
    from .media_configuration import mount_dependencies
    return [{"name": row["name"], "message": f"未检测到 {row['name']}。",
             "download_url": row["download_url"], "download_label": f"下载 {row['name']}"}
            for row in mount_dependencies(system='win32' if windows else 'darwin') if not row['available']]


def _media_dir_values(values: Mapping[str, object], default: str) -> list[str]:
    """提交里的媒体目录：提交的是几行就几行，一行都没有就一行默认值。"""
    raw = values.get("media_dir")
    if isinstance(raw, (list, tuple)):
        return [str(item) for item in raw] or [default]
    return [str(raw) if raw else default]


def _question_view(question) -> dict[str, str]:
    """一道题在页面上的题面、说明、控件种类和输入框前后缀，由 `/api/setup/questions` 交给首启页。"""
    title, help_text = _copy_for(question.key, question.prompt)
    view = {"label": title, "help": help_text, "input": "text", "prefix": "", "suffix": ""}
    if question.key == "media_dir":
        view["input"] = "folders"
    elif question.key == "data_root":
        view["input"] = "folder"
    elif question.key == "host":
        view["input"] = "choice"
    elif question.key == "port":
        view.update(input="number", prefix="localhost:")
    elif question.key == "mdns_name":
        view.update(prefix="http://" if distribution.standalone() else "https://", suffix=".local")
        if distribution.standalone():
            view["help"] = ("其他设备打开这个地址时要加上上面的端口，例如 "
                            "http://peach.local:8900。首次连接请允许 Windows 专用网络访问。")
    return view


def _access_on_by_default(asked) -> bool:
    """访问密码开关第一次出现时开不开：host 默认是局域网（`"2"`）就开。

    独立包默认对局域网监听，明文 HTTP 又没有别的门，所以默认对局域网开放时默认要密码。
    """
    host_default = next((question.default for question in asked if question.key == "host"), "2")
    return host_default == "2"


def _setup_destination(config, *, history_guide: bool) -> str:
    """完成页的入口：进馆藏，或者选了导入浏览器历史就先去口味页。都带 `onboarding=1`。"""
    return _normal_url(config) + ('taste?onboarding=1' if history_guide else '?onboarding=1')


def _normal_url(config) -> str:
    """设置完成之后本机浏览器要去的地址。

    独立包即使对局域网监听，本机也走回环；源码部署才走由托盘维护的 HTTPS 固定入口。
    """
    if distribution.standalone() or config.server.host in _LOOPBACK:
        return f"http://127.0.0.1:{config.server.port}/"
    return f"https://{config.server.mdns_name}.local/"


def asset_response(request: Request, path: Path, media: str, *, immutable: bool = False) -> Response:
    """页面资产与图标用 ETag 复验，`/board.css`、`/dist/`、图标共用。

    `/app.css` 拼多份分区，ETag 口径见 `stylesheet_response()`，其余照这里。

    `no-cache` 每次都回源验证，文件一变立刻生效；没变时只回一个 304，零字节传输。

    ETag 取 mtime_ns 加字节数，不读文件内容：这几个文件都由 Git 检出或 `frontend/`
    构建产生，改一次就换一次 mtime，不需要为了强校验去算全文哈希。

    文本类资产在浏览器接受 gzip 时发压缩体，压缩结果按文件版本记住，见 `_gzipped()`。
    压缩体与原文是两个表示，ETag 各不相同。

    `immutable` 给名字里带内容哈希的主包 chunk（ADR-0118）：内容一变名字就变，浏览器一年内
    不再回源。它们要会话才能取，所以只许浏览器自己缓存（`private`），不许共享缓存转给别人。
    """
    stat = path.stat()
    compress = (media.startswith(_COMPRESSIBLE_MEDIA) and stat.st_size >= _GZIP_MINIMUM
                and _accepts_gzip(request.headers.get("accept-encoding", "")))
    etag = f'"peach-{stat.st_mtime_ns:x}-{stat.st_size:x}{"-gz" if compress else ""}"'
    # charset 只对文本类型成立。图标是字节流，声明里挂一个字符集，在全站的
    # `X-Content-Type-Options: nosniff` 之下就是让浏览器照一个自相矛盾的类型解码。
    media_type = f"{media}; charset=utf-8" if media.startswith("text/") else media
    if request.headers.get("if-none-match") == etag:
        response: Response = Response(status_code=304)
    elif compress:
        body = _gzipped(path, stat)
        response = Response(b"" if request.method == "HEAD" else body, media_type=media_type,
                            headers={"Content-Encoding": "gzip"})
        response.headers["Content-Length"] = str(len(body))
    else:
        response = FileResponse(path, media_type=media_type)
    if media.startswith(_COMPRESSIBLE_MEDIA):
        response.headers["Vary"] = "Accept-Encoding"
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "private, max-age=31536000, immutable" if immutable else "no-cache"
    return response


#: 值得压缩的页面资产类型；图标等位图本身已压缩。
_COMPRESSIBLE_MEDIA = ("text/", "image/svg+xml")
#: 小于它的文件压缩后省不下几个字节，与 `GZipMiddleware` 的默认门槛相同。
_GZIP_MINIMUM = 500
#: 路径 → (修改时间, 字节数, 压缩体)。主包 3.8 MB，每次冷请求现压要一百多毫秒；同一版本只压一次。
#: 每个路径只留当前版本，换了版本就替换；路径数按最近使用限界，带哈希的分包每次构建都换名。
_GZIPPED: OrderedDict[str, tuple[int, int, bytes]] = OrderedDict()
_GZIPPED_PATHS = 64
_GZIP_LOCK = threading.Lock()


def _accepts_gzip(header: str) -> bool:
    """`Accept-Encoding` 里有没有 gzip（或 `*`），且没有用 `q=0` 拒绝。"""
    for item in header.split(","):
        token, _, params = item.strip().partition(";")
        if token.strip().lower() not in ("gzip", "*"):
            continue
        quality = params.strip().lower()
        if quality.startswith("q="):
            try:
                return float(quality[2:]) > 0
            except ValueError:
                return False
        return True
    return False


def _gzipped(path: Path, stat: os.stat_result) -> bytes:
    """这一版文件的 gzip 压缩体。压缩在锁外做：并发的首个请求各压一次，结果相同。"""
    key = str(path)
    with _GZIP_LOCK:
        hit = _GZIPPED.get(key)
        if hit and hit[:2] == (stat.st_mtime_ns, stat.st_size):
            _GZIPPED.move_to_end(key)
            return hit[2]
    body = gzip.compress(path.read_bytes(), compresslevel=9, mtime=0)
    with _GZIP_LOCK:
        _GZIPPED[key] = (stat.st_mtime_ns, stat.st_size, body)
        _GZIPPED.move_to_end(key)
        while len(_GZIPPED) > _GZIPPED_PATHS:
            _GZIPPED.popitem(last=False)
    return body


#: 拆分后的样式表分区。层叠顺序就是文件名顺序，所以每份都带两位数前缀；
#: 分区名字不接受分隔符。清单由 `tests/test_web_ui.py` 钉住。
CSS_PART_NAME = re.compile(r"\d{2}-[a-z0-9-]+\.css")


def css_parts(web: Path) -> list[Path]:
    """`web/css/` 下的样式分区，已按层叠顺序排好。"""
    return sorted(path for path in (web / "css").glob("*.css")
                  if CSS_PART_NAME.fullmatch(path.name))


def stylesheet_response(request: Request, web: Path) -> Response:
    """`/app.css`：把 `web/css/` 的分区按顺序拼成一份交付。

    样式表拆成分区是为了让改动落在互不重叠的文件上——一整份两千多行的样式表，
    两个分支各改一处也几乎必然撞在一起。但拆开只是仓库里的事：页面仍然只取一份
    `/app.css`，不给首屏加二十来个阻塞请求，层叠顺序也不必写进 `index.html`。

    ETag 不能照 `asset_response()` 只看单个文件的 mtime 和字节数，改任何一份分区
    都要让它失效，所以取全部分区的 (mtime_ns, 字节数) 摘要。仍然不读文件内容。
    """
    parts = css_parts(web)
    if not parts:
        return PlainTextResponse("missing", status_code=404)
    stamp = "|".join(
        f"{path.name}:{stat.st_mtime_ns:x}:{stat.st_size:x}"
        for path, stat in ((path, path.stat()) for path in parts)
    )
    etag = f'"peach-css-{hashlib.sha256(stamp.encode()).hexdigest()[:16]}"'
    if request.headers.get("if-none-match") == etag:
        response: Response = Response(status_code=304)
    else:
        response = Response(b"".join(path.read_bytes() for path in parts),
                            media_type="text/css; charset=utf-8")
    response.headers["ETag"] = etag
    response.headers["Cache-Control"] = "no-cache"
    return response


@router.api_route("/", methods=["GET", "HEAD"])
def index(request: Request, args: dict[str, str] = Depends(require_page_auth)):
    settings = request.app.state.settings
    auth_target = query_auth_redirect(request)
    if auth_target is not None:
        response = RedirectResponse(auth_target, status_code=303)
        set_auth_cookie(response, request)
        return response
    if not settings.configured:
        # 未配置不是错误状态：服务照常起，首页（和任何前端路由的深链）变成首次运行页。
        html = setup_shell()
        if "edit" in request.query_params and _copy_editor_available():
            html = _with_copy_editor(html)
        response = HTMLResponse(html)
        response.headers["Cache-Control"] = "no-store"
        return response
    if not settings.page_path.is_file():
        return PlainTextResponse("Peach page missing", status_code=500)
    shape = getattr(request.state, "entity_shape", None)
    editor = "edit" in request.query_params and _copy_editor_available()
    from .client_updates import runtime_identity
    html = settings.page_path.read_text(encoding="utf-8")
    entries = {'peach-client-runtime': runtime_identity()}
    if shape is not None:
        entries['peach-entity-shape'] = shape
    for name, entry in entries.items():
        payload = json.dumps(entry, ensure_ascii=False).replace("<", "\\u003c")
        script = f'<script type="application/json" id="{name}">{payload}</script>'
        html = html.replace("</head>", script + "</head>", 1) if "</head>" in html else html + script
    if editor:
        html = _with_copy_editor(html)
    response = HTMLResponse(html)
    response.headers["Cache-Control"] = "no-store"
    set_auth_cookie(response, request)
    return response


def _copy_editor_available() -> bool:
    return not getattr(sys, "frozen", False) and all((PROJECT_ROOT / path).is_file() for path in (
        "scripts/dev/copy-editor.js", "frontend/src/copy-editor-core.js"))


def _with_copy_editor(html: str) -> str:
    html = html.replace("<body", '<body data-peach-copy-mode="source"', 1)
    return html.replace("</body>", '<script src="/dev/copy-editor-core.js" defer></script><script src="/dev/copy-editor.js" defer></script></body>')


def _require_copy_editor():
    if not _copy_editor_available():
        raise HTTPException(404, "missing")


@router.get("/dev/copy-editor.js")
def copy_editor_script(request: Request, args: dict[str, str] = Depends(require_asset_auth)):
    _require_copy_editor()
    return asset_response(request, PROJECT_ROOT / "scripts/dev/copy-editor.js", "text/javascript")


@router.get("/dev/copy-editor-core.js")
def copy_editor_core(request: Request, args: dict[str, str] = Depends(require_asset_auth)):
    _require_copy_editor()
    return asset_response(request, PROJECT_ROOT / "frontend/src/copy-editor-core.js", "text/javascript")


@router.get("/dev/copy-edits")
def copy_editor_edits(args: dict[str, str] = Depends(require_asset_auth)):
    _require_copy_editor()
    path = PROJECT_ROOT / "build/copy-editor/edits.json"
    return JSONResponse(json.loads(path.read_text(encoding="utf-8")) if path.is_file() else {},
                        headers={"Cache-Control": "no-store"})


@router.get("/dev/copy-candidates")
def copy_editor_candidates(text: str = "", args: dict[str, str] = Depends(require_asset_auth)):
    _require_copy_editor()
    from . import dev_copy
    try:
        return JSONResponse(dev_copy.candidates(PROJECT_ROOT, text), headers={"Cache-Control": "no-store"})
    except ValueError as error:
        raise HTTPException(400, str(error)) from error


@router.post("/dev/copy-save")
async def copy_editor_save(request: Request, args: dict[str, str] = Depends(require_asset_auth)):
    _require_copy_editor()
    if request.headers.get("origin") != str(request.base_url).rstrip("/"):
        raise HTTPException(403, "same origin required")
    if len(await request.body()) > 32768:
        raise HTTPException(413, "too large")
    try:
        from . import dev_copy_runtime
        return JSONResponse(dev_copy_runtime.submit(PROJECT_ROOT, await request.json()))
    except (ValueError, TypeError, KeyError) as error:
        return JSONResponse({"error": str(error)}, status_code=409)


@router.get('/dev/copy-apply')
def copy_editor_apply_status(args: dict[str, str] = Depends(require_asset_auth)):
    _require_copy_editor()
    from . import dev_copy_runtime
    return JSONResponse(dev_copy_runtime.status(PROJECT_ROOT), headers={'Cache-Control': 'no-store'})


@router.post('/dev/copy-apply')
async def copy_editor_apply_retry(request: Request, args: dict[str, str] = Depends(require_asset_auth)):
    _require_copy_editor()
    if request.headers.get('origin') != str(request.base_url).rstrip('/'):
        raise HTTPException(403, 'same origin required')
    if len(await request.body()) > 32768:
        raise HTTPException(413, 'too large')
    from . import dev_copy_runtime
    try:
        return JSONResponse(dev_copy_runtime.submit(PROJECT_ROOT, await request.json(), retry=True))
    except (ValueError, TypeError, KeyError) as error:
        return JSONResponse({'error': str(error)}, status_code=409)


def _setup_guard(request: Request, *, submit: bool) -> None:
    """首启的两个端点（`GET /api/setup/questions`、`POST /api/setup`）共用的守卫。

    形态各不相同因为原因各不相同：已经配置过的机器上这些端点根本不存在（404，不是
    「禁止」——把它做成一条可探测的 403 等于对外宣告这里有个初始化入口）；非回环调用方是
    403（引导服务只绑 127.0.0.1，能走到这里说明有人转发了它）；独立包认地址栏里的主机名，
    不是回环写法也是 403。提交再看 Origin：从别的页面发来的表单不收。
    """
    settings = request.app.state.settings
    if settings.configured:
        raise HTTPException(status_code=404, detail="not found")
    host = request.client.host if request.client else ""
    if host not in _LOOPBACK:
        raise HTTPException(status_code=403, detail="setup is loopback-only")
    if distribution.standalone() and request.url.hostname not in _LOOPBACK:
        raise HTTPException(status_code=403, detail="请使用本机地址打开设置")
    if not submit:
        return
    origin = request.headers.get("origin")
    if origin and origin.rstrip("/") != str(request.base_url).rstrip("/"):
        raise HTTPException(status_code=403, detail="请从 Peach 设置页提交")


@router.get("/api/setup/questions")
def setup_questions(request: Request):
    """首启表单要画的一切：题目与顺序、默认值、题面与说明、可选项、平台差异与开关初始态。

    页面骨架上的固定文案（标题、按钮、「完成设置后」那一组、访问密码分区的几句话）归前端；
    这里给的是随平台、打包形态、本机已装软件或题目定义而变的那部分。守卫与提交端点相同，
    只是不看 Origin：配置完成后这里 404，运行事实不再对外。
    """
    _setup_guard(request, submit=False)
    from . import peach_proxy, remote_reporting
    windows = os.name == "nt"
    asked = onboarding.questions(settings_file.active(), windows=windows)
    host_labels = dict(onboarding.HOST_OPTIONS)
    from .media_configuration import SOURCE_OPTIONS
    items = []
    for question in asked:
        view = _question_view(question)
        note = _POSIX_MEDIA_NOTE if question.key == "media_dir" and not windows else ""
        item: dict[str, object] = {
            "key": question.key, "label": view["label"],
            "help": [line for line in (view["help"], note) if line],
            "default": "" if question.key == "media_dir" else question.default,
            # 星号与 `required` 跟着输入框走：两段式单选总有一项选中，不标。
            "required": question.key != "host",
            # 目录和访问范围属于首次设置主流程，端口与局域网名称按需展开。
            "advanced": question.key not in {"media_dir", "data_root", "host"},
            "input": view["input"], "prefix": view["prefix"], "suffix": view["suffix"],
        }
        if question.key == "host":
            item["options"] = [{"value": choice, "label": host_labels[choice]} for choice in _HOST_ORDER]
        if question.key == "mdns_name":
            # 局域网地址只在选了「同一局域网的设备」时显示并提交；不提交时服务端按默认值补。
            item["visible_when"] = {"host": "2"}
        items.append(item)
    return JSONResponse({
        "windows": windows,
        "standalone": distribution.standalone(),
        "questions": items,
        "media_sources": [{"value": value, "label": label} for value, label in SOURCE_OPTIONS],
        "media_source_default": "local",
        "media_root": None,
        "cloud": {"help": _CLOUD_HELP, "link": {"url": _CLOUD_HELP_URL, "label": _CLOUD_HELP_LABEL},
                  "dependencies": missing_mount_dependencies(windows=windows)},
        "access_enabled": _access_on_by_default(asked),
        "scan_now": True,
        "history_guide": False,
        "peach_proxy": peach_proxy.describe(settings_file.active().directory("secrets")),
        "docker": os.environ.get("PEACH_DISTRIBUTION") == "docker",
        "remote_reporting": remote_reporting.snapshot(),
    })


def _json_text(value: object) -> str:
    return "" if value is None else str(value)


def _submitted_media_rows(rows: object) -> dict[str, list]:
    """JSON 媒体行拆成与表单相同的逐列列表；身份字段按行原样带给配置校验。"""
    rows = [row if isinstance(row, dict) else {} for row in rows] if isinstance(rows, list) else []
    return {
        "media_dir": [_json_text(row.get("path")) for row in rows],
        "media_location": [_json_text(row.get("location", "local")) for row in rows],
        "media_root": [_json_text(row.get("root")) for row in rows],
        "media_cost": [row.get("cost") for row in rows],
        "media_identity": [{key: row[key] for key in ("root_id", "library_id", "library", "library_icon", "change_mode",
                                                     "library_color", "library_policy", "library_stages")
                            if key in row} for row in rows],
    }


@router.post("/api/setup")
async def setup_submit_json(request: Request):
    """首启提交：校验一份答卷，全对就落盘；错误按题目 key 回给页面写回原位。

    正文形态见 `docs/OPERATIONS.md`「首次设置的内部流程」。正文先换成扁平 dict：媒体
    文件夹三列是列表，其余是字串。错误按题目的 key 收集，访问密码的错误在 `access_password`；
    先报全部字段错误，字段都对了才看设置文件在不在（409，并发提交或重发，不能覆盖别人刚
    写好的那份）。

    扫描不在这里跑：这条引导服务在设置完成的那一刻就会被托盘停掉，跑在它进程里的
    扫描会跟着一起死。这里只写一个标记，由托盘切到正常服务之后消费。
    """
    _setup_guard(request, submit=True)
    try:
        body = await request.json()
    except ValueError:
        body = None
    if not isinstance(body, dict):
        raise HTTPException(status_code=400, detail="请求正文要是 JSON 对象")
    from . import remote_reporting
    try:
        reporting = remote_reporting.parse_choices(body.get("remote_reporting", {}), partial=True)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    submitted: dict[str, object] = {
        key: _json_text(body[key])
        for key in ("data_root", "host", "port", "mdns_name", "access_password", "access_confirm")
        if body.get(key) is not None}
    submitted.update(_submitted_media_rows(body.get("media_dir")))
    submitted["skip_media"] = body.get("skip_media") is True
    scan_now = body.get("scan_now") is True and not submitted["skip_media"]
    history_guide = body.get("history_guide") is True
    windows = os.name == "nt"
    answers, errors = _read_answers(settings_file.active(), submitted, windows=windows)
    from . import access
    password_enabled = body.get("access_enabled") is True
    password = submitted.get("access_password", "") if password_enabled else ""
    confirmation = submitted.get("access_confirm", "") if password_enabled else ""
    try:
        if password_enabled and not password:
            raise ValueError("请输入访问密码")
        access.validate_password(password, confirmation)
    except ValueError as exc:
        errors["access_password"] = str(exc)
    standalone = distribution.standalone()
    from . import peach_proxy
    proxy_values = None
    proxy_root = settings_file.active().directory("secrets")
    if answers is not None:
        resolved, _broken = onboarding.resolve_config(answers.data_root)
        proxy_root = resolved.directory("secrets")
    try:
        proxy_values = peach_proxy.validate(proxy_root, body.get("peach_proxy", {"mode": "environment"}))
    except ValueError as exc:
        errors["peach_proxy"] = str(exc)
    if standalone and answers is not None:
        try:
            onboarding.check_available_port(answers.port, request.url.port or 80)
        except ValueError as exc:
            errors["port"] = str(exc)
    if not errors:
        # Peach 数据目录决定设置文件在哪，所以拿到它之后要按它重新解析一次，不能沿用进程启动
        # 那一刻按发现顺序算出来的这份。
        resolved, _broken = onboarding.resolve_config(answers.data_root)
        if resolved.path.exists():
            raise HTTPException(status_code=409, detail="settings file already exists")
        try:
            applied = onboarding.apply(resolved, answers, windows=windows, access_password=password,
                                       peach_proxy_values=proxy_values)
            settings_file.remember_data_root(settings_file.active(), applied.config)
        except (OSError, RuntimeError) as exc:
            errors = {"data_root": str(exc)}
    if errors:
        raise HTTPException(status_code=400, detail={"message": "有几项需要修改", "errors": errors})
    remote_reporting.save(reporting, applied.config)
    if scan_now:
        onboarding.request_first_scan(applied.config, "configured" if answers.media_sources is not None else "local")
    return _setup_done(applied.config, scan_now=scan_now, history_guide=history_guide,
                       skip_media=submitted["skip_media"])


def _setup_done(config, *, scan_now: bool = False, history_guide: bool = False, restored: bool = False,
                skip_media: bool = False):
    destination = _normal_url(config) if restored else _setup_destination(config, history_guide=history_guide)
    return JSONResponse({
        "url": destination,
        "scan_requested": scan_now,
        "skip_media": skip_media,
        "history_guide": history_guide,
        "restored": restored,
        "standalone": distribution.standalone(),
        # 独立包的完成页过一会儿自己跳到入口；时长由前端定，与配置页保存后的跳转同一个数。
        "redirect": destination if distribution.standalone() else None,
        "facts": runtime_fact_entries(config),
    })


@router.post("/api/setup/restore")
async def setup_restore(request: Request):
    """接回用户指定的已有数据目录；只记录位置，沿用其中的配置、账本和访问密码。"""
    _setup_guard(request, submit=True)
    try:
        body = await request.json()
        raw = body.get("data_root") if isinstance(body, dict) else None
        if not isinstance(raw, str) or not raw.strip() or not Path(raw).is_absolute():
            raise ValueError("请选择已有数据目录的绝对路径")
        config, broken = onboarding.resolve_config(Path(raw))
        if broken:
            raise broken
        if not config.present:
            raise ValueError("此目录中没有有效的 config.toml")
        if not (config.directory("database") / "ledger.db").is_file():
            raise ValueError("此目录中没有数据库，请选择保存原配置和数据库的数据目录")
        if distribution.standalone():
            onboarding.check_available_port(config.server.port, request.url.port or 80)
        settings_file.remember_data_root(settings_file.active(), config)
    except (ValueError, OSError, RuntimeError) as exc:
        raise HTTPException(400, {"message": "无法使用此数据目录", "errors": {"data_root": str(exc)}}) from exc
    return _setup_done(config, restored=True)


def _setup_media_source_errors(dirs: Sequence[str], kinds: object,
                               problems: Sequence[str], validate) -> list[str]:
    """首启的本地来源必须真的可读；CloudDrive 来源仍可离线保存。

    `media_configuration.validate` 对整表不成立的情况（一行都没填、超过 100 行）
    只回一句话，和行数对不上。那种时候原样交回去让页面显示，不能按行去覆盖——
    索引会越界，用户看到的是 500 而不是「请添加 1 到 100 个媒体目录」。
    """
    if problems and len(problems) != len(dirs):
        return list(problems)
    errors = list(problems) if problems else [""] * len(dirs)
    source_kinds = list(kinds) if isinstance(kinds, (list, tuple)) else []
    for index, path in enumerate(dirs):
        kind = source_kinds[index] if index < len(source_kinds) else "local"
        if kind != "local":
            continue
        try:
            validate(path)
        except ValueError as exc:
            errors[index] = str(exc)
    return errors if any(errors) else []


def _read_answers(
    config, submitted: Mapping[str, object], *, windows: bool,
) -> tuple[object, dict[str, object]]:
    """逐字段校验，错误按字段收集。校验器和 CLI 问答用的是同一批。

    媒体目录那一项是多行：错误是与行对应的列表，其余字段的错误是一句话。
    """
    values: dict[str, object] = {}
    errors: dict[str, object] = {}
    for question in onboarding.questions(config, windows=windows):
        if question.key == "media_dir":
            if submitted.get("skip_media") is True:
                values.update(media_dirs=(), media_sources=[])
                continue
            from . import media_configuration
            dirs = _media_dir_values(submitted, "")
            kinds = submitted.get("media_location", [])
            roots = submitted.get("media_root", [])
            costs = submitted.get("media_cost", [])
            sources = [{"location": kinds[i] if i < len(kinds) else "local", "path": path,
                        "root": roots[i] if i < len(roots) else ""} for i, path in enumerate(dirs)]
            for index, row in enumerate(sources):
                if index < len(costs) and costs[index] is not None:
                    row["cost"] = costs[index]
                identities = submitted.get("media_identity", [])
                if isinstance(identities, list) and index < len(identities) and isinstance(identities[index], dict):
                    row.update(identities[index])
            sources = media_configuration.prepare_sources(sources, windows=windows, config=config)
            _, _, problems = media_configuration.validate(sources, windows=windows, config=config)
            if not problems:
                from . import media_identity
                try:
                    media_identity.configure_sources(config, sources, windows=windows)
                except ValueError as exc:
                    problems = [str(exc)] * len(sources)
            problems = _setup_media_source_errors(dirs, kinds, problems, question.validate)
            if problems:
                errors["media_dir"] = problems
            values.update(media_dirs=tuple(Path(path) for path in dirs), media_sources=sources)
            continue
        raw = str(submitted.get(question.key, "") or "")
        try:
            values[question.key] = question.validate(raw if raw.strip() else question.default)
        except ValueError as exc:
            errors[question.key] = str(exc)
    if errors:
        return None, errors
    return onboarding.Answers(**values), {}  # type: ignore[arg-type]


@router.api_route("/app.css", methods=["GET", "HEAD"])
@router.api_route("/board.css", methods=["GET", "HEAD"])
def app_asset(request: Request, args: dict[str, str] = Depends(require_asset_auth)):
    """页面共用样式，分区在 `web/css/`，BoardUI 样式与 index.html 同目录。"""
    name = request.url.path.lstrip("/")
    web = request.app.state.settings.page_path.parent
    if name == "app.css":
        return stylesheet_response(request, web)
    path = web / name
    if not path.is_file():
        return PlainTextResponse("missing", status_code=404)
    return asset_response(request, path, "text/css")


_BUNDLE_NAMES = frozenset({"peach-app.js", "peach-app.css", "peach-pages.js", "peach-pages.css"})


def _bundle_response(request: Request, name: str) -> Response:
    """`web/dist/` 下的一份产物。名字不合法或文件不在都是 404，浏览器直接打开时由错误页说。

    固定名的入口每次复验；带哈希的 chunk 内容不变，长期缓存。压缩协商若要按文件挑预压缩副本，
    包在这里返回的响应外面即可，名字校验与缓存头不随之改变。
    """
    chunk = BUNDLE_CHUNK_NAME.fullmatch(name) is not None
    if name not in _BUNDLE_NAMES and not chunk:
        raise HTTPException(404)
    path = request.app.state.settings.page_path.parent / "dist" / name
    if not path.is_file():
        raise HTTPException(404)
    media = "text/css" if name.endswith(".css") else "text/javascript"
    return asset_response(request, path, media, immutable=chunk)


# 两条字面量路由必须注册在 `/dist/{name}` 之前：路由按注册顺序匹配。
@router.api_route("/dist/peach-pages.js", methods=["GET", "HEAD"])
@router.api_route("/dist/peach-pages.css", methods=["GET", "HEAD"])
def page_bundle(request: Request):
    """入口页的页面包，不要会话（ADR-0094）：登录页要在拿到会话之前出图。

    放行的只有这两个文件。它们提交进 Git、随仓库分发，不读账本、不含配置与凭据，内容不随
    登录与否变化；页面包也不 import 别的产物。其余 `/dist/*` 仍走下面那条要会话的路由。
    """
    return _bundle_response(request, request.url.path.rsplit("/", 1)[1])


@router.api_route("/dist/{name}", methods=["GET", "HEAD"])
def app_bundle(request: Request, name: str,
               args: dict[str, str] = Depends(require_asset_auth)):
    """`frontend/` 的主包入口使用固定文件名、会话认证与 ETag 复验，按页拆出的 chunk 带内容哈希、长期缓存。

    产物提交进 Git；只提供主包、主包 chunk 与页面包的 JS/CSS，文件名不接受路径分隔符或附带扩展名。
    """
    return _bundle_response(request, name)


@router.api_route("/dev/agentation.js", methods=["GET", "HEAD"])
def agentation_bundle(request: Request, args: dict[str, str] = Depends(require_asset_auth)):
    """界面标注工具 Agentation 的本机构建产物，口令与缓存口径同 `/dist/`。

    产物不进 Git、不进独立包，只在跑过 `npm --prefix frontend run build:agentation`
    的检出里存在；其余部署一律 404。主包只在本机开关打开时才请求它。
    """
    path = request.app.state.settings.agentation_path
    if not path.is_file():
        return PlainTextResponse("missing", status_code=404)
    return asset_response(request, path, "text/javascript")


@router.api_route("/site-icon/{name}", methods=["GET", "HEAD"])
def bundled_site_icon(request: Request, name: str,
                      args: dict[str, str] = Depends(require_asset_auth)):
    """随应用提供的来源标识，文件名只认已登记的五个来源。"""
    if name not in {"javten.png", "fc2ppvdb.png", "avwikidb.png", "minnano-av.png", "github.png"}:
        return PlainTextResponse("missing", status_code=404)
    path = PROJECT_ROOT / "resources" / "site-marks" / name
    if not path.is_file():
        return PlainTextResponse("missing", status_code=404)
    return asset_response(request, path, "image/png")


@router.api_route('/browser-icon/{key}', methods=['GET','HEAD'])
def bundled_browser_icon(request: Request, key: str,
                         args: dict[str,str] = Depends(require_asset_auth)):
    from .browser_icons import resolve
    target = resolve(key)
    if target is None:
        return PlainTextResponse('missing',status_code=404)
    path, content_type = target
    return asset_response(request,path,content_type)


@router.api_route("/robots.txt", methods=["GET", "HEAD"])
def robots_txt():
    """不要求登录：爬虫拿不到会话，被 401 挡住就等于没读到这份声明。

    响应头里那一条才是真闸门（登录页、资产与 API 都带着它）；这一份只是把同一个
    结论放在爬虫会主动来取的固定路径上。
    """
    response = PlainTextResponse(ROBOTS_TXT)
    response.headers["Cache-Control"] = "no-store"
    return response


@router.api_route("/favicon.svg", methods=["GET", "HEAD"])
def favicon():
    response = Response(FAVICON, media_type="image/svg+xml")
    response.headers["Cache-Control"] = "no-store"
    return response


@router.api_route("/favicon.ico", methods=["GET", "HEAD"])
def favicon_ico(request: Request):
    """页面没有声明图标时浏览器按这个固定路径取，书签与历史记录也从这里拿。

    发 `resources/peach.ico`：它和 `peach-logo.png` 同出一张原图，里面已经装好
    16 到 256 七档尺寸，浏览器按需要挑一档，不必为一枚 16px 的角标下载
    1024×1024 的 PNG。声明写在每个页面的 head 里，这条路径是声明之外的兜底。
    """
    return asset_response(request, PROJECT_ROOT / "resources" / "peach.ico", "image/x-icon")


@router.api_route("/vvs-club.svg", methods=["GET", "HEAD"])
def vvs_club_logo(request: Request):
    return asset_response(request, PROJECT_ROOT / "resources" / "vvs-club.svg", "image/svg+xml")


@router.api_route("/peach-logo.png", methods=["GET", "HEAD"])
def peach_logo(request: Request):
    return asset_response(request, PROJECT_ROOT / "resources" / "peach-logo.png", "image/png")


@router.api_route("/peach-logo-64.png", methods=["GET", "HEAD"])
@router.api_route("/peach-logo-128.png", methods=["GET", "HEAD"])
def peach_logo_small(request: Request):
    """侧栏与登录卡那枚站标：页面按 `srcset` 挑 64 或 128 px，不为 24 px 的图标下 1024 px 的原图。

    和原图一样不设防：登录页在拿到会话之前就要画它。文件由
    `scripts/generate_brand_assets.py` 从同一张原图缩出。
    """
    name = request.url.path.rsplit("/", 1)[-1]
    return asset_response(request, PROJECT_ROOT / "resources" / name, "image/png")


@router.api_route("/performers/", methods=["GET", "HEAD"])
@router.api_route("/creators/", methods=["GET", "HEAD"])
@router.api_route("/studios/", methods=["GET", "HEAD"])
@router.api_route("/agencies/", methods=["GET", "HEAD"])
@router.api_route("/series/", methods=["GET", "HEAD"])
@router.api_route("/tags/", methods=["GET", "HEAD"])
def index_directory_redirect(request: Request, args: dict[str, str] = Depends(require_page_auth)):
    """索引页使用规范路径，查询参数保持原样。"""
    query = f"?{request.url.query}" if request.url.query else ""
    return RedirectResponse(request.url.path.rstrip("/") + query, status_code=307)


def _page_redirect(request: Request, path: str, *, context: tuple[str, int] | None = None):
    """导航使用临时重定向，重复查询参数与会话继续有效。"""
    query = request.scope.get("query_string", b"").decode("utf-8")
    if context:
        key, value = context
        pairs = [(key_, value_) for key_, value_ in request.query_params.multi_items() if key_ != key]
        pairs.append((key, str(value)))
        query = urlencode(pairs)
    response = RedirectResponse(path + (f"?{query}" if query else ""), status_code=307)
    response.headers["Cache-Control"] = "no-store"
    set_auth_cookie(response, request)
    return response


@router.api_route("/item/{item_id}", methods=["GET", "HEAD"])
@router.api_route("/mix/{seed_id}/{item_id}", methods=["GET", "HEAD"])
@router.api_route("/parts/{seed_id}/{item_id}", methods=["GET", "HEAD"])
@router.api_route("/editions/{seed_id}/{item_id}", methods=["GET", "HEAD"])
@router.api_route("/playlists/{seed_id}/{item_id}", methods=["GET", "HEAD"])
def asset_route_redirect(request: Request, item_id: int, seed_id: int | None = None,
                         args: dict[str, str] = Depends(require_page_auth)):
    prefix = request.url.path.split("/", 2)[1]
    context_key = "playlist" if prefix == "playlists" else prefix
    context = (context_key, seed_id) if seed_id is not None else None
    return _page_redirect(request, f"/assets/{item_id}", context=context)


@router.api_route("/jav/movie/{code}", methods=["GET", "HEAD"])
@router.api_route("/works/{code}", methods=["GET", "HEAD"])
def work_route(request: Request, code: str, args: dict[str, str] = Depends(require_page_auth)):
    from .sample_images import code_key

    key = code_key(code)
    if not key:
        raise HTTPException(404, "not found")
    path = f"/works/{quote(key, safe='')}"
    if request.url.path != path:
        return _page_redirect(request, path)
    return index(request, args)


@router.api_route("/follow/item/{item_id}", methods=["GET", "HEAD"])
def post_route_redirect(request: Request, item_id: int,
                        args: dict[str, str] = Depends(require_page_auth)):
    return _page_redirect(request, f"/posts/{item_id}")


@router.api_route("/activity", methods=["GET", "HEAD"])
@router.api_route("/scraping", methods=["GET", "HEAD"])
@router.api_route("/configuration", methods=["GET", "HEAD"])
@router.api_route("/follow-manage", methods=["GET", "HEAD"])
@router.api_route("/diagnostics", methods=["GET", "HEAD"])
def management_route_redirect(request: Request, args: dict[str, str] = Depends(require_page_auth)):
    paths = {"/activity": "/tasks", "/scraping": "/sources",
             "/configuration": "/settings/library", "/follow-manage": "/subscriptions",
             "/diagnostics": "/settings/diagnostics"}
    return _page_redirect(request, paths[request.url.path])


@router.api_route("/settings/{section}", methods=["GET", "HEAD"])
def settings_section_route(request: Request, section: str,
                           args: dict[str, str] = Depends(require_page_auth)):
    if section not in {"appearance", "playback", "jav", "search", "content", "library",
                       "subscriptions", "downloads", "network", "maintenance", "diagnostics"}:
        raise HTTPException(404, "not found")
    return index(request, args)


@router.api_route("/performers/{name:path}", methods=["GET", "HEAD"])
@router.api_route("/studios/{name:path}", methods=["GET", "HEAD"])
@router.api_route("/creators/{name:path}", methods=["GET", "HEAD"])
@router.api_route("/series/{name:path}", methods=["GET", "HEAD"])
@router.api_route("/agencies/{name:path}", methods=["GET", "HEAD"])
@router.api_route("/tags/{name:path}", methods=["GET", "HEAD"])
def entity_route(request: Request, name: str,
                 args: dict[str, str] = Depends(require_page_auth)):
    if not request.app.state.settings.configured:
        return index(request, args)
    from .web_entity import INDEX_ENTITY_KINDS, entity_id_redirect, entity_page_shape

    prefix = request.url.path.split("/", 2)[1]
    kind = {**INDEX_ENTITY_KINDS, "series": "series", "tags": "tag"}[prefix]
    with request.app.state.web_contract.read_connection() as connection:
        if name.isascii() and name.isdecimal():
            if len(name) > 19 or not 0 < int(name) < 2**63:
                raise HTTPException(404, "not found")
            entity_id = resolve_entity_id(connection, int(name))
            entity = connection.execute("SELECT * FROM entity WHERE id=? AND kind=?",
                                        (entity_id, kind)).fetchone() if entity_id else None
            if entity is None:
                redirect = entity_id_redirect(connection, kind, int(name))
                if redirect:
                    prefixes = {value: key for key, value in INDEX_ENTITY_KINDS.items()}
                    prefixes.update(series='series', tag='tags')
                    return _page_redirect(request, f"/{prefixes[redirect['kind']]}/{redirect['id']}")
                raise HTTPException(404, "not found")
        else:
            entity = resolve_entity(connection, kind, name)
        if entity is not None and request.url.path == f"/{prefix}/{entity['id']}":
            request.state.entity_shape = entity_page_shape(request.app.state.web_contract, connection, entity)
    if entity is not None:
        path = f"/{prefix}/{entity['id']}"
        if request.url.path != path:
            return _page_redirect(request, path)
    return index(request, args)


@router.api_route("/assets/{item_id}", methods=["GET", "HEAD"])
@router.api_route("/posts/{item_id}", methods=["GET", "HEAD"])
@router.api_route("/playlists", methods=["GET", "HEAD"])
@router.api_route("/performers", methods=["GET", "HEAD"])
@router.api_route("/creators", methods=["GET", "HEAD"])
@router.api_route("/studios", methods=["GET", "HEAD"])
@router.api_route("/agencies", methods=["GET", "HEAD"])
@router.api_route("/series", methods=["GET", "HEAD"])
@router.api_route("/tags", methods=["GET", "HEAD"])
@router.api_route("/jav", methods=["GET", "HEAD"])
@router.api_route("/unseen", methods=["GET", "HEAD"])
@router.api_route("/watch-later", methods=["GET", "HEAD"])
@router.api_route("/flagged", methods=["GET", "HEAD"])
@router.api_route("/junk-files", methods=["GET", "HEAD"])
@router.api_route("/stats", methods=["GET", "HEAD"])
@router.api_route("/immerse", methods=["GET", "HEAD"])
@router.api_route("/wall", methods=["GET", "HEAD"])
@router.api_route("/trash", methods=["GET", "HEAD"])
@router.api_route("/review", methods=["GET", "HEAD"])
@router.api_route("/taste", methods=["GET", "HEAD"])
@router.api_route("/data-cleanup", methods=["GET", "HEAD"])
@router.api_route("/duplicates", methods=["GET", "HEAD"])
@router.api_route("/quality-goals", methods=["GET", "HEAD"])
# 任务中心那一屏（island），数据走 `/api/tasks`。深链要能直接打开：定时任务被挡下时
# 留下的记录是「刚才为什么没跑」的唯一答案，从别处贴过来的地址不该是 404。
@router.api_route("/tasks", methods=["GET", "HEAD"])
@router.api_route("/sources", methods=["GET", "HEAD"])
@router.api_route("/resource-sync", methods=["GET", "HEAD"])
@router.api_route("/follow", methods=["GET", "HEAD"])
@router.api_route("/subscriptions", methods=["GET", "HEAD"])
# 配置页是主站里的一屏（island），数据走 `/api/configuration`。未配置时 `index()` 给的是
# 首次运行表单，正好就是「请先完成首次设置」该长的样子。
@router.api_route("/settings", methods=["GET", "HEAD"])
def client_route(request: Request, item_id: int | None = None,
                 args: dict[str, str] = Depends(require_page_auth)):
    return index(request, args)
