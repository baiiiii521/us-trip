// 审计发现、实用提示、预订清单、来源。纯数据，页面按需渲染。

export const AUDIT = [
  { level: 'crit', title: '凯尔特人与 67 次过夜车时间冲突', what: '67 次 South Station 18:45 开，凯尔特人 vs 活塞 12/20（周日）20:00 开球。原页面一边写“不看凯尔特人”，一边写“四场球都排进”，顶部又写“3 场已排进”。', fix: '在设置里三选一：A 不看（默认）/ C 多住一晚再走（想看 4 场选它）/ B 凌晨大巴（不推荐）。' },
  { level: 'crit', title: '宪法号排错了城市', what: '原版“宪法号改到周日 12/27”，但 12/24–30 你们在纽约，宪法号停在波士顿。', fix: '改到 12/20 周日上午。冬季开放时间出发前看海军官网。' },
  { level: 'crit', title: '12/30 夜到 12/31 连续两晚睡不好，换乘无保障', what: '12/30 去机场过夜，12/31 早班机到洛杉矶，玩半天，当晚再飞国际航班。两段机票分开买，前段延误后段不管。', fix: '订纽瓦克机场酒店（约 $170），或把纽约飞洛杉矶改到 12/30 晚上。国际航班至少留 5 小时缓冲。' },
  { level: 'warn', title: '国会图书馆周一闭馆', what: '杰斐逊大楼一般周二至周六开放，12/21 是周一。', fix: '图书馆统一排到 12/22 周二，12/21 只排国会导览和户外纪念堂。' },
  { level: 'warn', title: '火车总价两处数字对不上', what: '顶部写“4 段 · 两人 $536”，更新日志写“5 段两人 $368”。现路线只有 4 段。', fix: '以 Amtrak 订单为准统一成一个数。本站按 $536 拆分估算。' },
  { level: 'warn', title: '核对清单里有过期条目', what: '“12/27 起离开纽约”和现在 12/24–30 连住纽约矛盾，是旧版路线留下的。', fix: '已删掉，12/29 改成雨雪备用日。' },
  { level: 'warn', title: '76人主场已改名', what: '原 Wells Fargo Center 2025 年起改名 Xfinity Mobile Arena，地铁站仍是 NRG Station。', fix: '导航和票面统一用新名。' },
  { level: 'warn', title: '大都会每周三和 12/25 闭馆', what: '12/30 是周三，12/25 圣诞也闭馆。', fix: '排在 12/27 周日。' },
  { level: 'warn', title: '没有提 EVUS 收费', what: '2025-09-30 起 EVUS 收费，2026-10-16 起约 $31.75/人。没登记不能值机。', fix: '出发前至少 72 小时在 evus.gov 登记，已计入预算。' },
  { level: 'warn', title: '落地当天直接坐车去波士顿', what: '入境排队 1–2 小时，再坐 AirTrain + LIRR 到 Penn Station，时间紧。', fix: '火车买可改签的 Value 票，选落地时间 + 4 小时以后的班次。' },
  { level: 'ok', title: 'LAX 捷运判断正确', what: '最新目标 2027-01-06 通车，12/31 仍坐免费接驳车。', fix: '保留。' },
  { level: 'ok', title: '主队比赛都已核实', what: '奇才 12/22 19:00、76人 12/23 19:30、篮网 12/26 18:00；另查到 12/27 尼克斯 vs 篮网已开售。', fix: '保留，买票前在 NBA App 再看一眼时间。' },
  { level: 'ok', title: '不买圣诞大战票是对的', what: '尼克斯 vs 马刺 12/25 中午开球，转售价 $525+/张。', fix: '保留，找体育酒吧看直播。' }
];

