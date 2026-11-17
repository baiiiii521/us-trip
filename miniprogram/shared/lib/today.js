// ⚠️ 生成文件，不要手改。源头：src/lib/today.js
// 由 scripts/mp-sync-shared.mjs 生成；改内容请改 src/ 下那份，然后跑 node scripts/mp-sync-shared.mjs
// “今天”模式：根据当前时间找出今天是行程第几天、正在做什么、下一项是什么。纯函数，可测试。
import { TRIP } from '../data/trip.js';

// 行程里的某天 → 本地日期
export function dayStart(day) {
  const [m, d] = day.md.split('/').map(Number);
  return new Date(Number(TRIP.start.slice(0, 4)), m - 1, d);
}

// “09:30”“10:55 落地”“02:30 叫车”→ 当天的 Date；“落地”“晚上”“+2h”这类没有具体时间的返回 null
export function itemTime(day, t) {
  const m = /^(\d{1,2}):(\d{2})(?!\d)/.exec(String(t || '').trim());
  if (!m) return null;
  const base = dayStart(day);
  base.setHours(Number(m[1]), Number(m[2]), 0, 0);
  // 01:30 这类凌晨时间算第二天
  if (Number(m[1]) < 5) base.setDate(base.getDate() + 1);
  return base;
}

export function findToday(days, now) {
  const year = Number(TRIP.start.slice(0, 4));
  const byDate = (t) => days.find((d) => {
    const [m, dd] = d.md.split('/').map(Number);
    return m === t.getMonth() + 1 && dd === t.getDate() && t.getFullYear() === year;
  }) || null;
  // 凌晨 0–5 点：前一天还有没做完的“凌晨”安排（例如 12/30 的 02:30 叫车），就仍算前一天
  if (now.getHours() < 5) {
    const prev = byDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
    if (prev && prev.items.some((it) => { const at = itemTime(prev, it.t); return at && at >= now && at.getDate() === now.getDate(); })) return prev;
  }
  return byDate(now);
}

// 当前项和下一项（只看有具体时间的条目）
export function nowAndNext(day, now) {
  const timed = day.items.map((it, i) => ({ it, i, at: itemTime(day, it.t) })).filter((x) => x.at);
  let current = null, next = null;
  for (const x of timed) {
    if (x.at <= now) current = x;
    else { next = x; break; }
  }
  // 现在和下一项之间没写具体时间的安排（“落地”“午后”），按顺序列出来，免得看漏
  const from = current ? current.i + 1 : 0, to = next ? next.i : day.items.length;
  const between = current ? day.items.slice(from, to).filter((it) => !itemTime(day, it.t)) : [];
  return { current, next, between, minutes: next ? Math.round((next.at - now) / 60000) : null };
}

// 今天需要准点的事，用于提醒：城际交通、球赛、取车、航班（起飞、叫车去机场、到柜台）
const FLIGHT_RE = /起飞|叫车|到柜台/;
export function keyEvents(day) {
  return day.items
    .map((it) => ({ it, at: itemTime(day, it.t) }))
    .filter((x) => x.at && (x.it.leg || x.it.game || x.it.drive || FLIGHT_RE.test(String(x.it.t))))
    .map((x) => ({ ...x, kind: x.it.leg ? 'leg' : x.it.game ? 'game' : x.it.drive ? 'drive' : 'flight' }));
}

export function fmtCountdown(min) {
  if (min == null) return '';
  if (min < 1) return '马上';
  if (min < 60) return `${min} 分钟后`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} 小时 ${m} 分钟后` : `${h} 小时后`;
}
