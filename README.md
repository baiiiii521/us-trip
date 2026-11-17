# 美东圣诞篮球行 · EAST COAST HOOPS

2 人 · 2026.12.18 – 12.31 · 波士顿 → 华盛顿 → 费城 → 纽约 → 洛杉矶。
一个手机优先的行程网站：每日行程、景点图鉴（介绍 + 照片 + 导航）、火车 / 大巴切换、球票入口、实时预算和预订清单。

## 当前状态（2026-11-14）

- 交通默认全程自驾：已订 Sixt，12/18 JFK 取车，12/24 在曼哈顿下城 Battery Park 门店还车，页面 `#drive`；设置里可改成「12/21 波士顿取车」或「不租车」。
- 纽约住 AVA Fort Greene（布鲁克林）。12/20 固定看凯尔特人（方案 C）。
- 证件和订单号放在带密码的 `#vault`，密文不在网站目录里；个人信息不进仓库。
- 出发前的核对项和手机试用清单见 `DEVICE_CHECKLIST.md`，接手说明见 `AGENT_HANDOFF.md`。

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

## 设计规范

界面按 [taste-skill](https://github.com/Leonxlnx/taste-skill)（MIT）的 system、motion、copy 规则调整，取其中适用于工具型页面的部分：

- 一套系统：界面以中性色为主，唯一强调色是篮球橙（主按钮、焦点、当前状态）；没有紫色；正文 16px，标签 13px 起；间距 4 的倍数；圆角 8 / 12 / 20；一种主按钮 + 一种描边次按钮。
- 微交互（`src/styles/motion.css`）：按钮悬停上浮 1px、按下下沉并缩到 .985；可点的卡片上浮 2px；照片在框内放大 1.03；链接下划线从左画到右；焦点环收拢；复制按钮变成对勾；弹层淡入或从底部滑出。不做滚动出现动画、视差和倾斜，“减少动态”模式下只保留颜色变化。
- 文案：标题说清是什么，按钮用动词开头，照片上下不放说明文字，版权放在详情页底部一行。

和原规则不同的地方：这是一个多页工具而不是公司官网，所以没有“一屏一个区块”、全屏首屏和特效；行程页的日期条保留吸顶和滚动高亮，方便在长行程里定位。

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

## v3.1 新增功能（出行体验）

| 功能 | 位置 | 说明 |
|---|---|---|
| 今天模式 | 总览 | 按当前日期显示“现在 / 下一项”、一键导航、今天要出示的订单、地铁和车次实时状态链接；“更多 → 预览模式”可假装是行程中的某天 |
| 实时天气和暴雪预案 | 总览、每日行程 | Open-Meteo 预报（出发前 16 天内），大雪/大雨/严寒时给出室内备选 |
| 订单夹 | 更多 → 订单夹，行程和票务里的“我的订单” | 每张票、每间房、每个预约一个格子：确认号、备注、截图/PDF（IndexedDB，只存本机） |
| 球赛日卡片 | 行程、票务里的球赛 | 几点开门、包袋规定、怎么去怎么回、附近吃什么、座位 |
| 英文大字卡 | 更多 → 英文大字卡 | 酒店地址、当天景点、常用句子，点一下全屏放大给司机看 |
| 记账和 AA 结算 | 花费 | 美元/人民币、实时汇率（Frankfurter）、两人结算、实际 vs 预算 |
| 景点打卡 | 景点详情、景点图鉴 | 去过 / 想去，图鉴可筛选 |
| 离线使用 | 全站 | PWA：manifest + service worker + 图标，可添加到主屏幕；可预下载景点照片 |
| 出发提醒 | 更多 | 城际交通和球赛前 60 / 15 分钟通知（页面开着或已装到主屏幕时有效） |
| 两人同步 | 更多 | 同步码（无需服务器）或端到端加密云同步（`api/sync.js`，需要 Vercel KV / Upstash，环境变量 `KV_REST_API_URL`、`KV_REST_API_TOKEN`），按条合并，保留较新的一份 |
| 结账计算 | 花费 → 记账 | 输入账单金额，按城市税率和小费比例算出总额、每人多少、折合人民币，一键记账 |
| 紧急情况 | 更多 → 紧急情况 `#sos` | 911、外交部 12308、使领馆领保电话、酒店电话、租车救援、丢护照步骤、英文求助卡，离线可用 |
| 退房清单、车停在哪、今日花费 | 总览的“今天”卡片 | 换住处的早上逐项勾选；租车期间记车位、照片和定位，一键走回车旁；当天已花多少 |
| 圣诞营业标记 | 行程 12/24、12/25 | 每个去处标“圣诞照常 / 待确认”，写明要查什么 |
| 回忆 | 更多 → 回忆 | 导入照片，读取 EXIF 拍摄时间归到各天；浏览器内录制 1080×1920 回忆视频；每日 3:4 分享卡 |

数据分两类：方案设置和本机设置只在本机；清单、打卡、记账、订单文字、酒店、座位、名字参与同步。照片和附件永远不离开手机。
测试：`npm test`（75 项，含同步合并、加密、API、结算、今天模式、天气预案、自驾方案、证件资料库、各页面渲染）。

## 自己的服务器部署

需要 Node 18+。在服务器上：

```bash
git clone https://github.com/baiiiii521/us-trip.git && cd us-trip && bash deploy/deploy.sh
```

`deploy/server.mjs` 同时提供网页和 `/api/sync`（云同步，数据存在 `data/` 目录，只有密文）。端口用 `PORT` 改，默认 8080。
前面用 nginx 反代并配 HTTPS：参考 `deploy/nginx.conf`；systemd 服务参考 `deploy/us-trip.service`。离线缓存、通知、添加到主屏幕都要求 HTTPS。
更新：`git pull && bash deploy/deploy.sh`。

## 接手开发（给本机其他 agent）

要交给别的 agent 直接开工，把 `AGENT_PROMPT.md` 里那段提示词整段发给它（含红线、数据流、发版步骤、当前任务优先级）。

仓库：`https://github.com/baiiiii521/us-trip`（分支 `main`）。这是完整工程，不是只读快照。

```bash
git clone https://github.com/baiiiii521/us-trip.git && cd us-trip
npm install
npm test            # 112 项：数据一致性、隐私扫描、页面装载、跳转守门
npm run build       # 产出 dist/（网站）
```

目录分工：

| 路径 | 是什么 | 改这里要不要重新生成 |
| --- | --- | --- |
| `src/` | 网站 + 数据的**唯一真源**（data / lib / views / styles） | 改完跑 `node scripts/mp-sync-shared.mjs` |
| `miniprogram/` | 微信小程序（原生，无 web-view） | `miniprogram/shared/` 是生成物，**不要手改** |
| `scripts/` | 同步、抓图、地理编码、隐私扫描、上传 | — |
| `tests/` | 上面那些守门测试 | 加功能请同时加测试 |
| `AGENT_HANDOFF.md` | 交接记录：小程序章节、上传命令、设计系统五条硬规则 | 有结构性改动就补一段 |

小程序数据流（重要）：`src/data|lib` → `node scripts/mp-sync-shared.mjs` → `miniprogram/shared/`。`photos.js` / `geo.js` / `places.js` / `heroes.js` 是**生成物但在 KEEP 白名单里**，同步不会删；要更新它们跑对应脚本：

```bash
node scripts/mp-photos.mjs         # 68 个景点的维基首图 + 许可
node scripts/mp-geocode.mjs        # 行程里的英文地址 → 经纬度
node scripts/mp-geocode-alias.mjs  # 正文里常见地名 → 经纬度
node scripts/mp-heroes.mjs         # 城市横幅大图（1600/1920 宽）
node scripts/mp-assets.py          # 地图针 + 底部导航图标
```

上传小程序（需要上传密钥，**密钥不进仓库**，只放在 CI 机器 `~/.mp-ci/`）：

```bash
ssh ubuntu@49.233.168.199
cd ~/us-trip-ci && PATH=/opt/node20/bin:$PATH \
  node scripts/mp-upload.mjs --key ~/.mp-ci/private.wx678ed2bc735ec846.key --version 0.8.x --desc "说明"
# 预览码：~/us-trip-ci/.mp-out/preview.png（其实是 JPEG）
```

同步代码到 CI 机器必须中转（越南→北京直连会超时）：先 rsync 到 `43.153.33.188:/tmp/us-trip-mp/`，再由它 rsync 到 `49.233.168.199:~/us-trip-ci/miniprogram/`。

隐私红线：护照号、PNR、票号、酒店/公寓确认号、房号**不得出现在 `miniprogram/`**；规则在 `scripts/private-patterns.json`，`npm test` 会扫。

界面规范：`miniprogram/app.wxss` 是设计系统（字号梯度、表面、材质栏、按下反馈、动效曲线），页面只引用不重写；五条硬规则见 `AGENT_HANDOFF.md` 的「小程序设计系统」一节。

尚未完成：证件包（小程序里做密码解锁，需要先验证纯 JS 的 PBKDF2+AES-GCM 能解开现有密文）、两人同步（同步码 + 加密云同步）、订阅消息提醒（要后端存 openid + 模板审核）、回忆（照片导入 / 回忆视频 / 分享卡）。
