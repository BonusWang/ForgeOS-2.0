import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSyncEnvelope,
  restoreAppStateFromSyncEnvelope,
  validateSyncEnvelope,
} from '../src/utils/syncEnvelope.ts';

const storageRecord = {
  'forge-storage': JSON.stringify({
    state: {
      tasks: [],
      moods: [],
    },
    version: 0,
  }),
};

test('createSyncEnvelope preserves forge-storage and validates checksum', async () => {
  const envelope = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-1',
    revision: 'revision-1',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord,
  });

  assert.equal(envelope.schemaVersion, 1);
  assert.equal(envelope.storageRecord['forge-storage'], storageRecord['forge-storage']);

  const result = await validateSyncEnvelope(envelope);

  assert.equal(result.ok, true);
});

test('validateSyncEnvelope rejects checksum mismatch', async () => {
  const envelope = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-1',
    revision: 'revision-1',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord,
  });

  const result = await validateSyncEnvelope({
    ...envelope,
    checksum: 'not-the-checksum',
  });

  assert.deepEqual(result, {
    ok: false,
    error: 'checksum-mismatch',
  });
});

test('validateSyncEnvelope rejects snapshots without forge-storage', async () => {
  const envelope = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-1',
    revision: 'revision-1',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord: {
      other: '{}',
    },
  });

  const result = await validateSyncEnvelope(envelope);

  assert.deepEqual(result, {
    ok: false,
    error: 'missing-forge-storage',
  });
});

test('restoreAppStateFromSyncEnvelope migrates remote state before use', async () => {
  const remoteState = {
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
  };
  const envelope = await createSyncEnvelope({
    appVersion: '0.1.0',
    deviceId: 'device-1',
    revision: 'revision-1',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord: {
      'forge-storage': JSON.stringify({
        state: remoteState,
        version: 0,
      }),
    },
  });

  const result = await restoreAppStateFromSyncEnvelope(envelope, '1.0.2');

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.state.__version, '1.0.2');
  }
});

test('restoreAppStateFromSyncEnvelope blocks newer remote app versions', async () => {
  const envelope = await createSyncEnvelope({
    appVersion: '9.0.0',
    deviceId: 'device-1',
    revision: 'revision-1',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord,
  });

  const result = await restoreAppStateFromSyncEnvelope(envelope, '1.0.2');

  assert.deepEqual(result, { ok: false, error: 'newer-remote-version' });
});
