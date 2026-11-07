# 接手提示词（给本地 agent）

你要接手继续开发「美东圣诞篮球行」网站。先读 README.md 和本文件，再动手。回复和界面文案用中文，每一处英文面向用户的内容都要有对应中文。

## 项目
- 仓库：https://github.com/baiiiii521/us-trip（私有，main 分支）
- 线上：https://trip.byb521.com （硅谷 43.153.33.188 是主入口，49.233.168.199 是国内节点，两条线路内容一致；HTTPS 证书到 2027-02-03）
- 用途：2 人，2026-12-18 至 12-31，波士顿 → 华盛顿 → 费城 → 纽约 → 洛杉矶，看 NBA 圣诞球赛。移动端优先，旅途中用。
- 技术：Vite 6 原生 JS 单页应用，哈希路由，无框架。测试：`npm test`（node:test，57 项）。构建：`npm run build`。单文件版：`npm run build:single`。

## 目录
- `src/data/`：行程（days.js 的 buildDays(state)）、景点 pois.js（66 个）、球赛 games.js、机票 flights.js、住宿 hotels.js、交通 legs.js、路线几何 map-geo.js、订单格子 bookings.js、大字卡 travelcards.js
- `src/lib/`：纯函数和浏览器能力（calc、today、weather、money、sync、exif、recap、sharecard、notify、pwa、storage、geo、route）
- `src/views/`：home days guide tickets money more wallet cards memories info；`src/components/`：shell、settings、poi-sheet、gameday、trip-route 等
- `src/main.js`：路由、弹层、事件委托（ACTIONS、FORMS）。新交互都走 data-action / data-form
- `src/state.js`：状态存 localStorage（键 hoops-trip-v3）。可同步记录都带更新时间 u，删除写 `{del:true,u}`，合并取较新（lib/sync.js）。照片和订单附件在 IndexedDB，不同步
- `api/sync.js`：云同步接口（密文）；`deploy/`：trip.byb521.com 发版脚本、nginx、systemd、sync 服务；`public/`：sw.js、manifest、图标、行程 PDF
- `scripts/verify-network.mjs`：联网核对景点照片 / Open-Meteo 天气 / Frankfurter 汇率，缺一项退出码 1
- `video/`：介绍视频源码（huashu 流程）；`video/out/` 不在 git 里

## 必须遵守
- 视觉：taste-skill 规则——中性色加唯一强调色 #C04A0A，不用紫色，正文 16px，间距按 4px 倍数，动效克制并尊重 reduced-motion。不要新增颜色，用 tokens.css 的变量。
- 新增状态要决定是否同步；同步的集合加进 `SYNC_KEYS`，并为 mergeDocs 补测试。
- 改行程内容后跑 `npm test`：有测试检查每个行程里的票都有对应订单格子。
- 12/20 有 A/B/C 三个方案（凯尔特人 20:00 和 18:45 开车的冲突），任何新功能都要在三个方案下都成立。
- 不要把密钥、口令写进仓库。云同步口令只存本机。
- 离线：`public/sw.js` 的 `MEDIA_HOSTS` 必须列出照片实际用的域名。维基 `pageimages` 现在返回 `thumb.wikimedia.org`（不是 `upload.wikimedia.org`），漏了就会出现"在线有图、离线全没"。改了缓存内容就升 `VERSION`。

## 已完成
每日行程、景点图鉴、机票与住宿、路线图、火车/大巴切换、买票链接、预算；今天模式、天气和暴雪预案、订单夹、球赛日卡片、英文大字卡、记账和两人结算、景点打卡、PWA 离线、出发提醒、两人同步（同步码 + 加密云同步）、回忆（照片导入、回忆视频、每日分享卡）、12/30 住宿切换。

## 已在真实网络验证（2026-11-07）
1. 景点照片：66/66 有图、66/66 带许可信息。补过 4 个：MIT 大圆顶改用 `Killian_Court`，威尼斯海滩改用 `Venice_Beach_Boardwalk`，NBA Store 补 `NBA_Store`；华尔街铜牛条目首图是非自由版权（美国对雕塑没有全景自由），改走 Commons 指定文件 `Shooting Charging Bull.jpg`（pois.js 的 `photoFile` 字段，photos.js 会读它的缩略图和作者/许可）。
2. 天气与汇率：Open-Meteo 5 城 × 16 天正常；汇率原来打 `api.frankfurter.app`，它会 301 跳到 `.dev` 且跳转响应不带 CORS 头，浏览器里必然失败，已改成 v2 端点 + v1 兜底。
3. 离线：线上 HTTPS 首次访问后断网重载，总览 / 行程 / 订单夹 / 大字卡全部可用，66 张景点照片来自缓存。
4. 提醒：授权后 Service Worker 的 `showNotification` 可用；排程逻辑有测试（60 / 15 分钟前、24 小时窗口），页面每分钟重排一次，事件进入窗口后仍会响。iPhone 仍需"添加到主屏幕"，页面被系统杀后台就不会响——浏览器限制，不是 bug。
5. 回忆视频：Chrome 上 MediaRecorder 支持 mp4(avc1) 和 webm，录制管线（canvas.captureStream + MediaRecorder）实测出片，mp4 优先有测试。iPhone 真机录制还要出发前亲手试一次。

## 待办（按优先级）
1. 出发前一周核对：车次时间、球赛开球时间、票价、景点开放时间（content.js 里有核对日期）。
2. 12/30 默认仍是"机场过夜"，设置里可切到机场酒店；用户倾向未定，不要擅自改默认。
3. 真机走一遍：手机上操作记账、订单夹、大字卡全屏、同步码来回同步、回忆视频录制。
4. 可选：把介绍视频（方向 1、2、3 三个版本）放进网站"更多"页。

## 发版
```bash
bash deploy/deploy.sh        # 测试 → 构建 → 硅谷 → 经硅谷中转到国内节点 → 线上核对 index.html 哈希
bash deploy/deploy.sh -s     # 只发硅谷（快速预览）
```
Mac 直连 49.233 的 rsync 会卡死（跨境），国内节点必须经硅谷中转，脚本已处理。云同步服务在硅谷 `us-trip-sync.service`（:8796，只存密文），`deploy/sync-server.mjs` 没变就不会重启。

## 做事方式
先复现或读代码，再改；每次改动跑 `npm test`、`npm run build`、`node scripts/verify-network.mjs`；界面改动用浏览器在 390×844 手机尺寸截图检查，确认无横向溢出；完成后提交并推送到 main。提交信息用英文祈使句。
