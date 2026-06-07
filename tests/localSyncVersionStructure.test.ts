import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('app store stamps a local sync version when persisted product data changes', () => {
  const store = read('src/store/useAppStore.ts');

  assert.match(store, /LOCAL_SYNC_DATA_KEYS/);
  assert.match(store, /setWithLocalChange/);
  assert.match(store, /lastLocalUpdatedAt:\s*new Date\(\)\.toISOString\(\)/);
  assert.match(store, /didLocalDataChange\(before,\s*after\)/);
});
