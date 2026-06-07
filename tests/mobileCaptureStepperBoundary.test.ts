import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path: string) => fs.readFileSync(path, 'utf-8');

test('mobile record page uses clickable steppers instead of decorative rails', () => {
  const capture = read('src/features/mobile/MobileCaptureHub.tsx');
  const css = read('src/index.css');

  assert.match(capture, /mobile-capture-stepper/);
  assert.match(capture, /aria-current=\{isActive \? 'step' : undefined\}/);
  assert.match(capture, /aria-label=\{`切换到\$\{step\.label\}步骤`\}/);
  assert.match(capture, /onClick=\{\(\) => onStepSelect\(step\.id\)\}/);
  assert.doesNotMatch(capture, /disabled=\{isPending\}/);
  assert.doesNotMatch(capture, /mobile-capture-rail/);
  assert.doesNotMatch(css, /\.mobile-capture-rail/);
});

test('inspiration and reflection share a variable-length stepper model', () => {
  const capture = read('src/features/mobile/MobileCaptureHub.tsx');
  const types = read('src/types/index.ts');

  assert.match(capture, /inspirationStepDefinitions/);
  assert.match(capture, /id: 'content'/);
  assert.match(capture, /id: 'source'/);
  assert.match(capture, /id: 'tags'/);
  assert.match(capture, /id: 'review'/);
  assert.match(capture, /reflectionTemplate\?\.questions\.map/);
  assert.match(capture, /type ReflectionCaptureStep = string/);
  assert.doesNotMatch(capture, /type ReflectionCaptureStep = 'obstacle' \| 'solution' \| 'effect' \| 'review'/);
  assert.doesNotMatch(types, /CaptureItem|MobileCaptureWorkflow|StepperState/);
});

test('mobile record history is separate from the workflow', () => {
  const capture = read('src/features/mobile/MobileCaptureHub.tsx');

  assert.match(capture, /renderRecentList\([\s\S]*'最近灵感'/);
  assert.match(capture, /renderRecentList\([\s\S]*'最近反思'/);
  assert.doesNotMatch(capture, />最近保存</);
  assert.match(capture, /<section className="mobile-capture-history-section"/);
  assert.match(capture, /<section className=\{`mobile-capture-composer/);
});

test('capture inbox and backlog copy have distinct user-facing boundaries', () => {
  const desktopCapture = read('src/features/capture/DesktopCaptureInbox.tsx');
  const taskBoard = read('src/features/tasks/TaskBoard.tsx');
  const mobileProgress = read('src/features/mobile/MobileWeekProgress.tsx');
  const okrPanel = read('src/features/okr/OKRPanel.tsx');
  const abilityTraining = read('src/features/abilities/AbilityTraining.tsx');
  const copy = read('src/copy/forge-copy.ts');

  assert.match(desktopCapture, /捕捉箱 \/ 待澄清/);
  assert.match(desktopCapture, /待安排任务/);
  assert.match(taskBoard, /title="待安排任务"/);
  assert.match(mobileProgress, /转为待安排任务/);
  assert.match(mobileProgress, /<h2>待安排任务<\/h2>/);
  assert.match(okrPanel, /加入待澄清/);
  assert.match(abilityTraining, /加入待澄清/);
  assert.match(copy, /待澄清/);
  assert.doesNotMatch(desktopCapture, /桌面收集箱|收纳任务/);
});

test('data contracts stay on existing inbox, backlog, inspiration, and reflection paths', () => {
  const desktopCapture = read('src/features/capture/DesktopCaptureInbox.tsx');
  const mobileProgress = read('src/features/mobile/MobileWeekProgress.tsx');
  const capture = read('src/features/mobile/MobileCaptureHub.tsx');
  const taskBoard = read('src/features/tasks/TaskBoard.tsx');
  const types = read('src/types/index.ts');

  assert.match(desktopCapture, /addInboxItem/);
  assert.match(desktopCapture, /inboxItems/);
  assert.match(desktopCapture, /addTask\(item\.content, 'BACKLOG'/);
  assert.match(mobileProgress, /addTask\(item\.content, 'BACKLOG'/);
  assert.match(capture, /addInspiration/);
  assert.match(capture, /saveReflection/);
  assert.match(taskBoard, /date="BACKLOG"/);
  assert.doesNotMatch(types, /CaptureItem|BacklogItem|MobileStepperRecord/);
});
