import type {
  CosSyncConfig,
  CosSyncEnvelope,
  SyncStatus,
} from './sync';

export const SYNC_TYPE_CONTRACT = {
  config: {
    enabled: true,
    endpoint: 'cos.ap-guangzhou.myqcloud.com',
    region: 'ap-guangzhou',
    bucket: 'workbase-1321785586',
    profileId: 'default',
    objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
    credentialProviderUrl: 'https://example.com/cos-credentials',
  } satisfies CosSyncConfig,
  status: {
    phase: 'idle',
    deviceId: 'device-1',
  } satisfies SyncStatus,
  envelope: {
    schemaVersion: 1,
    appVersion: '1.0.4',
    deviceId: 'device-1',
    revision: 'revision-1',
    updatedAt: '2026-06-03T00:00:00.000Z',
    checksum: 'checksum',
    storageRecord: {
      'forge-storage': '{"state":{},"version":0}',
    },
  } satisfies CosSyncEnvelope,
};
