import assert from 'node:assert/strict';
import test from 'node:test';
import { createHttpCloudBackupHistoryProvider } from '../src/sync/httpCloudBackupHistoryProvider.ts';

test('HTTP cloud backup history provider lists snapshots next to the signer endpoint', async () => {
  const calls: { input: RequestInfo | URL; init?: RequestInit }[] = [];
  const provider = createHttpCloudBackupHistoryProvider({
    credentialProviderUrl: 'http://127.0.0.1:8787/cos/sign',
    fetcher: async (input, init) => {
      calls.push({ input, init });
      return new Response(
        JSON.stringify({
          snapshots: [
            {
              key: 'Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-03T00-00-00.000Z-device-1.json',
              lastModified: '2026-06-03T00:00:00.000Z',
              size: '128',
            },
          ],
        }),
        { status: 200 }
      );
    },
  });

  const snapshots = await provider.listSnapshots({
    objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
  });

  assert.equal(calls[0].input, 'http://127.0.0.1:8787/cos/list-snapshots');
  assert.equal(JSON.parse(calls[0].init?.body as string).objectPrefix, 'Forge-OS_Base/v2.0/Domain1127');
  assert.equal(snapshots[0].key, 'Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-03T00-00-00.000Z-device-1.json');
});
