// 整体路线图：一张真实底图（东岸各州州界）+ 城市钉 + 城际线路，下面是可点的明细列表。
// 数据来自 lib/route.js（跟着方案 A/B/C、火车/大巴选择自动变），底图来自 data/map-geo.js。
import { esc, icon } from '../lib/dom.js';
import { buildRoute } from '../lib/route.js';
import { MAP_STATES, MAP_US, US_TX } from '../data/map-geo.js';
import { CITY_XY, CITY_LL, offsetLine, toPath } from '../lib/geo.js';
import { CITIES } from '../data/trip.js';

const MODE_ICON = { train: 'train', bus: 'bus', flight: 'plane' };

// 每条线段画在哪、标签放哪：坐标是投影后手工微调过的，改城市或加站点时在这里挪一下。
// 手机和桌面共用同一个 viewBox，缩放是等比的。
const SEG_GEO = {
  s1: { pts: () => offsetLine(CITY_XY.nyc, CITY_XY.bos, 7) },
  // 过夜车是“跳站”：从波士顿一路到华盛顿，画成向西兜的曲线，别让人以为中途停纽约、费城
  s2: {
    d: () => `M${f1(CITY_XY.bos[0])} ${f1(CITY_XY.bos[1])}Q118 150 ${f1(CITY_XY.dc[0])} ${f1(CITY_XY.dc[1])}`
  },
  s3: { pts: () => offsetLine(CITY_XY.dc, CITY_XY.phl, 6) },
  s4: { pts: () => offsetLine(CITY_XY.phl, CITY_XY.nyc, 7) }
};

// 城市标签的落点（走廊上城市挨得太近，标签用细引导线甩到空白处）
const LABELS = {
  bos: { x: 274, y: 110, anchor: 'end' },
  nyc: { x: 188, y: 216, anchor: 'start' },
  phl: { x: 156, y: 250, anchor: 'start' },
  dc: { x: 98, y: 284, anchor: 'start' }
};

const f1 = (n) => n.toFixed(1);

// 把折线的最后一个点往回收 n 像素，箭头就不会顶在城市的圆点上
function shrink(pts, n = 8) {
  const a = pts[pts.length - 2], b = pts[pts.length - 1];
  if (!a) return pts;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return [...pts.slice(0, -1), [b[0] - (dx / len) * n, b[1] - (dy / len) * n]];
}

// 纽约在行程里出现两次（12/18 落地、12/24–30 住），标签拆两行都写清楚
function subLines(city, s, nights, pos) {
  if (!s) return [];
  if (city === 'nyc') return ['12/18 JFK 落地', `12/24 起住 ${s.nights} 晚`];
  return [`${s.fromMd} 起 · ${nights}`];
}

function mapSvg(stays, moves) {
  const stayOf = Object.fromEntries(stays.map((s) => [s.city, s]));
  const moveOf = Object.fromEntries(moves.map((m) => [m.id, m]));

  const land = MAP_STATES.map((s) => `<path class="trmap__state" d="${s.d}"/>`).join('');

  const nightNote = (() => {
    const m = moveOf.s2;
    if (!m) return '';
    return `<text class="trmap__mlabel" x="104" y="176" text-anchor="end">${esc(`${m.md} 夜车 ${m.fromZh}→${m.toZh}`)}</text>`;
  })();

  const lines = Object.entries(SEG_GEO).map(([id, g]) => {
    const m = moveOf[id];
    if (!m) return '';
    const cls = `trmap__seg trmap__seg--${m.kind}${m.night ? ' is-night' : ''}`;
    const d = g.d ? g.d() : toPath(shrink(g.pts()));
    return `<path class="${cls}" d="${d}" marker-end="url(#trmap-arrow-${m.kind})"/>`;
  }).join('');

  const pins = Object.entries(LABELS).map(([city, pos]) => {
    const [x, y] = CITY_XY[city];
    const s = stayOf[city];
    const nights = s ? (s.nights > 0 ? `${s.nights} 晚` : '不过夜') : '';
    const first = s ? s.dayIds[0] : '1218';
    // 引导线从城市点连到标签底部
    const lx = pos.anchor === 'end' ? pos.x : pos.x - 2;
    return `<a class="trmap__pin trmap__pin--${city}" href="#day-${first}" aria-label="${esc(CITIES[city].zh)}，跳到第一天">
      <path class="trmap__leader" d="M${f1(x)} ${f1(y)}L${f1(lx)} ${f1(pos.y - 8)}"/>
      <circle cx="${f1(x)}" cy="${f1(y)}" r="5"/>
      <text class="trmap__name" x="${pos.x}" y="${pos.y}" text-anchor="${pos.anchor}">${esc(CITIES[city].zh)}</text>
      ${subLines(city, s, nights, pos).map((line, i) => `<text class="trmap__sub" x="${pos.x}" y="${pos.y + 11 + i * 10}" text-anchor="${pos.anchor}">${esc(line)}</text>`).join('')}
    </a>`;
  }).join('');

  // 洛杉矶在西岸：左上角放一张全美小图，两个点之间画 12/31 的航班
  const air = moveOf.air;
  const toUS = ([lng, lat]) => [US_TX.ox + (lng - US_TX.x0) * US_TX.k, US_TX.oy - (lat - US_TX.y1) * US_TX.k];
  const nycUS = toUS(CITY_LL.nyc);
  const laUS = toUS(CITY_LL.la);
  const usPaths = MAP_US.map((s) => `<path class="trmap__state" d="${s.d}"/>`).join('');
  const flight = `<g class="trmap__inset">
    <rect x="26" y="96" width="132" height="62" rx="7"/>
    <text class="trmap__insetlabel" x="30" y="107">12/31 纽约 → 洛杉矶 飞机 6h</text>
    <g transform="translate(21 92)">
      ${usPaths}
      <path class="trmap__air" d="M${f1(nycUS[0])} ${f1(nycUS[1])} C ${f1(nycUS[0] - 26)} ${f1(nycUS[1] - 14)}, ${f1(laUS[0] + 22)} ${f1(laUS[1] - 14)}, ${f1(laUS[0])} ${f1(laUS[1])}"/>
      <circle class="trmap__usdot" cx="${f1(nycUS[0])}" cy="${f1(nycUS[1])}" r="2.2"/>
      <circle class="trmap__usdot" cx="${f1(laUS[0])}" cy="${f1(laUS[1])}" r="2.2"/>
      <text class="trmap__usname" x="${f1(laUS[0] + 4)}" y="${f1(laUS[1] - 3)}">洛杉矶</text>
      <text class="trmap__usname" x="${f1(nycUS[0] + 4)}" y="${f1(nycUS[1] - 3)}">纽约</text>
    </g>
  </g>`;
  void air;

  return `<svg class="trmap__svg" viewBox="20 90 280 210" role="img" aria-labelledby="trmap-title">
    <title id="trmap-title">路线图：纽约 → 波士顿 → 华盛顿 → 费城 → 纽约 → 洛杉矶</title>
    <defs>
      <marker id="trmap-arrow-train" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="trmap__arrow trmap__arrow--train" d="M0 0L10 5L0 10z"/></marker>
      <marker id="trmap-arrow-bus" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path class="trmap__arrow trmap__arrow--bus" d="M0 0L10 5L0 10z"/></marker>
    </defs>
    <g class="trmap__land">${land}</g>
    ${lines}
    ${nightNote}
    ${flight}
    ${pins}
  </svg>`;
}

