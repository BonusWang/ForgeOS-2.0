import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path: string) => fs.readFileSync(path, 'utf-8');

test('mobile transient panels use history-backed back priority', () => {
  const hook = read('src/features/mobile/useMobilePanelHistory.ts');
  const today = read('src/features/mobile/MobileTodayForge.tsx');
  const progress = read('src/features/mobile/MobileWeekProgress.tsx');
  const capture = read('src/features/mobile/MobileCaptureHub.tsx');
  const shell = read('src/features/mobile/MobileAppShell.tsx');

  assert.match(hook, /useMobilePanelHistory/);
  assert.match(hook, /pushState/);
  assert.match(hook, /popstate/);
  assert.match(hook, /closePanelRef/);
  assert.match(today, /useMobilePanelHistory\(isTaskComposerOpen/);
  assert.match(progress, /useMobilePanelHistory\(isWeeklyReviewOpen/);
  assert.match(progress, /useMobilePanelHistory\(Boolean\(scheduleTaskId\)/);
  assert.match(capture, /useMobilePanelHistory\(isComposerOpen/);
  assert.match(shell, /useMobilePanelHistory\(isSystemToolsOpen/);
});

test('mobile controls expose TalkBack-friendly labels and status regions', () => {
  const progress = read('src/features/mobile/MobileWeekProgress.tsx');
  const shell = read('src/features/mobile/MobileAppShell.tsx');

  assert.match(shell, /aria-label={`切换到\$\{item\.label\}模块`}/);
  assert.match(shell, /role="status"/);
  assert.match(shell, /aria-live="polite"/);
  assert.match(progress, /澄清为今日任务/);
  assert.match(progress, /转为待安排任务/);
  assert.match(progress, /澄清为灵感/);
  assert.match(progress, /删除待澄清事项/);
  assert.match(progress, /aria-label={`.*\$\{item\.content\}`}/);
});

test('mobile hardening keeps data contracts and four sections unchanged', () => {
  const shell = read('src/features/mobile/MobileAppShell.tsx');
  const types = read('src/types/index.ts');

  assert.match(shell, /id: 'today'/);
  assert.match(shell, /id: 'progress'/);
  assert.match(shell, /id: 'capture'/);
  assert.match(shell, /id: 'system'/);
  assert.doesNotMatch(shell, /id: 'modal'|id: 'clarify'|id: 'evidence'|id: 'health'/);
  assert.doesNotMatch(types, /MobilePanelState|MobileRouteState|AndroidBackModel/);
});
