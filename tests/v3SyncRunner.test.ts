import assert from 'node:assert/strict';
import test from 'node:test';
import type { AppState, Reflection, Task } from '../src/types/index.ts';
import { createV3SyncEntitiesFromAppState } from '../src/sync/v3/v3EntityAdapter.ts';
import { createV3SyncEnvelope } from '../src/sync/v3/v3SyncEnvelope.ts';
import { runV3Sync, type V3SyncClient } from '../src/sync/v3/v3SyncRunner.ts';
import { createV3SyncOwner, v3SyncObjectKey } from '../src/sync/v3/v3SyncNamespace.ts';
import type { V3SyncEnvelope } from '../src/sync/v3/v3SyncTypes.ts';

const config = {
  enabled: true,
  endpoint: 'cos.ap-guangzhou.myqcloud.com',
  region: 'ap-guangzhou',
  bucket: 'workbase-1321785586',
  profileId: 'default',
  objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
  credentialProviderUrl: 'https://example.com/cos-sign',
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
  answers: { note: 'Base note' },
  tags: [],
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
  syncConfig: config,
  syncStatus: {
    phase: 'idle',
    deviceId: 'browser',
  },
  __version: '1.0.5',
});

const envelopeFromState = (
  state: AppState,
  deviceId: string,
  updatedAt: string,
  previous?: Pick<V3SyncEnvelope, 'tombstones' | 'conflicts'>
): Promise<V3SyncEnvelope> =>
  createV3SyncEnvelope({
    appVersion: '1.0.5',
    deviceId,
    owner: createV3SyncOwner(config),
    entities: createV3SyncEntitiesFromAppState({ state, updatedAt, updatedBy: deviceId }),
    tombstones: previous?.tombstones ?? [],
    conflicts: previous?.conflicts ?? [],
    updatedAt,
  });

const fakeClient = (remote: V3SyncEnvelope | null = null) => {
  const uploads: Array<{ key: string; envelope: V3SyncEnvelope }> = [];
  const client: V3SyncClient = {
    downloadV3Snapshot: async () => remote,
    uploadV3Snapshot: async (key, envelope) => {
      uploads.push({ key, envelope });
    },
  };
  return { client, uploads };
};

test('V3 runner initializes empty COS from browser local state', async () => {
  const { client, uploads } = fakeClient(null);

  const result = await runV3Sync({
    config,
    client,
    key: v3SyncObjectKey(config),
    appVersion: '1.0.5',
    deviceId: 'browser',
    state: baseState(),
    now: '2026-06-06T10:00:00.000Z',
  });

  assert.equal(result.phase, 'success');
  if (result.phase === 'success') {
    assert.equal(result.action, 'initialized');
    assert.equal(result.baseEnvelope.owner.namespace, createV3SyncOwner(config).namespace);
    assert.equal(result.state.tasks[0].content, 'Base task');
  }
  assert.equal(uploads.length, 1);
  assert.equal(uploads[0].key, v3SyncObjectKey(config));
  assert.equal(uploads[0].envelope.entities.tasks['task-1'].value.content, 'Base task');
});

test('V3 runner rejects remote namespace mismatch without mutating local state', async () => {
  const remote = await createV3SyncEnvelope({
    appVersion: '1.0.5',
    deviceId: 'other',
    owner: {
      namespace: 'Forge-OS_Base/v2.0/Domain1127/profiles/work',
      profileId: 'work',
    },
    entities: createV3SyncEntitiesFromAppState({
      state: { ...baseState(), tasks: [{ ...baseTask, content: 'Wrong namespace' }] },
      updatedAt: '2026-06-06T09:00:00.000Z',
      updatedBy: 'other',
    }),
    tombstones: [],
    conflicts: [],
    updatedAt: '2026-06-06T09:00:00.000Z',
  });
  const { client, uploads } = fakeClient(remote);
  const state = baseState();

  const result = await runV3Sync({
    config,
    client,
    key: v3SyncObjectKey(config),
    appVersion: '1.0.5',
    deviceId: 'browser',
    state,
    now: '2026-06-06T10:00:00.000Z',
  });

  assert.deepEqual(state.tasks, [baseTask]);
  assert.equal(result.phase, 'error');
  if (result.phase === 'error') {
    assert.equal(result.error, 'namespace-mismatch');
  }
  assert.equal(uploads.length, 0);
});

