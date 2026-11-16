// 每日行程。12/20 固定按方案 C（看凯尔特人、波士顿住 3 晚），住宿按已订酒店的真实位置写路线。
// 租车方案（state.rent）改变 12/18、12/21、12/23、12/24 四天：jfk 落地取车 / bos 12/21 波士顿取车 / none 不租车。
// 每个条目：t 时间，text 说明，pois 关联景点（可点开介绍和导航），leg 城际交通段，game 球赛，buy 预约/购票入口
import { TRIP } from './trip.js';
import { stayText, HOTEL_OF } from './hotels.js';
import { DRIVES, PICKUP, DROPOFF } from './drive.js';

// 去机场的导航目的地（今天模式的“导航到”按钮用）
const EWR_C = { name: '纽瓦克机场 C 航站楼', q: 'Newark Liberty International Airport Terminal C, Newark, NJ' };
const LAX_T7 = { name: '洛杉矶机场 T7', q: 'LAX Terminal 7, Los Angeles, CA' };

// 已订酒店的“最后一公里”提示，前面注明最近的地铁站
const T = {
  bos: '橙线 Massachusetts Ave 站（走 8 分钟）',
  dc: '红线 NoMa–Gallaudet 站（走 5 分钟）／联合车站走 10 分钟',
  phl: '集市-法兰克福线 5th St 站（走 3 分钟，站口在 Market St 上）',
  nyc: 'DeKalb Av 站（B/Q/R，走 6 分钟）／Jay St–MetroTech 站（A/C/F/R，走 8 分钟）'
};

