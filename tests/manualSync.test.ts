import assert from 'node:assert/strict';
import test from 'node:test';
import {
  resolveSyncConflict,
  runManualSync,
} from '../src/sync/manualSync.ts';
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
      __version: '0.1.0',
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

test('runManualSync reports not-configured when sync is disabled', async () => {
  const { client } = createClient(null);

  const result = await runManualSync({
    config: { ...config, enabled: false },
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
  });

  assert.deepEqual(result, { phase: 'not-configured' });
});

test('runManualSync accepts direct COS credentials as a valid config', async () => {
  const { client, uploaded } = createClient(null);

  const result = await runManualSync({
    config: {
      ...config,
      credentialProviderUrl: '',
      accessKeyId: 'AKIDEXAMPLE',
      secretAccessKey: 'SECRETEXAMPLE',
    },
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    now: '2026-06-03T00:00:00.000Z',
  });

  assert.equal(result.phase, 'success');
  assert.equal(result.action, 'uploaded');
  assert.equal(uploaded.length, 1);
});

test('runManualSync uploads local snapshot when remote is empty', async () => {
  const { client, uploaded } = createClient(null);

  const result = await runManualSync({
    config,
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    now: '2026-06-03T00:00:00.000Z',
  });

  assert.equal(result.phase, 'success');
  assert.equal(result.action, 'uploaded');
  assert.equal(uploaded.length, 1);
  assert.equal(uploaded[0].backup, false);
});

test('runManualSync writes a history snapshot when backup key is provided', async () => {
  const { client, uploaded } = createClient(null);

  const result = await runManualSync({
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
  assert.equal(result.action, 'uploaded');
  assert.deepEqual(uploaded.map((item) => [item.key, item.backup]), [
    ['Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json', false],
    ['Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-03T00-00-00.000Z-device-1.json', true],
  ]);
});

test('runManualSync reports error when restoring remote data and no cloud snapshot exists', async () => {
  const { client, uploaded } = createClient(null);

  const result = await runManualSync({
    config,
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    firstSyncMode: 'restore-remote',
  });

  assert.deepEqual(result, { phase: 'error', error: '云端暂无可恢复数据' });
  assert.equal(uploaded.length, 0);
});

test('runManualSync restores remote snapshot on first sync when requested', async () => {
  const remote = await createSyncEnvelope({
    appVersion: '0.1.0',
    deviceId: 'device-2',
    revision: 'remote-1',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord,
  });
  const { client } = createClient(remote);

  const result = await runManualSync({
    config,
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    firstSyncMode: 'restore-remote',
  });

  assert.equal(result.phase, 'success');
  assert.equal(result.action, 'restored');
  assert.equal(result.state.__version, '1.0.2');
});

test('runManualSync returns noop when remote revision matches and local has no changes', async () => {
  const remote = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-2',
    revision: 'remote-1',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord,
  });
  const { client, uploaded } = createClient(remote);

  const result = await runManualSync({
    config,
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    lastSyncedRevision: 'remote-1',
    hasLocalChanges: false,
  });

  assert.deepEqual(result, { phase: 'success', action: 'noop', revision: 'remote-1' });
  assert.equal(uploaded.length, 0);
});

test('runManualSync marks conflict and backs up local data before overwrite', async () => {
  const remote = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-2',
    revision: 'remote-2',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord,
  });
  const { client, uploaded } = createClient(remote);

  const result = await runManualSync({
    config,
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    backupKey: 'Forge-OS_Base/v2.0/Domain1127/snapshots/local-conflict.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    lastSyncedRevision: 'remote-1',
    hasLocalChanges: true,
    now: '2026-06-03T00:00:00.000Z',
  });

  assert.equal(result.phase, 'conflict');
  assert.equal(uploaded.length, 1);
  assert.equal(uploaded[0].backup, true);
});

test('runManualSync conflicts instead of auto-uploading when both sides changed and local is newer', async () => {
  const remote = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-2',
    revision: 'remote-2',
    updatedAt: '2026-06-03T09:00:00.000Z',
    storageRecord,
  });
  const { client, uploaded } = createClient(remote);

  const result = await runManualSync({
    config,
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    lastSyncedRevision: 'remote-1',
    hasLocalChanges: true,
    localUpdatedAt: '2026-06-03T10:00:00.000Z',
    now: '2026-06-03T10:02:00.000Z',
  });

  assert.equal(result.phase, 'conflict');
  assert.equal(uploaded.length, 0);
  if (result.phase === 'conflict' && 'localUpdatedAt' in result) {
    assert.equal(result.localUpdatedAt, '2026-06-03T10:00:00.000Z');
    assert.equal(result.remoteUpdatedAt, '2026-06-03T09:00:00.000Z');
  }
});

test('runManualSync conflicts instead of auto-restoring when both sides changed and cloud is newer', async () => {
  const remote = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-2',
    revision: 'remote-2',
    updatedAt: '2026-06-03T11:00:00.000Z',
    storageRecord,
  });
  const { client, uploaded } = createClient(remote);

  const result = await runManualSync({
    config,
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    lastSyncedRevision: 'remote-1',
    hasLocalChanges: true,
    localUpdatedAt: '2026-06-03T10:00:00.000Z',
  });

  assert.equal(result.phase, 'conflict');
  if (result.phase === 'conflict' && 'localUpdatedAt' in result) {
    assert.equal(result.localUpdatedAt, '2026-06-03T10:00:00.000Z');
    assert.equal(result.remoteUpdatedAt, '2026-06-03T11:00:00.000Z');
  }
  assert.equal(uploaded.length, 0);
});

test('runManualSync does not conflict with a newer remote revision from the same device', async () => {
  const remote = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-1',
    revision: 'device-1:2026-06-03T09:18:32.128Z',
    updatedAt: '2026-06-03T09:18:32.128Z',
    storageRecord,
  });
  const { client, uploaded } = createClient(remote);

  const result = await runManualSync({
    config,
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    backupKey: 'Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-03T09-21-46.035Z-device-1.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    lastSyncedRevision: 'device-1:2026-06-03T09:17:42.432Z',
    hasLocalChanges: true,
    now: '2026-06-03T09:21:46.035Z',
  });

  assert.equal(result.phase, 'success');
  assert.equal(result.action, 'uploaded');
  assert.deepEqual(uploaded.map((item) => [item.key, item.backup]), [
    ['Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json', false],
    ['Forge-OS_Base/v2.0/Domain1127/snapshots/2026-06-03T09-21-46.035Z-device-1.json', true],
  ]);
});

test('resolveSyncConflict only overwrites after explicit choice', async () => {
  const remote = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-2',
    revision: 'remote-2',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord,
  });
  const { client, uploaded } = createClient(remote);

  const later = await resolveSyncConflict({
    choice: 'later',
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    remoteEnvelope: remote,
  });
  const keepLocal = await resolveSyncConflict({
    choice: 'keep-local',
    client,
    key: 'Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json',
    appVersion: '1.0.2',
    deviceId: 'device-1',
    storageRecord,
    remoteEnvelope: remote,
    now: '2026-06-03T00:00:00.000Z',
  });

  assert.deepEqual(later, { phase: 'conflict', action: 'deferred' });
  assert.equal(keepLocal.phase, 'success');
  assert.equal(keepLocal.action, 'uploaded');
  assert.equal(uploaded.length, 1);
});
