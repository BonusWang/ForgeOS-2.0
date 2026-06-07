import type { StateCreator } from 'zustand';
import type { CosSyncConfig, SyncStatus } from '../../types/sync';

export interface SyncSlice {
  syncConfig: CosSyncConfig;
  syncStatus: SyncStatus;
  updateSyncConfig: (config: Partial<CosSyncConfig>) => void;
  setSyncStatus: (status: Partial<SyncStatus>) => void;
  clearSyncConflict: () => void;
}

const createDeviceId = (): string => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `device-${Date.now().toString(36)}`;
};

export const DEFAULT_COS_SYNC_CONFIG: CosSyncConfig = {
  enabled: false,
  endpoint: 'cos.ap-guangzhou.myqcloud.com',
  region: 'ap-guangzhou',
  bucket: 'workbase-1321785586',
  profileId: 'default',
  objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
  credentialProviderUrl: 'http://127.0.0.1:8787/cos/sign',
  accessKeyId: '',
  secretAccessKey: '',
};

export const createDefaultSyncStatus = (): SyncStatus => ({
  phase: 'idle',
  deviceId: createDeviceId(),
});

export const createSyncSlice: StateCreator<SyncSlice> = (set) => ({
  syncConfig: DEFAULT_COS_SYNC_CONFIG,
  syncStatus: createDefaultSyncStatus(),

  updateSyncConfig: (config) =>
    set((state) => ({
      syncConfig: {
        ...state.syncConfig,
        ...config,
      },
    })),

  setSyncStatus: (status) =>
    set((state) => ({
      syncStatus: {
        ...state.syncStatus,
        ...status,
        deviceId: status.deviceId ?? state.syncStatus.deviceId,
      },
    })),

  clearSyncConflict: () =>
    set((state) => ({
      syncStatus: {
        ...state.syncStatus,
        phase: 'idle',
        conflict: undefined,
      },
    })),
});
