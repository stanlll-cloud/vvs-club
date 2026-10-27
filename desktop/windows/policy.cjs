'use strict';
const families = ['pornhub.com','xhamster.com','spankbang.com','pigav.com','javhdporn.net','missav.ai','jable.tv'];
function safeURL(raw) {
  try { const u = new URL(raw); return ['http:','https:'].includes(u.protocol) && !u.username && !u.password ? u : null; } catch { return null; }
}
function sameSite(a, b) {
  const x = safeURL(a), y = safeURL(b); if (!x || !y) return false;
  return x.hostname === y.hostname || families.some(root => [x.hostname,y.hostname].every(h => h === root || h.endsWith('.'+root)));
}
function allowedAuth(raw, provider) {
  try {
    const u = new URL(raw); if (raw==='about:blank') return true;
    if (u.protocol!=='https:' || u.username || u.password) return false;
    const domains = {baidu:['api.oplist.org','baidu.com'],aliyun:['api.oplist.org','alipan.com','aliyundrive.com','aliyun.com','taobao.com'], '115':['api.oplist.org','115.com'],quark:['quark.cn','uc.cn'],terabox:['terabox.com','terabox.app','1024terabox.com','dubox.com','accounts.google.com','facebook.com']}[provider]||[];
    return domains.some(d=>u.hostname===d||u.hostname.endsWith('.'+d));
  } catch { return false; }
}
module.exports = {safeURL,sameSite,allowedAuth};
