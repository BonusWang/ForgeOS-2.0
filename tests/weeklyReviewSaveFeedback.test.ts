import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path: string) => fs.readFileSync(path, 'utf-8');

test('desktop weekly review gives visible feedback after saving', () => {
  const weeklyReview = read('src/pages/WeeklyReview.tsx');
  const reflectionQuickEntry = read('src/features/reflections/ReflectionQuickEntry.tsx');

  assert.match(reflectionQuickEntry, /todayReflection && !showForm/);
  assert.match(weeklyReview, /existingReview && !isEditing/);
  assert.match(weeklyReview, /周复盘已保存/);
  assert.match(weeklyReview, /查看\/编辑周复盘/);
  assert.match(weeklyReview, /setIsEditing\(false\)/);
  assert.doesNotMatch(weeklyReview, /saveStatus|setSaveStatus/);
});
