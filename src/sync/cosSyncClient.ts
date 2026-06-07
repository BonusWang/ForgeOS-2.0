import type {
  CosCredentialProvider,
  CosSignedUrlRequest,
  CosSyncEnvelope,
} from '../types/sync.ts';
import { validateSyncEnvelope } from '../utils/syncEnvelope.ts';

type CosFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface CreateCosSyncClientOptions {
  credentialProvider: CosCredentialProvider;
  fetcher?: CosFetch;
}

export interface CosSyncClient {
  readRemoteRevision: (key: string) => Promise<string | null>;
  downloadSnapshot: (key: string) => Promise<CosSyncEnvelope | null>;
  uploadSnapshot: (key: string, envelope: CosSyncEnvelope) => Promise<void>;
  uploadBackupSnapshot: (key: string, envelope: CosSyncEnvelope) => Promise<void>;
}

const requestSignedUrl = async (
  credentialProvider: CosCredentialProvider,
  request: CosSignedUrlRequest
) => credentialProvider.getSignedUrl(request);

const assertResponseOk = (response: Response): void => {
  if (!response.ok) {
    throw new Error(`COS request failed: HTTP ${response.status}`);
  }
};

const runCosFetch = async (fetchCall: () => Promise<Response>): Promise<Response> => {
  try {
    return await fetchCall();
  } catch (error) {
    if (error instanceof TypeError && /failed to fetch/i.test(error.message)) {
      throw new Error('浏览器无法访问 COS，请检查 Bucket CORS 配置、Endpoint、Bucket 名称和网络连接', {
        cause: error,
      });
    }

    throw error;
  }
};

export const createCosSyncClient = ({
  credentialProvider,
  fetcher = globalThis.fetch.bind(globalThis),
}: CreateCosSyncClientOptions): CosSyncClient => {
  const downloadSnapshot = async (key: string): Promise<CosSyncEnvelope | null> => {
    const signed = await requestSignedUrl(credentialProvider, { key, method: 'GET' });
    const response = await runCosFetch(() =>
      fetcher(signed.url, {
        method: 'GET',
        headers: signed.headers,
      })
    );

    if (response.status === 404) return null;
    assertResponseOk(response);

    const validation = await validateSyncEnvelope(await response.json());
    if (!validation.ok) {
      throw new Error(`Invalid COS sync envelope: ${validation.error}`);
    }

    return validation.envelope;
  };

  const upload = async (key: string, envelope: CosSyncEnvelope): Promise<void> => {
    const signed = await requestSignedUrl(credentialProvider, {
      key,
      method: 'PUT',
      contentType: 'application/json',
    });
    const headers = {
      'Content-Type': 'application/json',
      ...signed.headers,
    };
    const response = await runCosFetch(() =>
      fetcher(signed.url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(envelope),
      })
    );
    assertResponseOk(response);
  };

  return {
    readRemoteRevision: async (key: string) => {
      const envelope = await downloadSnapshot(key);
      return envelope?.revision ?? null;
    },
    downloadSnapshot,
    uploadSnapshot: upload,
    uploadBackupSnapshot: upload,
  };
};
