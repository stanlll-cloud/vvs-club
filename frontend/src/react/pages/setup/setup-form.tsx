/* 首次设置表单。题目、默认值、显隐与随平台变化的文案来自 `GET /api/setup/questions`；
 * 分组标题、按钮与「完成设置后」那一组是页面骨架，写在这里。
 *
 * 提交走 `POST /api/setup`。400 的 `errors` 按题目 key 写回原位：媒体目录按行对齐，整表不成立
 * 的那一句放在目录区上方；高级设置里任一项出错就展开它；访问密码出错时开关保持打开。已填的
 * 内容都留在原地，焦点落到第一个标错的框。 */
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { RiFolderLine, RiSearchLine, RiPlayCircleLine } from '@remixicon/react';

import { Button } from '@/components/base/buttons/button';
import { IconButton } from '@/components/base/buttons/icon-button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Input } from '@/components/base/input/input';
import { Label } from '@/components/base/input/label';
import { Switch } from '@/components/base/switch/switch';
import { Select, SelectItem } from '@/components/base/select/select';

import { randomId } from '../../../core/random-id';
import { Note } from '../../components/note';
import { ConfigurationChoice, ConfigurationInput } from '../../components/configuration-fields';
import { busyProps } from '../../settings/busy-props';
import {
  FolderField, FolderFieldLine, FolderRow, FolderSearchIcon, isCloudSource, MediaReadPolicy, MediaReadPolicyHelp,
  SourceSelect, useFolderRows,
} from '../../settings/folder-rows';
import { LibraryIconPicker, libraryAutoChoice } from '../../settings/library-icon-picker';
import { AUTO_STAGES, LibraryColorPicker, PresetSelect, StageChooser, type Stage } from '../../settings/library-policy-settings';
import { PasswordPair } from '../../settings/password-pair';
import { isLoopbackProxy, ProxyAddressField, ProxyModeSelect } from '../../settings/peach-proxy-fields';
import { ReportingChoices } from '../../settings/remote-reporting-settings';
import { Disclosure, ErrorText, ExternalLink, Fact, FactList, Help, SourceMark } from '../../settings/section';
import { CardGroup, GroupTitle } from '../auth-card';
import {
  describeFailure, pickFolder, SetupRequestError, submitSetup,
  type SetupDone, type SetupErrors, type SetupFolder, type SetupQuestion, type SetupQuestions, type SetupSubmission,
} from './setup-api';
import { libraryFields, processingSummary } from './setup-processing';
import { SetupShell } from './setup-scene';

/** 这几项出错时「高级设置」自己展开：错在折叠里的框，人看不见。 */
const ADVANCED_KEYS = ['port', 'mdns_name'];

/** 媒体目录那一项的错误：与行数对得上就按行写回，否则是整表一句。 */
function folderErrors(value: SetupErrors[string], count: number): { rows: string[]; table: string } {
  if (Array.isArray(value)) {
    return value.length === count ? { rows: value, table: '' } : { rows: [], table: value.filter(Boolean).join(' ') };
  }
  return { rows: [], table: value ?? '' };
}

function scanLabel(paths: string[]): string {
  if (!paths.length) return '完成设置后扫描媒体目录';
  return `完成设置后扫描 ${paths.length} 个文件夹`;
}

const text = (value: SetupErrors[string]) => (Array.isArray(value) ? value.filter(Boolean).join(' ') : value ?? '');

