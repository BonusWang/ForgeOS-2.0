import type { CosCredentialProvider, CosSignedUrlRequest } from '../../types/sync.ts';
import {
  validateV3SyncEnvelope,
  type ValidateV3SyncEnvelopeOptions,
} from './v3SyncEnvelope.ts';
import type { V3SyncEnvelope } from './v3SyncTypes.ts';

type CosFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface V3SyncClient {
  downloadV3Snapshot: (key: string) => Promise<V3SyncEnvelope | null>;
  uploadV3Snapshot: (key: string, envelope: V3SyncEnvelope) => Promise<void>;
  objectExists?: (key: string) => Promise<boolean>;
}

interface CreateV3SyncClientOptions extends ValidateV3SyncEnvelopeOptions {
  credentialProvider: CosCredentialProvider;
  fetcher?: CosFetch;
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

export const createV3SyncClient = ({
  credentialProvider,
  appVersion,
  owner,
  fetcher = globalThis.fetch.bind(globalThis),
}: CreateV3SyncClientOptions): V3SyncClient => {
  const downloadV3Snapshot = async (key: string): Promise<V3SyncEnvelope | null> => {
    const signed = await requestSignedUrl(credentialProvider, { key, method: 'GET' });
    const response = await runCosFetch(() =>
      fetcher(signed.url, {
        method: 'GET',
        headers: signed.headers,
      })
    );

    if (response.status === 404) return null;
    assertResponseOk(response);

    const validation = await validateV3SyncEnvelope(await response.json(), { appVersion, owner });
    if (!validation.ok) {
      throw new Error(validation.error);
    }

    return validation.envelope;
  };

  const uploadV3Snapshot = async (key: string, envelope: V3SyncEnvelope): Promise<void> => {
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

  const objectExists = async (key: string): Promise<boolean> => {
    const signed = await requestSignedUrl(credentialProvider, { key, method: 'GET' });
    const response = await runCosFetch(() =>
      fetcher(signed.url, {
        method: 'GET',
        headers: signed.headers,
      })
    );

    if (response.status === 404) return false;
    assertResponseOk(response);
    return true;
  };

  return {
    downloadV3Snapshot,
    uploadV3Snapshot,
    objectExists,
  };
};
