"""Windows 制品的隔离启动检查，只使用临时数据目录。"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import socket
import subprocess
import tempfile
import time
import urllib.request


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--backend',required=True,type=Path)
    parser.add_argument('--openlist',type=Path)
    args=parser.parse_args()
    with tempfile.TemporaryDirectory(prefix='vvs-windows-smoke-') as directory:
        with socket.socket() as sock:
            sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
        env={k:v for k,v in os.environ.items() if not k.startswith('PEACH_')}
        env['PEACH_DATA_ROOT']=directory
        env.update(PYTHONUTF8='1',PYTHONIOENCODING='utf-8')
        log_path=Path(directory)/'backend.log'
        log=log_path.open('wb')
        process=subprocess.Popen([str(args.backend.resolve()),'--vvs-cli','serve','--host','127.0.0.1','--port',str(port),'--setup','--no-mdns','--no-ledger-sync'],env=env,stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
        opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
        try:
            deadline=time.monotonic()+90
            while time.monotonic()<deadline:
                if process.poll() is not None:
                    raise RuntimeError('冻结后端启动后退出：\n'+log_path.read_text(encoding='utf-8',errors='replace')[-6000:])
                try:
                    with opener.open(f'http://127.0.0.1:{port}/healthz',timeout=2) as response:
                        health=json.load(response)
                    if not isinstance(health,dict) or health.get('configured') is not False:
                        raise RuntimeError('临时后端未处于首次设置状态。')
                    print('Windows bundled backend health check passed.')
                    break
                except OSError:
                    time.sleep(.5)
            else:
                raise RuntimeError('冻结后端健康检查超时。')
        finally:
            process.terminate()
            try: process.wait(timeout=15)
            except subprocess.TimeoutExpired: process.kill();process.wait()
            log.close()
        if args.openlist:
            cloud_smoke(args.backend.resolve(),args.openlist.resolve(),Path(directory)/"cloud",env)


def cloud_smoke(backend, binary, data, env):
    log_path=data.parent/'cloud.log'
    with log_path.open('wb') as log:
        process=subprocess.Popen([str(backend),'--cloud','--binary',str(binary),'--data',str(data)],env=env,stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
        try:
            deadline=time.monotonic()+90
            while time.monotonic()<deadline:
                if process.poll() is not None:
                    raise RuntimeError('网盘组件退出：'+log_path.read_text(encoding='utf-8',errors='replace')[-4000:])
                lines=log_path.read_text(encoding='utf-8',errors='replace').splitlines()
                ready=next((line[16:] for line in lines if line.startswith('VVS_CLOUD_READY=')),None)
                if ready:
                    value=json.loads(ready)
                    request=urllib.request.Request(value['url']+'/api/status',headers={'X-VVS-Capability':value['capability']})
                    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
                    with opener.open(request,timeout=10) as response:
                        status=json.load(response)
                    if {p['id'] for p in status['providers']}!={'baidu','aliyun','115','quark','terabox'}:
                        raise RuntimeError('网盘列表不完整。')
                    with opener.open(value['url'],timeout=10) as response:
                        if b'vvsCloud' not in response.read():
                            raise RuntimeError('网盘界面桥资源缺失。')
                    print('Windows cloud bridge bootstrap and five-provider status check passed.')
                    return
                time.sleep(.5)
            raise RuntimeError('网盘组件启动超时。')
        finally:
            if os.name=='nt':
                subprocess.run(['taskkill','/pid',str(process.pid),'/t','/f'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=False)
            elif process.poll() is None:
                process.terminate()
            process.wait(timeout=15)


if __name__=='__main__':
    main()
