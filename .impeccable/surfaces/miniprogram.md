---
version: 1
slug: "miniprogram"
primary_target: "miniprogram"
related_targets: []
---

# 小程序界面 · surface brief

范围：微信小程序 miniprogram/ 全部 14 页。访客模式：Operate（路上单手查「现在该干什么」+ 出发前慢慢翻，两种一样多）。
用户 2026-11-17 第二轮选定「地铁线路图」方向（challenger: wayfinding-cartography-signage-midnight-transit-diagram）。

## Direction contract

THESIS：整趟旅程是一张地铁线路图：五座城是五条颜色线，一天是一条线，每一项是一站；拒绝「灰底白卡片一页页往下排」的旅行 App 默认样子。

OWN-WORLD：午夜蓝搪瓷底（#0E1A3A）做顶栏和路线区，瓷白（#F5F6F8）做阅读区；五条线色：波士顿绿 #2FB36B、华盛顿红 #E63A3A、费城钴蓝 #2F6BFF、纽约琥珀 #FFC233、洛杉矶青 #19B5C9；站点是白芯粗描边圆点，线只在 0/45/90 度拐；人文无衬线，时间用等宽数字，站名字号固定。

STORY：一打开就知道自己在线上的哪一站、下一站是什么、怎么去；往下翻能看全天、全城、全程；出发前在白色阅读区里慢慢看细节。

FIRST VIEWPORT：今天页：顶部午夜蓝区放五城线条（当前城的圈最大）、日期第几站、两地时间和天气；下面一条竖直的当城颜色线，已过的站变灰，下一站是琥珀色大圆点，旁边展开一张白卡写详情和「导航过去」；底部导航。

FORM：midnight transit diagram，来自换批后的第一手牌（challenger，wins）；seed:f642901334e7ad34

FINISH：unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature move
行程页、今天页的竖直线路：站点圆点 + 当城线色，已过 / 现在 / 下一站 / 之后四种状态靠圆点大小、实心与灰度区分；换城的那天在线上画换乘站（双圈）。
