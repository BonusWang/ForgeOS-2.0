import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('Data backup panel keeps local import/export and history restore controls', () => {
  const panel = read('src/features/system/DataBackupPanel.tsx');
  const copy = read('src/copy/system-copy.ts');
  const syncSlice = read('src/store/slices/syncSlice.ts');

  assert.match(copy, /localStorageUrlLabel:\s*'本机存储url'/);
  assert.match(copy, /exportButton:\s*'导出数据'/);
  assert.match(copy, /importButton:\s*'导入数据'/);
  assert.match(copy, /restoreHistoryButton:\s*'恢复历史数据'/);

  const storageUrlIndex = panel.indexOf('localStorageUrlLabel');
  const hintIndex = panel.indexOf('sepiaHint');
  assert.ok(storageUrlIndex >= 0);
  assert.ok(hintIndex > storageUrlIndex);
  assert.match(panel, /getPlatformStorageDisplayUrl/);
  assert.match(panel, /overflowWrap:\s*'anywhere'/);
  assert.match(panel, /flexWrap:\s*'wrap'/);

  assert.match(panel, /handleExport/);
  assert.match(panel, /handleImport/);
  assert.match(panel, /restoreHistoryButton/);
  assert.match(panel, /restoreCloudSnapshot/);
  assert.match(panel, /V3_REBASE_REQUIRED_MESSAGE/);
  assert.match(panel, /lastSyncedRevision:\s*undefined/);
  assert.match(panel, /v3SyncRevision:\s*undefined/);
  assert.match(panel, /v3SyncBase:\s*undefined/);
  assert.match(panel, /HISTORY_LIMIT\s*=\s*5/);
  assert.match(panel, /slice\(0,\s*HISTORY_LIMIT\)/);
  assert.match(panel, /同步时间/);
  assert.match(panel, /修改时间/);
  assert.doesNotMatch(panel, /syncLocalButton/);
  assert.doesNotMatch(panel, /backupCloudButton/);
  assert.doesNotMatch(panel, /runCloudBackup/);
  assert.doesNotMatch(panel, /backupObjectKey/);
  assert.doesNotMatch(panel, /createStorageRecordFromAppState/);

  assert.match(syncSlice, /bucket:\s*'workbase-1321785586'/);
  assert.match(syncSlice, /objectPrefix:\s*'Forge-OS_Base\/v2\.0\/Domain1127'/);
});
