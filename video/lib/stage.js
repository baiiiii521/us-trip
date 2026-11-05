// 极简舞台：1080×1920 画布，按时间 t（秒）纯函数渲染，可 seek，可逐帧录制。
// 页面用法：makeStage({ dur, render(t) })。
// 录制：window.__recording = true 时不自动播放；window.__seek(t) 渲染某一时刻；window.__ready 字体加载完成后为 true。
// 预览：?t=1.2 停在某一时刻；不带参数则循环播放。

export const W = 1080;
export const H = 1920;

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
// 区间进度：t 在 [a, b] 里走到哪
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const ease = {
  out: (k) => 1 - Math.pow(1 - k, 3),
  in: (k) => k * k * k,
  inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  expoOut: (k) => (k === 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  back: (k) => { const c = 1.4; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }
};
// 抽帧：把时间量化到 fps 帧，做出低帧率卡顿感
export const step = (t, fps) => Math.floor(t * fps) / fps;

// 可复现的伪随机
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

// 胶片颗粒：预先生成几张噪点图，按帧轮换（确定性）
export function makeGrain(canvas, { tiles = 6, alpha = 0.12, size = 360 } = {}) {
  const imgs = [];
  for (let i = 0; i < tiles; i++) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'); const d = g.createImageData(size, size); const r = rng(97 + i * 13);
    for (let p = 0; p < d.data.length; p += 4) { const v = r() * 255; d.data[p] = d.data[p + 1] = d.data[p + 2] = v; d.data[p + 3] = 255; }
    g.putImageData(d, 0, 0); imgs.push(c);
  }
  const ctx = canvas.getContext('2d');
  canvas.width = W / 2; canvas.height = H / 2;
  return (t) => {
    const i = Math.floor(t * 24) % tiles;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = alpha;
    const pat = ctx.createPattern(imgs[i], 'repeat');
    ctx.fillStyle = pat; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  };
}

export function makeStage({ dur, render }) {
  const stage = document.getElementById('stage');
  const fit = () => {
    const s = Math.min(innerWidth / W, innerHeight / H);
    stage.style.transform = `scale(${s})`;
  };
  fit(); addEventListener('resize', fit);
  window.__seek = (t) => render(t);
  window.__dur = dur;
  const q = new URLSearchParams(location.search);
  document.fonts.ready.then(() => {
    render(q.has('t') ? +q.get('t') : 0);
    window.__ready = true;
    if (q.has('t') || window.__recording) return;
    let t0 = null;
    const tick = (now) => {
      if (window.__recording) return;
      if (t0 === null) t0 = now;
      render(((now - t0) / 1000) % dur);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
