import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';

const findAndroidSdk = () => {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
  ];
  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) ?? null;
};

const androidSdk = findAndroidSdk();
if (!androidSdk) {
  console.error('Android SDK not found. Set ANDROID_HOME and retry.');
  process.exit(1);
}

const adb = path.join(androidSdk, 'platform-tools', isWindows ? 'adb.exe' : 'adb');
if (!fs.existsSync(adb)) {
  console.error(`adb not found at ${adb}. Install Android platform-tools and retry.`);
  process.exit(1);
}

const devicesResult = spawnSync(adb, ['devices'], { encoding: 'utf8' });
const devices = (devicesResult.stdout ?? '')
  .split(/\r?\n/)
  .slice(1)
  .map((line) => line.trim())
  .filter((line) => line.endsWith('\tdevice'));

if (devices.length === 0) {
  console.error('No Android device is connected. Enable USB debugging or start an emulator, then retry.');
  process.exit(1);
}

const buildResult = spawnSync('node', ['scripts/run-android-build.mjs'], {
  cwd: path.resolve('.'),
  shell: isWindows,
  stdio: 'inherit',
});
if ((buildResult.status ?? 1) !== 0) {
  process.exit(buildResult.status ?? 1);
}

const apkPath = path.resolve('android/app/build/outputs/apk/debug/app-debug.apk');
const installResult = spawnSync(adb, ['install', '-r', apkPath], {
  cwd: path.resolve('.'),
  stdio: 'inherit',
});

process.exit(installResult.status ?? 1);
