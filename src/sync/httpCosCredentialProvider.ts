import type { CosCredentialProvider, CosSignedUrl } from '../types/sync';

type CosFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface CreateHttpCosCredentialProviderOptions {
  endpoint: string;
  fetcher?: CosFetch;
}

const isSignedUrl = (value: unknown): value is CosSignedUrl => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const signed = value as Partial<CosSignedUrl>;
  return (
    typeof signed.url === 'string' &&
    typeof signed.expiresAt === 'string' &&
    (signed.headers === undefined ||
      (typeof signed.headers === 'object' &&
        signed.headers !== null &&
        !Array.isArray(signed.headers) &&
        Object.values(signed.headers).every((header) => typeof header === 'string')))
  );
};

export const createHttpCosCredentialProvider = ({
  endpoint,
  fetcher = globalThis.fetch.bind(globalThis),
}: CreateHttpCosCredentialProviderOptions): CosCredentialProvider => ({
  getSignedUrl: async (request) => {
    const response = await fetcher(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`COS credential provider failed: HTTP ${response.status}`);
    }

    const signed = await response.json();
    if (!isSignedUrl(signed)) {
      throw new Error('COS credential provider returned an invalid signed URL');
    }

    return signed;
  },
});
