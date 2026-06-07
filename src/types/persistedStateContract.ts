import type { AppState } from './index';

export const PERSISTED_APP_STATE_KEYS = [
  'tasks',
  'calendarEvents',
  'principles',
  'abilities',
  'reflections',
  'entertainments',
  'objectives',
  'inboxItems',
  'config',
  'enabledModules',
  'habits',
  'moods',
  'timeBlocks',
  'inspirations',
  'reflectionTemplates',
  'syncConfig',
  'syncStatus',
  '__version',
] as const satisfies readonly (keyof AppState)[];
