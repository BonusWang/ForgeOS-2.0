import assert from 'node:assert/strict';
import test from 'node:test';
import { createDirectCosCredentialProvider } from '../src/sync/directCosCredentialProvider.ts';

test('direct COS credential provider signs object URLs from manual access keys', async () => {
  const provider = createDirectCosCredentialProvider({
    accessKeyId: 'AKIDEXAMPLE',
    secretAccessKey: 'SECRETEXAMPLE',
    bucket: 'workbase-1321785586',
    region: 'ap-guangzhou',
    now: 1790000000,
  });

  const signed = await provider.getSignedUrl({
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    method: 'PUT',
  });

  assert.match(signed.url, /^https:\/\/workbase-1321785586\.cos\.ap-guangzhou\.myqcloud\.com\/Forge-OS_Base\/v2\.0\/Domain1127\/forge-data\.sync\.json\?/);
  assert.match(signed.url, /q-ak=AKIDEXAMPLE/);
  assert.match(signed.url, /q-sign-algorithm=sha1/);
  assert.match(signed.url, /q-header-list=host/);
  assert.match(signed.url, /q-signature=[0-9a-f]{40}/);
  assert.equal(signed.expiresAt, '2026-09-21T14:28:19.000Z');
});
