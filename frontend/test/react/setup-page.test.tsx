import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PICK_FOLDER_URL } from '../../src/configuration-endpoints';
import { SetupPage } from '../../src/react/pages/setup/setup-page';
import { SETUP_QUESTIONS_URL, SETUP_URL, type SetupDone, type SetupQuestions } from '../../src/react/pages/setup/setup-api';
import { RESTART_REDIRECT_MS } from '../../src/react/restart-redirect';
import { MEDIA_SOURCE_OPTIONS } from '../../src/core/media-sources';
import { buttonNamed, choose, click, mount, settle, switches, type } from './render';
import '../../src/copy-editor-core.js';

const questions = (over: Partial<SetupQuestions> = {}): SetupQuestions => ({
  windows: true,
  standalone: false,
  questions: [
    { key: 'data_root', label: '数据目录', help: ['Peach 数据库、缓存和设置文件都放在这里。'], default: 'C:\\peach-data',
      required: true, advanced: false, input: 'folder', prefix: '', suffix: '' },
    { key: 'media_dir', label: '媒体目录', help: ['选择存放视频和图片的现有文件夹。'], default: 'D:\\Videos',
      required: true, advanced: false, input: 'folders', prefix: '', suffix: '' },
    { key: 'host', label: '谁可以访问', help: [], default: '2', required: false, advanced: false, input: 'choice',
      prefix: '', suffix: '', options: [{ value: '2', label: '同一局域网的设备' }, { value: '1', label: '只有这台电脑' }] },
    { key: 'port', label: '端口', help: ['浏览器地址里冒号后面的数字，一般不用改。'], default: '8900',
      required: true, advanced: true, input: 'number', prefix: 'localhost:', suffix: '' },
    { key: 'mdns_name', label: '局域网访问地址', help: [], default: 'peach', required: true, advanced: true,
      input: 'text', prefix: 'https://', suffix: '.local', visible_when: { host: '2' } },
  ],
  media_sources: MEDIA_SOURCE_OPTIONS.map(([value, label]) => ({ value, label })),
  media_source_default: 'local',
  media_root: null,
  cloud: { help: '先在 CloudDrive 登录网盘并完成挂载。', link: { url: 'https://www.clouddrive2.com/help.html', label: '挂载帮助' },
    dependencies: [{ name: 'WinFsp', message: '未检测到 WinFsp。', download_url: 'https://winfsp.dev/rel/',
      download_label: '下载 WinFsp' }] },
  access_enabled: true,
  scan_now: true,
  history_guide: false,
  peach_proxy: { mode: 'environment', proxy_saved: false, needs_selection: false },
  docker: false,
  ...over,
});

const done = (over: Partial<SetupDone> = {}): SetupDone => ({
  url: 'http://127.0.0.1:8900/?onboarding=1', scan_requested: true, history_guide: false, standalone: false,
  redirect: null, facts: [{ term: '版本', value: '0.9.0' }, { term: '数据目录', value: 'C:\\peach-data' }], ...over,
});

type Reply = { status: number; body: unknown };
/** 按地址回话的假 fetch：同一地址可以排几次回话，最后一次一直重复。 */
function server(routes: Record<string, Reply | Reply[]>) {
  const queues = new Map(Object.entries(routes).map(([url, reply]) => [url, Array.isArray(reply) ? [...reply] : [reply]]));
  const fetcher = vi.fn(async (url: string, _init?: RequestInit) => {
    const queue = queues.get(url);
    if (!queue?.length) throw new Error(`没有为 ${url} 准备回话`);
    const reply = queue.length > 1 ? queue.shift()! : queue[0]!;
    return { ok: reply.status < 400, status: reply.status, json: async () => reply.body };
  });
  vi.stubGlobal('fetch', fetcher);
  const sent = (url: string, index = 0) =>
    JSON.parse(String(fetcher.mock.calls.filter(([called]) => called === url)[index]?.[1]?.body));
  return { fetcher, sent };
}

async function open(over: Partial<SetupQuestions> = {}, routes: Record<string, Reply | Reply[]> = {}) {
  const api = server({ [SETUP_QUESTIONS_URL]: { status: 200, body: questions(over) }, ...routes });
  const host = await mount(<SetupPage />);
  await settle();
  return { host, ...api };
}

