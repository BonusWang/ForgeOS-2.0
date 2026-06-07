export type StorageRecord = Record<string, string>;

export type SyncPhase =
  | 'not-configured'
  | 'idle'
  | 'syncing'
  | 'success'
  | 'error'
  | 'conflict';

export interface CosSyncConfig {
  enabled: boolean;
  endpoint: string;
  region: string;
  bucket: string;
  profileId: string;
  userId?: string;
  objectPrefix: string;
  credentialProviderUrl: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

export type CosObjectMethod = 'GET' | 'PUT';

export interface CosSignedUrlRequest {
  key: string;
  method: CosObjectMethod;
  contentType?: string;
}

export interface CosSignedUrl {
  url: string;
  expiresAt: string;
  headers?: Record<string, string>;
}

export interface CosCredentialProvider {
  getSignedUrl: (request: CosSignedUrlRequest) => Promise<CosSignedUrl>;
}

export interface CloudBackupSnapshot {
  key: string;
  lastModified?: string;
  size?: string;
}

export interface CloudBackupHistoryProvider {
  listSnapshots: (config: Pick<CosSyncConfig, 'objectPrefix'>) => Promise<CloudBackupSnapshot[]>;
}

export interface SyncConflictState {
  localRevision: string;
  remoteRevision: string;
  localUpdatedAt?: string;
  remoteUpdatedAt?: string;
  backupKey?: string;
}

export interface SyncStatus {
  phase: SyncPhase;
  deviceId: string;
  lastSyncedAt?: string;
  lastSyncedRevision?: string;
  lastLocalUpdatedAt?: string;
  lastError?: string;
  conflict?: SyncConflictState;
  v3SyncRevision?: string;
  v3SyncBase?: unknown;
  v3SyncNamespace?: string;
  v3SyncInitializedAt?: string;
  v3SyncAutoMerged?: number;
  v3SyncConflicts?: number;
  v3SyncLastError?: string;
}

export interface CosSyncEnvelope {
  schemaVersion: 1;
  appVersion: string;
  deviceId: string;
  revision: string;
  updatedAt: string;
  checksum: string;
  storageRecord: StorageRecord;
}
