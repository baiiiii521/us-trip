# 接手提示词（给本地 agent）

你要接手继续开发「美东圣诞篮球行」网站。先读 README.md 和本文件，再动手。回复和界面文案用中文，每一处英文面向用户的内容都要有对应中文。

## 项目
- 仓库：https://github.com/baiiiii521/us-trip（私有，main 分支，所有工作已推送，最新提交 136400a）
- 用途：2 人，2026-12-18 至 12-31，波士顿 → 华盛顿 → 费城 → 纽约 → 洛杉矶，看 NBA 圣诞球赛。移动端优先，旅途中用。
- 技术：Vite 6 原生 JS 单页应用，哈希路由，无框架。测试：`npm test`（node:test，26 项）。构建：`npm run build`。单文件版：`npm run build:single`。

## 目录
- `src/data/`：行程（days.js 的 buildDays(state)）、景点 pois.js（66 个）、球赛、交通 legs.js、订单格子 bookings.js、大字卡数据 travelcards.js
- `src/lib/`：纯函数和浏览器能力（calc、today、weather、money、sync、exif、recap、sharecard、notify、pwa、storage）
- `src/views/`：home days guide tickets money more wallet cards memories info；`src/components/`：shell、settings、poi-sheet、gameday 等
- `src/main.js`：路由、弹层、事件委托（ACTIONS、FORMS）。新交互都走 data-action / data-form
- `src/state.js`：状态存 localStorage（键 hoops-trip-v3）。可同步记录都带更新时间 u，删除写 `{del:true,u}`，合并取较新（lib/sync.js）。照片和订单附件在 IndexedDB，不同步
- `api/sync.js`：云同步接口（密文）；`deploy/`：自托管 Node 服务、部署脚本、nginx 和 systemd 示例；`public/`：sw.js、manifest、图标
- `video/`：介绍视频源码（huashu 流程）；`video/out/` 不在 git 里

## 必须遵守
- 视觉：taste-skill 规则——中性色加唯一强调色 #C04A0A，不用紫色，正文 16px，间距按 4px 倍数，动效克制并尊重 reduced-motion。不要新增颜色，用 tokens.css 的变量。
- 新增状态要决定是否同步；同步的集合加进 `SYNC_KEYS`，并为 mergeDocs 补测试。
- 改行程内容后跑 `npm test`：有测试检查每个行程里的票都有对应订单格子。
- 12/20 有 A/B/C 三个方案（凯尔特人 20:00 和 18:45 开车的冲突），任何新功能都要在三个方案下都成立。
- 不要把密钥、口令写进仓库。云同步口令只存本机。

## 已完成
每日行程、景点图鉴、火车/大巴切换、买票链接、预算；今天模式、天气和暴雪预案、订单夹、球赛日卡片、英文大字卡、记账和两人结算、景点打卡、PWA 离线、出发提醒、两人同步（同步码 + 加密云同步）、回忆（照片导入、回忆视频、每日分享卡）、12/30 住宿切换。

## 没有在真实网络下验证（优先做）
沙箱连不上外网，以下只验证了失败时的降级：
1. 景点照片（维基百科 API，lib/photos.js）——确认 66 个景点都有图，缺的补 wiki 标题
2. 天气（Open-Meteo）和实时汇率（Frankfurter）
3. 离线：部署到 HTTPS 后，第一次打开再断网，确认行程、订单夹、大字卡可用
4. 提醒：真机（尤其 iPhone 添加到主屏幕后）能否按时弹出
5. 回忆视频：iPhone Safari 的 MediaRecorder 格式，保存后能否播放

## 待办（按优先级）
1. 部署到用户的服务器：`bash deploy/deploy.sh`，nginx 反代并配 HTTPS，用 certbot。用户尚未提供域名和服务器信息，需要先问。
2. 出发前一周核对：车次时间、球赛开球时间、票价、景点开放时间（content.js 里有核对日期）。
3. 12/30 默认仍是“机场过夜”，设置里可切到机场酒店；用户倾向未定，不要擅自改默认。
4. 真机走一遍：手机上操作记账、订单夹、大字卡全屏、同步码来回同步，修体验问题。
5. 可选：把介绍视频（方向 1、2、3 三个版本）放进网站“更多”页。

## 做事方式
先复现或读代码，再改；每次改动跑 `npm test` 和 `npm run build`；界面改动用 Playwright 在 390×844 手机尺寸截图检查，确认无横向溢出；完成后提交并推送到 main。提交信息用英文祈使句。
