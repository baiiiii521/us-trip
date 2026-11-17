# 交给下一个 agent 的提示词

把下面「=== 提示词开始 ===」到「=== 提示词结束 ===」之间的内容整段复制给接手的 agent（Claude Code / Codex / 另一个 Hermes 都行）。仓库里这份文件和 README、AGENT_HANDOFF.md 是配套的。

=== 提示词开始 ===

你接手一个已经在跑的项目，不要从零开始，也不要重写。

## 项目

微信小程序「行前行后」+ 配套网站：一趟 2026-12-18 至 12-31 的美东行程（波士顿 → 华盛顿 → 费城 → 纽约 → 洛杉矶，2 人）。小程序已有 13 个页面（首页/今天/行程/景点/详情/吃什么/花费/记账/订单夹/票务/自驾/大字卡/小技巧/随身），当前版本 0.8.2。

- 仓库：https://github.com/baiiiii521/us-trip （public，分支 main）
- 技术栈：小程序原生（无 web-view，个人主体不可用）；网站用 Vite；数据与纯函数在 `src/`，两边共用
- 先读：`README.md`（含「接手开发」一节）、`AGENT_HANDOFF.md`（交接记录 + 设计系统五条硬规则）

## 第一步，别跳过

```bash
git clone https://github.com/baiiiii521/us-trip.git && cd us-trip
npm install
npm test
```

必须 112 项全过。跑不过先修环境或查代码，**不许改测试来让它变绿**。

## 结构（记住这条数据流）

`src/`（唯一真源：data / lib / views / styles）
→ `node scripts/mp-sync-shared.mjs`
→ `miniprogram/shared/`（生成物，**不要手改**）

`miniprogram/shared/data/{photos,geo,places,heroes}.js` 也是生成物，在 KEEP 白名单里；要更新跑对应脚本（见 README）。

## 红线（违反即失败）

1. **隐私**：护照号、PNR、票号、酒店/公寓确认号、房号不得出现在 `miniprogram/`。规则在 `scripts/private-patterns.json`，`npm test` 会扫。
2. **上传密钥不在仓库**，只在 CI 机器 `~/.mp-ci/`。不要去找、不要新建、不要打印内容。
3. **腾讯云 Windows 49.233.129.142** 上跑着别的业务，禁止操作。
4. **未经用户明确批准，不得以他名义发任何消息**（飞书/微信/邮件/社媒）。要发先出完整草稿给他确认。
5. 不要手改 `miniprogram/shared/`、不要引入 web-view、不要把视频/照片打进主包（主包 ≤ 2MB）。

## 设计规范（改 UI 前必读）

`miniprogram/app.wxss` 是设计系统，页面只引用不重写：字号梯度 `.t-display/.t-title/.t-head/.t-body/.t-sub/.t-cap`（大标题负字距、小标签正字距）、表面 `.card/.group`、材质 `.material`、按下反馈 `.press`、等宽数字 `.num`、空状态 `.empty`。

五条硬规则（`AGENT_HANDOFF.md` 有原文）：单一强调色 `#C04A0A`（选中态都用它，不要出现黑色选中块）；可点元素必须 `hover-class="press"`；卡片内不放右侧箭头；一页只留一个视觉焦点；网络资源（图片/地图）失败必须有回退。动效曲线统一 `cubic-bezier(0.16, 1, 0.3, 1)`，不做弹跳。

## 现在的活儿（按优先级，做完一项交一项）

1. **证件包**：小程序内密码解锁。先写最小验证——纯 JS 的 PBKDF2 + AES-GCM 能否解开服务器现有密文；验证通过再铺页面。验收：错密码不泄露任何信息、切后台回来要重新验证、解密失败有明确人话提示。
2. **两人同步**：同步码 + 加密云同步（依赖 1）。
3. **订阅消息**：后端存 openid + 模板审核；AppSecret 由用户自己填到服务器，不要向他要。
4. **回忆**：照片导入、回忆视频、分享卡（小程序没有录屏接口，分享卡要用 canvas 重画）。
5. **体验债**：这个项目**从没在真机逐页验证过**（只有 Node 测试和构建）。拿真机把 13 个页面过一遍，把布局/滚动/安全区问题列成清单再动手改。

## 工作方式

- 改数据只改 `src/`，然后 `node scripts/mp-sync-shared.mjs`，再 `npm test`。
- 加功能必须加测试。已有守门先例：跳转目标必须在 `app.json`、每个页面要能装载并跑通 `onLoad/onShow`、带底部导航的页必须有返回按钮、带地址的行程条目必须有经纬度。
- 发版三步：`rsync miniprogram/ ubuntu@43.153.33.188:/tmp/us-trip-mp/` → 由它 `rsync` 到 `ubuntu@49.233.168.199:~/us-trip-ci/miniprogram/` → 服务器上 `cd ~/us-trip-ci && PATH=/opt/node20/bin:$PATH ./run-upload.sh <版本号> "<说明>"`，预览码在 `.mp-out/preview.png`（其实是 JPEG）。直连 49.233 会超时，必须走硅谷中转。
- 交付时说清四件事：改了什么、为什么、**验证证据**（测试数字或命令输出）、还差什么。不要只说"已修好"。

## 用户偏好（很重要）

中文回答，先结论后原因。他看不懂技术术语，方案要用生活类比。他要的是**能当场打开看的结果**，不是路径和计划。他自己会指出哪里不对，你按他的话改，别辩解。

=== 提示词结束 ===
