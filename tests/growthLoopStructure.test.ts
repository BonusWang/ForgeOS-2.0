import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path: string) => fs.readFileSync(path, 'utf-8');

test('dashboard provides a lightweight capture inbox above the task board', () => {
  const dashboard = read('src/pages/Dashboard.tsx');
  const capture = read('src/features/capture/DesktopCaptureInbox.tsx');
  const okrSlice = read('src/store/slices/okrSlice.ts');
  const okrInbox = read('src/features/okr/OKRInboxColumn.tsx');

  assert.match(dashboard, /DesktopCaptureInbox/);
  assert.match(dashboard, /<DesktopCaptureInbox \/>[\s\S]*<TaskBoard \/>/);
  assert.match(capture, /addInboxItem/);
  assert.match(capture, /inboxItems/);
  assert.match(capture, /addTask/);
  assert.match(capture, /removeFromInbox/);
  assert.match(capture, /addInspiration/);
  assert.match(capture, /今日任务/);
  assert.match(capture, /待安排任务/);
  assert.match(capture, /灵感/);
  assert.match(capture, /删除/);
  assert.match(capture, /待澄清/);
  assert.match(okrSlice, /addInboxItem/);
  assert.match(okrInbox, /待澄清/);
  assert.doesNotMatch(capture, /Objective|Key Result|KR|ActionDesk/);
});

test('module picker groups existing modules by Forge phases without changing ids', () => {
  const picker = read('src/features/modules/ModulePicker.tsx');
  const registry = read('src/features/modules/moduleRegistry.ts');
  const types = read('src/types/index.ts');

  assert.match(picker, /MODULE_PHASE_GROUPS/);
  assert.match(picker, /定向/);
  assert.match(picker, /捕捉/);
  assert.match(picker, /执行/);
  assert.match(picker, /复盘/);
  assert.match(picker, /成长证据/);
  assert.match(picker, /维护/);
  assert.match(picker, /getAllModules/);
  assert.doesNotMatch(registry, /gtdPhase/);
  assert.doesNotMatch(types, /gtdPhase/);
});

test('growth evidence views are derived from existing state only', () => {
  const weekly = read('src/pages/WeeklyReview.tsx');
  const reflection = read('src/pages/Reflection.tsx');
  const monthly = read('src/pages/MonthlyOKR.tsx');
  const archive = read('src/features/evidence/GrowthEvidenceArchive.tsx');
  const monthlyPreview = read('src/features/evidence/MonthlyEvidencePreview.tsx');
  const types = read('src/types/index.ts');

  assert.match(weekly, /能力加分/);
  assert.match(weekly, /相关反思/);
  assert.match(reflection, /GrowthEvidenceArchive/);
  assert.match(monthly, /MonthlyEvidencePreview/);
  assert.match(archive, /weeklyReviews/);
  assert.match(archive, /objectives/);
  assert.match(archive, /abilities/);
  assert.match(archive, /reflections/);
  assert.match(monthlyPreview, /本月证据/);
  assert.match(monthlyPreview, /weeklyReviews/);
  assert.match(monthlyPreview, /objectives/);
  assert.doesNotMatch(archive, /useAppStore\(\(s\) => s\.reflections\.filter/);
  assert.doesNotMatch(monthlyPreview, /useAppStore\(\(s\) => s\.reflections\.filter/);
  assert.doesNotMatch(types, /EvidenceRecord/);
  assert.doesNotMatch(archive, /useAppStore\.setState|createJSONStorage|persist/);
  assert.doesNotMatch(monthlyPreview, /useAppStore\.setState|createJSONStorage|persist/);
});
