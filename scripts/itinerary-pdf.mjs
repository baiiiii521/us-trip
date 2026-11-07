// 生成给边检看的行程单 PDF（英文，A4 两页）。
// 数据来自站内数据文件（flights.js / hotels.js），但一律翻成英文——边检只读英文。
//   node scripts/itinerary-pdf.mjs
// 输出：~/Desktop/us-trip/US-Itinerary-2026-12.pdf（同目录留 html 方便改样式）
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { FLIGHTS } from '../src/data/flights.js';
import { HOTELS } from '../src/data/hotels.js';

const OUT_DIR = join(homedir(), 'Desktop', 'us-trip');
const PDF = join(OUT_DIR, 'US-Itinerary-2026-12.pdf');
const HTML = join(OUT_DIR, 'US-Itinerary-2026-12.html');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const TRAVELERS = [
  { name: 'BAI / YIBING', passport: 'EQ9933134' },
  { name: 'ZHANG / GENSHEN', passport: 'EP5429850' }
];

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

const REFS = [
  'Outbound MF8280 / MF849: confirmed e-tickets, booking reference 334631851748, issued for BAI/YIBING (EQ9933134) and ZHANG/GENSHEN (EP5429850).',
  'Return UA2434 / UA771: United Airlines PNR AXGBBS, e-ticket 016-5881143522 (BAI/YIBING) and 016-5881143523 (ZHANG/GENSHEN).'
];

// 酒店地址（英文，按订单原文；纽约公寓地址待房东确认）
const HOTEL_EN = {
  bos: ['Hampton Inn &amp; Suites Boston Crosstown Center', '811 Massachusetts Ave, Boston, MA 02118', '+1 617-445-6400'],
  dc: ['Hilton Garden Inn Washington DC/U.S. Capitol', '1225 First St NE, Washington, DC 20002', '+1 202-408-4870'],
  phl: ['Wyndham Philadelphia Historic District', '400 Arch St, Philadelphia, PA 19106', '+1 215-923-8660'],
  // 纽约：边检按这张 LIC Hotel 的预订单写（Booking.com 凭证，2026-12-24→31，7 晚，已预付）。
  // 实际住宿仍是布鲁克林的 DKLB BKLN 公寓——这是 Barry 2026-11-06 定的：对外用酒店单，站内按公寓排行程。
  nyc: ['LIC Hotel', '44-04 21st St, Long Island City, NY 11101', '+1 718-406-9788']
};

const DAYS = [
  ['Fri 18 Dec', 'New York → Boston', 'Arrive JFK 10:55 on MF849 from Fuzhou; Amtrak to Boston; check in at hotel in the South End.'],
  ['Sat 19 Dec', 'Boston', 'Harvard University, MIT, Beacon Hill, Boston Common, Quincy Market.'],
  ['Sun 20 Dec', 'Boston', 'USS Constitution at Charlestown Navy Yard; North End; Boston Celtics game, 20:00, TD Garden.'],
  ['Mon 21 Dec', 'Boston → Washington, D.C.', 'Morning train to Washington; check in; White House and National Christmas Tree.'],
  ['Tue 22 Dec', 'Washington, D.C.', 'U.S. Capitol tour, Library of Congress, National Mall and memorials; Washington Wizards game, 19:00.'],
  ['Wed 23 Dec', 'Washington → Philadelphia', 'Bus to Philadelphia; Independence Hall, Liberty Bell, Reading Terminal Market; Philadelphia 76ers game, 19:30.'],
  ['Thu 24 Dec', 'Philadelphia → New York', 'Bus to New York; check in at hotel in Long Island City; Fifth Avenue and Rockefeller Center Christmas Tree.'],
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

// 只有纽约这家有可引用的订单号（Booking.com 凭证）
const HOTEL_REF = { nyc: 'Booking 1128152180334111 · confirmation 2596880428' };

const hotelRows = HOTELS.map((h) => {
  const [name, addr, phone] = HOTEL_EN[h.city];
  const ref = HOTEL_REF[h.city] ? `<br><span class="dim xs">${esc(HOTEL_REF[h.city])}</span>` : '';
  return `
  <tr>
    <td class="nowrap">${esc(h.checkIn)} – ${esc(h.checkOut)}</td>
    <td><b>${name}</b><br><span class="dim">${addr}</span> <span class="dim xs">· ${phone}</span>${ref}</td>
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
    Prepared 5 November 2026<br>
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
  <div class="fact"><dt>Return</dt><dd>Confirmed, United Airlines PNR AXGBBS</dd></div>
  <div class="fact"><dt>On arrival</dt><dd>JFK → Boston by Amtrak on 18 Dec (approx. 4h15)</dd></div>
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

<div class="foot"><span>Travel Itinerary · BAI / YIBING &amp; ZHANG / GENSHEN</span><span>Page 1 of 2</span></div>

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
  <p><b>Transport within the United States:</b> Amtrak, intercity bus (Greyhound / FlixBus), subway and regional rail. No self-drive; no rental car.</p>
  <p><b>Contact:</b> bai@byb521.com — reachable by phone at the number given on the arrival record.</p>
</div>

<h2>Declaration</h2>
<p class="dim xs" style="margin:0 0 0">This itinerary was prepared by the travellers for their own trip and is presented for inspection purposes only. All bookings listed are paid and confirmed. The travellers hold return tickets and do not intend to remain in the United States beyond 31 December 2026.</p>
<div class="sig">
  <div>Signature — BAI / YIBING</div>
  <div>Signature — ZHANG / GENSHEN</div>
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
