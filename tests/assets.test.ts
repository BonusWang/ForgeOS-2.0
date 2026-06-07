import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const resourceNames = ['forge-bg-texture.png', 'forge-empty-state.png', 'forge-logo-pixel.png'];

test('referenced public resources exist for web and Android bundles', () => {
  for (const resourceName of resourceNames) {
    assert.equal(
      fs.existsSync(path.join(process.cwd(), 'public', 'resources', resourceName)),
      true,
      `missing public resource: ${resourceName}`
    );
  }
});

test('resource URLs are resolved from the document URL at runtime', () => {
  const source = fs.readFileSync(path.join(process.cwd(), 'src', 'utils', 'assets.ts'), 'utf-8');

  assert.match(source, /new URL\('resources\/', window\.location\.href\)/);
});
