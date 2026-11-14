// 证件包：手机上传附件。加解密 + 真的启动 sync-server 走一遍上传、列表、下载、删除和各种拒绝
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sealVault, vaultProof, sealVaultFile, openVaultFileMeta, openVaultFileData, vaultFilesCall } from '../src/lib/vault.js';

const PIN = '135790';
const ITER = 1000; // 测试里用少一点的迭代次数

test('附件加密：文件名和内容都看不到，对的密码能解，错的不能', async () => {
  const bytes = new TextEncoder().encode('PASSPORT-E99887766');
  const rec = await sealVaultFile({ name: '护照首页.jpg', type: 'image/jpeg', bytes }, PIN, ITER);
  const flat = JSON.stringify(rec);
  assert.ok(!flat.includes('护照') && !flat.includes('E99887766') && !flat.includes('jpeg'));
  assert.deepEqual(await openVaultFileMeta(rec, PIN, ITER), { name: '护照首页.jpg', type: 'image/jpeg', size: bytes.length });
  assert.deepEqual(await openVaultFileData(rec, PIN, ITER), bytes);
  await assert.rejects(() => openVaultFileMeta(rec, '135791', ITER));
});

test('服务器：要密码证明，能传、能列、能取、能删，超限会拒绝', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'vault-files-'));
  const box = await sealVault({ sections: [], files: [] }, PIN, ITER);
  writeFileSync(join(dir, 'vault.enc.json'), JSON.stringify(box));
  const port = 18000 + Math.floor(Math.random() * 2000);
  const srv = spawn(process.execPath, ['deploy/sync-server.mjs'], { env: { ...process.env, PORT: String(port), DATA_DIR: dir }, stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => { srv.kill(); rmSync(dir, { recursive: true, force: true }); });
  await new Promise((ok, bad) => { srv.stdout.on('data', (d) => /listening/.test(d) && ok()); srv.on('exit', bad); setTimeout(() => bad(new Error('server did not start')), 5000); });
  const url = `http://127.0.0.1:${port}/api/vault/files`;
  const call = (op, extra) => vaultFilesCall(op, PIN, extra, url);
  const raw = (body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  assert.deepEqual((await call('list')).files, []);
  const bytes = new Uint8Array(3000).map((_, i) => i % 251);
  const sealed = await sealVaultFile({ name: '酒店确认单.pdf', type: 'application/pdf', bytes }, PIN, ITER);
  const { id } = await call('put', sealed);
  assert.match(id, /^[a-z0-9]{8,40}$/);

  // 服务器磁盘上只有密文
  const onDisk = readFileSync(join(dir, 'vault-files', id + '.json'), 'utf8');
  assert.ok(!onDisk.includes('酒店') && !onDisk.includes('pdf'));

  const list = (await call('list')).files;
  assert.equal(list.length, 1);
  assert.equal((await openVaultFileMeta(list[0], PIN, ITER)).name, '酒店确认单.pdf');
  assert.deepEqual(await openVaultFileData(await call('get', { id }), PIN, ITER), bytes);

  // 错误密码、坏 id、路径穿越、坏内容都被拒绝
  assert.equal((await raw({ proof: await vaultProof('000000'), op: 'list' })).status, 403);
  await assert.rejects(() => call('get', { id: '../vault.enc' }), /服务器出错（400）/);
  await assert.rejects(() => call('put', { miv: 'x', mct: '<script>', iv: 'a', ct: 'b' }), /服务器出错（400）/);
  await assert.rejects(() => call('get', { id: 'zzzzzzzzzz' }), /已经被删了/);
  // 超过 15MB 的请求体：413
  const big = await raw({ proof: await vaultProof(PIN), op: 'put', miv: 'AA', mct: 'AA', iv: 'AA', ct: 'A'.repeat(15 * 1024 * 1024 + 10) });
  assert.equal(big.status, 413);

  await call('del', { id });
  assert.deepEqual((await call('list')).files, []);
  assert.deepEqual(readdirSync(join(dir, 'vault-files')), []);
  // 原来的证件包接口照常
  const v = await fetch(`http://127.0.0.1:${port}/api/vault`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proof: await vaultProof(PIN) }) });
  assert.equal(v.status, 200);
});