export function SetupForm({ setup, onDone, onRestore }: { setup: SetupQuestions; onDone: (done: SetupDone) => void; onRestore?: () => void }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const stepTitle = useRef<HTMLHeadingElement>(null);
  const stepScroll = useRef<HTMLDivElement>(null);
  const move = (next: number) => { setDirection(next > step ? 1 : -1); setStep(next); };
  useEffect(() => {
    stepTitle.current?.focus({ preventScroll: true });
    stepScroll.current?.scrollTo({ top: 0 });
  }, [step]);
  const media = setup.questions.find((question) => question.input === 'folders');
  const dataRoot = setup.questions.find((question) => question.input === 'folder');
  const fields = setup.questions.filter((question) => question.input !== 'folders');
  const host = fields.find((question) => question.key === 'host');
  const others = fields.filter((question) => question.input !== 'folder' && question.key !== 'host');
  const sources = setup.media_sources.map(({ value, label }) => [value, label] as const);
  const firstLibrary = useRef<Partial<SetupFolder>>({ library_id: randomId(), library: '我的媒体库',
    library_icon: '', library_color: '', library_policy: 'auto' });
  const blank = (path = ''): SetupFolder => ({ path, location: setup.media_source_default, root: '', ...firstLibrary.current,
    cost: setup.media_source_default === 'local' ? 'free' : '' });
  const folders = useFolderRows<SetupFolder>({
    initial: () => {
      const params = new URLSearchParams(window.location.search);
      const selected = params.get('vvs_folder') || '';
      const row = blank(selected.startsWith('/') ? selected : '');
      if (selected.startsWith('/')) {
        row.library = params.get('vvs_library') || '本地影片';
        if (params.get('vvs_cloud') === '1') { row.location = ['baidu', 'aliyun', 'quark', 'terabox', '115'].includes(params.get('vvs_source') || '') ? params.get('vvs_source')! : 'mounted'; row.cost = 'metered'; }
      }
      return [row];
    }, blank: () => blank(), pickFolder, describe: describeFailure,
    focusAfterPick: true,
  });
  firstLibrary.current = libraryFields(folders.rows[0]);
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(fields.map((question) => [question.key, question.default])));
  const [pickingData, setPickingData] = useState(false);
  const [pickError, setPickError] = useState('');
  const [accessOn, setAccessOn] = useState(setup.access_enabled);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [scanNow, setScanNow] = useState(setup.scan_now);
  const [skipMedia, setSkipMedia] = useState(false);
  const [reporting, setReporting] = useState(setup.remote_reporting);
  const [proxyMode, setProxyMode] = useState(setup.peach_proxy?.mode ?? 'environment');
  const [proxyAddress, setProxyAddress] = useState('');
  const [errors, setErrors] = useState<SetupErrors>({});
  const [tableError, setTableError] = useState('');
  const [failure, setFailure] = useState('');
  const [busy, setBusy] = useState(false);
  const [requireReadPolicy, setRequireReadPolicy] = useState(false);
  // 每次因为错误要展开就换一个 key：折叠按初始状态展开，已填的值都在这一层的 state 里。
  const [advancedOpenings, setAdvancedOpenings] = useState(0);
  const form = useRef<HTMLFormElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  // 写回之后焦点交给第一个标错的框。错误在 await 之后才到，React 不在点击那一刻同步提交，
  // 所以等这一轮落到 DOM 上再找，不赌下一帧之前一定画完。
  const [errorRound, setErrorRound] = useState(0);
  useEffect(() => {
    if (errorRound) [...(form.current?.querySelectorAll<HTMLElement>('input[aria-invalid="true"]') ?? [])]
      .find(input => !input.closest('[hidden]'))?.focus();
  }, [errorRound]);
  // 写回的错误放进框下的提示：`role="alert"` 让读屏在它出现时播报一次，提示本身仍由
  // `aria-describedby` 挂在框上，文字在页面上只有这一份。`key` 跟着提交轮次换，同一句错误
  // 再提交一次也会重新播报。
  const announce = (message: string | undefined) =>
    message ? <span key={errorRound} role="alert">{message}</span> : undefined;

  const visible = (question: SetupQuestion) =>
    !question.visible_when || Object.entries(question.visible_when).every(([key, value]) => values[key] === value);
  const setValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    if (step < 3) {
      move(step + 1);
      return;
    }
    const missing = skipMedia ? -1 : folders.rows.findIndex((row) => !row.cost);
    if (missing >= 0) {
      setRequireReadPolicy(true);
      move(1);
      requestAnimationFrame(() => form.current?.querySelector<HTMLButtonElement>(`[data-media-read-policy="${missing}"] button`)?.focus());
      return;
    }
    setBusy(true);
    setFailure('');
    const submission: SetupSubmission = {
      media_dir: skipMedia ? [] : folders.rows.map(row => ({ ...row, library: row.library?.trim() || '未命名媒体库' })),
      skip_media: skipMedia, access_enabled: accessOn, scan_now: !skipMedia && scanNow,
      peach_proxy: { mode: proxyMode, proxy: proxyMode === 'proxy' ? proxyAddress : '' },
      ...(setup.history_guide ? { history_guide: true } : {}),
      ...(reporting ? { remote_reporting: { usage: reporting.usage, errors: reporting.errors } } : {}),
    };
    // 隐藏的题不提交，服务端按题目默认值补上。
    for (const question of fields) if (visible(question)) submission[question.key] = values[question.key] ?? '';
    if (accessOn) Object.assign(submission, { access_password: password, access_confirm: confirmation });
    try {
      onDone(await submitSetup(submission));
    } catch (cause) {
      if (cause instanceof SetupRequestError && cause.status === 400 && cause.errors) {
        const found = cause.errors;
        const { rows, table } = folderErrors(found.media_dir, folders.rows.length);
        folders.setErrors(rows);
        setTableError(table);
        setErrors(found);
        if (ADVANCED_KEYS.some((key) => found[key])) setAdvancedOpenings((count) => count + 1);
        if (found.access_password) setAccessOn(true);
        move(found.media_dir || (dataRoot && found[dataRoot.key]) ? 1 : 2);
        setErrorRound((count) => count + 1);
      } else {
        setFailure(describeFailure(cause));
      }
    } finally {
      setBusy(false);
    }
  };

  const field = (question: SetupQuestion) => {
    const error = text(errors[question.key]);
    const help = question.help.join('');
    if (question.input === 'choice') {
      return (
        <ConfigurationChoice key={question.key} id={`setup-${question.key}`} label={question.label}
          value={values[question.key] ?? question.default} onChange={(value) => setValue(question.key, value)}
          options={question.options ?? []} isInvalid={Boolean(error)}>
          {help ? <Help>{help}</Help> : null}
          {error ? <ErrorText key={errorRound}>{error}</ErrorText> : null}
        </ConfigurationChoice>
      );
    }
    return (
      <ConfigurationInput key={question.key} id={`f-${question.key}`} label={question.label} isRequired={question.required}
        inputMode={question.input === 'number' ? 'numeric' : undefined} autoComplete="off" spellCheck="false"
        value={values[question.key] ?? ''} onChange={(value) => setValue(question.key, value)}
        prefix={question.prefix} suffix={question.suffix}
        validationBehavior="aria" isInvalid={Boolean(error)} hint={announce(error) ?? (help || undefined)} />
    );
  };

  const pickDataRoot = async () => {
    if (!dataRoot || pickingData) return;
    setPickingData(true);
    setPickError('');
    try {
      const path = await pickFolder(values[dataRoot.key] ?? '');
      if (path) setValue(dataRoot.key, path);
    } catch (cause) {
      setPickError(describeFailure(cause));
    } finally {
      setPickingData(false);
    }
  };
  const dataRootError = dataRoot ? text(errors[dataRoot.key]) || pickError : '';

  const filled = folders.rows.map((row) => row.path.trim()).filter(Boolean);
  const cloud = folders.rows.some((row) => isCloudSource(row.location));
  const libraries = [...new Map(folders.rows.map(row => [row.library_id, row])).values()];
  const editLibrary = (row: SetupFolder, patch: Partial<SetupFolder>) => folders.rows.forEach((other, index) => {
    if (other.library_id === row.library_id) folders.edit(index, patch);
  });
  const lan = values.host === '2';
  const address = lan && !setup.standalone
    ? `https://${values.mdns_name || 'peach'}.local/`
    : `http://${lan ? `${values.mdns_name || 'peach'}.local` : '127.0.0.1'}:${values.port || '8900'}/`;
  return (
    <SetupShell step={step}>
    <form ref={form} noValidate onSubmit={(event) => void submit(event)} aria-labelledby="auth-card-title"
      data-setup-form-panel="">
      <div data-setup-top="">
        <div data-setup-progress="" role="img" aria-label={`首次设置，第 ${step + 1} 步，共 4 步`}>
          {[0, 1, 2, 3].map(index => <span key={index} data-active={index === step || undefined} data-complete={index < step || undefined} />)}
        </div>
        <span className="text-body-2-regular text-text-secondary">首次设置</span>
      </div>
      <div data-setup-step-scroll="" ref={stepScroll}>
      <div data-setup-step-content="" style={{ '--setup-direction': `${direction * 20}px` } as CSSProperties}>
        <header data-setup-step-heading="" key={step}>
          <h1 id="auth-card-title" data-copy-key={`setup.title.${step}`} ref={stepTitle} tabIndex={-1} className="text-title-1-semibold text-text-primary">
            {step === 0 ? '把收藏安放在vvs-club' : step === 1 ? '先选一个影片文件夹' : step === 2 ? '哪些设备可以打开？' : '检查设置，开启影片空间'}
          </h1>
          <p data-copy-key={`setup.description.${step}`} className="text-body-regular text-text-secondary">
            {step === 0 ? '连上媒体目录，按自己的方式找片、看片、留记录。' : step === 1 ? '选择本地或已挂载的目录；也可以暂时跳过。' : step === 2 ? '只在本机使用，或允许同一网络的设备访问。' : '保存后，vvs-club会按你选定的方式处理媒体库。'}
          </p>
        </header>
      <div hidden={step !== 0}>
        <ul data-setup-welcome-points="">
          <li><RiFolderLine /><div data-setup-welcome-copy=""><strong className="text-body-medium">文件有位置，收藏有条理</strong><p className="text-body-2-regular text-text-secondary">把硬盘与已挂载的网盘目录放进同一个媒体库。</p></div></li>
          <li><RiSearchLine /><div data-setup-welcome-copy=""><strong className="text-body-medium">记不清片名，也有线索</strong><p className="text-body-2-regular text-text-secondary">从人物、标签与收藏中缩小范围。</p></div></li>
          <li><RiPlayCircleLine /><div data-setup-welcome-copy=""><strong className="text-body-medium">找到以后，接着看</strong><p className="text-body-2-regular text-text-secondary">字幕、播放方式与外观由你选择。</p></div></li>
        </ul>
      </div>
      <div hidden={step !== 1}>
      {media ? (
        <CardGroup first labelledBy="setup-media-title">
          <GroupTitle id="setup-media-title">
            {media.label}
          </GroupTitle>
          <Checkbox isSelected={skipMedia} onChange={setSkipMedia}>稍后添加媒体库</Checkbox>
          {skipMedia ? <Help>完成设置后，可在「媒体库与入库」添加自己的媒体目录。</Help> : <>
          {tableError ? <ErrorText key={errorRound}>{tableError}</ErrorText> : null}
          <div role="group" aria-labelledby="setup-media-title" className="flex flex-col gap-3">
            {libraries.map(library => <div key={library.library_id} data-library-block="" data-setup-library-block="">
              <div data-library-head="">
                <LibraryIconPicker label={`${library.library || '未命名媒体库'} 图标`} value={library.library_icon || ''} kind={library.location}
                  onChange={library_icon => editLibrary(library, { library_icon })} />
                <Input className="w-full" aria-label={`${library.library || '未命名媒体库'} 名称`} placeholder="媒体库名称" maxLength={80}
                  value={library.library || ''} onChange={value => editLibrary(library, { library: value })} />
                <LibraryColorPicker id={library.library_id || ''} name={library.library || '未命名媒体库'} value={library.library_color || ''}
                  onChange={library_color => editLibrary(library, { library_color })} />
                <div data-setup-library-policy=""><PresetSelect name={library.library || '未命名媒体库'} value={library.library_policy || 'auto'}
                  onChange={library_policy => editLibrary(library, { library_policy,
                    library_stages: library_policy === 'custom' ? library.library_stages || AUTO_STAGES.join(',') : '' })} /></div>
              </div>
              {library.library_policy === 'custom' ? <StageChooser name={library.library || '未命名媒体库'}
                value={(library.library_stages?.split(',').filter(Boolean) ?? AUTO_STAGES) as Stage[]}
                onChange={value => editLibrary(library, { library_stages: value.join(',') })} /> : null}
              <div data-library-folders="" role="group" aria-label={`${library.library || '未命名媒体库'} 的文件夹`}>
            {folders.rows.map((row, index) => row.library_id === library.library_id ? (
              <FolderRow key={index} label={`${media.label} ${index + 1}`} path={row.path}
                onPath={(path) => folders.edit(index, { path })} error={announce(folders.errors[index])}
                inputRef={folders.inputRef(index)} picking={folders.picking === index}
                onPick={() => void folders.pick(index)}
                onRemove={folders.rows.length > 1 ? () => { folders.remove(index); addButton.current?.focus(); } : undefined}>
                <FolderFieldLine>
                  <SourceSelect index={index} value={row.location} options={sources}
                    onChange={(location) => folders.edit(index, { location, cost: location === 'local' ? 'free' : '' })} />
                  <MediaReadPolicy index={index} cost={row.cost ?? ''}
                    error={requireReadPolicy && !row.cost ? '请选择媒体读取策略' : undefined}
                    onChange={(cost) => folders.edit(index, { cost })} />
                  {libraries.length > 1 ? <FolderField label="移到媒体库" className="w-full @lg:w-60">
                    <Select className="w-full" aria-label={`目录所属媒体库 ${index + 1}`} selectedKey={row.library_id}
                      renderValue={<span className="flex min-w-0 items-center gap-2"><SourceMark mark={row.library_icon || libraryAutoChoice(row.location)[0]} /><span className="truncate">{row.library || '未命名媒体库'}</span></span>}
                      onSelectionChange={key => {
                        const other = folders.rows.find(value => value.library_id === key);
                        if (other) folders.edit(index, libraryFields(other));
                      }}>
                      {[...new Map(folders.rows.map(value => [value.library_id, value])).values()].map(value => (
                        <SelectItem key={value.library_id} id={value.library_id}>{value.library || '未命名媒体库'}</SelectItem>
                      ))}
                    </Select>
                  </FolderField> : null}
                </FolderFieldLine>
              </FolderRow>
            ) : null)}
              <div className="flex"><Button variant="secondary" data-copy-interact aria-label={`给 ${library.library || '未命名媒体库'} 添加文件夹`}
                onClick={() => { folders.add(); folders.edit(folders.rows.length,
                  { ...libraryFields(library), location: library.location, cost: library.cost }); }}>添加文件夹</Button></div>
              </div>
            </div>)}
          </div>
          <Button ref={addButton} variant="secondary" className="self-start" data-copy-interact onClick={() => {
            folders.add(); folders.edit(folders.rows.length, { library_id: randomId(), library: `媒体库 ${libraries.length + 1}`,
              library_icon: '', library_color: '', library_policy: 'auto', library_stages: undefined });
          }}>
            添加媒体库
          </Button>
          {cloud ? (
            <>
              <MediaReadPolicyHelp />
              <Help>{setup.cloud.help}<ExternalLink href={setup.cloud.link.url}>{setup.cloud.link.label}</ExternalLink></Help>
              {setup.cloud.dependencies.map((dependency) => (
                <Help key={dependency.name}>
                  {dependency.message}<ExternalLink href={dependency.download_url}>{dependency.download_label}</ExternalLink>
                </Help>
              ))}
            </>
          ) : null}
          {media.help.map((line) => <Help key={line}>{line}</Help>)}
          </>}
        </CardGroup>
      ) : null}

      {dataRoot ? (
        <CardGroup labelledBy="setup-data-title">
          <GroupTitle id="setup-data-title">
            {dataRoot.label}<span aria-hidden className="ml-0.5 text-text-error-primary">*</span>
          </GroupTitle>
          <div className="flex items-start gap-2">
            <Input className="min-w-0 flex-1" id={`f-${dataRoot.key}`} aria-label={dataRoot.label} isRequired
              autoComplete="off" spellCheck="false" value={values[dataRoot.key] ?? ''}
              onChange={(value) => setValue(dataRoot.key, value)}
              validationBehavior="aria" isInvalid={Boolean(dataRootError)} hint={announce(dataRootError)} />
            <IconButton icon={FolderSearchIcon} aria-label="选择数据目录" onClick={() => void pickDataRoot()}
              {...busyProps(pickingData)} />
          </div>
          {dataRoot.help.map((line) => <Help key={line}>{line}</Help>)}
        </CardGroup>
      ) : null}

      </div>
      <div hidden={step !== 2}>
      <CardGroup first labelledBy="auth-card-title">
        {host ? field(host) : null}
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Label id="setup-password-title" elementType="span">访问密码</Label>
            <p id="setup-access-description" className="text-body-2-regular text-text-secondary">开启后，访问 Peach 需要先登录。</p>
          </div>
          <Switch aria-labelledby="setup-password-title" aria-describedby="setup-access-description"
            isSelected={accessOn} onChange={setAccessOn} />
        </div>
        <Help>{lan ? '局域网访问推荐设置密码。未设置时，同一网络中能连接 Peach 的设备可直接进入。'
          : '只有这台电脑可以访问；设置密码后，打开 Peach 仍需登录。'}</Help>
        {accessOn
          ? <PasswordPair label="访问密码" password={password} confirmation={confirmation}
              onPassword={setPassword} onConfirmation={setConfirmation}
              passwordError={announce(text(errors.access_password))} passwordHint="请输入 8–256 个字符。"
              confirmationInvalid={Boolean(errors.access_password)} />
          : null}
      </CardGroup>

      <CardGroup labelledBy="setup-proxy-title">
        <GroupTitle id="setup-proxy-title">Peach 代理</GroupTitle>
        <Help>用于资料采集、封面和工具下载，可在配置页修改。</Help>
        <div className="flex flex-col items-start gap-1.5">
          <Label elementType="span" id="setup-proxy-mode-label">连接方式</Label>
          <ProxyModeSelect mode={proxyMode} onChange={setProxyMode} labelledBy="setup-proxy-mode-label" />
        </div>
        {proxyMode === 'proxy'
          ? <ProxyAddressField id="setupProxyAddress" value={proxyAddress} onChange={setProxyAddress}
              saved={setup.peach_proxy?.proxy_saved} error={announce(text(errors.peach_proxy))} />
          : errors.peach_proxy ? <ErrorText key={errorRound}>{text(errors.peach_proxy)}</ErrorText> : null}
        {setup.docker && proxyMode === 'proxy' && isLoopbackProxy(proxyAddress)
          ? <Note tone="warning" title="请填写容器可访问的代理地址">回环地址指向容器自身；宿主机代理需使用容器可访问的宿主机地址。</Note>
          : null}
        {setup.peach_proxy?.needs_selection
          ? <Note tone="warning" title="需要选择连接方式">已有来源的代理地址不同，请选择公共连接方式。</Note>
          : null}
      </CardGroup>

      <CardGroup>
        <Disclosure key={advancedOpenings} summary="高级设置" defaultOpen={advancedOpenings > 0}>
          <div className="flex flex-col gap-4">{others.filter(visible).map(field)}</div>
        </Disclosure>
        <Help><span className="break-all">访问地址：{address}</span></Help>
      </CardGroup>

      </div>
      <div hidden={step !== 3}>
      <CardGroup first labelledBy="setup-options-title">
        <GroupTitle id="setup-options-title">首次扫描</GroupTitle>
        {skipMedia ? <Help>添加媒体目录后，再选择处理方式并开始扫描。</Help> : <>
        <div className="flex flex-col gap-1.5">
          <Checkbox isSelected={scanNow} onChange={setScanNow}>{scanLabel(filled)}</Checkbox>
          <Help>{scanNow ? '扫描会在后台开始，期间可以进入 Peach。' : '先保存处理方式，稍后在「媒体库与入库」开始扫描。'}</Help>
        </div>
        {folders.rows.some(row => row.cost === 'metered')
          ? <Help>开启代理保护的目录不会自动读取视频信息或生成预览；播放时会读取视频。</Help>
          : null}
        </>}
      </CardGroup>

      {failure ? <ErrorText>{failure}</ErrorText> : null}
      {reporting ? <CardGroup>
        <GroupTitle>版本统计与错误诊断</GroupTitle>
        <ReportingChoices value={reporting} onChange={setReporting} />
        <Help>馆藏与口味明细上传默认关闭，可在「应用与维护」查看并选择。</Help>
      </CardGroup> : null}
      <CardGroup labelledBy="setup-summary-title">
        <GroupTitle id="setup-summary-title">确认设置</GroupTitle>
        <FactList>
          <Fact term="媒体目录">{skipMedia ? '稍后添加' : filled.length ? `${filled.length} 个文件夹 · ${libraries.length} 个媒体库` : '尚未填写'}</Fact>
          <Fact term="数据目录"><span className="break-all">{dataRoot ? values[dataRoot.key] || '尚未填写' : '未取得'}</span></Fact>
          <Fact term="访问范围">{lan ? '同一局域网的设备' : '只有这台电脑'} · {accessOn ? '使用访问密码' : '未设置访问密码'}</Fact>
          <Fact term="首次扫描">{!skipMedia && scanNow ? '完成设置后开始' : '稍后手动开始'}</Fact>
          {reporting ? <Fact term="诊断反馈">{reporting.usage || reporting.errors ? '已开启，可在上方调整' : '已关闭'}</Fact> : null}
          {!skipMedia ? libraries.map(row => <Fact key={row.library_id} term={row.library || '未命名媒体库'}>{processingSummary(row)}</Fact>) : null}
        </FactList>
      </CardGroup>
      </div>
      </div>
      </div>
      <footer data-setup-footer="" key={step} data-copy-interact>
        {step > 0 ? <Button variant="ghost" onClick={() => { if (!busy) move(step - 1); }} aria-disabled={busy || undefined}>返回</Button>
          : <Button variant="ghost" onClick={onRestore}>使用已有数据</Button>}
        <Button type="submit" {...busyProps(busy)}>{step === 0 ? '开始设置' : step === 3 ? '完成设置' : '继续'}</Button>
      </footer>
    </form>
    </SetupShell>
  );
}
