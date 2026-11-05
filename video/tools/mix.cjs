// 混音：BGM（从第一拍裁起）+ 按导演稿时间点的音效，合进无声视频。
// 用法：node tools/mix.cjs <无声视频.mp4> <输出.mp4> [broadcast|citypop]
// 规则来自 huashu-design audio-design-rules.md：BGM 0.45、低通 4 kHz；SFX 高通 800 Hz；amix normalize=0；
// BGM 0.3 秒淡入、1.5 秒淡出。音效峰值先统一到 -3 dB，避免有的听不见。
const { execFileSync, spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const A = (f) => path.join(ROOT, 'audio', f);
// 两套预设：broadcast（方向二）、citypop（方向三）。时间点来自各自的导演稿
const BEAT3 = 60 / 119, BAR3 = BEAT3 * 4;
const PRESETS = {
  broadcast: {
    bgm: 'bgm-ad.mp3', offset: 0.255, dur: 30.72,
    cues: [
      [0.00, 'transition-whoosh'], [0.96, 'impact-logo-reveal'], [3.36, 'transition-whoosh-fast'],
      [3.84, 'container-card-snap'], [4.32, 'container-card-snap'], [4.80, 'container-card-snap'],
      [5.52, 'transition-swipe-horizontal'], [6.72, 'ui-focus'], [8.64, 'ui-focus'], [10.56, 'ui-focus'],
      [11.28, 'transition-slide-in'], [12.48, 'transition-whoosh'], [14.40, 'transition-whoosh'], [16.32, 'transition-whoosh'],
      [18.24, 'container-stack-collapse'], [19.00, 'magic-sparkle'], [24.96, 'impact-drop-thud'], [26.88, 'impact-logo-reveal-v2']
    ]
  },
  citypop: {
    bgm: 'bgm-tech.mp3', offset: 0.07, dur: 15 * BAR3,
    cues: [
      [1.60, 'magic-sparkle'], [2 * BAR3 - 0.2, 'transition-dissolve'],
      [2 * BAR3, 'ui-click-soft'], [2 * BAR3 + BEAT3, 'ui-click-soft'], [2 * BAR3 + 2 * BEAT3, 'ui-click-soft'],
      [3 * BAR3 + 2 * BEAT3, 'ui-tap-finger'], [3 * BAR3 + 6 * BEAT3, 'ui-tap-finger'], [3 * BAR3 + 10 * BEAT3 - 1.0, 'transition-whoosh'],
      [6 * BAR3 - 0.2, 'transition-dissolve'], [6 * BAR3, 'container-card-flip'], [7 * BAR3, 'container-card-flip'], [8 * BAR3, 'container-card-flip'],
      [9 * BAR3, 'magic-sparkle'], [12 * BAR3 - 0.2, 'transition-dissolve'], [14 * BAR3, 'impact-logo-reveal-v2']
    ]
  }
};

// 读一个音频文件的峰值（dB）
function peakDb(file) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /max_volume: (-?[\d.]+) dB/.exec(r.stderr);
  return m ? parseFloat(m[1]) : 0;
}

const [video, out, presetName = 'broadcast'] = process.argv.slice(2);
if (!video || !out || !PRESETS[presetName]) { console.log('usage: node tools/mix.cjs <silent.mp4> <out.mp4> [broadcast|citypop]'); process.exit(1); }
const { bgm, offset: BGM_OFFSET, dur: DUR, cues: CUES } = PRESETS[presetName];

const inputs = ['-i', path.resolve(video), '-i', A(bgm)];
const parts = [];
const labels = [];
const peaks = {};
CUES.forEach(([t, name], i) => {
  const f = A(`sfx/${name}.mp3`);
  if (!(name in peaks)) peaks[name] = peakDb(f);
  inputs.push('-i', f);
  const gain = (-3 - peaks[name]).toFixed(1);
  const ms = Math.round(t * 1000);
  parts.push(`[${i + 2}:a]volume=${gain}dB,adelay=${ms}|${ms}[c${i}]`);
  labels.push(`[c${i}]`);
});
parts.push(`${labels.join('')}amix=inputs=${labels.length}:duration=longest:normalize=0,highpass=f=800,volume=1.0[sfx]`);
parts.push(`[1:a]atrim=start=${BGM_OFFSET}:duration=${DUR},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.3,afade=t=out:st=${(DUR - 1.5).toFixed(2)}:d=1.5,lowpass=f=4000,volume=0.45[bgm]`);
parts.push(`[bgm][sfx]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]`);

execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', parts.join(';'),
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', String(DUR), '-movflags', '+faststart', path.resolve(out)], { stdio: 'inherit' });
console.log('wrote', out);
