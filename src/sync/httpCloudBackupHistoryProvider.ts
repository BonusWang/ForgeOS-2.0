import type { CloudBackupHistoryProvider, CloudBackupSnapshot } from '../types/sync';
import { cosObjectPrefix } from './cosObjectKeys.ts';

type CosFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface CreateHttpCloudBackupHistoryProviderOptions {
  credentialProviderUrl: string;
  fetcher?: CosFetch;
}

const listEndpointFromSigner = (credentialProviderUrl: string): string =>
  credentialProviderUrl.replace(/\/cos\/sign\/?$/, '/cos/list-snapshots');

const isSnapshot = (value: unknown): value is CloudBackupSnapshot => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const snapshot = value as Partial<CloudBackupSnapshot>;
  return (
    typeof snapshot.key === 'string' &&
    (snapshot.lastModified === undefined || typeof snapshot.lastModified === 'string') &&
    (snapshot.size === undefined || typeof snapshot.size === 'string')
  );
};

const parseSnapshotList = (value: unknown): CloudBackupSnapshot[] => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('COS snapshot list returned an invalid response');
  }

  const snapshots = (value as { snapshots?: unknown }).snapshots;
  if (!Array.isArray(snapshots) || !snapshots.every(isSnapshot)) {
    throw new Error('COS snapshot list returned invalid snapshots');
  }

  return snapshots;
};

export const createHttpCloudBackupHistoryProvider = ({
  credentialProviderUrl,
  fetcher = globalThis.fetch.bind(globalThis),
}: CreateHttpCloudBackupHistoryProviderOptions): CloudBackupHistoryProvider => ({
  listSnapshots: async (config) => {
    const response = await fetcher(listEndpointFromSigner(credentialProviderUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        objectPrefix: cosObjectPrefix(config),
      }),
    });

    if (!response.ok) {
      throw new Error(`COS snapshot list failed: HTTP ${response.status}`);
    }

    return parseSnapshotList(await response.json());
  },
});
