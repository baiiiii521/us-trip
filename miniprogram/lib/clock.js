// 两地时钟：北京（UTC+8）和当地（美东 UTC-5、洛杉矶 UTC-8，冬季）。
// 不用 Intl 的 timeZone：部分安卓内核不认，直接按偏移算，结果稳定。
const pad = (n) => String(n).padStart(2, '0');

function hhmm(ms) {
  const d = new Date(ms);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

const OFFSET = { bos: -5, dc: -5, phl: -5, nyc: -5, la: -8 };

export function clockPair(now = new Date(), city = 'nyc') {
  const off = OFFSET[city] == null ? -5 : OFFSET[city];
  const t = now.getTime();
  const local = hhmm(t + off * 3600000);
  const beijing = hhmm(t + 8 * 3600000);
  const bjHour = new Date(t + 8 * 3600000).getUTCHours();
  const call = bjHour >= 8 && bjHour < 22
    ? { ok: true, text: '家里醒着' }
    : { ok: false, text: bjHour >= 22 ? '家里该睡了' : '家里在睡觉' };
  return { local, beijing, place: city === 'la' ? '洛杉矶' : '美东', call };
}

// 行程里的城市 → 时区城市（都是美东，除了洛杉矶）
export const tzCity = (city) => (city === 'la' ? 'la' : 'nyc');
