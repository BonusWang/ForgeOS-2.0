import type { CosCredentialProvider, CosObjectMethod, CosSignedUrl } from '../types/sync';

interface DirectCosCredentialOptions {
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
  endpoint?: string;
  expiresSeconds?: number;
  now?: number;
}

interface CreateDirectCosSignedUrlInput extends DirectCosCredentialOptions {
  key: string;
  method: CosObjectMethod;
  query?: Record<string, string>;
}

interface OptionalDirectCosCredentials {
  accessKeyId?: string;
  secretAccessKey?: string;
}

const safeEncode = (value: string): string =>
  encodeURIComponent(value)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');

const objectKeys = (value: Record<string, string>, forKey = false): string[] =>
  Object.keys(value)
    .map((key) => (forKey ? safeEncode(key).toLowerCase() : key))
    .sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase()));

const objectToQuery = (value: Record<string, string>, lowerCaseKey = false): string =>
  Object.keys(value)
    .sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase()))
    .map((key) => {
      const outputKey = lowerCaseKey ? safeEncode(key).toLowerCase() : safeEncode(key);
      return `${outputKey}=${safeEncode(value[key] ?? '')}`;
    })
    .join('&');

const hexFromBytes = (bytes: ArrayBuffer): string =>
  [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');

const textBytes = (value: string): ArrayBuffer => {
  const bytes = new TextEncoder().encode(value);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
};

const sha1Hex = async (value: string): Promise<string> =>
  hexFromBytes(await globalThis.crypto.subtle.digest('SHA-1', textBytes(value)));

const hmacSha1Hex = async (key: string, value: string): Promise<string> => {
  const cryptoKey = await globalThis.crypto.subtle.importKey(
    'raw',
    textBytes(key),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  return hexFromBytes(await globalThis.crypto.subtle.sign('HMAC', cryptoKey, textBytes(value)));
};

const endpointHost = (region: string, endpoint?: string): string =>
  (endpoint || `cos.${region}.myqcloud.com`).replace(/^https?:\/\//, '').replace(/\/+$/, '');

const objectPath = (key: string): string =>
  key ? `/${key.split('/').map(safeEncode).join('/')}` : '/';

const encodeAuthorization = (authorization: string): string => {
  const urlParamList = authorization.match(/q-url-param-list.*?(?=&)/)?.[0];
  if (!urlParamList) return authorization;

  const encoded =
    'q-url-param-list=' + encodeURIComponent(urlParamList.replace(/q-url-param-list=/, '')).toLowerCase();
  return authorization.replace(urlParamList, encoded);
};

export const hasDirectCosCredentials = (
  config: OptionalDirectCosCredentials
): boolean => Boolean(config.accessKeyId?.trim() && config.secretAccessKey?.trim());

export const createDirectCosSignedUrl = async ({
  accessKeyId,
  secretAccessKey,
  bucket,
  region,
  endpoint,
  expiresSeconds = 900,
  now = Math.round(Date.now() / 1000),
  key,
  method,
  query = {},
}: CreateDirectCosSignedUrlInput): Promise<CosSignedUrl> => {
  const host = `${bucket}.${endpointHost(region, endpoint)}`;
  const startTime = now - 1;
  const endTime = startTime + expiresSeconds;
  const signTime = `${startTime};${endTime}`;
  const headers = { host };
  const lowerMethod = method.toLowerCase();
  const qHeaderList = objectKeys(headers, true).join(';').toLowerCase();
  const qUrlParamList = objectKeys(query, true).join(';').toLowerCase();
  const formatString = [
    lowerMethod,
    objectPath(key),
    objectToQuery(query, true),
    objectToQuery(headers, true),
    '',
  ].join('\n');
  const signKey = await hmacSha1Hex(secretAccessKey, signTime);
  const formatHash = await sha1Hex(formatString);
  const stringToSign = ['sha1', signTime, formatHash, ''].join('\n');
  const signature = await hmacSha1Hex(signKey, stringToSign);
  const authorization = [
    'q-sign-algorithm=sha1',
    `q-ak=${safeEncode(accessKeyId)}`,
    `q-sign-time=${signTime}`,
    `q-key-time=${signTime}`,
    `q-header-list=${qHeaderList}`,
    `q-url-param-list=${qUrlParamList}`,
    `q-signature=${signature}`,
  ].join('&');
  const queryString = objectToQuery(query);
  const signedAuthorization = encodeAuthorization(authorization);

  return {
    url: `https://${host}${objectPath(key)}?${signedAuthorization}${queryString ? `&${queryString}` : ''}`,
    expiresAt: new Date(endTime * 1000).toISOString(),
  };
};

export const createDirectCosCredentialProvider = (
  options: DirectCosCredentialOptions
): CosCredentialProvider => ({
  getSignedUrl: (request) =>
    createDirectCosSignedUrl({
      ...options,
      key: request.key,
      method: request.method,
    }),
});
