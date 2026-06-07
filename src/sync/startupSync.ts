import type { ManualSyncResult, RunManualSyncInput } from './manualSync.ts';
import { runManualSync } from './manualSync.ts';

export const runStartupSync = async (
  input: RunManualSyncInput
): Promise<ManualSyncResult> => {
  if (!input.lastSyncedRevision) {
    return {
      phase: 'idle',
      reason: 'first-sync-requires-manual-choice',
    };
  }

  return runManualSync(input);
};
