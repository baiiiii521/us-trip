// 每日分享卡：1080×1440 竖图（朋友圈 / 小红书 3:4），有照片用照片，没有就用城市配色。
const W = 1080, H = 1440;
const CITY_BG = {
  bos: ['#7FA7DD', '#1E7A4C'], dc: ['#9DBBE6', '#2B4C8C'], phl: ['#F6CFD6', '#1D6FB8'],
  nyc: ['#F3C3D2', '#C04A0A'], la: ['#FFB38A', '#0E8A8A']
};

// 中文按字、英文按词换行，最多 maxLines 行
export function wrapLines(ctx, text, maxWidth, maxLines) {
  const tokens = text.match(/[A-Za-z0-9'’.\-/:]+|\s+|./gu) || [];
  const lines = []; let line = '';
  for (const tk of tokens) {
    const test = line + tk;
    if (ctx.measureText(test).width > maxWidth && line.trim()) {
      lines.push(line.trimEnd()); line = tk.trimStart();
      if (lines.length === maxLines) break;
    } else line = test;
  }
  if (lines.length < maxLines && line.trim()) lines.push(line.trimEnd());
  if (lines.length === maxLines) {
    const rest = tokens.join('').slice(lines.join('').replace(/\s/g, '').length);
    if (rest.trim()) {
      let l = lines[maxLines - 1];
      while (ctx.measureText(l + '…').width > maxWidth && l.length) l = l.slice(0, -1);
      lines[maxLines - 1] = l + '…';
    }
  }
  return lines;
}

export async function drawShareCard(canvas, { day, cityZh, cityEn, items, photo, weatherText }) {
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  await Promise.all(['800 160px "Big Shoulders Display"', '900 64px "Noto Sans SC"', '500 36px "Noto Sans SC"', '600 40px "IBM Plex Mono"'].map((f) => document.fonts.load(f).catch(() => {})));
  const [c1, c2] = CITY_BG[day.city] || ['#EEF1F4', '#16202B'];
  // 背景：米白纸面
  ctx.fillStyle = '#FFF8EE'; ctx.fillRect(0, 0, W, H);
  // 上半：照片或城市渐变
  const PH = 760;
  ctx.save(); ctx.beginPath(); ctx.roundRect(48, 48, W - 96, PH, 28); ctx.clip();
  if (photo) {
    const s = Math.max((W - 96) / photo.width, PH / photo.height);
    const w = photo.width * s, h = photo.height * s;
    ctx.drawImage(photo, 48 + (W - 96 - w) / 2, 48 + (PH - h) / 2, w, h);
  } else {
    const g = ctx.createLinearGradient(0, 48, 0, 48 + PH); g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(48, 48, W - 96, PH);
    ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = '800 150px "Big Shoulders Display"'; ctx.textAlign = 'left';
    ctx.fillText(cityEn.toUpperCase(), 96, 48 + PH - 70);
  }
  ctx.restore();
  // 胶片日期戳
  const [m, d] = day.md.split('/');
  ctx.font = '600 44px "IBM Plex Mono"'; ctx.textAlign = 'right'; ctx.fillStyle = '#FF7A1A'; ctx.shadowColor = 'rgba(255,110,0,.9)'; ctx.shadowBlur = 16;
  ctx.fillText(`'26 ${m.padStart(2, '0')} ${d.padStart(2, '0')}`, W - 90, 48 + PH - 40); ctx.shadowBlur = 0;
  // 下半：日期、城市、标题、三条安排
  ctx.textAlign = 'left'; ctx.fillStyle = '#16202B';
  ctx.font = '800 150px "Big Shoulders Display"'; ctx.fillText(day.md, 64, 980);
  const mdW = ctx.measureText(day.md).width;
  ctx.font = '500 40px "Noto Sans SC"'; ctx.fillStyle = '#5E6A76';
  ctx.fillText(`${day.wd}  ${cityZh}${weatherText ? '  ' + weatherText : ''}`, 64 + mdW + 28, 970);
  ctx.fillStyle = '#16202B'; ctx.font = '900 60px "Noto Sans SC"';
  wrapLines(ctx, day.title, W - 128, 2).forEach((l, i) => ctx.fillText(l, 64, 1070 + i * 74));
  ctx.font = '500 34px "Noto Sans SC"'; ctx.fillStyle = '#33404C';
  items.slice(0, 3).forEach((it, i) => {
    const y = 1190 + i * 54;
    ctx.font = '600 32px "IBM Plex Mono"'; ctx.fillStyle = '#C04A0A'; ctx.fillText(it.t, 64, y);
    ctx.font = '500 34px "Noto Sans SC"'; ctx.fillStyle = '#33404C';
    ctx.fillText(wrapLines(ctx, it.text, W - 128 - 150, 1)[0] || '', 64 + 150, y);
  });
  // 页脚
  ctx.fillStyle = '#C04A0A'; ctx.beginPath(); ctx.arc(84, H - 64, 18, 0, Math.PI * 2); ctx.fill();
  ctx.font = '800 40px "Big Shoulders Display"'; ctx.fillStyle = '#16202B'; ctx.fillText('EAST COAST HOOPS', 116, H - 50);
  ctx.font = '500 30px "Noto Sans SC"'; ctx.fillStyle = '#5E6A76'; ctx.textAlign = 'right'; ctx.fillText('美东圣诞篮球行', W - 64, H - 52);
  return canvas;
}
