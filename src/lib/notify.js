// 提醒：开车前、开球前 60 分钟和 15 分钟各提醒一次。
// 浏览器的限制：只有页面开着（或已加到主屏幕并在后台存活）时才会准时弹出；iPhone 需要先“添加到主屏幕”。
let timers = [];

export function notifySupported() { return typeof window !== 'undefined' && 'Notification' in window; }
export function notifyPermission() { return notifySupported() ? Notification.permission : 'unsupported'; }

export async function askPermission() {
  if (!notifySupported()) return 'unsupported';
  try { return await Notification.requestPermission(); } catch (e) { return 'denied'; }
}

async function show(title, body) {
  try {
    const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
    if (reg) return reg.showNotification(title, { body, icon: 'icons/icon-192.png', tag: title });
    new Notification(title, { body });
  } catch (e) { /* 被系统拦截 */ }
}

// events: [{ at: Date, title, body }]
export function scheduleReminders(events, now = new Date()) {
  timers.forEach(clearTimeout); timers = [];
  if (notifyPermission() !== 'granted') return 0;
  let n = 0;
  for (const ev of events) {
    for (const before of [60, 15]) {
      const delay = ev.at - now - before * 60000;
      if (delay > 0 && delay < 24 * 3600000) {
        timers.push(setTimeout(() => show(`${before} 分钟后：${ev.title}`, ev.body), delay)); n++;
      }
    }
  }
  return n;
}
