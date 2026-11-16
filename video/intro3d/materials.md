# 素材来源

- `assets/map.js`：美国东北各州轮廓，来自网站的 `src/data/map-geo.js`（us-atlas states-10m，公有领域），换算成 3D 坐标。城市位置按真实经纬度投影；洛杉矶在 4000 公里外，画成远处一块小台子，不按比例。
- `assets/gen/*.jpg`：7 张城市图，2026-11-16 用本机 codex CLI 的图像生成工具生成（夜景、深蓝配暖橙、无文字无标志的统一画风）。是 AI 生成的示意图，不是实拍照片，画面里的建筑细节不保证和实景一致。
- 文字里的日期、城市、球赛对阵和开球时间：来自网站的 `src/data/days.js`、`games.js`（2026-11-14 按 ESPN 赛程核对过）。
- 字体：Anton、Noto Sans SC、Roboto Condensed（OFL，随 huashu-motion 附带）。
- 配乐和音效：`om sound` 按时间轴合成，不含第三方音乐。