const rows = (root: ParentNode) => [...root.querySelectorAll('[data-folder-row]')];
const paths = (root: ParentNode) => [...root.querySelectorAll<HTMLInputElement>('input[aria-label^="媒体目录 "]')];
const field = (root: ParentNode, key: string) => root.querySelector<HTMLInputElement>(`#f-${key}`);
const radio = (root: ParentNode, label: string) =>
  [...root.querySelectorAll('label')].find((node) => node.textContent?.trim() === label);
const advanced = (root: ParentNode) => [...root.querySelectorAll('summary')].find((node) => node.textContent === '高级设置');
const submitForm = async (root: ParentNode) => {
  for (let count = 0; count < 3 && !buttonNamed('完成设置', root); count++) {
    await click(buttonNamed('开始设置', root) || buttonNamed('继续', root));
    await settle();
  }
  await click(buttonNamed('完成设置', root)); await settle();
};
const chooseProcessing = async (root: ParentNode, option: string) => {
  const field = root.querySelector('[aria-label="我的媒体库 处理方式"]');
  await click(field?.matches('[aria-haspopup]') ? field : field?.querySelector('[aria-haspopup="listbox"]'));
  await click([...document.querySelectorAll('[role="option"]')].find(node => node.textContent?.startsWith(option)));
};
const alertsWith = (root: ParentNode, message: string) =>
  [...root.querySelectorAll('[role="alert"]')].filter((node) => node.textContent?.includes(message));
const occurrences = (root: HTMLElement, message: string) => (root.textContent ?? '').split(message).length - 1;

it('分步设置返回后保留目录，确认前不提交配置', async () => {
  const { host, fetcher } = await open();
  await click(buttonNamed('开始设置', host));
  await type(paths(host)[0], 'F:\\Library');
  await click(buttonNamed('继续', host));
  expect(host.querySelector('h1')?.textContent).toBe('哪些设备可以打开？');
  await click(buttonNamed('返回', host));
  expect(paths(host)[0]?.value).toBe('F:\\Library');
  expect(fetcher.mock.calls.filter(([url]) => url === SETUP_URL)).toHaveLength(0);
});

it('编辑草稿随步骤匹配场景标题、说明和操作文字', async () => {
  const { host } = await open();
  const core = (globalThis as unknown as { PeachCopyEditorCore: {
    applyDrafts(root: Node, edits: Record<string, string>, originals: WeakMap<Node, string>): void;
  } }).PeachCopyEditorCore;
  const originals = new WeakMap<Node, string>();
  const edits = {
    '收藏再多，也找得到。': '私人馆藏。',
    'vvs-club把分散的影片、资料和观看记录放在一起。': '整理你的收藏。',
    '开始设置': '开始整理', '继续': '下一步', '完成设置': '保存设置',
  };
  const apply = () => core.applyDrafts(host, edits, originals);
  const caption = () => [...host.querySelectorAll('[data-setup-scene-caption] p')].map(node => node.textContent);
  apply();
  expect(caption()).toEqual(['私人馆藏。', '整理你的收藏。']);
  await click(buttonNamed('开始整理', host));
  apply();
  expect(caption()).toEqual(['从一个文件夹开始。', '连接现有目录，扫描时不搬动原文件。']);
  await click(buttonNamed('下一步', host));
  apply();
  expect(caption()).toEqual(['换个屏幕，继续看。', '按选定的访问范围，在电脑或手机打开媒体库。']);
  await click(buttonNamed('下一步', host));
  apply();
  expect(caption()).toEqual(['影片空间，由你定。', '保存目录与访问设置，再决定是否立即扫描。']);
  expect(buttonNamed('保存设置', host)).not.toBeNull();
  for (let count = 0; count < 3; count++) { await click(buttonNamed('返回', host)); apply(); }
  expect(caption()).toEqual(['私人馆藏。', '整理你的收藏。']);
  expect(buttonNamed('开始整理', host)).not.toBeNull();
});

it('首启版本统计与错误诊断默认勾选，取消后共同关闭', async () => {
  const reporting = { usage: true, errors: true, available: false,
    fields: { usage: '版本与系统', errors: '异常链与错误码' }, notice: '不发送媒体信息' };
  const { host, sent } = await open({ remote_reporting: reporting, access_enabled: false },
    { [SETUP_URL]: { status: 200, body: done() } });
  const reportingSwitches = host.querySelectorAll<HTMLInputElement>('input[aria-label="发送版本统计与错误诊断（推荐）"]');
  expect(reportingSwitches).toHaveLength(1);
  expect(reportingSwitches[0]!.checked).toBe(true);
  await click(reportingSwitches[0]!);
  await submitForm(host);
  expect(sent(SETUP_URL).remote_reporting).toEqual({ usage: false, errors: false });
});

