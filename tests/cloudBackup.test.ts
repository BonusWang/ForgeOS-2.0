import assert from 'node:assert/strict';
import test from 'node:test';
import { runCloudBackup, restoreCloudSnapshot } from '../src/sync/manualSync.ts';
import type { CosSyncClient } from '../src/sync/cosSyncClient.ts';
import type { CosSyncEnvelope } from '../src/types/sync.ts';
import { createSyncEnvelope } from '../src/utils/syncEnvelope.ts';

const config = {
  enabled: true,
  endpoint: 'cos.ap-guangzhou.myqcloud.com',
  region: 'ap-guangzhou',
  bucket: 'workbase-1321785586',
  profileId: 'default',
  objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
  credentialProviderUrl: 'https://example.com/cos-credentials',
};

const storageRecord = {
  'forge-storage': JSON.stringify({
    state: {
      tasks: [],
      calendarEvents: [],
      principles: [],
      abilities: [],
      reflections: [],
      entertainments: [],
      objectives: [],
      inboxItems: [],
      config: {
        currentWeekStart: '2026-06-01',
        lastVisitDate: '2026-06-03',
        theme: 'dark',
      },
      enabledModules: [],
      habits: [],
      moods: [],
      timeBlocks: [],
      inspirations: [],
      reflectionTemplates: [],
      syncConfig: config,
      syncStatus: {
        phase: 'idle',
        deviceId: 'device-1',
      },
      __version: '1.0.2',
    },
    version: 0,
  }),
};

const createClient = (remote: CosSyncEnvelope | null) => {
  const uploaded: { key: string; envelope: CosSyncEnvelope; backup: boolean }[] = [];
  const client: CosSyncClient = {
    readRemoteRevision: async () => remote?.revision ?? null,
    downloadSnapshot: async () => remote,
    uploadSnapshot: async (key, envelope) => {
      uploaded.push({ key, envelope, backup: false });
    },
    uploadBackupSnapshot: async (key, envelope) => {
      uploaded.push({ key, envelope, backup: true });
    },
  };

  return { client, uploaded };
};

test('runCloudBackup uploads both the primary cloud object and a history snapshot', async () => {
  const { client, uploaded } = createClient(null);

  const result = await runCloudBackup({
    config,
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    backupKey: 'Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-03T00-00-00.000Z-device-1.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    now: '2026-06-03T00:00:00.000Z',
  });

  assert.equal(result.phase, 'success');
  assert.equal(result.action, 'cloud-backup');
  assert.equal(result.backupKey, 'Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-03T00-00-00.000Z-device-1.json');
  assert.deepEqual(uploaded.map((item) => [item.key, item.backup]), [
    ['Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json', false],
    ['Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-03T00-00-00.000Z-device-1.json', true],
  ]);
});

test('restoreCloudSnapshot restores a selected cloud history snapshot', async () => {
  const remote = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-2',
    revision: 'history-1',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord,
  });
  const { client } = createClient(remote);

  const result = await restoreCloudSnapshot({
    config,
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-03T00-00-00.000Z-device-2.json',
    appVersion: '1.0.2',
  });

  assert.equal(result.phase, 'success');
  assert.equal(result.action, 'restored');
  assert.equal(result.state?.__version, '1.0.2');
});
