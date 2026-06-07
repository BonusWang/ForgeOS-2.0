import type { AppState } from '../types';
import type { CosSyncConfig, CosSyncEnvelope, StorageRecord } from '../types/sync';
import { createSyncEnvelope, restoreAppStateFromSyncEnvelope } from '../utils/syncEnvelope.ts';
import type { CosSyncClient } from './cosSyncClient.ts';

type FirstSyncMode = 'upload-local' | 'restore-remote';
type ConflictChoice = 'keep-local' | 'use-remote' | 'later';

type ManualSyncSuccessAction = 'uploaded' | 'restored' | 'noop';

export type CloudBackupResult =
  | { phase: 'not-configured' }
  | {
      phase: 'success';
      action: 'cloud-backup';
      revision: string;
      backupKey: string;
    }
  | { phase: 'error'; error: string };

export type ManualSyncResult =
  | { phase: 'idle'; reason: 'first-sync-requires-manual-choice' }
  | { phase: 'not-configured' }
  | {
      phase: 'success';
      action: ManualSyncSuccessAction;
      revision: string;
      state?: AppState;
    }
  | {
      phase: 'conflict';
      localRevision: string;
      remoteRevision: string;
      backupKey?: string;
      localUpdatedAt?: string;
      remoteUpdatedAt?: string;
      remoteEnvelope?: CosSyncEnvelope;
    }
  | { phase: 'conflict'; action: 'deferred' }
  | { phase: 'error'; error: string };

export interface RunManualSyncInput {
  config: CosSyncConfig;
  client: CosSyncClient;
  key: string;
  appVersion: string;
  deviceId: string;
  storageRecord: StorageRecord;
  backupKey?: string;
  lastSyncedRevision?: string;
  hasLocalChanges?: boolean;
  localUpdatedAt?: string;
  firstSyncMode?: FirstSyncMode;
  now?: string;
}

export interface RunCloudBackupInput {
  config: CosSyncConfig;
  client: CosSyncClient;
  key: string;
  backupKey: string;
  appVersion: string;
  deviceId: string;
  storageRecord: StorageRecord;
  now?: string;
}

export interface RestoreCloudSnapshotInput {
  config: CosSyncConfig;
  client: CosSyncClient;
  key: string;
  appVersion: string;
}

interface ResolveSyncConflictInput {
  choice: ConflictChoice;
  client: CosSyncClient;
  key: string;
  appVersion: string;
  deviceId: string;
  storageRecord: StorageRecord;
  remoteEnvelope: CosSyncEnvelope;
  now?: string;
}

const hasDirectCredentials = (config: CosSyncConfig): boolean =>
  Boolean(config.accessKeyId?.trim() && config.secretAccessKey?.trim());

const isConfigReady = (config: CosSyncConfig): boolean =>
  Boolean(
    config.enabled &&
      config.endpoint?.trim() &&
      config.region?.trim() &&
      config.bucket?.trim() &&
      config.profileId?.trim() &&
      (config.credentialProviderUrl?.trim() || hasDirectCredentials(config))
  );

const revisionTimestamp = (now?: string): string => now ?? new Date().toISOString();

const createLocalEnvelope = ({
  appVersion,
  deviceId,
  storageRecord,
  now,
}: {
  appVersion: string;
  deviceId: string;
  storageRecord: StorageRecord;
  now?: string;
}) => {
  const updatedAt = revisionTimestamp(now);
  return createSyncEnvelope({
    appVersion,
    deviceId,
    revision: `${deviceId}:${updatedAt}`,
    updatedAt,
    storageRecord,
  });
};

const restoreRemote = async (
  remoteEnvelope: CosSyncEnvelope,
  appVersion: string
): Promise<ManualSyncResult> => {
  const restored = await restoreAppStateFromSyncEnvelope(remoteEnvelope, appVersion);
  if (!restored.ok) {
    return { phase: 'error', error: restored.error };
  }

  return {
    phase: 'success',
    action: 'restored',
    revision: remoteEnvelope.revision,
    state: restored.state,
  };
};

