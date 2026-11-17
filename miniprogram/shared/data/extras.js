// ⚠️ 生成文件，不要手改。源头：src/data/extras.js
// 由 scripts/mp-sync-shared.mjs 生成；改内容请改 src/ 下那份，然后跑 node scripts/mp-sync-shared.mjs
// 旅途小帮手的数据：待确认的事、值机时间、吃什么、地点坐标、厕所、换算表。
// 坐标是按地标位置写的约数（误差可能有一两百米），只用来排“离我最近”的先后；真正导航还是用地址。

// ---------- 待确认：到临近才公布、或者要打电话才知道的事 ----------
// by：最晚哪天前确认（行程日期）。勾选存在 state.todo（id 前缀 cf-），两人同步
export const CONFIRMS = [
  { id: 'cf-carno', by: '出发前', text: '租车确认号、道路救援电话存进订单夹', how: '携程订单页 → 复制到“随身 → 订单夹 → 租车”' },
  { id: 'cf-dinner', by: '12/10', text: '平安夜晚餐订位成功，餐厅当天营业', how: 'OpenTable / Resy 订单页；订在中城 50–59 街一带', vendors: ['ot', 'resy'] },
  { id: 'cf-games', by: '12/18', text: '四场球的开球时间没变（凯尔特人 12/20 20:00、奇才 12/22 19:00、76人 12/23 19:30、篮网 12/26 18:00）', how: 'NBA App 或各队官网赛程', vendors: ['nba'] },
  { id: 'cf-uss', by: '12/19', text: '宪法号 12/20 周日开放（海军官网写周三到周日 10:00–18:00）', how: '官网当天公告', vendors: ['uss'] },
  { id: 'cf-ferry', by: '12/19', text: 'MBTA F4 渡轮周日有没有 10:00 前后的班次', how: 'mbta.com 查 Charlestown Ferry 时刻表；没有就从 North Station 走 20 分钟' },
  { id: 'cf-pepe', by: '12/20', text: '纽黑文 Frank Pepe 披萨 12/21 周一几点开门（10:30 和 11:00 两种说法）', how: '官网 pepespizzeria.com 或 Google 地图' },
  { id: 'cf-dctree', by: '12/21', text: '国家圣诞树晚上亮到几点（往年平日到 22:00）', how: 'thenationaltree.org' },
  { id: 'cf-indep', by: '12/22', text: '独立厅定时票是 14:15 前后那一场，当天末场时间', how: 'recreation.gov 订单邮件', vendors: ['rec'] },
  { id: 'cf-sixt', by: '12/23', text: 'Sixt Battery Park 平安夜几点关门（官网写节假日 07:30–13:00，携程写到 18:00）', how: 'Sixt App 里看门店，或打门店电话；确认不了就按 12:15 前还' },
  { id: 'cf-apt', by: '12/23', text: '布鲁克林公寓 12/24 中午能不能先放行李，钥匙怎么拿', how: '问房东；回复存进订单夹的公寓那一格' },
  { id: 'cf-rock', by: '12/23', text: '洛克菲勒圣诞树平安夜和圣诞日的亮灯时间', how: 'rockefellercenter.com' },
  { id: 'cf-bryant', by: '12/23', text: '布莱恩公园 Winter Village 平安夜几点关门', how: 'bryantpark.org' },
  { id: 'cf-bar', by: '12/24', text: '圣诞日中午哪家体育酒吧开门（看尼克斯 vs 马刺）', how: 'Google 地图搜 sports bar，看 12/25 的营业时间' },
  { id: 'cf-chinatown', by: '12/24', text: 'Nom Wah、Joe\'s Shanghai 圣诞日营不营业', how: 'Google 地图或打电话' },
  { id: 'cf-confetti', by: '12/28', text: '时代广场彩纸试飞是不是 12/29 上午 11:00', how: 'timessquarenyc.org 的新闻页' },
  { id: 'cf-ride', by: '12/30', text: '12/31 凌晨 02:30 去纽瓦克机场的车已经在 App 里约好', how: 'Uber / Lyft 的“预约”功能，上车点填公寓地址' }
];

