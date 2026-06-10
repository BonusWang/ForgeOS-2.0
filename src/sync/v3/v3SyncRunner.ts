import type { AppState } from '../../types';
import type { CosSyncConfig } from '../../types/sync.ts';
import { createV3SyncEntitiesFromAppState, restoreAppStateFromV3SyncEntities } from './v3EntityAdapter.ts';
import { createV3SyncEnvelope, validateV3SyncEnvelope } from './v3SyncEnvelope.ts';
import { mergeV3SyncDocuments } from './v3MergeEngine.ts';
import { createV3SyncOwner } from './v3SyncNamespace.ts';
import type { V3SyncConflict, V3SyncEnvelope } from './v3SyncTypes.ts';
import type { V3SyncClient } from './v3SyncClient.ts';

export type { V3SyncClient } from './v3SyncClient.ts';

export type V3SyncResult =
  | { phase: 'not-configured' }
  | {
      phase: 'success';
      action: 'initialized' | 'downloaded' | 'merged' | 'uploaded' | 'noop';
      revision: string;
      state: AppState;
      baseEnvelope: V3SyncEnvelope;
      conflicts: V3SyncConflict[];
      autoMerged: number;
    }
  | {
      phase: 'conflict';
      revision: string;
      state: AppState;
      baseEnvelope: V3SyncEnvelope;
      conflicts: V3SyncConflict[];
      autoMerged: number;
    }
  | { phase: 'error'; error: string };

export interface RunV3SyncInput {
  config: CosSyncConfig;
  client: V3SyncClient;
  key: string;
  appVersion: string;
  deviceId: string;
  state: AppState;
  baseEnvelope?: V3SyncEnvelope;
  hasLocalChanges?: boolean;
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

const createLocalV3Envelope = ({
  state,
  appVersion,
  deviceId,
  config,
  now,
  baseEnvelope,
}: {
  state: AppState;
  appVersion: string;
  deviceId: string;
  config: CosSyncConfig;
  now: string;
  baseEnvelope?: V3SyncEnvelope;
}): Promise<V3SyncEnvelope> =>
  createV3SyncEnvelope({
    appVersion,
    deviceId,
    owner: createV3SyncOwner(config),
    entities: createV3SyncEntitiesFromAppState({ state, updatedAt: now, updatedBy: deviceId }),
    tombstones: baseEnvelope?.tombstones ?? [],
    conflicts: baseEnvelope?.conflicts ?? [],
    updatedAt: now,
  });

export const runV3Sync = async ({
  config,
  client,
  key,
  appVersion,
  deviceId,
  state,
  baseEnvelope,
  hasLocalChanges = false,
  now,
}: RunV3SyncInput): Promise<V3SyncResult> => {
  if (!isConfigReady(config)) {
    return { phase: 'not-configured' };
  }

  const updatedAt = now ?? new Date().toISOString();
  const owner = createV3SyncOwner(config);

  try {
    const remoteEnvelope = await client.downloadV3Snapshot(key);

    if (!remoteEnvelope) {
      const localEnvelope = await createLocalV3Envelope({
        state,
        appVersion,
        deviceId,
        config,
        now: updatedAt,
      });
      await client.uploadV3Snapshot(key, localEnvelope);

      return {
        phase: 'success',
        action: 'initialized',
        revision: localEnvelope.revision,
        state,
        baseEnvelope: localEnvelope,
        conflicts: [],
        autoMerged: 0,
      };
    }

    const remoteValidation = await validateV3SyncEnvelope(remoteEnvelope, { appVersion, owner });
    if (!remoteValidation.ok) {
      return { phase: 'error', error: remoteValidation.error };
    }

    if (!baseEnvelope) {
      return {
        phase: 'success',
        action: 'downloaded',
        revision: remoteEnvelope.revision,
        state: restoreAppStateFromV3SyncEntities(state, remoteEnvelope.entities),
        baseEnvelope: remoteEnvelope,
        conflicts: remoteEnvelope.conflicts,
        autoMerged: 0,
      };
    }

    if (!hasLocalChanges) {
      if (baseEnvelope?.revision === remoteEnvelope.revision && !hasLocalChanges) {
        return {
          phase: 'success',
          action: 'noop',
          revision: baseEnvelope.revision,
          state,
          baseEnvelope,
          conflicts: baseEnvelope.conflicts,
          autoMerged: 0,
        };
      }

      return {
        phase: 'success',
        action: 'downloaded',
        revision: remoteEnvelope.revision,
        state: restoreAppStateFromV3SyncEntities(state, remoteEnvelope.entities),
        baseEnvelope: remoteEnvelope,
        conflicts: remoteEnvelope.conflicts,
        autoMerged: 0,
      };
    }

    const localEnvelope = await createLocalV3Envelope({
      state,
      appVersion,
      deviceId,
      config,
      now: updatedAt,
      baseEnvelope,
    });
    const merged = mergeV3SyncDocuments({
      base: baseEnvelope,
      local: localEnvelope,
      remote: remoteEnvelope,
      deviceId,
      now: updatedAt,
    });
    const mergedEnvelope = await createV3SyncEnvelope({
      appVersion,
      deviceId,
      owner,
      entities: merged.entities,
      tombstones: merged.tombstones,
      conflicts: merged.conflicts,
      updatedAt,
    });

    await client.uploadV3Snapshot(key, mergedEnvelope);

    if (merged.conflicts.length > 0) {
      return {
        phase: 'conflict',
        revision: mergedEnvelope.revision,
        state: restoreAppStateFromV3SyncEntities(state, mergedEnvelope.entities),
        baseEnvelope: mergedEnvelope,
        conflicts: merged.conflicts,
        autoMerged: merged.autoMerged,
      };
    }

    return {
      phase: 'success',
      action: merged.autoMerged > 0 ? 'merged' : 'uploaded',
      revision: mergedEnvelope.revision,
      state: restoreAppStateFromV3SyncEntities(state, mergedEnvelope.entities),
      baseEnvelope: mergedEnvelope,
      conflicts: [],
      autoMerged: merged.autoMerged,
    };
  } catch (error) {
    return {
      phase: 'error',
      error: error instanceof Error ? error.message : 'v3-sync-failed',
    };
  }
};
