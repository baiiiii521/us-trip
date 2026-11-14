// 已出票的两程机票。航班号、时间、航站楼按票面。
// 订单号、PNR、票号、护照号属于个人信息，不写进这个文件（网站是公开的）：
// 出发前填进「订单夹」，只存在自己手机里。
export const FLIGHTS = [
  {
    id: 'out',
    date: '12/17–12/18',
    title: '郑州 → 福州 → 纽约',
    airline: '厦门航空',
    cabin: '经济舱',
    segments: [
      { flight: 'MF8280', dep: '郑州新郑 CGO T2', depTime: '12/17 13:45', arr: '福州长乐 FOC T2', arrTime: '12/17 15:55' },
      { flight: 'MF849', dep: '福州长乐 FOC T2', depTime: '12/18 09:20', arr: '纽约 JFK T4', arrTime: '12/18 10:55' }
    ],
    note: '福州跨夜中转约 17 小时，行李要在福州取出重新托运；值机时问能不能直挂 JFK。',
    record: '订单号和票号在「订单夹 → 机票」里，不放在公开网页上',
    bags: '每人托运 1 件 23kg + 手提 1 件'
  },
  {
    id: 'back',
    date: '12/31–01/02',
    title: '纽瓦克 → 洛杉矶 → 北京',
    airline: '美国联合航空',
    cabin: '经济舱',
    segments: [
      { flight: 'UA2434', dep: '纽瓦克 EWR C', depTime: '12/31 06:00', arr: '洛杉矶 LAX T7', arrTime: '12/31 09:12' },
      { flight: 'UA771', dep: '洛杉矶 LAX T7', depTime: '12/31 23:35', arr: '北京首都 PEK T3', arrTime: '01/02 06:35', arrNote: '票面只印 06:35，实际跨 2 天' }
    ],
    note: '两段在同一个订单里。行李只托运到洛杉矶，落地取出、晚上再托运。',
    record: 'PNR 和票号在「订单夹 → 机票」里，不放在公开网页上',
    bags: '每人托运 1 件 23kg + 手提 1 件'
  }
];
