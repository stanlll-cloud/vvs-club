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
