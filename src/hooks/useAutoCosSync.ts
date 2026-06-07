import { useEffect, useRef } from 'react';
import {
  createDirectCosCredentialProvider,
  hasDirectCosCredentials,
} from '../sync/directCosCredentialProvider';
import { createHttpCosCredentialProvider } from '../sync/httpCosCredentialProvider';
import { isV3SyncEnvelope } from '../sync/v3/v3SyncEnvelope.ts';
import { createV3SyncClient } from '../sync/v3/v3SyncClient.ts';
import { createV3SyncOwner, v3SyncObjectKey } from '../sync/v3/v3SyncNamespace.ts';
import { runV3Sync, type V3SyncResult } from '../sync/v3/v3SyncRunner.ts';
import { useAppStore } from '../store/useAppStore';
import { APP_VERSION } from '../utils/checkUpdate';

const AUTO_SYNC_DEBOUNCE_MS = 1800;
const AUTO_SYNC_POLL_MS = 30000;

const createCredentialProvider = (syncConfig: ReturnType<typeof useAppStore.getState>['syncConfig']) =>
  hasDirectCosCredentials(syncConfig)
    ? createDirectCosCredentialProvider({
        accessKeyId: syncConfig.accessKeyId ?? '',
        secretAccessKey: syncConfig.secretAccessKey ?? '',
        bucket: syncConfig.bucket,
        region: syncConfig.region,
        endpoint: syncConfig.endpoint,
      })
    : createHttpCosCredentialProvider({
        endpoint: syncConfig.credentialProviderUrl,
      });

const applyV3SyncResult = (result: V3SyncResult): void => {
  const state = useAppStore.getState();
  const deviceId = state.syncStatus.deviceId;

  if (result.phase === 'not-configured') {
    state.setSyncStatus({ phase: 'not-configured' });
    return;
  }

  if (result.phase === 'error') {
    state.setSyncStatus({
      phase: 'error',
      lastError: result.error,
      v3SyncLastError: result.error,
    });
    return;
  }

  if (result.phase === 'conflict') {
    state.setSyncStatus({
      phase: 'conflict',
      lastError: `V3 同步检测到 ${result.conflicts.length} 个字段冲突`,
      conflict: undefined,
      v3SyncRevision: result.revision,
      v3SyncBase: result.baseEnvelope,
      v3SyncNamespace: result.baseEnvelope.owner.namespace,
      v3SyncAutoMerged: result.autoMerged,
      v3SyncConflicts: result.conflicts.length,
      v3SyncLastError: undefined,
    });
    return;
  }

  useAppStore.setState({
    ...result.state,
    syncConfig: state.syncConfig,
    syncStatus: {
      ...state.syncStatus,
      phase: 'success',
      deviceId,
      lastSyncedAt: new Date().toISOString(),
      lastLocalUpdatedAt: undefined,
      lastError: undefined,
      conflict: undefined,
      v3SyncRevision: result.revision,
      v3SyncBase: result.baseEnvelope,
      v3SyncNamespace: result.baseEnvelope.owner.namespace,
      v3SyncInitializedAt:
        state.syncStatus.v3SyncInitializedAt ?? result.baseEnvelope.updatedAt,
      v3SyncAutoMerged: result.autoMerged,
      v3SyncConflicts: result.conflicts.length,
      v3SyncLastError: undefined,
    },
  });
};

