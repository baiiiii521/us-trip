import { DRIVES, PICKUP, DROPOFF, RENTAL, DRIVE_GUIDE, PARKING, GAS, TOLL_PROGRAM_FEE } from '../../shared/data/drive.js';
import { getState } from '../../shared/state.js';
import { openTarget, qqTarget } from '../../lib/nav.js';

const CITY = { bos: '波士顿', dc: '华盛顿', phl: '费城' };

Page({
  data: {
    rental: RENTAL,
    dropoff: DROPOFF,
    pickup: null,
    rentLabel: '',
    drives: [],
    guide: DRIVE_GUIDE,
    parking: [],
    gas: GAS,
    tollFee: TOLL_PROGRAM_FEE
  },

  onShow() {
    const s = getState();
    const rent = s.rent || 'jfk';
    const plan = { jfk: '12/18 JFK 取车 · 12/24 曼哈顿还车', bos: '12/21 波士顿取车', none: '不租车（火车/大巴）' }[rent] || '';

    const drives = Object.entries(DRIVES).map(([id, d]) => ({
      id,
      from: d.from,
      to: d.to,
      mi: d.mi,
      h: d.h,
      toll: d.toll,
      route: d.route || '',
      tollNote: d.tollNote || '',
      stops: d.stops || [],
      risk: d.risk || '',
      via: d.via || ''
    }));

    this.setData({
      rentLabel: plan,
      pickup: rent === 'none' ? null : PICKUP[rent === 'bos' ? 'bos' : 'jfk'],
      termsText: (RENTAL.terms || []).join(' · '),
      drives,
      parking: Object.entries(PARKING).map(([city, p]) => ({ city, zh: CITY[city] || city, ...p }))
    });
  },

  navPickup() {
    const p = this.data.pickup;
    if (p) openTarget(qqTarget('取车', p.q));
  },

  navDropoff() {
    openTarget(qqTarget('还车', DROPOFF.q));
  },

  navVia(e) {
    const { q } = e.currentTarget.dataset;
    if (q) openTarget(qqTarget('途经点', q));
  },

  soon() {
    wx.showToast({ title: '下一版做「车停在哪」', icon: 'none' });
  }
});
