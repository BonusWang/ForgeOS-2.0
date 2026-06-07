import assert from 'node:assert/strict';
import test from 'node:test';
import { createHttpCosCredentialProvider } from '../src/sync/httpCosCredentialProvider.ts';

test('HTTP credential provider posts object request and returns a signed URL', async () => {
  const calls: { input: RequestInfo | URL; init?: RequestInit }[] = [];
  const provider = createHttpCosCredentialProvider({
    endpoint: 'http://127.0.0.1:8787/cos/sign',
    fetcher: async (input, init) => {
      calls.push({ input, init });
      return new Response(
        JSON.stringify({
          url: 'https://signed.example.com/forge-data.sync.json',
          expiresAt: '2026-06-03T01:00:00.000Z',
          headers: { 'x-cos-security-token': 'token' },
        }),
        { status: 200 }
      );
    },
  });

  const signed = await provider.getSignedUrl({
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    method: 'PUT',
    contentType: 'application/json',
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].input, 'http://127.0.0.1:8787/cos/sign');
  assert.equal(calls[0].init?.method, 'POST');
  assert.equal(JSON.parse(calls[0].init?.body as string).key, 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json');
  assert.equal(signed.url, 'https://signed.example.com/forge-data.sync.json');
  assert.equal(signed.headers?.['x-cos-security-token'], 'token');
});
