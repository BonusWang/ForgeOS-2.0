import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const source = fs.readFileSync(
  path.join(process.cwd(), 'src/utils/platformStorage.ts'),
  'utf-8'
);
const types = fs.readFileSync(path.join(process.cwd(), 'src/types/index.ts'), 'utf-8');
const electronMain = fs.readFileSync(path.join(process.cwd(), 'electron/main.cjs'), 'utf-8');
const electronPreload = fs.readFileSync(path.join(process.cwd(), 'electron/preload.cjs'), 'utf-8');
const androidMain = fs.readFileSync(
  path.join(process.cwd(), 'android/app/src/main/java/com/forgeos/app/MainActivity.java'),
  'utf-8'
);
const viteConfig = fs.readFileSync(path.join(process.cwd(), 'vite.config.ts'), 'utf-8');

test('platformStorage keeps Electron, dev-server, Android, and localStorage paths', () => {
  assert.match(source, /window\.electronAPI/);
  assert.match(source, /window\.androidStorage/);
  assert.match(source, /createDevServerStorage/);
  assert.match(source, /createAndroidStorage/);
  assert.match(source, /readLocalStorageItem/);
  assert.match(source, /\/__forge_data__/);
});

test('platformStorage exposes readonly display URLs for every storage backend', () => {
  assert.match(source, /export function getPlatformStorageDisplayUrl/);
  assert.match(source, /window\.electronAPI\?\.getDataFilePath/);
  assert.match(source, /window\.androidStorage\?\.getDataFilePath/);
  assert.match(source, /__storage_url__/);
  assert.match(source, /localStorage:\/\/\$\{window\.location\.origin\}\/forge-storage/);

  assert.match(types, /getDataFilePath:\s*\(\)\s*=>\s*string/);
  assert.match(electronMain, /get-data-file-path/);
  assert.match(electronPreload, /getDataFilePath/);
  assert.match(androidMain, /public String getDataFilePath\(\)/);
  assert.match(viteConfig, /__storage_url__/);
  assert.match(viteConfig, /forgeDataFile/);
});

test('Electron storage flushes pending writes before renderer reload', () => {
  assert.match(types, /saveDataSync:\s*\(data:\s*Record<string,\s*string>\)\s*=>\s*boolean/);
  assert.match(electronPreload, /saveDataSync:\s*\(data\)\s*=>\s*ipcRenderer\.sendSync\('save-data-sync', data\)/);
  assert.match(electronMain, /ipcMain\.on\('save-data-sync'/);
  assert.match(source, /const flushSync/);
  assert.match(source, /api\.saveDataSync/);
  assert.match(source, /window\.addEventListener\('beforeunload', flushSync\)/);
  assert.match(source, /window\.addEventListener\('pagehide', flushSync\)/);
});
