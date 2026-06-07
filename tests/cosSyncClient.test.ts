import assert from 'node:assert/strict';
import test from 'node:test';
import { createCosSyncClient } from '../src/sync/cosSyncClient.ts';
import { createSyncEnvelope } from '../src/utils/syncEnvelope.ts';
import type { CosSignedUrlRequest } from '../src/types/sync.ts';

test('cos sync client downloads a snapshot and reads its revision', async () => {
  const envelope = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-1',
    revision: 'revision-1',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord: {
      'forge-storage': '{"state":{},"version":0}',
    },
  });
  const requests: CosSignedUrlRequest[] = [];
  const client = createCosSyncClient({
    credentialProvider: {
      getSignedUrl: async (request) => {
        requests.push(request);
        return {
          url: `https://cos.example/${request.key}`,
          headers: { 'x-test-signed': 'yes' },
          expiresAt: '2026-06-03T01:00:00.000Z',
        };
      },
    },
    fetcher: async () =>
      new Response(JSON.stringify(envelope), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  });

  const revision = await client.readRemoteRevision('Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json');
  const downloaded = await client.downloadSnapshot('Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json');

  assert.equal(revision, 'revision-1');
  assert.equal(downloaded?.revision, 'revision-1');
  assert.deepEqual(requests.map((request) => request.method), ['GET', 'GET']);
});

test('cos sync client uploads primary and backup snapshots through signed PUT urls', async () => {
  const envelope = await createSyncEnvelope({
    appVersion: '1.0.2',
    deviceId: 'device-1',
    revision: 'revision-1',
    updatedAt: '2026-06-03T00:00:00.000Z',
    storageRecord: {
      'forge-storage': '{"state":{},"version":0}',
    },
  });
  const requests: CosSignedUrlRequest[] = [];
  const uploadedBodies: string[] = [];
  const client = createCosSyncClient({
    credentialProvider: {
      getSignedUrl: async (request) => {
        requests.push(request);
        return {
          url: `https://cos.example/${request.key}`,
          expiresAt: '2026-06-03T01:00:00.000Z',
        };
      },
    },
    fetcher: async (_input, init) => {
      uploadedBodies.push(String(init?.body ?? ''));
      return new Response(null, { status: 200 });
    },
  });

  await client.uploadSnapshot('Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json', envelope);
  await client.uploadBackupSnapshot('Forge-OS_Base/v2.0/Domain1127/snapshots/revision-1.json', envelope);

  assert.deepEqual(requests.map((request) => request.method), ['PUT', 'PUT']);
  assert.equal(JSON.parse(uploadedBodies[0]).revision, 'revision-1');
  assert.equal(JSON.parse(uploadedBodies[1]).revision, 'revision-1');
});

test('cos sync client reports fetch failures with a COS connectivity hint', async () => {
  const client = createCosSyncClient({
    credentialProvider: {
      getSignedUrl: async (request) => ({
        url: `https://cos.example/${request.key}`,
        expiresAt: '2026-06-03T01:00:00.000Z',
      }),
    },
    fetcher: async () => {
      throw new TypeError('Failed to fetch');
    },
  });

  await assert.rejects(
    () => client.downloadSnapshot('Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json'),
    /浏览器无法访问 COS/
  );
});
