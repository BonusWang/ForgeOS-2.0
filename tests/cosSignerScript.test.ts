import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('COS signer reads credentials from environment variables only', () => {
  const script = read('scripts/cos-signed-url-server.mjs');
  const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> };

  assert.equal(pkg.scripts['cos:signer'], 'node scripts/cos-signed-url-server.mjs');
  assert.match(script, /process\.env\.TENCENT_COS_SECRET_ID/);
  assert.match(script, /process\.env\.TENCENT_COS_SECRET_KEY/);
  assert.match(script, /TENCENT_COS_ALLOWED_PREFIX/);
  assert.match(script, /Forge-OS_Base\/v2\.0\/Domain1127/);
  assert.match(script, /getObjectUrl/);
  assert.match(script, /\/cos\/list-snapshots/);
  assert.match(script, /getBucket/);
  assert.doesNotMatch(script, /AKID[0-9A-Za-z]+/);
});
