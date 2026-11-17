// 数字格式：小程序里 toLocaleString 在部分安卓内核不靠谱，自己分组。
export function money(usd, sym = '$') {
  const n = Math.round(Number(usd) || 0);
  const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${n < 0 ? '-' : ''}${sym}${s}`;
}

export function cny(v) {
  return money(v, '¥');
}

export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