// ---------- 值机：起飞前 24 小时开放。时间用 UTC 写，手机在哪个时区都对 ----------
export const CHECKINS = [
  { id: 'ci-out', flight: 'MF8280 / MF849', title: '去程：郑州 → 福州 → 纽约', airline: '厦门航空',
    dep: Date.UTC(2026, 11, 17, 5, 45), depText: '12/17 13:45 郑州起飞（北京时间）',
    note: '厦航国际航班一般起飞前 24 小时开放网上值机，以厦航 App 为准；国际段常要到柜台验证件，早到机场。',
    links: [['厦航官网值机', 'https://www.xiamenair.com/'], ['MF849 航班动态', 'https://www.flightaware.com/live/flight/CXA849']] },
  { id: 'ci-back', flight: 'UA2434 / UA771', title: '回程：纽瓦克 → 洛杉矶 → 北京', airline: '美国联合航空',
    dep: Date.UTC(2026, 11, 31, 11, 0), depText: '12/31 06:00 纽瓦克起飞（美东时间）',
    note: '两段在同一个订单里，一次值机两段都办。国际段要核验护照，App 里拍护照页；选不了座就到柜台办。',
    links: [['联合航空值机', 'https://www.united.com/en/us/checkin'], ['UA2434 航班动态', 'https://www.flightaware.com/live/flight/UAL2434'], ['UA771 航班动态', 'https://www.flightaware.com/live/flight/UAL771']] }
];

