import type { AppState } from '../types';
import type { StorageRecord } from '../types/sync';
import { PERSISTED_APP_STATE_KEYS } from '../types/persistedStateContract.ts';

export const createPersistedAppStateSnapshot = (state: AppState): Partial<AppState> => {
  const snapshot: Partial<AppState> = {};

  for (const key of PERSISTED_APP_STATE_KEYS) {
    if (key === 'syncConfig') {
      const safeConfig = { ...state.syncConfig };
      delete safeConfig.accessKeyId;
      delete safeConfig.secretAccessKey;
      snapshot.syncConfig = safeConfig;
      continue;
    }

    snapshot[key] = state[key] as never;
  }

  return snapshot;
};

export const createStorageRecordFromAppState = (state: AppState): StorageRecord => ({
  'forge-storage': JSON.stringify({
    state: createPersistedAppStateSnapshot(state),
    version: 0,
  }),
});
