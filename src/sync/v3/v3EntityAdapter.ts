import type {
  Ability,
  AppState,
  CalendarEvent,
  Entertainment,
  Habit,
  InboxItem,
  Inspiration,
  MoodEntry,
  Objective,
  Principle,
  Reflection,
  ReflectionTemplate,
  Task,
  TimeBlock,
} from '../../types';
import { cloneV3SyncValue, stableStringify } from './v3SyncEnvelope.ts';
import { createEmptyV3SyncEntities, type V3SyncEntities, type V3SyncedEntity } from './v3SyncTypes.ts';

interface CreateV3SyncEntitiesInput {
  state: AppState;
  updatedAt: string;
  updatedBy: string;
}

const idEntityKey = (entity: { id: string }): string => entity.id;

export const reflectionV3EntityKey = (reflection: Reflection): string => {
  const kind = reflection.kind ?? 'daily';
  if (kind === 'weeklyReview') {
    return `weeklyReview:${reflection.periodStart ?? reflection.id}`;
  }

  return `daily:${reflection.date}`;
};

export const moodV3EntityKey = (mood: MoodEntry): string => `mood:${mood.date}`;

export const createV3SyncedEntity = <T,>(
  value: T,
  updatedAt: string,
  updatedBy: string
): V3SyncedEntity<T> => {
  const cloned = cloneV3SyncValue(value);
  return {
    value: cloned,
    hash: stableStringify(cloned),
    updatedAt,
    updatedBy,
  };
};

const addEntities = <T extends { id: string }>(
  records: T[],
  target: Record<string, V3SyncedEntity<T>>,
  updatedAt: string,
  updatedBy: string
): void => {
  records.forEach((record) => {
    target[idEntityKey(record)] = createV3SyncedEntity(record, updatedAt, updatedBy);
  });
};

const sortRecordValues = <T,>(record: Record<string, V3SyncedEntity<T>>): T[] =>
  Object.keys(record)
    .sort()
    .map((key) => cloneV3SyncValue(record[key].value));

export const createV3SyncEntitiesFromAppState = ({
  state,
  updatedAt,
  updatedBy,
}: CreateV3SyncEntitiesInput): V3SyncEntities => {
  const entities = createEmptyV3SyncEntities();

  addEntities<Task>(state.tasks, entities.tasks, updatedAt, updatedBy);
  addEntities<CalendarEvent>(state.calendarEvents, entities.calendarEvents, updatedAt, updatedBy);
  addEntities<Principle>(state.principles, entities.principles, updatedAt, updatedBy);
  addEntities<Ability>(state.abilities, entities.abilities, updatedAt, updatedBy);
  state.reflections.forEach((reflection) => {
    entities.reflections[reflectionV3EntityKey(reflection)] = createV3SyncedEntity(
      reflection,
      updatedAt,
      updatedBy
    );
  });
  addEntities<Entertainment>(state.entertainments, entities.entertainments, updatedAt, updatedBy);
  addEntities<Objective>(state.objectives, entities.objectives, updatedAt, updatedBy);
  addEntities<InboxItem>(state.inboxItems, entities.inboxItems, updatedAt, updatedBy);
  entities.config.app = createV3SyncedEntity(state.config, updatedAt, updatedBy);
  entities.enabledModules.app = createV3SyncedEntity(state.enabledModules, updatedAt, updatedBy);
  addEntities<Habit>(state.habits, entities.habits, updatedAt, updatedBy);
  state.moods.forEach((mood) => {
    entities.moods[moodV3EntityKey(mood)] = createV3SyncedEntity(mood, updatedAt, updatedBy);
  });
  addEntities<TimeBlock>(state.timeBlocks, entities.timeBlocks, updatedAt, updatedBy);
  addEntities<Inspiration>(state.inspirations, entities.inspirations, updatedAt, updatedBy);
  addEntities<ReflectionTemplate>(
    state.reflectionTemplates,
    entities.reflectionTemplates,
    updatedAt,
    updatedBy
  );

  return entities;
};

export const restoreAppStateFromV3SyncEntities = (
  currentState: AppState,
  entities: V3SyncEntities
): AppState => ({
  ...currentState,
  tasks: sortRecordValues(entities.tasks),
  calendarEvents: sortRecordValues(entities.calendarEvents),
  principles: sortRecordValues(entities.principles),
  abilities: sortRecordValues(entities.abilities),
  reflections: sortRecordValues(entities.reflections),
  entertainments: sortRecordValues(entities.entertainments),
  objectives: sortRecordValues(entities.objectives),
  inboxItems: sortRecordValues(entities.inboxItems),
  config: entities.config.app
    ? cloneV3SyncValue(entities.config.app.value)
    : currentState.config,
  enabledModules: entities.enabledModules.app
    ? cloneV3SyncValue(entities.enabledModules.app.value)
    : currentState.enabledModules,
  habits: sortRecordValues(entities.habits),
  moods: sortRecordValues(entities.moods),
  timeBlocks: sortRecordValues(entities.timeBlocks),
  inspirations: sortRecordValues(entities.inspirations),
  reflectionTemplates: sortRecordValues(entities.reflectionTemplates),
});
