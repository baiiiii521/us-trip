// ⚠️ 生成文件，不要手改。源头：src/data/hotels.js
// 由 scripts/mp-sync-shared.mjs 生成；改内容请改 src/ 下那份，然后跑 node scripts/mp-sync-shared.mjs
// 四段住宿。名字、地址、电话按订单；人民币金额是按每晚房价换算的约数（原始订单金额以携程订单为准）。
// 纽约公寓只写大楼地址：房号、门禁码这类信息填在「订单夹」里，只存在自己手机上（网站是公开的）。
export const HOTELS = [
  {
    id: 'bos', city: 'bos', status: '已订', zh: '克罗斯敦中心欢朋酒店',
    en: 'Hampton Inn & Suites Boston Crosstown Center', addr: '811 Massachusetts Ave, Boston, MA 02118', tel: '+1 617-445-6400',
    checkIn: '12/18', checkOut: '12/21', nights: 3, room: '', cny: 2203, approx: true,
    parking: '酒店自带停车场，按晚收费（约 $35–45/晚，以前台为准），入住时说要停 3 晚。'
  },
  {
    id: 'dc', city: 'dc', status: '已订', zh: '国会山希尔顿花园酒店',
    en: 'Hilton Garden Inn Washington DC/U.S. Capitol', addr: '1225 First St NE, Washington, DC 20002', tel: '+1 202-408-4870',
    checkIn: '12/21', checkOut: '12/23', nights: 2, room: '', cny: 1170, approx: true,
    parking: '代客泊车或附近车库（约 $40–55/晚）。入住前打电话问清楚车高限制和进出时间。'
  },
  {
    id: 'phl', city: 'phl', status: '已订', zh: '费城历史区温德姆酒店',
    en: 'Wyndham Philadelphia Historic District', addr: '400 Arch St, Philadelphia, PA 19106', tel: '+1 215-923-8660',
    checkIn: '12/23', checkOut: '12/24', nights: 1, room: '', cny: 741, approx: true,
    parking: '酒店有停车场（约 $35–45/晚）。老城区路边停车查得很严，别停街边过夜。'
  },
  {
    id: 'nyc', city: 'nyc', status: '已订', zh: 'AVA Fort Greene 公寓',
    en: 'AVA Fort Greene', addr: '343 Gold St, Brooklyn, NY 11201',
    checkIn: '12/24', checkOut: '12/31', nights: 7, room: '整套公寓', usdNightly: 90, priceTbd: true,
    parking: '12/24 还车前只停十几分钟卸行李：在大楼门口装卸区打双闪，一人看车一人搬。车已还，之后不用停车。'
  }
];

export const HOTEL_OF = Object.fromEntries(HOTELS.map((h) => [h.city, h]));

// 已订三家的人民币合计（约数）
export const BOOKED_CNY = HOTELS.filter((h) => h.cny).reduce((n, h) => n + h.cny, 0);

// 某家住宿的美元总价：按美元订的直接乘晚数，按人民币订的用汇率换算
export function hotelUsd(h, rate = 6.8) {
  return h.usdNightly ? h.usdNightly * h.nights : Math.round(h.cny / rate);
}

// 每日行程里“住：…”那一行
export function stayText(city) {
  const h = HOTEL_OF[city];
  return h ? `${h.zh} · ${h.addr}` : '';
}