export const TIPS = [
  { group: '入境和证件', tone: 'acc', items: [
    'EVUS：中国护照 + 10 年 B1/B2 签证必须登记，2026-10-16 起约 $31.75/人，有效 2 年。没登记航司不让值机，至少提前 72 小时办。',
    '入境申报：肉制品（含肉松、香肠、蛋黄月饼）不能带，水果也不行。拿不准就勾“有食品”，主动申报不罚款。',
    '护照、签证页、酒店订单、回程机票截图存一份到相册，海关可能问住哪、待多久。'
  ], src: 'Fragomen、Travel and Tour World' },
  { group: '刷卡坐车', tone: 'rail', items: [
    '纽约 OMNY、波士顿 MBTA、华盛顿 Metro、费城 SEPTA 都能直接刷信用卡或手机，不用买交通卡。',
    '纽约每人用自己的卡或手机刷：OMNY 按卡算 7 天封顶 $35，两人共用一张卡就享受不到封顶。',
    '费城 SEPTA 一张卡可以替最多 5 人付费，这是唯一能“一卡多人”的城市。',
    '用免外汇手续费的信用卡刷交通，小额也会被收 1–1.5% 手续费。',
    '纽约 Penn Station 的 Amtrak 在 Moynihan 大厅候车，站台号开车前 10–15 分钟才公布。'
  ], src: 'MTA、WMATA、SEPTA 官方公告' },
  { group: '坐大巴', tone: 'bus', items: [
    '行李一般 1 件托运 + 1 件手提，超出现场收费。两人各一个大箱子刚好。',
    '很多上车点是路边站（如 FlixBus W 31st St），以 App 里的地图钉为准，提前 20 分钟到。',
    'Port Authority 巴士总站很绕，第一次去留 30 分钟找候车口。',
    '节前 12/23 和节后 12/26–27 的 I-95 很堵，有球赛的日子坐早班车。',
    '下大雪时大巴取消概率比火车高，看到暴雪预报就改签或换火车。',
    '大巴 Wi-Fi 和插座不稳定，充电宝充满再上车。'
  ], src: 'FlixBus、Omio、Wanderu' },
  { group: '看球', tone: 'acc', items: [
    '弱队主场（奇才、篮网）转售票常在赛前 24–48 小时降价；76人、凯尔特人早买。',
    'TickPick 不收买家手续费；SeatGeek、StubHub 结算前看含费总价再比。',
    '电子票是 App 里会动的二维码，截图进不去。两人买连座，买完转一张给同伴。',
    '球馆不让带双肩包，场内基本只收卡。开球前 45–60 分钟到，看热身。'
  ], src: '各球馆官网、TickPick' },
  { group: '纽约过圣诞', tone: 'rail', items: [
    '大都会每周三和 12/25 闭馆，非纽约居民 $30。',
    '洛克菲勒圣诞树早上 8 点前或晚上 11 点后人最少。',
    '12/25 地铁按周日时刻表，大部分商店关门，唐人街中餐馆照常营业。',
    '布莱恩公园有免费干净的公厕。纽约公厕少，咖啡馆和商场是备选。',
    '酒店另收每晚 $20–45 设施费，比价看结算页含税总价。'
  ], src: '大都会官网、Time Out New York' },
  { group: '钱和小费', tone: 'bus', items: [
    '餐厅小费 18–22%，按税前金额算；柜台点单可以不给。纽约餐饮税 8.875%。',
    '刷卡时机器问用美元还是人民币结算，选美元（USD）。',
    '酒店行李寄存每件 $2–5，打车或 Uber 给 15% 左右。',
    '带 $50–100 小面额现金给小费和应急。'
  ], src: '旅行者经验' },
  { group: '防骗和安全', tone: 'acc', items: [
    '时代广场人偶合影要付钱，有人塞 CD、手环或“祝福卡”别接。',
    '机场和车站主动拉“Taxi?”的是黑车，只坐官方排队点的出租车或 App 叫车。',
    '深夜坐地铁坐中间有列车员的车厢。',
    '跨年前后景点人多，手机放前面口袋。'
  ], src: '旅行者经验' },
  { group: '洛杉矶转机', tone: 'rail', items: [
    '两段机票分开买：前段延误后段不管。国际航班起飞前 3 小时到柜台，中间至少留 5 小时。',
    'LAX 机场捷运最新目标 2027-01-06 开通，12/31 仍坐免费接驳车。',
    '洛杉矶 12 月白天约 19°C、夜里约 9°C，羽绒服塞进箱子，穿卫衣就够。'
  ], src: 'Spectrum News、NBC、LA Metro' }
];

export const CHECKLIST = [
  { id: 't1', when: '本周', text: '决定 12/20 方案（A / B / C），然后买 12/20 的车票或球票', buy: ['amtrak', 'grey'], game: 'bos' },
  { id: 't2', when: '本周', text: '买 12/18 纽约 → 波士顿（火车买 Value 票，可改签）', buy: ['amtrak', 'flix', 'pp'] },
  { id: 't3', when: '本周', text: '两人登记 EVUS（约 $31.75/人）', buy: ['evus'] },
  { id: 't4', when: '11/15 前', text: '订 12/23 华盛顿 → 费城、12/24 费城 → 纽约的大巴（越早越便宜）', buy: ['wand', 'flix', 'mega', 'pp', 'our'] },
  { id: 't5', when: '11/15 前', text: '76人票先买；奇才、篮网在 TickPick 设降价提醒，赛前 1–2 天再买', game: 'phi' },
  { id: 't6', when: '11/20 前', text: '预约独立厅定时票；国会大厦导览（12/21）、国会图书馆定时票（12/22）', buy: ['rec', 'cap', 'loc'] },
  { id: 't7', when: '11/30 前', text: '决定 12/30 晚上：纽瓦克机场酒店，或改签纽约 → 洛杉矶航班', buy: ['booking', 'trip'] },
  { id: 't8', when: '12/1 前', text: '酒店都锁“可免费取消”价格；纽约选 2 Queen Beds 房型', buy: ['booking', 'trip'] },
  { id: 't9', when: '12/10 前', text: '订平安夜晚餐；买 Summit 日落场、eSIM 和旅行保险', buy: ['ot', 'resy', 'summit'] },
  { id: 't10', when: '12/15', text: '预约 12/31 圣莫尼卡行李寄存；下载 Google 离线地图', buy: ['bounce', 'lh'] },
  { id: 't11', when: '出发前 48h', text: '核对球赛时间、Amtrak 车次、宪法号开放时间、天气预报', buy: ['uss', 'nba'] }
];