// ---------- 吃什么。price：$ 人均 15 美元内，$$ 15–35，$$$ 35 以上。book：要不要订位 ----------
// 营业时间没逐家核实，页面上给“看营业时间”按钮直接开地图
export const EATS = [
  { city: 'bos', name: 'Pinocchio\'s Pizza', zh: '哈佛广场方块披萨', what: '西西里厚底方块披萨，学生吃了几十年', price: '$', book: '不用订', q: 'Pinocchio\'s Pizza & Subs, 74 Winthrop St, Cambridge, MA', ll: [42.3722, -71.1203], day: '12/19' },
  { city: 'bos', name: 'Regina Pizzeria', zh: '北区老牌披萨', what: '1926 年的砖炉披萨，店小，门口排队', price: '$$', book: '不接受订位', q: 'Regina Pizzeria, 11 1/2 Thacher St, Boston, MA', ll: [42.3654, -71.0569], day: '12/20' },
  { city: 'bos', name: 'Mike\'s Pastry', zh: '奶油卷 cannoli', what: '北区甜品店，买了边走边吃；只收现金的年代过去了，但带点现金保险', price: '$', book: '不用订', q: 'Mike\'s Pastry, 300 Hanover St, Boston, MA', ll: [42.3642, -71.0542], day: '12/20' },
  { city: 'bos', name: 'Neptune Oyster', zh: '龙虾卷和生蚝', what: '波士顿最有名的龙虾卷，热黄油版。只有二十来个座位', price: '$$$', book: '不接受订位，开门前去排', q: 'Neptune Oyster, 63 Salem St, Boston, MA', ll: [42.3632, -71.0560] },
  { city: 'bos', name: 'Quincy Market', zh: '昆西市场美食廊', what: '蛤蜊浓汤装在面包碗里、龙虾卷，选择多、不用等位', price: '$$', book: '不用订', q: 'Quincy Market, Boston, MA', ll: [42.3601, -71.0548], day: '12/19' },
  { city: 'bos', name: 'Union Oyster House', zh: '美国最老的餐厅', what: '1826 年开业，生蚝吧台和蛤蜊浓汤', price: '$$$', book: '建议订位', q: 'Union Oyster House, 41 Union St, Boston, MA', ll: [42.3613, -71.0570] },
  { city: 'bos', name: 'Hub Hall', zh: 'TD Garden 楼下美食广场', what: '看球前就近吃，十几个档口', price: '$$', book: '不用订', q: 'Hub Hall, 80 Causeway St, Boston, MA', ll: [42.3662, -71.0617], day: '12/20' },
  { city: 'bos', name: 'Frank Pepe Pizzeria', zh: '纽黑文白蛤蜊披萨（12/21 路上）', what: '纽黑文披萨的老店，招牌 White Clam Pie', price: '$$', book: '不接受订位，开门就进', q: 'Frank Pepe Pizzeria Napoletana, 157 Wooster St, New Haven, CT', ll: [41.3029, -72.9170], day: '12/21' },

  { city: 'dc', name: 'Ben\'s Chili Bowl', zh: '辣肉酱热狗 half-smoke', what: 'U Street 老店，half-smoke 配辣肉酱', price: '$', book: '不用订', q: 'Ben\'s Chili Bowl, 1213 U St NW, Washington, DC', ll: [38.9172, -77.0288], day: '12/21' },
  { city: 'dc', name: 'Municipal Fish Market', zh: 'Maine Avenue 鱼市蓝蟹', what: '现蒸蓝蟹按打卖，站着吃；冬天蟹少、价高，先问价', price: '$$', book: '不用订', q: 'Municipal Fish Market at The Wharf, 1100 Maine Ave SW, Washington, DC', ll: [38.8790, -77.0240], day: '12/22' },
  { city: 'dc', name: 'Capitol Visitor Center 餐厅', zh: '国会游客中心地下餐厅', what: '看完国会就地吃午饭，自助式', price: '$$', book: '不用订', q: 'U.S. Capitol Visitor Center, Washington, DC', ll: [38.8895, -77.0085], day: '12/22' },
  { city: 'dc', name: 'Old Ebbitt Grill', zh: '白宫旁边的老馆子', what: '1856 年开业，生蚝和蟹饼；看完圣诞树走 5 分钟', price: '$$$', book: '要订位', q: 'Old Ebbitt Grill, 675 15th St NW, Washington, DC', ll: [38.8980, -77.0334] },
  { city: 'dc', name: 'Chinatown Express', zh: '中国城手拉面和煎饺', what: '橱窗里现拉面，离球馆两个街口，看球前吃', price: '$', book: '不用订', q: 'Chinatown Express, 746 6th St NW, Washington, DC', ll: [38.8996, -77.0200], day: '12/22' },
  { city: 'dc', name: 'Union Station 美食层', zh: '联合车站地下美食层', what: '离酒店走 10 分钟，到得晚也有吃的', price: '$', book: '不用订', q: 'Union Station, 50 Massachusetts Ave NE, Washington, DC', ll: [38.8973, -77.0063], day: '12/21' },

  { city: 'phl', name: 'DiNic\'s', zh: '烤猪肉三明治', what: 'Reading Terminal Market 里，烤猪肉配西兰花苗和尖椒奶酪', price: '$', book: '不用订', q: 'Tommy DiNic\'s, Reading Terminal Market, Philadelphia, PA', ll: [39.9533, -75.1593], day: '12/23' },
  { city: 'phl', name: 'Beiler\'s Doughnuts', zh: '阿米什甜甜圈', what: '同在 Reading Terminal Market，现炸现卖', price: '$', book: '不用订', q: 'Beiler\'s Doughnuts, Reading Terminal Market, Philadelphia, PA', ll: [39.9531, -75.1590], day: '12/23' },
  { city: 'phl', name: 'Pat\'s King of Steaks', zh: '芝士牛肉堡发明者', what: '点单说“One whiz wit”（加奶酪酱加洋葱）；常只收现金', price: '$', book: '不用订', q: 'Pat\'s King of Steaks, 1237 E Passyunk Ave, Philadelphia, PA', ll: [39.9332, -75.1592], day: '12/23' },
  { city: 'phl', name: 'Geno\'s Steaks', zh: '马路对面的对手', what: '和 Pat\'s 隔一条街，两人各买一家对比着吃', price: '$', book: '不用订', q: 'Geno\'s Steaks, 1219 S 9th St, Philadelphia, PA', ll: [39.9338, -75.1588], day: '12/23' },
  { city: 'phl', name: 'Federal Donuts', zh: '炸鸡和甜甜圈', what: '费城本地连锁，早饭或者零食', price: '$', book: '不用订', q: 'Federal Donuts & Chicken, Philadelphia, PA', ll: [39.9502, -75.1667] },

  { city: 'nyc', name: 'Junior\'s', zh: '布鲁克林芝士蛋糕', what: '离公寓走 6 分钟，12/26 看篮网前在这儿吃', price: '$$', book: '人多时等位，可在官网订', q: 'Junior\'s Restaurant, 386 Flatbush Ave Ext, Brooklyn, NY', ll: [40.6902, -73.9819], day: '12/26' },
  { city: 'nyc', name: 'Juliana\'s', zh: 'DUMBO 煤炉披萨', what: '布鲁克林大桥下，整张卖；11:30 开门赶第一轮', price: '$$', book: '不接受订位', q: 'Juliana\'s, 19 Old Fulton St, Brooklyn, NY', ll: [40.7027, -73.9934], day: '12/26' },
  { city: 'nyc', name: 'Time Out Market', zh: 'DUMBO 美食广场', what: '二十多个档口，楼顶露台看大桥；有干净厕所', price: '$$', book: '不用订', q: 'Time Out Market New York, 55 Water St, Brooklyn, NY', ll: [40.7034, -73.9903], day: '12/26' },
  { city: 'nyc', name: 'Joe\'s Pizza', zh: '纽约一片披萨', what: '按片卖，站着吃；Carmine St 是老店', price: '$', book: '不用订', q: 'Joe\'s Pizza, 7 Carmine St, New York, NY', ll: [40.7306, -74.0021], day: '12/28' },
  { city: 'nyc', name: 'Nom Wah Tea Parlor', zh: '唐人街老字号点心', what: '1920 年开业，按单点的点心', price: '$$', book: '不订位，等位', q: 'Nom Wah Tea Parlor, 13 Doyers St, New York, NY', ll: [40.7144, -73.9982], day: '12/25' },
  { city: 'nyc', name: 'Joe\'s Shanghai', zh: '蟹粉小笼包', what: '唐人街的汤包名店', price: '$$', book: '等位', q: 'Joe\'s Shanghai, 46 Bowery, New York, NY', ll: [40.7153, -73.9967], day: '12/25' },
  { city: 'nyc', name: 'Katz\'s Delicatessen', zh: '熏牛肉三明治', what: '《当哈利遇到莎莉》那家，一份两人分着吃；进门的小票别丢', price: '$$$', book: '不用订', q: 'Katz\'s Delicatessen, 205 E Houston St, New York, NY', ll: [40.7223, -73.9874] },
  { city: 'nyc', name: 'Los Tacos No.1', zh: '切尔西市场墨西哥卷饼', what: '站着吃的塔可，12/28 逛切尔西市场时吃', price: '$', book: '不用订', q: 'Los Tacos No.1, Chelsea Market, 75 9th Ave, New York, NY', ll: [40.7424, -74.0060], day: '12/28' },
  { city: 'nyc', name: 'Levain Bakery', zh: '厚曲奇', what: '巴掌厚的核桃巧克力曲奇，热的最好吃', price: '$', book: '不用订', q: 'Levain Bakery, 167 W 74th St, New York, NY', ll: [40.7799, -73.9803], day: '12/30' },
  { city: 'nyc', name: '韩国城 32 街', zh: '韩式烤肉一条街', what: '32 街第五到第六大道之间，开到很晚', price: '$$$', book: '周末建议订位', q: 'Koreatown, W 32nd St, New York, NY', ll: [40.7477, -73.9869], day: '12/29' },
  { city: 'nyc', name: '新世界美食广场', zh: '法拉盛中餐小吃', what: '地下一层几十个档口，想家的时候来', price: '$', book: '不用订', q: 'New World Mall Food Court, 136-20 Roosevelt Ave, Flushing, NY', ll: [40.7590, -73.8297], day: '12/29' },
  { city: 'nyc', name: 'Shake Shack', zh: '麦迪逊广场公园原店', what: '汉堡连锁的第一家，露天座位', price: '$', book: '不用订', q: 'Shake Shack Madison Square Park, New York, NY', ll: [40.7415, -73.9882] },

  { city: 'la', name: 'Bay Cities Italian Deli', zh: '圣莫尼卡意式三明治', what: '招牌 The Godmother 三明治，买了去海边吃', price: '$', book: '不用订', q: 'Bay Cities Italian Deli, 1517 Lincoln Blvd, Santa Monica, CA', ll: [34.0178, -118.4897], day: '12/31' },
  { city: 'la', name: 'The Albright', zh: '码头上的海鲜', what: '圣莫尼卡码头上，炸鱼薯条和蟹，看日落就近吃晚饭', price: '$$', book: '不用订', q: 'The Albright, 258 Santa Monica Pier, Santa Monica, CA', ll: [34.0090, -118.4972], day: '12/31' },
  { city: 'la', name: 'Great White', zh: '威尼斯海滩早午饭', what: '离海滩一个街口，沙拉、披萨、咖啡', price: '$$', book: '等位', q: 'Great White, 1604 Pacific Ave, Venice, CA', ll: [33.9891, -118.4733], day: '12/31' }
];

