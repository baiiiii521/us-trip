// 「今天」卡片要显示的整块内容，都在这里算好，页面只负责画。
// 纯函数：给一个时间和一份状态，返回要显示的数据，方便测试。
import { buildDays } from '../shared/data/days.js';
import { TRIP, CITIES } from '../shared/data/trip.js';
import { findToday, nowAndNext, fmtCountdown } from '../shared/lib/today.js';
import { PACE } from '../shared/data/wellbeing.js';
import { targetFor } from './nav.js';
import { clockPair, tzCity } from './clock.js';

const D = (iso, end) => new Date(`${iso}T${end ? '23:59:59' : '00:00:00'}`);
const dot = (iso) => iso.replace(/-/g, '.');

function trim(text, n = 90) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

export function buildTodayView(now = new Date(), state) {
  const days = buildDays(state || {});
  const today = findToday(days, now);
  const first = days[0];
  const clock = clockPair(now, tzCity(today ? today.city : 'nyc'));

  if (!today) {
    const start = D(TRIP.start);
    const before = now < start;
    const left = Math.ceil((start - now) / 86400000);
    return {
      phase: before ? 'before' : 'after',
      headline: before ? `距出发 ${Math.max(left, 0)} 天` : '这趟已经走完了',
      subline: before
        ? `${dot(TRIP.start)} – ${dot(TRIP.end)} · ${TRIP.people} 人 · 波士顿 → 洛杉矶`
        : '「行程」里每天的内容都还在，可以慢慢翻',
      clock,
      dayTitle: first.title,
      dayNo: 1,
      cityName: CITIES[first.city] ? CITIES[first.city].zh : '',
      preview: first.items.slice(0, 4).map((it) => ({ t: it.t, text: trim(it.text, 70) })),
      tips: (first.tips || []).slice(0, 2),
      navTarget: null
    };
  }

  const dayNo = days.indexOf(today) + 1;
  const city = CITIES[today.city] || { zh: '', hi: '', lo: '' };
  const nn = nowAndNext(today, now);
  const pace = today.pace ? { label: PACE[today.pace.lv] || '', km: today.pace.km, lv: today.pace.lv, cut: today.pace.cut } : null;

  const itemView = (it) => ({
    t: it.t || '',
    text: trim(it.text, 120),
    note: it.note || '',
    xmas: it.xmas ? it.xmas.s : '',
    xmasNote: it.xmas ? it.xmas.note || '' : '',
    game: !!it.game,
    leg: !!it.leg
  });

  const current = nn.current ? itemView(nn.current.it) : null;
  const next = nn.next
    ? {
        ...itemView(nn.next.it),
        count: fmtCountdown(nn.minutes),
        hasTarget: !!targetFor(nn.next.it, { rent: state && state.rent })
      }
    : null;

  // 导航主按钮的顺序：下一项 → 当前项 → 今天第一个有地点的条目
  const navItem = (nn.next && nn.next.it) || (nn.current && nn.current.it)
    || today.items.find((it) => targetFor(it, { rent: state && state.rent }));

  return {
    phase: 'on',
    headline: `第 ${dayNo} 天 · ${today.wd}`,
    subline: `${today.md} · ${city.zh}${today.title ? ` · ${today.title}` : ''}`,
    clock,
    dayTitle: today.title,
    dayNo,
    cityName: city.zh,
    hi: city.hi,
    lo: city.lo,
    current,
    next,
    between: nn.between.map(itemView),
    items: today.items.map(itemView),
    pace,
    warn: today.warn || '',
    tips: today.tips || [],
    stay: today.stay || '',
    navTarget: navItem ? targetFor(navItem, { rent: state && state.rent }) : null,
    navLabel: navItem ? (navItem.t || '导航') : ''
  };
}
