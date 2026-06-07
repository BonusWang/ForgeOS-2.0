import { compareVersion } from '../../utils/checkUpdate.ts';
import type {
  V3SyncConflict,
  V3SyncEntities,
  V3SyncEnvelope,
  V3SyncOwner,
  V3SyncTombstone,
} from './v3SyncTypes.ts';
import { V3_SYNC_COLLECTIONS } from './v3SyncTypes.ts';

export type V3SyncEnvelopeValidationError =
  | 'invalid-envelope'
  | 'checksum-mismatch'
  | 'namespace-mismatch'
  | 'newer-remote-version';

export type V3SyncEnvelopeValidationResult =
  | { ok: true; envelope: V3SyncEnvelope }
  | { ok: false; error: V3SyncEnvelopeValidationError };

interface CreateV3SyncEnvelopeInput {
  appVersion: string;
  deviceId: string;
  owner: V3SyncOwner;
  entities: V3SyncEntities;
  tombstones: V3SyncTombstone[];
  conflicts: V3SyncConflict[];
  updatedAt?: string;
}

export interface ValidateV3SyncEnvelopeOptions {
  appVersion: string;
  owner: V3SyncOwner;
}

export const stableStringify = (value: unknown): string => {
  if (value === undefined) return 'undefined';
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

export const cloneV3SyncValue = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const v3SyncValuesEqual = (left: unknown, right: unknown): boolean =>
  stableStringify(left) === stableStringify(right);

export const checksumV3SyncPayload = async (
  envelope: Omit<V3SyncEnvelope, 'checksum'>
): Promise<string> => {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(stableStringify(envelope))
  );
  return toHex(digest);
};

const createRevision = (deviceId: string, updatedAt: string): string => `${deviceId}:${updatedAt}`;

export const createV3SyncEnvelope = async ({
  appVersion,
  deviceId,
  owner,
  entities,
  tombstones,
  conflicts,
  updatedAt = new Date().toISOString(),
}: CreateV3SyncEnvelopeInput): Promise<V3SyncEnvelope> => {
  const envelopeWithoutChecksum: Omit<V3SyncEnvelope, 'checksum'> = {
    schemaVersion: 3,
    appVersion,
    deviceId,
    owner: cloneV3SyncValue(owner),
    revision: createRevision(deviceId, updatedAt),
    updatedAt,
    entities: cloneV3SyncValue(entities),
    tombstones: cloneV3SyncValue(tombstones),
    conflicts: cloneV3SyncValue(conflicts),
  };

  return {
    ...envelopeWithoutChecksum,
    checksum: await checksumV3SyncPayload(envelopeWithoutChecksum),
  };
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const isV3SyncOwner = (value: unknown): value is V3SyncOwner => {
  if (!isPlainObject(value)) return false;
  return (
    typeof value.namespace === 'string' &&
    typeof value.profileId === 'string' &&
    (value.userId === undefined || typeof value.userId === 'string')
  );
};

const isV3SyncEntities = (value: unknown): value is V3SyncEntities => {
  if (!isPlainObject(value)) return false;
  return V3_SYNC_COLLECTIONS.every((collection) => isPlainObject(value[collection]));
};

export const isV3SyncEnvelope = (value: unknown): value is V3SyncEnvelope => {
  if (!isPlainObject(value)) return false;
  return (
    value.schemaVersion === 3 &&
    typeof value.appVersion === 'string' &&
    typeof value.deviceId === 'string' &&
    isV3SyncOwner(value.owner) &&
    typeof value.revision === 'string' &&
    typeof value.updatedAt === 'string' &&
    typeof value.checksum === 'string' &&
    isV3SyncEntities(value.entities) &&
    Array.isArray(value.tombstones) &&
    Array.isArray(value.conflicts)
  );
};

const ownerMatches = (actual: V3SyncOwner, expected: V3SyncOwner): boolean =>
  actual.namespace === expected.namespace &&
  actual.profileId === expected.profileId &&
  (actual.userId ?? '') === (expected.userId ?? '');

const envelopePayload = (envelope: V3SyncEnvelope): Omit<V3SyncEnvelope, 'checksum'> => ({
  schemaVersion: envelope.schemaVersion,
  appVersion: envelope.appVersion,
  deviceId: envelope.deviceId,
  owner: envelope.owner,
  revision: envelope.revision,
  updatedAt: envelope.updatedAt,
  entities: envelope.entities,
  tombstones: envelope.tombstones,
  conflicts: envelope.conflicts,
});

export const validateV3SyncEnvelope = async (
  value: unknown,
  options: ValidateV3SyncEnvelopeOptions
): Promise<V3SyncEnvelopeValidationResult> => {
  if (!isV3SyncEnvelope(value)) {
    return { ok: false, error: 'invalid-envelope' };
  }

  if (!ownerMatches(value.owner, options.owner)) {
    return { ok: false, error: 'namespace-mismatch' };
  }

  if (compareVersion(value.appVersion, options.appVersion) > 0) {
    return { ok: false, error: 'newer-remote-version' };
  }

  const expectedChecksum = await checksumV3SyncPayload(envelopePayload(value));
  if (value.checksum !== expectedChecksum) {
    return { ok: false, error: 'checksum-mismatch' };
  }

  return { ok: true, envelope: value };
};
