"""管理本次 vvs-club 窗口启动的本地媒体服务，不接管其他实例。"""
from __future__ import annotations

import json
import os
from pathlib import Path
import signal
import socket
import subprocess
import sys
import time
import urllib.request


def main() -> int:
    root = Path(__file__).resolve().parents[2]
    data = Path.home() / 'Library/Application Support/vvs-club/media-data'
    data.mkdir(parents=True, exist_ok=True, mode=0o700)
    logs = data.parent / 'logs'
    logs.mkdir(parents=True, exist_ok=True, mode=0o700)
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        port = sock.getsockname()[1]
    url = f'http://127.0.0.1:{port}'
    env = dict(os.environ)
    env.update(PEACH_DATA_ROOT=str(data), PYTHONPATH=str(root / 'src'),
               PEACH_TRAY_MANAGED='1')
    env.pop('PEACH_TOKEN', None)
    os.environ.update(env)
    sys.path.insert(0, str(root / 'src'))
    from peach import onboarding, settings_file

    process = None
    scanner = None
    stopping = False

    def stop(_signum, _frame):
        nonlocal stopping
        stopping = True

    signal.signal(signal.SIGTERM, stop)
    signal.signal(signal.SIGINT, stop)
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    try:
        with (logs / 'media-service.log').open('ab', buffering=0) as log:
            while not stopping:
                prepared = settings_file.load_config(environ=env)
                config = prepared.path
                stamp = config.stat().st_mtime_ns if config.exists() else None
                locator = data / 'state/data-root.txt'
                locator_stamp = locator.stat().st_mtime_ns if locator.exists() else None
                reload_path = prepared.directory('state') / onboarding.RELOAD_NAME
                reload_path.unlink(missing_ok=True)
                arguments = [
                    sys.executable, '-m', 'peach', 'serve', '--host', '127.0.0.1',
                    '--port', str(port), '--no-mdns', '--no-ledger-sync',
                ]
                if not prepared.present:
                    arguments.append('--setup')
                process = subprocess.Popen(arguments, cwd=root, env=env, stdout=log, stderr=log)
                announced = False
                deadline = time.monotonic() + 90
                while not stopping and process.poll() is None:
                    if not announced:
                        try:
                            with opener.open(url + '/healthz', timeout=2) as response:
                                health = json.load(response)
                            if isinstance(health, dict):
                                print('VVS_READY=' + url, flush=True)
                                announced = True
                        except (OSError, ValueError):
                            if time.monotonic() > deadline:
                                print('VVS_ERROR=本地服务启动超时，请查看运行日志。', flush=True)
                                return 1
                    updated = config.stat().st_mtime_ns if config.exists() else None
                    next_locator = locator.stat().st_mtime_ns if locator.exists() else None
                    # 首次设置保存后，重新读取配置。只重启本窗口创建的子进程。
                    if updated != stamp or next_locator != locator_stamp or reload_path.exists():
                        break
                    if scanner is not None and scanner.poll() is not None:
                        scanner = None
                    if prepared.present and scanner is None:
                        location = onboarding.take_first_scan_request(prepared)
                        if location is not None:
                            scanner = subprocess.Popen([sys.executable, '-m', 'peach', 'process', location],
                                                       cwd=root, env=env, stdout=log, stderr=log)
                    time.sleep(0.5)
                if process.poll() is None:
                    process.terminate()
                    try:
                        process.wait(timeout=15)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait()
                elif not stopping:
                    print('VVS_ERROR=本地媒体服务已退出，请查看运行日志。', flush=True)
                    return 1
            return 0
    finally:
        if scanner is not None and scanner.poll() is None:
            scanner.terminate()
            try:
                scanner.wait(timeout=15)
            except subprocess.TimeoutExpired:
                scanner.kill()
                scanner.wait()
        if process is not None and process.poll() is None:
            process.terminate()
            try:
                process.wait(timeout=15)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait()


if __name__ == '__main__':
    raise SystemExit(main())
