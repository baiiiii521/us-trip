// 节日彩蛋组件：放在顶栏里（所有带顶栏的页）和首页。平时什么都不画。
import { festiveOf, SNOW, cardSeen, markCardSeen } from '../../lib/festive.js';

Component({
  properties: {
    // 首页和今天页才弹贺卡，其它页只下雪，免得每进一页都被拦一下
    card: { type: Boolean, value: false }
  },
  data: { key: '', snow: [], showCard: false, imgFail: false, title: '', en: '', line: '', image: '' },
  lifetimes: {
    attached() {
      const f = festiveOf(new Date());
      if (!f.key) return;
      this.setData({
        key: f.key,
        snow: SNOW,
        title: f.title,
        en: f.en,
        line: f.line,
        image: f.image,
        showCard: this.data.card && !cardSeen(f.key)
      });
    }
  },
  methods: {
    close() {
      markCardSeen(this.data.key);
      this.setData({ showCard: false });
    },
    imgError() {
      this.setData({ imgFail: true });
    },
    noop() {}
  }
});
