import assert from 'node:assert/strict';
import test from 'node:test';
import { createV3SyncNamespace, v3SyncObjectKey } from '../src/sync/v3/v3SyncNamespace.ts';

const baseConfig = {
  objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
  profileId: 'default',
};

test('V3 sync key is isolated by profile namespace', () => {
  assert.equal(
    v3SyncObjectKey(baseConfig),
    'Forge-OS_Base/v2.0/Domain1127/profiles/default/forge-data.entities.v3.json'
  );
  assert.equal(
    v3SyncObjectKey({ ...baseConfig, profileId: 'work' }),
    'Forge-OS_Base/v2.0/Domain1127/profiles/work/forge-data.entities.v3.json'
  );
});

test('V3 namespace can reserve a future user id', () => {
  assert.equal(
    createV3SyncNamespace({ ...baseConfig, userId: 'user-a' }),
    'Forge-OS_Base/v2.0/Domain1127/users/user-a/profiles/default'
  );
});

test('V3 namespace escapes slashes in profile and user ids', () => {
  assert.equal(
    createV3SyncNamespace({ ...baseConfig, profileId: 'team/a', userId: 'domain/user' }),
    'Forge-OS_Base/v2.0/Domain1127/users/domain%2Fuser/profiles/team%2Fa'
  );
});
