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
    args=parser.parse_args()
    with tempfile.TemporaryDirectory(prefix='vvs-windows-smoke-') as directory:
        with socket.socket() as sock:
            sock.bind(('127.0.0.1',0));port=sock.getsockname()[1]
        env={k:v for k,v in os.environ.items() if not k.startswith('PEACH_')}
        env['PEACH_DATA_ROOT']=directory
        process=subprocess.Popen([str(args.backend.resolve()),'--vvs-cli','serve','--host','127.0.0.1','--port',str(port),'--setup','--no-mdns','--no-ledger-sync'],env=env,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,creationflags=subprocess.CREATE_NO_WINDOW if os.name=='nt' else 0)
        opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
        try:
            deadline=time.monotonic()+90
            while time.monotonic()<deadline:
                if process.poll() is not None:
                    raise RuntimeError('冻结后端启动后退出。')
                try:
                    with opener.open(f'http://127.0.0.1:{port}/healthz',timeout=2) as response:
                        health=json.load(response)
                    if not isinstance(health,dict) or health.get('configured') is not False:
                        raise RuntimeError('临时后端未处于首次设置状态。')
                    print('Windows bundled backend health check passed.')
                    return
                except OSError:
                    time.sleep(.5)
            raise RuntimeError('冻结后端健康检查超时。')
        finally:
            process.terminate()
            try: process.wait(timeout=15)
            except subprocess.TimeoutExpired: process.kill();process.wait()


if __name__=='__main__':
    main()
