// 每个页面都得能用默认状态渲染出东西：抓那种一进页面就白屏的错（比如某个字段缺值）
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS } from '../src/state.js';
import { renderHome } from '../src/views/home.js';
import { renderDays } from '../src/views/days.js';
import { renderGuide } from '../src/views/guide.js';
import { renderTickets } from '../src/views/tickets.js';
import { renderMoney } from '../src/views/money.js';
import { renderMore } from '../src/views/more.js';
import { renderInfo } from '../src/views/info.js';
import { renderWallet } from '../src/views/wallet.js';
import { renderCards } from '../src/views/cards.js';
import { renderBudget } from '../src/views/budget.js';
import { renderMemories } from '../src/views/memories.js';

const S = (over = {}) => ({ ...JSON.parse(JSON.stringify(DEFAULTS)), ...over });
const CTX = { now: new Date(2026, 10, 5), weather: null };

const VIEWS = {
  '总览': renderHome,
  '行程': renderDays,
  '景点': renderGuide,
  '票务': renderTickets,
  '花费': renderMoney,
  '预算': renderBudget,
  '更多': renderMore,
  '资料': renderInfo,
  '订单夹': renderWallet,
  '大字卡': renderCards,
  '回忆': renderMemories
};

for (const [name, fn] of Object.entries(VIEWS)) {
  test(`${name}页用默认状态能渲染`, () => {
    const html = fn(S(), CTX);
    assert.equal(typeof html, 'string');
    assert.ok(html.length > 100, `${name} 渲染太短：${html.length}`);
    assert.ok(!/undefined|NaN|\[object Object\]/.test(html), `${name} 渲染里出现了 undefined/NaN`);
  });
}

test('三个方案 × 两个 12/30 选项 × 三家酒店都能渲染', () => {
  for (const plan of ['A', 'B', 'C']) {
    for (const ewr of [false, true]) {
      for (const hotel of ['apt', 'penn', 'lic']) {
        const st = S({ plan, hotel, opts: { ...DEFAULTS.opts, ewr } });
        for (const fn of [renderTickets, renderDays, renderHome, renderMoney]) {
          const html = fn(st, CTX);
          assert.ok(html.length > 100);
          assert.ok(!/NaN/.test(html), `${fn.name} ${plan}/${ewr}/${hotel} 出现 NaN`);
        }
      }
    }
  }
});
