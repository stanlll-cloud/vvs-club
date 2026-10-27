"""网盘连接桥的授权边界、目录隔离与只读扫描索引。"""
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
from types import SimpleNamespace
import unittest
from unittest.mock import patch
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('vvs_cloud_service', ROOT / 'desktop/macos/cloud_service.py')
cloud = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cloud)


class CloudConnectionTests(unittest.TestCase):
    def test_cross_provider_and_parent_directory_are_rejected(self):
        for path in ('/aliyun/private', '/baidu/../aliyun', '/baidu/../../', '/baidu\\private'):
            with self.subTest(path=path), self.assertRaises(ValueError):
                cloud.CloudBridge.cloud_path('baidu', path)
        self.assertEqual(cloud.CloudBridge.cloud_path('baidu', '/baidu/电影'), '/baidu/电影')

    def test_failed_directory_validation_does_not_claim_a_connected_account(self):
        bridge = object.__new__(cloud.CloudBridge)
        stores, removed = [], []
        bridge.storages = lambda: stores.copy()
        def api(path, data=None):
            if path == '/api/admin/storage/create':
                stores.append({'id': 7, 'mount_path': '/baidu'})
                return {'id': 7}
            if path.startswith('/api/admin/storage/delete?'):
                removed.append(path)
                stores.clear()
        bridge.api = api
        bridge.listing = lambda *_: (_ for _ in ()).throw(ValueError('expired authorization'))
        with self.assertRaises(ValueError):
            bridge.connect('baidu', {'driver_txt': 'baiduyun_go', 'refresh_token': 'sample-refresh-token'})
        self.assertEqual(removed, ['/api/admin/storage/delete?id=7'])
        self.assertEqual(stores, [])

    def test_existing_connection_is_not_replaced_by_another_authorization(self):
        bridge = object.__new__(cloud.CloudBridge)
        bridge.storages = lambda: [{'id': 9, 'mount_path': '/baidu'}]
        bridge.api = lambda *_: self.fail('existing connection must not be changed')
        with self.assertRaises(ValueError):
            bridge.connect('baidu', {'driver_txt': 'baiduyun_go', 'refresh_token': 'sample-refresh-token'})

    def test_mismatched_authorization_provider_is_rejected(self):
        bridge = object.__new__(cloud.CloudBridge)
        with self.assertRaises(ValueError):
            bridge.connect('baidu', {'driver_txt': 'alicloud_go', 'refresh_token': 'sample-refresh-token'})
        for provider in ('quark', 'terabox'):
            with self.subTest(provider=provider), self.assertRaises(ValueError):
                bridge.connect(provider, {})

    def test_scan_indexes_video_metadata_without_downloads_or_remote_writes(self):
        with tempfile.TemporaryDirectory() as temporary:
            bridge = object.__new__(cloud.CloudBridge)
            bridge.index_root = Path(temporary)
            bridge.lock = threading.RLock()
            bridge.stopping = threading.Event()
            bridge.state = {'port': 12345, 'play_key': 'test-play-capability', 'records': {}, 'scans': {}}
            bridge.jobs = {'baidu': {'running': True, 'folders': 0, 'videos': 0, 'error': ''}}
            bridge.save = lambda: None
            def listing(_provider, path):
                if path == '/baidu':
                    return {'items': [{'name': '电影', 'directory': True, 'size': 0},
                        {'name': '../outside.mp4', 'directory': False, 'size': 1},
                        {'name': '说明.txt', 'directory': False, 'size': 1}]}
                return {'items': [{'name': '演示.mp4', 'directory': False, 'size': 123}]}
            bridge.listing = listing
            bridge.api = lambda *_: self.fail('scanner must not download or mutate remote files')
            with patch.object(cloud.time, 'sleep'):
                bridge.scan('baidu', '/baidu')
            self.assertFalse(bridge.jobs['baidu']['running'])
            self.assertEqual(bridge.jobs['baidu']['videos'], 1)
            result = bridge.videos('baidu')
            self.assertEqual(result['items'][0]['name'], '演示.mp4')
            pointers = list((Path(temporary) / 'baidu').glob('*.strm'))
            self.assertEqual(len(pointers), 1)
            self.assertIn('http://127.0.0.1:12345/play/', pointers[0].read_text())
            self.assertNotIn('sample-refresh-token', pointers[0].read_text())


class CloudBridgeRequestTests(unittest.TestCase):
    def setUp(self):
        self.server = cloud.ThreadingHTTPServer(('127.0.0.1', 0), cloud.Handler)
        self.server.daemon_threads = True
        self.server.bridge = SimpleNamespace(capability='test-api-capability', status=lambda: {'providers': []})
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        self.url = f'http://127.0.0.1:{self.server.server_port}'

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=2)

    def test_api_rejects_missing_or_cross_origin_capability(self):
        for headers in ({}, {'X-VVS-Capability': 'test-api-capability', 'Origin': 'https://unrelated.example'}):
            with self.subTest(headers=headers), self.assertRaises(urllib.error.HTTPError) as error:
                self.opener.open(urllib.request.Request(self.url + '/api/status', headers=headers))
            self.assertEqual(error.exception.code, 403)
        with self.opener.open(urllib.request.Request(self.url + '/api/status',
                headers={'X-VVS-Capability': 'test-api-capability'})) as response:
            self.assertEqual(json.load(response), {'providers': []})


