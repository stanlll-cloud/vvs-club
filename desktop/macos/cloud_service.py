"""本机网盘连接桥：OpenList 管理授权，vvs-club 只提供目录与影片索引。"""
from __future__ import annotations

import argparse
import hashlib
import hmac
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path, PurePosixPath
import re
import secrets
import signal
import socket
import subprocess
import threading
import time
from urllib.parse import parse_qs, quote, urlsplit
import urllib.error
import urllib.request

PROVIDERS = {
    'baidu': {'name': '百度网盘', 'driver': 'BaiduNetdisk', 'oauth': 'baiduyun_go', 'root': '/'},
    'aliyun': {'name': '阿里网盘', 'driver': 'AliyundriveOpen', 'oauth': 'alicloud_go', 'root': 'root'},
    '115': {'name': '115 网盘', 'driver': '115 Open', 'oauth': '115cloud_go', 'root': '0'},
    'quark': {'name': '夸克网盘', 'driver': 'Quark', 'oauth': 'quark_cookie', 'root': '0', 'note': '使用夸克官网的扫码或验证码登录，完成后验证盘内目录。'},
    'terabox': {'name': 'TeraBox', 'driver': 'Terabox', 'oauth': 'terabox_cookie', 'root': '/', 'note': '使用 TeraBox 官网当前提供的登录方式，完成后验证盘内目录。'},
}
VIDEO = {'.mp4', '.mkv', '.avi', '.mov', '.m4v', '.ts', '.webm', '.wmv', '.flv', '.mpg', '.mpeg'}
LOCAL = urllib.request.build_opener(urllib.request.ProxyHandler({}))


def private_json(path: Path, value):
    temporary = path.with_suffix('.tmp')
    fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, 'w') as stream:
        json.dump(value, stream, ensure_ascii=False)
    temporary.replace(path)
    path.chmod(0o600)


def free_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


