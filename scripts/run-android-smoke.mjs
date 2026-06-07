import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { inflateSync } from 'node:zlib';

const isWindows = process.platform === 'win32';
const repoRoot = path.resolve('.');
const packageName = 'com.forgeos.app';
const mainActivity = `${packageName}/.MainActivity`;
const defaultApkPath = path.join(repoRoot, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const defaultOutDir = path.join(repoRoot, '.gstack', 'android-smoke', 'latest');
const deviceApkPath = '/data/local/tmp/forge-os-smoke.apk';
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const args = new Set(process.argv.slice(2));
const getArgValue = (name, fallback) => {
  const prefix = `${name}=`;
  const value = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return value ? value.slice(prefix.length) : fallback;
};

const skipInstall = args.has('--skip-install');
const apkPath = path.resolve(getArgValue('--apk', defaultApkPath));
const outDir = path.resolve(getArgValue('--out', defaultOutDir));
const explicitSerial = getArgValue('--device', process.env.ANDROID_SERIAL ?? '');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findAndroidSdk = () => {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
  ];
  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) ?? null;
};

const findAdb = () => {
  if (process.env.ADB && fs.existsSync(process.env.ADB)) return process.env.ADB;

  const androidSdk = findAndroidSdk();
  if (androidSdk) {
    const adbFromSdk = path.join(androidSdk, 'platform-tools', isWindows ? 'adb.exe' : 'adb');
    if (fs.existsSync(adbFromSdk)) return adbFromSdk;
  }

  return isWindows ? 'adb.exe' : 'adb';
};

const adb = findAdb();

const runAdb = (adbArgs, options = {}) => {
  const result = spawnSync(adb, explicitSerial ? ['-s', explicitSerial, ...adbArgs] : adbArgs, {
    cwd: repoRoot,
    encoding: options.encoding ?? 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });

  if ((result.status ?? 1) !== 0) {
    const command = `${adb} ${adbArgs.join(' ')}`;
    const stderr = result.stderr ? `\n${result.stderr}` : '';
    const stdout = result.stdout ? `\n${result.stdout}` : '';
    throw new Error(`ADB command failed: ${command}${stderr}${stdout}`);
  }

  return result;
};

const parseConnectedDevices = () => {
  const result = spawnSync(adb, ['devices'], { cwd: repoRoot, encoding: 'utf8' });
  if ((result.status ?? 1) !== 0) {
    throw new Error(`Unable to list Android devices. Set ANDROID_HOME or ADB and retry.\n${result.stderr ?? ''}`);
  }

  return (result.stdout ?? '')
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .map((line) => line.match(/^(\S+)\s+device(?:\s|$)/)?.[1])
    .filter(Boolean);
};

const ensureDevice = () => {
  const devices = parseConnectedDevices();
  if (devices.length === 0) {
    throw new Error('No Android device is connected. Enable USB debugging or start an emulator, then retry.');
  }

  if (explicitSerial && !devices.includes(explicitSerial)) {
    throw new Error(`Android device ${explicitSerial} is not connected. Connected devices: ${devices.join(', ')}`);
  }

  if (!explicitSerial && devices.length > 1) {
    console.warn(`Multiple Android devices are connected; using adb default. Set ANDROID_SERIAL to choose one.`);
  }
};

const installApk = () => {
  if (!fs.existsSync(apkPath)) {
    throw new Error(`APK not found at ${apkPath}. Run npm run android:build first or pass --apk=<path>.`);
  }

  runAdb(['push', apkPath, deviceApkPath]);
  runAdb(['shell', 'pm', 'install', '-r', '-t', deviceApkPath]);
};

const captureScreenshot = (name) => {
  const result = runAdb(['exec-out', 'screencap', '-p'], { encoding: 'buffer' });
  const buffer = result.stdout;
  const filePath = path.join(outDir, `${name}.png`);
  fs.writeFileSync(filePath, buffer);
  return { buffer, filePath };
};

const parsePng = (buffer) => {
  if (!buffer.subarray(0, 8).equals(pngSignature)) {
    throw new Error('Screenshot is not a PNG image.');
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }

    offset += length + 12;
  }

  if (bitDepth !== 8 || ![2, 6].includes(colorType) || interlace !== 0) {
    throw new Error(`Unsupported PNG format: bitDepth=${bitDepth}, colorType=${colorType}, interlace=${interlace}`);
  }

  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const stride = width * bytesPerPixel;
  const inflated = inflateSync(Buffer.concat(idatChunks));
  const pixels = Buffer.alloc(height * stride);
  let sourceOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;

    for (let x = 0; x < stride; x += 1) {
      const raw = inflated[sourceOffset + x];
      const left = x >= bytesPerPixel ? pixels[y * stride + x - bytesPerPixel] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upperLeft = y > 0 && x >= bytesPerPixel ? pixels[(y - 1) * stride + x - bytesPerPixel] : 0;

      let predicted = 0;
      if (filter === 1) {
        predicted = left;
      } else if (filter === 2) {
        predicted = up;
      } else if (filter === 3) {
        predicted = Math.floor((left + up) / 2);
      } else if (filter === 4) {
        const p = left + up - upperLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upperLeft);
        predicted = pa <= pb && pa <= pc ? left : pb <= pc ? up : upperLeft;
      } else if (filter !== 0) {
        throw new Error(`Unsupported PNG filter: ${filter}`);
      }

      pixels[y * stride + x] = (raw + predicted) & 0xff;
    }

    sourceOffset += stride;
  }

  return { width, height, bytesPerPixel, pixels };
};

