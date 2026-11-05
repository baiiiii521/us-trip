// 回忆视频：在浏览器里把照片按时间排好，画到 1080×1920 画布上（推近、交叉淡化、胶片日期戳、每天第一张标出日期和城市），
// 用 MediaRecorder 实时录下来，可选配乐。录制时页面要保持在前台。
const W = 1080, H = 1920;

// 读照片并按 EXIF 方向转正；老浏览器不认 from-image 时退回默认（默认也会转正）
export async function loadBitmap(blob) {
  try { return await createImageBitmap(blob, { imageOrientation: 'from-image' }); }
  catch (e) { return createImageBitmap(blob); }
}

export function pickMime() {
  const list = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
  if (typeof MediaRecorder === 'undefined') return null;
  return list.find((t) => MediaRecorder.isTypeSupported(t)) || '';
}

function grainTile() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); const d = g.createImageData(256, 256);
  for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
}

function cover(ctx, img, zoom, alpha) {
  const s = Math.max(W / img.width, H / img.height) * zoom;
  const w = img.width * s, h = img.height * s;
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  ctx.globalAlpha = 1;
}

const stampOf = (d) => `'${String(d.getFullYear()).slice(2)} ${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getDate()).padStart(2, '0')}`;

// photos: [{ blob, takenAt, label }]（已按时间排序；label 是这天第一张时显示的“12/20 周日 波士顿”）
export async function makeRecap({ photos, music, perPhoto = 1.8, onProgress = () => {} }) {
  const mime = pickMime();
  if (mime === null) throw new Error('这个浏览器不支持录制视频');
  await Promise.all(['900 120px "Big Shoulders Display"', '900 60px "Noto Sans SC"', '600 52px "IBM Plex Mono"'].map((f) => document.fonts.load(f).catch(() => {})));
  const imgs = [];
  for (const p of photos) {
    try { imgs.push({ ...p, img: await loadBitmap(p.blob) }); } catch (e) { /* 解不开的格式（例如部分 HEIC）跳过 */ }
  }
  if (!imgs.length) throw new Error('没有能读取的照片');
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const grain = ctx.createPattern(grainTile(), 'repeat');
  const TITLE = 2.4, END = 2.6, FADE = 0.4;
  const total = TITLE + imgs.length * perPhoto + END;
  const stream = canvas.captureStream(30);
  let ac = null, src = null;
  if (music) {
    try {
      ac = new AudioContext();
      const buf = await ac.decodeAudioData(await (await fetch(music)).arrayBuffer());
      src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const gain = ac.createGain(); gain.gain.setValueAtTime(0, ac.currentTime);
      gain.gain.linearRampToValueAtTime(0.8, ac.currentTime + 0.5);
      gain.gain.setValueAtTime(0.8, ac.currentTime + total - 1.8);
      gain.gain.linearRampToValueAtTime(0, ac.currentTime + total);
      const dest = ac.createMediaStreamDestination();
      src.connect(gain).connect(dest);
      stream.addTrack(dest.stream.getAudioTracks()[0]);
    } catch (e) { ac = null; src = null; }
  }
  const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 8000000 } : { videoBitsPerSecond: 8000000 });
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  const done = new Promise((resolve) => { rec.onstop = resolve; });

  const text = (s, x, y, font, color, align = 'center', glow = null) => {
    ctx.font = font; ctx.textAlign = align; ctx.fillStyle = color;
    if (glow) { ctx.shadowColor = glow; ctx.shadowBlur = 18; }
    ctx.fillText(s, x, y); ctx.shadowBlur = 0;
  };
  const first = imgs[0].takenAt, last = imgs[imgs.length - 1].takenAt;

  function draw(t) {
    ctx.fillStyle = '#0B1F1E'; ctx.fillRect(0, 0, W, H);
    if (t < TITLE) {
      const a = Math.min(1, t / 0.6) * (t > TITLE - 0.4 ? (TITLE - t) / 0.4 : 1);
      ctx.globalAlpha = a;
      text('EAST COAST', W / 2, 820, '900 150px "Big Shoulders Display"', '#FF4A3D', 'center', 'rgba(255,59,48,.8)');
      text('HOOPS', W / 2, 1010, '900 230px "Big Shoulders Display"', '#FF4A3D', 'center', 'rgba(255,59,48,.8)');
      text('美东圣诞篮球行', W / 2, 1150, '900 64px "Noto Sans SC"', '#F1E6CF');
      text(`${stampOf(first)} — ${stampOf(last).slice(4)}`, W / 2, 1250, '600 48px "IBM Plex Mono"', '#FFB238');
      ctx.globalAlpha = 1;
    } else if (t < total - END) {
      const pt = t - TITLE; const i = Math.min(imgs.length - 1, Math.floor(pt / perPhoto)); const k = (pt - i * perPhoto) / perPhoto;
      if (i > 0 && k * perPhoto < FADE) cover(ctx, imgs[i - 1].img, 1.08, 1);
      cover(ctx, imgs[i].img, 1 + 0.08 * k, i > 0 ? Math.min(1, (k * perPhoto) / FADE) : 1);
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      text(stampOf(imgs[i].takenAt), W - 90, H - 150, '600 56px "IBM Plex Mono"', '#FF7A1A', 'right', 'rgba(255,110,0,.9)');
      if (imgs[i].label && k * perPhoto < 1.4) {
        ctx.fillStyle = 'rgba(11,31,30,.72)'; ctx.fillRect(70, 150, 700, 130);
        text(imgs[i].label, 110, 238, '900 60px "Noto Sans SC"', '#F1E6CF', 'left');
      }
    } else {
      const a = Math.min(1, (t - (total - END)) / 0.6) * (t > total - 0.6 ? (total - t) / 0.6 : 1);
      ctx.globalAlpha = Math.max(0, a);
      text('两人 14 天 5 座城市', W / 2, 900, '900 72px "Noto Sans SC"', '#F1E6CF');
      text('EAST COAST HOOPS', W / 2, 1040, '900 120px "Big Shoulders Display"', '#FF4A3D', 'center', 'rgba(255,59,48,.8)');
      ctx.globalAlpha = 1;
    }
    ctx.globalAlpha = 0.07; ctx.fillStyle = grain; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
  }

  draw(0);
  rec.start(1000);
  if (src) src.start();
  const t0 = performance.now();
  await new Promise((resolve) => {
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      if (t >= total) return resolve();
      draw(t); onProgress(t / total);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  rec.stop();
  await done;
  if (src) try { src.stop(); } catch (e) { /* 已停止 */ }
  if (ac) ac.close();
  imgs.forEach((x) => x.img.close && x.img.close());
  const type = (mime || 'video/webm').split(';')[0];
  return { blob: new Blob(chunks, { type }), type, seconds: total };
}
