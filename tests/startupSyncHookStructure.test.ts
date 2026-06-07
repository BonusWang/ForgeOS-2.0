import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('App wires startup COS sync through a dedicated hook', () => {
  const app = read('src/App.tsx');
  const hook = read('src/hooks/useStartupCosSync.ts');

  assert.match(app, /useStartupCosSync/);
  assert.match(hook, /runV3Sync/);
  assert.match(hook, /createV3SyncClient/);
  assert.match(hook, /v3SyncObjectKey/);
  assert.match(hook, /v3SyncRevision/);
  assert.match(hook, /v3SyncBase/);
  assert.doesNotMatch(hook, /legacyObjectKeys/);
  assert.match(hook, /lastSyncedRevision/);
  assert.match(hook, /createHttpCosCredentialProvider/);
  assert.match(hook, /createDirectCosCredentialProvider/);
  assert.match(hook, /hasDirectCosCredentials/);
  assert.match(hook, /lastLocalUpdatedAt/);
  assert.match(hook, /hasLocalChanges:\s*Boolean\(syncStatus\.lastLocalUpdatedAt\)/);
  assert.doesNotMatch(hook, /hasLocalChanges:\s*true/);
  assert.doesNotMatch(hook, /runEntitySync/);
  assert.doesNotMatch(hook, /runStartupSync/);
});