// ---------- 景点坐标（约数）----------
export const POI_LL = {
  'south-station': [42.3519, -71.0552], 'harvard-yard': [42.3744, -71.1169], 'mit-dome': [42.3601, -71.0920], stata: [42.3616, -71.0907],
  'harvard-bridge': [42.3546, -71.0914], 'beacon-hill': [42.3577, -71.0689], 'public-garden': [42.3541, -71.0700], 'faneuil-hall': [42.3600, -71.0548],
  'uss-constitution': [42.3724, -71.0566], 'north-end': [42.3647, -71.0542], bpl: [42.3493, -71.0782], 'td-garden': [42.3662, -71.0621],
  'union-station-dc': [38.8973, -77.0063], capitol: [38.8899, -77.0091], loc: [38.8887, -77.0047], 'washington-monument': [38.8895, -77.0353],
  'ww2-memorial': [38.8894, -77.0405], lincoln: [38.8893, -77.0502], jefferson: [38.8814, -77.0365], 'white-house': [38.8977, -77.0365],
  'national-tree': [38.8948, -77.0365], georgetown: [38.9048, -77.0628], wharf: [38.8790, -77.0240], 'capital-one': [38.8981, -77.0209], bens: [38.9172, -77.0288],
  'reading-terminal': [39.9533, -75.1593], 'independence-hall': [39.9489, -75.1500], 'liberty-bell': [39.9496, -75.1503], elfreth: [39.9527, -75.1425],
  'love-park': [39.9543, -75.1657], 'pats-genos': [39.9332, -75.1590], 'xfinity-arena': [39.9012, -75.1720], 'rocky-steps': [39.9651, -75.1806],
  moynihan: [40.7513, -73.9951], 'port-authority': [40.7570, -73.9903], 'rockefeller-tree': [40.7587, -73.9787], 'st-patricks': [40.7585, -73.9760],
  'bryant-park': [40.7536, -73.9832], macys: [40.7508, -73.9895], 'lotte-palace': [40.7580, -73.9749], 'plaza-hotel': [40.7646, -73.9744],
  'central-park': [40.7740, -73.9708], chinatown: [40.7158, -73.9970], dyker: [40.6190, -74.0110], 'brooklyn-bridge': [40.7061, -73.9969],
  dumbo: [40.7033, -73.9894], promenade: [40.6962, -73.9977], barclays: [40.6826, -73.9754], met: [40.7794, -73.9632], summit: [40.7527, -73.9785],
  'grand-central': [40.7527, -73.9772], 'times-square': [40.7580, -73.9855], 'staten-ferry': [40.7013, -74.0131], 'charging-bull': [40.7056, -74.0134],
  '911-memorial': [40.7115, -74.0134], oculus: [40.7116, -74.0113], 'high-line': [40.7480, -74.0048], 'chelsea-market': [40.7424, -74.0061],
  'little-island': [40.7420, -74.0103], 'roosevelt-tram': [40.7613, -73.9642], msg: [40.7505, -73.9934], flushing: [40.7590, -73.8303],
  apollo: [40.8100, -73.9500], 'nba-store': [40.7557, -73.9790],
  'lax-transit': [33.9490, -118.3776], 'santa-monica-pier': [34.0094, -118.4973], 'venice-beach': [33.9850, -118.4695], 'venice-canals': [33.9833, -118.4660]
};

