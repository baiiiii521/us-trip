// 从 JPEG 的 EXIF 里读拍摄时间（DateTimeOriginal）。读不到就用文件修改时间。
// 只解析需要的那一小段，不依赖第三方库。

export function exifDate(view) {
  if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) return null;
  let off = 2;
  while (off + 4 <= view.byteLength) {
    const marker = view.getUint16(off);
    if ((marker & 0xFF00) !== 0xFF00) return null;
    if (marker === 0xFFDA || marker === 0xFFD9) return null; // 图像数据开始，后面没有 EXIF 了
    const len = view.getUint16(off + 2);
    if (marker === 0xFFE1 && off + 10 <= view.byteLength && view.getUint32(off + 4) === 0x45786966) {
      try { return parseTiff(view, off + 10); } catch (e) { return null; }
    }
    off += 2 + len;
  }
  return null;
}

function parseTiff(v, t) {
  const le = v.getUint16(t) === 0x4949;
  const u16 = (o) => v.getUint16(o, le);
  const u32 = (o) => v.getUint32(o, le);
  const find = (ifd, tag) => {
    const n = u16(ifd);
    for (let i = 0; i < n; i++) { const e = ifd + 2 + i * 12; if (u16(e) === tag) return e; }
    return null;
  };
  const ascii = (e) => {
    const cnt = u32(e + 4);
    const at = cnt > 4 ? t + u32(e + 8) : e + 8;
    let s = '';
    for (let i = 0; i < cnt - 1 && at + i < v.byteLength; i++) s += String.fromCharCode(v.getUint8(at + i));
    return s;
  };
  const ifd0 = t + u32(t + 4);
  let raw = null;
  const exifPtr = find(ifd0, 0x8769);
  if (exifPtr) {
    const sub = t + u32(exifPtr + 8);
    const e = find(sub, 0x9003) || find(sub, 0x9004);
    if (e) raw = ascii(e);
  }
  if (!raw) { const e = find(ifd0, 0x0132); if (e) raw = ascii(e); }
  const m = raw && /^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(raw);
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : null;
}

export async function photoDate(file) {
  try {
    const buf = await file.slice(0, 256 * 1024).arrayBuffer();
    const d = exifDate(new DataView(buf));
    if (d && !isNaN(d)) return d;
  } catch (e) { /* 不是 JPEG 或读不了 */ }
  return new Date(file.lastModified || Date.now());
}

// 拍摄日期 → 行程里的哪一天（'1220'），不在行程里返回 'other'
export function tripDayOf(date) {
  if (date.getFullYear() !== 2026 || date.getMonth() !== 11) return 'other';
  const d = date.getDate();
  return d >= 18 && d <= 31 ? '12' + String(d).padStart(2, '0') : 'other';
}
