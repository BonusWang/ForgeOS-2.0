import http from 'node:http';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const COS = require('cos-nodejs-sdk-v5');

const loadEnvFile = () => {
  if (!fs.existsSync('.env')) return;
  const lines = fs.readFileSync('.env', 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex < 1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value.replace(/^["']|["']$/g, '');
    }
  }
};

loadEnvFile();

const port = Number(process.env.COS_SIGNER_PORT ?? '8787');
const expiresSeconds = Number(process.env.COS_SIGNER_EXPIRES_SECONDS ?? '900');
const secretId = process.env.TENCENT_COS_SECRET_ID;
const secretKey = process.env.TENCENT_COS_SECRET_KEY;
const bucket = process.env.TENCENT_COS_BUCKET ?? 'workbase-1321785586';
const region = process.env.TENCENT_COS_REGION ?? 'ap-guangzhou';
const allowedPrefix = (process.env.TENCENT_COS_ALLOWED_PREFIX ?? 'Forge-OS_Base/v2.0/Domain1127').replace(
  /^\/+|\/+$/g,
  ''
);
const domain = process.env.TENCENT_COS_DOMAIN ?? '{Bucket}.cos.{Region}.myqcloud.com';

if (!secretId || !secretKey) {
  console.error('Set TENCENT_COS_SECRET_ID and TENCENT_COS_SECRET_KEY before starting the signer.');
  process.exit(1);
}

const cos = new COS({
  SecretId: secretId,
  SecretKey: secretKey,
  Domain: domain,
  Protocol: 'https:',
});

const sendJson = (response, status, value) => {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(value));
};

const readBody = (request) =>
  new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });

const parseRequest = async (request) => {
  const parsed = JSON.parse(await readBody(request));
  if (!parsed || typeof parsed !== 'object') throw new Error('invalid request body');
  if (parsed.method !== 'GET' && parsed.method !== 'PUT') throw new Error('invalid method');
  if (typeof parsed.key !== 'string' || !parsed.key.startsWith(`${allowedPrefix}/`)) {
    throw new Error('invalid key');
  }
  return parsed;
};

const parseListSnapshotsRequest = async (request) => {
  const parsed = JSON.parse(await readBody(request));
  if (!parsed || typeof parsed !== 'object') throw new Error('invalid request body');
  if (parsed.objectPrefix !== allowedPrefix) throw new Error('invalid object prefix');
  return parsed;
};

const listSnapshots = async () => {
  const result = await cos.getBucket({
    Bucket: bucket,
    Region: region,
    Prefix: `${allowedPrefix}/snapshots/`,
    MaxKeys: 1000,
  });

  return (result.Contents || [])
    .filter((item) => typeof item.Key === 'string' && item.Key.endsWith('.json'))
    .map((item) => ({
      key: item.Key,
      lastModified: item.LastModified,
      size: item.Size,
    }))
    .sort((left, right) => String(right.lastModified ?? '').localeCompare(String(left.lastModified ?? '')));
};

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'POST' && request.url === '/cos/list-snapshots') {
    try {
      await parseListSnapshotsRequest(request);
      sendJson(response, 200, {
        snapshots: await listSnapshots(),
      });
    } catch (error) {
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : 'snapshot listing failed',
      });
    }
    return;
  }

  if (request.method !== 'POST' || request.url !== '/cos/sign') {
    sendJson(response, 404, { error: 'not found' });
    return;
  }

  try {
    const signedRequest = await parseRequest(request);
    const url = cos.getObjectUrl({
      Bucket: bucket,
      Region: region,
      Key: signedRequest.key,
      Method: signedRequest.method,
      Sign: true,
      Expires: expiresSeconds,
    });

    sendJson(response, 200, {
      url,
      expiresAt: new Date(Date.now() + expiresSeconds * 1000).toISOString(),
      headers: {},
    });
  } catch (error) {
    sendJson(response, 400, {
      error: error instanceof Error ? error.message : 'signing failed',
    });
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`COS signer listening on http://127.0.0.1:${port}/cos/sign`);
});