function moveRow(m) {
  const night = m.night ? `<span class="tr__night">${icon('moon')}过夜车</span>` : '';
  return `<li class="tr__item tr__item--move tr__move--${m.kind}">
    <span class="tr__dot" aria-hidden="true"></span>
    <a class="tr__mv" href="#day-${m.dayId}">
      <span class="tr__mode">${icon(MODE_ICON[m.kind] || 'train')}${esc(m.kindLabel)}</span>
      <b class="tr__mvdate">${esc(m.md)}</b>
      <span class="tr__mvroute">${esc(m.fromZh)} → ${esc(m.toZh)}</span>
      <span class="tr__mvdur">${esc(m.dur)}</span>
      ${night}
    </a>
  </li>`;
}

function stayRow(s) {
  const chips = s.dayIds.map((id) => {
    const n = Number(id.slice(2));
    return `<a class="tr__day" href="#day-${id}" aria-label="跳到 ${s.fromMd.split('/')[0]}/${n}">${n}</a>`;
  }).join('');
  // 球赛只写日期里的“日”，月份在卡片头的起始日里已经出现过，不再重复
  const games = s.games.map((g) => `<span class="tr__game">${icon('ball')}${esc(g.title)}<i>${esc(g.date.split('/')[1])}日</i></span>`).join('');
  const nights = s.nights > 0
    ? `住 ${s.nights} 晚 · ${s.dayIds.length} 天`
    : `${s.dayIds.length} 天 · 不过夜`;
  return `<li class="tr__item tr__item--stay tr__stay--${s.city}">
    <span class="tr__dot" aria-hidden="true"></span>
    <div class="tr__card">
      <div class="tr__head">
        <b class="tr__city">${esc(s.cityZh)}</b>
        <span class="tr__span">${esc(s.fromMd)} 起</span>
        <span class="tr__nights">${esc(nights)}</span>
      </div>
      <div class="tr__days">${chips}</div>
      ${games ? `<div class="tr__games">${games}</div>` : ''}
      ${s.note ? `<p class="tr__note">${icon('bed')}${esc(s.note)}</p>` : ''}
    </div>
  </li>`;
}

export function tripRouteHtml(state) {
  const { stays, moves, totalDays } = buildRoute(state);
  const rows = [];
  stays.forEach((s, i) => {
    if (moves[i]) rows.push(moveRow(moves[i]));
    rows.push(stayRow(s));
  });
  const lastMove = moves[moves.length - 1];
  rows.push(`<li class="tr__item tr__item--end">
    <span class="tr__dot" aria-hidden="true"></span>
    <p class="tr__end">${icon('plane')}${esc(lastMove.md)} 晚 · ${esc(lastMove.toZh)}起飞回国</p>
  </li>`);

  return `<section class="tr card m-nolift" aria-labelledby="tr-h">
    <div class="card__h">
      <h2 id="tr-h">整体路线</h2>
      <span class="meta">${stays.length} 城 · ${moves.length} 段交通 · ${totalDays} 天</span>
    </div>
    ${mapSvg(stays, moves)}
    <div class="rm-legend">
      <span><i class="lg lg-train"></i>火车</span>
      <span><i class="lg lg-bus"></i>大巴</span>
      <span><i class="lg lg-night"></i>过夜</span>
      <span>点城市跳到那天</span>
    </div>
    <details class="tr__more">
      <summary>按日期看每一段（住几晚、哪天有球赛）</summary>
      <ol class="tr__line">${rows.join('')}</ol>
    </details>
  </section>`;
}
