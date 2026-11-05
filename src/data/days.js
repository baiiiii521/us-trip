// 每日行程。根据 12/20 方案（A/B/C）和纽约住宿方案生成。
// 每个条目：t 时间，text 说明，pois 关联景点（可点开介绍和导航），leg 城际交通段，game 球赛，buy 预约/购票入口
import { TRIP } from './trip.js';

export function buildDays(state) {
  const p = state.plan;
  const nycHotel = state.hotel === 'lic'
    ? '纽约 · 长岛市（7 号线 / E·M 线，到中城 10–15 分钟）'
    : '纽约 · Penn Station 一带（步行到 Moynihan 大厅和 NJ Transit）';

  const days = [];

  days.push({
    id: '1218', md: '12/18', wd: '周五', city: 'bos', from: 'nyc', title: '落地，直奔波士顿',
    items: [
      { t: '落地', text: 'JFK 入境，预留 1.5–2 小时。食品如实申报。' },
      { t: '+2h', text: 'AirTrain 到 Jamaica，换长岛铁路 LIRR 到 Penn Station。AirTrain 约 $8.75，LIRR 市内票 $5.25–7.25，刷卡进出。', pois: ['moynihan'] },
      { t: '+3h', leg: 's1' },
      { t: '晚上', text: '入住，附近简单吃饭，早睡倒时差。', pois: ['south-station'] }
    ],
    tips: ['火车选落地时间 + 4 小时以后的班次。到达层有人拉客“Need a taxi?”是黑车，直接走开。'],
    stay: '波士顿 · Back Bay 或剑桥（红线沿线）'
  });

  days.push({
    id: '1219', md: '12/19', wd: '周六', city: 'bos', title: '哈佛、MIT、灯光秀',
    items: [
      { t: '09:30', text: '哈佛园：铜像、Widener 图书馆外观。寒假期间楼内不开放，只逛校园。', pois: ['harvard-yard'] },
      { t: '11:00', text: '哈佛广场逛书店，午饭吃 Pinocchio\'s 披萨。' },
      { t: '13:00', text: '红线到 Kendall/MIT：大圆顶、Killian Court、盖里设计的 Stata Center。', pois: ['mit-dome', 'stata'] },
      { t: '14:30', text: '步行过 Harvard Bridge，数桥面的 Smoot 刻度。', pois: ['harvard-bridge'] },
      { t: '15:15', text: '橡果街（日落 16:15 前光线最好）→ 公共花园看小鸭雕像。', pois: ['beacon-hill', 'public-garden'] },
      { t: '17:00', text: 'Newbury Street 节日灯光。' },
      { t: '18:30', text: '昆西市场晚饭：蛤蜊浓汤、龙虾卷。法纳尔厅圣诞树和 Blink! 灯光秀。', pois: ['faneuil-hall'] }
    ],
    tips: ['波士顿地铁可以直接刷信用卡或手机进站。', '查尔斯河边风很大，帽子手套带上。'],
    stay: '波士顿（续住）'
  });

  const d20 = [
    { t: '09:30', text: '退房，行李寄存在酒店前台。' },
    { t: '10:00', text: 'Long Wharf 坐 MBTA F4 渡轮到 Charlestown（约 10 分钟，票价同地铁）。周末班次少，先查时刻表，赶不上就步行约 25 分钟。' },
    { t: '10:30', text: '宪法号：免费，带护照过安检。', pois: ['uss-constitution'], buy: ['uss'] },
    { t: '12:30', text: '北区午饭：Regina Pizzeria，甜品 cannoli 二选一。', pois: ['north-end'] },
    { t: '14:00', text: '自由之路片段：保罗·里维尔故居外观 → 老北教堂外观 → 旧州议会。沿线墓园全部跳过。' },
    { t: '15:30', text: '波士顿公共图书馆 Bates Hall，冬季周日下午开放。', pois: ['bpl'] }
  ];
  if (p === 'A') d20.push(
    { t: '17:30', text: '回酒店取行李，到 South Station 吃晚饭、买车上零食和水。', pois: ['south-station'] },
    { t: '18:45', leg: 's2' }
  );
  if (p === 'B') d20.push(
    { t: '17:00', text: '取行李，寄存到 North Station 附近的寄存点（确认营业到 23 点以后）。', buy: ['bounce', 'lh'] },
    { t: '20:00', game: 'bos' },
    { t: '22:30', text: '取行李，去 South Station 巴士总站等车。', pois: ['south-station'] },
    { t: '01:30', leg: 's2' }
  );
  if (p === 'C') d20.push(
    { t: '17:30', text: '回酒店休息，晚饭在 North Station 一带。' },
    { t: '20:00', game: 'bos' },
    { t: '22:30', text: '散场步行回酒店（这晚建议订 North Station 或市中心）。' }
  );
  days.push({
    id: '1220', md: '12/20', wd: '周日', city: 'bos', title: p === 'A' ? '宪法号、北区，夜车南下' : '宪法号、北区、凯尔特人',
    items: d20,
    tips: p === 'A'
      ? ['67 次只有座位，车厢空调冷，带颈枕、眼罩和一件外套。', '67 次有过晚点 30 多分钟的记录，第二天上午别排要准点的预约。']
      : p === 'B'
        ? ['球馆不让带双肩包和行李箱，行李寄存是这个方案的关键。', '这是三个方案里最累的一个。']
        : ['TD Garden 在 North Station 楼上，散场地铁排队长，可以直接走回酒店。'],
    stay: p === 'A' ? '车上过夜（67 次）' : p === 'B' ? '车上过夜（大巴）' : '波士顿 · North Station 一带（多住一晚）'
  });

  // 12/21 周一：国会图书馆周一闭馆，图书馆统一放到 12/22
  let d21;
  if (p === 'C') {
    d21 = [
      { t: '06:30', leg: 's2' },
      { t: '14:30', text: '到 Union Station，去酒店入住。', pois: ['union-station-dc'] },
      { t: '16:00', text: '白宫北侧外观 → 国家圣诞树（天黑后亮灯，日落 16:50）。', pois: ['white-house', 'national-tree'] },
      { t: '19:00', text: 'U Street 晚饭：Ben\'s Chili Bowl 招牌 half-smoke。', pois: ['bens'] }
    ];
  } else {
    d21 = [
      p === 'B'
        ? { t: '12:30', text: '大巴到 Union Station，去酒店寄存行李，吃午饭。', pois: ['union-station-dc'] }
        : { t: '06:54', text: '到 Union Station，站内吃早饭，行李送到酒店前台寄存。', pois: ['union-station-dc'] },
      ...(p === 'A' ? [{ t: '08:30', text: '国会大厦免费导览（提前在官网约 9 点左右的场次）。', pois: ['capitol'], buy: ['cap'] }] : []),
      { t: p === 'B' ? '14:00' : '11:00', text: '沿国家广场西行：华盛顿纪念碑（只拍不上）→ 二战纪念碑 → 倒影池 → 林肯纪念堂。', pois: ['washington-monument', 'ww2-memorial', 'lincoln'] },
      ...(p === 'A' ? [{ t: '13:00', text: '午饭（国家广场一带选择少，去 L\'Enfant Plaza 或 Penn Quarter）。' }] : []),
      { t: p === 'B' ? '15:30' : '14:00', text: '潮汐湖：杰斐逊纪念堂、马丁·路德·金纪念碑、罗斯福纪念园。', pois: ['jefferson'] },
      ...(p === 'A' ? [{ t: '15:30', text: '回酒店入住补觉，过夜车之后这一觉很重要。' }] : []),
      { t: '17:30', text: '白宫北侧外观 + 国家圣诞树（天黑后亮灯）。', pois: ['white-house', 'national-tree'] },
      { t: '19:00', text: 'U Street 晚饭：Ben\'s Chili Bowl 招牌 half-smoke。', pois: ['bens'] }
    ];
  }
  days.push({
    id: '1221', md: '12/21', wd: '周一', city: 'dc', title: p === 'C' ? '南下，傍晚看圣诞树' : '国家广场和纪念堂',
    items: d21,
    tips: ['华盛顿地铁闸机可以直接刷信用卡或手机，进出都要刷同一张。', '从国会走到林肯纪念堂约 3.5 公里，穿好走的鞋。'],
    stay: '华盛顿 · Penn Quarter / Chinatown（离球馆近）'
  });

  const d22 = p === 'C'
    ? [
      { t: '09:00', text: '国会大厦免费导览（官网预约）。', pois: ['capitol'], buy: ['cap'] },
      { t: '10:30', text: '国会图书馆杰斐逊大楼（定时票）。', pois: ['loc'], buy: ['loc'] },
      { t: '12:00', text: '沿国家广场西行：华盛顿纪念碑 → 二战纪念碑 → 林肯纪念堂。', pois: ['washington-monument', 'ww2-memorial', 'lincoln'] },
      { t: '14:00', text: '杰斐逊纪念堂 + 潮汐湖 + 马丁·路德·金纪念碑。', pois: ['jefferson'] },
      { t: '15:30', text: 'Maine Avenue 鱼市吃现蒸蓝蟹。', pois: ['wharf'] },
      { t: '17:00', text: '回酒店休息。' },
      { t: '18:00', text: '中国城晚饭，球馆就在 Gallery Place 站上面。' },
      { t: '19:00', game: 'was' }
    ]
    : [
      ...(p === 'B' ? [{ t: '09:00', text: '国会大厦免费导览（官网预约）。', pois: ['capitol'], buy: ['cap'] }] : []),
      { t: '10:00', text: '国会图书馆杰斐逊大楼（定时票，周二开馆）。', pois: ['loc'], buy: ['loc'] },
      { t: '11:30', text: '最高法院外观，然后去乔治城。' },
      { t: '12:30', text: '乔治城：M Street、C&O 运河，午饭后来一个 Georgetown Cupcake。', pois: ['georgetown'] },
      { t: '15:30', text: 'Maine Avenue 鱼市吃现蒸蓝蟹，日落看滨水区。', pois: ['wharf'] },
      { t: '17:00', text: '回酒店休息。' },
      { t: '18:00', text: '中国城晚饭，球馆就在 Gallery Place 站上面。' },
      { t: '19:00', game: 'was' }
    ];
  days.push({
    id: '1222', md: '12/22', wd: '周二', city: 'dc', title: p === 'C' ? '国会、纪念堂、奇才' : '国会图书馆、乔治城、奇才',
    items: d22,
    tips: ['奇才是弱队，转售票常在赛前 24–48 小时降价。', '明早坐大巴的话，今晚先在地图上找好 Union Station 巴士层入口。'],
    stay: '华盛顿（续住）'
  });

  days.push({
    id: '1223', md: '12/23', wd: '周三', city: 'phl', from: 'dc', title: '独立厅、芝士牛肉堡、76人',
    items: [
      { t: '08:30', text: '退房，去 Union Station。', pois: ['union-station-dc'] },
      { t: '09:30', leg: 's3' },
      { t: '12:00', text: '到费城，酒店寄存行李。Reading Terminal Market 午饭：DiNic\'s 烤猪肉三明治、Beiler\'s 甜甜圈。', pois: ['reading-terminal'] },
      { t: '13:30', text: '独立厅（定时票）+ 自由钟。', pois: ['independence-hall', 'liberty-bell'], buy: ['rec'] },
      { t: '15:30', text: 'Elfreth\'s Alley，美国最老的住家小巷。', pois: ['elfreth'] },
      { t: '16:30', text: 'LOVE 雕塑拍照，旁边圣诞市集只路过。', pois: ['love-park'] },
      { t: '17:30', text: '南费城 Pat\'s vs Geno\'s 芝士牛肉堡对决。', pois: ['pats-genos'] },
      { t: '19:30', game: 'phi' },
      { t: '22:00', text: '散场坐 Broad Street Line 回市中心，赛后有加开班次。' }
    ],
    tips: ['费城地铁 SEPTA 可以刷卡，一张卡最多能替 5 个人付费。', '12/23 是圣诞前出行高峰，大巴千万别坐下午的车。'],
    stay: '费城 · Center City（市政厅附近）'
  });

  days.push({
    id: '1224', md: '12/24', wd: '周四', city: 'nyc', from: 'phl', title: '平安夜：橱窗和洛克菲勒圣诞树',
    items: [
      { t: '09:00', text: '（可选）Rocky 铜像拍照，不进馆、不爬台阶也可以。', pois: ['rocky-steps'] },
      { t: '10:30', leg: 's4' },
      { t: '13:00', text: '到纽约，酒店寄存或入住。' },
      { t: '14:30', text: '第五大道橱窗：Bergdorf Goodman → Saks（入夜外墙灯光秀）→ 洛克菲勒圣诞树 → 圣帕特里克大教堂外观。', pois: ['rockefeller-tree', 'st-patricks'] },
      { t: '16:30', text: '布莱恩公园 Winter Village：全程唯一逛的节日市集。', pois: ['bryant-park'] },
      { t: '18:00', text: '梅西百货圣诞橱窗。', pois: ['macys'] },
      { t: '19:30', text: '平安夜晚餐。很多餐厅这天只做套餐，提前两周订位。', buy: ['ot', 'resy'] }
    ],
    tips: ['平安夜傍晚第五大道和洛克菲勒中心会分流管制，排队 20–40 分钟很正常。', '纽约地铁用 OMNY 刷卡，每人用自己的卡或手机，7 天内刷满 $35 后免费。'],
    stay: nycHotel
  });

  days.push({
    id: '1225', md: '12/25', wd: '周五', city: 'nyc', title: '圣诞日：公园、唐人街、灯光',
    items: [
      { t: '08:30', text: '早起再看一次洛克菲勒圣诞树，早上人最少。', pois: ['rockefeller-tree'] },
      { t: '10:00', text: '中央公园：Gapstow 桥 → The Mall → 贝塞斯达喷泉 → Bow Bridge。', pois: ['central-park'] },
      { t: '12:00', game: 'nyk25', text: '尼克斯 vs 马刺圣诞大战中午开球。票太贵不买，找开门的体育酒吧看直播。' },
      { t: '13:30', text: '唐人街 + 小意大利。圣诞节中餐馆照常营业：Nom Wah 点心、Joe\'s Shanghai 小笼包。', pois: ['chinatown'] },
      { t: '16:00', text: '地铁 D 线到 79 St（或 R 线到 86 St），步行到 Dyker Heights 看圣诞灯。', pois: ['dyker'] },
      { t: '20:00', text: '回酒店。' }
    ],
    tips: ['圣诞日大都会、多数商店和不少餐厅关门，地铁按周日时刻表跑。', 'Dyker Heights 21 点后不少人家关灯。'],
    stay: nycHotel
  });

  days.push({
    id: '1226', md: '12/26', wd: '周六', city: 'nyc', title: '布鲁克林大桥、DUMBO、篮网',
    items: [
      { t: '09:00', text: '从曼哈顿一侧上布鲁克林大桥，往布鲁克林走约 40 分钟。', pois: ['brooklyn-bridge'] },
      { t: '10:00', text: 'DUMBO：桥洞框住帝国大厦的机位、Jane\'s 旋转木马。', pois: ['dumbo'] },
      { t: '12:00', text: '午饭：Juliana\'s 披萨或 Time Out Market 美食广场。' },
      { t: '13:30', text: '布鲁克林高地观景步道看天际线。', pois: ['promenade'] },
      { t: '15:00', text: '可选回酒店放东西。进球馆不能背双肩包。' },
      { t: '17:00', text: 'Junior\'s 晚饭和芝士蛋糕，离球馆步行 5 分钟。' },
      { t: '18:00', game: 'bkn' }
    ],
    tips: ['弱队场次临近开赛常降价。', '12/26 是节后返程高峰，这天别安排城际移动。'],
    stay: nycHotel
  });

  days.push({
    id: '1227', md: '12/27', wd: '周日', city: 'nyc', title: '大都会和中城夜景',
    items: [
      { t: '10:00', text: '大都会艺术博物馆约 2.5 小时：圣诞树和那不勒斯诞生场景、丹铎神庙、欧洲绘画。', pois: ['met'], buy: ['met'] },
      { t: '12:30', text: '上东区午饭，中央公园北段散步。' },
      { t: '15:30', text: '（可选）Summit One Vanderbilt 看日落（16:30）。', pois: ['summit'], buy: ['summit'] },
      { t: '18:00', text: '中央车站：耳语廊、星空天花。', pois: ['grand-central'] },
      { t: '19:30', text: '时代广场夜景。', pois: ['times-square'] },
      { t: '可选', game: 'nyk27', text: '加看一场：尼克斯 vs 篮网，开球时间以 NBA App 为准，德比票价偏高。' }
    ],
    tips: ['大都会周三和 12/25 闭馆，只能排在这天前后的周日、周一、周二。', '时代广场人偶合影要给钱。'],
    stay: nycHotel
  });

  days.push({
    id: '1228', md: '12/28', wd: '周一', city: 'nyc', title: '免费渡轮、下城、高线公园',
    items: [
      { t: '09:00', text: '史泰登岛渡轮：免费，去程站右舷看自由女神，到岸后坐回程。', pois: ['staten-ferry'] },
      { t: '10:30', text: '华尔街铜牛 + 无畏女孩 → 纽交所外观。', pois: ['charging-bull'] },
      { t: '12:00', text: '9/11 纪念池 + Oculus。', pois: ['911-memorial', 'oculus'] },
      { t: '13:00', text: '午饭。' },
      { t: '14:30', text: 'SoHo 铸铁建筑 → 格林威治村：《老友记》公寓外观（Bedford St & Grove St）。' },
      { t: '16:00', text: '切尔西市场 → 高线公园日落 → Little Island。', pois: ['chelsea-market', 'high-line', 'little-island'] },
      { t: '18:30', text: 'Joe\'s Pizza，纽约一片披萨。' }
    ],
    tips: ['史泰登岛渡轮比付费自由女神游船两人省 $50 以上，也不用进移民博物馆。'],
    stay: nycHotel
  });

  days.push({
    id: '1229', md: '12/29', wd: '周二', city: 'nyc', title: '弹性日：天气兜底',
    items: [
      { t: '方案 1', text: '7 号线去法拉盛吃中餐和奶茶。', pois: ['flushing'] },
      { t: '方案 2', text: '罗斯福岛缆车，刷 OMNY，空中看东河。', pois: ['roosevelt-tram'] },
      { t: '方案 3', text: '哈莱姆：Apollo 剧院外观，125 街。', pois: ['apollo'] },
      { t: '晚上', text: '韩国城 32 街烤肉。' }
    ],
    tips: ['前几天如果遇到暴雪，把取消的户外项目挪到这天。'],
    stay: nycHotel
  });

  days.push({
    id: '1230', md: '12/30', wd: '周三', city: 'nyc', title: '纪念品，晚上去机场',
    items: [
      { t: '10:00', text: '退房，行李寄存在酒店前台，每件给 $2–5 小费。' },
      { t: '11:00', text: '时代广场：往年 12/30 上午有跨年彩纸“试飞”。', pois: ['times-square'] },
      { t: '12:00', text: '第五大道 NBA Store：篮球之旅的纪念品，购物只排这天。', pois: ['nba-store'] },
      { t: '14:00', text: '最后一顿网红小吃：Levain 曲奇、Joe\'s Pizza。' },
      { t: '18:00', text: '回酒店取行李。' },
      { t: '19:00', text: 'NJ Transit 从 Penn Station 到 Newark Airport 站，换 AirTrain 到航站楼，约 $16.80/人（票里含 AirTrain 费）。', buy: state.opts.ewr ? ['njt', 'booking', 'trip'] : ['njt'], pois: ['moynihan'] }
    ],
    tips: ['大都会周三闭馆，别挪到这天。', '订了机场酒店的话，晚饭后就动身，NJ Transit 末班在午夜前后。'],
    stay: state.opts.ewr ? '纽瓦克机场酒店' : '机场过夜（建议改订机场酒店）'
  });

  days.push({
    id: '1231', md: '12/31', wd: '周四', city: 'la', from: 'nyc', title: '转机半天：圣莫尼卡到威尼斯',
    items: [
      { t: '早班', text: '纽瓦克 → 洛杉矶。两段机票分开买，行李只托运到洛杉矶，落地取行李。' },
      { t: '落地', text: '免费接驳车到 LAX/Metro 交通中心 → K 线北行 → Expo/Crenshaw 换 E 线西行 → Downtown Santa Monica，约 60–75 分钟，$1.75。', pois: ['lax-transit'], buy: ['lametro'] },
      { t: '+1.5h', text: '圣莫尼卡用 App 预约行李寄存。', buy: ['bounce', 'lh'] },
      { t: '午后', text: '圣莫尼卡码头 → 沿海滩步道走到威尼斯海滩（约 3 公里）→ 威尼斯运河。', pois: ['santa-monica-pier', 'venice-beach', 'venice-canals'] },
      { t: '起飞前 5h', text: '取行李回机场：E 线 → K 线 → 接驳车，或打车约 $30–45。12/31 傍晚路况差。' },
      { t: '起飞前 3h', text: '到国际航班值机柜台。' }
    ],
    tips: ['LAX 机场捷运最新目标 2027-01-06 才通，这次还是坐接驳车。', '跨年夜圣莫尼卡人多，看好手机和钱包。'],
    stay: '国际航班'
  });

  return days;
}

// 行程日期 → Date（本地时区）
export function dayDate(day) {
  const [m, d] = day.md.split('/').map(Number);
  return new Date(Number(TRIP.start.slice(0, 4)), m - 1, d);
}
