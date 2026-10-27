"""公开测试版查询；传输复用共享 HTTPX，发行包支持 R2 与 GitHub。"""
from __future__ import annotations

import json
import re
import httpx

from . import __version__, distribution
from .http import HttpRequest, HttpxTransport
from .update_packages import TOOL_PATHS

RELEASES_URL = "https://github.com/stanlll-cloud/vvs-club/releases"
API_URL = "https://api.github.com/repos/stanlll-cloud/vvs-club/releases?per_page=100"
DOWNLOADS_BASE = "https://downloads.peach.video"
DOWNLOADS_API = DOWNLOADS_BASE + "/releases.json"
GITGUD_RELEASES = "https://gitgud.io/peach-mitao/peach/-/releases"


def snapshot() -> dict:
    return {"current_version": __version__, "latest_version": None,
            "channel": "测试版", "installation": "独立测试包" if distribution.standalone() else "源码运行",
            "state": "unchecked", "message": "尚未检查", "release_url": RELEASES_URL}


def _version(value: object) -> tuple[int, ...] | None:
    if not isinstance(value, str) or not re.fullmatch(r"v?\d+\.\d+\.\d+", value):
        return None
    return tuple(map(int, value.removeprefix("v").split(".")))


def _release_candidates(rows: list, endpoint: str) -> list[tuple]:
    """从一个公开发行源选择完整包，并构造受信任的下载地址。"""
    releases = []
    for row in rows:
        if not isinstance(row, dict) or row.get("draft"):
            continue
        version = _version(row.get("tag_name"))
        if version is None:
            continue
        tag = row["tag_name"]
        assets = row.get("assets") or []
        prefix = f"Peach-{tag.removeprefix('v')}-windows-x64"
        uploaded = {a.get("name"): a for a in assets if isinstance(a, dict) and a.get("state") == "uploaded"}
        full = uploaded.get(prefix + ".zip")
        if full is None:
            continue
        complete_tools = all(prefix + f"-tools-{tool}.zip" in uploaded for tool in TOOL_PATHS)
        asset = uploaded.get(prefix + "-update.zip", full) if complete_tools else full
        if endpoint == DOWNLOADS_API:
            if not all(re.fullmatch(r"sha256:[0-9a-f]{64}", item.get("digest") or "") for item in (asset, full)):
                continue
            directory = f"{DOWNLOADS_BASE}/{tag}"
            release_url = f"{GITGUD_RELEASES}/{tag}"
        else:
            directory = f"{RELEASES_URL}/download/{tag}"
            release_url = f"{RELEASES_URL}/tag/{tag}"
        releases.append((version, tag, asset, full, directory, release_url))
    return releases


def check(*, transport=None) -> dict:
    result = snapshot()
    client = transport or HttpxTransport()
    try:
        releases = []
        obtained = False
        downloads = False
        for endpoint in (API_URL,):
            try:
                headers = {"Accept": "application/json"}
                if endpoint == API_URL:
                    headers.update(Accept="application/vnd.github+json", **{"X-GitHub-Api-Version": "2022-11-28"})
                response = client(HttpRequest("GET", endpoint, headers), 12.0, 2_000_000)
                if response.status != 200:
                    continue
                rows = json.loads(response.body)
                if not isinstance(rows, list):
                    continue
                obtained = True
                downloads = downloads or endpoint == DOWNLOADS_API
                releases.extend(_release_candidates(rows, endpoint))
            except (OSError, ValueError, TypeError, TimeoutError, httpx.HTTPError):
                continue
        if not releases:
            return dict(result, state="empty" if obtained else "error",
                        message="暂未找到可下载的测试版。" if obtained else "未能取得版本信息，请重试。")
        version, tag, asset, full, directory, release_url = max(releases, key=lambda item: item[0])
        current = _version(result["current_version"])
        if current is None:
            raise ValueError("current version required")
        state = "available" if version > current else "ahead" if version < current else "current"
        if not downloads and state != "available":
            # 新版本只发在 R2；GitHub 上停在旧版本。R2 没取到时，GitHub 的旧版本既说明不了
            # 「已是最新」也说明不了「高于已发布版本」。
            return dict(result, state="error", message="未能取得版本信息，请重试。")
        message = {"available": "有新版本可下载。", "ahead": "当前版本高于已发布测试版。", "current": "已是最新测试版。"}[state]
        return dict(result, latest_version=tag.removeprefix("v"), state=state, message=message,
                    asset_url=f"{directory}/{asset['name']}",
                    asset_size=asset.get("size", 0), asset_digest=asset.get("digest"),
                    package_kind="update" if asset is not full else "full",
                    # 应用更新包准备不下去（清单或工具包与本版更新器对不上）时改下的同版本完整包。
                    full_url=f"{directory}/{full['name']}", full_size=full.get("size", 0),
                    full_digest=full.get("digest"),
                    release_url=release_url)
    except (OSError, ValueError, TypeError, TimeoutError, httpx.HTTPError):
        return dict(result, state="error", message="未能取得版本信息，请重试。")
    finally:
        if transport is None:
            client.close()
