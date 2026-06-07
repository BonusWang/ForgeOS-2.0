/**
 * 数据迁移框架
 * 版本链检测 + 自动迁移 + .rollback 备份
 */

import type { AppState } from '../types';
import { compareVersion, APP_VERSION } from './checkUpdate.ts';

export const CURRENT_APP_VERSION = APP_VERSION;

/** 单次迁移函数签名 */
type Migration = (state: AppState) => AppState;

/** 注册所有历史迁移 */
const migrations: Record<string, Migration> = {
  // 当需要数据迁移时在此注册版本迁移函数
  // '0.2.0': (state) => ({ ...state, newField: [] }),
};

/**
 * 执行数据迁移
 * @param state 当前状态（可能来自旧版本）
 * @param targetVersion 目标版本号
 * @returns 迁移后的新状态
 */
export function migrateAppData(
  state: AppState,
  targetVersion: string
): AppState {
  const currentVersion = state.__version || '0.1.0';

  if (currentVersion === targetVersion) {
    return state;
  }

  // 降级不支持，直接标记版本
  if (compareVersion(currentVersion, targetVersion) > 0) {
    return { ...state, __version: targetVersion };
  }

  // 保存 rollback 快照
  saveRollbackSnapshot(state);

  let next: AppState = { ...state };
  const versions = Object.keys(migrations).sort(compareVersion);

  for (const v of versions) {
    if (
      compareVersion(v, currentVersion) > 0 &&
      compareVersion(v, targetVersion) <= 0
    ) {
      next = migrations[v](next);
    }
  }

  next.__version = targetVersion;
  return next;
}

/**
 * 将当前数据保存为 rollback 快照
 */
function saveRollbackSnapshot(state: AppState): void {
  try {
    const snapshot = JSON.parse(JSON.stringify(state));
    if (window.electronAPI?.saveRollback) {
      window.electronAPI.saveRollback(snapshot).catch(() => {});
    } else if (window.androidStorage?.saveRollback) {
      window.androidStorage.saveRollback(JSON.stringify(snapshot));
    } else {
      localStorage.setItem('forge-rollback', JSON.stringify(snapshot));
    }
  } catch {
    // 静默失败，不影响主流程
  }
}
