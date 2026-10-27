"""Windows 桌面导航边界的隔离回归，不访问网站或账号。"""
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


@unittest.skipUnless(shutil.which('node'), '需要 Node 检查桌面导航策略')
class WindowsNavigationTests(unittest.TestCase):
    def run_policy(self, checks):
        result = subprocess.run(['node','-e', "const assert=require('node:assert/strict');const {safeURL,sameSite,allowedAuth}=require('./desktop/windows/policy.cjs');"+checks], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", timeout=15)
        self.assertEqual(result.returncode,0,result.stderr)

    def test_credentials_local_files_and_script_schemes_are_rejected(self):
        self.run_policy("for(const u of ['file:///C:/private.txt','javascript:alert(1)','https://user:secret@example.com/','not a url'])assert.equal(safeURL(u),null);assert.ok(safeURL('https://example.com/path'));assert.ok(safeURL('http://127.0.0.1:18000/'));")

    def test_cross_site_popups_cannot_hide_behind_a_similar_domain(self):
        self.run_policy("assert.ok(sameSite('https://cn.pornhub.com/','https://www.pornhub.com/video'));for(const u of ['https://pornhub.com.attacker.invalid/','https://notpornhub.com/','https://example.com/'])assert.equal(sameSite('https://cn.pornhub.com/',u),false);assert.ok(sameSite('https://spankbang.com/','https://www.spankbang.com/video'));")

    def test_authorization_stays_on_the_selected_providers_https_domains(self):
        self.run_policy("assert.ok(allowedAuth('https://passport.baidu.com/','baidu'));assert.ok(allowedAuth('https://auth.alipan.com/','aliyun'));for(const u of ['http://passport.baidu.com/','https://baidu.com.attacker.invalid/','file:///C:/secret','https://127.0.0.1/'])assert.equal(allowedAuth(u,'baidu'),false);assert.equal(allowedAuth('https://passport.baidu.com/','quark'),false);assert.equal(allowedAuth('https://api.oplist.org/','quark'),false);")
