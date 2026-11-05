// “今天”模式：根据当前时间找出今天是行程第几天、正在做什么、下一项是什么。纯函数，可测试。
import { TRIP } from '../data/trip.js';

// 行程里的某天 → 本地日期
export function dayStart(day) {
  const [m, d] = day.md.split('/').map(Number);
  return new Date(Number(TRIP.start.slice(0, 4)), m - 1, d);
}

// “09:30”→ 当天的 Date；“落地”“晚上”这类没有具体时间的返回 null
export function itemTime(day, t) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(t || '').trim());
  if (!m) return null;
  const base = dayStart(day);
  base.setHours(Number(m[1]), Number(m[2]), 0, 0);
  // 01:30 这类凌晨时间算第二天
  if (Number(m[1]) < 5) base.setDate(base.getDate() + 1);
  return base;
}

export function findToday(days, now) {
  const key = `${now.getMonth() + 1}/${now.getDate()}`;
  return days.find((d) => {
    const [m, dd] = d.md.split('/').map(Number);
    return `${m}/${dd}` === key && now.getFullYear() === Number(TRIP.start.slice(0, 4));
  }) || null;
}

// 当前项和下一项（只看有具体时间的条目）
export function nowAndNext(day, now) {
  const timed = day.items.map((it, i) => ({ it, i, at: itemTime(day, it.t) })).filter((x) => x.at);
  let current = null, next = null;
  for (const x of timed) {
    if (x.at <= now) current = x;
    else { next = x; break; }
  }
  return { current, next, minutes: next ? Math.round((next.at - now) / 60000) : null };
}

// 今天需要准点的事（城际交通、球赛），用于提醒
export function keyEvents(day) {
  return day.items
    .map((it) => ({ it, at: itemTime(day, it.t) }))
    .filter((x) => x.at && (x.it.leg || x.it.game));
}

export function fmtCountdown(min) {
  if (min == null) return '';
  if (min < 1) return '马上';
  if (min < 60) return `${min} 分钟后`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} 小时 ${m} 分钟后` : `${h} 小时后`;
}
