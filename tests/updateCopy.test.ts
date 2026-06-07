import assert from 'node:assert/strict';
import test from 'node:test';
import { pickUpdateErrorCopy, systemCopy } from '../src/copy/system-copy.ts';

test('pickUpdateErrorCopy returns deterministic messages from the error copy list', () => {
  assert.equal(
    pickUpdateErrorCopy(() => 0),
    systemCopy.update.updateErrors[0]
  );
  assert.equal(
    pickUpdateErrorCopy(() => 0.999),
    systemCopy.update.updateErrors[systemCopy.update.updateErrors.length - 1]
  );
});
