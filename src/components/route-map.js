// 线路示意图：I-95 走廊上的四座城市 + 洛杉矶。线段颜色跟着火车/大巴选择变，点城市跳到那天。
import { LEGS } from '../data/legs.js';
import { choiceFor } from '../lib/calc.js';
import { esc } from '../lib/dom.js';

const STOPS = {
  bos: { x: 262, y: 64, label: '波士顿', sub: '12/18–20', day: '1218', game: '凯尔特人 12/20' },
  nyc: { x: 204, y: 178, label: '纽约', sub: '12/24–30', day: '1224', game: '篮网 12/26' },
  phl: { x: 158, y: 262, label: '费城', sub: '12/23', day: '1223', game: '76人 12/23' },
  dc:  { x: 110, y: 350, label: '华盛顿', sub: '12/21–22', day: '1221', game: '奇才 12/22' }
};

// 两点连线向法线方向平移 d（沿 波士顿→华盛顿 方向，d<0 在东侧，d>0 在西侧）
function offset(a, b, d) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len * d, ny = dx / len * d;
  return [{ x: a.x + nx, y: a.y + ny }, { x: b.x + nx, y: b.y + ny }];
}

const pts = (arr) => arr.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

export function routeMapHtml(state) {
  const k = (id) => choiceFor(state, id);
  const S = STOPS;
  const legs = [
    // 12/18 北上：走东侧
    ['s1', offset(S.bos, S.nyc, -9)],
    // 12/20 南下（过夜）：走西侧
    ['s2', [offset(S.bos, S.nyc, 9)[0], offset(S.nyc, S.phl, 9)[0], offset(S.phl, S.dc, 9)[0], offset(S.phl, S.dc, 9)[1]]],
    // 12/23、12/24 北上：压在主线上
    ['s3', [S.dc, S.phl]],
    ['s4', [S.phl, S.nyc]]
  ];
  const lines = legs.map(([id, p]) =>
    `<polyline class="rm-leg rm-${k(id)}" points="${pts(p)}"/>`).join('');

  const stops = Object.entries(S).map(([key, s]) => {
    return `<a href="#day-${s.day}" class="rm-stop">
      <circle cx="${s.x}" cy="${s.y}" r="9" class="rm-dot"/>
      <text x="${s.x + 22}" y="${s.y + 1}" class="rm-label">${esc(s.label)}</text>
      <text x="${s.x + 22}" y="${s.y + 17}" class="rm-sub">${esc(s.sub)}<tspan class="rm-game"> · ${esc(s.game)}</tspan></text>
    </a>`;
  }).join('');

  return `<svg class="routemap" viewBox="0 0 440 400" role="img" aria-labelledby="rm-title">
    <title id="rm-title">路线示意：纽约 → 波士顿 → 华盛顿 → 费城 → 纽约 → 洛杉矶</title>
    <rect x="12" y="22" width="112" height="60" rx="8" class="rm-box"/>
    <text x="26" y="47" class="rm-label">洛杉矶</text>
    <text x="26" y="66" class="rm-sub">12/31 半天海边</text>
    <path d="M196 172 C 170 140, 150 110, 126 72" class="rm-flight"/>
    <text x="128" y="132" class="rm-sub" text-anchor="middle">飞机 12/31</text>
    <polyline class="rm-base" points="${pts([S.bos, S.nyc, S.phl, S.dc])}"/>
    ${lines}${stops}
  </svg>
  <div class="rm-legend"><span><i class="lg lg-train"></i>火车</span><span><i class="lg lg-bus"></i>大巴</span><span><i class="lg lg-night"></i>过夜车</span><span><i class="lg lg-ball"></i>有球赛</span><span>点城市看那几天</span></div>`;
}
