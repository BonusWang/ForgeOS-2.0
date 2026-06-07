import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('module picker uses explicit switch controls with visible enabled and hidden states', () => {
  const picker = read('src/features/modules/ModulePicker.tsx');

  assert.match(picker, /useState/);
  assert.match(picker, /type="checkbox"/);
  assert.match(picker, /checked=\{isEnabled\}/);
  assert.match(picker, /handleModuleToggle\(mod\.id as ModuleId,\s*mod\.name,\s*!isEnabled\)/);
  assert.match(picker, /module-picker-switch-track/);
  assert.match(picker, /module-picker-switch-thumb/);
  assert.match(picker, /module-picker-row\$\{isEnabled \? ' is-enabled' : ' is-disabled'\}/);
  assert.match(picker, /is-changing/);
  assert.match(picker, /module-picker-feedback/);
  assert.match(picker, /aria-live="polite"/);
  assert.match(picker, /isEnabled \? '已显示' : '已隐藏'/);
  assert.match(picker, /完成/);
  assert.doesNotMatch(picker, /aria-pressed=\{isEnabled\}/);
});

test('module picker switch styling makes state changes visually obvious on mobile', () => {
  const css = read('src/index.css');

  assert.match(css, /\.module-picker-row\.is-enabled[\s\S]*box-shadow/);
  assert.match(css, /\.module-picker-row\.is-disabled[\s\S]*opacity/);
  assert.match(css, /\.module-picker-row\.is-changing[\s\S]*animation:\s*module-picker-pulse/);
  assert.match(css, /@keyframes module-picker-pulse/);
  assert.match(css, /\.module-picker-feedback[\s\S]*min-height/);
  assert.match(css, /\.module-picker-switch-track[\s\S]*border-radius:\s*999px/);
  assert.match(css, /\.module-picker-row\.is-enabled \.module-picker-switch-track[\s\S]*background/);
  assert.match(css, /\.module-picker-row\.is-enabled \.module-picker-switch-thumb[\s\S]*transform:\s*translateX/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.module-picker-control[\s\S]*min-width:\s*64px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.module-picker-zone[\s\S]*display:\s*none/);
});
