// 渲染工具：本地 http 服务 + Playwright 逐帧 seek 截图 + ffmpeg 编码。
// 用法：
//   node tools/capture.cjs boards              关键帧、备选帧、方向板、缩略图总览
//   node tools/capture.cjs sketch <1|2|3>      某个方向的 4 秒动态小样（540×960，30fps）
//   node tools/capture.cjs film <page> <out.mp4> [fps]   正片逐帧渲染（1080×1920）
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'out');
const FRAMES = path.join(OUT, 'frames');
fs.mkdirSync(FRAMES, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.css': 'text/css' };
function serve() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve(srv));
  });
}

async function openPage(browser, url, { w = 1080, h = 1920, dpr = 1, recording = true } = {}) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  if (recording) await page.addInitScript(() => { window.__recording = true; });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  await page.waitForTimeout(300);
  return page;
}

const KEYFRAMES = { 1: [1.0, 3.0], 2: [1.5, 3.6], 3: [1.2, 3.4] };
const PAGES = { 1: 'dir-1-film.html', 2: 'dir-2-broadcast.html', 3: 'dir-3-citypop.html' };

async function boards(base, browser) {
  for (const d of [1, 2, 3]) {
    const page = await openPage(browser, `${base}/design-demos/${PAGES[d]}`);
    for (const [i, t] of KEYFRAMES[d].entries()) {
      await page.evaluate((tt) => window.__seek(tt), t);
      await page.screenshot({ path: path.join(FRAMES, `dir-${d}-kf${i + 1}.png`) });
    }
    await page.close();
  }
  for (const v of [4, 5, 6]) {
    const page = await openPage(browser, `${base}/design-demos/alternates.html?v=${v}`, { dpr: 0.5, recording: false });
    await page.screenshot({ path: path.join(FRAMES, `alt-${v}.png`) });
    await page.close();
  }
  for (const d of [1, 2, 3]) {
    const page = await openPage(browser, `${base}/design-demos/board.html?d=${d}`, { w: 1920, h: 1080, recording: false });
    await page.screenshot({ path: path.join(OUT, `board-${d}.png`) });
    await page.close();
  }
  const page = await openPage(browser, `${base}/design-demos/thumbs.html`, { w: 1920, h: 1080, recording: false });
  await page.screenshot({ path: path.join(OUT, 'thumbs.png') });
  await page.close();
}

async function frames(browser, url, outFile, { fps, w, h, dpr }) {
  const page = await openPage(browser, url, { w, h, dpr });
  const dur = await page.evaluate(() => window.__dur);
  const dir = path.join(FRAMES, `seq-${process.pid}-${path.basename(outFile, '.mp4')}`);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(dur * fps);
  for (let i = 0; i < n; i++) {
    await page.evaluate((tt) => window.__seek(tt), i / fps);
    await page.screenshot({ path: path.join(dir, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
    if (i % 60 === 0) process.stdout.write(`  frame ${i}/${n}\n`);
  }
  await page.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, 'f%05d.jpg'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', outFile]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('wrote', outFile);
}

(async () => {
  const [cmd, a, b, c] = process.argv.slice(2);
  const srv = await serve();
  const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await chromium.launch();
  try {
    if (cmd === 'boards') await boards(base, browser);
    else if (cmd === 'sketch') await frames(browser, `${base}/design-demos/${PAGES[a]}`, path.join(OUT, `dir-${a}-sketch.mp4`), { fps: 30, w: 1080, h: 1920, dpr: 0.5 });
    else if (cmd === 'film') await frames(browser, `${base}/${a}`, path.resolve(b), { fps: Number(c) || 30, w: 1080, h: 1920, dpr: 1 });
    else console.log('usage: boards | sketch <1|2|3> | film <page> <out.mp4> [fps]');
  } finally {
    await browser.close(); srv.close();
  }
})();
