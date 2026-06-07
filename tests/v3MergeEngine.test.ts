import assert from 'node:assert/strict';
import test from 'node:test';
import type { AppState, Reflection, Task } from '../src/types/index.ts';
import { createV3SyncEntitiesFromAppState } from '../src/sync/v3/v3EntityAdapter.ts';
import { createV3SyncEnvelope } from '../src/sync/v3/v3SyncEnvelope.ts';
import { mergeV3SyncDocuments } from '../src/sync/v3/v3MergeEngine.ts';
import type { V3SyncEnvelope, V3SyncOwner } from '../src/sync/v3/v3SyncTypes.ts';

const owner: V3SyncOwner = {
  namespace: 'Forge-OS_Base/v2.0/Domain1127/profiles/default',
  profileId: 'default',
};

const baseTask: Task = {
  id: 'task-1',
  content: 'Base task',
  column: 'SAT',
  date: '2026-06-06',
  status: 'active',
  order: 0,
};

const baseReflection: Reflection = {
  id: 'reflection-1',
  date: '2026-06-06',
  kind: 'daily',
  templateId: 'daily-template',
  answers: { note: 'Base note', score: 1 },
  tags: ['base'],
  createdAt: '2026-06-06T08:00:00.000Z',
};

const baseState = (): AppState => ({
  tasks: [baseTask],
  calendarEvents: [],
  principles: [],
  abilities: [],
  reflections: [baseReflection],
  entertainments: [],
  objectives: [],
  inboxItems: [],
  config: {
    currentWeekStart: '2026-06-01',
    lastVisitDate: '2026-06-06',
    theme: 'dark',
  },
  enabledModules: ['mood'],
  habits: [],
  moods: [],
  timeBlocks: [],
  inspirations: [],
  reflectionTemplates: [],
  syncConfig: {
    enabled: true,
    endpoint: 'cos.ap-guangzhou.myqcloud.com',
    region: 'ap-guangzhou',
    bucket: 'workbase-1321785586',
    profileId: 'default',
    objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
    credentialProviderUrl: 'https://example.com/cos-sign',
  },
  syncStatus: {
    phase: 'idle',
    deviceId: 'browser',
  },
  __version: '1.0.5',
});

const envelopeFromState = async (
  state: AppState,
  deviceId: string,
  updatedAt: string,
  previous?: Pick<V3SyncEnvelope, 'tombstones' | 'conflicts'>
): Promise<V3SyncEnvelope> =>
  createV3SyncEnvelope({
    appVersion: '1.0.5',
    deviceId,
    owner,
    entities: createV3SyncEntitiesFromAppState({ state, updatedAt, updatedBy: deviceId }),
    tombstones: previous?.tombstones ?? [],
    conflicts: previous?.conflicts ?? [],
    updatedAt,
  });

test('V3 merge keeps Android Saturday task and browser reflection edit', async () => {
  const base = await envelopeFromState(baseState(), 'browser', '2026-06-06T08:00:00.000Z');
  const local = await envelopeFromState(
    {
      ...baseState(),
      reflections: [
        {
          ...baseReflection,
          answers: { ...baseReflection.answers, note: 'Browser note' },
        },
      ],
    },
    'browser',
    '2026-06-06T09:00:00.000Z'
  );
  const remote = await envelopeFromState(
    {
      ...baseState(),
      tasks: [
        baseTask,
        {
          id: 'task-android',
          content: 'Android Saturday task',
          column: 'SAT',
          date: '2026-06-06',
          status: 'active',
          order: 1,
        },
      ],
    },
    'android',
    '2026-06-06T09:05:00.000Z'
  );

  const merged = mergeV3SyncDocuments({
    base,
    local,
    remote,
    deviceId: 'browser',
    now: '2026-06-06T10:00:00.000Z',
  });

  assert.equal(merged.conflicts.length, 0);
  assert.equal(merged.entities.tasks['task-android'].value.content, 'Android Saturday task');
  assert.equal(merged.entities.reflections['daily:2026-06-06'].value.answers.note, 'Browser note');
  assert.equal(merged.autoMerged, 2);
});

