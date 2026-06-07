import assert from 'node:assert/strict';
import test from 'node:test';
import { createDirectCloudBackupHistoryProvider } from '../src/sync/directCloudBackupHistoryProvider.ts';

test('direct cloud backup history provider lists signed COS snapshots', async () => {
  const requested: string[] = [];
  const provider = createDirectCloudBackupHistoryProvider({
    config: {
      accessKeyId: 'AKIDEXAMPLE',
      secretAccessKey: 'SECRETEXAMPLE',
      endpoint: 'cos.ap-guangzhou.myqcloud.com',
      region: 'ap-guangzhou',
      bucket: 'workbase-1321785586',
    },
    fetcher: async (input) => {
      requested.push(String(input));
      return new Response(
        `
        <ListBucketResult>
          <Contents>
            <Key>Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-02T00-00-00.000Z-device-1.json</Key>
            <LastModified>2026-06-02T00:00:00.000Z</LastModified>
            <Size>128</Size>
          </Contents>
          <Contents>
            <Key>Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-03T00-00-00.000Z-device-1.json</Key>
            <LastModified>2026-06-03T00:00:00.000Z</LastModified>
            <Size>256</Size>
          </Contents>
        </ListBucketResult>
        `,
        { status: 200, headers: { 'Content-Type': 'application/xml' } }
      );
    },
  });

  const snapshots = await provider.listSnapshots({
    objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
  });

  assert.match(requested[0], /^https:\/\/workbase-1321785586\.cos\.ap-guangzhou\.myqcloud\.com\/\?/);
  assert.match(requested[0], /q-ak=AKIDEXAMPLE/);
  assert.match(requested[0], /prefix=Forge-OS_Base%2Fv2\.0%2FDomain1127%2Fsnapshots%2F/);
  assert.equal(snapshots[0].key, 'Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-03T00-00-00.000Z-device-1.json');
  assert.equal(snapshots[0].size, '256');
});
