// 旅行列表：首页只认这张表。将来加第二趟旅行就在这里加一条，页面不用改。
// 单趟旅行的详细内容（每日行程、景点、花费……）在 shared/data 里，进详情页再读。
const TRIPS = [
  {
    id: 'us-east-2026',
    title: '美东圣诞篮球行',
    titleEn: 'EAST COAST HOOPS',
    start: '2026-12-18',
    end: '2026-12-31',
    people: 2,
    trail: ['波士顿', '华盛顿', '费城', '纽约', '洛杉矶'],
    summary: '四座东部名城 + 六场 NBA，圣诞夜麦迪逊广场花园。',
    status: 'ready'
  }
];

// '2026-12-18' → '2026.12.18'
export function dotDate(iso) {
  return String(iso).replace(/-/g, '.');
}

// 距出发还有几天；行程中返回 0，结束后返回负数。只比日期，不受时区影响。
export function daysToStart(iso, now = new Date()) {
  const [y, m, d] = String(iso).split('-').map(Number);
  const startUTC = Date.UTC(y, m - 1, d);
  const todayUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((startUTC - todayUTC) / 86400000);
}

// 卡片右上角状态：未出发 / 进行中 / 已结束
export function tripPhase(trip, now = new Date()) {
  const toStart = daysToStart(trip.start, now);
  const toEnd = daysToStart(trip.end, now);
  if (toEnd < 0) return { key: 'done', label: '已结束' };
  if (toStart > 0) return { key: 'soon', label: `还有 ${toStart} 天` };
  return { key: 'now', label: '正在旅行' };
}

// 旅程共几天（首尾都算）
export function tripDays(trip) {
  return daysToStart(trip.end, new Date(`${trip.start}T00:00:00Z`)) + 1;
}

export { TRIPS };