const analyzePng = (buffer) => {
  const { width, height, bytesPerPixel, pixels } = parsePng(buffer);
  const xStart = Math.floor(width * 0.08);
  const xEnd = Math.floor(width * 0.92);
  const yStart = Math.floor(height * 0.16);
  const yEnd = Math.floor(height * 0.86);
  const step = Math.max(1, Math.floor(Math.min(width, height) / 180));
  const buckets = new Set();
  let samples = 0;
  let lumaSum = 0;
  let lumaSquareSum = 0;

  for (let y = yStart; y < yEnd; y += step) {
    for (let x = xStart; x < xEnd; x += step) {
      const index = (y * width + x) * bytesPerPixel;
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const luma = 0.2126 * red + 0.7152 * green + 0.0722 * blue;

      samples += 1;
      lumaSum += luma;
      lumaSquareSum += luma * luma;
      buckets.add(`${red >> 4}:${green >> 4}:${blue >> 4}`);
    }
  }

  const lumaMean = lumaSum / samples;
  const lumaVariance = Math.max(0, lumaSquareSum / samples - lumaMean * lumaMean);
  const lumaStdDev = Math.sqrt(lumaVariance);

  return {
    width,
    height,
    samples,
    lumaMean,
    lumaStdDev,
    colorBuckets: buckets.size,
  };
};

const assertScreenshotIsNotBlank = (label, buffer) => {
  const metrics = analyzePng(buffer);
  if (metrics.lumaStdDev < 6 || metrics.colorBuckets < 8) {
    throw new Error(
      `${label} looks blank: lumaStdDev=${metrics.lumaStdDev.toFixed(2)}, colorBuckets=${metrics.colorBuckets}`
    );
  }
  return metrics;
};

const getWindowSize = () => {
  const result = runAdb(['shell', 'wm', 'size']).stdout ?? '';
  const match = result.match(/Physical size:\s*(\d+)x(\d+)/);
  if (!match) return { width: 1080, height: 2400 };
  return { width: Number(match[1]), height: Number(match[2]) };
};

const main = async () => {
  ensureDevice();
  fs.mkdirSync(outDir, { recursive: true });

  if (!skipInstall) {
    console.log(`Installing ${apkPath}`);
    installApk();
  }

  runAdb(['shell', 'am', 'force-stop', packageName]);
  runAdb(['shell', 'am', 'start', '-n', mainActivity]);
  await wait(4000);

  const dashboard = captureScreenshot('dashboard');
  const dashboardMetrics = assertScreenshotIsNotBlank('Dashboard', dashboard.buffer);
  console.log(
    `Dashboard OK: lumaStdDev=${dashboardMetrics.lumaStdDev.toFixed(2)}, colorBuckets=${dashboardMetrics.colorBuckets}`
  );

  const { width, height } = getWindowSize();
  runAdb(['shell', 'input', 'tap', String(Math.round(width * 0.86)), String(Math.round(height * 0.145))]);
  await wait(1400);

  const system = captureScreenshot('system');
  const systemMetrics = assertScreenshotIsNotBlank('System', system.buffer);
  console.log(
    `System OK: lumaStdDev=${systemMetrics.lumaStdDev.toFixed(2)}, colorBuckets=${systemMetrics.colorBuckets}`
  );

  runAdb([
    'shell',
    'input',
    'swipe',
    String(Math.round(width * 0.08)),
    String(Math.round(height * 0.88)),
    String(Math.round(width * 0.08)),
    String(Math.round(height * 0.32)),
    '550',
  ]);
  await wait(800);

  const cosSettings = captureScreenshot('system-cos');
  const cosMetrics = assertScreenshotIsNotBlank('COS settings', cosSettings.buffer);
  console.log(
    `COS settings OK: lumaStdDev=${cosMetrics.lumaStdDev.toFixed(2)}, colorBuckets=${cosMetrics.colorBuckets}`
  );

  console.log(`Android smoke test passed. Screenshots saved to ${outDir}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
