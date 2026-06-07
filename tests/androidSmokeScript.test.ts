import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('Android smoke test script installs, launches, captures, and checks for blank screens', () => {
  const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> };
  const script = read('scripts/run-android-smoke.mjs');

  assert.equal(pkg.scripts['android:smoke'], 'node scripts/run-android-smoke.mjs');
  assert.match(script, /ANDROID_HOME/);
  assert.match(script, /ANDROID_SDK_ROOT/);
  assert.match(script, /pm', 'install', '-r', '-t'/);
  assert.match(script, /const packageName = 'com\.forgeos\.app'/);
  assert.match(script, /const mainActivity = `\$\{packageName\}\/\.MainActivity`/);
  assert.match(script, /'am', 'start', '-n', mainActivity/);
  assert.match(script, /screencap', '-p'/);
  assert.match(script, /'\.gstack', 'android-smoke', 'latest'/);
  assert.match(script, /inflateSync/);
  assert.match(script, /assertScreenshotIsNotBlank/);
  assert.match(script, /lumaStdDev/);
  assert.match(script, /--skip-install/);
});
