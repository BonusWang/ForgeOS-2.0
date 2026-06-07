import type { CloudBackupHistoryProvider, CloudBackupSnapshot, CosSyncConfig } from '../types/sync';
import { cosObjectPrefix } from './cosObjectKeys.ts';
import { createDirectCosSignedUrl } from './directCosCredentialProvider.ts';

type CosFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface CreateDirectCloudBackupHistoryProviderOptions {
  config: Pick<
    CosSyncConfig,
    'accessKeyId' | 'secretAccessKey' | 'bucket' | 'region' | 'endpoint'
  >;
  fetcher?: CosFetch;
}

const textFromNode = (node: Element, tag: string): string | undefined =>
  node.getElementsByTagName(tag)[0]?.textContent ?? undefined;

const decodeXmlText = (value: string | undefined): string | undefined =>
  value
    ?.replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

const textFromBlock = (block: string, tag: string): string | undefined =>
  decodeXmlText(block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1]);

const parseSnapshotsXmlFallback = (xml: string): CloudBackupSnapshot[] =>
  [...xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)]
    .map((match) => ({
      key: textFromBlock(match[1], 'Key') ?? '',
      lastModified: textFromBlock(match[1], 'LastModified'),
      size: textFromBlock(match[1], 'Size'),
    }))
    .filter((snapshot) => snapshot.key.endsWith('.json'))
    .sort((left, right) =>
      String(right.lastModified ?? '').localeCompare(String(left.lastModified ?? ''))
    );

const parseSnapshotsXml = (xml: string): CloudBackupSnapshot[] => {
  if (typeof DOMParser === 'undefined') {
    return parseSnapshotsXmlFallback(xml);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  return [...doc.getElementsByTagName('Contents')]
    .map((node) => ({
      key: textFromNode(node, 'Key') ?? '',
      lastModified: textFromNode(node, 'LastModified'),
      size: textFromNode(node, 'Size'),
    }))
    .filter((snapshot) => snapshot.key.endsWith('.json'))
    .sort((left, right) =>
      String(right.lastModified ?? '').localeCompare(String(left.lastModified ?? ''))
    );
};

export const createDirectCloudBackupHistoryProvider = ({
  config,
  fetcher = globalThis.fetch.bind(globalThis),
}: CreateDirectCloudBackupHistoryProviderOptions): CloudBackupHistoryProvider => ({
  listSnapshots: async (prefixConfig) => {
    if (!config.accessKeyId?.trim() || !config.secretAccessKey?.trim()) {
      throw new Error('缺少 Access Key ID 或 Secret Access Key');
    }

    const signed = await createDirectCosSignedUrl({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      bucket: config.bucket,
      region: config.region,
      endpoint: config.endpoint,
      key: '',
      method: 'GET',
      query: {
        prefix: `${cosObjectPrefix(prefixConfig)}/snapshots/`,
        'max-keys': '1000',
      },
    });
    const response = await fetcher(signed.url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`COS snapshot list failed: HTTP ${response.status}`);
    }

    return parseSnapshotsXml(await response.text());
  },
});
