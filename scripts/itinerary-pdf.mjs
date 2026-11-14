// 生成给边检看的行程单 PDF（英文，A4 两页）。内容必须和真实行程一致：边检问到住哪、怎么走，回答和单子对得上最重要。
// 数据来自站内数据文件（flights.js / hotels.js），但一律翻成英文——边检只读英文。
// 护照号、PNR、票号、联系邮箱、公寓房号属于个人信息，放在 private/itinerary.json（不进 git、不上网站），
// 格式见 private/itinerary.example.json。
//   node scripts/itinerary-pdf.mjs
// 输出：~/Desktop/us-trip/US-Itinerary-2026-12.pdf（同目录留 html 方便改样式）。
// 不要把生成的 PDF 放进 public/，那里的文件任何人都能下载。
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { FLIGHTS } from '../src/data/flights.js';
import { HOTELS } from '../src/data/hotels.js';

const OUT_DIR = process.env.OUT_DIR || join(homedir(), 'Desktop', 'us-trip');
const PDF = join(OUT_DIR, 'US-Itinerary-2026-12.pdf');
const HTML = join(OUT_DIR, 'US-Itinerary-2026-12.html');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const PRIVATE_FILE = new URL('../private/itinerary.json', import.meta.url);
const EXAMPLE_FILE = new URL('../private/itinerary.example.json', import.meta.url);
if (!existsSync(PRIVATE_FILE)) console.warn('没找到 private/itinerary.json，先用示例占位生成。复制 private/itinerary.example.json 改成真实信息。');
const PRIV = JSON.parse(readFileSync(existsSync(PRIVATE_FILE) ? PRIVATE_FILE : EXAMPLE_FILE, 'utf8'));
const TRAVELERS = PRIV.travellers;

// 机场和航司的英文写法（数据文件里是中文，这里统一翻）
const AIRPORT = {
  CGO: 'Zhengzhou Xinzheng (CGO), Terminal 2',
  FOC: 'Fuzhou Changle (FOC), Terminal 2',
  JFK: 'New York JFK (JFK), Terminal 4',
  EWR: 'Newark Liberty (EWR), Terminal C',
  LAX: 'Los Angeles (LAX), Terminal 7',
  PEK: 'Beijing Capital (PEK), Terminal 3'
};
const AIRLINE = { out: 'Xiamen Air', back: 'United Airlines' };

// 票面日期 → 英文日期（只列实际用到的四段）
const FLIGHT_EN = [
  { flight: 'MF8280', airline: 'Xiamen Air', dep: 'Thu 17 Dec 2026, 13:45', depAt: 'CGO', arr: 'Thu 17 Dec 2026, 15:55', arrAt: 'FOC' },
  { flight: 'MF849', airline: 'Xiamen Air', dep: 'Fri 18 Dec 2026, 09:20', depAt: 'FOC', arr: 'Fri 18 Dec 2026, 10:55', arrAt: 'JFK' },
  { flight: 'UA2434', airline: 'United Airlines', dep: 'Thu 31 Dec 2026, 06:00', depAt: 'EWR', arr: 'Thu 31 Dec 2026, 09:12', arrAt: 'LAX' },
  { flight: 'UA771', airline: 'United Airlines', dep: 'Thu 31 Dec 2026, 23:35', depAt: 'LAX', arr: 'Sat 2 Jan 2027, 06:35', arrAt: 'PEK' }
];

const REFS = PRIV.flightRefs;

// 酒店地址（英文，按订单原文；纽约公寓地址待房东确认）
const HOTEL_EN = {
  bos: ['Hampton Inn &amp; Suites Boston Crosstown Center', '811 Massachusetts Ave, Boston, MA 02118', '+1 617-445-6400'],
  dc: ['Hilton Garden Inn Washington DC/U.S. Capitol', '1225 First St NE, Washington, DC 20002', '+1 202-408-4870'],
  phl: ['Wyndham Philadelphia Historic District', '400 Arch St, Philadelphia, PA 19106', '+1 215-923-8660'],
  // 纽约：实际住的 AVA Fort Greene 公寓（2026-11-14 确定）。房号从 private/itinerary.json 读。
  nyc: ['AVA Fort Greene' + (PRIV.nycUnit ? ', ' + esc0(PRIV.nycUnit) : ''), '343 Gold St, Brooklyn, NY 11201', PRIV.nycContact || '']
};

