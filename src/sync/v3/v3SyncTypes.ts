import type {
  Ability,
  AppConfig,
  CalendarEvent,
  Entertainment,
  Habit,
  InboxItem,
  Inspiration,
  ModuleId,
  MoodEntry,
  Objective,
  Principle,
  Reflection,
  ReflectionTemplate,
  Task,
  TimeBlock,
} from '../../types';

export type V3SyncCollectionName =
  | 'tasks'
  | 'calendarEvents'
  | 'principles'
  | 'abilities'
  | 'reflections'
  | 'entertainments'
  | 'objectives'
  | 'inboxItems'
  | 'config'
  | 'enabledModules'
  | 'habits'
  | 'moods'
  | 'timeBlocks'
  | 'inspirations'
  | 'reflectionTemplates';

export interface V3SyncOwner {
  namespace: string;
  profileId: string;
  userId?: string;
}

export interface V3SyncedEntity<T> {
  value: T;
  hash: string;
  updatedAt: string;
  updatedBy: string;
}

export interface V3SyncEntities {
  tasks: Record<string, V3SyncedEntity<Task>>;
  calendarEvents: Record<string, V3SyncedEntity<CalendarEvent>>;
  principles: Record<string, V3SyncedEntity<Principle>>;
  abilities: Record<string, V3SyncedEntity<Ability>>;
  reflections: Record<string, V3SyncedEntity<Reflection>>;
  entertainments: Record<string, V3SyncedEntity<Entertainment>>;
  objectives: Record<string, V3SyncedEntity<Objective>>;
  inboxItems: Record<string, V3SyncedEntity<InboxItem>>;
  config: Partial<Record<'app', V3SyncedEntity<AppConfig>>>;
  enabledModules: Partial<Record<'app', V3SyncedEntity<ModuleId[]>>>;
  habits: Record<string, V3SyncedEntity<Habit>>;
  moods: Record<string, V3SyncedEntity<MoodEntry>>;
  timeBlocks: Record<string, V3SyncedEntity<TimeBlock>>;
  inspirations: Record<string, V3SyncedEntity<Inspiration>>;
  reflectionTemplates: Record<string, V3SyncedEntity<ReflectionTemplate>>;
}

export interface V3SyncTombstone {
  collection: V3SyncCollectionName;
  entityKey: string;
  deletedAt: string;
  deletedBy: string;
  baseRevision?: string;
}

export type V3SyncConflictKind = 'field' | 'delete-edit';

export interface V3SyncConflict {
  id: string;
  kind: V3SyncConflictKind;
  collection: V3SyncCollectionName;
  entityKey: string;
  field: string;
  localValue?: unknown;
  remoteValue?: unknown;
  localDeleted?: boolean;
  remoteDeleted?: boolean;
  baseRevision?: string;
  localUpdatedAt?: string;
  remoteUpdatedAt?: string;
}

export interface V3SyncEnvelope {
  schemaVersion: 3;
  appVersion: string;
  deviceId: string;
  owner: V3SyncOwner;
  revision: string;
  updatedAt: string;
  checksum: string;
  entities: V3SyncEntities;
  tombstones: V3SyncTombstone[];
  conflicts: V3SyncConflict[];
}

export const V3_SYNC_COLLECTIONS: V3SyncCollectionName[] = [
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

export const createEmptyV3SyncEntities = (): V3SyncEntities => ({
  tasks: {},
  calendarEvents: {},
  principles: {},
  abilities: {},
  reflections: {},
  entertainments: {},
  objectives: {},
  inboxItems: {},
  config: {},
  enabledModules: {},
  habits: {},
  moods: {},
  timeBlocks: {},
  inspirations: {},
  reflectionTemplates: {},
});
