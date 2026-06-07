import { cosObjectPrefix } from '../cosObjectKeys.ts';
import type { CosSyncConfig } from '../../types/sync';
import type { V3SyncOwner } from './v3SyncTypes.ts';

export const V3_SYNC_OBJECT_NAME = 'forge-data.entities.v3.json';

export type V3SyncNamespaceConfig = Pick<CosSyncConfig, 'objectPrefix' | 'profileId' | 'userId'>;

const safePathPart = (value: string): string => encodeURIComponent(value || 'default');

export const createV3SyncNamespace = (config: V3SyncNamespaceConfig): string => {
  const prefix = cosObjectPrefix(config);
  const profileId = safePathPart(config.profileId || 'default');
  const userId = config.userId?.trim();

  if (userId) {
    return `${prefix}/users/${safePathPart(userId)}/profiles/${profileId}`;
  }

  return `${prefix}/profiles/${profileId}`;
};

export const createV3SyncOwner = (config: V3SyncNamespaceConfig): V3SyncOwner => ({
  namespace: createV3SyncNamespace(config),
  profileId: config.profileId || 'default',
  ...(config.userId?.trim() ? { userId: config.userId.trim() } : {}),
});

export const v3SyncObjectKey = (config: V3SyncNamespaceConfig): string =>
  `${createV3SyncNamespace(config)}/${V3_SYNC_OBJECT_NAME}`;