export const SOURCES = [
  ['凯尔特人 vs 活塞 12/20 20:00（TickPick）', 'https://www.tickpick.com/buy-boston-celtics-vs-detroit-pistons-tickets-td-garden-12-20-26-8pm/8204231/'],
  ['奇才 vs 猛龙 12/22 19:00（TickPick）', 'https://www.tickpick.com/buy-washington-wizards-vs-toronto-raptors-tickets-capital-one-arena-12-22-26-7pm/8206041/'],
  ['76人 vs 火箭 12/23 19:30（TickPick）', 'https://www.tickpick.com/buy-philadelphia-76ers-vs-houston-rockets-tickets-xfinity-mobile-arena-12-23-26-7pm/8205299/'],
  ['篮网 vs 鹈鹕 12/26 18:00', 'https://new-york.events/tickets/brooklyn-nets-vs-new-orleans-pelicans-brooklyn-barclays-center-saturday-december-26-2026-6-00-pm/'],
  ['尼克斯 vs 篮网 12/27（Vivid Seats）', 'https://www.vividseats.com/new-york-knicks-tickets-madison-square-garden-12-27-2026/production/7431975'],
  ['NBA 2026-27 圣诞赛程', 'https://www.nba.com/news/nba-on-christmas-day-schedule-2026-27'],
  ['Amtrak 67 次运行记录（Transitdocs）', 'https://asm.transitdocs.com/train/2026/10/7/A/67'],
  ['波士顿 → 华盛顿 火车（Omio）', 'https://www.omio.com/trains/boston-ma/washington-dc'],
  ['波士顿 → 华盛顿 大巴（CheckMyBus）', 'https://checkmybus.com/boston-ma/washington-dc'],
  ['华盛顿 → 费城 大巴（12go）', 'https://12go.com/en/bus/washington-dc-union-station/philadelphia'],
  ['费城 → 纽约 大巴（Megabus）', 'https://us.megabus.com/route-guides/philadelphia-to-new-york-bus'],
  ['纽约 → 波士顿 大巴（Omio）', 'https://www.omio.com/buses/new-york-ny/boston-ma'],
  ['宪法号开放时间（美国海军）', 'https://www.navy.mil/USS-Constitution/Hours-Visitor-Info/'],
  ['LAX 捷运延期（Spectrum News）', 'https://spectrumlocalnews.com/ca/california/transportation/2026/09/24/lax-automated-people-mover'],
  ['LAX/Metro Transit Center（LA Metro）', 'https://www.metro.net/metrotransitcenter/'],
  ['EVUS 收费调整', 'https://www.travelandtourworld.com/news/article/at1uyv1266fw/'],
  ['MTA 2026 票价', 'https://www.mta.info/press-release/mta-board-adopts-fare-and-toll-increases-take-effect-january-2026'],
  ['纽约 → 纽瓦克机场（MTA）', 'https://new2stg.mta.info/guides/airports/newark-ewr'],
  ['大都会开放时间', 'https://www.metmuseum.org/plan-your-visit'],
  ['SEPTA 一卡多人', 'https://www.metro-magazine.com/news/philadelphias-septa-introduces-multi-rider-feature-for-contactless-payments'],
  ['76人主场改名', 'https://www.nbcphiladelphia.com/news/sports/nhl/philadelphia-flyers/xfinity-mobile-arena-official-name-home-of-flyers-sixers-formerly-wells-fargo-center/4254234/?amp=1'],
  ['洛克菲勒圣诞树 2026（Time Out）', 'https://www.timeout.com/newyork/news/the-2026-rockefeller-center-christmas-tree-lighting-has-officially-been-announced-and-its-happening-earlier-than-you-think-092926'],
  ['费城圣诞村 2026', 'https://www.mychesco.com/a/news/regional/philadelphia-christmas-village-extends-season-beyond-christmas/'],
  ['波士顿节日活动和 Blink!', 'https://freetoursbyfoot.com/holiday-events-in-boston/']
];
