// 证件和订单保险箱：加密、解密、密码证明
import test from 'node:test';
import assert from 'node:assert/strict';
import { sealVault, openVault, vaultProof } from '../src/lib/vault.js';

test('保险箱：对的密码能打开，错的打不开，密文里看不到明文', async () => {
  const data = { sections: [{ title: '旅客', rows: [{ label: 'A', value: 'E12345678' }] }], files: [] };
  const box = await sealVault(data, '000111', 1000);
  assert.ok(!JSON.stringify(box).includes('E12345678'));
  assert.deepEqual(await openVault(box, '000111'), data);
  await assert.rejects(() => openVault(box, '000112'));
  assert.equal(box.proof, await vaultProof('000111'));
  assert.notEqual(box.proof, await vaultProof('000112'));
  assert.match(box.proof, /^[a-f0-9]{64}$/);
});