class CloudSessionTests(unittest.TestCase):
    def test_cookie_session_must_match_the_selected_provider(self):
        bridge = object.__new__(cloud.CloudBridge)
        for provider, payload in (
            ('quark', {'driver_txt': 'quark_cookie', 'cookie': 'ndus=sample-session'}),
            ('terabox', {'driver_txt': 'terabox_cookie', 'cookie': '__puus=sample-session'}),
            ('quark', {'driver_txt': 'quark_cookie', 'cookie': '__puus=sample\r\nInjected: value'}),
        ):
            with self.subTest(provider=provider), self.assertRaises(ValueError):
                bridge.connect(provider, payload)

    def test_cookie_is_only_passed_to_the_local_connector_storage(self):
        bridge = object.__new__(cloud.CloudBridge)
        stores, additions = [], []
        bridge.storages = lambda: stores.copy()
        bridge.listing = lambda *_: {'path': '/quark', 'items': []}
        def api(path, data=None):
            self.assertEqual(path, '/api/admin/storage/create')
            self.assertEqual(data['driver'], 'Quark')
            additions.append(json.loads(data['addition']))
            stores.append({'id': 1, 'mount_path': '/quark'})
            return {'id': 1}
        bridge.api = api
        result = bridge.connect('quark', {'driver_txt': 'quark_cookie', 'cookie': '__puus=sample-session; __pus=sample-id'})
        self.assertTrue(result['connected'])
        self.assertEqual(additions[0]['cookie'], '__puus=sample-session; __pus=sample-id')

    def test_connector_bootstrap_binds_only_to_loopback(self):
        with tempfile.TemporaryDirectory() as temporary:
            process = SimpleNamespace(poll=lambda: None, terminate=lambda: None, wait=lambda timeout: 0)
            result = SimpleNamespace(returncode=0, stdout='Admin token:\n' + 'a' * 32)
            with patch.object(cloud.subprocess, 'run', return_value=result) as runner, \
                    patch.object(cloud.subprocess, 'Popen', return_value=process), \
                    patch.object(cloud.CloudBridge, 'api', return_value={'content': []}):
                bridge = cloud.CloudBridge(Path('/fake/openlist'), Path(temporary))
                config = json.loads((Path(temporary) / 'connector/config.json').read_text())
                self.assertTrue(config['force'])
                self.assertEqual(config['scheme']['address'], '127.0.0.1')
                self.assertEqual(config['cors']['allow_origins'], [bridge.core_url])
                self.assertFalse(config['tls_insecure_skip_verify'])
                args, kwargs = runner.call_args
                self.assertIn('OPENLIST_ADMIN_PASSWORD', kwargs['env'])
                self.assertNotIn(kwargs['env']['OPENLIST_ADMIN_PASSWORD'], args[0])
                bridge.close()


class CloudPlaybackTests(unittest.TestCase):
    def test_playback_uses_only_an_indexed_file_and_preserves_range(self):
        class FakeCore(cloud.BaseHTTPRequestHandler):
            def log_message(self, *_):
                pass
            def do_GET(self):
                self.server.received = (self.path, self.headers.get('Range'), self.headers.get('Authorization'))
                self.send_response(206)
                self.send_header('Content-Length', '4')
                self.send_header('Content-Range', 'bytes 2-5/10')
                self.send_header('Content-Type', 'video/mp4')
                self.end_headers()
                self.wfile.write(b'2345')
        core = cloud.ThreadingHTTPServer(('127.0.0.1', 0), FakeCore)
        threading.Thread(target=core.serve_forever, daemon=True).start()
        app = cloud.ThreadingHTTPServer(('127.0.0.1', 0), cloud.Handler)
        def api(path, data=None):
            self.assertEqual(path, '/api/fs/get')
            self.assertEqual(data['path'], '/baidu/sample.mp4')
            return {'sign': 'test-file-sign'}
        app.bridge = SimpleNamespace(state={'play_key': 'sample-play-capability',
            'records': {'video1': {'path': '/baidu/sample.mp4'}}}, api=api,
            core_url=f'http://127.0.0.1:{core.server_port}')
        threading.Thread(target=app.serve_forever, daemon=True).start()
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        try:
            request = urllib.request.Request(f'http://127.0.0.1:{app.server_port}/play/video1?key=sample-play-capability', headers={'Range': 'bytes=2-5'})
            with opener.open(request, timeout=3) as response:
                self.assertEqual(response.status, 206)
                self.assertEqual(response.headers['Content-Range'], 'bytes 2-5/10')
                self.assertEqual(response.read(), b'2345')
            self.assertEqual(core.received[1], 'bytes=2-5')
            self.assertIsNone(core.received[2])
            self.assertTrue(core.received[0].startswith('/p/baidu/sample.mp4?force=true'))
            with self.assertRaises(urllib.error.HTTPError) as error:
                opener.open(f'http://127.0.0.1:{app.server_port}/play/unknown?key=sample-play-capability')
            self.assertEqual(error.exception.code, 403)
        finally:
            app.shutdown(); app.server_close()
            core.shutdown(); core.server_close()