export function buildDays(state) {
  const days = [];
  const rent = state.rent || 'none';
  const NYC_ADDR = HOTEL_OF.nyc.addr;
  const nycHotel = stayText('nyc');

  if (rent === 'jfk') {
    days.push({
      id: '1218', md: '12/18', wd: '周五', city: 'bos', from: 'nyc', title: '落地取车，开去波士顿',
      items: [
        { t: '10:55 落地', slot: 'flight-in', text: 'MF849 从福州 09:20 起飞，JFK T4 10:55 落地。前一段是 12/17 13:45 郑州 CGO T2（MF8280），福州跨夜中转 17h25m，行李要在福州取出来重新托运。入境排队 1.5–2 小时，食品如实申报。' },
        { t: '12:45', text: '出关后先别急着上路：到达层吃点东西、买咖啡，手机连上 eSIM，把导航目的地设成波士顿酒店。' },
        { t: '13:00 取车', drive: 'pickup', text: `${PICKUP.jfk.how} 准备好驾照原件 + 翻译件、护照、主驾驶的信用卡；两人都登记为驾驶员，确认含过路费电子收费服务。取车时绕车拍一圈视频。` },
        { t: '14:00', leg: 's1' },
        { t: '16:00', text: '必停一次：康州 I-95 上的 Milford 服务区（离 JFK 约 1.5 小时）。上厕所、换人开。先喝咖啡再眯 20 分钟，醒来咖啡因正好起效。不困也要停：这时候身体是北京时间凌晨 5 点。' },
        { t: '19:00 前后', text: '到酒店（811 Massachusetts Ave）：车直接开进酒店停车场，行李上楼。入住后附近简单吃饭，早睡倒时差。' }
      ],
      warn: DRIVES.s1.risk,
      tips: ['周五下午出纽约是一周最堵的时候，晚高峰前过了 Whitestone 大桥会好很多。', '12/17 下午 13:45 郑州起飞，行李在福州要重新托运一次，值机时问一句能不能直挂到 JFK。', `酒店最近的地铁是${T.bos}，12/19、12/20 车停着不动，全程坐地铁。`],
      pace: { km: 2, lv: 3, cut: '落地后实在撑不住：在康州服务区睡够再走，晚到两小时没关系；酒店前台 24 小时都能办入住。' },
      stay: stayText('bos')
    });
  } else {
    days.push({
      id: '1218', md: '12/18', wd: '周五', city: 'bos', from: 'nyc', title: '落地，直奔波士顿',
      items: [
        { t: '10:55 落地', slot: 'flight-in', text: 'MF849 从福州 09:20 起飞，JFK T4 10:55 落地。前一段是 12/17 13:45 郑州 CGO T2（MF8280），福州跨夜中转 17h25m，行李要在福州取出来重新托运。入境排队 1.5–2 小时，食品如实申报。' },
        { t: '+2h', text: 'AirTrain 到 Jamaica，换长岛铁路 LIRR 到 Penn Station。AirTrain 约 $8.75，LIRR 市内票 $5.25–7.25，刷卡进出。', pois: ['moynihan'] },
        { t: '+3h', leg: 's1' },
        { t: '到站', text: 'South Station 到酒店（811 Massachusetts Ave，South End 边上）约 2 英里：带行李直接打车 10 分钟（$12–15）；想省钱就走到 Downtown Crossing 坐橙线两站到 Massachusetts Ave，再走 8 分钟。', pois: ['south-station'] },
        { t: '晚上', text: '入住，酒店附近简单吃饭，早睡倒时差。' }
      ],
      tips: ['火车选落地时间 + 4 小时以后的班次，在车上补觉。到达层有人拉客“Need a taxi?”是黑车，直接走开。', '12/17 下午 13:45 郑州起飞，行李在福州要重新托运一次，值机时问一句能不能直挂到 JFK。', `酒店最近的地铁是${T.bos}，之后几天都从这儿进出。`],
      pace: { km: 3, lv: 3, cut: '入境排队太久赶不上订的火车：Value 票可以免费改签到下一班。' },
      stay: stayText('bos')
    });
  }

  days.push({
    id: '1219', md: '12/19', wd: '周六', city: 'bos', title: '哈佛、MIT、灯光秀',
    items: [
      { t: '08:30', text: `坐 1 路公交去哈佛园，酒店门口 Massachusetts Ave 上车，不用换乘（约 35–40 分钟）；或者${T.bos}，换红线到 Harvard。时差会让你们五六点就醒，早点出门正好。哈佛园看铜像、Widener 图书馆外观；寒假期间楼内不开放，只逛校园。`, pois: ['harvard-yard'] },
      { t: '10:15', text: '哈佛广场逛书店，11:00 吃 Pinocchio\'s 披萨当早午饭。' },
      { t: '12:00', text: '红线两站到 Kendall/MIT：盖里设计的 Stata Center → Killian Court 和大圆顶。', pois: ['stata', 'mit-dome'] },
      { t: '13:30', text: '步行过 Harvard Bridge 到波士顿一侧，数桥面的 Smoot 刻度。河上风大，戴好帽子。', pois: ['harvard-bridge'] },
      { t: '14:00', text: '下桥沿 Massachusetts Ave 走 5 分钟就是 Newbury Street 的西头，一路往东逛（约 1.5 公里）。下午 3 点是身体最困的时候（北京时间凌晨 4 点），找家咖啡馆坐半小时。' },
      { t: '15:15', text: 'Newbury Street 东头接着公共花园：小鸭雕像 → 过马路上比肯山，橡果街赶在日落（16:15）前拍。', pois: ['public-garden', 'beacon-hill'] },
      { t: '16:30', text: '下山就是 Boston Common：天黑后圣诞树和青蛙塘溜冰场亮灯。' },
      { t: '17:15', text: '走 15 分钟（或 Park St 坐绿线一站）到昆西市场，早点吃晚饭：蛤蜊浓汤、龙虾卷。法纳尔厅圣诞树和 Blink! 灯光秀。', pois: ['faneuil-hall'] },
      { t: '19:00', text: 'State 站坐橙线回酒店，争取 21 点睡。' }
    ],
    tips: [...(rent === 'jfk' ? ['车停在酒店停车场不动，今天全程坐地铁，市区停车又贵又难找。'] : []), '今天的路线是一条线：哈佛 → MIT → 过桥 → Newbury 街 → 公共花园 → 比肯山 → 昆西市场，从西往东，不走回头路。', '波士顿地铁和公交可以直接刷信用卡或手机。', '酒店在 South End 生活区，晚上回来的路上餐馆比市中心多。'],
    pace: { km: 10, lv: 3, cut: '下午实在太困：过桥后坐 1 路公交回酒店睡 40 分钟（定闹钟），傍晚只去昆西市场。' },
    stay: `${stayText('bos')} · 续住`
  });

  days.push({
    id: '1220', md: '12/20', wd: '周日', city: 'bos', title: '宪法号、北区、凯尔特人',
    items: [
      { t: '09:30', text: '今天不退房（酒店订到 12/21）。出门坐橙线到 State，换蓝线一站到 Aquarium。' },
      { t: '10:00', text: 'Long Wharf 坐 MBTA F4 渡轮到 Charlestown（约 10 分钟，票价同地铁）。周末班次少，先查时刻表，赶不上就从 North Station 步行约 20 分钟过去。' },
      { t: '10:30', text: '宪法号：免费，带护照过安检。海军官网写周三到周日 10:00–18:00。', pois: ['uss-constitution'], buy: ['uss'] },
      { t: '12:30', text: '走过 Charlestown 桥到北区（约 15 分钟）。午饭：Regina Pizzeria，甜品 cannoli 二选一。', pois: ['north-end'] },
      { t: '14:00', text: '自由之路片段，从北往南顺着走：老北教堂外观 → 保罗·里维尔故居外观 → 旧州议会。沿线墓园全部跳过。' },
      { t: '15:30', text: '绿线到 Copley：波士顿公共图书馆 Bates Hall，冬季周日下午开放，进去坐一会儿。', pois: ['bpl'] },
      { t: '16:30', text: '图书馆往北一个街口就是 Newbury Street，天黑了节日灯正好亮，走一小段。' },
      { t: '17:00', text: '橙线 Back Bay 一站到 Massachusetts Ave，回酒店歇 1 小时，把明天要带走的箱子先收好。' },
      { t: '18:30', text: '橙线到 North Station，晚饭在球馆楼下的 Hub Hall 美食广场或周边吃。' },
      { t: '20:00', game: 'bos' },
      { t: '22:30', text: '散场不用挤地铁：TD Garden 就在 North Station 楼上，橙线 5 站到 Massachusetts Ave（约 12 分钟），再走 8 分钟回酒店。' }
    ],
    tips: ['TD Garden 不让带双肩包和大行李，今天别把箱子拖过去。', '橙线末班在午夜后不久，散场别在球场里拖太久。', '明天 07:30 要开长途：散场直接回酒店睡，别再加活动。'],
    pace: { km: 8, lv: 2, cut: '累了砍掉自由之路片段：北区吃完直接坐绿线去图书馆坐着。' },
    stay: `${stayText('bos')} · 续住（第 3 晚）`
  });

  if (rent !== 'none') {
    // 波士顿 → 华盛顿 450 英里拆成三段：中午在纽黑文停 2 小时（耶鲁校园 + 披萨），下午在新泽西服务区再换一次人
    const south = [
      { t: '10:00', nav: { name: '纽黑文 Frank Pepe 披萨', q: 'Frank Pepe Pizzeria Napoletana, 157 Wooster St, New Haven, CT', mode: 'driving' }, text: '到纽黑文（开了 2.5 小时，全程的三分之一）。车停在 Wooster St 路边咪表或旁边的停车场，后备箱别开。先走 15 分钟去耶鲁老校区：Phelps 门、Harkness 塔、Sterling 图书馆外观。今天周一，耶鲁美术馆闭馆，只逛校园。' },
      { t: '11:00', nav: { name: '纽黑文 Frank Pepe 披萨', q: 'Frank Pepe Pizzeria Napoletana, 157 Wooster St, New Haven, CT', mode: 'driving' }, text: 'Frank Pepe 披萨（157 Wooster St），纽黑文披萨的老店：一开门就进，不用排队。招牌是白蛤蜊披萨（White Clam Pie）。开门时间有 10:30 和 11:00 两种说法，出发前看一眼官网。' },
      { t: '12:15', nav: { name: HOTEL_OF.dc.zh, q: HOTEL_OF.dc.addr, mode: 'driving' }, text: '换人开，上路：I-95 南 → I-287 西过 Mario Cuomo 大桥（绕开纽约市区）→ 新泽西收费公路。15:00 前后在 Molly Pitcher 服务区停 15 分钟，上厕所、再换一次人。' },
      { t: '18:00', text: '到酒店（1225 First St NE，NoMa 一带），天已经黑了：车交给代客泊车或停进车库，12/22 全天不碰车。', pois: ['union-station-dc'] },
      { t: '19:00', text: '晚饭就近吃：走 10 分钟到联合车站，或红线两站到 Gallery Place 的中国城。', pois: ['union-station-dc'] },
      { t: '可选 20:00', text: '精神好再去：红线到 Metro Center，走 10 分钟看白宫北侧外观 → 国家圣诞树（日落后亮灯，往年平日亮到 22:00）。累了就不去，明天中午走到华盛顿纪念碑时往北 5 分钟，白天看一眼。', pois: ['white-house', 'national-tree'] }
    ];
    days.push({
      id: '1221', md: '12/21', wd: '周一', city: 'dc', from: 'bos', title: '开车南下，中午停纽黑文',
      items: rent === 'jfk' ? [
        { t: '07:15', text: '退房，从酒店停车场取车。出城前加满油，行李全放后备箱、拉上遮物帘。' },
        { t: '07:30', leg: 's2' },
        ...south
      ] : [
        { t: '06:30 取车', drive: 'pickup', text: PICKUP.bos.how },
        { t: '07:30', leg: 's2' },
        ...south
      ],
      warn: DRIVES.s2.risk,
      tips: ['想早点到华盛顿：跳过纽黑文，从 I-84 直接接 I-684 → I-287，07:00 出发 15:30 到，天黑前还能去看圣诞树。', '华盛顿地铁闸机可以直接刷信用卡或手机，进出都要刷同一张。', '晚上最后 30 分钟进城赶上晚高峰的尾巴，让精神好的那个人开。'],
      pace: { km: 4, lv: 3, cut: '下雪或者起晚了：跳过纽黑文走直路；晚上的圣诞树挪到明天中午。' },
      stay: stayText('dc')
    });
  } else {
    days.push({
      id: '1221', md: '12/21', wd: '周一', city: 'dc', from: 'bos', title: '南下，傍晚看圣诞树',
      items: [
        { t: '05:40 出门', text: '早班火车，橙线头班车太赶，直接从酒店打车到 South Station（10 分钟，$12–15）。' },
        { t: '06:30', leg: 's2' },
        { t: '14:30', text: '到联合车站，走到酒店（1225 First St NE，NoMa 一带，约 10 分钟，一路有行李通道）。', pois: ['union-station-dc'] },
        { t: '16:00', text: '酒店出门往南走 15 分钟就是国会山：白宫北侧外观 → 国家圣诞树（天黑后亮灯，日落 16:50）。', pois: ['white-house', 'national-tree'] },
        { t: '19:00', text: '晚饭：红线 NoMa–Gallaudet 两站到 Gallery Place，中国城一带选择多；或去 U Street 吃 Ben\'s Chili Bowl 的 half-smoke。', pois: ['bens'] }
      ],
      tips: ['华盛顿地铁闸机可以直接刷信用卡或手机，进出都要刷同一张。', '从国会走到林肯纪念堂约 3.5 公里，穿好走的鞋。', '酒店离联合车站步行 10 分钟，12/23 走的时候不用打车。'],
      pace: { km: 5, lv: 2, cut: '火车坐累了：只去看国家圣诞树，白宫外观明天白天顺路看。' },
      stay: stayText('dc')
    });
  }

  days.push({
    id: '1222', md: '12/22', wd: '周二', city: 'dc', title: '国会、纪念堂、奇才',
    items: [
      { t: '09:00', text: '走 15 分钟到国会大厦，免费导览（官网预约）。', pois: ['capitol'], buy: ['cap'] },
      { t: '10:30', text: '国会图书馆杰斐逊大楼，就在国会后面，走过去 5 分钟（定时票）。', pois: ['loc'], buy: ['loc'] },
      { t: '11:45', text: '午饭在国会山吃：国会游客中心的餐厅，或 Pennsylvania Ave SE 上的小馆子。吃饱再走，下午 4 公里沿途几乎没有吃的。' },
      { t: '12:45', text: 'Capitol South 坐蓝/橙/银线 3 站到 Smithsonian（省 2 公里路），出站就是华盛顿纪念碑 → 二战纪念碑 → 沿倒影池走到林肯纪念堂。昨晚没看圣诞树的话，从纪念碑往北走 5 分钟就是。', pois: ['washington-monument', 'ww2-memorial', 'lincoln'] },
      { t: '14:30', text: '从林肯纪念堂往南顺着走：马丁·路德·金纪念碑 → 沿潮汐湖 → 杰斐逊纪念堂，不走回头路。', pois: ['jefferson'] },
      { t: '15:45', text: '走 15 分钟到 Maine Avenue 鱼市吃现蒸蓝蟹，当下午茶，别吃太撑。', pois: ['wharf'] },
      { t: '16:45', text: 'L\'Enfant Plaza 坐绿/黄线到 Gallery Place 换红线，回酒店歇 45 分钟。' },
      { t: '18:00', text: '红线两站到 Gallery Place，球馆就在站上面，晚饭在中国城吃。' },
      { t: '19:00', game: 'was' }
    ],
    tips: ['奇才是弱队，转售票常在赛前 24–48 小时降价。', '上午国会和图书馆都在酒店南边 15 分钟步行圈里；下午从纪念碑到鱼市一路往西再往南，约 5 公里，全是平路。'],
    pace: { km: 11, lv: 3, cut: '下午冷或者累：走到林肯纪念堂就收，往北走 15 分钟到 Foggy Bottom 站坐地铁回酒店，跳过潮汐湖和鱼市。' },
    stay: `${stayText('dc')} · 续住`
  });

  // 费城半天：先把西边的（市场、LOVE 雕塑）看完，再回东边老城区，不来回折返；开球前留 1 小时休息
  const phlRest = [
    { t: '13:00', text: '从 Reading Terminal 往西走 8 分钟：LOVE 雕塑拍照，旁边的圣诞市集白天顺路看一眼。', pois: ['love-park'] },
    { t: '13:45', text: '回老城区：15th St 坐集市-法兰克福线 4 站到 5th St（或走 20 分钟）。' },
    { t: '14:15', text: '独立厅（定时票，订 14:15 前后那一场）+ 对面的自由钟，就在酒店旁边两个街区。', pois: ['independence-hall', 'liberty-bell'], buy: ['rec'] },
    { t: '15:45', text: 'Elfreth\'s Alley，美国最老的住家小巷，离酒店 5 分钟，赶在日落（16:40）前。', pois: ['elfreth'] },
    { t: '16:15', text: '回酒店办入住，休息 1 小时。' },
    { t: '17:30', text: '南费城 Pat\'s vs Geno\'s 芝士牛肉堡对决，打车 10 分钟，吃完直接去球馆。', pois: ['pats-genos'] },
    { t: '19:30', game: 'phi' },
    { t: '22:00', text: '散场：宽街线（Broad Street Line）北上到 15th St，换集市-法兰克福线到 5th St，走 3 分钟回酒店；赛后有加开班次。' }
  ];
  days.push({
    id: '1223', md: '12/23', wd: '周三', city: 'phl', from: 'dc', title: '独立厅、芝士牛肉堡、76人',
    items: rent !== 'none' ? [
      { t: '08:30', text: '退房取车，行李进后备箱。' },
      { t: '08:45', leg: 's3' },
      { t: '11:30', text: '到费城酒店（400 Arch St，老城区）：车停酒店停车场，行李寄存。午饭 Reading Terminal Market：DiNic\'s 烤猪肉三明治、Beiler\'s 甜甜圈（从酒店往西走 12 分钟）。', pois: ['reading-terminal'] },
      ...phlRest
    ] : [
      { t: '08:30', text: '退房，走 10 分钟到联合车站（不用打车）。', pois: ['union-station-dc'] },
      { t: '09:30', leg: 's3' },
      { t: '12:00', text: '到费城后打车 8 分钟到酒店（400 Arch St，老城区），先寄存行李。午饭 Reading Terminal Market：DiNic\'s 烤猪肉三明治、Beiler\'s 甜甜圈（从酒店往西走 12 分钟）。', pois: ['reading-terminal'] },
      ...phlRest
    ],
    tips: rent !== 'none'
      ? ['去球馆别开车：散场堵、停车贵，坐地铁 15 分钟。车在酒店停车场过夜。', '独立厅上午 10 点以后要定时票，一般最后一场在 16:15 左右；12/24 只开到 15:00，所以今天看。', '费城地铁 SEPTA 可以刷卡，一张卡最多能替 5 个人付费。', '酒店在 Arch St 上，独立厅、自由钟、Elfreth\'s Alley 全在步行 5–10 分钟里。']
      : ['费城地铁 SEPTA 可以刷卡，一张卡最多能替 5 个人付费。', '独立厅上午 10 点以后要定时票，一般最后一场在 16:15 左右；12/24 只开到 15:00，所以今天看。', '12/23 是圣诞前出行高峰，大巴千万别坐下午的车。', '酒店在 Arch St 上，独立厅、自由钟、Elfreth\'s Alley 全在步行 5–10 分钟里，明天走之前还能再看一眼。'],
    pace: { km: 6, lv: 2, cut: '路上堵车到晚了：砍掉 LOVE 雕塑，午饭后直接回老城区看独立厅。' },
    stay: stayText('phl')
  });

  // 平安夜中城 7 站，由南往北一路不走回头路（约 3.4 公里，连逛带停 3–4 小时）。
  // 中央车站圣诞市集只开到 12/24，平安夜 18:00 关门，是全程唯一能赶上的一天，所以 16:15 前后到。
  const nyc24 = [
    { t: '15:00', text: '① 梅西百货圣诞橱窗（34 街，先驱广场）。从这里开始一路往北走。', xmas: { s: 'open', note: '橱窗在街边，商店关门也能看；平安夜商店一般提早关门' }, pois: ['macys'] },
    { t: '15:40', text: '② 沿第六大道走到布莱恩公园 Winter Village：节日市集和溜冰场。', xmas: { s: 'check', note: '官网写平日 11:00–20:00，开到 2027-01-03；平安夜会不会提早关门官网还没写（11-14 查）' }, pois: ['bryant-park'] },
    { t: '16:15', text: '③ 往东走 5 分钟到中央车站 Vanderbilt Hall 的圣诞市集（Holiday Fair），再看一眼主大厅的星空天花板。', xmas: { s: 'open', note: '官方资料：开到 12/24，平安夜 10:00–18:00。这是全程唯一能赶上的一天，12/27 再来市集已经撤了' }, pois: ['grand-central'] },
    { t: '17:00', text: '④ 沿麦迪逊大道往北到 50 街，乐天纽约皇宫酒店中庭看圣诞布置。', xmas: { s: 'check', note: '酒店中庭平时免费进，平安夜人多时可能只让住客进，进不去就在铁门外拍' }, pois: ['lotte-palace'] },
    { t: '17:30', text: '⑤ 过马路到第五大道：圣帕特里克大教堂外观 → Saks 橱窗和外墙灯光秀（天黑后每隔几分钟一场）→ ⑥ 正对面的洛克菲勒圣诞树。日落约 16:30，这时候灯都亮了。', xmas: { s: 'check', note: '圣诞树 12/2 点灯，每天几点亮灯官网还没公布（11-14 查）；平安夜傍晚这一段会分流管制，排队 20–40 分钟很正常' }, pois: ['st-patricks', 'rockefeller-tree'] },
    { t: '18:45', text: '⑦ 沿第五大道往北走到 59 街的广场酒店收尾，看大堂圣诞布置，对面就是中央公园。', xmas: { s: 'check', note: '大堂平安夜晚上常限流，看不进去就在门口喷泉广场拍照' }, pois: ['plaza-hotel'] },
    { t: '19:30', xmas: { s: 'check', note: '不少餐厅这天只做套餐或干脆不开，订位时确认营业时间' }, text: '平安夜晚餐：订在中城 50–59 街一带，走完正好就近吃。很多餐厅这天只做套餐，提前两周订位。吃完从 5 Av/59 St 坐 N/R/W 回布鲁克林（R 线到 DeKalb Av）。', buy: ['ot', 'resy'] }
  ];
  days.push({
    id: '1224', md: '12/24', wd: '周四', city: 'nyc', from: 'phl', title: rent !== 'none' ? '开回纽约还车，平安夜中城 7 站' : '平安夜：中城 7 站看圣诞',
    items: rent !== 'none' ? [
      { t: '08:15', text: '（可选）Rocky 铜像拍照：开车 10 分钟，博物馆有付费停车场，拍完就走。行李一直锁在后备箱。', pois: ['rocky-steps'] },
      { t: '09:00', leg: 's4' },
      { t: '11:15', text: `到公寓楼下（${NYC_ADDR}）：在大楼门口装卸区打双闪，一人看车，一人把行李搬进大楼。提前和房东约好中午能不能先放行李（入住一般 15:00 后）。房东不让提前放就别卸：直接开去还车，还完车带行李打车回公寓（约 15 分钟，$20–30）。` },
      { t: '11:35', text: '在布鲁克林这边把油加满（订单是满油取还，曼哈顿下城几乎没有加油站），保留小票，然后走布鲁克林大桥进曼哈顿。' },
      { t: '12:00 还车', drive: 'dropoff', text: `${DROPOFF.how} ${DROPOFF.why}` },
      { t: '12:30', text: '还完车就在曼哈顿下城：Stone Street 一带慢慢吃午饭，饭后可以在炮台公园看一眼自由女神（远景）。' },
      { t: '14:30', text: '从 Whitehall St 坐 R/W 线到 34 St–Herald Sq（约 15 分钟），开始下午的中城 7 站。' },
      ...nyc24
    ] : [
      { t: '09:00', text: '（可选）Rocky 铜像拍照，从酒店打车 10 分钟，不进馆、不爬台阶也可以。', pois: ['rocky-steps'] },
      { t: '10:30', leg: 's4' },
      { t: '13:00', text: '到曼哈顿后去布鲁克林：Penn Station 坐长岛铁路 LIRR 到 Atlantic Terminal（20 分钟，带行李最省事），出站走 12 分钟到公寓。', pois: ['moynihan'] },
      { t: '14:30', text: `公寓一般 15:00 后才能入住，早到先和房东约好放行李。然后从 ${T.nyc} 坐 B/Q 或 R 线到 34 St–Herald Sq（约 20 分钟），开始下午的中城 7 站。` },
      ...nyc24
    ],
    tips: [
      ...(rent !== 'none' ? ['Sixt Battery Park 平安夜可能只开到 13:00（官网的节假日时间），12:15 前还掉；出发前一天打电话或在 Sixt App 里确认。', '进曼哈顿还车要交拥堵费，白天约 $9，租车公司代扣。曼哈顿禁止红灯右转，车一还，之后全靠地铁。'] : []),
      '下午路线由南往北：梅西 → 布莱恩公园 → 中央车站 → 乐天皇宫 → Saks 和洛克菲勒 → 广场酒店，全程约 3.4 公里，不走回头路。中央车站市集 18:00 关门，别把顺序倒过来。',
      '平安夜傍晚第五大道和洛克菲勒中心会分流管制，排队 20–40 分钟很正常。',
      '纽约地铁用 OMNY 刷卡，每人用自己的卡或手机，7 天内刷满 $35 后免费。',
      `公寓最近的地铁是${T.nyc}；住布鲁克林进出曼哈顿单程 15–20 分钟。`
    ],
    pace: { km: 7, lv: 3, cut: '体力不够就跳过 ④ 乐天皇宫和 ⑦ 广场酒店，看完洛克菲勒直接去吃饭。' },
    stay: nycHotel
  });

  days.push({
    id: '1225', md: '12/25', wd: '周五', city: 'nyc', title: '圣诞日：公园、唐人街、灯光',
    items: [
      { t: '可选 08:30', xmas: { s: 'check', note: '往年圣诞日全天亮灯，2026 年的时间官网还没公布；B 线圣诞节不开，坐 Q 线' }, text: '昨晚没挤进去才需要：早起再看一次洛克菲勒圣诞树，早上人最少（DeKalb Av 坐 Q 到 57 St 走过去）。昨晚看够了就多睡一会儿。', pois: ['rockefeller-tree'] },
      { t: '09:30', xmas: { s: 'open', note: '公园每天 6:00–次日 1:00 开放，圣诞节也开' }, text: '连着赶了一周路，今天睡够再出门。DeKalb Av 坐 Q 线到 57 St–7 Av，走进中央公园：Gapstow 桥 → The Mall → 贝塞斯达喷泉 → Bow Bridge。', pois: ['central-park'] },
      { t: '12:00', game: 'nyk25', xmas: { s: 'check', note: '圣诞中午开门的体育酒吧不多，前一天在 Google 地图上看好营业时间' }, text: '尼克斯 vs 马刺圣诞大战中午开球，打到 14:30 左右。票太贵不买，找开门的体育酒吧看直播；只点饮料和小吃，正餐留给唐人街。' },
      { t: '14:45', xmas: { s: 'check', note: '唐人街中餐馆大多照常营业，但 Nom Wah、Joe\'s Shanghai 没在官网查到圣诞时间，前一天打电话或看 Google 地图' }, text: '从中城坐 D 线到 Grand St（圣诞节 B 线不开）：唐人街 + 小意大利，晚午饭吃 Nom Wah 点心或 Joe\'s Shanghai 小笼包。', pois: ['chinatown'] },
      { t: '17:00', xmas: { s: 'open', note: '居民自家装饰，街区随时能走；天黑后亮灯，21 点后不少人家关灯' }, text: '看 Dyker Heights 圣诞灯：从唐人街 Grand St 站坐 D 线直达 79 St（约 40 分钟），不用先回公寓。最亮的是 83–86 街、11–13 大道之间那几条街。', pois: ['dyker'] },
      { t: '19:30', text: 'D 线坐回 Atlantic Av–Barclays，走 12 分钟回公寓。' }
    ],
    tips: ['圣诞日大都会、多数商店和不少餐厅关门，地铁按周日时刻表跑，B 线不开。', '球赛要打两个半小时，所以唐人街排在 14:45；不看球就把唐人街提前到 12:30，下午回公寓歇一会儿再去看灯。', '住布鲁克林的好处：晚上看完灯 20 分钟就到家，不用再横穿曼哈顿。'],
    pace: { km: 8, lv: 2, cut: '太冷：Dyker Heights 只看 84 街那一两个街区，半小时就回。' },
    stay: nycHotel
  });

  days.push({
    id: '1226', md: '12/26', wd: '周六', city: 'nyc', title: '布鲁克林大桥、DUMBO、篮网',
    items: [
      { t: '09:00', text: 'DeKalb Av 坐 R 线到 City Hall（约 12 分钟），从曼哈顿一侧走上布鲁克林大桥，往布鲁克林方向走约 30 分钟。回头就是下城天际线，早上人少。', pois: ['brooklyn-bridge'] },
      { t: '10:00', text: '下桥走 10 分钟到 DUMBO：Washington St 桥洞框住帝国大厦的机位、Jane\'s 旋转木马、河边看两座桥。', pois: ['dumbo'] },
      { t: '11:30', text: '午饭就在 DUMBO：Juliana\'s 披萨（11:30 开门，赶第一轮）或 Time Out Market 美食广场。' },
      { t: '13:00', text: '布鲁克林高地观景步道看天际线，然后走回公寓（约 25 分钟）。', pois: ['promenade'] },
      { t: '14:30', text: '回公寓休息、午睡。进球馆不能背双肩包。' },
      { t: '17:00', text: 'Junior\'s 晚饭和芝士蛋糕（Flatbush & DeKalb），从公寓走 6 分钟，吃完再走 8 分钟到球馆。' },
      { t: '18:00', game: 'bkn' }
    ],
    tips: ['今天的路线是一条线：坐地铁到桥的曼哈顿一头，走过桥、DUMBO、步道，一路走回公寓，不坐回头车。', '弱队场次临近开赛常降价。', '12/26 是节后返程高峰，这天别安排城际移动。', '篮网就在 Barclays Center，公寓步行约 15 分钟，散场不用挤地铁。'],
    pace: { km: 7, lv: 1, cut: '这天是全程的恢复日：想补觉就 10 点再出门，跳过观景步道。' },
    stay: nycHotel
  });

  days.push({
    id: '1227', md: '12/27', wd: '周日', city: 'nyc', title: '大都会和中城夜景',
    items: [
      { t: '10:00', text: '大都会艺术博物馆约 2.5 小时：圣诞树和那不勒斯诞生场景、丹铎神庙、欧洲绘画（B/D 到 59 St 一带，或 4/5 到 86 St）。', pois: ['met'], buy: ['met'] },
      { t: '12:30', text: '上东区午饭，中央公园北段散步。' },
      { t: '15:30', text: '（可选）Summit One Vanderbilt 看日落（16:30）。', pois: ['summit'], buy: ['summit'] },
      { t: '18:00', text: '中央车站：耳语廊、星空天花（圣诞市集 12/24 已经撤了，这次看建筑）。', pois: ['grand-central'] },
      { t: '19:30', text: '时代广场夜景，然后 2/3 或 N/Q/R 回布鲁克林。', pois: ['times-square'] },
      { t: '可选', game: 'nyk27', text: '加看一场：尼克斯 vs 篮网，18:00 开球（麦迪逊广场花园，17:00 开门），德比票价偏高。去看球就把 18:00 中央车站提到 15:30（跳过 Summit），时代广场改到散场后，从球馆步行约 10 分钟。' }
    ],
    tips: ['大都会周三和 12/25 闭馆，只能排在这天前后的周日、周一、周二。', '时代广场人偶合影要给钱。'],
    pace: { km: 8, lv: 2, cut: 'Summit 和时代广场二选一；大都会里走累了，丹铎神庙那个大厅有地方坐。' },
    stay: nycHotel
  });

  days.push({
    id: '1228', md: '12/28', wd: '周一', city: 'nyc', title: '免费渡轮、下城、高线公园',
    items: [
      { t: '09:00', text: '史泰登岛渡轮：免费，去程站右舷看自由女神，到岸后坐回程（R 线到 Whitehall St 转渡轮）。', pois: ['staten-ferry'] },
      { t: '10:30', text: '华尔街铜牛 + 无畏女孩 → 纽交所外观。', pois: ['charging-bull'] },
      { t: '12:00', text: '9/11 纪念池 + Oculus。', pois: ['911-memorial', 'oculus'] },
      { t: '13:00', text: '午饭。' },
      { t: '14:30', text: 'SoHo 铸铁建筑 → 格林威治村：《老友记》公寓外观（Bedford St & Grove St）。' },
      { t: '16:00', text: '切尔西市场 → 高线公园日落 → Little Island。', pois: ['chelsea-market', 'high-line', 'little-island'] },
      { t: '18:30', text: 'Joe\'s Pizza，纽约一片披萨，然后地铁回布鲁克林。' }
    ],
    tips: ['史泰登岛渡轮比付费自由女神游船两人省 $50 以上，也不用进移民博物馆。'],
    pace: { km: 11, lv: 3, cut: '砍掉 SoHo 和格林威治村：午饭后从世贸中心坐 E 线到 14 St，直接去切尔西市场。' },
    stay: nycHotel
  });

  days.push({
    id: '1229', md: '12/29', wd: '周二', city: 'nyc', title: '弹性日：天气兜底',
    items: [
      { t: '可选 11:00', text: '时代广场跨年彩纸试飞：往年都在 12/29 上午 11:00，Broadway 45–46 街之间，几分钟就结束。今年的时间出发前看 Times Square Alliance 官网。', pois: ['times-square'] },
      { t: '方案 1', text: '7 号线去法拉盛吃中餐和奶茶（从 DeKalb Av 坐 Q/R 进曼哈顿，在 Times Sq 换 7 号线）。', pois: ['flushing'] },
      { t: '方案 2', text: '罗斯福岛缆车，刷 OMNY，空中看东河。', pois: ['roosevelt-tram'] },
      { t: '方案 3', text: '哈莱姆：Apollo 剧院外观，125 街。', pois: ['apollo'] },
      { t: '晚上', text: '韩国城 32 街烤肉，吃完回布鲁克林。' }
    ],
    tips: ['前几天如果遇到暴雪，把取消的户外项目挪到这天。', '三个方案挑一个就够。明晚 02:30 就要去机场，今天别安排满。'],
    pace: { km: 5, lv: 1, cut: '什么都不想干也行：睡到自然醒，下午只去韩国城吃饭。' },
    stay: nycHotel
  });

  days.push({
    id: '1230', md: '12/30', wd: '周三', city: 'nyc', title: state.opts.ewr ? '纪念品，晚上去机场' : '纪念品，凌晨去机场',
    items: state.opts.ewr ? [
      { t: '10:00', text: '退房，行李寄存到公寓前台/门厅，和房东说好晚上来取。' },
      { t: '11:00', text: '第五大道 NBA Store：篮球之旅的纪念品，购物只排这天。', pois: ['nba-store'] },
      { t: '12:30', text: '午饭，顺路买最后一轮网红小吃：Levain 曲奇、Joe\'s Pizza。' },
      { t: '14:00', text: '还想补买东西就在第五大道和布莱恩公园一带逛，不想逛就早点回去歇着。', pois: ['bryant-park'] },
      { t: '18:00', text: '回公寓取行李。' },
      { t: '19:00', nav: { name: '纽瓦克机场', q: 'Newark Liberty International Airport, Newark, NJ' }, text: 'NJ Transit 从 Penn Station 到 Newark Airport 站，换 AirTrain 到航站楼，约 $16.80/人（票里含 AirTrain 费）。', buy: ['njt', 'booking', 'trip'], pois: ['moynihan'] }
    ] : [
      { t: '上午', text: '不用退房：公寓订到 12/31，行李留在房间里。今天只安排半天，下午留给收拾和睡觉。' },
      { t: '11:00', text: '第五大道 NBA Store：篮球之旅的纪念品，购物只排这天。', pois: ['nba-store'] },
      { t: '12:30', text: '午饭，顺路买最后一轮网红小吃：Levain 曲奇、Joe\'s Pizza。' },
      { t: '14:00', text: '还想补买东西就在第五大道和布莱恩公园一带逛，不想逛就直接回布鲁克林。', pois: ['bryant-park'] },
      { t: '16:00', text: '回公寓收拾行李：护照、充电宝放随身包；洛杉矶 19°C，把卫衣放在箱子最上面。在叫车 App 里预约好 02:30 的车。' },
      { t: '18:30', text: '晚饭吃早一点、清淡一点。' },
      { t: '20:00', text: '睡觉。02:00 起床，能睡 6 小时；睡不着也躺着，剩下的在飞机上补。' },
      { t: '02:30 叫车', nav: EWR_C, slot: 'flight-lax', text: 'UA2434 06:00 从纽瓦克 C 航站楼起飞，布鲁克林打车过去约 40–50 分钟。夜里 NJ Transit 班次很稀，别赌地铁；提前一晚在叫车 App 里预约 02:30 的车（跨夜车费大约 $100–130）。' }
    ],
    tips: state.opts.ewr
      ? ['大都会周三闭馆，别挪到这天。', '住机场酒店：晚饭后就动身，NJ Transit 末班在午夜前后；酒店通常有免费接驳，入住时问清楚次日航站楼接驳时间。']
      : ['大都会周三闭馆，别挪到这天。', '公寓订到 12/31，所以这晚不用去机场过夜；代价是 12/31 凌晨 02:30 就得叫车。想睡整觉就把设置里切成机场酒店，并和房东退掉最后一晚。', 'UA2434 是 06:00 起飞，国内段柜台 04:00 左右开，02:30 出发刚好。'],
    pace: { km: 5, lv: 1, cut: '今天只保留 NBA Store 一件事，买完就回去。' },
    stay: state.opts.ewr ? '纽瓦克机场酒店' : `${nycHotel}（住到 12/31）`
  });


  days.push({
    id: '1231', md: '12/31', wd: '周四', city: 'la', from: 'nyc', title: '转机半天：圣莫尼卡到威尼斯',
    items: [
      { t: '06:00 起飞', nav: EWR_C, slot: 'flight-lax', text: 'UA2434 纽瓦克 C 航站楼 06:00 → 洛杉矶 T7 09:12。这两段是同一张票，行李只托运到洛杉矶，落地要取出来。上飞机就睡：这 6 小时是今天唯一能补觉的时候。' },
      { t: '落地', text: '取完行李大约 09:45。只睡了半夜又带着箱子，推荐直接打车去圣莫尼卡（约 30 分钟，$40–55；出租车和 Uber 都要先坐免费接驳车到 LAX-it 上车点）。想省钱：免费接驳车到 LAX/Metro 交通中心 → K 线北行 → Expo/Crenshaw 换 E 线西行 → Downtown Santa Monica，约 60–75 分钟，$1.75。', pois: ['lax-transit'], buy: ['lametro'] },
      { t: '11:00', text: '到圣莫尼卡先寄存行李（App 里提前约好），然后吃午饭。下面的时间按航班准点写，晚点就整体顺延。', buy: ['bounce', 'lh'] },
      { t: '12:30', text: '圣莫尼卡码头 → 沿海滩步道走到威尼斯海滩（约 3 公里，平路）→ 威尼斯运河。', pois: ['santa-monica-pier', 'venice-beach', 'venice-canals'] },
      { t: '16:15', text: '从威尼斯打车或坐 Big Blue Bus 1 路回圣莫尼卡（10–20 分钟），16:55 在码头看太平洋日落，然后早点吃晚饭。', pois: ['santa-monica-pier'] },
      { t: '18:30', nav: LAX_T7, text: '取行李回机场：打车约 $30–45，跨年夜傍晚路况差，留足 1 小时；或 E 线 → K 线 → 接驳车。别更早去：联合航空柜台最早在起飞前 4 小时（19:35）才收托运行李。' },
      { t: '20:35 到柜台', nav: LAX_T7, slot: 'flight-home', text: 'UA771 洛杉矶 T7 23:35 起飞，01/02 06:35 到北京首都 T3（票面只印 06:35，跨 2 天）。国际柜台起飞前 3 小时开。' }
    ],
    tips: ['LAX 机场捷运最新目标 2027-01-06 才通，这次还是坐接驳车。', '跨年夜圣莫尼卡人多，看好手机和钱包。', '回国倒时差：UA771 起飞时是北京时间下午 3 点半，上飞机先吃饭、撑 2–3 小时再睡，落地正好是北京早上。'],
    pace: { km: 6, lv: 2, cut: '太累就不走去威尼斯：在圣莫尼卡码头和第三街步行街待着，找家咖啡馆坐到日落。' },
    stay: '国际航班'
  });

  // 每一项的备注和改过的时间（key 用原定时间，改了时间也认得出是哪一项）
  const notes = state.notes || {};
  for (const d of days) for (const it of d.items) {
    it.key = `${d.id}@${it.t}`;
    const n = notes[it.key];
    if (!n || n.del) continue;
    if (n.t && n.t !== it.t) { it.t0 = it.t; it.t = n.t; }
    if (n.text) it.note = n.text;
  }
  return days;
}

// 行程日期 → Date（本地时区）
export function dayDate(day) {
  const [m, d] = day.md.split('/').map(Number);
  return new Date(Number(TRIP.start.slice(0, 4)), m - 1, d);
}
