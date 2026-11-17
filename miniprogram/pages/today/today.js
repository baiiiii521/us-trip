// 今天：进了旅程第一眼看到的页。
// 一块城市横幅 + 一行大日期 + 现在该干的那件事 + 全天时间轴，别再堆成一片字。
import { getState } from '../../shared/state.js';
import { TRIPS } from '../../data/trips.js';
import { buildDays } from '../../shared/data/days.js';
import { CITIES, TRIP } from '../../shared/data/trip.js';
import { PACE, paceText } from '../../shared/data/wellbeing.js';
import { spotFor } from '../../lib/spot.js';
import { heroOf } from '../../shared/data/heroes.js';
import { photoOf } from '../../lib/photos.js';
import { openTarget } from '../../lib/nav.js';

// 每座城市一张横幅图（大图优先，实在没有再退回 960 的缩略图）
const CITY_PHOTO = { bos: 'public-garden', nyc: 'brooklyn-bridge', dc: 'white-house', phl: 'charging-bull', la: 'santa-monica' };

const pad = (n) => String(n).padStart(2, '0');
const clockAt = (offsetHours) => {
  const d = new Date(Date.now() + offsetHours * 3600000);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};

const minutesOf = (t) => {
  const m = String(t || '').match(/^(\d{1,2}):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

const dayIndexOf = (now) => now.getMonth() + 1 + '/' + now.getDate();

Page({
  data: {
    tripId: '',
    badge: '',
    progress: -1,
    barSub: '',
    phase: 'before',
    photo: '',
    cityZh: '',
    weather: '',
    bigLine: '',
    subLine: '',
    items: [],
    preview: [],
    nowIndex: -1,
    paceText: '',
    warn: '',
    tips: [],
    stay: '',
    clocks: []
  },

  onLoad(query) {
    this.setData({ tripId: (query && query.id) || TRIPS[0].id });
  },

  onShow() {
    this.render();
  },

  onPullDownRefresh() {
    this.render();
    wx.stopPullDownRefresh();
  },

  render() {
    const state = getState();
    let days = [];
    try {
      days = buildDays(state);
    } catch (e) {
      days = [];
    }
    const now = new Date();
    const md = dayIndexOf(now);
    const idx = days.findIndex((d) => d.md === md);
    const start = new Date(`${TRIP.start}T00:00:00+07:00`);
    const end = new Date(`${TRIP.end}T23:59:59+07:00`);
    const phase = idx >= 0 ? 'on' : now < start ? 'before' : 'after';
    const day = days[idx >= 0 ? idx : 0] || null;

    if (!day) {
      this.setData({ phase: 'after', bigLine: '读不到行程数据', progress: 1, badge: '' });
      return;
    }

    const cityKey = day.city;
    const city = CITIES[cityKey] || {};
    const pid = CITY_PHOTO[cityKey];
    const hero = (pid && (heroOf(pid) || photoOf(pid))) || null;

    const nowMin = now.getHours() * 60 + now.getMinutes();
    const items = (day.items || []).map((it, i) => {
      const spot = spotFor(it, cityKey);
      const mins = minutesOf(it.t);
      let state2 = '';
      if (phase === 'on' && mins != null) {
        if (mins <= nowMin) state2 = 'past';
        if (i > 0 && minutesOf(day.items[i - 1].t) != null && minutesOf(day.items[i - 1].t) <= nowMin && (mins > nowMin)) state2 = 'next';
        if (mins <= nowMin) state2 = 'past';
      }
      return {
        i,
        t: it.t || '—',
        text: it.text || '',
        note: it.note || '',
        spot,
        tag: it.game ? '球赛' : it.drive ? '取还车' : it.leg ? '城际' : it.xmas ? '圣诞' : '',
        hot: !!it.game || !!it.drive,
        state: state2
      };
    });

    // 「现在」= 最后一条已经开始、且还没走完的那条
    let nowIndex = -1;
    if (phase === 'on') {
      for (let i = 0; i < items.length; i += 1) if (minutesOf(items[i].t) != null && minutesOf(items[i].t) <= nowMin) nowIndex = i;
    }

    const dayNo = idx >= 0 ? idx + 1 : 0;
    const total = days.length;
    const before = Math.max(0, Math.ceil((start - now) / 86400000));

    this.setData({
      phase,
      photo: hero ? hero.src : '',
      cityZh: city.zh || '',
      weather: city.hi != null ? `12 月平均 ${city.hi}° / ${city.lo}°C · 日落 ${city.sunset}` : '',
      bigLine: phase === 'on' ? day.title || '在路上' : phase === 'before' ? `距出发 ${before} 天` : '这趟走完了',
      subLine: phase === 'on' ? `${day.md} ${day.wd} · ${city.zh || ''}` : `${day.md} ${day.wd} · 落地第一天在${city.zh || ''}`,
      items,
      preview: items.slice(0, 4),
      nowIndex,
      paceText: day.pace ? `${day.pace.km} 公里 · ${PACE[day.pace.lv] || ''}${day.pace.cut ? ` · 想轻松点：${day.pace.cut}` : ''}` : '',
      warn: day.warn || '',
      tips: day.tips || [],
      stay: day.stay || '',
      badge: phase === 'on' ? `第 ${dayNo} / ${total} 天` : phase === 'before' ? `${before} 天后` : '已走完',
      progress: phase === 'on' ? dayNo / total : phase === 'before' ? 0 : 1,
      barSub: '',
      clocks: [
        { city: '北京', time: clockAt(8) },
        { city: '纽约', time: clockAt(-5) },
        { city: '洛杉矶', time: clockAt(-8) }
      ]
    });
  },

  goItem(e) {
    const i = Number(e.currentTarget.dataset.i);
    const it = this.data.items[i];
    if (it && it.spot && it.spot.ll) {
      openTarget({ name: it.spot.name || '目的地', q: it.spot.q || '', ll: it.spot.ll });
      return;
    }
    wx.showToast({ title: '这一条没有地点', icon: 'none' });
  },

  go(e) {
    const { url } = e.currentTarget.dataset;
    wx.redirectTo({ url: `${url}?id=${this.data.tripId}` });
  }
});
