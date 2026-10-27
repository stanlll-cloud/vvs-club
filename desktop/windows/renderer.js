'use strict';
let state={bookmarks:[],sites:[]},folder=null,dragged=null,editing=null;
const el=id=>document.getElementById(id);
async function request(action,data={}) {try{return await window.club.request(action,data)}catch{el('notice').textContent='操作未完成，请重试。'}}
for(const button of document.querySelectorAll('[data-action]'))button.onclick=()=>request(button.dataset.action);
function button(title,action) {const b=document.createElement('button');b.textContent=title;b.onclick=action;return b;}
function startEditor(node=null,newFolder=false) {
  editing={node,newFolder};el('editor-title').textContent=newFolder?'新建文件夹':node.url?'编辑书签':'重命名文件夹';
  el('edit-name').value=node?.title||'';el('edit-url').value=node?.url||'';el('url-label').hidden=newFolder||!node?.url;el('edit-url').required=!el('url-label').hidden;el('editor').showModal();
}
el('editor').addEventListener('close',()=>{
  if(el('editor').returnValue!=='save')return;
  if(editing.newFolder)request('folder',{title:el('edit-name').value,parent:folder});
  else request('bookmark-edit',{id:editing.node.id,title:el('edit-name').value,url:el('edit-url').value});
});
el('new-folder').onclick=()=>startEditor(null,true);el('undo').onclick=()=>request('bookmark-undo');
function dropTarget(node,parent,index) {
  node.ondragover=e=>{e.preventDefault();node.classList.add('drop');};node.ondragleave=()=>node.classList.remove('drop');
  node.ondrop=e=>{e.preventDefault();e.stopPropagation();node.classList.remove('drop');if(!dragged)return;request('bookmark-move',{id:dragged,parent,index});dragged=null;};
}
function bookmarks() {
  const nodes=state.bookmarks;
  if(folder&&!nodes.some(b=>b.id===folder&&!b.url))folder=null;
  const nav=el('folders');nav.replaceChildren();const root=button('全部书签',()=>{folder=null;bookmarks()});dropTarget(root,null);nav.append(root);
  const visit=(parent,level)=>{for(const f of nodes.filter(b=>b.parent===parent&&!b.url)){
    const b=button('▸ '+f.title,()=>{folder=f.id;bookmarks()});b.style.paddingLeft=(10+level*14)+'px';b.classList.toggle('selected',folder===f.id);dropTarget(b,f.id);nav.append(b);if(level<30)visit(f.id,level+1);
  }};visit(null,0);
  let crumbs=[],cursor=folder,seen=new Set();while(cursor&&!seen.has(cursor)){seen.add(cursor);const b=nodes.find(x=>x.id===cursor);if(!b)break;crumbs.unshift(b.title);cursor=b.parent;}
  el('crumb').textContent=['书签栏',...crumbs].join(' / ');
  const list=el('bookmark-list');list.replaceChildren();const children=nodes.filter(b=>b.parent===folder);
  children.forEach((b,index)=>{
    const row=document.createElement('div');row.className='bookmark-row';row.draggable=true;row.ondragstart=e=>{dragged=b.id;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',b.id)};row.ondragend=()=>{dragged=null;};
    const label=document.createElement('div');label.className='label';const title=document.createElement('strong');title.textContent=(b.url?'☆ ':'▸ ')+b.title;label.append(title);if(b.url){const u=document.createElement('small');u.textContent=b.url;label.append(u)}row.append(label);
    const open=()=>{if(b.url)request('bookmark-open',{id:b.id});else {folder=b.id;bookmarks()}};row.ondblclick=open;
    row.append(button('打开',open),button('编辑',()=>startEditor(b)),button('删除',()=>{if(confirm('删除“'+b.title+'”？文件夹内的书签也会删除，可撤销。'))request('bookmark-delete',{id:b.id})}));
    row.ondragover=e=>{e.preventDefault();row.classList.add('drop')};row.ondragleave=()=>row.classList.remove('drop');
    row.ondrop=e=>{e.preventDefault();e.stopPropagation();row.classList.remove('drop');if(!dragged)return;const inside=!b.url&&e.clientY-row.getBoundingClientRect().top>10;request('bookmark-move',{id:dragged,parent:inside?b.id:folder,index:inside?undefined:index});dragged=null;};list.append(row);
  });
  if(!children.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='这里还没有书签。打开网站，点击顶部星形按钮即可收藏。';list.append(empty)}dropTarget(list,folder);el('undo').disabled=!state.undo;
}
window.club.onState(next=>{
  state=next;document.body.classList.toggle('dark',next.dark);document.body.classList.toggle('library',next.mode==='library');el('library-exit').hidden=next.mode!=='library';el('home').hidden=next.mode!=='home';el('bookmarks').hidden=next.mode!=='bookmarks';el('notice').textContent=next.notice||'';
  el('page-title').textContent=next.title||'你的影片空间';try{el('host').textContent=next.url?new URL(next.url).host:'选择左侧入口'}catch{el('host').textContent=''}
  el('back').disabled=!next.back;el('forward').disabled=!next.forward;
  for(const id of ['reload','external'])el(id).disabled=!['online','library','cloud'].includes(next.mode);
  for(const id of ['ads','star'])el(id).disabled=next.mode!=='online';el('ads').title=next.ads?'广告拦截已开启，点击关闭':'广告拦截已关闭，点击开启';el('star').textContent=next.bookmarks.some(b=>b.url===next.url)?'★':'☆';
  const sites=el('sites');sites.replaceChildren();next.sites.forEach((s,index)=>{const b=button('▷　 '+s.name,()=>request('site',{index}));b.classList.toggle('selected',next.url&&next.url.startsWith(s.url));sites.append(b)});
  for(const b of document.querySelectorAll('#navigation > button'))b.classList.toggle('selected',b.dataset.action===next.mode);
  if(next.mode==='bookmarks')bookmarks();
});
request('state');
