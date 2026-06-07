import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path: string) => fs.readFileSync(path, 'utf-8');

test('mobile today exposes daily rhythm guidance without a ritual model', () => {
  const today = read('src/features/mobile/MobileTodayForge.tsx');
  const types = read('src/types/index.ts');

  assert.match(today, /mobileDailyRhythm/);
  assert.match(today, /早上/);
  assert.match(today, /白天/);
  assert.match(today, /晚上/);
  assert.match(today, /mobile-rhythm-panel/);
  assert.doesNotMatch(today, /useAppStore\(\(s\) => s\.ritual|setRitual|rituals/);
  assert.doesNotMatch(types, /Ritual|ritual/);
});

test('mobile progress clarifies shared inbox items and shows derived evidence', () => {
  const progress = read('src/features/mobile/MobileWeekProgress.tsx');
  const types = read('src/types/index.ts');

  assert.match(progress, /inboxItems/);
  assert.match(progress, /removeFromInbox/);
  assert.match(progress, /addInspiration/);
  assert.match(progress, /clarifyInboxAsToday/);
  assert.match(progress, /clarifyInboxAsBacklog/);
  assert.match(progress, /clarifyInboxAsInspiration/);
  assert.match(progress, /待澄清/);
  assert.match(progress, /今日任务/);
  assert.match(progress, /待安排任务/);
  assert.match(progress, /灵感/);
  assert.match(progress, /删除/);
  assert.match(progress, /mobile-week-evidence/);
  assert.match(progress, /能力加分/);
  assert.match(progress, /相关反思/);
  assert.doesNotMatch(types, /MobileCaptureItem|EvidenceRecord/);
});

test('mobile system shows readonly health while keeping four main sections', () => {
  const shell = read('src/features/mobile/MobileAppShell.tsx');

  assert.match(shell, /mobileSystemHealth/);
  assert.match(shell, /syncConfig/);
  assert.match(shell, /syncStatus/);
  assert.match(shell, /v3SyncConflicts/);
  assert.match(shell, /待澄清/);
  assert.match(shell, /本地记录/);
  assert.match(shell, /mobile-system-health/);
  assert.match(shell, /id: 'today'/);
  assert.match(shell, /id: 'progress'/);
  assert.match(shell, /id: 'capture'/);
  assert.match(shell, /id: 'system'/);
  assert.doesNotMatch(shell, /id: 'clarify'|id: 'evidence'|id: 'health'/);
  assert.doesNotMatch(shell, /runV3Sync|resetV3|clearV3|useAppStore\.setState/);
});