// ---------- 能上厕所的地方：免费、对外开放、比较干净 ----------
export const TOILETS = [
  { name: '布莱恩公园公厕', note: '纽约最干净的免费公厕，在公园北侧 42 街', q: 'Bryant Park Restroom, New York, NY', ll: [40.7540, -73.9838] },
  { name: '中央车站', note: '下层餐饮大厅', q: 'Grand Central Terminal Dining Concourse, New York, NY', ll: [40.7527, -73.9772] },
  { name: 'Moynihan 大厅', note: '美食广场旁', q: 'Moynihan Train Hall, New York, NY', ll: [40.7513, -73.9951] },
  { name: 'Oculus 世贸中心', note: '商场里，指示牌写 Restrooms', q: 'Oculus, World Trade Center, New York, NY', ll: [40.7116, -74.0113] },
  { name: '切尔西市场', note: '市场中段', q: 'Chelsea Market, 75 9th Ave, New York, NY', ll: [40.7424, -74.0061] },
  { name: 'Time Out Market（DUMBO）', note: '一楼', q: 'Time Out Market New York, 55 Water St, Brooklyn, NY', ll: [40.7034, -73.9903] },
  { name: '梅西百货', note: '楼上各层都有，商场营业时间内', q: 'Macy\'s Herald Square, New York, NY', ll: [40.7508, -73.9895] },
  { name: '大都会博物馆', note: '要门票才进得去', q: 'The Metropolitan Museum of Art, New York, NY', ll: [40.7794, -73.9632] },
  { name: '史泰登岛渡轮码头', note: '候船大厅里', q: 'Whitehall Terminal, New York, NY', ll: [40.7013, -74.0131] },
  { name: '昆西市场', note: '地下一层', q: 'Quincy Market, Boston, MA', ll: [42.3601, -71.0548] },
  { name: '波士顿公共图书馆', note: '新楼一层', q: 'Boston Public Library, 700 Boylston St, Boston, MA', ll: [42.3493, -71.0782] },
  { name: 'Prudential Center 商场', note: '美食广场旁，离 Newbury 街两个街口', q: 'Prudential Center, Boston, MA', ll: [42.3471, -71.0825] },
  { name: '波士顿 South Station', note: '候车大厅', q: 'South Station, Boston, MA', ll: [42.3519, -71.0552] },
  { name: '华盛顿联合车站', note: '主大厅和地下美食层', q: 'Union Station, Washington, DC', ll: [38.8973, -77.0063] },
  { name: '史密森尼自然史博物馆', note: '国家广场中段，免费进；要过安检', q: 'Smithsonian National Museum of Natural History, Washington, DC', ll: [38.8913, -77.0261] },
  { name: '林肯纪念堂', note: '台阶左下方', q: 'Lincoln Memorial, Washington, DC', ll: [38.8893, -77.0502] },
  { name: '国会游客中心', note: '过安检后', q: 'U.S. Capitol Visitor Center, Washington, DC', ll: [38.8895, -77.0085] },
  { name: 'Reading Terminal Market', note: '市场东北角', q: 'Reading Terminal Market, Philadelphia, PA', ll: [39.9533, -75.1593] },
  { name: '独立游客中心', note: '自由钟对面，免费', q: 'Independence Visitor Center, Philadelphia, PA', ll: [39.9508, -75.1500] },
  { name: '圣莫尼卡码头', note: '码头入口和中段各一处', q: 'Santa Monica Pier, Santa Monica, CA', ll: [34.0094, -118.4973] },
  { name: '威尼斯海滩公厕', note: '步道边，卫生一般', q: 'Venice Beach Boardwalk, Los Angeles, CA', ll: [33.9850, -118.4695] }
];

