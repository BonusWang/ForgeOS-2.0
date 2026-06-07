import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createV3SyncEnvelope,
  validateV3SyncEnvelope,
} from '../src/sync/v3/v3SyncEnvelope.ts';
import { createEmptyV3SyncEntities, type V3SyncOwner } from '../src/sync/v3/v3SyncTypes.ts';

const owner: V3SyncOwner = {
  namespace: 'Forge-OS_Base/v2.0/Domain1127/profiles/default',
  profileId: 'default',
};

test('valid V3 envelope validates checksum', async () => {
  const envelope = await createV3SyncEnvelope({
    appVersion: '1.0.5',
    deviceId: 'browser',
    owner,
    entities: createEmptyV3SyncEntities(),
    tombstones: [],
    conflicts: [],
    updatedAt: '2026-06-06T00:00:00.000Z',
  });

  const validation = await validateV3SyncEnvelope(envelope, {
    appVersion: '1.0.5',
    owner,
  });

  assert.equal(validation.ok, true);
  if (validation.ok) {
    assert.equal(validation.envelope.schemaVersion, 3);
    assert.equal(validation.envelope.owner.namespace, owner.namespace);
  }
});

test('V3 envelope rejects checksum mismatch', async () => {
  const envelope = await createV3SyncEnvelope({
    appVersion: '1.0.5',
    deviceId: 'browser',
    owner,
    entities: createEmptyV3SyncEntities(),
    tombstones: [],
    conflicts: [],
    updatedAt: '2026-06-06T00:00:00.000Z',
  });

  const validation = await validateV3SyncEnvelope(
    { ...envelope, checksum: 'bad-checksum' },
    { appVersion: '1.0.5', owner }
  );

  assert.deepEqual(validation, { ok: false, error: 'checksum-mismatch' });
});

test('V3 envelope rejects namespace mismatch', async () => {
  const envelope = await createV3SyncEnvelope({
    appVersion: '1.0.5',
    deviceId: 'browser',
    owner: { ...owner, namespace: 'Forge-OS_Base/v2.0/Domain1127/profiles/work', profileId: 'work' },
    entities: createEmptyV3SyncEntities(),
    tombstones: [],
    conflicts: [],
    updatedAt: '2026-06-06T00:00:00.000Z',
  });

  const validation = await validateV3SyncEnvelope(envelope, {
    appVersion: '1.0.5',
    owner,
  });

  assert.deepEqual(validation, { ok: false, error: 'namespace-mismatch' });
});

test('V3 envelope rejects newer remote app version', async () => {
  const envelope = await createV3SyncEnvelope({
    appVersion: '9.0.0',
    deviceId: 'browser',
    owner,
    entities: createEmptyV3SyncEntities(),
    tombstones: [],
    conflicts: [],
    updatedAt: '2026-06-06T00:00:00.000Z',
  });

  const validation = await validateV3SyncEnvelope(envelope, {
    appVersion: '1.0.5',
    owner,
  });

  assert.deepEqual(validation, { ok: false, error: 'newer-remote-version' });
});
