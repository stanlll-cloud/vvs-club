"""为 Windows 安装包准备固定版本组件、图标及冻结的本机后端。"""
from __future__ import annotations
import hashlib
from pathlib import Path
import runpy
import shutil
import subprocess
import sys
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[2]


def main():
    if sys.platform != 'win32':
        raise SystemExit('完整安装包须在 Windows 上构建。')
    assets = ROOT / 'desktop/windows/assets'
    assets.mkdir(exist_ok=True)
    for source, name in [(ROOT/'desktop/macos/sites.json', 'sites.json'), (ROOT/'desktop/macos/adblock-rules.json','adblock-rules.json'), (ROOT/'resources/vvs-club.png','vvs-club.png')]:
        shutil.copy2(source, assets/name)
    from PIL import Image
    with Image.open(assets/'vvs-club.png') as image:
        image.save(assets/'vvs-club.ico', sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
    directory=ROOT/'build/vvs-windows-dependencies'
    directory.mkdir(parents=True,exist_ok=True)
    archive=directory/'openlist-v4.2.9-windows-amd64-lite.zip'
    if not archive.exists():
        with urllib.request.urlopen('https://github.com/OpenListTeam/OpenList/releases/download/v4.2.9/openlist-windows-amd64-lite.zip',timeout=120) as response:
            archive.write_bytes(response.read())
    if hashlib.sha256(archive.read_bytes()).hexdigest()!='1b10524f9e76bca436f2dd4307b549cd4229aa0678618d3c9e8571b933d9c9d1':
        raise SystemExit('OpenList 官方资产摘要不匹配。')
    with zipfile.ZipFile(archive) as package:
        matches=[n for n in package.namelist() if Path(n).name.lower()=='openlist.exe']
        if len(matches)!=1:
            raise SystemExit('OpenList 资产结构不正确。')
        (directory/'openlist.exe').write_bytes(package.read(matches[0]))
    manifest=runpy.run_path(str(ROOT/'src/peach/bundle_resources.py'))
    args=[sys.executable,'-m','PyInstaller','--noconfirm','--clean','--onedir','--console','--name','vvs-service',
          '--distpath',str(ROOT/'build/vvs-windows-backend'),'--workpath',str(ROOT/'build/vvs-windows-pyinstaller'),'--specpath',str(directory),
          '--paths',str(ROOT/'src'),'--paths',str(ROOT/'desktop/macos'),'--python-option','X utf8',
          '--collect-submodules','peach','--collect-all','curl_cffi','--collect-all','resvg_py','--copy-metadata','sentry-sdk',
          '--hidden-import','cloud_service','--hidden-import','service',
          '--hidden-import','uvicorn.logging','--hidden-import','uvicorn.loops.auto','--hidden-import','uvicorn.protocols.http.auto',
          '--hidden-import','uvicorn.protocols.websockets.auto','--hidden-import','uvicorn.lifespan.on',
          '--add-data',str(ROOT/'scripts/standalone.txt')+';.',
          '--add-data',str(ROOT/'desktop/macos/cloud.html')+';.']
    for source,target in manifest['data_files'](ROOT):
        args.extend(['--add-data',str(source)+';'+target])
    args.append(str(ROOT/'desktop/windows/backend.py'))
    subprocess.run(args,cwd=ROOT,check=True)


if __name__=='__main__':
    main()
