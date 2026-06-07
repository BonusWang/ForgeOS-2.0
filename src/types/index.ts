export type DayColumn = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type TaskStatus = 'active' | 'completed';

export interface Task {
  id: string;
  content: string;
  column: DayColumn;
  date: string;
  status: TaskStatus;
  order: number;
  abilityId?: string;
  abilityPoints?: number;
  completedAt?: string;
  migratedFrom?: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  content: string;
  createdAt: string;
}

export interface Principle {
  id: string;
  content: string;
  order: number;
}

export interface AbilityTask {
  id: string;
  content: string;
  points: number;
}

export interface Ability {
  id: string;
  name: string;
  currentScore: number;
  maxScore: number;
  tasks: AbilityTask[];
}

export interface ReflectionQuestion {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  min?: number;
  max?: number;
  required: boolean;
  abilityLink?: string;
}

export interface ReflectionTemplate {
  id: string;
  name: string;
  isDefault: boolean;
  questions: ReflectionQuestion[];
}

export interface Reflection {
  id: string;
  date: string;
  kind?: 'daily' | 'weeklyReview';
  periodStart?: string;
  periodEnd?: string;
  templateId: string;
  answers: Record<string, string | number>;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Inspiration {
  id: string;
  content: string;
  source?: string;
  tags: string[];
  createdAt: string;
  convertedToTaskId?: string;
}

export interface Entertainment {
  id: string;
  content: string;
  date: string;
}

export interface KeyResult {
  id: string;
  content: string;
  completed: boolean;
}

export interface Objective {
  id: string;
  title: string;
  period: string;
  keyResults: KeyResult[];
}

export interface InboxItem {
  id: string;
  objectiveId?: string;
  objectiveTitle?: string;
  content: string;
  completed: boolean;
  collectedAt: string;
  abilityId?: string;
  abilityPoints?: number;
  abilityName?: string;
}

export interface AppConfig {
  currentWeekStart: string;
  lastVisitDate: string;
  theme: 'dark' | 'light';
}

// ─── Module System ───

export type ModuleId =
  | 'principles'
  | 'calendar'
  | 'entertainment'
  | 'habits'
  | 'mood'
  | 'timeBlocks'
  | 'inspiration';

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  description: string;
  defaultEnabled: boolean;
  defaultZone: 'main' | 'side';
  icon: string;
}

export interface ModuleConfig {
  enabledModules: ModuleId[];
}

export type HabitColor = 'gold' | 'green' | 'blue' | 'red' | 'purple';

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly';

export interface Habit {
  id: string;
  name: string;
  color: HabitColor;
  frequency: HabitFrequency;
  targetDays: number;
  completions: Record<string, boolean>;
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  note: string;
  createdAt: string;
}

export interface TimeBlock {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  label: string;
  taskId?: string;
  color?: string;
  completed: boolean;
}

export interface AppState {
  tasks: Task[];
  calendarEvents: CalendarEvent[];
  principles: Principle[];
  abilities: Ability[];
  reflections: Reflection[];
  entertainments: Entertainment[];
  objectives: Objective[];
  inboxItems: InboxItem[];
  config: AppConfig;
  enabledModules: ModuleId[];
  habits: Habit[];
  moods: MoodEntry[];
  timeBlocks: TimeBlock[];
  inspirations: Inspiration[];
  reflectionTemplates: ReflectionTemplate[];
  syncConfig: import('./sync').CosSyncConfig;
  syncStatus: import('./sync').SyncStatus;
  __version: string;
}

// Electron IPC API exposed via contextBridge in preload.cjs
declare global {
  interface Window {
    electronAPI?: {
      loadDataSync: () => Record<string, string> | null;
      saveData: (data: Record<string, string>) => Promise<boolean>;
      saveDataSync: (data: Record<string, string>) => boolean;
      getDataFilePath: () => string;
      getAppVersion: () => string;
      saveRollback: (data: Record<string, unknown>) => Promise<boolean>;
      onBeforeQuit: (callback: () => void) => void;
    };
    androidStorage?: {
      loadData: () => string;
      saveData: (data: string) => boolean;
      getDataFilePath: () => string;
      getAppVersion: () => string;
      saveRollback: (data: string) => boolean;
    };
  }
}
