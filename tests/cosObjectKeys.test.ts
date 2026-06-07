import assert from 'node:assert/strict';
import test from 'node:test';
import { backupObjectKey, entitySyncObjectKey, syncObjectKey } from '../src/sync/cosObjectKeys.ts';

const sharedPrefix = 'Forge-OS_Base/v2.0/Domain1127';

test('COS object keys default to the v2.0 Forge prefix', () => {
  const config = { objectPrefix: '' };

  assert.equal(syncObjectKey(config), `${sharedPrefix}/forge-data.sync.json`);
  assert.equal(entitySyncObjectKey(config), `${sharedPrefix}/forge-data.entities.v2.json`);
  assert.equal(
    backupObjectKey(config, 'device-1', '2026-06-03T00:00:00.000Z'),
    `${sharedPrefix}/snapshots/2026-06-03T00-00-00.000Z-device-1.json`
  );
});

test('COS object keys still honor an explicitly configured prefix', () => {
  const config = { objectPrefix: 'Forge-OS_Base/v2.0/Domain1127/Android' };

  assert.equal(syncObjectKey(config), 'Forge-OS_Base/v2.0/Domain1127/Android/forge-data.sync.json');
  assert.equal(
    backupObjectKey(config, 'device-1', '2026-06-03T00:00:00.000Z'),
    'Forge-OS_Base/v2.0/Domain1127/Android/snapshots/2026-06-03T00-00-00.000Z-device-1.json'
  );
});
