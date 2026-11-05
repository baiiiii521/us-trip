// 离线可用：注册 service worker（public/sw.js），记录“加到主屏幕”的安装提示。
let installEvent = null;
const listeners = new Set();
export const onPwaChange = (fn) => listeners.add(fn);
const emit = () => listeners.forEach((f) => f());

export function registerSW() {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e; emit(); });
  window.addEventListener('appinstalled', () => { installEvent = null; emit(); });
  navigator.serviceWorker.register('sw.js').then((reg) => {
    reg.addEventListener('updatefound', emit);
    navigator.serviceWorker.addEventListener('controllerchange', emit);
    emit();
  }).catch(() => { /* 预览环境或不支持时忽略 */ });
}

export function pwaStatus() {
  const supported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol);
  const standalone = typeof matchMedia === 'function' && (matchMedia('(display-mode: standalone)').matches || navigator.standalone === true);
  return { supported, ready: supported && !!navigator.serviceWorker.controller, canInstall: !!installEvent, standalone };
}

export async function promptInstall() {
  if (!installEvent) return false;
  installEvent.prompt();
  const r = await installEvent.userChoice.catch(() => null);
  installEvent = null; emit();
  return !!(r && r.outcome === 'accepted');
}

// 把所有景点照片提前下载进离线缓存
export async function warmUrls(urls, onProgress = () => {}) {
  let done = 0;
  for (const u of urls) {
    try { await fetch(u, { mode: 'no-cors' }); } catch (e) { /* 跳过 */ }
    onProgress(++done / urls.length);
  }
  return done;
}
