import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const repoRoot = process.cwd();
const read = (filePath: string) => fs.readFileSync(path.join(repoRoot, filePath), 'utf-8');

test('Android project bundles Vite assets through a WebView app shell', () => {
  const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string>; version: string };
  const manifest = read('android/app/src/main/AndroidManifest.xml');
  const appGradle = read('android/app/build.gradle');
  const mainActivity = read('android/app/src/main/java/com/forgeos/app/MainActivity.java');
  const buildScript = read('scripts/run-android-build.mjs');

  assert.match(appGradle, new RegExp(`versionName '${pkg.version}'`));
  assert.match(appGradle, /versionCode 20/);
  assert.match(pkg.scripts['android:build'], /run-android-build\.mjs/);
  assert.match(pkg.scripts['android:install'], /run-android-install\.mjs/);
  assert.match(buildScript, /JAVA_HOME/);
  assert.match(buildScript, /17/);
  assert.match(manifest, /android\.permission\.INTERNET/);
  assert.match(manifest, /com\.forgeos\.app\.MainActivity/);
  assert.match(appGradle, /buildWebAssets/);
  assert.match(appGradle, /syncWebAssets/);
  assert.match(appGradle, /doFirst\s*\{/);
  assert.match(appGradle, /delete new File\(generatedAssetsDir, 'web'\)/);
  assert.match(appGradle, /androidx\.webkit:webkit/);
  assert.match(mainActivity, /WebViewAssetLoader/);
  assert.match(mainActivity, /https:\/\/appassets\.androidplatform\.net\/assets\/web\/index\.html/);
});

test('Android app exposes private file storage instead of relying on WebView localStorage', () => {
  const mainActivity = read('android/app/src/main/java/com/forgeos/app/MainActivity.java');
  const platformStorage = read('src/utils/platformStorage.ts');
  const types = read('src/types/index.ts');

  assert.match(mainActivity, /addJavascriptInterface\(new AndroidStorageBridge/);
  assert.match(mainActivity, /getFilesDir\(\)/);
  assert.match(mainActivity, /forge-data\.json/);
  assert.match(platformStorage, /window\.androidStorage/);
  assert.match(platformStorage, /createAndroidStorage/);
  assert.match(types, /androidStorage\?:/);
});

test('Android WebView applies system bar insets so mobile UI is not covered by status bars', () => {
  const mainActivity = read('android/app/src/main/java/com/forgeos/app/MainActivity.java');

  assert.match(mainActivity, /setOnApplyWindowInsetsListener/);
  assert.match(mainActivity, /WindowInsets\.Type\.systemBars\(\)/);
  assert.match(mainActivity, /setPadding\(0,\s*topInset,\s*0,\s*bottomInset\)/);
  assert.match(mainActivity, /FrameLayout/);
  assert.match(mainActivity, /root\.addView\(webView/);
  assert.match(mainActivity, /applySystemBarInsets\(root\)/);
  assert.doesNotMatch(mainActivity, /applySystemBarInsets\(webView\)/);
});

test('Android WebView honors viewport meta so high-density phones use mobile CSS', () => {
  const mainActivity = read('android/app/src/main/java/com/forgeos/app/MainActivity.java');
  const indexHtml = read('index.html');

  assert.match(indexHtml, /<meta name="viewport" content="width=device-width, initial-scale=1\.0" \/>/);
  assert.match(mainActivity, /settings\.setUseWideViewPort\(true\)/);
  assert.match(mainActivity, /settings\.setLoadWithOverviewMode\(false\)/);
  assert.doesNotMatch(mainActivity, /settings\.setTextZoom\(100\)/);
});

test('Android app lets the system resize around keyboards and accessibility font scaling', () => {
  const manifest = read('android/app/src/main/AndroidManifest.xml');
  const mainActivity = read('android/app/src/main/java/com/forgeos/app/MainActivity.java');

  assert.match(manifest, /android:windowSoftInputMode="adjustResize"/);
  assert.doesNotMatch(mainActivity, /settings\.setTextZoom\(100\)/);
});

test('Android launcher icon uses the Forge pixel logo mipmap assets', () => {
  const manifest = read('android/app/src/main/AndroidManifest.xml');

  assert.match(manifest, /android:icon="@mipmap\/ic_launcher"/);
  for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
    assert.ok(
      fs.existsSync(path.join(repoRoot, `android/app/src/main/res/mipmap-${density}/ic_launcher.png`)),
      `missing ${density} launcher icon`
    );
  }
});
