# 行程介绍视频

按 huashu-design skill 的流程制作：spec → 六个候选方向 → 三张方向板 + 4 秒动态小样 → 用户选定 → 导演稿 → 正片。

- `spec.md` 要说什么、给谁看、格式（竖屏 1080×1920，约 30 秒）
- `product-facts.md` 事实核对
- `directions.md` 六张方向卡和挑选理由
- `design-demos/` 三个方向的可 seek 动画场景、备选静帧、方向板和缩略图页面
- `lib/stage.js` 舞台：按时间 t 纯函数渲染，可逐帧录制
- `tools/capture.cjs` 本地服务 + Playwright 逐帧截图 + ffmpeg 编码

```bash
node video/tools/capture.cjs boards
```

```bash
node video/tools/capture.cjs sketch 1
```

产物在 `video/out/`（不进 git）。
