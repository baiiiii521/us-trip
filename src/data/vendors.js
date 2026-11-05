// 所有订票 / 预约 / 购票入口。页面里用 key 引用，改链接只改这里。
export const VENDORS = {
  amtrak:  { label: 'Amtrak 官网', url: 'https://www.amtrak.com' },
  flix:    { label: 'FlixBus', url: 'https://www.flixbus.com' },
  grey:    { label: 'Greyhound', url: 'https://www.greyhound.com' },
  pp:      { label: 'Peter Pan', url: 'https://peterpanbus.com' },
  mega:    { label: 'Megabus', url: 'https://us.megabus.com' },
  our:     { label: 'OurBus', url: 'https://www.ourbus.com' },
  wand:    { label: 'Wanderu 比价', url: 'https://www.wanderu.com' },
  septa:   { label: 'SEPTA', url: 'https://www.septa.org' },
  njt:     { label: 'NJ Transit', url: 'https://www.njtransit.com' },
  lirr:    { label: 'LIRR：MTA TrainTime App', url: 'https://www.mta.info' },
  airtrain:{ label: 'AirTrain JFK', url: 'https://www.jfkairport.com/to-from-airport/air-train' },
  lametro: { label: 'LA Metro', url: 'https://www.metro.net/metrotransitcenter/' },
  loc:     { label: '国会图书馆定时票', url: 'https://www.loc.gov/visit/' },
  cap:     { label: '国会大厦导览预约', url: 'https://www.visitthecapitol.gov' },
  rec:     { label: '独立厅定时票', url: 'https://www.recreation.gov/search?q=Independence%20Hall' },
  met:     { label: '大都会购票', url: 'https://www.metmuseum.org/plan-your-visit' },
  summit:  { label: 'Summit 购票', url: 'https://summitov.com' },
  uss:     { label: '宪法号开放时间', url: 'https://www.navy.mil/USS-Constitution/Hours-Visitor-Info/' },
  evus:    { label: 'EVUS 官网', url: 'https://www.evus.gov' },
  bounce:  { label: 'Bounce 寄存', url: 'https://bounce.com' },
  lh:      { label: 'LuggageHero', url: 'https://luggagehero.com' },
  ot:      { label: 'OpenTable', url: 'https://www.opentable.com' },
  resy:    { label: 'Resy', url: 'https://resy.com' },
  booking: { label: 'Booking.com', url: 'https://www.booking.com' },
  trip:    { label: '携程 Trip.com', url: 'https://www.trip.com' },
  nba:     { label: 'NBA 赛程', url: 'https://www.nba.com/schedule' }
};

// 球票平台说明（球赛页的平台对比）
export const TICKET_PLATFORMS = [
  { name: 'TickPick', url: 'https://www.tickpick.com/nba/', note: '不收买家手续费，标价就是最终价，先用它定基准价。有降价提醒。' },
  { name: 'Ticketmaster', url: 'https://www.ticketmaster.com', note: '四个主队的官方售票方，原价票和官方认证转售都在这。手续费高，结算页才显示总价。' },
  { name: 'SeatGeek', url: 'https://seatgeek.com/nba-tickets', note: '给每张票的性价比打分，座位视角图好用。记得打开含费价格开关。' },
  { name: 'StubHub', url: 'https://www.stubhub.com', note: '票源最多，有 FanProtect 保障。手续费偏高，比价看总价。' },
  { name: 'Vivid Seats', url: 'https://www.vividseats.com', note: '有返现积分（买 10 张送 1 张）。12/27 尼克斯 vs 篮网在这里查到。' },
  { name: 'Gametime', url: 'https://gametime.co', note: '主打临场票，开赛前几小时常有低价，显示含费总价。' }
];
