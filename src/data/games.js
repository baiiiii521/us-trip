// NBA 比赛。时间来自转售网站与 NBA 官方圣诞赛程（2026-11-05 查询）
const enc = encodeURIComponent;
const tmSearch = (q) => 'https://www.ticketmaster.com/search?q=' + enc(q);
const shSearch = (q) => 'https://www.stubhub.com/search?q=' + enc(q);
const vvSearch = (q) => 'https://www.vividseats.com/search?searchTerm=' + enc(q);

export const GAMES = {
  bos: {
    date: '12/20', wd: '周日', time: '20:00', title: '凯尔特人 vs 活塞', arena: 'td-garden', price: '约 $120–160/张', est: 280,
    team: 'boston-celtics', official: 'https://www.nba.com/celtics/schedule',
    tm: tmSearch('Boston Celtics'),
    tp: 'https://www.tickpick.com/buy-boston-celtics-vs-detroit-pistons-tickets-td-garden-12-20-26-8pm/8204231/',
    sh: shSearch('Boston Celtics Detroit Pistons'), vv: vvSearch('Boston Celtics')
  },
  was: {
    date: '12/22', wd: '周二', time: '19:00', title: '奇才 vs 猛龙', arena: 'capital-one', price: '约 $40–70/张', est: 110,
    team: 'washington-wizards', official: 'https://www.nba.com/wizards/schedule',
    tm: 'https://www.ticketmaster.com/washington-wizards-tickets/artist/806042',
    tp: 'https://www.tickpick.com/buy-washington-wizards-vs-toronto-raptors-tickets-capital-one-arena-12-22-26-7pm/8206041/',
    sh: shSearch('Washington Wizards Toronto Raptors'), vv: vvSearch('Washington Wizards')
  },
  phi: {
    date: '12/23', wd: '周三', time: '19:30', title: '76人 vs 火箭', arena: 'xfinity-arena', price: '约 $60–110/张', est: 170,
    team: 'philadelphia-76ers', official: 'https://www.nba.com/sixers/schedule',
    tm: 'https://www.ticketmaster.com/philadelphia-76ers-tickets/artist/805998',
    tp: 'https://www.tickpick.com/buy-philadelphia-76ers-vs-houston-rockets-tickets-xfinity-mobile-arena-12-23-26-7pm/8205299/',
    sh: shSearch('Philadelphia 76ers Houston Rockets'), vv: vvSearch('Philadelphia 76ers')
  },
  nyk25: {
    date: '12/25', wd: '周五', time: '12:00', title: '尼克斯 vs 马刺', arena: 'msg', price: '$525+/张', est: 0,
    team: 'new-york-knicks', official: 'https://www.nba.com/knicks/schedule',
    tm: tmSearch('New York Knicks'), tp: 'https://www.tickpick.com/nba/new-york-knicks-tickets/',
    sh: shSearch('New York Knicks San Antonio Spurs'), vv: vvSearch('New York Knicks')
  },
  bkn: {
    date: '12/26', wd: '周六', time: '18:00', title: '篮网 vs 鹈鹕', arena: 'barclays', price: '约 $63–76+/张', est: 160,
    team: 'brooklyn-nets', official: 'https://www.nba.com/nets/schedule',
    tm: 'https://www.ticketmaster.com/brooklyn-nets-tickets/artist/805983',
    tp: 'https://www.tickpick.com/nba/brooklyn-nets-tickets/',
    sh: shSearch('Brooklyn Nets New Orleans Pelicans'),
    vv: 'https://www.vividseats.com/brooklyn-nets-tickets--sports-nba-basketball/performer/29773'
  },
  nyk27: {
    date: '12/27', wd: '周日', time: '待定', title: '尼克斯 vs 篮网', arena: 'msg', price: '德比偏贵', est: 0,
    team: 'new-york-knicks', official: 'https://www.nba.com/knicks/schedule',
    tm: tmSearch('New York Knicks Brooklyn Nets'), tp: 'https://www.tickpick.com/nba/new-york-knicks-tickets/',
    sh: shSearch('New York Knicks Brooklyn Nets'),
    vv: 'https://www.vividseats.com/new-york-knicks-tickets-madison-square-garden-12-27-2026/production/7431975'
  }
};

export const GAME_ORDER = ['bos', 'was', 'phi', 'nyk25', 'bkn', 'nyk27'];

export function gameStatus(id) {
  if (id === 'bos') return { label: '已排进（12/20）', tone: 'ok' };
  if (id === 'nyk25') return { label: '不买，酒吧看直播', tone: 'muted' };
  if (id === 'nyk27') return { label: '可选加看', tone: 'warn' };
  return { label: '已排进', tone: 'ok' };
}

// 每场比赛的买票链接，第一个是推荐入口
export function gameLinks(id) {
  const g = GAMES[id];
  return [
    { label: 'TickPick 无手续费', url: g.tp },
    { label: 'Ticketmaster 官方', url: g.tm },
    { label: 'SeatGeek', url: 'https://seatgeek.com/' + g.team + '-tickets' },
    { label: 'StubHub', url: g.sh },
    { label: 'Vivid Seats', url: g.vv },
    { label: 'Gametime', url: 'https://gametime.co' },
    { label: 'NBA 官方赛程', url: g.official }
  ];
}
