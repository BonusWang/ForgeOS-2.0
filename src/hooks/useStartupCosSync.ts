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

const applyStartupV3Result = (result: V3SyncResult): void => {
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
      lastError: `启动 V3 同步检测到 ${result.conflicts.length} 个字段冲突`,
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

export const useStartupCosSync = () => {
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const state = useAppStore.getState();
    const { syncConfig, syncStatus } = state;
    if (!syncConfig.enabled || (!syncStatus.v3SyncRevision && !syncStatus.lastSyncedRevision)) return;

    const run = async () => {
      state.setSyncStatus({ phase: 'syncing', lastError: undefined });
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
        state,
        baseEnvelope: isV3SyncEnvelope(syncStatus.v3SyncBase)
          ? syncStatus.v3SyncBase
          : undefined,
        hasLocalChanges: Boolean(syncStatus.lastLocalUpdatedAt),
      });

      applyStartupV3Result(result);
    };

    run().catch((error) => {
      useAppStore.getState().setSyncStatus({
        phase: 'error',
        lastError: error instanceof Error ? error.message : 'startup sync failed',
      });
    });
  }, []);
};
