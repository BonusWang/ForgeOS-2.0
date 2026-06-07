import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('ascii progress uses CSS fill and muted track instead of shaded text glyphs', () => {
  const progress = read('src/components/AsciiProgress.tsx');
  const css = read('src/index.css');

  assert.match(progress, /ascii-progress-track/);
  assert.match(progress, /ascii-progress-fill/);
  assert.match(progress, /--ascii-progress-width/);
  assert.match(progress, /width:\s*`\$\{percent\}%`/);
  assert.doesNotMatch(progress, /░/);

  assert.match(css, /\.ascii-progress-track/);
  assert.match(css, /\.ascii-progress-fill/);
});

test('today progress expands the track across the card', () => {
  const todayProgress = read('src/features/tasks/TodayProgress.tsx');
  const css = read('src/index.css');

  assert.match(todayProgress, /className="today-progress-bar"/);
  assert.match(css, /\.today-progress-bar/);
  assert.match(css, /\.today-progress-bar \.ascii-progress-frame[\s\S]*flex:\s*0 1 80%/);
  assert.match(css, /\.today-progress-bar \.ascii-progress-track[\s\S]*flex:\s*1 1 auto/);
});
