import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path: string) => fs.readFileSync(path, 'utf-8');

test('system page renders readonly health and usage ritual panels', () => {
  const systemPage = read('src/pages/System.tsx');

  assert.match(systemPage, /DataHealthPanel/);
  assert.match(systemPage, /UsageRitualPanel/);
  assert.match(systemPage, /<DataHealthPanel \/>[\s\S]*<DataBackupPanel \/>/);
  assert.match(systemPage, /<UsageRitualPanel \/>[\s\S]*<SyncPanel \/>/);
});

test('data health panel derives readonly status from existing state', () => {
  const panel = read('src/features/system/DataHealthPanel.tsx');

  assert.match(panel, /systemCopy\.health/);
  assert.match(panel, /getPlatformStorageDisplayUrl/);
  assert.match(panel, /syncConfig/);
  assert.match(panel, /syncStatus/);
  assert.match(panel, /v3SyncConflicts/);
  assert.match(panel, /lastLocalUpdatedAt/);
  assert.doesNotMatch(panel, /setSyncStatus|updateSyncConfig|runV3Sync|useAppStore\.setState/);
  assert.doesNotMatch(panel, /resetV3|clearV3|rebaseV3|initializeV3/i);
});

test('usage ritual panel keeps ritual guidance local and collapsible', () => {
  const panel = read('src/features/system/UsageRitualPanel.tsx');

  assert.match(panel, /systemCopy\.ritual/);
  assert.match(panel, /useState/);
  assert.match(panel, /morning/);
  assert.match(panel, /daytime/);
  assert.match(panel, /evening/);
  assert.match(panel, /weekend/);
  assert.match(panel, /monthEnd/);
  assert.doesNotMatch(panel, /useAppStore|setSyncStatus|updateSyncConfig|setState/);
});

test('system copy and README describe the Forge usage rhythm', () => {
  const copy = read('src/copy/system-copy.ts');
  const readme = read('README.md');

  assert.match(copy, /health:/);
  assert.match(copy, /ritual:/);
  assert.match(copy, /早上/);
  assert.match(copy, /白天/);
  assert.match(copy, /晚上/);
  assert.match(copy, /周末/);
  assert.match(copy, /月底/);
  assert.match(readme, /## 使用节奏/);
  assert.match(readme, /早上/);
  assert.match(readme, /白天/);
  assert.match(readme, /晚上/);
  assert.match(readme, /周末/);
  assert.match(readme, /月底/);
  assert.match(readme, /不新增独立数据模型/);
});
