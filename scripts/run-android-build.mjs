import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const javaExe = isWindows ? 'java.exe' : 'java';
const pathKey = Object.keys(process.env).find((key) => key.toLowerCase() === 'path') ?? 'PATH';

const existing = (filePath) => filePath && fs.existsSync(filePath);

const unique = (items) => [...new Set(items.filter(Boolean))];

const javaHomeFromBin = (javaBin) => path.dirname(path.dirname(javaBin));

const javaVersion = (javaBin) => {
  const result = spawnSync(javaBin, ['-version'], { encoding: 'utf8' });
  const text = `${result.stderr ?? ''}${result.stdout ?? ''}`;
  const match = text.match(/version "(?<major>\d+)(?:\.|")/);
  if (!match?.groups?.major) return 0;
  const major = Number(match.groups.major);
  return major === 1 ? 8 : major;
};

const scanJavaRoots = () => {
  const roots = [
    process.env.JAVA_HOME,
    path.join(os.homedir(), 'AppData', 'Roaming', 'Trae CN', 'User', 'globalStorage', 'pleiades.java-extension-pack-jdk', 'java'),
    isWindows ? 'C:\\Program Files\\Java' : '',
    isWindows ? 'C:\\Program Files\\Eclipse Adoptium' : '',
  ];

  return roots.flatMap((root) => {
    if (!root || !fs.existsSync(root)) return [];
    const direct = path.join(root, 'bin', javaExe);
    const children = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, entry.name, 'bin', javaExe));
    return [direct, ...children];
  });
};

const javaCandidatesFromPath = () => {
  const pathValue = process.env[pathKey] ?? '';
  return pathValue
    .split(path.delimiter)
    .map((entry) => path.join(entry, javaExe))
    .filter(existing);
};

const selectJavaHome = () => {
  const candidates = unique([...scanJavaRoots(), ...javaCandidatesFromPath()]).map((javaBin) => ({
    javaBin,
    major: javaVersion(javaBin),
  }));
  const supported = candidates.filter((candidate) => candidate.major >= 17);
  supported.sort((a, b) => b.major - a.major);
  return supported[0] ? javaHomeFromBin(supported[0].javaBin) : null;
};

const findAndroidSdk = () => {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
  ];
  return candidates.find((candidate) => candidate && fs.existsSync(candidate)) ?? null;
};

const javaHome = selectJavaHome();
if (!javaHome) {
  console.error('Android build requires a JDK 17 or newer. Set JAVA_HOME to a supported JDK and retry.');
  process.exit(1);
}

const env = { ...process.env };
env.JAVA_HOME = javaHome;
env[pathKey] = `${path.join(javaHome, 'bin')}${path.delimiter}${env[pathKey] ?? ''}`;

const androidSdk = findAndroidSdk();
if (androidSdk) {
  env.ANDROID_HOME = androidSdk;
  env.ANDROID_SDK_ROOT = androidSdk;
  env[pathKey] = `${path.join(androidSdk, 'platform-tools')}${path.delimiter}${env[pathKey]}`;
}

console.log(`Using JAVA_HOME=${javaHome}`);
if (androidSdk) {
  console.log(`Using ANDROID_HOME=${androidSdk}`);
}

const result = spawnSync('gradle', ['-p', 'android', ':app:assembleDebug'], {
  cwd: path.resolve('.'),
  env,
  shell: isWindows,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
