---
name: 行前行后 · 地铁线路图
description: 微信小程序「行前行后」的设计系统：整趟旅程画成一张地铁线路图（只管 miniprogram/，网站 trip.byb521.com 另有 src/styles/tokens.css）
colors:
  night: "#0E1A3A"
  night-2: "#17264D"
  night-3: "#22335F"
  ground: "#F3F4F7"
  panel: "#FFFFFF"
  ink: "#0E1A3A"
  ink-2: "#3D4A68"
  muted: "#56627E"
  faint: "#9AA4BA"
  on-night: "#F4F6FA"
  on-night-2: "#A9B6D6"
  line-bos: "#2FB36B"
  line-dc: "#E63A3A"
  line-phl: "#2F6BFF"
  line-nyc: "#FFC233"
  line-la: "#19B5C9"
  go: "#FFC233"
  go-press: "#F0AE12"
  warn: "#B4540A"
  warn-soft: "#FFF3E0"
  crit: "#D33232"
typography:
  display:
    fontFamily: "-apple-system, SF Pro Text, PingFang SC, Helvetica Neue, Microsoft YaHei, sans-serif"
    fontSize: "52rpx"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  city:
    fontFamily: "-apple-system, PingFang SC, sans-serif"
    fontSize: "68rpx"
    fontWeight: 800
    lineHeight: 1.08
  title:
    fontFamily: "-apple-system, PingFang SC, sans-serif"
    fontSize: "38rpx"
    fontWeight: 700
    lineHeight: 1.22
  body:
    fontFamily: "-apple-system, PingFang SC, sans-serif"
    fontSize: "29rpx"
    fontWeight: 400
    lineHeight: 1.62
  caption:
    fontFamily: "-apple-system, PingFang SC, sans-serif"
    fontSize: "24rpx"
    fontWeight: 400
    lineHeight: 1.45
  time:
    fontFamily: "-apple-system, SF Pro Text, sans-serif"
    fontSize: "30rpx"
    fontWeight: 750
    fontFeature: "tnum"
rounded:
  sm: "16rpx"
  md: "24rpx"
  lg: "32rpx"
  pill: "999rpx"
spacing:
  gutter: "24rpx"
  page: "32rpx"
  stack: "20rpx"
  section: "40rpx"
components:
  button-primary:
    backgroundColor: "{colors.go}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "96rpx"
  button-ghost:
    backgroundColor: "rgba(14, 26, 58, 0.06)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "96rpx"
  top-bar:
    backgroundColor: "{colors.night}"
    textColor: "{colors.on-night}"
  card:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.md}"
    padding: "30rpx"
  chip-on:
    backgroundColor: "{colors.night}"
    textColor: "{colors.on-night}"
    rounded: "{rounded.pill}"
  station:
    backgroundColor: "{colors.panel}"
    size: "30rpx"
  station-next:
    backgroundColor: "{colors.panel}"
    size: "46rpx"
---

# 行前行后 · 地铁线路图

## Overview

整趟旅程是一张地铁线路图：五座城市是五条颜色线，一天是一条线，每一项安排是一站。2026-11-17 Barry 在两轮方向里选定（来源：impeccable 方向轮 `seed:f642901334e7ad34`，challenger「midnight transit diagram」）。午夜蓝搪瓷做顶栏和线路区，瓷白做阅读区。模式是 Operate：先让人知道「现在在哪一站、下一站去哪、怎么去」，再给细节。

令牌写在 `miniprogram/app.wxss` 的 `page {}` 里（CSS 变量），页面只引用。

## Colors

- **午夜蓝 `night`**：顶栏（`components/topbar`）、首页整页、今天页站牌、行程页全程线路、景点/吃什么的筛选带、「今晚住」块。
- **瓷白 `ground` + 白面板 `panel`**：所有要细读的内容。
- **五条线色**只用来画线、站点、城市标记（筛选胶囊里的小圆点、区块前的短线、详情页的城市线），不刷大面积底色，也不拿来当正文字色（波士顿绿、纽约琥珀在白底上读不清）。
- **琥珀 `go`** 是唯一的操作色：导航过去、进入行程、记上、下一站的光圈、底部导航选中的那一小段。午夜蓝是次要操作和选中态。
- **红 `crit`** 只给 911。

## Typography

系统字体（iOS 是苹方 + SF）。小程序没法合理地自带中文字体，这是平台限制下的取舍。字号梯度：城名 68rpx / 大标题 52rpx / 标题 38rpx / 正文 29rpx / 说明 24rpx（不再低于 24rpx，约 12px）。时间、里程、金额一律等宽数字（`.num`）。

## Layout

页面左右 24–32rpx。今天页从上到下：城市图（300rpx，城名和天气压在暗部）→ 五城线 → 三地时间一行 → 当天线路。行程页：全程 14 站横向线路（点一站跳到那天）→ 每天一张卡（第几天的大站点 + 日期 + 城市 + 强度）→ 卡里是当城颜色的竖线。

## Elevation & Depth

面板阴影两层：`0 2rpx 6rpx rgba(14,26,58,.06), 0 12rpx 28rpx -18rpx rgba(14,26,58,.25)`。主按钮是带模糊的琥珀投影。下一站站点有一圈琥珀光环并缓慢脉动，这是全套唯一的循环动效。

## Shapes

圆角 16 / 24 / 32rpx，按钮和胶囊全圆。站点是白芯粗描边圆点：已过 22rpx 灰、现在 34rpx 当城色、下一站 46rpx 琥珀、之后 30rpx 当城色；换城那天是双圈换乘站。线粗 8rpx，只走横平竖直。

## Components

- `top-bar`：午夜蓝，左边圆形返回、标题和副标题，右边琥珀小站牌（第几天）；可选底边五色线（按每城天数分段，走过的亮）。所有页面都用它，不再用系统导航栏。
- `bottom-nav`：白底，选中项上方一小段琥珀线，图标为午夜蓝。
- `.section-label`：区块标题前一小段午夜蓝短线。
- 城市图：`lib/media.js` 的 `cityImage(city, 当地钟点)`，7–16 点用实拍（维基共享资源，图上标作者和许可），其余用 codex 生成的夜景（标「AI 示意图」）。图放在 trip.byb521.com/media/mp/，`node scripts/mp-media.mjs` 生成。读不到就只剩午夜蓝底。

## Do's and Don'ts

- 做：新页面先想它是不是一条「线」（按时间或顺序的东西都画成站点）。
- 做：可点的东西加 `hover-class`；按钮高度不低于 88rpx，小按钮不低于 60rpx。
- 不做：眉标（标题上方的小字标签）、字距拉开的小标题、零模糊的硬阴影、彩色粗左边框。
- 不做：把线色当大块底色或正文颜色。
- 未完成（不是规则）：订单夹还没按日期分段画成线路；地图仍是微信原生地图样式。
