import assert from 'node:assert/strict';
import test from 'node:test';
import { runStartupSync } from '../src/sync/startupSync.ts';
import type { CosSyncClient } from '../src/sync/cosSyncClient.ts';

const config = {
  enabled: true,
  endpoint: 'cos.ap-guangzhou.myqcloud.com',
  region: 'ap-guangzhou',
  bucket: 'workbase-1321785586',
  profileId: 'default',
  objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
  credentialProviderUrl: 'http://127.0.0.1:8787/cos/sign',
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

const createFailingClient = () => {
  const client: CosSyncClient = {
    readRemoteRevision: async () => {
      throw new Error('COS request failed: HTTP 503');
    },
    downloadSnapshot: async () => {
      throw new Error('COS request failed: HTTP 503');
    },
    uploadSnapshot: async () => {
      throw new Error('COS request failed: HTTP 503');
    },
    uploadBackupSnapshot: async () => {
      throw new Error('COS request failed: HTTP 503');
    },
  };

  return client;
};

test('runStartupSync waits for manual first-sync choice when no baseline exists', async () => {
  const result = await runStartupSync({
    config,
    client: createFailingClient(),
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
  });

  assert.deepEqual(result, {
    phase: 'idle',
    reason: 'first-sync-requires-manual-choice',
  });
});

test('runStartupSync records errors without mutating the local storage record', async () => {
  const before = JSON.stringify(storageRecord);
  const result = await runStartupSync({
    config,
    client: createFailingClient(),
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    lastSyncedRevision: 'remote-1',
    hasLocalChanges: false,
  });

  assert.equal(result.phase, 'error');
  assert.match(result.phase === 'error' ? result.error : '', /HTTP 503/);
  assert.equal(JSON.stringify(storageRecord), before);
});
