import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('update panel version fallback is injected from the release version', () => {
  const checkUpdate = read('src/utils/checkUpdate.ts');
  const viteConfig = read('vite.config.ts');

  assert.match(checkUpdate, /APP_VERSION\s*=\s*typeof __APP_VERSION__/);
  assert.doesNotMatch(checkUpdate, /APP_VERSION\s*=\s*['"]0\.1\.1['"]/);
  assert.match(viteConfig, /package\.json/);
  assert.match(viteConfig, /__APP_VERSION__/);
});

test('checking updates reports the requested development feedback when no update is available', () => {
  const copy = read('src/copy/system-copy.ts');

  assert.match(copy, /upToDate:\s*'程序猿说在开发了在开发了'/);
});

test('checking updates uses a casual fallback list when the request fails', () => {
  const copy = read('src/copy/system-copy.ts');
  const panel = read('src/features/system/UpdatePanel.tsx');

  assert.match(copy, /updateErrors:\s*\[/);
  assert.match(copy, /'开发者说，没打听到消息。可能网络在摆烂，也可能发布通道还没修好。'/);
  assert.match(panel, /pickUpdateErrorCopy/);
});

test('app skips automatic GitHub update checks outside packaged desktop contexts', () => {
  const app = read('src/App.tsx');

  assert.match(app, /canAutoCheckUpdates/);
  assert.match(app, /window\.electronAPI\?\.getAppVersion/);
  assert.match(app, /if \(!canAutoCheckUpdates\(\)\) return/);
});
