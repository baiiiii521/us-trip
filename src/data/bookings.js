// 订单夹的格子：每一张票、每一间房、每一个预约一个格子，随 12/20 方案和可选项变化。
// 用户在格子里填确认号、备注，附上截图（附件存在本机 IndexedDB）。
import { LEGS } from './legs.js';
import { GAMES } from './games.js';

export const WALLET_GROUPS = {
  doc: '证件和保险',
  flight: '机票',
  leg: '城际交通',
  hotel: '酒店',
  game: '球票',
  res: '景点预约和订位'
};

// 行程条目里的订票入口 → 对应的订单格子
export const VENDOR_SLOT = { cap: 'res-cap', loc: 'res-loc', rec: 'res-rec', met: 'res-met', summit: 'res-summit', ot: 'res-dinner', resy: 'res-dinner', bounce: 'res-bag', lh: 'res-bag' };

export function walletSlots(state) {
  const o = state.opts;
  const s = [];
  s.push({ id: 'doc-passport', group: 'doc', md: null, title: '两人护照首页和签证页', hint: '拍照存在这里，丢失补办时要用' });
  s.push({ id: 'doc-evus', group: 'doc', md: null, title: 'EVUS 登记确认', hint: '登记号、有效期', vendors: ['evus'] });
  if (o.ins) s.push({ id: 'doc-ins', group: 'doc', md: null, title: '旅行保险保单', hint: '保单号、紧急援助电话' });
  s.push({ id: 'flight-in', group: 'flight', md: '12/18', title: '郑州 → 纽约 JFK（MF8280 / MF849）', hint: '去哪儿订单 334631851748、座位、福州重新托运' });
  s.push({ id: 'flight-lax', group: 'flight', md: '12/31', title: '纽瓦克 → 洛杉矶（UA2434）', hint: '12/31 06:00 起飞 C 航站楼，座位' });
  s.push({ id: 'flight-home', group: 'flight', md: '12/31', title: '洛杉矶 → 北京（UA771）', hint: '12/31 23:35 起飞 T7，PNR AXGBBS、票号' });
  for (const id of Object.keys(LEGS)) {
    const L = LEGS[id];
    const md = L.date; // s2 固定 12/21
    s.push({ id: 'leg-' + id, group: 'leg', md, title: `${md} ${L.route}`, hint: '车次、订单号、座位', leg: id });
  }
  s.push({ id: 'hotel-bos', group: 'hotel', md: '12/18', title: '波士顿酒店（3 晚）', hint: '酒店名、确认号、入住时间', city: 'bos' });
  s.push({ id: 'hotel-dc', group: 'hotel', md: '12/21', title: '华盛顿酒店（2 晚）', hint: '酒店名、确认号', city: 'dc' });
  s.push({ id: 'hotel-phl', group: 'hotel', md: '12/23', title: '费城酒店（1 晚）', hint: '酒店名、确认号', city: 'phl' });
  s.push({ id: 'hotel-nyc', group: 'hotel', md: '12/24', title: '纽约公寓（7 晚）', hint: '门禁方式、Wi-Fi、房东电话', city: 'nyc' });
  if (o.ewr) s.push({ id: 'hotel-ewr', group: 'hotel', md: '12/30', title: '纽瓦克机场酒店（1 晚）', hint: '确认号、机场接驳时间', city: 'ewr' });
  const games = ['was', 'phi', 'bkn'];
  games.unshift('bos'); // 方案 C：凯尔特人已经排进 12/20
  for (const g of [...games, 'nyk27']) {
    const G = GAMES[g];
    s.push({ id: 'game-' + g, group: 'game', md: G.date, title: `${G.date} ${G.title}${g === 'nyk27' ? '（可选）' : ''}`, hint: '订单号、座位、电子票在哪个 App', game: g });
  }
  s.push({ id: 'res-cap', group: 'res', md: '12/22', title: '国会大厦导览', hint: '预约时间、确认号', vendors: ['cap'] });
  s.push({ id: 'res-loc', group: 'res', md: '12/22', title: '国会图书馆定时票', hint: '入场时间', vendors: ['loc'] });
  s.push({ id: 'res-rec', group: 'res', md: '12/23', title: '独立厅定时票', hint: '入场时间、确认号', vendors: ['rec'] });
  s.push({ id: 'res-dinner', group: 'res', md: '12/24', title: '平安夜晚餐订位', hint: '餐厅、时间、人数', vendors: ['ot', 'resy'] });
  s.push({ id: 'res-met', group: 'res', md: '12/27', title: '大都会门票', hint: '订单号', vendors: ['met'] });
  if (o.summit) s.push({ id: 'res-summit', group: 'res', md: '12/27', title: 'Summit 观景台', hint: '入场时段', vendors: ['summit'] });
  s.push({ id: 'res-bag', group: 'res', md: '12/31', title: '圣莫尼卡行李寄存', hint: '寄存点地址、取件码', vendors: ['bounce', 'lh'] });
  return s;
}

// 某天、某个条目对应哪些订单格子
export function slotsForItem(it) {
  const ids = [];
  if (it.leg) ids.push('leg-' + it.leg);
  if (it.game && it.game !== 'nyk25') ids.push('game-' + it.game);
  for (const v of it.buy || []) if (VENDOR_SLOT[v] && !ids.includes(VENDOR_SLOT[v])) ids.push(VENDOR_SLOT[v]);
  return ids;
}