// ---------- 换算速查 ----------
export const CONV = {
  temp: [[14, -10], [23, -5], [32, 0], [41, 5], [50, 10], [59, 15], [68, 20], [77, 25]],                 // °F → °C
  dist: [['1 英里', '1.6 公里'], ['25 mph（城区限速）', '40 公里/时'], ['55 mph', '89 公里/时'], ['65 mph（高速）', '105 公里/时'], ['100 英里', '161 公里'], ['1 英尺', '30.5 厘米'], ['1 英寸', '2.54 厘米']],
  weight: [['1 磅（lb）', '0.45 公斤，约 9 两'], ['1 盎司（oz）', '28 克'], ['50 磅（托运上限）', '23 公斤'], ['1 加仑汽油', '3.8 升'], ['12 oz 饮料', '355 毫升'], ['16 oz 一品脱啤酒', '473 毫升']],
  shoesM: [['7', '40'], ['7.5', '40.5'], ['8', '41'], ['8.5', '42'], ['9', '42.5'], ['9.5', '43'], ['10', '44'], ['10.5', '44.5'], ['11', '45'], ['12', '46']],
  shoesW: [['5', '35.5'], ['5.5', '36'], ['6', '36.5'], ['6.5', '37.5'], ['7', '38'], ['7.5', '38.5'], ['8', '39'], ['8.5', '40'], ['9', '40.5']],
  tops: [['XS', '160/80A'], ['S', '165/84A'], ['M', '170/88A'], ['L', '175/92A'], ['XL', '180/96A'], ['XXL', '185/100A']]
};
