"""在本机使用 Apple 工具链构建 vvs-club 的 Mac 浏览器外壳。"""
from __future__ import annotations

import argparse
import hashlib
import tarfile
import urllib.request
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
        str(source / 'VVSClub.swift'), str(source / 'CloudCoordinator.swift'), str(source / 'Bookmarks.swift'), str(source / 'AdBlocker.swift'), '-o', str(executable),
    ], check=True)
    plist = {
        'CFBundleExecutable': 'vvs-club', 'CFBundleName': 'vvs-club',
        'CFBundleDisplayName': 'vvs-club', 'CFBundleIdentifier': 'cloud.stanlll.vvs-club',
        'CFBundlePackageType': 'APPL', 'CFBundleIconFile': 'vvs-club.icns', 'CFBundleShortVersionString': '0.1.0',
        'CFBundleVersion': '1', 'LSMinimumSystemVersion': '13.0',
        'NSHighResolutionCapable': True, 'NSPrincipalClass': 'NSApplication',
        'NSHumanReadableCopyright': 'vvs-club contributors; Peach © 2026 longmeidao; AGPL-3.0-or-later',
        'NSAppTransportSecurity': {'NSAllowsLocalNetworking': True},
    }
    (bundle / 'Contents/Info.plist').write_bytes(plistlib.dumps(plist))
    logo = source.parents[1] / 'resources/vvs-club.png'
    shutil.copy2(logo, resources / 'vvs-club.png')
    iconset = args.output.resolve() / 'vvs-club.iconset'
    iconset.mkdir(parents=True, exist_ok=True)
    for points in (16, 32, 128, 256, 512):
        for scale in (1, 2):
            pixels = points * scale
            name = f"icon_{points}x{points}{'@2x' if scale == 2 else ''}.png"
            subprocess.run(['sips', '-z', str(pixels), str(pixels), str(logo), '--out', str(iconset / name)], check=True, stdout=subprocess.DEVNULL)
    subprocess.run(['iconutil', '-c', 'icns', str(iconset), '-o', str(resources / 'vvs-club.icns')], check=True)
    shutil.copy2(source / 'sites.json', resources / 'sites.json')
    shutil.copy2(source / 'adblock-rules.json', resources / 'adblock-rules.json')
    (resources / 'runtime.json').write_text(json.dumps({'backendRoot': str(source.parents[1])}))
    # 固定官方发布版本及 GitHub 发布资产摘要，更新时必须一并核对。
    openlist_version = 'v4.2.9'
    architectures = {
        'arm64': ('arm64', 'a4241527f1f74e786ec33accb3cebc7008ea1ba5717a462b0af23a1ac6565e88'),
        'x86_64': ('amd64', '72808a4436f20ec1d652c02389820f22bc19ae06199efa5aa6cb3587a0495941'),
    }
    arch, expected = architectures[platform.machine()]
    cache = source.parents[1] / 'build/dependencies'
    cache.mkdir(parents=True, exist_ok=True)
    asset = f'openlist-darwin-{arch}-lite.tar.gz'
    archive = cache / f'{openlist_version}-{asset}'
    if not archive.exists():
        with urllib.request.urlopen(f'https://github.com/OpenListTeam/OpenList/releases/download/{openlist_version}/{asset}', timeout=120) as response:
            archive.write_bytes(response.read())
    if hashlib.sha256(archive.read_bytes()).hexdigest() != expected:
        parser.error('OpenList 下载文件摘要不匹配，请重新取得官方发布文件。')
    with tarfile.open(archive, 'r:gz') as package:
        member = package.getmember('openlist')
        if not member.isfile():
            parser.error('OpenList 发布包格式不正确。')
        payload = package.extractfile(member)
        assert payload is not None
        (resources / 'openlist').write_bytes(payload.read())
    (resources / 'openlist').chmod(0o755)
    subprocess.run(['codesign', '--force', '--sign', '-', str(resources / 'openlist')], check=True)
    shutil.copy2(source.parents[1] / 'resources/third-party/OpenList-LICENSE', resources / 'OpenList-LICENSE')
    shutil.copy2(source.parents[1] / 'LICENSE', resources / 'LICENSE')
    subprocess.run(['codesign', '--force', '--sign', '-', str(bundle)], check=True)
    print(f'构建完成：{bundle}')
    print('此包按当前 Mac 架构构建，使用本地签名，未做 Apple 公证。')


if __name__ == '__main__':
    main()