test('V3 runner uploads merged browser reflection and Android Saturday task', async () => {
  const base = await envelopeFromState(baseState(), 'browser', '2026-06-06T08:00:00.000Z');
  const localState = {
    ...baseState(),
    reflections: [{ ...baseReflection, answers: { note: 'Browser note' } }],
  };
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
  const { client, uploads } = fakeClient(remote);

  const result = await runV3Sync({
    config,
    client,
    key: v3SyncObjectKey(config),
    appVersion: '1.0.5',
    deviceId: 'browser',
    state: localState,
    baseEnvelope: base,
    now: '2026-06-06T10:00:00.000Z',
    hasLocalChanges: true,
  });

  assert.equal(result.phase, 'success');
  assert.equal(uploads.length, 1);
  assert.equal(uploads[0].envelope.entities.tasks['task-android'].value.content, 'Android Saturday task');
  assert.equal(
    uploads[0].envelope.entities.reflections['daily:2026-06-06'].value.answers.note,
    'Browser note'
  );
  if (result.phase === 'success') {
    assert.equal(result.state.tasks.some((task) => task.id === 'task-android'), true);
    assert.equal(result.autoMerged, 2);
  }
});

test('V3 runner downloads remote baseline on first mobile sync even when local storage is marked dirty', async () => {
  const remote = await envelopeFromState(
    {
      ...baseState(),
      tasks: [{ ...baseTask, content: 'Browser latest task' }],
    },
    'browser',
    '2026-06-06T10:22:53.801Z'
  );
  const { client, uploads } = fakeClient(remote);

  const result = await runV3Sync({
    config,
    client,
    key: v3SyncObjectKey(config),
    appVersion: '1.0.5',
    deviceId: 'android',
    state: {
      ...baseState(),
      syncStatus: {
        phase: 'idle',
        deviceId: 'android',
        lastLocalUpdatedAt: '2026-06-06T12:04:31.180Z',
      },
    },
    now: '2026-06-06T12:08:00.000Z',
    hasLocalChanges: true,
  });

  assert.equal(result.phase, 'success');
  assert.equal(uploads.length, 0);
  if (result.phase === 'success') {
    assert.equal(result.action, 'downloaded');
    assert.equal(result.state.tasks[0].content, 'Browser latest task');
    assert.equal(result.baseEnvelope.revision, remote.revision);
  }
});

test('V3 runner reports unresolved conflict and preserves local state', async () => {
  const base = await envelopeFromState(baseState(), 'browser', '2026-06-06T08:00:00.000Z');
  const localState = {
    ...baseState(),
    reflections: [{ ...baseReflection, answers: { note: 'Local' } }],
  };
  const remote = await envelopeFromState(
    {
      ...baseState(),
      reflections: [{ ...baseReflection, answers: { note: 'Remote' } }],
    },
    'android',
    '2026-06-06T09:05:00.000Z'
  );
  const { client } = fakeClient(remote);

  const result = await runV3Sync({
    config,
    client,
    key: v3SyncObjectKey(config),
    appVersion: '1.0.5',
    deviceId: 'browser',
    state: localState,
    baseEnvelope: base,
    now: '2026-06-06T10:00:00.000Z',
    hasLocalChanges: true,
  });

  assert.equal(result.phase, 'conflict');
  if (result.phase === 'conflict') {
    assert.equal(result.state.reflections[0].answers.note, 'Local');
    assert.equal(result.conflicts.length, 1);
  }
});

test('V3 runner initializes clean V3 data without checking retired main objects', async () => {
  const uploads: V3SyncEnvelope[] = [];
  const client: V3SyncClient = {
    downloadV3Snapshot: async () => null,
    uploadV3Snapshot: async (_key, envelope) => {
      uploads.push(envelope);
    },
    objectExists: async () => {
      throw new Error('retired object checks must not run');
    },
  };

  const result = await runV3Sync({
    config,
    client,
    key: v3SyncObjectKey(config),
    appVersion: '1.0.5',
    deviceId: 'browser',
    state: baseState(),
    now: '2026-06-06T10:00:00.000Z',
  });

  assert.equal(result.phase, 'success');
  if (result.phase === 'success') {
    assert.equal(result.action, 'initialized');
  }
  assert.equal(uploads.length, 1);
});
