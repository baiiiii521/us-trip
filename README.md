# 美东圣诞篮球行 · EAST COAST HOOPS

2 人 · 2026.12.18 – 12.31 · 波士顿 → 华盛顿 → 费城 → 纽约 → 洛杉矶。
一个手机优先的行程网站：每日行程、景点图鉴（介绍 + 照片 + 导航）、火车 / 大巴切换、球票入口、实时预算和预订清单。

## 功能

| 页面 | 内容 |
| --- | --- |
| 总览 `#home` | 出发倒计时、“现在要做”（清单里下一件事 + 直达链接）、三个关键决定、路线示意图、14 天一览 |
| 行程 `#days` | 顶部日期条（吸顶、随滚动高亮），每天的时间线；景点可点开看介绍，右侧箭头一键导航；“当天路线”把当天地点串进 Google 地图；交通和球赛直接给订票入口，能就地“改坐大巴/火车” |
| 景点 `#guide` | 66 个地点，按城市、类型筛选；详情含照片、介绍、看点、开放时间、门票、建议停留、怎么去、提示、导航（Google / Apple）、复制地址、预约链接、出现在哪几天 |
| 票务 `#tickets` | 4 段城际交通火车/大巴对比和三种组合价格；6 场 NBA 每场 7 个购票入口 + 平台对比；需要预约的景点 |
| 预算 `#budget` | 可改的房价、餐饮、机票、汇率，占比条和明细，输入不打断 |
| 资料 `#info` | 预订清单（可勾选）、实用提示、对原攻略的审计、来源 |

深链：`#day-1220` 直接跳到某天，`#poi-uss-constitution` 直接打开某个景点。设置和勾选保存在本机浏览器（localStorage）。

## 照片

景点照片在访问者的浏览器里从维基百科读取（`src/lib/photos.js`）：用条目首图（只取自由版权图片），再从 Wikimedia Commons 读作者和许可证，显示在详情页图片下方，结果缓存 30 天。
读不到时（离线、网络拦截）显示按城市配色的占位明信片。

想换成自己拍的照片：把图片放进 `public/img/`，在 `src/data/pois.js` 对应景点加 `photo: 'img/文件名.jpg'`，会优先使用。

## 目录结构

```
index.html               页面外壳
src/
  main.js                入口：路由、事件委托、弹层
  state.js               全局状态 + 本地保存
  data/                  所有内容（改行程只改这里）
    trip.js              日期、城市、类型
    days.js              每日行程（随 12/20 方案、住宿方案变化）
    pois.js              景点图鉴
    legs.js              城际 4 段火车/大巴选项、12/20 三个方案
    games.js             NBA 比赛和购票链接
    vendors.js           所有订票/预约入口、球票平台
    content.js           审计、提示、清单、来源
  lib/
    calc.js              交通费、预算、倒计时（纯函数，有测试）
    maps.js              Google / Apple 地图导航链接
    photos.js            维基百科照片和版权读取
    dom.js               转义、图标、链接按钮
    index.js             景点出现在哪几天
  components/            外壳、设置、景点详情、照片、路线图
  views/                 六个页面
  styles/                tokens / base / layout / components
tests/                   node:test，覆盖价格计算和数据完整性
scripts/build-single.mjs 打包成单个 HTML
```

## 本地运行

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

## 构建和部署

```bash
npm run build
```

生成 `dist/`，可以直接部署到 Vercel（框架选 Vite，或零配置自动识别）、Cloudflare Pages、GitHub Pages。用的是相对路径，放在子目录也能用。

```bash
npm run build:single
```

额外生成 `dist/single/index.html`：CSS 和 JS 全部内联的单文件，可以直接双击打开、发给同伴或离线保存。

## 改内容

- 改某天安排：`src/data/days.js`，条目里的 `pois` 填景点 id 就会出现可点开的卡片，`buy` 填 `vendors.js` 里的 key 就会出现订票按钮。
- 加景点：`src/data/pois.js` 加一条，`wiki` 填英文维基条目名就会自动有照片。
- 改价格：火车/大巴在 `legs.js`，球票估价在 `games.js`，房价默认值在 `state.js`。
- 改完跑 `npm test`，会检查行程引用的景点、交通段、订票入口是否都存在，以及国会图书馆不排周一、大都会不排周三和圣诞。

信息核对日期：2026-11-05。转售网站的赛程和票价会变，出发前一周再核对一次。
