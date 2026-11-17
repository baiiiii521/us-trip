// 今天：进了旅程第一眼看到的页。
// 一块城市横幅 + 一行大日期 + 现在该干的那件事 + 全天时间轴，别再堆成一片字。
import { getState } from '../../shared/state.js';
import { TRIPS } from '../../data/trips.js';
import { buildDays } from '../../shared/data/days.js';
import { CITIES, TRIP } from '../../shared/data/trip.js';
import { PACE, paceText } from '../../shared/data/wellbeing.js';
import { spotFor } from '../../lib/spot.js';
import { DRIVES } from '../../shared/data/drive.js';
import { heroOf } from '../../shared/data/heroes.js';
import { photoOf } from '../../lib/photos.js';
import { openTarget } from '../../lib/nav.js';
import { cityImage } from '../../lib/media.js';
import { festiveOf } from '../../lib/festive.js';

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


// 五条线：一座城一种颜色（和顶栏五色线、行程页同一套）
const LINE = { bos: '#2FB36B', dc: '#E63A3A', phl: '#2F6BFF', nyc: '#FFC233', la: '#19B5C9' };
const ORDER = ['bos', 'dc', 'phl', 'nyc', 'la'];
const SHORT = { bos: '波士顿', dc: '华盛顿', phl: '费城', nyc: '纽约', la: '洛杉矶' };
// 某个时区此刻的日期、分钟、钟点（夏令时不用管：行程在 12 月）
const cityClock = (offsetHours) => {
  const d = new Date(Date.now() + offsetHours * 3600000);
  return { md: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`, min: d.getUTCHours() * 60 + d.getUTCMinutes(), hour: d.getUTCHours() };
};
const countdown = (m) => (m < 1 ? '马上' : m < 60 ? `${m} 分钟后` : `${Math.floor(m / 60)} 小时${m % 60 ? ` ${m % 60} 分` : ''}后`);

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
    dayId: '',
    itemCount: 0,
    nowIndex: -1,
    nextIndex: -1,
    nextCount: '',
    line: '#FFC233',
    cityKey: '',
    dayNo: 0,
    total: 14,
    stations: [],
    paceText: '',
    paceShort: '',
    paceLv: 0,
    img: null,
    showPast: false,
    pastCount: 0,
    imgFail: false,
    weatherHi: '',
    weatherLo: '',
    dayTitle: '',
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
    // 「现在」一律按行程所在地的钟点算（美东 UTC−5，12/31 在洛杉矶 UTC−8），和三地时钟、早晚城市图同一个来源：
    // 手机没切到美国时间时，也不会把错的那一站标成「现在」
    const now = new Date();
    const east = cityClock(-5);
    const md = east.md;
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

    const local = cityKey === 'la' ? cityClock(-8) : east;
    const nowMin = local.min;
    const items = (day.items || []).map((it, i) => {
      const spot = spotFor(it, cityKey);
      const mins = minutesOf(it.t);
      let state2 = '';
      if (phase === 'on' && mins != null) {
        if (mins <= nowMin) state2 = 'past';
        if (i > 0 && minutesOf(day.items[i - 1].t) != null && minutesOf(day.items[i - 1].t) <= nowMin && (mins > nowMin)) state2 = 'next';
        if (mins <= nowMin) state2 = 'past';
      }
      const legInfo = it.leg && DRIVES[it.leg] ? DRIVES[it.leg] : null;
      const text = it.text || (legInfo ? `${legInfo.from} → ${legInfo.to}：${legInfo.mi} 英里，${legInfo.h}` : '');

      return {
        i,
        t: it.t || '—',
        text,
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
    // 「下一站」= 现在之后第一条有时间的；出发前就是第一天的第一条
    let nextIndex = -1;
    if (phase === 'on') nextIndex = items.findIndex((x, i) => i > nowIndex && minutesOf(x.t) != null && minutesOf(x.t) > nowMin);
    else if (phase === 'before') nextIndex = 0;
    const nextCount = phase === 'on' && nextIndex >= 0 ? countdown(minutesOf(items[nextIndex].t) - nowMin) : '';
    // 每一站的状态：已过 / 现在 / 下一站 / 之后（站点圆点靠大小和颜色区分）
    items.forEach((x, i) => {
      x.state = phase === 'after' ? 'past' : i === nextIndex ? 'next' : i === nowIndex ? 'now' : phase === 'on' && i < nowIndex ? 'past' : 'later';
      x.xfer = x.tag === '城际';
      x.short = x.text.length > 46 ? `${x.text.slice(0, 46)}…` : x.text;
    });
    // 走过的站默认收起，只留最近一站：傍晚打开时「下一站」不会被挤到屏幕外
    const pastIdx = items.filter((x) => x.state === 'past').map((x) => x.i);
    items.forEach((x) => { x.hide = x.state === 'past' && pastIdx.length > 1 && x.i !== pastIdx[pastIdx.length - 1]; });
    // 顶部五城线：走过的城亮、当前城放大、没去的暗
    const curPos = ORDER.indexOf(cityKey);
    const stations = ORDER.map((k, i) => ({ key: k, name: SHORT[k], color: LINE[k], state: phase === 'after' ? 'past' : i < curPos ? 'past' : i === curPos ? (phase === 'on' ? 'now' : 'next') : 'later' }));

    const dayNo = idx >= 0 ? idx + 1 : 0;
    const total = days.length;
    const before = Math.max(0, Math.ceil((start - now) / 86400000));

    this.setData({
      phase,
      photo: hero ? hero.src : '',
      cityZh: city.zh || '',
      weather: city.hi != null ? `12 月平均 ${city.hi}° / ${city.lo}°C · 日落 ${city.sunset}` : '',
      bigLine: phase === 'on' ? day.title || '在路上' : phase === 'before' ? `距出发 ${before} 天` : '这趟走完了',
      subLine: phase === 'on' ? `第 ${dayNo} / ${total} 天 · ${day.md} ${day.wd}` : phase === 'before' ? `${day.md} ${day.wd} 落地 · 先去${city.zh || ''}` : `${day.md} ${day.wd}`,
      items,
      preview: items.slice(0, 6).map((x) => ({ ...x, state: x.state === 'next' ? 'next' : 'later' })),
      dayId: day.id,
      itemCount: items.length,
      nowIndex,
      pastCount: pastIdx.length > 1 ? pastIdx.length - 1 : 0,
      nextIndex,
      nextCount,
      line: LINE[cityKey] || '#FFC233',
      cityKey,
      dayNo,
      total,
      stations,
      paceShort: day.pace ? `步行约 ${day.pace.km} 公里 · ${PACE[day.pace.lv] || ''}` : '',
      paceLv: day.pace ? day.pace.lv : 0,
      img: (() => { const f = festiveOf(now); return f.key && (f.key === 'xmas' || local.hour >= 16) ? { src: f.image, night: true, credit: '' } : cityImage(cityKey, local.hour); })(),
      imgFail: false,
      weatherHi: city.hi != null ? `${city.hi}°` : '',
      weatherLo: city.hi != null ? `12 月平均 · 低 ${city.lo}°` : '',
      dayTitle: day.title || '',
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

  togglePast() {
    this.setData({ showPast: !this.data.showPast });
  },

  imgError() {
    this.setData({ imgFail: true });
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

  openDay() {
    wx.navigateTo({ url: `/pages/days/days?id=${this.data.tripId}&day=${this.data.dayId}` });
  },

  go(e) {
    const { url } = e.currentTarget.dataset;
    wx.redirectTo({ url: `${url}?id=${this.data.tripId}` });
  }
});
