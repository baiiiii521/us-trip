// 离线缓存：第一次打开后，页面、脚本、样式、字体和看过的景点照片都会存下来，没网也能看。
// 页面和脚本：先读缓存，同时后台更新；图片字体：同样处理；接口（天气、汇率、云同步）不缓存。
const VERSION = 'hoops-v3-9';
const SHELL = VERSION + '-shell';
const MEDIA = VERSION + '-media';
// thumb.wikimedia.org 是维基 pageimages 现在返回的缩略图域名，漏了它照片在线有图、离线全没
const MEDIA_HOSTS = ['thumb.wikimedia.org', 'upload.wikimedia.org', 'fonts.gstatic.com', 'fonts.googleapis.com'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    try {
      const res = await fetch('./', { cache: 'reload' });
      const html = await res.clone().text();
      await cache.put('./', res);
      const urls = [...html.matchAll(/(?:src|href)="(\.?\/?[^"#?]+\.(?:js|css|svg|webmanifest|png))"/g)].map((m) => m[1]);
      await Promise.all(urls.map((u) => cache.add(new URL(u, self.registration.scope).href).catch(() => {})));
    } catch (err) { /* 离线安装失败时，之后边用边缓存 */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function swr(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req, { ignoreSearch: false });
  const net = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; }).catch(() => null);
  return hit || (await net) || Response.error();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (url.pathname.includes('/api/')) return; // 云同步不缓存
    if (req.mode === 'navigate') {
      e.respondWith((async () => {
        try { const res = await fetch(req); const c = await caches.open(SHELL); c.put('./', res.clone()); return res; }
        catch (err) { return (await caches.match('./', { ignoreSearch: true })) || Response.error(); }
      })());
      return;
    }
    e.respondWith(swr(req, SHELL));
  } else if (MEDIA_HOSTS.includes(url.hostname)) {
    e.respondWith(swr(req, MEDIA));
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((cs) => (cs[0] ? cs[0].focus() : self.clients.openWindow('./'))));
});
