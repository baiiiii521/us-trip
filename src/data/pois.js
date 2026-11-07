// 景点 / 美食 / 球馆 / 交通枢纽图鉴
// wiki: 英文维基条目名，网页运行时从维基百科读取首图和图片版权（失败时显示占位明信片）
// photo: 想用自己拍的照片时填 public/ 下的相对路径，例如 'img/uss-constitution.jpg'，会优先于维基图片
// q: 导航用的地点搜索词（Google / Apple 地图）
// 开放时间按官网惯例写成大概范围，出发前以官网为准

export const POIS = [
  // ───────── 波士顿 ─────────
  {
    id: 'south-station', city: 'bos', cat: 'hub', name: '南站 South Station', en: 'South Station',
    wiki: 'South_Station', q: 'South Station, Boston, MA',
    tag: '波士顿火车和长途大巴枢纽',
    intro: '1899 年的花岗岩站房，Amtrak 在主楼，长途大巴在相连的巴士总站楼上。67 次过夜车从这里出发。',
    open: '全天', ticket: '—', stay: '—', transit: '红线 South Station 站',
    tip: '站内有美食区，上夜车前在这里买晚饭、水和零食。'
  },
  {
    id: 'harvard-yard', city: 'bos', cat: 'sight', name: '哈佛园 Harvard Yard', en: 'Harvard Yard',
    wiki: 'Harvard_Yard', q: 'Harvard Yard, Cambridge, MA',
    tag: '哈佛 1636 年建校的原址',
    intro: '红砖楼和老榆树围出的一片草坪，是哈佛最老的校园核心区。宿舍、Widener 图书馆和纪念教堂都在这里，是美国最有名的校园风景之一。',
    highlights: [
      'John Harvard 铜像，人称“三个谎言雕像”：雕像不是他本人，他也不是创校人，底座年份还写错了',
      '铜像左脚被游客摸得锃亮，据说摸了带来好运',
      'Widener 图书馆：哈佛最大的图书馆，正面一排科林斯柱'
    ],
    open: '校园全天开放，寒假期间楼内不对外', ticket: '免费', stay: '约 1 小时', transit: '红线 Harvard 站出站即到',
    tip: '寒假学生少，拍照最清净；铜像前常排队，早上 9 点前去。旁边的哈佛广场有书店和咖啡馆。'
  },
  {
    id: 'mit-dome', city: 'bos', cat: 'sight', name: 'MIT 大圆顶', en: 'MIT Great Dome',
    wiki: 'Killian_Court', q: 'Killian Court, MIT, Cambridge, MA',
    tag: 'MIT 的标志和“恶作剧”舞台',
    intro: '新古典主义大圆顶下面是 Killian Court 草坪，正对查尔斯河。圆顶是 MIT 学生 hack（恶作剧）的传统舞台，曾经被放上警车和消防车。',
    highlights: ['无限长廊 Infinite Corridor：约 251 米长的走廊贯穿主楼', 'Killian Court：毕业典礼场地，冬天草坪覆雪很好拍'],
    open: '校园全天开放，楼内工作日白天可进', ticket: '免费', stay: '约 45 分钟', transit: '红线 Kendall/MIT 站步行 10 分钟',
    tip: '从 Killian Court 往河边走，正好接上 Harvard Bridge。MIT 博物馆按你的规则不进。'
  },
  {
    id: 'stata', city: 'bos', cat: 'sight', name: 'Stata Center', en: 'Ray and Maria Stata Center',
    wiki: 'Ray_and_Maria_Stata_Center', q: 'Stata Center, 32 Vassar St, Cambridge, MA',
    tag: '盖里设计的“揉皱积木”',
    intro: '建筑大师弗兰克·盖里设计，2004 年落成。歪斜的金属和砖块像被揉皱的积木，里面是 MIT 计算机科学与人工智能实验室。',
    open: '外观随时可看，大厅工作日开放', ticket: '免费', stay: '约 20 分钟', transit: '红线 Kendall/MIT 站步行 5 分钟',
    tip: '从 Vassar Street 一侧拍最有冲击力。'
  },
  {
    id: 'harvard-bridge', city: 'bos', cat: 'sight', name: 'Harvard Bridge（Smoot 桥）', en: 'Harvard Bridge',
    wiki: 'Harvard_Bridge', q: 'Harvard Bridge, Boston, MA',
    tag: '用同学身高量出来的桥',
    intro: '连接 MIT 和 Back Bay 的大桥。1958 年 MIT 学生用同学 Oliver Smoot 的身高丈量全桥：364.4 Smoots 加一只耳朵，桥面刻度至今每年重刷。',
    highlights: ['Smoot 后来当上了美国国家标准协会主席和国际标准化组织主席', 'Google 计算器里能把米换算成 Smoot', '桥上同时看到波士顿天际线和查尔斯河'],
    open: '全天', ticket: '免费', stay: '走完约 20 分钟', transit: 'MIT 一侧上桥，下桥就是 Back Bay',
    tip: '河面风大，过桥体感比气温低好几度，帽子手套戴好。'
  },
  {
    id: 'beacon-hill', city: 'bos', cat: 'sight', name: '灯塔山 · 橡果街', en: 'Acorn Street, Beacon Hill',
    wiki: 'Beacon_Hill,_Boston', q: 'Acorn Street, Boston, MA',
    tag: '全美拍照最多的街道之一',
    intro: '灯塔山是波士顿最老的高档住宅区，砖人行道、煤气路灯和黑色百叶窗都保留着 19 世纪的样子。橡果街是一条窄窄的鹅卵石小巷。',
    open: '全天', ticket: '免费', stay: '约 30 分钟', transit: '红线 Charles/MGH 站或绿线 Park Street 站步行 10 分钟',
    tip: '这是居民区，别坐门前台阶、别大声喧哗；鹅卵石很滑，穿防滑鞋。日落 16:15 前光线最好。'
  },
  {
    id: 'public-garden', city: 'bos', cat: 'sight', name: '波士顿公共花园', en: 'Boston Public Garden',
    wiki: 'Boston_Public_Garden', q: 'Boston Public Garden, Boston, MA',
    tag: '美国第一座公共植物园',
    intro: '1837 年建成。冬天湖面结冰、天鹅船停航，但《让路给小鸭子》的铜像还在，节日期间常被市民戴上帽子围巾。',
    highlights: ['《让路给小鸭子》铜像：鸭妈妈带八只小鸭，来自 1941 年的同名绘本', '乔治·华盛顿骑马像，正对 Commonwealth Avenue'],
    open: '全天', ticket: '免费', stay: '约 40 分钟', transit: '绿线 Arlington 站',
    tip: '旁边就是波士顿公园 Boston Common，两园连着逛。'
  },
  {
    id: 'faneuil-hall', city: 'bos', cat: 'food', name: '法纳尔厅 · 昆西市场', en: 'Faneuil Hall & Quincy Market',
    wiki: 'Faneuil_Hall', q: 'Quincy Market, Boston, MA',
    tag: '“自由的摇篮”和美食廊',
    intro: '法纳尔厅建于 1742 年，是美国独立前的集会场所，被称为“自由的摇篮”。后面的昆西市场是 1826 年的长条形市场大厅，现在是美食廊，蛤蜊浓汤和龙虾卷都在这里。',
    highlights: ['12 月广场上有大圣诞树和 Blink! 灯光音乐秀，往年 16:30–22:00 每半小时一场', '昆西市场中间大厅有座位，冬天可以坐下吃'],
    open: '市场约 10:00–21:00，周日较早', ticket: '免费', stay: '1–1.5 小时', transit: '橙线/蓝线 State 站或绿线 Government Center 站',
    tip: '龙虾卷有热黄油版（Connecticut）和冷蛋黄酱版（Maine），两人各点一个换着吃。'
  },
  {
    id: 'uss-constitution', city: 'bos', cat: 'sight', name: '宪法号 USS Constitution', en: 'USS Constitution',
    wiki: 'USS_Constitution', q: 'USS Constitution, Charlestown Navy Yard, Boston, MA',
    tag: '世界上仍在服役的最老军舰',
    intro: '1797 年下水。1812 年战争中击败英舰，炮弹打在橡木船身上被弹开，从此得名“老铁甲”（Old Ironsides）。船上讲解员是现役美国海军水兵。',
    highlights: ['上甲板和炮甲板都能走，看 18 世纪的炮位和吊床', '停在 Charlestown Navy Yard，对岸就是波士顿市中心'],
    open: '海军官网写周三至周日开放，冬季时间可能缩短', ticket: '免费', stay: '约 1 小时', transit: 'MBTA F4 渡轮到 Navy Yard，或从北区步行过 Charlestown 大桥约 25 分钟',
    tip: '18 岁以上要出示带照片的证件，外国游客带护照；要过机场式安检。',
    buy: ['uss']
  },
  {
    id: 'north-end', city: 'bos', cat: 'food', name: '北区 North End', en: 'North End',
    wiki: 'North_End,_Boston', q: 'Hanover Street, North End, Boston, MA',
    tag: '波士顿最老的街区，意大利美食',
    intro: '波士顿最老的住宅区，19 世纪末起是意大利移民聚居地。窄街两边全是意式餐馆和面包房，自由之路上的保罗·里维尔故居和老北教堂也在这里。',
    highlights: ['Regina Pizzeria：1926 年开业的砖炉披萨老店', 'Mike\'s Pastry 和 Modern Pastry 的奶油卷 cannoli 之争', '老北教堂：1775 年在尖塔挂灯笼报信“英军走水路来了”'],
    open: '全天', ticket: '免费', stay: '约 2 小时', transit: '橙线/绿线 Haymarket 站步行 5 分钟',
    tip: 'Mike\'s 排队长，Modern 人少些。自由之路沿线的墓园按你的规则跳过。'
  },
  {
    id: 'bpl', city: 'bos', cat: 'sight', name: '波士顿公共图书馆', en: 'Boston Public Library',
    wiki: 'Boston_Public_Library', q: 'Boston Public Library Central Library, Copley Square, Boston, MA',
    tag: '最出片的阅览室 Bates Hall',
    intro: '美国第一座大型免费市立图书馆。1895 年的 McKim 大楼像一座文艺复兴宫殿，二楼 Bates Hall 阅览室长约 66 米，绿色台灯排成一列。',
    highlights: ['Bates Hall：拱顶阅览室，保持安静可以拍照', '中庭回廊：冬天也能坐一会儿'],
    open: '周一至周四约 9:00–20:00，周五周六约 9:00–17:00，冬季周日 13:00–17:00', ticket: '免费', stay: '约 45 分钟', transit: '绿线 Copley 站出站即到',
    tip: '出门看对面的三一教堂，和约翰·汉考克大楼玻璃幕墙里的倒影同框。'
  },
  {
    id: 'td-garden', city: 'bos', cat: 'arena', name: 'TD Garden', en: 'TD Garden',
    wiki: 'TD_Garden', q: 'TD Garden, 100 Legends Way, Boston, MA',
    tag: '凯尔特人主场，18 面冠军旗',
    intro: '凯尔特人和棕熊的主场，建在 North Station 火车站楼上。顶棚挂着凯尔特人 18 面总冠军旗，NBA 夺冠次数最多的球队。',
    open: '开赛前约 1 小时开门', ticket: '见球赛页', stay: '约 3 小时', transit: '绿线/橙线 North Station 站，球馆就在楼上',
    tip: '球馆不让带双肩包，只带手机、钱包或小斜挎包。', game: 'bos'
  },

  // ───────── 华盛顿 ─────────
  {
    id: 'union-station-dc', city: 'dc', cat: 'hub', name: '联合车站 Union Station', en: 'Union Station',
    wiki: 'Union_Station_(Washington,_D.C.)', q: 'Union Station, 50 Massachusetts Ave NE, Washington, DC',
    tag: '火车和大巴都在这里',
    intro: '1907 年落成的布杂艺术风格车站，大厅金色藻井很气派。Amtrak 在主楼，长途大巴在车站后面停车楼的巴士层。',
    open: '全天', ticket: '—', stay: '—', transit: '红线 Union Station 站',
    tip: '67 次早上 6:54 到，站内有早餐。去巴士层跟着 Bus Deck 指示牌上停车楼。'
  },
  {
    id: 'capitol', city: 'dc', cat: 'sight', name: '国会大厦', en: 'United States Capitol',
    wiki: 'United_States_Capitol', q: 'US Capitol Visitor Center, Washington, DC',
    tag: '可以预约免费导览',
    intro: '美国国会所在地，铸铁穹顶 1866 年完工。地下的国会游客中心可以预约免费导览，进圆形大厅看穹顶壁画《华盛顿的神化》。',
    open: '游客中心周一至周六 8:30–16:30', ticket: '免费，官网预约导览', stay: '约 1.5 小时', transit: '蓝/橙/银线 Capitol South 站',
    tip: '安检不让带食物和饮料，进去前喝完。', buy: ['cap']
  },
  {
    id: 'loc', city: 'dc', cat: 'sight', name: '国会图书馆杰斐逊大楼', en: 'Library of Congress',
    wiki: 'Thomas_Jefferson_Building', q: 'Thomas Jefferson Building, Library of Congress, Washington, DC',
    tag: '大理石、壁画和古腾堡圣经',
    intro: '世界上馆藏最多的图书馆之一。1897 年的主楼大厅满是大理石、马赛克和壁画，可以从观景廊俯瞰圆形主阅览室，还能看到古腾堡圣经。',
    open: '一般周二至周六开放，周日周一闭馆', ticket: '免费，官网领定时入场票', stay: '约 1 小时', transit: '蓝/橙/银线 Capitol South 站，和国会大厦有地下通道',
    tip: '周一闭馆，所以排在 12/22 周二。', buy: ['loc']
  },
  {
    id: 'washington-monument', city: 'dc', cat: 'sight', name: '华盛顿纪念碑', en: 'Washington Monument',
    wiki: 'Washington_Monument', q: 'Washington Monument, Washington, DC',
    tag: '碑身有一道颜色分界线',
    intro: '169 米高的大理石方尖碑，曾是世界最高建筑。碑身约三分之一高度处颜色不同：建到一半因资金和内战停工 20 多年，复工后换了采石场。',
    highlights: ['往西一眼看到倒影池和林肯纪念堂，往东是国会大厦'],
    open: '外观全天', ticket: '外观免费（登顶需预约，按规则不上）', stay: '约 20 分钟', transit: '蓝/橙/银线 Smithsonian 站步行 10 分钟',
    tip: '国家广场很大，从国会走到林肯纪念堂约 3.5 公里，穿好走的鞋。'
  },
  {
    id: 'ww2-memorial', city: 'dc', cat: 'sight', name: '二战纪念碑', en: 'National World War II Memorial',
    wiki: 'National_World_War_II_Memorial', q: 'World War II Memorial, Washington, DC',
    tag: '4,048 颗金星',
    intro: '2004 年落成，56 根花岗岩柱代表二战时美国各州和领地，中间是喷泉池。墙上 4,048 颗金星，每颗代表约 100 名阵亡美军。',
    open: '全天', ticket: '免费', stay: '约 20 分钟', transit: '在华盛顿纪念碑和倒影池之间',
    tip: '找找墙后藏着的“Kilroy was here”刻字，二战美军的经典涂鸦。'
  },
  {
    id: 'lincoln', city: 'dc', cat: 'sight', name: '林肯纪念堂', en: 'Lincoln Memorial',
    wiki: 'Lincoln_Memorial', q: 'Lincoln Memorial, Washington, DC',
    tag: '《我有一个梦想》发表地',
    intro: '1922 年落成，仿希腊神庙的 36 根柱子代表林肯去世时的 36 个州。1963 年马丁·路德·金在台阶上发表《我有一个梦想》，演讲位置刻在台阶上。',
    open: '全天，夜里灯光更美', ticket: '免费', stay: '约 30 分钟', transit: '橙/蓝/银线 Foggy Bottom 站步行 15 分钟',
    tip: '台阶上找刻着 I HAVE A DREAM 的位置；顺路看越战、韩战纪念碑。'
  },
  {
    id: 'jefferson', city: 'dc', cat: 'sight', name: '杰斐逊纪念堂 · 潮汐湖', en: 'Jefferson Memorial',
    wiki: 'Jefferson_Memorial', q: 'Jefferson Memorial, Washington, DC',
    tag: '湖边的万神殿',
    intro: '1943 年落成，仿罗马万神殿的圆顶建筑立在潮汐湖边，里面是约 5.8 米高的杰斐逊铜像，墙上刻着《独立宣言》段落。',
    open: '全天', ticket: '免费', stay: '约 30 分钟', transit: '从林肯纪念堂沿潮汐湖步行约 25 分钟',
    tip: '沿湖顺路看马丁·路德·金纪念碑和罗斯福纪念园，三处连走约 1.5 小时。'
  },
  {
    id: 'white-house', city: 'dc', cat: 'sight', name: '白宫', en: 'White House',
    wiki: 'White_House', q: 'Lafayette Square, Washington, DC',
    tag: '隔着围栏看总统官邸',
    intro: '美国总统官邸。北侧拉法耶特广场和南侧椭圆公园都能隔着围栏看到主楼。内部参观要提前数月申请，这次只看外观。',
    open: '外观全天', ticket: '免费', stay: '约 20 分钟', transit: '橙/蓝/银线 McPherson Square 或 Farragut West 站',
    tip: '周边安保严，偶尔临时封路，以现场警察指示为准。'
  },
  {
    id: 'national-tree', city: 'dc', cat: 'sight', name: '国家圣诞树', en: 'National Christmas Tree',
    wiki: 'National_Christmas_Tree_(United_States)', q: 'President\'s Park Ellipse, Washington, DC',
    tag: '1923 年起的总统点灯传统',
    intro: '每年 12 月在白宫南侧椭圆公园点亮。主树周围一圈小树代表美国各州和领地，还有小火车模型。',
    open: '12 月傍晚亮灯，一般到元旦前后', ticket: '免费', stay: '约 30 分钟', transit: '橙/蓝/银线 Federal Triangle 站步行 10 分钟',
    tip: '天黑后再去，华盛顿日落约 16:50。'
  },
  {
    id: 'georgetown', city: 'dc', cat: 'sight', name: '乔治城', en: 'Georgetown',
    wiki: 'Georgetown_(Washington,_D.C.)', q: 'M Street NW & Wisconsin Ave NW, Washington, DC',
    tag: '比华盛顿还老的港口镇',
    intro: '1751 年建镇，比华盛顿特区还早。联排砖房、M Street 商街和 C&O 运河，网红甜品 Georgetown Cupcake 在这里起家。',
    highlights: ['C&O 运河：19 世纪的运河和纤道', '《驱魔人》阶梯：电影取景地，陡且窄，在下面拍就好', '乔治城大学：1789 年建校'],
    open: '全天', ticket: '免费', stay: '2–3 小时', transit: '地铁不直达，从 Foggy Bottom 站步行约 20 分钟或坐公交',
    tip: '按你的规则不购物，M Street 只逛不买。'
  },
  {
    id: 'wharf', city: 'dc', cat: 'food', name: 'Maine Avenue 鱼市', en: 'Maine Avenue Fish Market',
    wiki: 'Maine_Avenue_Fish_Market', q: 'Maine Avenue Fish Market, Washington, DC',
    tag: '现蒸蓝蟹撒 Old Bay',
    intro: '1805 年开市，美国连续营业最久的露天鱼市，在 The Wharf 滨水区旁边。现点现蒸的蓝蟹撒 Old Bay 调料，是马里兰一带的吃法。',
    open: '每天营业，白天到晚上', ticket: '按重量计价', stay: '约 1 小时', transit: '绿线 Waterfront 站或 L\'Enfant Plaza 站步行 10 分钟',
    tip: '蓝蟹按打卖，两个人点半打够了；站着吃，带湿纸巾。'
  },
  {
    id: 'capital-one', city: 'dc', cat: 'arena', name: 'Capital One Arena', en: 'Capital One Arena',
    wiki: 'Capital_One_Arena', q: 'Capital One Arena, 601 F St NW, Washington, DC',
    tag: '奇才主场，中国城牌楼旁',
    intro: '奇才和冰球首都人队的主场，1997 年开馆，带动了整个 Penn Quarter 街区。门口不远就是中国城友谊牌楼。',
    open: '开赛前约 1 小时开门', ticket: '见球赛页', stay: '约 3 小时', transit: '红/绿/黄线 Gallery Place-Chinatown 站出站即到',
    tip: '友谊牌楼是 1986 年北京与华盛顿结为友好城市后合建的，顺路拍照。', game: 'was'
  },
  {
    id: 'bens', city: 'dc', cat: 'food', name: 'Ben\'s Chili Bowl', en: 'Ben\'s Chili Bowl',
    wiki: 'Ben\'s_Chili_Bowl', q: 'Ben\'s Chili Bowl, 1213 U St NW, Washington, DC',
    tag: '1958 年的 half-smoke 热狗',
    intro: '1958 年在 U Street 开业的老店。招牌 half-smoke 是烟熏粗香肠浇辣肉酱。1968 年骚乱时它一直开门，奥巴马当选后也来吃过。',
    open: '每天中午到深夜', ticket: '人均约 $15', stay: '约 45 分钟', transit: '绿/黄线 U Street 站出站即到',
    tip: '点 Original Chili Half-Smoke，再加一份芝士辣酱薯条。'
  },

  // ───────── 费城 ─────────
  {
    id: 'reading-terminal', city: 'phl', cat: 'food', name: 'Reading Terminal Market', en: 'Reading Terminal Market',
    wiki: 'Reading_Terminal_Market', q: 'Reading Terminal Market, Philadelphia, PA',
    tag: '老火车站底下的美食市场',
    intro: '1893 年开业，建在老火车站的站房底下，70 多家摊位。DiNic\'s 烤猪肉三明治被评为“全美最佳三明治”，阿米什人的摊位卖手工甜甜圈和软椒盐卷饼。',
    highlights: ['DiNic\'s：烤猪肉配西兰花苗和普罗卧伏芝士', 'Beiler\'s 甜甜圈：阿米什摊位，一般周中到周六营业'],
    open: '每天约 8:00–18:00', ticket: '人均 $15–25', stay: '约 1 小时', transit: 'SEPTA 市场-法兰克福线 11th St 站或 Jefferson Station',
    tip: '节前人多，11:30 前或 13:30 后去；先占座再分头排队。'
  },
  {
    id: 'independence-hall', city: 'phl', cat: 'sight', name: '独立厅', en: 'Independence Hall',
    wiki: 'Independence_Hall', q: 'Independence Hall, Philadelphia, PA',
    tag: '《独立宣言》和宪法诞生地',
    intro: '1776 年在这里签署《独立宣言》，1787 年在这里起草《美国宪法》，是世界文化遗产。由国家公园管理员带队讲解，约 30 分钟。',
    open: '约 9:00–17:00', ticket: '免费，recreation.gov 定时票，每张 $1 手续费', stay: '约 1 小时（含自由钟）', transit: '市场-法兰克福线 5th St 站',
    tip: '2026 是美国建国 250 周年，独立厅全年热门，尽早约票。', buy: ['rec']
  },
  {
    id: 'liberty-bell', city: 'phl', cat: 'sight', name: '自由钟', en: 'Liberty Bell',
    wiki: 'Liberty_Bell', q: 'Liberty Bell Center, Philadelphia, PA',
    tag: '有裂缝的那口钟',
    intro: '1752 年铸造，有一道著名的裂缝。19 世纪废奴运动拿它当象征，“自由钟”这个名字就是那时叫开的。在独立厅对面的玻璃展馆里。',
    open: '约 9:00–17:00', ticket: '免费，无需预约，排安检', stay: '约 30 分钟', transit: '市场-法兰克福线 5th St 站',
    tip: '展馆外隔着玻璃也能拍到钟和独立厅同框。'
  },
  {
    id: 'elfreth', city: 'phl', cat: 'sight', name: 'Elfreth\'s Alley', en: 'Elfreth\'s Alley',
    wiki: 'Elfreth\'s_Alley', q: 'Elfreth\'s Alley, Philadelphia, PA',
    tag: '美国最老的住家小巷',
    intro: '1703 年就有人住，号称美国连续有人居住最久的街道。32 栋砖房保留着殖民时期的样子，现在仍是住家。',
    open: '全天', ticket: '免费', stay: '约 20 分钟', transit: '5th St 站步行 10 分钟',
    tip: '居民区，别敲门、别坐台阶。'
  },
  {
    id: 'love-park', city: 'phl', cat: 'sight', name: 'LOVE 雕塑', en: 'LOVE Park',
    wiki: 'Love_Park', q: 'LOVE Park, Philadelphia, PA',
    tag: '费城最有名的合影点',
    intro: '正式名字是 JFK Plaza，因 Robert Indiana 的 LOVE 雕塑出名。从这里能看到市政厅钟楼和富兰克林大道。12 月公园里是圣诞村市集。',
    open: '全天', ticket: '免费', stay: '约 20 分钟', transit: 'SEPTA 15th St / City Hall 站',
    tip: '按你的规则，圣诞市集只路过不逛。'
  },
  {
    id: 'pats-genos', city: 'phl', cat: 'food', name: 'Pat\'s vs Geno\'s 芝士牛肉堡', en: 'Pat\'s King of Steaks',
    wiki: 'Pat\'s_King_of_Steaks', q: 'Pat\'s King of Steaks, 1237 E Passyunk Ave, Philadelphia, PA',
    tag: '隔街对打半个多世纪',
    intro: 'Pat\'s 自称 1930 年发明了费城芝士牛肉堡，对街的 Geno\'s 1966 年开业，两家霓虹招牌隔着路口对打了半个多世纪。',
    highlights: ['点单口令：“One wiz wit” = 一份，芝士酱，加洋葱', '不要洋葱说 “witout”，想要普罗卧伏芝士说 “provolone”'],
    open: '24 小时', ticket: '每份约 $15', stay: '约 30 分钟', transit: '从这里步行约 10 分钟到 Ellsworth-Federal 站，坐 Broad Street Line 去球馆',
    tip: '两家各点一份分着吃，自己评判。'
  },
  {
    id: 'xfinity-arena', city: 'phl', cat: 'arena', name: 'Xfinity Mobile Arena', en: 'Xfinity Mobile Arena',
    wiki: 'Xfinity_Mobile_Arena', q: 'Xfinity Mobile Arena, 3601 S Broad St, Philadelphia, PA',
    tag: '76人主场（原 Wells Fargo Center）',
    intro: '76人和费城飞人队的主场，1996 年开馆，原名 Wells Fargo Center，2025 年改为现名。在南费城体育园区，旁边是老鹰队和费城人队的球场。',
    open: '开赛前约 1 小时开门', ticket: '见球赛页', stay: '约 3 小时', transit: 'Broad Street Line 坐到底站 NRG Station',
    tip: '散场后 Broad Street Line 有加开班次，跟着人流走。', game: 'phi'
  },
  {
    id: 'rocky-steps', city: 'phl', cat: 'sight', name: 'Rocky 台阶', en: 'Rocky Steps',
    wiki: 'Rocky_Steps', q: 'Rocky Statue, Philadelphia, PA',
    tag: '电影《洛奇》的 72 级台阶',
    intro: '费城艺术博物馆门前的 72 级台阶，电影里主角跑上台阶举拳的经典场面。Rocky 铜像在台阶右下方。',
    open: '全天', ticket: '免费', stay: '约 20 分钟', transit: '从市政厅沿富兰克林大道步行约 25 分钟，或坐公交',
    tip: '按你的规则不爬也行，在铜像前举拳拍照就够了。'
  },

  // ───────── 纽约 ─────────
  {
    id: 'moynihan', city: 'nyc', cat: 'hub', name: 'Moynihan 火车大厅', en: 'Moynihan Train Hall',
    wiki: 'Moynihan_Train_Hall', q: 'Moynihan Train Hall, New York, NY',
    tag: 'Amtrak 和长岛铁路候车厅',
    intro: '2021 年启用，由 1912 年的老邮政大楼改建，巨大玻璃天窗下有座位和餐饮。Amtrak、长岛铁路在这里候车。',
    open: '全天', ticket: '—', stay: '—', transit: 'A/C/E 线 34 St–Penn Station',
    tip: 'Amtrak 站台号开车前 10–15 分钟才公布，看大屏或 App 推送。'
  },
  {
    id: 'port-authority', city: 'nyc', cat: 'hub', name: 'Port Authority 巴士总站', en: 'Port Authority Bus Terminal',
    wiki: 'Port_Authority_Bus_Terminal', q: 'Port Authority Bus Terminal, 625 8th Ave, New York, NY',
    tag: '世界上最繁忙的巴士总站',
    intro: '在 8th Ave 和 42nd St 交口。Greyhound、Peter Pan 和部分 FlixBus 从这里发车，FlixBus 售票在北翼地铁层，候车口在下层。',
    open: '全天运营，深夜部分区域关闭', ticket: '—', stay: '—', transit: 'A/C/E 线 42 St–Port Authority',
    tip: '楼里很绕，第一次去留 30 分钟找候车口。'
  },
  {
    id: 'rockefeller-tree', city: 'nyc', cat: 'sight', name: '洛克菲勒中心圣诞树', en: 'Rockefeller Center Christmas Tree',
    wiki: 'Rockefeller_Center_Christmas_Tree', q: 'Rockefeller Center Christmas Tree, New York, NY',
    tag: '2026 年：75 岁、约 23 米高',
    intro: '1931 年工人们凑钱立起第一棵树，1933 年开始正式点灯。2026 年这棵挪威云杉树龄约 75 年、高约 23 米，挂 5 万多颗 LED，顶上是施华洛世奇水晶星。',
    highlights: ['树下是著名的溜冰场（按规则只看不滑）', '对面 Saks 第五大道外墙入夜后有灯光秀'],
    open: '12/2 点灯后每天亮灯，一般到 1 月上旬', ticket: '免费', stay: '约 30 分钟', transit: 'B/D/F/M 线 47-50 Sts–Rockefeller Ctr',
    tip: '早上 8 点前或晚上 11 点后人最少；平安夜傍晚会分流管制。'
  },
  {
    id: 'st-patricks', city: 'nyc', cat: 'sight', name: '圣帕特里克大教堂', en: 'St. Patrick\'s Cathedral',
    wiki: 'St._Patrick\'s_Cathedral_(Manhattan)', q: 'St. Patrick\'s Cathedral, New York, NY',
    tag: '美国最大的哥特式天主教堂',
    intro: '1879 年落成的新哥特式大教堂，就在洛克菲勒中心对面，双尖塔夹在摩天楼中间。',
    open: '每天开放，弥撒时段保持安静', ticket: '免费', stay: '约 20 分钟', transit: 'E/M 线 5 Av/53 St 站',
    tip: '平安夜和圣诞弥撒人很多，只看外观即可。'
  },
  {
    id: 'bryant-park', city: 'nyc', cat: 'sight', name: '布莱恩公园 Winter Village', en: 'Bryant Park',
    wiki: 'Bryant_Park', q: 'Bryant Park, New York, NY',
    tag: '全程唯一逛的节日市集',
    intro: '纽约公共图书馆背后的城市客厅。冬天变成 Winter Village：免费溜冰场加上百个玻璃小屋组成的节日市集。',
    highlights: ['纽约公共图书馆主馆门口的两只石狮叫“耐心”和“坚毅”', '公园公厕是全纽约最干净的公厕之一'],
    open: '节日市集约 10 月底到 1 月初', ticket: '免费', stay: '约 1 小时', transit: 'B/D/F/M 线 42 St–Bryant Park 或 7 号线 5 Av',
    tip: '这里是全程唯一安排的节日市集。'
  },
  {
    id: 'macys', city: 'nyc', cat: 'sight', name: '梅西百货先驱广场', en: 'Macy\'s Herald Square',
    wiki: 'Macy\'s_Herald_Square', q: 'Macy\'s Herald Square, New York, NY',
    tag: '圣诞橱窗和百年木扶梯',
    intro: '1902 年起的梅西百货旗舰店，占了整个街区。12 月的圣诞橱窗是纽约传统，店里还保留着百年前的木制扶梯。',
    open: '约 10:00–22:00', ticket: '免费看橱窗', stay: '约 30 分钟', transit: 'B/D/F/M/N/Q/R/W 线 34 St–Herald Sq',
    tip: '按规则不购物，看橱窗就好。'
  },
  {
    id: 'central-park', city: 'nyc', cat: 'sight', name: '中央公园 · 贝塞斯达喷泉', en: 'Bethesda Terrace, Central Park',
    wiki: 'Bethesda_Terrace_and_Fountain', q: 'Bethesda Terrace, Central Park, New York, NY',
    tag: '电影里最常见的那座喷泉',
    intro: '中央公园的核心景观：天使喷泉、拱廊天花铺着一万多块英国明顿瓷砖，对面是 Bow Bridge。很多电影在这里取景。',
    highlights: ['Gapstow Bridge：公园东南角，背景是广场酒店', 'The Mall：两排美国榆树的林荫道', 'Bow Bridge：铸铁拱桥，看湖和天际线'],
    open: '公园 6:00–凌晨 1:00', ticket: '免费', stay: '1.5–2 小时', transit: 'N/R/W 线 5 Av/59 St 站进公园，沿 The Mall 走到底',
    tip: '冬天湖边路面可能结冰，走铺装路。'
  },
  {
    id: 'chinatown', city: 'nyc', cat: 'food', name: '唐人街', en: 'Chinatown, Manhattan',
    wiki: 'Chinatown,_Manhattan', q: 'Doyers Street, Chinatown, New York, NY',
    tag: '圣诞节吃中餐是纽约传统',
    intro: '北美最大的华人聚居区之一。圣诞节其他餐厅关门时，唐人街照常营业，“圣诞节吃中餐”在纽约是固定节目。',
    highlights: ['Nom Wah Tea Parlor：1920 年开在 Doyers Street 弯道上的老茶楼', 'Joe\'s Shanghai：小笼包', 'Doyers Street：常出现在电影里的弯街'],
    open: '全天', ticket: '人均 $20–35', stay: '约 1.5 小时', transit: 'J/N/Q/R/W/Z/6 线 Canal St',
    tip: '不少小店只收现金，带点零钱。'
  },
  {
    id: 'dyker', city: 'nyc', cat: 'sight', name: 'Dyker Heights 圣诞灯', en: 'Dyker Heights Christmas Lights',
    wiki: 'Dyker_Heights,_Brooklyn', q: '84th St & 11th Ave, Brooklyn, NY',
    tag: '纽约圣诞灯光最狂的街区',
    intro: '布鲁克林的独栋住宅区，从 1980 年代起居民比拼圣诞装饰：几层楼高的胡桃夹子、圣诞老人和成千上万的灯。',
    highlights: ['主要在 83 街到 86 街、11 大道到 13 大道之间'],
    open: '感恩节后到元旦，约 16:30–21:00', ticket: '免费', stay: '约 1.5 小时', transit: 'D 线 79 St 或 R 线 86 St 站，步行约 15 分钟',
    tip: '居民区，别踩草坪；21 点后不少人家关灯。'
  },
  {
    id: 'brooklyn-bridge', city: 'nyc', cat: 'sight', name: '布鲁克林大桥', en: 'Brooklyn Bridge',
    wiki: 'Brooklyn_Bridge', q: 'Brooklyn Bridge Pedestrian Walkway, New York, NY',
    tag: '1883 年的钢索悬索桥',
    intro: '1883 年通车，世界上第一座钢索悬索桥，哥特式石塔是纽约的标志。木板步道在车道上方，走完全程约 1.8 公里。',
    open: '全天', ticket: '免费', stay: '约 40 分钟', transit: '曼哈顿一侧：4/5/6 线 Brooklyn Bridge–City Hall 站',
    tip: '早上 9 点前人少；从曼哈顿往布鲁克林走，一路看着天际线拍照更方便回头。'
  },
  {
    id: 'dumbo', city: 'nyc', cat: 'sight', name: 'DUMBO', en: 'DUMBO',
    wiki: 'Dumbo,_Brooklyn', q: 'Washington Street & Water Street, Brooklyn, NY',
    tag: '桥洞框住帝国大厦的机位',
    intro: '名字是“曼哈顿桥高架下”的缩写。从 Washington St 和 Water St 路口回头看，曼哈顿大桥的桥洞正好框住帝国大厦，是全纽约最有名的机位之一。',
    highlights: ['Jane\'s 旋转木马：1922 年的老木马，装在玻璃盒子里', '布鲁克林大桥公园：看曼哈顿天际线'],
    open: '全天', ticket: '免费', stay: '约 1.5 小时', transit: 'F 线 York St 或 A/C 线 High St',
    tip: '机位人多，站在人行道上拍，注意来车。'
  },
  {
    id: 'promenade', city: 'nyc', cat: 'sight', name: '布鲁克林高地观景步道', en: 'Brooklyn Heights Promenade',
    wiki: 'Brooklyn_Heights_Promenade', q: 'Brooklyn Heights Promenade, Brooklyn, NY',
    tag: '本地人的天际线观景台',
    intro: '架在高速公路上方的一条步道，正对下曼哈顿天际线和自由女神。本地人遛狗晨跑的地方，游客比 DUMBO 少。',
    open: '全天', ticket: '免费', stay: '约 30 分钟', transit: '2/3 线 Clark St 站',
    tip: '下午光线顺，适合拍天际线。'
  },
  {
    id: 'barclays', city: 'nyc', cat: 'arena', name: 'Barclays Center', en: 'Barclays Center',
    wiki: 'Barclays_Center', q: 'Barclays Center, 620 Atlantic Ave, Brooklyn, NY',
    tag: '篮网主场，锈色钢板外墙',
    intro: '2012 年开馆，篮网从新泽西搬来后的主场。锈色钢板外墙很好认，地铁站和长岛铁路都在门口。',
    open: '开赛前约 1.5 小时开门', ticket: '见球赛页', stay: '约 3 小时', transit: '2/3/4/5/B/D/N/Q/R 线 Atlantic Av–Barclays Ctr',
    tip: '提前到看热身，离场边最近。附近 Junior\'s 的芝士蛋糕是 1950 年的老字号。', game: 'bkn'
  },
  {
    id: 'met', city: 'nyc', cat: 'sight', name: '大都会艺术博物馆', en: 'The Metropolitan Museum of Art',
    wiki: 'Metropolitan_Museum_of_Art', q: 'The Metropolitan Museum of Art, 1000 5th Ave, New York, NY',
    tag: '全程唯一进的博物馆',
    intro: '1870 年创立，西半球最大的艺术博物馆，藏品 200 多万件。12 月中世纪雕塑厅会立起圣诞树，挂满 18 世纪那不勒斯的天使和耶稣诞生场景人偶，1957 年起的传统。',
    highlights: ['丹铎神庙：整座搬来的古埃及神庙', '欧洲绘画：维米尔、伦勃朗、梵高', '圣诞树和那不勒斯巴洛克诞生场景（12 月限定）'],
    open: '周日至周二、周四 10:00–17:00，周五周六到 21:00，周三和 12/25 闭馆', ticket: '非纽约居民 $30/人', stay: '约 2.5 小时', transit: '4/5/6 线 86 St 站步行 10 分钟',
    tip: '“随意付”只限纽约州居民和三州学生，游客按 $30 买。', buy: ['met']
  },
  {
    id: 'summit', city: 'nyc', cat: 'sight', name: 'Summit One Vanderbilt', en: 'SUMMIT One Vanderbilt',
    wiki: 'One_Vanderbilt', q: 'SUMMIT One Vanderbilt, 45 E 42nd St, New York, NY',
    tag: '镜面观景台，电梯直达',
    intro: '中央车站旁约 427 米高的摩天楼，顶层观景台 2021 年开放：整层镜面房间、悬空玻璃盒子，电梯直达，不用爬。',
    open: '约 9:00 到深夜', ticket: '约 $45 起，日落时段更贵', stay: '约 1.5 小时', transit: '中央车站 Grand Central 站',
    tip: '地板是镜面，穿裙子不方便；日落场最先卖完。', buy: ['summit']
  },
  {
    id: 'grand-central', city: 'nyc', cat: 'hub', name: '中央车站', en: 'Grand Central Terminal',
    wiki: 'Grand_Central_Terminal', q: 'Grand Central Terminal, New York, NY',
    tag: '画反了的星空天花',
    intro: '1913 年落成。大厅天花画着星座，但左右画反了，像从天外往下看。问讯台上的四面猫眼石钟是全站标志。',
    highlights: ['耳语廊：Oyster Bar 门外的拱廊，两人站对角小声说话能听见', '地下美食街'],
    open: '每天约 5:15 到凌晨 2:00', ticket: '免费', stay: '约 40 分钟', transit: '4/5/6/7/S 线 Grand Central',
    tip: '从 Vanderbilt Hall 一侧的楼梯上拍大厅全景。'
  },
  {
    id: 'times-square', city: 'nyc', cat: 'sight', name: '时代广场', en: 'Times Square',
    wiki: 'Times_Square', q: 'Times Square, New York, NY',
    tag: '跨年水晶球降下的地方',
    intro: '百老汇和第七大道交口的霓虹广场。TKTS 红色台阶适合坐着看广告屏，往年 12/30 上午有跨年彩纸“试飞”。',
    open: '全天', ticket: '免费', stay: '约 30 分钟', transit: '1/2/3/7/N/Q/R/W/S 线 Times Sq–42 St',
    tip: '人偶合影要给钱；有人塞 CD、手环别接。'
  },
  {
    id: 'staten-ferry', city: 'nyc', cat: 'sight', name: '史泰登岛渡轮', en: 'Staten Island Ferry',
    wiki: 'Staten_Island_Ferry', q: 'Whitehall Terminal, Staten Island Ferry, New York, NY',
    tag: '免费看自由女神',
    intro: '连接下曼哈顿和史泰登岛的通勤渡轮，24 小时运营，免费。单程约 25 分钟，从自由女神旁经过，是看女神和天际线最省钱的方式。',
    open: '24 小时', ticket: '免费', stay: '往返约 1 小时', transit: '1 线 South Ferry 或 R/W 线 Whitehall St',
    tip: '去程站在右舷看女神；到岸后要下船，再从候船厅重新上。'
  },
  {
    id: 'charging-bull', city: 'nyc', cat: 'sight', name: '华尔街铜牛', en: 'Charging Bull',
    wiki: 'Charging_Bull', q: 'Charging Bull, Bowling Green, New York, NY',
    photoFile: 'Shooting Charging Bull.jpg', // 条目首图是雕塑本身，非自由版权；用 Commons 的自由版权照片兜底
    tag: '半夜偷偷放上街的铜牛',
    intro: '1989 年艺术家 Arturo Di Modica 自费铸造，半夜偷偷放到纽交所门口，后来被市政府留了下来。“无畏女孩”铜像现在站在纽交所对面。',
    open: '全天', ticket: '免费', stay: '约 20 分钟', transit: '4/5 线 Bowling Green',
    tip: '牛头前排队长，绕到后面拍人少。'
  },
  {
    id: '911-memorial', city: 'nyc', cat: 'sight', name: '9/11 纪念池', en: '9/11 Memorial',
    wiki: 'National_September_11_Memorial_&_Museum', q: '9/11 Memorial, New York, NY',
    tag: '双塔原址上的两座瀑布池',
    intro: '原世贸双塔的位置是两个巨大的下沉式瀑布池，池边铜板刻着 2001 年和 1993 年遇难者的近 3,000 个名字。户外纪念广场免费。',
    open: '户外广场每天开放', ticket: '免费（博物馆按规则不进）', stay: '约 40 分钟', transit: 'E 线 World Trade Center 或 R/W 线 Cortlandt St',
    tip: '遇难者生日当天，名字旁会插一支白玫瑰。'
  },
  {
    id: 'oculus', city: 'nyc', cat: 'hub', name: 'Oculus 世贸交通枢纽', en: 'Oculus',
    wiki: 'World_Trade_Center_Transportation_Hub', q: 'Oculus, World Trade Center, New York, NY',
    tag: '白色钢肋的“展翅鸽子”',
    intro: '西班牙建筑师卡拉特拉瓦设计，2016 年启用。白色钢肋像一只展翅的鸽子，里面是 PATH 车站和商场。',
    open: '全天', ticket: '免费', stay: '约 20 分钟', transit: '和 9/11 纪念池相连',
    tip: '站在大厅中央往上拍最出片。'
  },
  {
    id: 'high-line', city: 'nyc', cat: 'sight', name: '高线公园', en: 'The High Line',
    wiki: 'High_Line', q: 'High Line Gansevoort Street entrance, New York, NY',
    tag: '废弃铁路改的空中花园',
    intro: '废弃的高架货运铁路改成的空中花园，2009 年开放，从肉库区往北到哈德逊园区约 2.3 公里，沿途保留了铁轨。',
    open: '每天 7:00 开放，冬季约 19:00 关闭', ticket: '免费', stay: '约 1 小时', transit: '南端入口在 Gansevoort St，靠近 A/C/E/L 线 14 St–8 Av',
    tip: '从南往北走，日落时正好在西侧看哈德逊河。'
  },
  {
    id: 'chelsea-market', city: 'nyc', cat: 'food', name: '切尔西市场', en: 'Chelsea Market',
    wiki: 'Chelsea_Market', q: 'Chelsea Market, 75 9th Ave, New York, NY',
    tag: '奥利奥饼干的诞生地',
    intro: '前身是纳贝斯克饼干厂，1912 年奥利奥饼干就诞生在这栋楼里。现在是室内美食街，Los Tacos No.1 的墨西哥卷饼常年排队。',
    open: '约 7:00–22:00', ticket: '人均 $15–25', stay: '约 1 小时', transit: 'A/C/E/L 线 14 St–8 Av',
    tip: '高线公园有楼梯直接下到市场门口。'
  },
  {
    id: 'little-island', city: 'nyc', cat: 'sight', name: 'Little Island', en: 'Little Island',
    wiki: 'Little_Island_at_Pier_55', q: 'Little Island, Pier 55, New York, NY',
    tag: '郁金香桩上的小岛公园',
    intro: '2021 年开放的人工小岛公园，立在 132 根郁金香形状的混凝土桩上，伸进哈德逊河。冬天人少，适合看日落。',
    open: '每天开放，冬季闭园较早', ticket: '免费', stay: '约 30 分钟', transit: '在高线公园南端附近的河边',
    tip: '纽约日落约 16:30，看完正好去吃晚饭。'
  },
  {
    id: 'roosevelt-tram', city: 'nyc', cat: 'sight', name: '罗斯福岛缆车', en: 'Roosevelt Island Tramway',
    wiki: 'Roosevelt_Island_Tramway', q: 'Roosevelt Island Tramway, E 59th St & 2nd Ave, New York, NY',
    tag: '地铁价格的空中缆车',
    intro: '1976 年开通的空中缆车，横跨东河到罗斯福岛，单程约 3 分钟，和地铁同价刷 OMNY。车厢升到约 76 米高，紧贴昆斯博罗大桥。',
    open: '每天约 6:00 到凌晨 2:00', ticket: '同地铁票价', stay: '往返约 40 分钟', transit: '59 St 和 2 Av 交口上车',
    tip: '到岛上可以走到南端看曼哈顿天际线。'
  },
  {
    id: 'msg', city: 'nyc', cat: 'arena', name: '麦迪逊广场花园', en: 'Madison Square Garden',
    wiki: 'Madison_Square_Garden', q: 'Madison Square Garden, New York, NY',
    tag: '“世界最有名的球馆”',
    intro: '尼克斯和冰球游骑兵的主场，建在 Penn Station 正上方。尼克斯刚拿下 2026 年总冠军，12/25 圣诞大战就是总决赛重演。',
    open: '开赛前约 1 小时开门', ticket: '见球赛页', stay: '约 3 小时', transit: 'Penn Station 正上方',
    tip: '圣诞大战和德比票都贵，门口拍个照也值。', game: 'nyk27'
  },
  {
    id: 'flushing', city: 'nyc', cat: 'food', name: '法拉盛', en: 'Flushing',
    wiki: 'Flushing,_Queens', q: 'Main St & Roosevelt Ave, Flushing, NY',
    tag: '纽约最大的华人区之一',
    intro: 'Main Street 一带中餐、奶茶和超市密集。坐 7 号线到终点站就是，倒时差后想吃家乡菜就来这。',
    open: '全天', ticket: '人均 $15–30', stay: '约 3 小时', transit: '7 号线 Flushing–Main St 终点站，从中城约 40 分钟',
    tip: '地下美食广场选择多，适合两人各点一样分着吃。'
  },
  {
    id: 'apollo', city: 'nyc', cat: 'sight', name: 'Apollo 剧院', en: 'Apollo Theater',
    wiki: 'Apollo_Theater', q: 'Apollo Theater, 253 W 125th St, New York, NY',
    tag: '哈莱姆的传奇剧院',
    intro: '1934 年起的哈莱姆传奇剧院，“业余之夜”捧红了埃拉·菲茨杰拉德、迈克尔·杰克逊等人。',
    open: '外观全天', ticket: '外观免费', stay: '约 20 分钟', transit: 'A/B/C/D 线 125 St',
    tip: '顺路逛 125 街，附近有美式南方菜老店。'
  },
  {
    id: 'nba-store', city: 'nyc', cat: 'shop', name: 'NBA Store', en: 'NBA Store',
    wiki: 'NBA_Store', q: 'NBA Store, 545 5th Ave, New York, NY',
    tag: '篮球之旅的纪念品',
    intro: 'NBA 在第五大道的旗舰店，两层楼，能现场定制球衣印名字和号码。按你的规则，购物只排在 12/30 这一天。',
    open: '每天营业', ticket: '—', stay: '约 1 小时', transit: 'B/D/F/M 线 42 St–Bryant Park 或 7 号线 5 Av',
    tip: '定制球衣要等，先下单再去逛。'
  },

  // ───────── 洛杉矶 ─────────
  {
    id: 'lax-transit', city: 'la', cat: 'hub', name: 'LAX/Metro 交通中心', en: 'LAX/Metro Transit Center',
    wiki: 'LAX/Metro_Transit_Center', q: 'LAX/Metro Transit Center, Los Angeles, CA',
    tag: '机场到市区的轨道枢纽',
    intro: '2025 年启用的机场轨道枢纽，K 线在这里停。航站楼和枢纽之间坐免费接驳车，机场捷运最新目标 2027-01-06 才通。',
    open: '全天', ticket: '地铁 $1.75', stay: '—', transit: '到达层外找 Metro 接驳车站牌',
    tip: 'K 线北行到 Expo/Crenshaw 换 E 线西行到圣莫尼卡。', buy: ['lametro']
  },
  {
    id: 'santa-monica-pier', city: 'la', cat: 'sight', name: '圣莫尼卡码头', en: 'Santa Monica Pier',
    wiki: 'Santa_Monica_Pier', q: 'Santa Monica Pier, Santa Monica, CA',
    tag: '66 号公路的终点',
    intro: '1909 年的木栈桥，伸进太平洋，上面有太阳能摩天轮和游乐场。66 号公路的“终点”路牌就立在栈桥上。',
    open: '全天', ticket: '免费', stay: '约 1 小时', transit: 'E 线 Downtown Santa Monica 站步行 10 分钟',
    tip: '跨年夜人多，看好手机。'
  },
  {
    id: 'venice-beach', city: 'la', cat: 'sight', name: '威尼斯海滩', en: 'Venice Beach',
    wiki: 'Venice_Beach_Boardwalk', q: 'Venice Beach Boardwalk, Los Angeles, CA',
    tag: '街头艺人、滑板和 Muscle Beach',
    intro: '洛杉矶最有嬉皮气质的海滩，木板步道上有街头艺人、滑板公园和露天健身场 Muscle Beach。从圣莫尼卡沿海滩走过来约 3 公里。',
    open: '白天去', ticket: '免费', stay: '约 1.5 小时', transit: '从圣莫尼卡码头沿海滩步道往南',
    tip: '天黑后步道人杂，日落前离开。'
  },
  {
    id: 'venice-canals', city: 'la', cat: 'sight', name: '威尼斯运河', en: 'Venice Canals',
    wiki: 'Venice_Canal_Historic_District', q: 'Venice Canals Walkway, Los Angeles, CA',
    tag: '仿威尼斯的运河住宅区',
    intro: '1905 年开发商仿威尼斯挖的运河住宅区，小桥、小船和各式小房子，离海滩步行 5 分钟，是安静的拍照点。',
    open: '全天', ticket: '免费', stay: '约 30 分钟', transit: '威尼斯海滩往内陆走 5 分钟',
    tip: '居民区，保持安静。'
  }
];

export const POI = Object.fromEntries(POIS.map((p) => [p.id, p]));
