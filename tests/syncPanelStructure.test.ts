import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('System page renders the COS sync panel and exposes expected controls', () => {
  const systemPage = read('src/pages/System.tsx');
  const syncPanel = read('src/features/system/SyncPanel.tsx');

  assert.match(systemPage, /SyncPanel/);
  assert.match(syncPanel, /endpoint/);
  assert.match(syncPanel, /region/);
  assert.match(syncPanel, /bucket/);
  assert.match(syncPanel, /profileId/);
  assert.match(syncPanel, /objectPrefix/);
  assert.match(syncPanel, /credentialProviderUrl/);
  assert.match(syncPanel, /accessKeyId/);
  assert.match(syncPanel, /secretAccessKey/);
  assert.match(syncPanel, /createDirectCosCredentialProvider/);
  assert.match(syncPanel, /runV3Sync/);
  assert.match(syncPanel, /createV3SyncClient/);
  assert.match(syncPanel, /v3SyncObjectKey/);
  assert.doesNotMatch(syncPanel, /legacyObjectKeys/);
});

test('COS sync panel uses mobile settings sections instead of a desktop form table', () => {
  const syncPanel = read('src/features/system/SyncPanel.tsx');

  assert.match(syncPanel, /sync-status-banner/);
  assert.match(syncPanel, /sync-setting-section/);
  assert.match(syncPanel, /sync-setting-section--connection/);
  assert.match(syncPanel, /sync-setting-section--security/);
  assert.match(syncPanel, /sync-switch/);
  assert.match(syncPanel, /sync-action-bar/);
  assert.match(syncPanel, /isConfigOpen/);
  assert.match(syncPanel, /setIsConfigOpen\(false\)/);
  assert.match(syncPanel, /修改配置/);
  assert.match(syncPanel, /sync-config-summary/);
  assert.match(syncPanel, /const activeConfig = isConfigOpen \? form : syncConfig/);
  assert.match(syncPanel, /createV3Client\(activeConfig\)/);
  assert.match(syncPanel, /applyV3Result\(result, activeConfig\)/);
  assert.match(syncPanel, /lastLocalUpdatedAt/);
  assert.match(syncPanel, /hasLocalChanges:\s*Boolean\(syncStatus\.lastLocalUpdatedAt\)/);
  assert.match(syncPanel, /V3 命名空间/);
  assert.match(syncPanel, /V3 基线/);
  assert.match(syncPanel, /!\s*hasActiveV3SyncStatus\s*&&/);
  assert.match(syncPanel, /V3 合并/);
  assert.match(syncPanel, /V3 冲突/);
  assert.match(syncPanel, /v3SyncNamespace/);
  assert.match(syncPanel, /v3SyncRevision/);
  assert.match(syncPanel, /v3SyncAutoMerged/);
  assert.match(syncPanel, /v3SyncConflicts/);
  assert.doesNotMatch(syncPanel, /hasLocalChanges:\s*true/);
  assert.doesNotMatch(syncPanel, /runEntitySync/);
  assert.doesNotMatch(syncPanel, /runManualSync/);
});

test('COS sync panel removes retired baseline diagnostics from the V3 status', () => {
  const syncPanel = read('src/features/system/SyncPanel.tsx');

  assert.match(syncPanel, /hasActiveV3SyncStatus/);
  assert.match(syncPanel, /syncStatus\.v3SyncRevision/);
  assert.match(syncPanel, /syncStatus\.v3SyncInitializedAt/);
  assert.match(syncPanel, /!\s*hasActiveV3SyncStatus\s*&&/);
  assert.doesNotMatch(syncPanel, /sync-legacy-diagnostics/);
  assert.doesNotMatch(syncPanel, /旧版诊断/);
  assert.doesNotMatch(syncPanel, /旧版基线/);
  assert.doesNotMatch(syncPanel, /!\s*syncStatus\.v3SyncRevision\s*&&\s*\(\s*<span>基线/);
});

test('mobile UI CSS keeps sync fields usable and replaces the desktop task board with the mobile shell', () => {
  const css = read('src/index.css');

  assert.match(css, /\.sync-config-summary[\s\S]*display:\s*grid/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.sync-field[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.sync-config-summary[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.sync-action-bar \.ascii-button[\s\S]*min-height:\s*48px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.desktop-app-frame[\s\S]*display:\s*none/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-app-shell[\s\S]*display:\s*flex/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-content[\s\S]*overflow-y:\s*auto/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-content[\s\S]*padding-bottom:\s*calc\(env\(safe-area-inset-bottom\) \+ 16px\)/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-bottom-nav[\s\S]*position:\s*relative/);
  assert.doesNotMatch(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-bottom-nav[\s\S]*position:\s*fixed/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.mobile-nav-button[\s\S]*min-height:\s*52px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.ascii-box button[\s\S]*min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.module-picker-close[\s\S]*height:\s*44px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.weekly-review-nav-button,[\s\S]*\.weekly-review-save-button[\s\S]*min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.btn-invert[\s\S]*min-height:\s*44px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.module-picker-row[\s\S]*grid-template-columns:\s*36px minmax\(0,\s*1fr\) auto/);
});

test('module picker locks the background document while open on mobile', () => {
  const modulePicker = read('src/features/modules/ModulePicker.tsx');

  assert.match(modulePicker, /document\.body\.style\.overflow\s*=\s*'hidden'/);
  assert.match(modulePicker, /document\.body\.style\.overflow\s*=\s*previousOverflow/);
});