function esc0(x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

const DAYS = [
  ['Fri 18 Dec', 'New York → Boston', 'Arrive JFK 10:55 on MF849 from Fuzhou; pick up rental car at JFK; drive to Boston; check in at hotel in the South End.'],
  ['Sat 19 Dec', 'Boston', 'Harvard University, MIT, Beacon Hill, Boston Common, Quincy Market.'],
  ['Sun 20 Dec', 'Boston', 'USS Constitution at Charlestown Navy Yard; North End; Boston Celtics game, 20:00, TD Garden.'],
  ['Mon 21 Dec', 'Boston → Washington, D.C.', 'Drive to Washington; check in; White House and National Christmas Tree.'],
  ['Tue 22 Dec', 'Washington, D.C.', 'U.S. Capitol tour, Library of Congress, National Mall and memorials; Washington Wizards game, 19:00.'],
  ['Wed 23 Dec', 'Washington → Philadelphia', 'Drive to Philadelphia; Independence Hall, Liberty Bell, Reading Terminal Market; Philadelphia 76ers game, 19:30.'],
  ['Thu 24 Dec', 'Philadelphia → New York', 'Drive to Brooklyn; return rental car at JFK; check in at apartment in Fort Greene, Brooklyn; Fifth Avenue and Rockefeller Center Christmas Tree.'],
  ['Fri 25 Dec', 'New York', 'Christmas Day: Central Park, Chinatown, Dyker Heights Christmas lights.'],
  ['Sat 26 Dec', 'New York', 'Brooklyn Bridge, DUMBO, Brooklyn Heights Promenade; Brooklyn Nets game, 18:00, Barclays Center.'],
  ['Sun 27 Dec', 'New York', 'Metropolitan Museum of Art, Grand Central Terminal, Times Square.'],
  ['Mon 28 Dec', 'New York', 'Staten Island Ferry, Wall Street, 9/11 Memorial, High Line and Chelsea Market.'],
  ['Tue 29 Dec', 'New York', 'Flexible day for sightseeing and rest.'],
  ['Wed 30 Dec', 'New York', 'Shopping and last sightseeing; early night before the early flight.'],
  ['Thu 31 Dec', 'New York → Los Angeles → Beijing', 'UA2434 EWR 06:00 → LAX 09:12; afternoon Santa Monica and Venice Beach; UA771 LAX 23:35 → Beijing.']
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const flightRows = FLIGHT_EN.map((f) => `
  <tr>
    <td class="nowrap"><b class="mono">${esc(f.flight)}</b><br><span class="dim xs">${esc(f.airline)}</span></td>
    <td><span class="mono">${esc(f.dep)}</span><br><span class="dim">${esc(AIRPORT[f.depAt])}</span></td>
    <td><span class="mono">${esc(f.arr)}</span><br><span class="dim">${esc(AIRPORT[f.arrAt])}</span></td>
  </tr>`).join('');

// 订单号从 private/itinerary.json 读（例如 { "nyc": "Airbnb HMXXXXXXX" }）
const HOTEL_REF = PRIV.hotelRefs || {};

const hotelRows = HOTELS.map((h) => {
  const [name, addr, phone] = HOTEL_EN[h.city];
  const ref = HOTEL_REF[h.city] ? `<br><span class="dim xs">${esc(HOTEL_REF[h.city])}</span>` : '';
  return `
  <tr>
    <td class="nowrap">${esc(h.checkIn)} – ${esc(h.checkOut)}</td>
    <td><b>${name}</b><br><span class="dim">${addr}</span>${phone ? ` <span class="dim xs">· ${phone}</span>` : ''}${ref}</td>
    <td class="nowrap right">${h.nights} night${h.nights > 1 ? 's' : ''}</td>
  </tr>`;
}).join('');

const dayRows = DAYS.map(([d, city, plan]) => `
  <tr><td class="nowrap">${esc(d)}</td><td>${esc(city)}</td><td>${esc(plan)}</td></tr>`).join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Travel Itinerary — United States, 18–31 December 2026</title>
<style>
  @page { size: A4; margin: 13mm 14mm 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font: 9.1pt/1.42 "Helvetica Neue", Helvetica, Arial, sans-serif; color: #111; }
  h1 { font-size: 19pt; margin: 0; letter-spacing: .2px; }
  h2 { font-size: 8.2pt; text-transform: uppercase; letter-spacing: 1.2px; color: #666; margin: 11px 0 4px;
       border-bottom: .8px solid #ddd; padding-bottom: 2px; font-weight: 700; }
  .sub { font-size: 9.6pt; color: #333; margin: 3px 0 0; }
  .kicker { font-size: 7.6pt; letter-spacing: 1.6px; text-transform: uppercase; color: #999; margin: 0 0 3px; }
  .head { border-bottom: 1.6px solid #111; padding-bottom: 6px; }
  .head .right { float: right; text-align: right; font-size: 8.2pt; color: #555; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; }
  table.days { table-layout: fixed; }
  table.days td:nth-child(1), table.days th:nth-child(1) { width: 88px; padding-right: 12px; }
  table.days td:nth-child(2), table.days th:nth-child(2) { width: 150px; padding-right: 14px; }
  th { text-align: left; font-size: 7.6pt; text-transform: uppercase; letter-spacing: .6px; color: #777;
       font-weight: 600; padding: 2px 6px 3px 0; border-bottom: .8px solid #ddd; }
  td { padding: 4px 6px 4px 0; border-bottom: .6px solid #eee; vertical-align: top; }
  tr:last-child td { border-bottom: 0; }
  .mono { font-family: "SF Mono", Menlo, Consolas, monospace; font-size: 8.6pt; }
  .dim { color: #666; }
  .xs { font-size: 7.8pt; }
  .nowrap { white-space: nowrap; }
  .right { text-align: right; padding-right: 0; }
  .facts { display: grid; grid-template-columns: 1fr; gap: 2px; }
  .fact { display: grid; grid-template-columns: 82px 1fr; gap: 8px; }
  .fact dd { text-wrap: pretty; }
  .fact dt { color: #666; }
  .fact dd { margin: 0; }
  ul.refs { margin: 3px 0 0; padding-left: 14px; font-size: 8.2pt; color: #333; }
  ul.refs li { margin-bottom: 1px; }
  .box { border: .8px solid #ddd; border-radius: 3px; padding: 7px 10px; background: #fafafa; font-size: 8.4pt; }
  .box p { margin: 0 0 4px; } .box p:last-child { margin: 0; }
  .page2 { page-break-before: always; }
  .foot { margin-top: 10px; padding-top: 5px; border-top: .8px solid #ddd; font-size: 7.4pt; color: #888;
          display: flex; justify-content: space-between; }
  .sig { margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; font-size: 8.4pt; color: #555; }
  .sig div { border-top: .8px solid #888; padding-top: 4px; }
</style>
</head>
<body>

<div class="head">
  <div class="right">
    Prepared ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}<br>
    All reservations confirmed
  </div>
  <p class="kicker">Tourist travel · presented on arrival</p>
  <h1>Travel Itinerary</h1>
  <p class="sub">United States · 18 – 31 December 2026 · New York, Boston, Washington D.C., Philadelphia, Los Angeles</p>
</div>

<h2>Travellers</h2>
<table>
  <tr><th>Name (as in passport)</th><th>Passport No.</th><th>Nationality</th></tr>
  ${TRAVELERS.map((t) => `<tr><td><b>${esc(t.name)}</b></td><td class="mono">${esc(t.passport)}</td><td>China</td></tr>`).join('')}
</table>

<h2>Trip at a glance</h2>
<div class="facts">
  <div class="fact"><dt>Purpose</dt><dd>Tourism and sightseeing; attending NBA games</dd></div>
  <div class="fact"><dt>Entry</dt><dd>18 Dec 2026, New York JFK, on MF849 from Fuzhou</dd></div>
  <div class="fact"><dt>Exit</dt><dd>31 Dec 2026, Newark → Los Angeles → Beijing</dd></div>
  <div class="fact"><dt>Stay</dt><dd>13 nights, all accommodation pre-booked</dd></div>
  <div class="fact"><dt>First night</dt><dd>Hampton Inn &amp; Suites Boston Crosstown Center, 811 Massachusetts Ave, Boston, MA 02118</dd></div>
  <div class="fact"><dt>Return</dt><dd>Confirmed, United Airlines${PRIV.returnPnr ? ' PNR ' + esc(PRIV.returnPnr) : ''}</dd></div>
  <div class="fact"><dt>On arrival</dt><dd>Rental car picked up at JFK on 18 Dec, driven to Boston (approx. 4–5 hours)</dd></div>
  <div class="fact"><dt>Travel party</dt><dd>2 adults travelling together, no children</dd></div>
</div>

<h2>Flights</h2>
<table>
  <tr><th style="width:96px">Flight</th><th>Departure</th><th>Arrival</th></tr>
  ${flightRows}
</table>
<ul class="refs">${REFS.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>

<h2>Accommodation</h2>
<table>
  <tr><th style="width:96px">Dates</th><th>Hotel and address</th><th style="width:52px" class="right">Nights</th></tr>
  ${hotelRows}
</table>
<p class="dim xs" style="margin:4px 0 0">All stays are booked and prepaid; confirmation vouchers available on request.</p>

<div class="foot"><span>Travel Itinerary · ${TRAVELERS.map((t) => esc(t.name)).join(' &amp; ')}</span><span>Page 1 of 2</span></div>

<div class="page2">
<h2>Day-by-day outline</h2>
<table class="days">
  <colgroup><col style="width:88px"><col style="width:150px"><col></colgroup>
  <tr><th>Date</th><th>City</th><th>Plan</th></tr>
  ${dayRows}
</table>

<h2>Notes</h2>
<div class="box">
  <p><b>Luggage:</b> one checked bag (23 kg) and one carry-on per traveller.</p>
  <p><b>Transport within the United States:</b> rental car (self-drive) from 18 to 24 December, picked up and returned at New York JFK; subway and regional rail inside the cities; no driving in New York City after 24 December.</p>
  ${PRIV.contact ? `<p><b>Contact:</b> ${esc(PRIV.contact)}</p>` : ''}
</div>

<h2>Declaration</h2>
<p class="dim xs" style="margin:0 0 0">This itinerary was prepared by the travellers for their own trip and is presented for inspection purposes only. All bookings listed are paid and confirmed. The travellers hold return tickets and do not intend to remain in the United States beyond 31 December 2026.</p>
<div class="sig">
  ${TRAVELERS.map((t) => `<div>Signature — ${esc(t.name)}</div>`).join('')}
</div>

<div class="foot"><span>Travel Itinerary · 18–31 December 2026</span><span>Page 2 of 2</span></div>
</div>

</body>
</html>`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML, html, 'utf8');
execFileSync(CHROME, [
  '--headless=new', '--disable-gpu', '--no-pdf-header-footer',
  '--virtual-time-budget=3000',
  `--print-to-pdf=${PDF}`, `file://${HTML}`
], { stdio: 'ignore' });
console.log('PDF →', PDF);