/** 这句错误在页面上只有一份，落在一个 `role="alert"` 里，并由框的 `aria-describedby` 指到。 */
function expectAnnounced(root: HTMLElement, input: Element | null | undefined, message: string) {
  const alerts = alertsWith(root, message);
  expect(alerts).toHaveLength(1);
  expect(occurrences(root, message)).toBe(1);
  const described = (input?.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
  expect(described.some((id) => document.getElementById(id)?.contains(alerts[0]!))).toBe(true);
  return alerts[0]!;
}

it('目录与访问范围直接显示，端口和局域网名称按需展开', async () => {
  const { host } = await open();
  expect(host.querySelector('h1')?.textContent).toBe('把收藏安放在vvs-club');
  expect(paths(host).map((input) => input.value)).toEqual(['']);
  expect(advanced(host)?.getAttribute('aria-expanded')).toBe('false');
  expect(field(host, 'port')?.value).toBe('8900');
  expect(host.textContent).toContain('localhost:');
  expect(host.textContent).toContain('完成设置后扫描媒体目录');
  // 「谁可以访问」是两段式单选，局域网在左边并且默认选中。
  const group = host.querySelector('[role="radiogroup"]')!;
  expect(group.closest('details')).toBeNull();
  expect([...group.querySelectorAll('input[type="radio"]')].map((input) => [
    (input as HTMLInputElement).value, (input as HTMLInputElement).checked])).toEqual([['2', true], ['1', false]]);
});

it('读取策略直接显示，新增文件夹沿用所属媒体库', async () => {
  const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
  expect(host.querySelector('[data-media-read-policy]')?.closest('details')).toBeNull();
  expect(host.querySelector('[data-library-head]')?.closest('details')).toBeNull();
  await click(buttonNamed('添加文件夹', host));
  await type(paths(host)[1], 'E:\\More');
  await submitForm(host);
  const body = sent(SETUP_URL);
  expect(body.media_dir[0].library_id).toBe(body.media_dir[1].library_id);
  expect(body.media_dir.map((row: { library: string }) => row.library)).toEqual(['我的媒体库', '我的媒体库']);
});

it('初次处理选择保存到媒体库，摘要与提交使用同一份选择', async () => {
  const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
  await chooseProcessing(host, '仅使用本地资料');
  const summary = host.querySelector('[aria-labelledby="setup-summary-title"]');
  expect(summary?.textContent).toContain('仅使用本地资料');
  await submitForm(host);
  expect(sent(SETUP_URL).media_dir[0].library_policy).toBe('local');
});

it('新增媒体库拥有独立名称与处理方式', async () => {
  const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
  await chooseProcessing(host, '仅使用本地资料');
  await click(buttonNamed('添加媒体库', host));
  await type(host.querySelector<HTMLInputElement>('input[aria-label="媒体库 2 名称"]'), '电影');
  await type(paths(host)[1], 'E:\\Films');
  await submitForm(host);
  const libraries = sent(SETUP_URL).media_dir;
  expect(libraries[0]).toMatchObject({ library: '我的媒体库', library_policy: 'local' });
  expect(libraries[1]).toMatchObject({ library: '电影', library_policy: 'auto' });
  expect(libraries[0].library_id).not.toBe(libraries[1].library_id);
});

it('自定义处理步骤随同库的全部目录提交', async () => {
  const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
  await click(buttonNamed('添加文件夹', host));
  await type(paths(host)[1], 'E:\\More');
  await chooseProcessing(host, '自定义');
  await click(radio(host, '联网补资料'));
  await submitForm(host);
  for (const row of sent(SETUP_URL).media_dir) {
    expect(row.library_policy).toBe('custom');
    expect(row.library_stages.split(',')).toEqual(['probe', 'cover', 'people', 'preview']);
  }
});

it('首次设置不提供浏览历史选项，并保留接口已有的显式选择', async () => {
  const { host, sent } = await open({ history_guide: true }, { [SETUP_URL]: { status: 200, body: done() } });
  expect(host.textContent).not.toContain('接下来导入浏览器历史记录');
  await submitForm(host);
  expect(sent(SETUP_URL).history_guide).toBe(true);
});

it('选「只有这台电脑」时局域网地址整项消失，也不随提交发出去', async () => {
  const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
  expect(field(host, 'mdns_name')).not.toBeNull();
  await click(radio(host, '只有这台电脑'));
  expect(field(host, 'mdns_name')).toBeNull();
  await submitForm(host);
  const body = sent(SETUP_URL);
  expect(body.host).toBe('1');
  expect('mdns_name' in body).toBe(false);
  expect(body.port).toBe('8900');
});

describe('访问密码', () => {
  it('切换访问范围保留已填写的密码，访问地址跟随表单值', async () => {
    const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
    await type(host.querySelector<HTMLInputElement>('#access-password'), 'secret-password');
    await type(host.querySelector<HTMLInputElement>('#access-confirm'), 'secret-password');
    await click(radio(host, '只有这台电脑'));
    expect(host.textContent).toContain('http://127.0.0.1:8900/');
    await click(radio(host, '同一局域网的设备'));
    expect(host.textContent).toContain('https://peach.local/');
    await submitForm(host);
    expect(sent(SETUP_URL)).toMatchObject({ access_password: 'secret-password', access_confirm: 'secret-password' });
  });
  it('开关初始按读题接口；关掉后两框收起，提交不带密码', async () => {
    const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
    expect(host.querySelector('#access-password')).not.toBeNull();
    await type(host.querySelector<HTMLInputElement>('#access-password'), 'secret-password');
    await click(switches(host)[0]);
    expect(host.querySelector('#access-password')).toBeNull();
    await submitForm(host);
    const body = sent(SETUP_URL);
    expect(body.access_enabled).toBe(false);
    expect('access_password' in body || 'access_confirm' in body).toBe(false);
  });

  it('只在本机访问时开关默认关着，打开后提交两次输入', async () => {
    const { host, sent } = await open({ access_enabled: false }, { [SETUP_URL]: { status: 200, body: done() } });
    expect(host.querySelector('#access-password')).toBeNull();
    await click(switches(host)[0]);
    await type(host.querySelector<HTMLInputElement>('#access-password'), 'correct-password');
    await type(host.querySelector<HTMLInputElement>('#access-confirm'), 'correct-password');
    await submitForm(host);
    expect(sent(SETUP_URL)).toMatchObject({
      access_enabled: true, access_password: 'correct-password', access_confirm: 'correct-password' });
  });
});

describe('Peach 代理', () => {
  const proxyMode = (host: ParentNode) => host.querySelector('[aria-labelledby="setup-proxy-title"] [aria-haspopup="listbox"]');

  it('跟随环境为初始值，自定义地址随设置提交，直连不携带隐藏地址', async () => {
    const { host, sent } = await open({}, { [SETUP_URL]: { status: 400, body: { error: '稍后重试' } } });
    expect(proxyMode(host)?.textContent).toContain('跟随环境');
    expect(host.querySelector('#setupProxyAddress')).toBeNull();
    await submitForm(host);
    expect(sent(SETUP_URL).peach_proxy).toEqual({ mode: 'environment', proxy: '' });
    await choose(proxyMode(host), '自定义');
    const address = host.querySelector<HTMLInputElement>('#setupProxyAddress');
    expect(address?.type).toBe('password');
    await type(address, 'socks5h://user:private@127.0.0.1:7890');
    await submitForm(host);
    expect(sent(SETUP_URL, 1).peach_proxy).toEqual({ mode: 'proxy', proxy: 'socks5h://user:private@127.0.0.1:7890' });
    await choose(proxyMode(host), '直连');
    expect(host.querySelector('#setupProxyAddress')).toBeNull();
    await submitForm(host);
    expect(sent(SETUP_URL, 2).peach_proxy).toEqual({ mode: 'direct', proxy: '' });
  });

  it('代理地址校验原位报错并保留输入', async () => {
    const message = '请填写带端口的 HTTP 或 SOCKS 代理地址';
    const { host } = await open({ peach_proxy: { mode: 'proxy', proxy_saved: true, needs_selection: false } },
      { [SETUP_URL]: { status: 400, body: { error: '有几项需要修改', errors: { peach_proxy: message } } } });
    const address = host.querySelector<HTMLInputElement>('#setupProxyAddress');
    expect(address?.placeholder).toBe('已保存，留空保留');
    await type(address, 'http://proxy.invalid');
    await submitForm(host);
    expect(address?.value).toBe('http://proxy.invalid');
    expectAnnounced(host, address, message);
    expect(document.activeElement).toBe(address);
  });

  it.each([true, false])('Docker 回环提示只适用于容器中的自定义回环地址：%s', async (docker) => {
    const { host } = await open({ docker });
    await choose(proxyMode(host), '自定义');
    const address = host.querySelector<HTMLInputElement>('#setupProxyAddress');
    await type(address, 'http://127.0.0.1:7890');
    expect(host.textContent?.includes('回环地址指向容器自身')).toBe(docker);
    await type(address, 'http://host.docker.internal:7890');
    expect(host.textContent).not.toContain('回环地址指向容器自身');
    await choose(proxyMode(host), '跟随环境');
    expect(host.textContent).not.toContain('回环地址指向容器自身');
  });
});

describe('媒体库', () => {
  it('稍后添加媒体库收起目录并跳过扫描，取消勾选保留已填路径', async () => {
    const { host, sent } = await open({ access_enabled: false }, { [SETUP_URL]: {
      status: 200, body: done({ skip_media: true, scan_requested: false }),
    } });
    await type(paths(host)[0], 'E:\\Films');
    await click(radio(host, '稍后添加媒体库'));
    expect(paths(host)).toHaveLength(0);
    expect(host.textContent).not.toContain('完成设置后扫描');
    expect(host.querySelector('[aria-labelledby="setup-summary-title"]')?.textContent).toContain('稍后添加');
    await click(radio(host, '稍后添加媒体库'));
    expect(paths(host)[0]?.value).toBe('E:\\Films');
    await click(radio(host, '稍后添加媒体库'));
    await submitForm(host);
    expect(sent(SETUP_URL)).toMatchObject({ media_dir: [], skip_media: true, scan_now: false });
    expect(host.textContent).toContain('可在「媒体库与入库」添加媒体目录并开始扫描。');
  });

  it('媒体库图标与来源色随同库的全部目录保存', async () => {
    const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
    await type(paths(host)[0], 'D:\\Videos');
    await click(host.querySelector('[aria-label="我的媒体库 图标"]'));
    await click(document.querySelector('[aria-label="电影"]'));
    await click(buttonNamed('应用', document));
    await click(host.querySelector('[aria-label="我的媒体库 来源色：无颜色"]'));
    await click(document.querySelector('[data-library-colors] [aria-label="翠绿"]'));
    await click(buttonNamed('添加文件夹', host));
    await type(paths(host)[1], 'E:\\More');
    await submitForm(host);
    expect(sent(SETUP_URL).media_dir).toMatchObject([
      { library_icon: 'film', library_color: 'emerald' }, { library_icon: 'film', library_color: 'emerald' },
    ]);
  });

  it('首次设置网盘时必须明确选择读取策略', async () => {
    const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
    await type(paths(host)[0], 'D:\\Videos');
    await choose(rows(host)[0]!.querySelector('[aria-haspopup="listbox"]'), 'OneDrive');
    const policy = rows(host)[0]!.querySelector('[data-media-read-policy] [aria-haspopup="listbox"]');
    expect(policy?.textContent).toContain('选择读取策略');
    await submitForm(host);
    expect(host.textContent).toContain('请选择媒体读取策略');
    await choose(policy, '正常读取');
    await submitForm(host);
    expect(sent(SETUP_URL).media_dir).toMatchObject([
      { path: 'D:\\Videos', location: 'onedrive', root: '', cost: 'free' },
    ]);
  });

  it('加一行、删一行，扫描说明跟着行数走，提交按行带上来源', async () => {
    const { host, sent } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
    await type(paths(host)[0], 'D:\\Videos');
    await click(buttonNamed('添加文件夹', host));
    expect(rows(host)).toHaveLength(2);
    expect(document.activeElement).toBe(paths(host)[1]);
    await type(paths(host)[1], 'E:\\More');
    expect(host.textContent).toContain('完成设置后扫描 2 个文件夹');
    await click(rows(host)[0]!.querySelector('button[aria-label="移除这个文件夹"]'));
    expect(paths(host).map((input) => input.value)).toEqual(['E:\\More']);
    expect(rows(host)[0]!.querySelector('button[aria-label="移除这个文件夹"]')).toBeNull();
    await submitForm(host);
    expect(sent(SETUP_URL).media_dir).toMatchObject([{ path: 'E:\\More', location: 'local', root: '', cost: 'free' }]);
  });

  it('选择文件夹让这台电脑弹对话框，选中的路径填回这一行', async () => {
    const { host, sent } = await open({}, { [PICK_FOLDER_URL]: { status: 200, body: { path: 'F:\\Picked' } } });
    await click(rows(host)[0]!.querySelector('button[aria-label="选择文件夹"]'));
    await settle();
    expect(sent(PICK_FOLDER_URL)).toEqual({ initial: '' });
    expect(paths(host)[0]!.value).toBe('F:\\Picked');
  });

  it('任一行选了云盘才出挂载说明与缺的软件', async () => {
    const { host } = await open();
    expect(host.textContent).not.toContain('挂载帮助');
    await choose(rows(host)[0]!.querySelector('[aria-haspopup="listbox"]'), 'CloudDrive · 115');
    expect(host.textContent).toContain('先在 CloudDrive 登录网盘并完成挂载。');
    expect(host.querySelector('a[href="https://winfsp.dev/rel/"]')?.textContent).toContain('下载 WinFsp');
    await choose(rows(host)[0]!.querySelector('[aria-haspopup="listbox"]'), '本地磁盘');
    expect(host.textContent).not.toContain('挂载帮助');
  });

  it('非 Windows 首启只填写媒体目录即可提交', async () => {
    const { host, sent } = await open({ windows: false,
      media_root: { label: '数据库中的路径前缀', placeholder: '自动配置' } },
    { [SETUP_URL]: { status: 200, body: done() } });
    expect(rows(host)[0]!.querySelector('input[placeholder="自动配置"]')).toBeNull();
    await type(paths(host)[0], '/media/movies');
    await submitForm(host);
    expect(sent(SETUP_URL).media_dir[0]).toMatchObject({ path: '/media/movies', root: '' });
  });
});

describe('填错时原位标错', () => {
  it('目录按行、高级设置里的错误把折叠展开，已填的都留着，焦点落到第一个错处', async () => {
    const { host } = await open({}, { [SETUP_URL]: { status: 400, body: {
      error: '有几项需要修改', errors: { media_dir: ['目录不存在：D:\\Nope'], port: '端口要是 1 到 65535 之间的整数' } } } });
    await type(paths(host)[0], 'D:\\Nope');
    await type(field(host, 'port'), '70000');
    await submitForm(host);
    await act(() => new Promise((done) => requestAnimationFrame(() => done(null))));
    expect(rows(host)[0]!.textContent).toContain('目录不存在：D:\\Nope');
    expect(paths(host)[0]!.getAttribute('aria-invalid')).toBe('true');
    expect(advanced(host)?.getAttribute('aria-expanded')).toBe('true');
    expect(field(host, 'port')?.value).toBe('70000');
    expect(field(host, 'port')?.getAttribute('aria-invalid')).toBe('true');
    expectAnnounced(host, paths(host)[0], '目录不存在：D:\\Nope');
    expectAnnounced(host, field(host, 'port'), '端口要是 1 到 65535 之间的整数');
    expect(document.activeElement).toBe(paths(host)[0]);
  });

  it('整表不成立的那一句写在目录区上方，不挂到某一行', async () => {
    const { host } = await open({}, { [SETUP_URL]: { status: 400, body: {
      error: '有几项需要修改', errors: { media_dir: ['请添加 1 到 100 个媒体目录'] } } } });
    await click(buttonNamed('添加文件夹', host));
    await submitForm(host);
    const [alert, ...more] = alertsWith(host, '请添加 1 到 100 个媒体目录');
    expect(alert).toBeDefined();
    expect(more).toHaveLength(0);
    expect(occurrences(host, '请添加 1 到 100 个媒体目录')).toBe(1);
    expect(rows(host).some((row) => row.contains(alert!))).toBe(false);
    expect(alert!.compareDocumentPosition(rows(host)[0]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(advanced(host)?.getAttribute('aria-expanded')).toBe('false');
  });

  it('密码的错误挂在密码框下，开关保持打开', async () => {
    const { host } = await open({}, { [SETUP_URL]: { status: 400, body: {
      error: '有几项需要修改', errors: { access_password: '两次输入的访问密码不一致' } } } });
    await type(host.querySelector<HTMLInputElement>('#access-password'), 'first-password');
    await submitForm(host);
    expect(switches(host)[0]!.checked).toBe(true);
    expect(host.querySelector('#access-password')?.getAttribute('aria-invalid')).toBe('true');
    expect(host.querySelector<HTMLInputElement>('#access-password')?.value).toBe('first-password');
    const first = expectAnnounced(host, host.querySelector('#access-password'), '两次输入的访问密码不一致');
    // 同一句错误再提交一次：提示换成新节点，读屏重新播报，页面上仍只有一份。
    await submitForm(host);
    const second = expectAnnounced(host, host.querySelector('#access-password'), '两次输入的访问密码不一致');
    expect(second).not.toBe(first);
  });
});

describe('完成态', () => {
  it('成功后同一页换成完成态：扫描说明、入口链接、运行信息默认收起', async () => {
    const { host } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
    await submitForm(host);
    expect(host.querySelector('h1')?.textContent).toBe('影片空间已经打开');
    expect(host.textContent).toContain('下一部，从这里找。');
    expect(host.textContent).toContain('扫描任务已排队，后台处理期间仍可浏览vvs-club。');
    const entry = [...host.querySelectorAll('a')].find((link) => link.textContent === '打开vvs-club');
    expect(entry?.getAttribute('href')).toBe('http://127.0.0.1:8900/?onboarding=1');
    expect(document.activeElement).toBe(entry);
    const facts = [...host.querySelectorAll('summary')].find((node) => node.textContent === '运行信息');
    expect(facts?.getAttribute('aria-expanded')).toBe('false');
    expect(document.title).toBe('vvs-club · 设置完成');
  });

  it('选了导入浏览器历史又没扫描时，入口换成导入历史', async () => {
    const { host } = await open({}, { [SETUP_URL]: { status: 200, body: done({
      url: 'http://127.0.0.1:8900/taste?onboarding=1', scan_requested: false, history_guide: true }) } });
    await submitForm(host);
    expect(host.textContent).toContain('稍后在配置页开始扫描媒体库。');
    const entry = [...host.querySelectorAll('a')].find((link) => link.textContent === '导入浏览器历史记录');
    expect(entry?.getAttribute('href')).toBe('http://127.0.0.1:8900/taste?onboarding=1');
  });

  it('独立包给了跳转地址：等满与配置页同一个时长再跳', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    const { host } = await open({}, { [SETUP_URL]: { status: 200, body: done({
      standalone: true, redirect: 'http://127.0.0.1:8900/?onboarding=1' }) } });
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await submitForm(host);
    await act(async () => { vi.advanceTimersByTime(RESTART_REDIRECT_MS - 1) });
    expect(assign).not.toHaveBeenCalled();
    await act(async () => { vi.advanceTimersByTime(1) });
    expect(assign).toHaveBeenCalledWith('http://127.0.0.1:8900/?onboarding=1');
  });

  it('源码部署不给跳转地址，页面不自己跳', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    const { host } = await open({}, { [SETUP_URL]: { status: 200, body: done() } });
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    await submitForm(host);
    await act(async () => { vi.advanceTimersByTime(RESTART_REDIRECT_MS * 2) });
    expect(assign).not.toHaveBeenCalled();
  });
});

it('别的设备打开时读题接口回 403，只说去哪里打开、不画表单', async () => {
  server({ [SETUP_QUESTIONS_URL]: { status: 403, body: { error: 'setup is loopback-only' } } });
  const host = await mount(<SetupPage />);
  await settle();
  expect(host.querySelector('form')).toBeNull();
  expect(host.querySelector('[role="alert"]')?.textContent).toBe('请在运行 Peach 的这台电脑上打开设置。');
});

it('读题失败时给原因和重试', async () => {
  const { fetcher } = server({ [SETUP_QUESTIONS_URL]: [
    { status: 500, body: { error: '服务出错了' } }, { status: 200, body: questions() }] });
  const host = await mount(<SetupPage />);
  await settle();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain('服务出错了');
  await click(buttonNamed('立即重试', host));
  await settle();
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(paths(host)).toHaveLength(1);
});