class CloudBridge:
    def __init__(self, binary: Path, directory: Path):
        self.directory = directory
        directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        directory.chmod(0o700)
        self.index_root = directory / 'index'
        self.index_root.mkdir(exist_ok=True, mode=0o700)
        self.state_path = directory / 'state.json'
        self.state = json.loads(self.state_path.read_text()) if self.state_path.exists() else {
            'port': free_port(), 'play_key': secrets.token_hex(32), 'records': {}, 'scans': {},
        }
        self.capability = secrets.token_hex(32)
        self.lock = threading.RLock()
        self.jobs = {}
        self.stopping = threading.Event()
        self.core_dir = directory / 'connector'
        self.core_dir.mkdir(exist_ok=True, mode=0o700)
        self.core_dir.chmod(0o700)
        self.core_port = free_port()
        self.core_url = f'http://127.0.0.1:{self.core_port}'
        config = self.core_dir / 'config.json'
        private_json(config, {
            'force': True,
            'scheme': {'address': '127.0.0.1', 'http_port': self.core_port, 'https_port': -1},
            'jwt_secret': secrets.token_hex(32), 'token_expires_in': 24,
            'database': {'type': 'sqlite3', 'db_file': str(self.core_dir / 'data.db'), 'table_prefix': 'vvs_'},
            'temp_dir': str(self.core_dir / 'temp'), 'log': {'enable': False},
            'tls_insecure_skip_verify': False,
            's3': {'enable': False}, 'ftp': {'enable': False}, 'sftp': {'enable': False}, 'mcp': {'enable': False},
            'cors': {'allow_origins': [self.core_url], 'allow_methods': ['GET', 'POST'], 'allow_headers': ['Content-Type', 'Authorization']},
        })
        args = [str(binary), '--data', str(self.core_dir)]
        # 只管理该组件新建的数据，初始化过程不监听网络。输出仅在本进程内解析。
        environment = {key: value for key, value in os.environ.items()
                       if not key.startswith(('ALIST_', 'OPENLIST_'))}
        for scheme, address in urllib.request.getproxies().items():
            if scheme in {'http', 'https'}:
                environment.setdefault(scheme.upper() + '_PROXY', address)
        environment['OPENLIST_ADMIN_PASSWORD'] = secrets.token_urlsafe(48)
        environment['NO_PROXY'] = environment.get('NO_PROXY', '') + ',127.0.0.1,localhost'
        result = subprocess.run([*args, 'admin', 'token'], capture_output=True, text=True,
                                timeout=60, env=environment, creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
        token_text = result.stdout.split('Admin token:')[-1].strip()
        self.admin_token = next((line.strip() for line in token_text.splitlines()
                                 if re.fullmatch(r'[A-Za-z0-9_\-.]{24,512}', line.strip())), '')
        if result.returncode or not self.admin_token:
            raise RuntimeError('网盘组件初始化失败，请重新打开应用。')
        saved_config = json.loads(config.read_text())
        if not saved_config.get('force') or saved_config['scheme']['address'] != '127.0.0.1' or saved_config['scheme']['http_port'] != self.core_port:
            raise RuntimeError('网盘组件的本机监听配置未生效。')
        config.chmod(0o600)
        for path in self.core_dir.glob('*.db*'):
            path.chmod(0o600)
        self.process = subprocess.Popen([*args, 'server'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=environment, creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
        try:
            for _ in range(100):
                if self.process.poll() is not None:
                    raise RuntimeError('网盘组件已退出。')
                try:
                    self.api('/api/admin/storage/list?page=1&per_page=100')
                    break
                except (OSError, ValueError):
                    time.sleep(0.2)
            else:
                raise RuntimeError('网盘组件启动超时。')
        except Exception:
            self.close()
            raise
        self.save()

    def save(self):
        with self.lock:
            private_json(self.state_path, self.state)

    def close(self):
        self.stopping.set()
        if hasattr(self, 'process') and self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                self.process.kill()
                self.process.wait()

    def api(self, path, data=None):
        request = urllib.request.Request(self.core_url + path,
            data=None if data is None else json.dumps(data).encode(),
            headers={'Authorization': self.admin_token, 'Content-Type': 'application/json'})
        with LOCAL.open(request, timeout=45) as response:
            result = json.load(response)
        if result.get('code') != 200:
            # 上游错误可能包含令牌或带签名链接，不直接返回原文。
            raise ValueError('网盘未返回可用结果，请检查授权或稍后重试。')
        return result.get('data')

    def storages(self):
        return self.api('/api/admin/storage/list?page=1&per_page=100').get('content') or []

    def status(self):
        stores = {item['mount_path']: item for item in self.storages()}
        return {'providers': [dict(id=key, name=item['name'], available=bool(item['driver']),
            note=item.get('note', '登录授权后，选择云端目录开始扫描。'),
            configured=('/' + key) in stores, connected=stores.get('/' + key, {}).get('status') == 'work',
            job=self.jobs.get(key), scan=self.state['scans'].get(key)) for key, item in PROVIDERS.items()]}

    @staticmethod
    def cloud_path(provider, path):
        if provider not in PROVIDERS:
            raise ValueError('未知网盘。')
        root = '/' + provider
        path = path or root
        if not isinstance(path, str) or '\\' in path or any(ord(c) < 32 for c in path):
            raise ValueError('目录不正确。')
        normalized = str(PurePosixPath(path))
        if '..' in PurePosixPath(path).parts or not (normalized == root or normalized.startswith(root + '/')):
            raise ValueError('请选择当前网盘内的目录。')
        return normalized

    def listing(self, provider, path):
        path = self.cloud_path(provider, path)
        data = self.api('/api/fs/list', {'path': path, 'password': '', 'page': 1, 'per_page': 0, 'refresh': False})
        return {'path': path, 'items': [{'name': item['name'], 'directory': item['is_dir'],
                'size': item.get('size', 0)} for item in (data.get('content') or [])]}

    def connect(self, provider, tokens):
        if not isinstance(tokens, dict):
            raise ValueError('授权返回不正确。')
        definition = PROVIDERS.get(provider)
        if not definition or not definition['driver']:
            raise ValueError('该网盘尚未接通账号登录。')
        if tokens.get('driver_txt') != definition['oauth']:
            raise ValueError('授权来源与所选网盘不一致，请重新登录。')
        if provider in {'quark', 'terabox'}:
            cookie = tokens.get('cookie')
            required = '__puus=' if provider == 'quark' else 'ndus='
            if not isinstance(cookie, str) or not 8 <= len(cookie) <= 32768 or required not in cookie or '\r' in cookie or '\n' in cookie:
                raise ValueError('没有取得本网盘的登录会话，请在官网登录后再确认。')
            addition = {'cookie': cookie, 'root_folder_id': definition['root']}
            if provider == 'quark':
                addition.update(order_by='none', order_direction='asc', use_transcoding_address=False, only_list_video_file=False)
            else:
                addition.update(root_folder_path='/', download_api='official', order_by='name', order_direction='asc')
        else:
            refresh = tokens.get('refresh_token')
            access = tokens.get('access_token')
            if not isinstance(refresh, str) or not 8 <= len(refresh) <= 16384:
                raise ValueError('没有取得有效授权，请重新登录。')
            if provider == '115' and not isinstance(access, str):
                raise ValueError('115 授权未完整返回，请重新登录。')
            addition = {'refresh_token': refresh, 'root_folder_id': definition['root']}
            if provider == 'baidu':
                addition.update(root_folder_path='/', use_online_api=True,
                    api_url_address='https://api.oplist.org/baiduyun/renewapi', download_api='official',
                    custom_crack_ua='pan.baidu.com', upload_thread='1')
            elif provider == 'aliyun':
                addition.update(use_online_api=True, api_url_address='https://api.oplist.org/alicloud/renewapi',
                    drive_type='resource', alipan_type='default', remove_way='trash', livp_download_format='jpeg')
            else:
                addition.update(access_token=access, limit_rate=1, page_size=200)
        previous = next((item for item in self.storages() if item['mount_path'] == '/' + provider), None)
        if previous:
            raise ValueError('该网盘已配置。请先在网盘设备管理中处理原授权，再重新连接。')
        record = {'mount_path': '/' + provider, 'driver': definition['driver'],
            'addition': json.dumps(addition), 'order': 0, 'cache_expiration': 30,
            'web_proxy': True, 'webdav_policy': 'native_proxy', 'disabled': False}
        try:
            self.api('/api/admin/storage/create', record)
            # 必须真实读到目录，才显示已连接。
            self.listing(provider, '/' + provider)
        except Exception:
            # 创建失败时 OpenList 仍可能保存不可用条目，只回收本次创建的那个条目。
            created = next((item for item in self.storages() if item['mount_path'] == '/' + provider), None)
            if created:
                self.api('/api/admin/storage/delete?id=' + str(created['id']), {})
            raise ValueError('账号授权尚未连接成功，请检查网盘授权或稍后重试。') from None
        return {'connected': True, 'provider': provider}

    def disconnect(self, provider):
        if provider not in PROVIDERS:
            raise ValueError('请选择网盘。')
        if self.jobs.get(provider, {}).get('running'):
            raise ValueError('请等待当前扫描结束后再断开。')
        storage = next((item for item in self.storages() if item['mount_path'] == '/' + provider), None)
        if storage:
            self.api('/api/admin/storage/delete?id=' + str(storage['id']), {})
        return {'disconnected': True}

    def start_scan(self, provider, path):
        path = self.cloud_path(provider, path)
        with self.lock:
            if self.jobs.get(provider, {}).get('running'):
                raise ValueError('这个网盘正在扫描。')
            self.jobs[provider] = {'running': True, 'folders': 0, 'videos': 0, 'error': ''}
        thread = threading.Thread(target=self.scan, args=(provider, path), daemon=True)
        thread.start()
        return {'started': True}

    def scan(self, provider, root):
        job = self.jobs[provider]
        try:
            pending, visited, found = [root], set(), []
            while pending and not self.stopping.is_set():
                path = pending.pop()
                if path in visited:
                    continue
                visited.add(path)
                if len(visited) > 20000:
                    raise ValueError('目录过多，请选择更小的扫描范围。')
                listing = self.listing(provider, path)
                job['folders'] += 1
                for item in listing['items']:
                    name = item['name']
                    if name in {'.', '..'} or '/' in name or '\\' in name or any(ord(c) < 32 for c in name):
                        continue
                    target = path + '/' + name
                    if item['directory']:
                        pending.append(target)
                    elif PurePosixPath(name).suffix.lower() in VIDEO:
                        found.append({'name': name, 'path': target, 'size': item['size']})
                        job['videos'] = len(found)
                time.sleep(0.25)
            if self.stopping.is_set():
                raise ValueError('扫描已停止，下次可重新扫描。')
            export = self.index_root / provider
            export.mkdir(exist_ok=True, mode=0o700)
            with self.lock:
                records = []
                for item in found:
                    key = hashlib.sha256(item['path'].encode()).hexdigest()[:32]
                    self.state['records'][key] = dict(item, provider=provider)
                    stem = re.sub(r'[\\/:*?"<>|\x00-\x1f]', '_', PurePosixPath(item['name']).stem)[:100] or '影片'
                    pointer = export / (stem + '-' + key[:8] + '.strm')
                    pointer.write_text(f'http://127.0.0.1:{self.state["port"]}/play/{key}?key={self.state["play_key"]}\n')
                    pointer.chmod(0o600)
                    records.append(key)
                self.state['scans'][provider] = {'count': len(records), 'records': records, 'folder': str(export), 'root': root}
                self.save()
        except (OSError, ValueError):
            job['error'] = '扫描未完成。请检查授权、网络或缩小扫描范围后重试。'
        finally:
            job['running'] = False

    def videos(self, provider):
        scan = self.state['scans'].get(provider, {})
        return {'folder': scan.get('folder'), 'items': [dict(id=key, name=self.state['records'][key]['name'],
            size=self.state['records'][key]['size'], play=f'/play/{key}?key={self.state["play_key"]}')
            for key in scan.get('records', [])]}


class LocalOnlyRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        raise ValueError('网盘组件未按本机代理方式返回视频。')


class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, *_args):
        pass  # URL 可能含播放能力令牌，禁止记录。

    def send_json(self, value, status=200):
        data = json.dumps(value, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def authorized(self):
        host = f'127.0.0.1:{self.server.server_port}'
        origin = self.headers.get('Origin')
        return (self.headers.get('Host') == host and (not origin or origin == 'http://' + host)
                and hmac.compare_digest(self.headers.get('X-VVS-Capability', ''), self.server.bridge.capability))

    def do_GET(self):
        route = urlsplit(self.path)
        bridge = self.server.bridge
        if route.path.startswith('/play/'):
            return self.play(route)
        if route.path == '/':
            if self.headers.get('Host') != f'127.0.0.1:{self.server.server_port}':
                return self.send_json({'error': '地址不正确'}, 403)
            data = Path(__file__).with_name('cloud.html').read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'")
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        if not self.authorized():
            return self.send_json({'error': '请从 vvs-club 打开网盘页面。'}, 403)
        try:
            query = parse_qs(route.query)
            provider = query.get('provider', [''])[0]
            if route.path == '/api/status':
                result = bridge.status()
            elif route.path == '/api/list':
                result = bridge.listing(provider, query.get('path', [''])[0])
            elif route.path == '/api/videos':
                if provider not in PROVIDERS:
                    raise ValueError('请选择网盘。')
                result = bridge.videos(provider)
            else:
                return self.send_json({'error': '入口不存在'}, 404)
            self.send_json(result)
        except (OSError, ValueError):
            self.send_json({'error': '网盘读取失败，请检查连接或稍后重试。'}, 400)

    def do_POST(self):
        if not self.authorized():
            return self.send_json({'error': '请求未获授权'}, 403)
        try:
            length = int(self.headers.get('Content-Length', 0))
            if not 0 < length <= 65536:
                raise ValueError('请求不正确。')
            data = json.loads(self.rfile.read(length))
            if not isinstance(data, dict):
                raise ValueError('请求不正确。')
            provider = data.get('provider')
            if provider not in PROVIDERS:
                raise ValueError('请选择网盘。')
            if self.path == '/api/connect':
                result = self.server.bridge.connect(provider, data.get('tokens', {}))
            elif self.path == '/api/disconnect':
                result = self.server.bridge.disconnect(provider)
            elif self.path == '/api/scan':
                result = self.server.bridge.start_scan(provider, data.get('path'))
            else:
                return self.send_json({'error': '入口不存在'}, 404)
            self.send_json(result)
        except (OSError, ValueError, TypeError):
            self.send_json({'error': '操作未完成，请检查授权后重试。'}, 400)

    def do_HEAD(self):
        route = urlsplit(self.path)
        if route.path.startswith('/play/'):
            return self.play(route, head=True)
        self.send_json({'error': '入口不存在'}, 404)

    def play(self, route, head=False):
        bridge = self.server.bridge
        key = parse_qs(route.query).get('key', [''])[0]
        record_id = route.path.removeprefix('/play/')
        record = bridge.state['records'].get(record_id)
        if not record or not hmac.compare_digest(key, bridge.state['play_key']):
            return self.send_json({'error': '播放入口不可用'}, 403)
        started = False
        try:
            metadata = bridge.api('/api/fs/get', {'path': record['path'], 'password': ''})
            # 视频由 OpenList 本机代理读取，平台特有的请求头和签名仍由该驱动处理。
            target = bridge.core_url + '/p' + quote(record['path'], safe='/') + '?force=true'
            if metadata.get('sign'):
                target += '&sign=' + quote(metadata['sign'], safe='')
            headers = {}
            if self.headers.get('Range'):
                headers['Range'] = self.headers['Range']
            request = urllib.request.Request(target, headers=headers, method='HEAD' if head else 'GET')
            opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), LocalOnlyRedirect())
            with opener.open(request, timeout=45) as response:
                started = True
                self.send_response(response.status)
                for header in ('Content-Type', 'Content-Length', 'Content-Range', 'Accept-Ranges'):
                    if value := response.headers.get(header):
                        self.send_header(header, value)
                self.send_header('Connection', 'close')
                self.end_headers()
                self.close_connection = True
                if not head:
                    while chunk := response.read(128 * 1024):
                        self.wfile.write(chunk)
        except (OSError, ValueError, KeyError):
            self.close_connection = True
            if not started:
                self.send_json({'error': '视频暂时无法读取，请检查网盘权限和网络。'}, 502)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--binary', type=Path, required=True)
    parser.add_argument('--data', type=Path, default=Path.home() / 'Library/Application Support/vvs-club/cloud')
    args = parser.parse_args()
    bridge = None
    try:
        bridge = CloudBridge(args.binary, args.data)
        server = ThreadingHTTPServer(('127.0.0.1', bridge.state['port']), Handler)
        server.bridge = bridge
        server.daemon_threads = True
        def stop(*_):
            bridge.stopping.set()
            threading.Thread(target=server.shutdown, daemon=True).start()
        signal.signal(signal.SIGTERM, stop)
        signal.signal(signal.SIGINT, stop)
        print('VVS_CLOUD_READY=' + json.dumps({'url': f'http://127.0.0.1:{server.server_port}',
                                              'capability': bridge.capability}), flush=True)
        server.serve_forever(poll_interval=0.3)
        server.server_close()
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError):
        print('VVS_CLOUD_ERROR=网盘连接组件未能启动，请关闭并重新打开应用。', flush=True)
        return 1
    finally:
        if bridge:
            bridge.close()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
