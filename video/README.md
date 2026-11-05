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

## 正片（方向二：90 年代转播）

- `direction-approved.md` 用户选择的原话
- `导演稿.md` 分镜卡（16 小节、拍点对齐）、视觉密度条款、音效时间表
- `film/film-broadcast.html` 正片场景，30.72 秒，按时间 t 渲染
- `audio/` 配乐和音效（来源见 `audio/NOTICE.md`）
- `tools/mix.cjs` 混音：BGM 从第一拍裁起，音效按导演稿时间点落位

```bash
node video/tools/capture.cjs film film/film-broadcast.html video/out/film-silent-60.mp4 60
```

```bash
node video/tools/mix.cjs video/out/film-silent-60.mp4 video/out/east-coast-hoops-60fps.mp4
```

方向三 City Pop 梦境（`导演稿-citypop.md`、`film/film-citypop.html`，30.25 秒，配乐 bgm-tech.mp3）：

```bash
node video/tools/capture.cjs film film/film-citypop.html video/out/citypop-silent-60.mp4 60
```

```bash
node video/tools/mix.cjs video/out/citypop-silent-60.mp4 video/out/east-coast-hoops-citypop-60fps.mp4 citypop
```

方向一 胶片抽帧（`导演稿-film.md`、`film/film-neon.html`，29.86 秒，配乐 bgm-educational.mp3）：

```bash
node video/tools/capture.cjs film film/film-neon.html video/out/neon-silent-60.mp4 60
```

```bash
node video/tools/mix.cjs video/out/neon-silent-60.mp4 video/out/east-coast-hoops-film-60fps.mp4 film
```

产物在 `video/out/`（不进 git）。
