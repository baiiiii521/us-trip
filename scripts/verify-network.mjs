#!/usr/bin/env node
// 联网核对（需要外网）：景点照片、天气、汇率三个实时数据源。
// 用法：node scripts/verify-network.mjs        （只核对，不改文件）
//       node scripts/verify-network.mjs --json （输出机器可读结果）
// 说明：请求参数和网页里的 src/lib/photos.js 保持一致，解析复用同一套纯函数，
//       所以这里报"缺图"，就是真机打开时也会显示占位明信片。
import { POIS } from '../src/data/pois.js';
import { parsePageImages, parseCredits, parseCommonsFiles } from '../src/lib/photos.js';
import { COORDS, parseWeather, weatherFor, alertFor } from '../src/lib/weather.js';
import { parseRate } from '../src/lib/money.js';

const JSON_OUT = process.argv.includes('--json');
const log = (...a) => { if (!JSON_OUT) console.log(...a); };

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const chunks = (arr, n) => arr.reduce((o, x, i) => (i % n ? o[o.length - 1].push(x) : o.push([x]), o), []);

async function getJson(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'hoops-trip-verify/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

const qs = (params) => '?' + new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params });

// ── 1. 景点照片 ─────────────────────────────────────────────
async function checkPhotos() {
  const titles = [...new Set(POIS.map((p) => p.wiki).filter(Boolean))];
  const found = {};
  for (const group of chunks(titles, 45)) {
    const json = await getJson(WIKI_API + qs({
      action: 'query', redirects: '1', prop: 'pageimages', piprop: 'thumbnail|name',
      pithumbsize: '960', pilimit: '50', titles: group.join('|')
    }));
    Object.assign(found, parsePageImages(json, group));
  }
  const files = Object.entries(Object.fromEntries(POIS.filter((p) => p.wiki && p.photoFile).map((p) => [p.wiki, p.photoFile])))
    .filter(([k]) => !found[k]);
  if (files.length) {
    const req = files.map(([key, file]) => ({ key, file }));
    for (const group of chunks(req, 45)) {
      const json = await getJson(COMMONS_API + qs({
        action: 'query', prop: 'imageinfo', iiprop: 'extmetadata|url|size', iiurlwidth: '960',
        iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
        titles: group.map((r) => 'File:' + r.file).join('|')
      }));
      Object.assign(found, parseCommonsFiles(json, group));
    }
  }
  // 许可信息走和网页一样的第二次查询（Commons imageinfo）
  const fileNames = [...new Set(Object.values(found).map((x) => x.file).filter(Boolean))];
  const credits = {};
  for (const group of chunks(fileNames, 45)) {
    const json = await getJson(COMMONS_API + qs({
      action: 'query', prop: 'imageinfo', iiprop: 'extmetadata|url',
      iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl',
      titles: group.map((x) => 'File:' + x).join('|')
    }));
    Object.assign(credits, parseCredits(json));
  }
  for (const t of Object.keys(found)) {
    const c = credits[(found[t].file || '').replace(/ /g, '_')];
    if (c) Object.assign(found[t], c);
  }
  const missing = POIS.filter((p) => !(p.photo || (p.wiki && found[p.wiki])));
  const noCredit = POIS.filter((p) => p.wiki && found[p.wiki] && !found[p.wiki].license);
  return {
    total: POIS.length,
    ok: POIS.length - missing.length,
    missing: missing.map((p) => `${p.id}（${p.name}）${p.wiki || '无 wiki 字段'}`),
    noCredit: noCredit.map((p) => p.id),
    sample: found[titles[0]] ? found[titles[0]].src : null
  };
}

// ── 2. 天气（Open-Meteo）────────────────────────────────────
async function checkWeather() {
  const out = {};
  const errors = [];
  await Promise.all(Object.entries(COORDS).map(async ([city, [lat, lon, tz]]) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=${encodeURIComponent(tz)}&forecast_days=16&daily=weather_code,temperature_2m_max,temperature_2m_min,snowfall_sum,rain_sum,precipitation_probability_max`;
    try {
      const j = await getJson(url);
      Object.assign(out, parseWeather(city, j));
    } catch (e) { errors.push(`${city}: ${e.message}`); }
  }));
  const dates = Object.keys(out).map((k) => k.split('|')[1]).sort();
  // 行程 12/18–12/31 是否落在预报窗口里
  const tripDates = ['2026-12-18', '2026-12-20', '2026-12-25', '2026-12-31'];
  const covered = tripDates.filter((d) => dates.includes(d));
  const sample = out[`nyc|${dates[0]}`] || null;
  return { cities: Object.keys(COORDS).length, days: Math.round(dates.length / Object.keys(COORDS).length), from: dates[0], to: dates[dates.length - 1], coveredTripDates: covered, sample, alert: sample ? alertFor(sample) : null, errors };
}

// ── 3. 汇率（Frankfurter）───────────────────────────────────
async function checkRate() {
  const urls = [
    'https://api.frankfurter.dev/v2/rates?base=USD&quotes=CNY',
    'https://api.frankfurter.dev/v1/latest?from=USD&to=CNY'
  ];
  const tries = [];
  for (const url of urls) {
    try {
      const j = await getJson(url);
      const rate = parseRate(j);
      tries.push({ url, ok: !!rate, rate });
      if (rate) return { rate, url, tries };
    } catch (e) { tries.push({ url, ok: false, error: e.message }); }
  }
  return { rate: null, tries };
}

// ── 汇总 ────────────────────────────────────────────────────
const photos = await checkPhotos();
const weather = await checkWeather();
const fx = await checkRate();
const result = { photos, weather, rate: fx };

if (JSON_OUT) {
  console.log(JSON.stringify(result, null, 2));
} else {
  log(`景点照片：${photos.ok}/${photos.total} 有图`);
  if (photos.missing.length) log('  缺图：\n' + photos.missing.map((m) => '   - ' + m).join('\n'));
  if (photos.noCredit.length) log('  没有许可信息：' + photos.noCredit.join('、'));
  log(`天气：${weather.cities} 个城市，预报 ${weather.from} → ${weather.to}（${weather.days} 天）`);
  log(`  行程日期落在预报窗口：${weather.coveredTripDates.length ? weather.coveredTripDates.join('、') : '无（离出发还早，页面显示 12 月平均）'}`);
  if (weather.sample) log(`  样例：${weather.sample.hi}°/${weather.sample.lo}° code ${weather.sample.code}，预案 ${weather.alert ? weather.alert.text : '无'}`);
  if (weather.errors.length) log('  错误：' + weather.errors.join('; '));
  log(`汇率：${fx.rate ? `1 USD = ¥${fx.rate.toFixed(4)}（${fx.url}）` : '取不到'}`);
}

const bad = photos.missing.length || weather.errors.length || !fx.rate;
process.exit(bad ? 1 : 0);
