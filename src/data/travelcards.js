// 球赛日卡片、英文大字卡、实时交通状态入口。
// 球馆规定每季会改，页面上的“查规定”链接直接搜索球馆最新的包袋规定。
const g = (q) => 'https://www.google.com/search?q=' + encodeURIComponent(q);

export const GAMEDAY = {
  bos: { doors: '一般开赛前约 1 小时开门', there: '绿线 / 橙线到 North Station，球馆就在车站楼上', back: '散场人多，North Station 地铁排队长，酒店近的话直接走回去', food: '北区 North End 步行 10 分钟（Regina Pizzeria、cannoli）', policy: g('TD Garden bag policy') },
  was: { doors: '一般开赛前约 1 小时开门', there: '红 / 绿 / 黄线到 Gallery Place-Chinatown，出站就是', back: '同一个站坐回酒店，Penn Quarter 一带可以步行', food: '中国城和 Penn Quarter 餐厅很多，开赛前吃完再进', policy: g('Capital One Arena bag policy') },
  phi: { doors: '一般开赛前约 1 小时开门', there: 'Broad Street Line 坐到底站 NRG Station', back: '散场后 Broad Street Line 加开班次，跟着人流上车回市中心', food: '先在南费城吃 Pat\'s 或 Geno\'s，再从 Ellsworth-Federal 站坐车过去', policy: g('Xfinity Mobile Arena bag policy') },
  bkn: { doors: '篮网主场一般开赛前约 1.5 小时开门，早到能看热身', there: '2/3/4/5/B/D/N/Q/R 线到 Atlantic Av–Barclays Ctr，出站就是', back: '同一个站坐回曼哈顿，车多不用等', food: 'Junior\'s 芝士蛋糕老店步行 5 分钟', policy: g('Barclays Center bag policy') },
  nyk25: { doors: '一般开赛前约 1 小时开门', there: 'Penn Station 正上方', back: 'Penn Station 换乘方便', food: '韩国城 32 街步行 3 分钟', policy: g('Madison Square Garden bag policy') },
  nyk27: { doors: '一般开赛前约 1 小时开门', there: 'Penn Station 正上方', back: 'Penn Station 换乘方便', food: '韩国城 32 街步行 3 分钟', policy: g('Madison Square Garden bag policy') }
};

export const GAMEDAY_COMMON = [
  '双肩包不让带，只带手机、钱包或小斜挎包',
  '电子票是 App 里会动的二维码，截图进不去；先把一张转给同伴',
  '场内基本只收卡，手机电量留足',
  '提前 30–45 分钟进场看热身，这时离场边最近'
];

// 给对方看的英文句子（大字显示）
export const PHRASES = [
  { group: '交通', en: 'Please take me to this address.', zh: '请带我去这个地址' },
  { group: '交通', en: 'Is this the train to Washington, D.C.?', zh: '这是去华盛顿的火车吗' },
  { group: '交通', en: 'Could you tell me when we get to this stop?', zh: '到这一站时请告诉我' },
  { group: '交通', en: 'Which track does this train leave from?', zh: '这班车从几号站台开' },
  { group: '酒店', en: 'We have a reservation under the name ____.', zh: '我们有预订，名字是 ____' },
  { group: '酒店', en: 'Could you keep our luggage until 6 pm?', zh: '行李能寄存到下午 6 点吗' },
  { group: '酒店', en: 'Two beds, please, not one king bed.', zh: '要两张床，不要一张大床' },
  { group: '吃饭', en: 'A table for two, please.', zh: '两位' },
  { group: '吃饭', en: 'Could we have the check, please?', zh: '请买单' },
  { group: '吃饭', en: 'Can I pay by card?', zh: '可以刷卡吗' },
  { group: '吃饭', en: 'No pork, please.', zh: '不要猪肉' },
  { group: '入境', en: 'We are here for tourism, 13 nights.', zh: '我们来旅游，住 13 晚' },
  { group: '入境', en: 'Only snacks. No meat products.', zh: '只有零食，没有肉制品' },
  { group: '应急', en: 'I lost my passport. Where is the nearest police station?', zh: '护照丢了，最近的警察局在哪' },
  { group: '应急', en: 'Please call an ambulance.', zh: '请叫救护车' },
  { group: '应急', en: 'Where is the restroom?', zh: '洗手间在哪' }
];

// 实时状态：城际交通看车次，市内看地铁停运和改线
export const LEG_STATUS = {
  train: [{ label: 'Amtrak 车次实时状态', url: 'https://www.amtrak.com/track-your-train.html' }],
  bus: [{ label: 'FlixBus', url: 'https://www.flixbus.com' }, { label: 'Greyhound', url: 'https://www.greyhound.com' }]
};

export const CITY_STATUS = {
  bos: [{ label: 'MBTA 地铁通知', url: 'https://www.mbta.com/alerts' }],
  dc: [{ label: 'WMATA 地铁状态', url: 'https://www.wmata.com/service/status/' }],
  phl: [{ label: 'SEPTA', url: 'https://www.septa.org' }],
  nyc: [{ label: 'MTA 地铁通知', url: 'https://www.mta.info/alerts' }, { label: 'NJ Transit', url: 'https://www.njtransit.com' }],
  la: [{ label: 'LA Metro', url: 'https://www.metro.net' }]
};