const uploadLocal = async ({
  client,
  key,
  backupKey,
  appVersion,
  deviceId,
  storageRecord,
  now,
}: Pick<
  RunManualSyncInput,
  'client' | 'key' | 'backupKey' | 'appVersion' | 'deviceId' | 'storageRecord' | 'now'
>): Promise<ManualSyncResult> => {
  const envelope = await createLocalEnvelope({ appVersion, deviceId, storageRecord, now });
  await client.uploadSnapshot(key, envelope);
  if (backupKey) {
    await client.uploadBackupSnapshot(backupKey, envelope);
  }
  return { phase: 'success', action: 'uploaded', revision: envelope.revision };
};

export const runManualSync = async (input: RunManualSyncInput): Promise<ManualSyncResult> => {
  if (!isConfigReady(input.config)) {
    return { phase: 'not-configured' };
  }

  try {
    const remoteEnvelope = await input.client.downloadSnapshot(input.key);

    if (!remoteEnvelope) {
      if (input.firstSyncMode === 'restore-remote') {
        return { phase: 'error', error: '云端暂无可恢复数据' };
      }

      return await uploadLocal(input);
    }

    if (!input.lastSyncedRevision) {
      if (input.firstSyncMode === 'restore-remote') {
        return await restoreRemote(remoteEnvelope, input.appVersion);
      }

      return await uploadLocal(input);
    }

    if (remoteEnvelope.revision === input.lastSyncedRevision) {
      if (input.hasLocalChanges === false) {
        return {
          phase: 'success',
          action: 'noop',
          revision: remoteEnvelope.revision,
        };
      }

      return await uploadLocal(input);
    }

    if (input.hasLocalChanges === false) {
      return await restoreRemote(remoteEnvelope, input.appVersion);
    }

    if (remoteEnvelope.deviceId === input.deviceId) {
      return await uploadLocal(input);
    }

    const localEnvelope = await createLocalEnvelope(input);
    if (input.backupKey) {
      await input.client.uploadBackupSnapshot(input.backupKey, localEnvelope);
    }

    return {
      phase: 'conflict',
      localRevision: localEnvelope.revision,
      remoteRevision: remoteEnvelope.revision,
      backupKey: input.backupKey,
      localUpdatedAt: input.localUpdatedAt ?? localEnvelope.updatedAt,
      remoteUpdatedAt: remoteEnvelope.updatedAt,
      remoteEnvelope,
    };
  } catch (error) {
    return {
      phase: 'error',
      error: error instanceof Error ? error.message : 'sync failed',
    };
  }
};

export const resolveSyncConflict = async ({
  choice,
  client,
  key,
  appVersion,
  deviceId,
  storageRecord,
  remoteEnvelope,
  now,
}: ResolveSyncConflictInput): Promise<ManualSyncResult> => {
  if (choice === 'later') {
    return { phase: 'conflict', action: 'deferred' };
  }

  if (choice === 'use-remote') {
    return restoreRemote(remoteEnvelope, appVersion);
  }

  return uploadLocal({
    client,
    key,
    appVersion,
    deviceId,
    storageRecord,
    now,
  });
};

export const runCloudBackup = async ({
  config,
  client,
  key,
  backupKey,
  appVersion,
  deviceId,
  storageRecord,
  now,
}: RunCloudBackupInput): Promise<CloudBackupResult> => {
  if (!isConfigReady(config)) {
    return { phase: 'not-configured' };
  }

  try {
    const envelope = await createLocalEnvelope({ appVersion, deviceId, storageRecord, now });
    await client.uploadSnapshot(key, envelope);
    await client.uploadBackupSnapshot(backupKey, envelope);

    return {
      phase: 'success',
      action: 'cloud-backup',
      revision: envelope.revision,
      backupKey,
    };
  } catch (error) {
    return {
      phase: 'error',
      error: error instanceof Error ? error.message : 'cloud backup failed',
    };
  }
};

export const restoreCloudSnapshot = async ({
  config,
  client,
  key,
  appVersion,
}: RestoreCloudSnapshotInput): Promise<ManualSyncResult> => {
  if (!isConfigReady(config)) {
    return { phase: 'not-configured' };
  }

  try {
    const remoteEnvelope = await client.downloadSnapshot(key);
    if (!remoteEnvelope) {
      return { phase: 'error', error: '云端暂无可恢复数据' };
    }

    return await restoreRemote(remoteEnvelope, appVersion);
  } catch (error) {
    return {
      phase: 'error',
      error: error instanceof Error ? error.message : 'cloud restore failed',
    };
  }
};
