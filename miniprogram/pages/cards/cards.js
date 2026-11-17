import { GAMEDAY, PHRASES } from '../../shared/data/travelcards.js';
import { GAMES } from '../../shared/data/games.js';
import { HOTEL_OF } from '../../shared/data/hotels.js';
import { PICKUP, DROPOFF } from '../../shared/data/drive.js';
import { getState } from '../../shared/state.js';

// 大字卡：给司机、店员、警察看的那几行字。手机横过来、屏幕不熄。
Page({
  data: {
    tabs: [
      { key: 'addr', label: '地址' },
      { key: 'game', label: '球馆' },
      { key: 'say', label: '说话' }
    ],
    tab: 'addr',
    cards: [],
    index: 0,
    card: null,
    count: 0
  },

  onLoad() {
    this.build();
    wx.setKeepScreenOn({ keepScreenOn: true });
  },

  onUnload() {
    wx.setKeepScreenOn({ keepScreenOn: false });
  },

  build() {
    const s = getState();
    const addr = [
      { big: HOTEL_OF.nyc.addr, small: '纽约公寓（布鲁克林）', ok: true },
      { big: HOTEL_OF.bos.addr, small: '波士顿酒店', ok: true },
      { big: HOTEL_OF.dc.addr, small: '华盛顿酒店', ok: true },
      { big: HOTEL_OF.phl.addr, small: '费城酒店', ok: true },
      { big: DROPOFF.q, small: '还车门店', ok: true },
      { big: PICKUP.jfk.q, small: '取车点', ok: true }
    ];
    const games = Object.entries(GAMEDAY).map(([id, g]) => ({
      big: `${(GAMES[id] && GAMES[id].title) || id}\n${g.doors || ''}`,
      small: (GAMES[id] && `${GAMES[id].date} ${GAMES[id].time}`) || '',
      ok: true
    }));
    const say = PHRASES.map((p) => ({ big: p.en, small: p.zh, ok: true }));
    this.sets = { addr, game: games, say };
    this.show(this.data.tab);
  },

  show(tab) {
    const cards = this.sets[tab] || [];
    this.setData({ tab, cards, count: cards.length, index: 0, card: cards[0] || null });
  },

  pick(e) {
    this.show(e.currentTarget.dataset.key);
  },

  next() {
    const i = (this.data.index + 1) % Math.max(1, this.data.count);
    this.setData({ index: i, card: this.data.cards[i] || null });
  },

  prev() {
    const n = Math.max(1, this.data.count);
    const i = (this.data.index - 1 + n) % n;
    this.setData({ index: i, card: this.data.cards[i] || null });
  },

  copy() {
    const c = this.data.card;
    if (!c) return;
    wx.setClipboardData({ data: String(c.big), success: () => wx.showToast({ title: '已复制', icon: 'none' }) });
  }
});
