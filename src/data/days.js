// 每日行程。12/20 固定按方案 C（看凯尔特人、波士顿住 3 晚），住宿按已订酒店的真实位置写路线。
// 每个条目：t 时间，text 说明，pois 关联景点（可点开介绍和导航），leg 城际交通段，game 球赛，buy 预约/购票入口
import { TRIP } from './trip.js';
import { stayText } from './hotels.js';

// 已订酒店的“最后一公里”提示，前面注明最近的地铁站
const T = {
  bos: '橙线 Massachusetts Ave 站（走 8 分钟）',
  dc: '红线 NoMa–Gallaudet 站（走 5 分钟）／联合车站走 10 分钟',
  phl: '集市-法兰克福线 5th St 站（走 3 分钟，站口在 Market St 上）',
  nyc: 'B/D/N/Q/R 的 DeKalb Av 站／2/3 的 Atlantic Av–Barclays 站'
};

export function buildDays(state) {
  const days = [];
  const nycHotel = '纽约 · DKLB BKLN 公寓（布鲁克林，$90/晚 暂定）';

  days.push({
    id: '1218', md: '12/18', wd: '周五', city: 'bos', from: 'nyc', title: '落地，直奔波士顿',
    items: [
      { t: '10:55 落地', text: 'MF849 从福州 09:20 起飞，JFK T4 10:55 落地。前一段是 12/17 13:45 郑州 CGO T2（MF8280），福州跨夜中转 17h25m，行李要在福州取出来重新托运。入境排队 1.5–2 小时，食品如实申报。' },
      { t: '+2h', text: 'AirTrain 到 Jamaica，换长岛铁路 LIRR 到 Penn Station。AirTrain 约 $8.75，LIRR 市内票 $5.25–7.25，刷卡进出。', pois: ['moynihan'] },
      { t: '+3h', leg: 's1' },
      { t: '到站', text: 'South Station 到酒店（811 Massachusetts Ave，South End 边上）约 2 英里：带行李直接打车 10 分钟（$12–15）；想省钱就走到 Downtown Crossing 坐橙线两站到 Massachusetts Ave，再走 8 分钟。', pois: ['south-station'] },
      { t: '晚上', text: '入住，酒店附近简单吃饭，早睡倒时差。' }
    ],
    tips: ['火车选落地时间 + 4 小时以后的班次。到达层有人拉客“Need a taxi?”是黑车，直接走开。', '12/17 下午 13:45 郑州起飞，行李在福州要重新托运一次，值机时问一句能不能直挂到 JFK。', `酒店最近的地铁是${T.bos}，之后几天都从这儿进出。`],
    stay: stayText('bos')
  });

  days.push({
    id: '1219', md: '12/19', wd: '周六', city: 'bos', title: '哈佛、MIT、灯光秀',
    items: [
      { t: '09:30', text: `出门：${T.bos}，橙线到 Downtown Crossing 换红线去 Harvard（约 25 分钟）。哈佛园：铜像、Widener 图书馆外观。寒假期间楼内不开放，只逛校园。`, pois: ['harvard-yard'] },
      { t: '11:00', text: '哈佛广场逛书店，午饭吃 Pinocchio\'s 披萨。' },
      { t: '13:00', text: '红线到 Kendall/MIT：大圆顶、Killian Court、盖里设计的 Stata Center。', pois: ['mit-dome', 'stata'] },
      { t: '14:30', text: '步行过 Harvard Bridge，数桥面的 Smoot 刻度。', pois: ['harvard-bridge'] },
      { t: '15:15', text: '地铁红线到 Charles/MGH，走橡果街（日落 16:15 前光线最好）→ 公共花园看小鸭雕像。', pois: ['beacon-hill', 'public-garden'] },
      { t: '17:00', text: 'Newbury Street 节日灯光。' },
      { t: '18:30', text: '昆西市场晚饭：蛤蜊浓汤、龙虾卷。法纳尔厅圣诞树和 Blink! 灯光秀。', pois: ['faneuil-hall'] }
    ],
    tips: ['波士顿地铁可以直接刷信用卡或手机进站。', '查尔斯河边风很大，帽子手套带上。', '酒店在 South End 生活区，晚上回来的路上餐馆比市中心多。'],
    stay: `${stayText('bos')} · 续住`
  });

  days.push({
    id: '1220', md: '12/20', wd: '周日', city: 'bos', title: '宪法号、北区、凯尔特人',
    items: [
      { t: '09:30', text: '今天不退房（酒店订到 12/21）。出门坐橙线到 State，换蓝线一站到 Aquarium。' },
      { t: '10:00', text: 'Long Wharf 坐 MBTA F4 渡轮到 Charlestown（约 10 分钟，票价同地铁）。周末班次少，先查时刻表，赶不上就从 North Station 步行约 20 分钟过去。' },
      { t: '10:30', text: '宪法号：免费，带护照过安检。', pois: ['uss-constitution'], buy: ['uss'] },
      { t: '12:30', text: '北区午饭：Regina Pizzeria，甜品 cannoli 二选一。', pois: ['north-end'] },
      { t: '14:00', text: '自由之路片段：保罗·里维尔故居外观 → 老北教堂外观 → 旧州议会。沿线墓园全部跳过。' },
      { t: '15:30', text: '波士顿公共图书馆 Bates Hall，冬季周日下午开放。', pois: ['bpl'] },
      { t: '17:30', text: '回酒店休息一下，晚饭在 North Station 一带吃。' },
      { t: '20:00', game: 'bos' },
      { t: '22:30', text: '散场不用挤地铁：TD Garden 就在 North Station 楼上，橙线 5 站到 Massachusetts Ave（约 12 分钟），再走 8 分钟回酒店。' }
    ],
    tips: ['TD Garden 不让带双肩包和大行李，今天别把箱子拖过去。', '橙线末班在午夜后不久，散场别在球场里拖太久。'],
    stay: `${stayText('bos')} · 续住（第 3 晚）`
  });

  // 12/21 周一：国会图书馆周一闭馆，图书馆统一放到 12/22
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
    stay: stayText('dc')
  });

  days.push({
    id: '1222', md: '12/22', wd: '周二', city: 'dc', title: '国会、纪念堂、奇才',
    items: [
      { t: '09:00', text: '走 15 分钟到国会大厦，免费导览（官网预约）。', pois: ['capitol'], buy: ['cap'] },
      { t: '10:30', text: '国会图书馆杰斐逊大楼，就在国会后面，走过去 5 分钟（定时票）。', pois: ['loc'], buy: ['loc'] },
      { t: '12:00', text: '沿国家广场西行：华盛顿纪念碑 → 二战纪念碑 → 林肯纪念堂。', pois: ['washington-monument', 'ww2-memorial', 'lincoln'] },
      { t: '14:00', text: '杰斐逊纪念堂 + 潮汐湖 + 马丁·路德·金纪念碑。', pois: ['jefferson'] },
      { t: '15:30', text: 'Maine Avenue 鱼市吃现蒸蓝蟹。', pois: ['wharf'] },
      { t: '17:00', text: '回酒店休息。' },
      { t: '18:00', text: '红线两站到 Gallery Place，球馆就在站上面，晚饭在中国城吃。' },
      { t: '19:00', game: 'was' }
    ],
    tips: ['奇才是弱队，转售票常在赛前 24–48 小时降价。', '国会和图书馆都在酒店南边 15 分钟步行圈里，今天基本不用坐车。'],
    stay: `${stayText('dc')} · 续住`
  });

  days.push({
    id: '1223', md: '12/23', wd: '周三', city: 'phl', from: 'dc', title: '独立厅、芝士牛肉堡、76人',
    items: [
      { t: '08:30', text: '退房，走 10 分钟到联合车站（不用打车）。', pois: ['union-station-dc'] },
      { t: '09:30', leg: 's3' },
      { t: '12:00', text: '到费城后打车 8 分钟到酒店（400 Arch St，老城区），先寄存行李。午饭 Reading Terminal Market：DiNic\'s 烤猪肉三明治、Beiler\'s 甜甜圈（从酒店往西走 12 分钟）。', pois: ['reading-terminal'] },
      { t: '13:30', text: '回酒店方向：独立厅（定时票）+ 自由钟，就在酒店旁边两个街区。', pois: ['independence-hall', 'liberty-bell'], buy: ['rec'] },
      { t: '15:30', text: 'Elfreth\'s Alley，美国最老的住家小巷，离酒店 5 分钟。', pois: ['elfreth'] },
      { t: '16:30', text: 'LOVE 雕塑拍照（走 15 分钟），旁边圣诞市集只路过。', pois: ['love-park'] },
      { t: '17:30', text: '南费城 Pat\'s vs Geno\'s 芝士牛肉堡对决，打车 10 分钟，吃完直接去球馆。', pois: ['pats-genos'] },
      { t: '19:30', game: 'phi' },
      { t: '22:00', text: '散场：宽街线（Broad Street Line）北上到 15th St，换集市-法兰克福线到 5th St，走 3 分钟回酒店；赛后有加开班次。' }
    ],
    tips: ['费城地铁 SEPTA 可以刷卡，一张卡最多能替 5 个人付费。', '12/23 是圣诞前出行高峰，大巴千万别坐下午的车。', '酒店在 Arch St 上，独立厅、自由钟、Elfreth\'s Alley 全在步行 5–10 分钟里，明天走之前还能再看一眼。'],
    stay: stayText('phl')
  });

  days.push({
    id: '1224', md: '12/24', wd: '周四', city: 'nyc', from: 'phl', title: '平安夜：橱窗和洛克菲勒圣诞树',
    items: [
      { t: '09:00', text: '（可选）Rocky 铜像拍照，从酒店打车 10 分钟，不进馆、不爬台阶也可以。', pois: ['rocky-steps'] },
      { t: '10:30', leg: 's4' },
      { t: '13:00', text: '到曼哈顿后去布鲁克林：Penn Station 坐长岛铁路 LIRR 到 Atlantic Terminal（20 分钟，带行李最省事），出站走 10 分钟到公寓；或 2/3 地铁三站到 Atlantic Av–Barclays。', pois: ['moynihan'] },
      { t: '14:30', text: '公寓一般 15:00 后才能入住，早到先和房东约好放行李。然后 B/D/N/Q/R 从 DeKalb Av 进曼哈顿（到 34 St 约 15 分钟）。第五大道橱窗：Bergdorf Goodman → Saks（入夜外墙灯光秀）→ 洛克菲勒圣诞树 → 圣帕特里克大教堂外观。', pois: ['rockefeller-tree', 'st-patricks'] },
      { t: '16:30', text: '布莱恩公园 Winter Village：全程唯一逛的节日市集。', pois: ['bryant-park'] },
      { t: '18:00', text: '梅西百货圣诞橱窗。', pois: ['macys'] },
      { t: '19:30', text: '平安夜晚餐。很多餐厅这天只做套餐，提前两周订位。', buy: ['ot', 'resy'] }
    ],
    tips: ['平安夜傍晚第五大道和洛克菲勒中心会分流管制，排队 20–40 分钟很正常。', '纽约地铁用 OMNY 刷卡，每人用自己的卡或手机，7 天内刷满 $35 后免费。', `公寓最近的地铁是${T.nyc}；住布鲁克林进出曼哈顿单程 15–20 分钟，比住曼哈顿省一半房费。`],
    stay: nycHotel
  });

  days.push({
    id: '1225', md: '12/25', wd: '周五', city: 'nyc', title: '圣诞日：公园、唐人街、灯光',
    items: [
      { t: '08:30', text: '早起再看一次洛克菲勒圣诞树，早上人最少（B/D/N/Q/R 到 47–50 Sts）。', pois: ['rockefeller-tree'] },
      { t: '10:00', text: '中央公园：Gapstow 桥 → The Mall → 贝塞斯达喷泉 → Bow Bridge。', pois: ['central-park'] },
      { t: '12:00', game: 'nyk25', text: '尼克斯 vs 马刺圣诞大战中午开球。票太贵不买，找开门的体育酒吧看直播。' },
      { t: '13:30', text: '唐人街 + 小意大利。圣诞节中餐馆照常营业：Nom Wah 点心、Joe\'s Shanghai 小笼包。', pois: ['chinatown'] },
      { t: '16:00', text: '看 Dyker Heights 圣诞灯：从公寓坐 D 线到 79 St（约 35 分钟，不用先绕去曼哈顿）。', pois: ['dyker'] },
      { t: '20:00', text: 'D 线直接坐回 DeKalb Av，走回公寓。' }
    ],
    tips: ['圣诞日大都会、多数商店和不少餐厅关门，地铁按周日时刻表跑。', 'Dyker Heights 21 点后不少人家关灯。', '住布鲁克林的好处：晚上看完灯 20 分钟就到家，不用再横穿曼哈顿。'],
    stay: nycHotel
  });

  days.push({
    id: '1226', md: '12/26', wd: '周六', city: 'nyc', title: '布鲁克林大桥、DUMBO、篮网',
    items: [
      { t: '09:00', text: '从公寓走 15 分钟到 DUMBO（或 F 线一站到 York St），先看桥洞框住帝国大厦的机位、Jane\'s 旋转木马。', pois: ['dumbo'] },
      { t: '10:00', text: '从布鲁克林一侧走上布鲁克林大桥，往曼哈顿方向走约 30 分钟，下桥在市政厅一带。', pois: ['brooklyn-bridge'] },
      { t: '12:00', text: '回布鲁克林吃午饭：Juliana\'s 披萨或 Time Out Market 美食广场（都在 DUMBO）。' },
      { t: '13:30', text: '布鲁克林高地观景步道看天际线，走回公寓方向。', pois: ['promenade'] },
      { t: '15:00', text: '回公寓放东西。进球馆不能背双肩包。' },
      { t: '17:00', text: 'Junior\'s 晚饭和芝士蛋糕（Flatbush & DeKalb），从公寓走 10 分钟，吃完再走 5 分钟到球馆。' },
      { t: '18:00', game: 'bkn' }
    ],
    tips: ['弱队场次临近开赛常降价。', '12/26 是节后返程高峰，这天别安排城际移动。', '篮网就在 Barclays Center，公寓步行 15 分钟，散场不用挤地铁。'],
    stay: nycHotel
  });

  days.push({
    id: '1227', md: '12/27', wd: '周日', city: 'nyc', title: '大都会和中城夜景',
    items: [
      { t: '10:00', text: '大都会艺术博物馆约 2.5 小时：圣诞树和那不勒斯诞生场景、丹铎神庙、欧洲绘画（B/D 到 59 St 一带，或 4/5 到 86 St）。', pois: ['met'], buy: ['met'] },
      { t: '12:30', text: '上东区午饭，中央公园北段散步。' },
      { t: '15:30', text: '（可选）Summit One Vanderbilt 看日落（16:30）。', pois: ['summit'], buy: ['summit'] },
      { t: '18:00', text: '中央车站：耳语廊、星空天花。', pois: ['grand-central'] },
      { t: '19:30', text: '时代广场夜景，然后 2/3 或 N/Q/R 回布鲁克林。', pois: ['times-square'] },
      { t: '可选', game: 'nyk27', text: '加看一场：尼克斯 vs 篮网，开球时间以 NBA App 为准，德比票价偏高。' }
    ],
    tips: ['大都会周三和 12/25 闭馆，只能排在这天前后的周日、周一、周二。', '时代广场人偶合影要给钱。'],
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
    stay: nycHotel
  });

  days.push({
    id: '1229', md: '12/29', wd: '周二', city: 'nyc', title: '弹性日：天气兜底',
    items: [
      { t: '方案 1', text: '7 号线去法拉盛吃中餐和奶茶（从公寓先坐 B/D/N/Q/R 进曼哈顿再换 7 号线）。', pois: ['flushing'] },
      { t: '方案 2', text: '罗斯福岛缆车，刷 OMNY，空中看东河。', pois: ['roosevelt-tram'] },
      { t: '方案 3', text: '哈莱姆：Apollo 剧院外观，125 街。', pois: ['apollo'] },
      { t: '晚上', text: '韩国城 32 街烤肉，吃完回布鲁克林。' }
    ],
    tips: ['前几天如果遇到暴雪，把取消的户外项目挪到这天。'],
    stay: nycHotel
  });

  days.push({
    id: '1230', md: '12/30', wd: '周三', city: 'nyc', title: state.opts.ewr ? '纪念品，晚上去机场' : '纪念品，凌晨去机场',
    items: state.opts.ewr ? [
      { t: '10:00', text: '退房，行李寄存到公寓前台/门厅，和房东说好晚上来取。' },
      { t: '11:00', text: '时代广场：往年 12/30 上午有跨年彩纸“试飞”。', pois: ['times-square'] },
      { t: '12:00', text: '第五大道 NBA Store：篮球之旅的纪念品，购物只排这天。', pois: ['nba-store'] },
      { t: '14:00', text: '最后一顿网红小吃：Levain 曲奇、Joe\'s Pizza。' },
      { t: '18:00', text: '回公寓取行李。' },
      { t: '19:00', text: 'NJ Transit 从 Penn Station 到 Newark Airport 站，换 AirTrain 到航站楼，约 $16.80/人（票里含 AirTrain 费）。', buy: ['njt', 'booking', 'trip'], pois: ['moynihan'] }
    ] : [
      { t: '上午', text: '不用退房：公寓订到 12/31，行李留在房间里，今天照常玩。' },
      { t: '11:00', text: '时代广场：往年 12/30 上午有跨年彩纸“试飞”。', pois: ['times-square'] },
      { t: '12:00', text: '第五大道 NBA Store：篮球之旅的纪念品，购物只排这天。', pois: ['nba-store'] },
      { t: '14:00', text: '最后一顿网红小吃：Levain 曲奇、Joe\'s Pizza。' },
      { t: '16:00', text: '回布鲁克林，收拾行李、把护照和充电宝放随身包。' },
      { t: '21:00', text: '早睡。04:00 前要到纽瓦克机场，等于半夜出发。' },
      { t: '02:30 叫车', text: 'UA2434 06:00 从纽瓦克 C 航站楼起飞，布鲁克林打车过去约 40–50 分钟。夜里 NJ Transit 班次很稀，别赌地铁；提前一晚在叫车 App 里预约 02:30 的车（跨夜车费大约 $100–130）。' }
    ],
    tips: state.opts.ewr
      ? ['大都会周三闭馆，别挪到这天。', '住机场酒店：晚饭后就动身，NJ Transit 末班在午夜前后；酒店通常有免费接驳，入住时问清楚次日航站楼接驳时间。']
      : ['大都会周三闭馆，别挪到这天。', '公寓订到 12/31，所以这晚不用去机场过夜；代价是 12/31 凌晨 02:30 就得叫车。想睡整觉就把设置里切成机场酒店，并和房东退掉最后一晚。', 'UA2434 是 06:00 起飞，国内段柜台 04:00 左右开，02:30 出发刚好。'],
    stay: state.opts.ewr ? '纽瓦克机场酒店' : '纽约 · DKLB BKLN 公寓（住到 12/31）'
  });

  days.push({
    id: '1231', md: '12/31', wd: '周四', city: 'la', from: 'nyc', title: '转机半天：圣莫尼卡到威尼斯',
    items: [
      { t: '06:00 起飞', text: 'UA2434 纽瓦克 C 航站楼 06:00 → 洛杉矶 T7 09:12。这两段是同一张票，行李只托运到洛杉矶，落地要取出来。' },
      { t: '落地', text: '免费接驳车到 LAX/Metro 交通中心 → K 线北行 → Expo/Crenshaw 换 E 线西行 → Downtown Santa Monica，约 60–75 分钟，$1.75。', pois: ['lax-transit'], buy: ['lametro'] },
      { t: '+1.5h', text: '圣莫尼卡用 App 预约行李寄存。', buy: ['bounce', 'lh'] },
      { t: '午后', text: '圣莫尼卡码头 → 沿海滩步道走到威尼斯海滩（约 3 公里）→ 威尼斯运河。', pois: ['santa-monica-pier', 'venice-beach', 'venice-canals'] },
      { t: '起飞前 5h', text: '取行李回机场：E 线 → K 线 → 接驳车，或打车约 $30–45。12/31 傍晚路况差。' },
      { t: '20:35 到柜台', text: 'UA771 洛杉矶 T7 23:35 起飞，01/02 06:35 到北京首都 T3（票面只印 06:35，跨 2 天）。国际柜台起飞前 3 小时开。' }
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