const runAutoSyncNow = async ({ hasLocalChanges }: { hasLocalChanges: boolean }) => {
  const current = useAppStore.getState();
  const syncConfig = current.syncConfig;
  const syncStatus = current.syncStatus;

  if (!syncConfig.enabled || (!syncStatus.v3SyncRevision && !syncStatus.lastSyncedRevision)) return;
  if (syncStatus.phase === 'syncing' || syncStatus.phase === 'conflict') return;
  if (hasLocalChanges && !syncStatus.lastLocalUpdatedAt) return;

  current.setSyncStatus({ phase: 'syncing', lastError: undefined });

  const credentialProvider = createCredentialProvider(syncConfig);
  const result = await runV3Sync({
    config: syncConfig,
    client: createV3SyncClient({
      credentialProvider,
      appVersion: APP_VERSION,
      owner: createV3SyncOwner(syncConfig),
    }),
    key: v3SyncObjectKey(syncConfig),
    appVersion: APP_VERSION,
    deviceId: syncStatus.deviceId,
    state: useAppStore.getState(),
    baseEnvelope: isV3SyncEnvelope(syncStatus.v3SyncBase)
      ? syncStatus.v3SyncBase
      : undefined,
    hasLocalChanges,
  });

  applyV3SyncResult(result);
};

export const useAutoCosSync = () => {
  const syncConfig = useAppStore((state) => state.syncConfig);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const lastAttemptedLocalUpdatedAtRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (
      !syncConfig.enabled ||
      !syncStatus.lastLocalUpdatedAt ||
      (!syncStatus.v3SyncRevision && !syncStatus.lastSyncedRevision)
    ) return;
    if (syncStatus.phase === 'syncing' || syncStatus.phase === 'conflict') return;
    if (lastAttemptedLocalUpdatedAtRef.current === syncStatus.lastLocalUpdatedAt) return;

    const queuedLocalUpdatedAt = syncStatus.lastLocalUpdatedAt;

    const timer = window.setTimeout(() => {
      const { syncStatus } = useAppStore.getState();

      if (syncStatus.lastLocalUpdatedAt !== queuedLocalUpdatedAt) return;
      lastAttemptedLocalUpdatedAtRef.current = syncStatus.lastLocalUpdatedAt;
      runAutoSyncNow({ hasLocalChanges: true }).catch((error) => {
        useAppStore.getState().setSyncStatus({
          phase: 'error',
          lastError: error instanceof Error ? error.message : 'auto sync failed',
        });
      });
    }, AUTO_SYNC_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    syncConfig.enabled,
    syncConfig.endpoint,
    syncConfig.region,
    syncConfig.bucket,
    syncConfig.profileId,
    syncConfig.userId,
    syncConfig.credentialProviderUrl,
    syncConfig.accessKeyId,
    syncConfig.secretAccessKey,
    syncConfig.objectPrefix,
    syncStatus.deviceId,
    syncStatus.v3SyncRevision,
    syncStatus.lastLocalUpdatedAt,
    syncStatus.lastSyncedRevision,
    syncStatus.phase,
  ]);

  useEffect(() => {
    if (!syncConfig.enabled || (!syncStatus.v3SyncRevision && !syncStatus.lastSyncedRevision)) return;
    if (syncStatus.lastLocalUpdatedAt) return;
    if (syncStatus.phase === 'syncing' || syncStatus.phase === 'conflict') return;

    const runRemoteCheck = () => {
      const { syncStatus } = useAppStore.getState();
      if (syncStatus.lastLocalUpdatedAt) return;
      void runAutoSyncNow({ hasLocalChanges: false }).catch((error) => {
        useAppStore.getState().setSyncStatus({
          phase: 'error',
          lastError: error instanceof Error ? error.message : 'auto sync failed',
        });
      });
    };

    const interval = window.setInterval(runRemoteCheck, AUTO_SYNC_POLL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') runRemoteCheck();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    syncConfig.enabled,
    syncConfig.endpoint,
    syncConfig.region,
    syncConfig.bucket,
    syncConfig.profileId,
    syncConfig.userId,
    syncConfig.credentialProviderUrl,
    syncConfig.accessKeyId,
    syncConfig.secretAccessKey,
    syncConfig.objectPrefix,
    syncStatus.v3SyncRevision,
    syncStatus.lastLocalUpdatedAt,
    syncStatus.lastSyncedRevision,
    syncStatus.phase,
  ]);
};
