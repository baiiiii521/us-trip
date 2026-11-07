// 整体路线的纯函数模型：把 14 天行程压成「停留段 + 城际移动」，给路线图组件用，也方便测试。
//
// - 停留段从 buildDays() 的结果自动分组：连续同城的几天算一段，改 days.js 不用动这里
// - 移动段只认 legs.js 的四段 + 12/31 的航班；方案 A/B/C 只改变 s2 的日期和时长
// - 「住几晚」由每天的 stay 文案判断（含“车上过夜/国际航班”的那天不算房晚），不另写一份数据
import { buildDays } from '../data/days.js';
import { LEGS } from '../data/legs.js';
import { GAMES } from '../data/games.js';
import { CITIES } from '../data/trip.js';
import { choiceFor } from './calc.js';

// 路线图上要短的时长文案；legs.js 里是详细说明。改运行时长记得同步这里。
const DURATION = {
  s1: { train: '约 4h15', bus: '约 4.5–5.5h' },
  s2: { train: '约 12h', bus: '约 10h30' },
  s3: { train: '约 1h45', bus: '约 2.5–3h' },
  s4: { train: '约 1h20', bus: '约 2h' }
};

// s2 的出发日：A 是 12/20 晚，B 是 12/21 凌晨 01:30，C 是 12/21 早上
// 12/20 只保留方案 C：s2 固定是 12/21 白天的车
const S2_DATE = ['12/21', '周一'];
const S2_DAY = '1221';

function durationFor(id, kind) {
  if (id === 's2') return kind === 'train' ? '约 7–8h' : '约 9–10h';
  return DURATION[id][kind];
}

// 哪天算“住在城里”：车上过夜、机场过夜、机场酒店、航班都不算（机场酒店单独记在预算里）
const isHotelNight = (day) => !/车上过夜|机场过夜|机场酒店|国际航班/.test(day.stay || '');

export function buildRoute(state) {
  const days = buildDays(state);

  // 1) 连续同城 → 一段停留
  const stays = [];
  for (const d of days) {
    const last = stays[stays.length - 1];
    if (last && last.city === d.city) {
      last.dayIds.push(d.id);
      last.toMd = d.md;
      last.toWd = d.wd;
      last.nights += isHotelNight(d) ? 1 : 0;
    } else {
      stays.push({
        city: d.city,
        cityZh: CITIES[d.city].zh,
        dayIds: [d.id],
        fromMd: d.md,
        toMd: d.md,
        fromWd: d.wd,
        toWd: d.wd,
        nights: isHotelNight(d) ? 1 : 0
      });
    }
  }

  // 2) 每段停留里的球赛
  for (const s of stays) {
    const ids = [];
    for (const id of s.dayIds) {
      const day = days.find((d) => d.id === id);
      for (const it of day.items) if (it.game && !ids.includes(it.game)) ids.push(it.game);
    }
    s.games = ids.map((id) => ({ id, ...GAMES[id] }));
    // 最后一天不是在酒店过夜的话（机场过夜/机场酒店），在图上一句话点出来，
    // 免得“纽约住 6 晚”少一晚看起来像算错
    const lastDay = days.find((d) => d.id === s.dayIds[s.dayIds.length - 1]);
    if (/机场/.test(lastDay.stay || '')) s.note = lastDay.stay;
  }

  // 3) 城际移动：四段按 legs.js 的顺序 + 12/31 的航班
  const moves = ['s1', 's2', 's3', 's4'].map((id) => {
    const leg = LEGS[id];
    const kind = choiceFor(state, id);
    const [md, wd] = id === 's2' ? S2_DATE : [leg.date, leg.wd];
    return {
      id,
      kind,
      kindLabel: kind === 'train' ? '火车' : '大巴',
      from: leg.from,
      to: leg.to,
      fromZh: CITIES[leg.from].zh,
      toZh: CITIES[leg.to].zh,
      md,
      wd,
      route: leg.route,
      dur: durationFor(id, kind),
      night: false,
      dayId: id === 's2' ? S2_DAY : { s1: '1218', s3: '1223', s4: '1224' }[id]
    };
  });

  // 12/31：纽约 → 洛杉矶的航班（不是 legs.js 里的城际段）
  moves.push({
    id: 'air',
    kind: 'flight',
    kindLabel: '飞机',
    from: 'nyc',
    to: 'la',
    fromZh: CITIES.nyc.zh,
    toZh: CITIES.la.zh,
    md: '12/31',
    wd: '周四',
    route: '纽约 → 洛杉矶',
    dur: '约 6h 飞行',
    night: false,
    dayId: '1231'
  });

  return {
    days,
    stays,
    moves,
    totalDays: days.length,
    startMd: days[0].md,
    endMd: days[days.length - 1].md
  };
}
