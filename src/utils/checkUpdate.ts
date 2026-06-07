/**
 * 检查更新工具（路径 A）
 * 从 GitHub Releases 拉取 latest.json 并对比本地版本
 */

declare const __APP_VERSION__: string;

export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';

export interface UpdateInfo {
  version: string;
  url: string;
  releaseNotes?: string;
}

const LATEST_JSON_URL =
  'https://github.com/BonusWang/ForgeOS-2.0/releases/latest/download/latest.json';

export async function checkUpdate(
  currentVersion: string
): Promise<{
  hasUpdate: boolean;
  latest?: UpdateInfo;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(LATEST_JSON_URL, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const latest: UpdateInfo = await res.json();
    const hasUpdate = compareVersion(latest.version, currentVersion) > 0;

    return {
      hasUpdate,
      latest: hasUpdate ? latest : undefined,
    };
  } catch (e) {
    return {
      hasUpdate: false,
      error: e instanceof Error ? e.message : '未知错误',
    };
  }
}

/**
 * 比较两个语义化版本号
 * @returns >0 表示 a 更新，<0 表示 b 更新，0 表示相同
 */
export function compareVersion(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10));
  const pb = b.split('.').map((n) => parseInt(n, 10));
  const len = Math.max(pa.length, pb.length);

  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}
