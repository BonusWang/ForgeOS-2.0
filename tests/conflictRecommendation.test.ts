import assert from 'node:assert/strict';
import test from 'node:test';
import { recommendConflictChoice } from '../src/sync/conflictRecommendation.ts';

test('conflict recommendation prefers the side with the latest update time', () => {
  assert.equal(
    recommendConflictChoice('2026-06-03T08:00:00.000Z', '2026-06-03T09:00:00.000Z'),
    'use-remote'
  );
  assert.equal(
    recommendConflictChoice('2026-06-03T10:00:00.000Z', '2026-06-03T09:00:00.000Z'),
    'keep-local'
  );
  assert.equal(
    recommendConflictChoice('2026-06-03T10:00:00.000Z', '2026-06-03T10:00:00.000Z'),
    'keep-local'
  );
});

test('conflict recommendation waits for both timestamps before recommending', () => {
  assert.equal(recommendConflictChoice(undefined, '2026-06-03T09:00:00.000Z'), null);
  assert.equal(recommendConflictChoice('2026-06-03T09:00:00.000Z', undefined), null);
});
