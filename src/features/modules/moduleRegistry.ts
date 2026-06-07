import type { ModuleId, ModuleMeta } from '../../types';

export const MODULE_REGISTRY: Record<ModuleId, ModuleMeta> = {
  principles: {
    id: 'principles',
    name: '我的原则',
    description: '展示并编辑个人行为原则',
    defaultEnabled: true,
    defaultZone: 'side',
    icon: '[◈]',
  },
  calendar: {
    id: 'calendar',
    name: '迷你日历',
    description: '月历视图，标记反思、任务与习惯',
    defaultEnabled: true,
    defaultZone: 'side',
    icon: '[◷]',
  },
  entertainment: {
    id: 'entertainment',
    name: '娱乐安排',
    description: '记录当天的娱乐计划',
    defaultEnabled: true,
    defaultZone: 'side',
    icon: '[♦]',
  },
  habits: {
    id: 'habits',
    name: '习惯追踪',
    description: '每日习惯打卡与连续记录',
    defaultEnabled: false,
    defaultZone: 'side',
    icon: '[◎]',
  },
  mood: {
    id: 'mood',
    name: '情绪记录',
    description: '记录每日情绪与能量水平',
    defaultEnabled: false,
    defaultZone: 'side',
    icon: '[♥]',
  },
  timeBlocks: {
    id: 'timeBlocks',
    name: '时间块',
    description: '按时间段规划每日活动',
    defaultEnabled: false,
    defaultZone: 'main',
    icon: '[◫]',
  },
  inspiration: {
    id: 'inspiration',
    name: '灵感仓库',
    description: '收集灵感并一键转为任务',
    defaultEnabled: false,
    defaultZone: 'side',
    icon: '[✦]',
  },
};

export const DEFAULT_ENABLED_MODULES: ModuleId[] = Object.values(MODULE_REGISTRY)
  .filter((m) => m.defaultEnabled)
  .map((m) => m.id);

export function getModuleMeta(id: ModuleId): ModuleMeta {
  return MODULE_REGISTRY[id];
}

export function getAllModules(): ModuleMeta[] {
  return Object.values(MODULE_REGISTRY);
}

export function getModulesByZone(zone: 'main' | 'side'): ModuleMeta[] {
  return Object.values(MODULE_REGISTRY).filter((m) => m.defaultZone === zone);
}
