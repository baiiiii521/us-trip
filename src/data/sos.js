// 紧急情况：电话、领事保护、丢护照怎么办、英文求助句子。
// 领事保护电话 2026-11-14 按各馆官网核对（纽约总领馆联系页 2023-04 更新、驻美使馆 2024-05、洛杉矶总领馆首页）。
// 这些号码不一定 24 小时有人接；夜里先打外交部 12308 热线（24 小时）。
export const CONSULATES = [
  { id: 'ny', name: '中国驻纽约总领馆', cities: ['nyc', 'bos', 'phl'], area: '纽约、波士顿、费城都归这里', tel: '+1-212-695-3125', addr: '520 12th Ave, New York, NY 10036', url: 'http://newyork.china-consulate.gov.cn/' },
  { id: 'dc', name: '中国驻美国大使馆', cities: ['dc'], area: '华盛顿', tel: '+1-202-495-2216', addr: '3505 International Pl NW, Washington, DC 20008', url: 'http://us.china-embassy.gov.cn/' },
  { id: 'la', name: '中国驻洛杉矶总领馆', cities: ['la'], area: '洛杉矶', tel: '+1-213-807-8052', addr: '443 Shatto Pl, Los Angeles, CA 90020', url: 'http://losangeles.china-consulate.gov.cn/' }
];
export const HOTLINE_12308 = { tel: '+86-10-12308', alt: '+86-10-65612308', label: '外交部全球领事保护应急热线（24 小时，中文）' };

export const LOST_PASSPORT = [
  '先报警拿报案记录：打 311（非紧急）或去最近的警察局，说“I lost my passport, I need a police report.”',
  '打开“证件和订单”看护照号和首页照片（出发前要存好），没有就用订单夹里存的护照照片。',
  '打所在城市归属的领馆电话，预约补办《中华人民共和国旅行证》（回国用，几个工作日）。12/24–12/27 领馆可能休息，先打 12308。',
  '告诉航空公司：回国航班 UA771 要凭旅行证登机，改期前先问清楚。',
  '信用卡丢了：马上打卡背面的国际服务电话挂失（国内银行卡的境外挂失电话在银行 App 里）。'
];

// 给医生、警察、路人看的英文句子
export const SOS_CARDS = [
  { en: 'Please call 911.\nIt is an emergency.', zh: '请帮我打 911，情况紧急' },
  { en: 'I need a doctor.\nWhere is the nearest urgent care?', zh: '我需要看医生，最近的急诊诊所在哪' },
  { en: 'I lost my passport.\nI need a police report.', zh: '我的护照丢了，需要报案记录' },
  { en: 'My wallet was stolen.', zh: '我的钱包被偷了' },
  { en: 'I do not speak English well.\nCan you help me call the Chinese Consulate?', zh: '我英语不好，能帮我打给中国领馆吗' },
  { en: 'We had a car accident.\nNo one is hurt.', zh: '我们出了车祸，没有人受伤' },
  { en: 'I am allergic to ______.', zh: '我对 ____ 过敏' }
];

export const SOS_TIPS = [
  '有人受伤、着火、遇到抢劫：直接打 911，接通后先说 “Chinese, I need an interpreter.” 会转中文翻译。',
  '不急的小病：去 Urgent Care（急诊诊所），比医院急诊室快、便宜得多；CVS / Walgreens 药店能买常用药。',
  '车坏了、没电、爆胎：打租车合同或钥匙牌上的道路救援电话（存在订单夹的“租车”格子里）。',
  '东西丢在 Uber / Lyft 上：在 App 的行程记录里联系司机。地铁上丢的去 MTA 失物招领网站登记。'
];
