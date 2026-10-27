"""在本机使用 Apple 工具链构建 vvs-club 的 Mac 浏览器外壳。"""
from __future__ import annotations

import argparse
import json
import platform
import plistlib
from pathlib import Path
import shutil
import subprocess
from urllib.parse import urlsplit


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, default=Path('build/vvs-club-macos'))
    args = parser.parse_args()
    if platform.system() != 'Darwin':
        parser.error('请在安装 Apple Command Line Tools 的 macOS 上构建。')
    source = Path(__file__).resolve().parent
    sites = json.loads((source / 'sites.json').read_text())
    if not isinstance(sites, list) or not sites:
        parser.error('sites.json 需要至少一个站点。')
    for site in sites:
        url = urlsplit(site['url'])
        if not site.get('name') or url.scheme != 'https' or not url.hostname or url.username or url.password:
            parser.error('站点需要名称和不含凭据的 HTTPS 地址。')
    bundle = args.output.resolve() / 'vvs-club.app'
    executable = bundle / 'Contents/MacOS/vvs-club'
    resources = bundle / 'Contents/Resources'
    executable.parent.mkdir(parents=True, exist_ok=True)
    resources.mkdir(parents=True, exist_ok=True)
    module_cache = source.parents[1] / 'build/swift-module-cache'
    module_cache.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        'xcrun', 'swiftc', '-swift-version', '5', '-O', '-target',
        f'{platform.machine()}-apple-macos13.0', '-framework', 'AppKit',
        '-framework', 'WebKit', '-module-cache-path', str(module_cache),
        str(source / 'VVSClub.swift'), '-o', str(executable),
    ], check=True)
    plist = {
        'CFBundleExecutable': 'vvs-club', 'CFBundleName': 'vvs-club',
        'CFBundleDisplayName': 'vvs-club', 'CFBundleIdentifier': 'cloud.stanlll.vvs-club',
        'CFBundlePackageType': 'APPL', 'CFBundleShortVersionString': '0.1.0',
        'CFBundleVersion': '1', 'LSMinimumSystemVersion': '13.0',
        'NSHighResolutionCapable': True, 'NSPrincipalClass': 'NSApplication',
        'NSHumanReadableCopyright': 'vvs-club contributors; Peach © 2026 longmeidao; AGPL-3.0-or-later',
        'NSAppTransportSecurity': {'NSAllowsLocalNetworking': True},
    }
    (bundle / 'Contents/Info.plist').write_bytes(plistlib.dumps(plist))
    shutil.copy2(source / 'sites.json', resources / 'sites.json')
    shutil.copy2(source.parents[1] / 'LICENSE', resources / 'LICENSE')
    subprocess.run(['codesign', '--force', '--sign', '-', str(bundle)], check=True)
    print(f'构建完成：{bundle}')
    print('此包按当前 Mac 架构构建，使用本地签名，未做 Apple 公证。')


if __name__ == '__main__':
    main()