test('V3 merge creates one conflict for the same reflection answer changed differently', async () => {
  const base = await envelopeFromState(baseState(), 'browser', '2026-06-06T08:00:00.000Z');
  const local = await envelopeFromState(
    {
      ...baseState(),
      reflections: [{ ...baseReflection, answers: { ...baseReflection.answers, note: 'Local' } }],
    },
    'browser',
    '2026-06-06T09:00:00.000Z'
  );
  const remote = await envelopeFromState(
    {
      ...baseState(),
      reflections: [{ ...baseReflection, answers: { ...baseReflection.answers, note: 'Remote' } }],
    },
    'android',
    '2026-06-06T09:05:00.000Z'
  );

  const merged = mergeV3SyncDocuments({
    base,
    local,
    remote,
    deviceId: 'browser',
    now: '2026-06-06T10:00:00.000Z',
  });

  assert.equal(merged.conflicts.length, 1);
  assert.equal(merged.conflicts[0].kind, 'field');
  assert.equal(merged.conflicts[0].field, 'answers.note');
  assert.equal(merged.conflicts[0].localValue, 'Local');
  assert.equal(merged.conflicts[0].remoteValue, 'Remote');
});

test('V3 merge records tombstone when one side deletes an unchanged task', async () => {
  const base = await envelopeFromState(baseState(), 'browser', '2026-06-06T08:00:00.000Z');
  const local = await envelopeFromState(
    { ...baseState(), tasks: [] },
    'browser',
    '2026-06-06T09:00:00.000Z'
  );
  const remote = await envelopeFromState(baseState(), 'android', '2026-06-06T09:05:00.000Z');

  const merged = mergeV3SyncDocuments({
    base,
    local,
    remote,
    deviceId: 'browser',
    now: '2026-06-06T10:00:00.000Z',
  });

  assert.equal(merged.entities.tasks['task-1'], undefined);
  assert.equal(merged.tombstones.length, 1);
  assert.equal(merged.tombstones[0].collection, 'tasks');
  assert.equal(merged.tombstones[0].entityKey, 'task-1');
});

test('V3 merge creates delete/edit conflict without silently choosing a winner', async () => {
  const base = await envelopeFromState(baseState(), 'browser', '2026-06-06T08:00:00.000Z');
  const local = await envelopeFromState(
    { ...baseState(), tasks: [] },
    'browser',
    '2026-06-06T09:00:00.000Z'
  );
  const remote = await envelopeFromState(
    { ...baseState(), tasks: [{ ...baseTask, content: 'Remote edit' }] },
    'android',
    '2026-06-06T09:05:00.000Z'
  );

  const merged = mergeV3SyncDocuments({
    base,
    local,
    remote,
    deviceId: 'browser',
    now: '2026-06-06T10:00:00.000Z',
  });

  assert.equal(merged.conflicts.length, 1);
  assert.equal(merged.conflicts[0].kind, 'delete-edit');
  assert.equal(merged.conflicts[0].localDeleted, true);
  assert.equal((merged.conflicts[0].remoteValue as Task).content, 'Remote edit');
});

test('V3 merge does not duplicate an existing unresolved conflict', async () => {
  const base = await envelopeFromState(baseState(), 'browser', '2026-06-06T08:00:00.000Z');
  const local = await envelopeFromState(
    {
      ...baseState(),
      reflections: [{ ...baseReflection, answers: { ...baseReflection.answers, note: 'Local' } }],
    },
    'browser',
    '2026-06-06T09:00:00.000Z'
  );
  const firstRemote = await envelopeFromState(
    {
      ...baseState(),
      reflections: [{ ...baseReflection, answers: { ...baseReflection.answers, note: 'Remote' } }],
    },
    'android',
    '2026-06-06T09:05:00.000Z'
  );
  const first = mergeV3SyncDocuments({
    base,
    local,
    remote: firstRemote,
    deviceId: 'browser',
    now: '2026-06-06T10:00:00.000Z',
  });
  const remoteWithConflict = await envelopeFromState(
    {
      ...baseState(),
      reflections: [{ ...baseReflection, answers: { ...baseReflection.answers, note: 'Remote' } }],
    },
    'android',
    '2026-06-06T10:05:00.000Z',
    { tombstones: first.tombstones, conflicts: first.conflicts }
  );

  const second = mergeV3SyncDocuments({
    base,
    local,
    remote: remoteWithConflict,
    deviceId: 'browser',
    now: '2026-06-06T11:00:00.000Z',
  });

  assert.equal(first.conflicts.length, 1);
  assert.equal(second.conflicts.length, 1);
  assert.equal(second.conflicts[0].id, first.conflicts[0].id);
});
