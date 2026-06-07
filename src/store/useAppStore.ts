import { create } from 'zustand';
import { persist, type PersistStorage } from 'zustand/middleware';
import { createTaskSlice, type TaskSlice } from './slices/taskSlice';
import { createPrincipleSlice, type PrincipleSlice } from './slices/principleSlice';
import { createAbilitySlice, type AbilitySlice } from './slices/abilitySlice';
import { createReflectionSlice, type ReflectionSlice } from './slices/reflectionSlice';
import { createEntertainmentSlice, type EntertainmentSlice } from './slices/entertainmentSlice';
import { createConfigSlice, type ConfigSlice } from './slices/configSlice';
import { createCalendarSlice, type CalendarSlice } from './slices/calendarSlice';
import { createOKRSlice, type OKRSlice } from './slices/okrSlice';
import { createModuleSlice, type ModuleSlice } from './slices/moduleSlice';
import { createHabitSlice, type HabitSlice } from './slices/habitSlice';
import { createMoodSlice, type MoodSlice } from './slices/moodSlice';
import { createTimeBlockSlice, type TimeBlockSlice } from './slices/timeBlockSlice';
import { createInspirationSlice, type InspirationSlice } from './slices/inspirationSlice';
import { createReflectionTemplateSlice, type ReflectionTemplateSlice } from './slices/reflectionTemplateSlice';
import { createSyncSlice, type SyncSlice } from './slices/syncSlice';
import { migrateAllReflections } from '../utils/migrateReflectionData';
import { migrateAppData, CURRENT_APP_VERSION } from '../utils/migrateAppData';
import { platformStorage } from '../utils/platformStorage';
import type { AppState } from '../types';

export type AppStore = TaskSlice &
  CalendarSlice &
  PrincipleSlice &
  AbilitySlice &
  ReflectionSlice &
  EntertainmentSlice &
  ConfigSlice &
  OKRSlice &
  ModuleSlice &
  HabitSlice &
  MoodSlice &
  TimeBlockSlice &
  InspirationSlice &
  ReflectionTemplateSlice &
  SyncSlice & {
    __version: string;
  };

type LocalSyncDataKey = Exclude<keyof AppState, 'syncConfig' | 'syncStatus' | '__version'>;

const LOCAL_SYNC_DATA_KEYS: LocalSyncDataKey[] = [
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
];

const didLocalDataChange = (before: AppStore, after: AppStore): boolean =>
  LOCAL_SYNC_DATA_KEYS.some((key) => before[key] !== after[key]);

export const useAppStore = create<AppStore>()(
  persist<AppStore, [], [], AppState>(
    (set, get, api) => {
      const rawSet = set as unknown as (partial: Parameters<typeof set>[0], replace?: boolean) => void;
      const setWithLocalChange = ((partial: Parameters<typeof set>[0], replace?: boolean) => {
        const before = get();
        rawSet(partial, replace);
        const after = get();

        if (didLocalDataChange(before, after)) {
          set((state) => ({
            syncStatus: {
              ...state.syncStatus,
              lastLocalUpdatedAt: new Date().toISOString(),
            },
          }));
        }
      }) as typeof set;

      const args = [setWithLocalChange, get, api] as [typeof set, typeof get, typeof api];

      return {
        ...createTaskSlice(...args),
        ...createCalendarSlice(...args),
        ...createPrincipleSlice(...args),
        ...createAbilitySlice(...args),
        ...createReflectionSlice(...args),
        ...createEntertainmentSlice(...args),
        ...createConfigSlice(...args),
        ...createOKRSlice(...args),
        ...createModuleSlice(...args),
        ...createHabitSlice(...args),
        ...createMoodSlice(...args),
        ...createTimeBlockSlice(...args),
        ...createInspirationSlice(...args),
        ...createReflectionTemplateSlice(...args),
        ...createSyncSlice(...args),
        __version: CURRENT_APP_VERSION,
      };
    },
    {
      name: 'forge-storage',
      storage: platformStorage as PersistStorage<AppState>,
      partialize: (state) => ({
        tasks: state.tasks,
        calendarEvents: state.calendarEvents,
        principles: state.principles,
        abilities: state.abilities,
        reflections: state.reflections,
        entertainments: state.entertainments,
        objectives: state.objectives,
        inboxItems: state.inboxItems,
        config: state.config,
        enabledModules: state.enabledModules,
        habits: state.habits,
        moods: state.moods,
        timeBlocks: state.timeBlocks,
        inspirations: state.inspirations,
        reflectionTemplates: state.reflectionTemplates,
        syncConfig: state.syncConfig,
        syncStatus: state.syncStatus,
        __version: state.__version,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Migrate old reflection data format
        const result = migrateAllReflections(
          state.reflections || [],
          state.reflectionTemplates || []
        );
        state.reflections = result.reflections;
        state.reflectionTemplates = result.templates;

        // Migrate app data version
        const migrated = migrateAppData(state, CURRENT_APP_VERSION);
        Object.assign(state, migrated);
      },
    }
  )
);
