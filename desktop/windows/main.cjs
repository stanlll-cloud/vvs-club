'use strict';
const {app, BrowserWindow, WebContentsView, ipcMain, shell, dialog, session} = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawn} = require('node:child_process');
const {pathToFileURL} = require('node:url');
const base = __dirname;
const uiURL = pathToFileURL(path.join(base, 'index.html')).href;
const sites = require('./assets/sites.json');
const rules = require('./assets/adblock-rules.json');
const {safeURL,sameSite,allowedAuth} = require('./policy.cjs');
let win, active, mode = 'home', mediaURL, cloudInfo, auth, bridgeView, profile, profileError, undoDeleted;
let dark = false, ads = true, notice = '';
const pages = new Map(), workers = new Map(), wired = new WeakSet();
const html = file => pathToFileURL(path.join(base, file)).href;
function saveProfile(next) {
  if (profileError) throw Error(profileError);
  const file = path.join(app.getPath('userData'), 'preferences.json');
  fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.writeFileSync(file+'.tmp', JSON.stringify(next), {mode:0o600}); fs.renameSync(file+'.tmp', file); profile = next;
}
function loadProfile() {
  const file = path.join(app.getPath('userData'), 'preferences.json');
  profile = {dark:false,ads:true,bookmarks:[]};
  if (fs.existsSync(file)) {
    try {
      const saved = JSON.parse(fs.readFileSync(file,'utf8'));
      if (!Array.isArray(saved.bookmarks) || saved.bookmarks.some(x => !x || typeof x.id !== 'string' || typeof x.title !== 'string')) throw Error();
      profile = saved;
    } catch { profileError = '设置文件未能读取，原文件已保留。'; }
  }
  dark = !!profile.dark; ads = profile.ads !== false;
}
function emit() {
  if (!win || win.isDestroyed()) return;
  const wc = active?.webContents;
  win.webContents.send('club:state', {sites,mode,dark,ads,notice:profileError||notice,
    title:wc&&!wc.isDestroyed()?wc.getTitle():'你的影片空间', url:wc&&!wc.isDestroyed()?wc.getURL():'',
    back:wc&&!wc.isDestroyed()?wc.navigationHistory.canGoBack():false, forward:wc&&!wc.isDestroyed()?wc.navigationHistory.canGoForward():false,
    bookmarks:profile.bookmarks,undo:!!undoDeleted});
}
function layout() {
  if (!win || win.isDestroyed()) return;
  const [width,height] = win.getContentSize();
  if (active) active.setBounds(mode==='library'?{x:0,y:48,width,height:Math.max(0,height-48)}:{x:280,y:94,width:Math.max(0,width-296),height:Math.max(0,height-110)});
}
function attach(view, nextMode) {
  if (active && active !== view) win.contentView.removeChildView(active);
  active = view; mode = nextMode; if (view) win.contentView.addChildView(view); layout(); emit();
}
function reset() {
  if (active) win.contentView.removeChildView(active); active = null;
  for (const view of pages.values()) { view.webContents.stop(); view.webContents.close(); }
  pages.clear(); notice=''; mode='home'; emit();
}
function configureOnline(sess) {
  if (wired.has(sess)) return; wired.add(sess);
  const blockers = rules.filter(r=>r.action.type==='block').map(r=>new RegExp(r.trigger['url-filter'],'i'));
  sess.setPermissionRequestHandler((_wc,permission,callback)=>callback(permission==='fullscreen'));
  sess.setPermissionCheckHandler((_wc,permission)=>permission==='fullscreen');
  sess.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']},(details,callback)=>{
    const url = safeURL(details.url);
    if (url && (url.hostname==='challenges.cloudflare.com'||url.hostname.endsWith('.challenges.cloudflare.com'))) return callback({cancel:false});
    callback({cancel:ads && blockers.some(rule=>rule.test(details.url))});
  });
}
function newView(kind, partition) {
  const view = new WebContentsView({webPreferences:{partition, sandbox:true,contextIsolation:true,nodeIntegration:false,webSecurity:true, ...(kind==='cloud'?{preload:path.join(base,'cloud-preload.cjs')}: {})}});
  const wc = view.webContents;
  wc.setWindowOpenHandler(({url})=>{ if (safeURL(url) && sameSite(wc.getURL(),url)) wc.loadURL(url).catch(()=>{}); return {action:'deny'}; });
  wc.on('will-navigate',(event,url)=>{if (!safeURL(url)) event.preventDefault();});
  wc.on('will-redirect',(event,url)=>{if (!safeURL(url)) event.preventDefault();});
  wc.on('page-title-updated',emit); wc.on('did-navigate',emit); wc.on('did-navigate-in-page',emit);
  wc.on('did-fail-load',(_e,code,_desc,_url,isMain)=>{if(code!==-3&&isMain&&view===active){notice='页面未能加载，可刷新重试。';emit();}});
  wc.on('did-finish-load',async()=>{
    if (kind==='online') {
      if (wc._clubCSS) { await wc.removeInsertedCSS(wc._clubCSS).catch(()=>{}); wc._clubCSS=null; }
      if (ads) {
        const host=safeURL(wc.getURL())?.hostname||'';
        const selectors=rules.filter(r=>r.action.type==='css-display-none'&&(!r.trigger['if-domain']||r.trigger['if-domain'].some(d=>{d=d.replace(/^\*/,'');return host===d||host.endsWith('.'+d)}))).map(r=>r.action.selector).join(',');
        if(selectors) wc._clubCSS=await wc.insertCSS(selectors+' {display:none!important}',{cssOrigin:'user'}).catch(()=>null);
      }
    }
    if(kind==='library') await wc.executeJavaScript(`document.documentElement.classList.add('vvs-club-glass');document.documentElement.classList.toggle('dark',${dark});document.documentElement.dataset.theme='${dark?'dark':'light'}'`).catch(()=>{});
    if(kind==='cloud') await wc.executeJavaScript(`window.setClubTheme?.(${dark})`).catch(()=>{});
    emit();
  });
  return view;
}
async function site(index) {
  if (!Number.isInteger(index)||!sites[index]) throw Error('站点不存在');
  let view=pages.get('site:'+index);
  if(!view){view=newView('online','persist:online');configureOnline(view.webContents.session);pages.set('site:'+index,view);view.webContents.loadURL(sites[index].url).catch(()=>{});}
  notice='';attach(view,'online');
}
function startWorker(kind) {
  if(workers.has(kind)) return workers.get(kind).promise;
  let command,args;
  const data=app.getPath('userData');
  if(app.isPackaged){command=path.join(process.resourcesPath,'backend','vvs-service.exe');args=[kind==='cloud'?'--cloud':'--media'];}
  else {command=process.platform==='win32'?path.resolve(base,'../../.venv/Scripts/python.exe'):path.resolve(base,'../../.venv/bin/python');args=[path.join(base,'backend.py'),kind==='cloud'?'--cloud':'--media'];}
  if(kind==='cloud')args.push('--binary',app.isPackaged?path.join(process.resourcesPath,'openlist.exe'):path.resolve(base,'../../build/vvs-windows-dependencies/openlist.exe'),'--data',path.join(data,'cloud'));
  const child=spawn(command,args,{windowsHide:true,env:{...process.env,VVS_DATA_ROOT:data,PYTHONUTF8:'1',PYTHONIOENCODING:'utf-8'},stdio:['ignore','pipe','ignore']});
  let buffer='',done=false,resolve,reject;
  const promise=new Promise((a,b)=>{resolve=a;reject=b});
  const timer=setTimeout(()=>{if(!done){done=true;reject(Error('本机组件启动超时，请重启软件。'));}},100000);
  child.stdout.on('data',chunk=>{buffer+=chunk.toString();let newline;while((newline=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,newline).trim();buffer=buffer.slice(newline+1);
    if(line.startsWith('VVS_CLOUD_READY=')){try{const value=JSON.parse(line.slice(16));const u=safeURL(value.url);if(!u||u.hostname!=='127.0.0.1'||typeof value.capability!=='string')throw Error();cloudInfo=value;done=true;clearTimeout(timer);resolve(value);}catch{done=true;clearTimeout(timer);reject(Error('网盘组件返回异常'));}}
    else if(line.startsWith('VVS_READY=')){const raw=line.slice(10),u=safeURL(raw);if(u&&u.hostname==='127.0.0.1'){mediaURL=raw;done=true;clearTimeout(timer);resolve(raw);}}
    else if(line.startsWith('VVS_ERROR=')||line.startsWith('VVS_CLOUD_ERROR=')){done=true;clearTimeout(timer);reject(Error('本机组件未能启动，请查看本机日志。'));}
  }});
  child.on('error',()=>{done=true;clearTimeout(timer);reject(Error('本机组件缺失，请重新安装完整版本。'));workers.delete(kind);});
  child.on('exit',()=>{clearTimeout(timer);if(!done)reject(Error('本机组件已退出'));workers.delete(kind);});
  workers.set(kind,{child,promise});return promise;
}
async function library(route='/') {
  notice='正在准备本地媒体库…';emit();const url=await startWorker('media');
  let view=pages.get('library');if(!view){view=newView('library','persist:library');pages.set('library',view);}
  attach(view,'library');await view.webContents.loadURL(url+route);notice='';emit();
}
async function clouds() {
  notice='正在准备网盘连接…';emit();const info=await startWorker('cloud');
  if(!bridgeView){bridgeView=newView('cloud','persist:cloud-ui');await bridgeView.webContents.loadURL(info.url+'#cap='+encodeURIComponent(info.capability));}
  notice='';attach(bridgeView,'cloud');
}
async function cloudCall(endpoint,data) {
  if(!cloudInfo)throw Error('网盘组件未就绪');
  const response=await fetch(cloudInfo.url+endpoint,{method:data?'POST':'GET',headers:{'X-VVS-Capability':cloudInfo.capability,'Content-Type':'application/json'},body:data?JSON.stringify(data):undefined,signal:AbortSignal.timeout(90000)});
  const value=await response.json();if(!response.ok)throw Error(value.error||'连接失败');return value;
}
const driver={baidu:'baiduyun_go',aliyun:'alicloud_go','115':'115cloud_go',quark:'quark_cookie',terabox:'terabox_cookie'};
function authState(message,busy=false) { if(auth&&!auth.window.isDestroyed())auth.window.webContents.send('club:auth-state',{provider:auth.provider,cookie:['quark','terabox'].includes(auth.provider),message,busy}); }
async function connect(tokens) {
  if(!auth||auth.busy)return;auth.busy=true;const flow=auth;authState('正在验证云端文件列表…',true);
  try {await cloudCall('/api/connect',{provider:flow.provider,tokens});if(auth!==flow)return;flow.window.close();if(bridgeView)await bridgeView.webContents.executeJavaScript(`window.cloudConnected?.(${JSON.stringify(flow.provider)})`);}
  catch {if(auth===flow){flow.busy=false;authState('已取得登录返回，但目录验证失败。可保持窗口重新尝试。');}}
}
async function confirmCookie(automatic=false) {
  if(!auth||auth.busy)return;const flow=auth;
  const domains=flow.provider==='quark'?['quark.cn']:['terabox.com','1024terabox.com','dubox.com'];
  const cookies=(await flow.view.webContents.session.cookies.get({})).filter(c=>domains.some(d=>c.domain.replace(/^\./,'')===d||c.domain.endsWith('.'+d))&&!/[\r\n]/.test(c.name+c.value));
  const required=flow.provider==='quark'?'__puus':'ndus';
  if(!cookies.some(c=>c.name===required&&c.value)){if(!automatic)authState('尚未取得登录状态，请先在官网完成登录。');return;}
  if(automatic){if(flow.attempted)return;flow.attempted=true;}
  await connect({driver_txt:driver[flow.provider],cookie:cookies.map(c=>c.name+'='+c.value).join('; ')});
}
function oauthRequest(flow) {
  const prefix={baidu:'baiduyun',aliyun:'alicloud','115':'115cloud'}[flow.provider];
  const url=new URL('https://api.oplist.org/'+prefix+'/requests');
  for(const [k,v] of Object.entries({driver_txt:driver[flow.provider],server_use:'true',client_uid:'',client_key:'',secret_key:''}))url.searchParams.set(k,v);
  flow.view.webContents.loadURL(url.href).catch(()=>authState('授权页未能打开，请检查网络后重试。'));
}
function beginAuth(provider) {
  if(auth){auth.window.focus();return;}if(!driver[provider])throw Error('未知网盘');
  const authWindow=new BrowserWindow({width:1000,height:820,parent:win,autoHideMenuBar:true,title:'网盘登录授权',webPreferences:{preload:path.join(base,'auth-preload.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false}});
  const view=new WebContentsView({webPreferences:{partition:'auth-'+crypto.randomUUID(),sandbox:true,contextIsolation:true,nodeIntegration:false}});
  auth={provider,window:authWindow,view,busy:false};const flow=auth;
  authWindow.contentView.addChildView(view);
  const bounds=()=>{const [width,height]=authWindow.getContentSize();view.setBounds({x:0,y:64,width,height:Math.max(0,height-64)});};bounds();authWindow.on('resize',bounds);
  authWindow.webContents.on('will-navigate',e=>e.preventDefault());authWindow.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  authWindow.webContents.on('did-finish-load',()=>authState('请手动完成官网登录、验证码与授权。'));
  authWindow.loadFile(path.join(base,'auth.html'));
  view.webContents.session.setPermissionRequestHandler((_wc,_permission,cb)=>cb(false));
  const navigate=(event,raw)=>{
    if(!allowedAuth(raw,provider)){event.preventDefault();return;}
    const u=new URL(raw);
    if(u.hostname==='api.oplist.org'&&u.pathname==='/'&&u.hash.length>1){event.preventDefault();try{if(u.hash.length>90000)throw Error();const tokens=JSON.parse(Buffer.from(decodeURIComponent(u.hash.slice(1)),'base64').toString('utf8'));if(tokens.driver_txt!==driver[provider]||typeof tokens.refresh_token!=='string')throw Error();connect(tokens);}catch{authState('授权返回格式不正确，请重新登录。');}}
  };
  view.webContents.on('will-navigate',navigate);view.webContents.on('will-redirect',navigate);
  view.webContents.setWindowOpenHandler(({url})=>{if(allowedAuth(url,provider))view.webContents.loadURL(url).catch(()=>{});return {action:'deny'};});
  view.webContents.on('did-finish-load',async()=>{
    if(auth!==flow)return;const u=new URL(view.webContents.getURL());
    if(u.hostname==='api.oplist.org'&&u.pathname.endsWith('/requests')){
      try {const result=JSON.parse(await view.webContents.executeJavaScript('document.body.innerText'));if(!allowedAuth(result.text,provider))throw Error();await view.webContents.loadURL(result.text);}catch{authState('授权服务未返回可用登录页，请稍后重试。');}
    }
  });
  const cookie=['quark','terabox'].includes(provider);
  let timer;if(cookie){view.webContents.loadURL(provider==='quark'?'https://pan.quark.cn':'https://www.terabox.com').catch(()=>{});timer=setInterval(()=>confirmCookie(true).catch(()=>{}),2000);}else oauthRequest(flow);
  authWindow.on('closed',()=>{clearInterval(timer);view.webContents.close();if(auth===flow)auth=null;});
}
ipcMain.on('club:auth',(event,action)=>{if(!auth||event.sender!==auth.window.webContents||event.senderFrame?.url!==html('auth.html'))return;if(action==='confirm'&&['quark','terabox'].includes(auth.provider))confirmCookie().catch(()=>{});else if(action==='baidu'&&auth.provider==='baidu')auth.view.webContents.loadURL('https://pan.baidu.com/').catch(()=>{});else if(action==='oauth'&&auth.provider==='baidu')oauthRequest(auth);});
ipcMain.on('club:cloud',async(event,message)=>{
  if(!bridgeView||event.sender!==bridgeView.webContents||!cloudInfo||new URL(event.senderFrame?.url||'about:blank').origin!==new URL(cloudInfo.url).origin||!message||typeof message!=='object')return;
  try {
    if(message.action==='login'&&driver[message.provider])beginAuth(message.provider);
    else if(message.action==='photos'&&message.provider==='terabox')shell.openExternal('https://1024terabox.com/s/1Ki8slu-MJrb6yMkz93kFMg');
    else if(message.action==='mounted'){notice='可在媒体库设置中添加已同步或挂载的网盘目录。';emit();}
    else if(message.action==='import'&&driver[message.provider]){const expected=path.join(app.getPath('userData'),'cloud','index',message.provider);if(path.resolve(message.path)!==path.resolve(expected))return;await library('/configuration?vvs_folder='+encodeURIComponent(expected)+'&vvs_cloud=1&vvs_source='+encodeURIComponent(message.provider)+'&vvs_library='+encodeURIComponent(message.provider+' 网盘'));}
  }catch{notice='操作暂未完成，请重试。';emit();}
});
function descendants(id) {const ids=new Set([id]);let before;do{before=ids.size;for(const b of profile.bookmarks)if(ids.has(b.parent))ids.add(b.id);}while(before!==ids.size);return ids;}
function moveBookmark(id,parent,index) {
  const node=profile.bookmarks.find(b=>b.id===id);if(!node)throw Error('书签不存在');
  if(parent && (!profile.bookmarks.some(b=>b.id===parent&&!b.url)||descendants(id).has(parent)))throw Error('不能移入自身或子文件夹');
  let list=profile.bookmarks.filter(b=>b.id!==id),siblings=list.filter(b=>b.parent===parent);
  const old=profile.bookmarks.filter(b=>b.parent===parent).findIndex(b=>b.id===id);
  let position=Number.isInteger(index)?index:siblings.length;
  if(Number.isInteger(index)&&node.parent===parent&&old>=0&&old<index)position--;
  position=Math.max(0,Math.min(position,siblings.length));
  const target=position<siblings.length?list.findIndex(b=>b.id===siblings[position].id):list.length;
  list.splice(target,0,{...node,parent});saveProfile({...profile,bookmarks:list});
}
ipcMain.handle('club:request',async(event,action,data={})=>{
  if(event.sender!==win.webContents||event.senderFrame?.url!==uiURL)throw Error('无权限');
  try {
    if(action==='state') {emit();return;}
    if(action==='site')await site(data.index);
    else if(action==='home')reset();
    else if(action==='library')await library();
    else if(action==='cloud')await clouds();
    else if(action==='local'){const choice=await dialog.showOpenDialog(win,{properties:['openDirectory']});if(!choice.canceled)await library('/configuration?vvs_folder='+encodeURIComponent(choice.filePaths[0])+'&vvs_source=local&vvs_library='+encodeURIComponent('本地影片'));}
    else if(action==='bookmarks'){attach(null,'bookmarks');}
    else if(action==='back'&&active?.webContents.navigationHistory.canGoBack())active.webContents.navigationHistory.goBack();
    else if(action==='forward'&&active?.webContents.navigationHistory.canGoForward())active.webContents.navigationHistory.goForward();
    else if(action==='reload')active?.webContents.reload();
    else if(action==='external'){const u=safeURL(active?.webContents.getURL());if(u)await shell.openExternal(u.href);}
    else if(action==='sponsor')await shell.openExternal('https://justmysocks.net/members/aff.php?aff=39372');
    else if(action==='theme'){dark=!dark;saveProfile({...profile,dark});if(mode==='library')active?.webContents.executeJavaScript(`document.documentElement.classList.toggle('dark',${dark})`);if(mode==='cloud')active?.webContents.executeJavaScript(`window.setClubTheme?.(${dark})`);}
    else if(action==='ads'){ads=!ads;saveProfile({...profile,ads});for(const [key,view] of pages)if(key.startsWith('site:')){if(view===active)view.webContents.reload();else {view.webContents.close();pages.delete(key);}}}
    else if(action==='star'&&mode==='online'){const url=safeURL(active?.webContents.getURL());if(!url)throw Error('当前网址无法收藏');if(!profile.bookmarks.some(b=>b.url===url.href))saveProfile({...profile,bookmarks:[...profile.bookmarks,{id:crypto.randomUUID(),parent:null,title:(active.webContents.getTitle()||url.hostname).slice(0,300),url:url.href}]});notice='已收藏到书签栏';}
    else if(action==='bookmark-open'){const b=profile.bookmarks.find(x=>x.id===data.id);if(b?.url&&safeURL(b.url)){const key='bookmark:'+b.id;let view=pages.get(key);if(!view){view=newView('online','persist:online');configureOnline(view.webContents.session);pages.set(key,view);view.webContents.loadURL(b.url).catch(()=>{});}attach(view,'online');}}
    else if(action==='folder'){const title=String(data.title||'').trim().slice(0,300);if(!title)throw Error('请输入文件夹名称');if(data.parent&&!profile.bookmarks.some(b=>b.id===data.parent&&!b.url))throw Error('父文件夹不存在');saveProfile({...profile,bookmarks:[...profile.bookmarks,{id:crypto.randomUUID(),parent:data.parent||null,title,url:null}]});}
    else if(action==='bookmark-edit'){const b=profile.bookmarks.find(x=>x.id===data.id);if(!b)throw Error('书签不存在');const title=String(data.title||'').trim().slice(0,300);if(!title)throw Error('名称不能为空');if(b.url&&!safeURL(data.url))throw Error('请输入有效网页地址');saveProfile({...profile,bookmarks:profile.bookmarks.map(x=>x.id===b.id?{...x,title,url:b.url?data.url:null}:x)});}
    else if(action==='bookmark-move')moveBookmark(data.id,data.parent||null,data.index);
    else if(action==='bookmark-delete'){const ids=descendants(data.id);undoDeleted=profile.bookmarks.filter(x=>ids.has(x.id));saveProfile({...profile,bookmarks:profile.bookmarks.filter(x=>!ids.has(x.id))});}
    else if(action==='bookmark-undo'&&undoDeleted){saveProfile({...profile,bookmarks:[...profile.bookmarks,...undoDeleted]});undoDeleted=null;}
    emit();return {ok:true};
  }catch(error){notice=error.message||'操作未完成';emit();return {ok:false,error:notice};}
});
app.setName('vvs-club');
const lock=app.requestSingleInstanceLock();if(!lock)app.quit();
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});
app.whenReady().then(()=>{
  loadProfile();win=new BrowserWindow({width:1320,height:900,minWidth:1000,minHeight:740,title:'vvs-club',autoHideMenuBar:true,icon:path.join(base,'assets','vvs-club.png'),backgroundColor:dark?'#080808':'#f5f5f7',webPreferences:{preload:path.join(base,'preload.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false,webSecurity:true}});
  win.webContents.on('will-navigate',event=>event.preventDefault());win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  win.webContents.session.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
  win.webContents.on('did-finish-load',emit);win.loadFile(path.join(base,'index.html'));win.on('resize',layout);
  win.on('closed',()=>{for(const view of pages.values())view.webContents.close();pages.clear();bridgeView?.webContents.close();bridgeView=null;win=null;});
});
app.on('window-all-closed',()=>app.quit());
app.on('before-quit',()=>{for(const {child} of workers.values()){if(process.platform==='win32')spawn('taskkill',['/pid',String(child.pid),'/t','/f'],{windowsHide:true});else child.kill();}});
