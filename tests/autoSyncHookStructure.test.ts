import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('App wires browser auto COS sync for local data changes', () => {
  const app = read('src/App.tsx');

  assert.match(app, /import \{ useAutoCosSync \} from '\.\/hooks\/useAutoCosSync'/);
  assert.match(app, /useAutoCosSync\(\)/);
});

test('auto COS sync uploads queued local changes after a baseline exists', () => {
  const hookPath = path.join(repoRoot, 'src/hooks/useAutoCosSync.ts');
  assert.equal(fs.existsSync(hookPath), true);

  const hook = read('src/hooks/useAutoCosSync.ts');

  assert.match(hook, /lastLocalUpdatedAt/);
  assert.match(hook, /lastSyncedRevision/);
  assert.match(hook, /setTimeout/);
  assert.match(hook, /lastAttemptedLocalUpdatedAtRef/);
  assert.match(hook, /phase === 'syncing'/);
  assert.match(hook, /phase === 'conflict'/);
  assert.match(hook, /runV3Sync/);
  assert.match(hook, /createV3SyncClient/);
  assert.match(hook, /v3SyncObjectKey/);
  assert.match(hook, /v3SyncRevision/);
  assert.match(hook, /v3SyncBase/);
  assert.doesNotMatch(hook, /legacyObjectKeys/);
  assert.match(hook, /hasLocalChanges:\s*true/);
  assert.match(hook, /lastLocalUpdatedAt:\s*undefined/);
  assert.match(hook, /!syncStatus\.v3SyncRevision && !syncStatus\.lastSyncedRevision/);
  assert.doesNotMatch(hook, /runEntitySync/);
  assert.doesNotMatch(hook, /runManualSync/);
});

test('auto COS sync checks the cloud for remote updates when the app is open', () => {
  const hook = read('src/hooks/useAutoCosSync.ts');

  assert.match(hook, /AUTO_SYNC_POLL_MS/);
  assert.match(hook, /window\.setInterval/);
  assert.match(hook, /document\.addEventListener\('visibilitychange'/);
  assert.match(hook, /hasLocalChanges:\s*false/);
  assert.match(hook, /if \(syncStatus\.lastLocalUpdatedAt\) return/);
});
