import type { CosSyncEnvelope, StorageRecord } from '../types/sync';
import type { AppState } from '../types';
import { compareVersion } from './checkUpdate.ts';
import { migrateAppData } from './migrateAppData.ts';

export type SyncEnvelopeValidationError =
  | 'invalid-envelope'
  | 'invalid-storage-record'
  | 'missing-forge-storage'
  | 'checksum-mismatch';

export type SyncEnvelopeValidationResult =
  | { ok: true; envelope: CosSyncEnvelope }
  | { ok: false; error: SyncEnvelopeValidationError };

export type RestoreAppStateFromSyncEnvelopeError =
  | SyncEnvelopeValidationError
  | 'invalid-forge-storage'
  | 'missing-state'
  | 'newer-remote-version';

export type RestoreAppStateFromSyncEnvelopeResult =
  | { ok: true; state: AppState }
  | { ok: false; error: RestoreAppStateFromSyncEnvelopeError };

interface CreateSyncEnvelopeInput {
  appVersion: string;
  deviceId: string;
  revision: string;
  updatedAt: string;
  storageRecord: StorageRecord;
}

const stableStringify = (value: unknown): string => {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
};

const toHex = (bytes: ArrayBuffer): string =>
  [...new Uint8Array(bytes)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

export const checksumStorageRecord = async (storageRecord: StorageRecord): Promise<string> => {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(stableStringify(storageRecord))
  );
  return toHex(digest);
};

const isStringRecord = (value: unknown): value is StorageRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.values(value).every((item) => typeof item === 'string');
};

export const createSyncEnvelope = async ({
  appVersion,
  deviceId,
  revision,
  updatedAt,
  storageRecord,
}: CreateSyncEnvelopeInput): Promise<CosSyncEnvelope> => ({
  schemaVersion: 1,
  appVersion,
  deviceId,
  revision,
  updatedAt,
  checksum: await checksumStorageRecord(storageRecord),
  storageRecord,
});

export const validateSyncEnvelope = async (
  value: unknown
): Promise<SyncEnvelopeValidationResult> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'invalid-envelope' };
  }

  const envelope = value as Partial<CosSyncEnvelope>;
  if (
    envelope.schemaVersion !== 1 ||
    typeof envelope.appVersion !== 'string' ||
    typeof envelope.deviceId !== 'string' ||
    typeof envelope.revision !== 'string' ||
    typeof envelope.updatedAt !== 'string' ||
    typeof envelope.checksum !== 'string'
  ) {
    return { ok: false, error: 'invalid-envelope' };
  }

  if (!isStringRecord(envelope.storageRecord)) {
    return { ok: false, error: 'invalid-storage-record' };
  }

  if (typeof envelope.storageRecord['forge-storage'] !== 'string') {
    return { ok: false, error: 'missing-forge-storage' };
  }

  const expectedChecksum = await checksumStorageRecord(envelope.storageRecord);
  if (envelope.checksum !== expectedChecksum) {
    return { ok: false, error: 'checksum-mismatch' };
  }

  return {
    ok: true,
    envelope: envelope as CosSyncEnvelope,
  };
};

export const restoreAppStateFromSyncEnvelope = async (
  value: unknown,
  targetVersion: string
): Promise<RestoreAppStateFromSyncEnvelopeResult> => {
  const validation = await validateSyncEnvelope(value);
  if (!validation.ok) return validation;

  if (compareVersion(validation.envelope.appVersion, targetVersion) > 0) {
    return { ok: false, error: 'newer-remote-version' };
  }

  let parsedStorage: unknown;
  try {
    parsedStorage = JSON.parse(validation.envelope.storageRecord['forge-storage']);
  } catch {
    return { ok: false, error: 'invalid-forge-storage' };
  }

  if (!parsedStorage || typeof parsedStorage !== 'object' || Array.isArray(parsedStorage)) {
    return { ok: false, error: 'invalid-forge-storage' };
  }

  const state = (parsedStorage as { state?: unknown }).state;
  if (!state || typeof state !== 'object' || Array.isArray(state)) {
    return { ok: false, error: 'missing-state' };
  }

  return {
    ok: true,
    state: migrateAppData(state as AppState, targetVersion),
  };
};
