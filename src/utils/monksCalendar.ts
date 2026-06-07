/**
 * 修道院纪年法 — 将语义化版本号转换为修道院风格纪年
 *
 * 0.1.1 → 第 0 纪 · 第 1 章 · 第 1 节
 */

export function toMonksCalendar(version: string): string {
  const parts = version.split('.').map((p) => parseInt(p, 10));
  const [major = 0, minor = 0, patch = 0] = parts;
  return `第 ${major} 纪 · 第 ${minor} 章 · 第 ${patch} 节`;
}

export function parseVersion(version: string): {
  major: number;
  minor: number;
  patch: number;
} {
  const parts = version.split('.').map((p) => parseInt(p, 10));
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}
