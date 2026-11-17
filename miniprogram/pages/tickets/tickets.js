import { GAMES, GAME_ORDER, gameStatus } from '../../shared/data/games.js';
import { POIS } from '../../shared/data/pois.js';
import { CITIES } from '../../shared/data/trip.js';
import { VENDORS, TICKET_PLATFORMS } from '../../shared/data/vendors.js';
import { openTarget, qqTarget } from '../../lib/nav.js';
import { POI_LL } from '../../shared/data/extras.js';

const ARENA = new Map(POIS.map((p) => [p.id, p]));

Page({
  data: { games: [], platforms: [], vendors: [], rent: '' },

  onShow() {
    const games = GAME_ORDER.map((id) => {
      const g = GAMES[id];
      const arena = ARENA.get(g.arena);
      const st = gameStatus(id);
      return {
        id,
        title: g.title,
        when: `${g.date} ${g.wd} ${g.time}（美东）`,
        price: g.price,
        status: st.label,
        tone: st.tone,
        arena: arena ? arena.name : '',
        ll: POI_LL[g.arena] || null,
        q: arena ? arena.q : '',
        links: [
          { label: 'NBA 官方', url: g.official },
          { label: 'Ticketmaster', url: g.tm },
          { label: 'TickPick', url: g.tp },
          { label: 'StubHub', url: g.sh },
          { label: 'Vivid Seats', url: g.vv }
        ].filter((x) => x.url)
      };
    });
    this.setData({
      games,
      platforms: TICKET_PLATFORMS,
      vendors: Object.entries(VENDORS).map(([key, v]) => ({ key, ...v }))
    });
  },

  copy(e) {
    const { url } = e.currentTarget.dataset;
    if (!url) return;
    wx.setClipboardData({
      data: String(url),
      success: () => wx.showToast({ title: '链接已复制，去浏览器粘贴', icon: 'none', duration: 2500 })
    });
  },

  nav(e) {
    const { id } = e.currentTarget.dataset;
    const g = this.data.games.find((x) => x.id === id);
    if (!g) return;
    openTarget(qqTarget(g.arena, g.q, g.ll));
  }
});
