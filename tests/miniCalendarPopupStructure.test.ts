import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('calendar popup fixed positioning uses viewport coordinates without scroll offsets', () => {
  const miniCalendar = read('src/components/MiniCalendar.tsx');

  assert.match(miniCalendar, /position:\s*'fixed'/);
  assert.doesNotMatch(miniCalendar, /window\.scrollY/);
  assert.doesNotMatch(miniCalendar, /window\.scrollX/);
});
