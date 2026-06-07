import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type { AppState } from '../src/types/index.ts';
import {
  createV3SyncEntitiesFromAppState,
  restoreAppStateFromV3SyncEntities,
} from '../src/sync/v3/v3EntityAdapter.ts';

const baseState = (): AppState => ({
  tasks: [
    {
      id: 'task-1',
      content: 'Task',
      column: 'SAT',
      date: '2026-06-06',
      status: 'active',
      order: 0,
    },
  ],
  calendarEvents: [
    {
      id: 'event-1',
      date: '2026-06-06',
      content: 'Exam room',
      createdAt: '2026-06-06T07:00:00.000Z',
    },
  ],
  principles: [{ id: 'principle-1', content: 'Stay calm', order: 0 }],
  abilities: [{ id: 'ability-1', name: 'Focus', currentScore: 1, maxScore: 10, tasks: [] }],
  reflections: [
    {
      id: 'reflection-1',
      date: '2026-06-06',
      kind: 'daily',
      templateId: 'daily-template',
      answers: { note: 'Browser note' },
      tags: ['sync'],
      createdAt: '2026-06-06T08:00:00.000Z',
    },
    {
      id: 'reflection-week',
      date: '2026-06-07',
      kind: 'weeklyReview',
      periodStart: '2026-06-01',
      periodEnd: '2026-06-07',
      templateId: 'weekly-template',
      answers: { win: 'Merged safely' },
      tags: [],
      createdAt: '2026-06-07T08:00:00.000Z',
    },
  ],
  entertainments: [{ id: 'ent-1', content: 'Movie', date: '2026-06-06' }],
  objectives: [
    {
      id: 'objective-1',
      title: 'Ship V3',
      period: '2026-06',
      keyResults: [{ id: 'kr-1', content: 'Tests pass', completed: false }],
    },
  ],
  inboxItems: [
    {
      id: 'inbox-1',
      content: 'Follow up',
      completed: false,
      collectedAt: '2026-06-06T09:00:00.000Z',
    },
  ],
  config: {
    currentWeekStart: '2026-06-01',
    lastVisitDate: '2026-06-06',
    theme: 'dark',
  },
  enabledModules: ['mood', 'inspiration'],
  habits: [
    {
      id: 'habit-1',
      name: 'Stretch',
      color: 'green',
      frequency: 'daily',
      targetDays: 7,
      completions: { '2026-06-06': true },
      createdAt: '2026-06-01T00:00:00.000Z',
    },
  ],
  moods: [
    {
      id: 'mood-1',
      date: '2026-06-06',
      mood: 7,
      energy: 6,
      note: 'Good',
      createdAt: '2026-06-06T08:10:00.000Z',
    },
  ],
  timeBlocks: [
    {
      id: 'block-1',
      date: '2026-06-06',
      startTime: '10:00',
      endTime: '11:00',
      label: 'Workout',
      completed: false,
    },
  ],
  inspirations: [
    {
      id: 'idea-1',
      content: 'Sync entities',
      tags: ['sync'],
      createdAt: '2026-06-06T08:12:00.000Z',
    },
  ],
  reflectionTemplates: [
    {
      id: 'daily-template',
      name: 'Daily',
      isDefault: true,
      questions: [
        {
          id: 'note',
          label: 'Note',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  syncConfig: {
    enabled: true,
    endpoint: 'cos.ap-guangzhou.myqcloud.com',
    region: 'ap-guangzhou',
    bucket: 'workbase-1321785586',
    profileId: 'default',
    objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
    credentialProviderUrl: 'https://example.com/cos-sign',
    accessKeyId: 'local-key',
    secretAccessKey: 'local-secret',
  },
  syncStatus: {
    phase: 'idle',
    deviceId: 'device-1',
  },
  __version: '1.0.5',
});

test('V3 adapter creates stable entities for all persisted collections', () => {
  const entities = createV3SyncEntitiesFromAppState({
    state: baseState(),
    updatedAt: '2026-06-06T10:00:00.000Z',
    updatedBy: 'device-1',
  });

  assert.equal(entities.tasks['task-1'].value.content, 'Task');
  assert.equal(entities.calendarEvents['event-1'].value.content, 'Exam room');
  assert.equal(entities.principles['principle-1'].value.content, 'Stay calm');
  assert.equal(entities.abilities['ability-1'].value.name, 'Focus');
  assert.equal(entities.reflections['daily:2026-06-06'].value.id, 'reflection-1');
  assert.equal(entities.reflections['weeklyReview:2026-06-01'].value.id, 'reflection-week');
  assert.equal(entities.entertainments['ent-1'].value.content, 'Movie');
  assert.equal(entities.objectives['objective-1'].value.title, 'Ship V3');
  assert.equal(entities.inboxItems['inbox-1'].value.content, 'Follow up');
  assert.equal(entities.config.app?.value.theme, 'dark');
  assert.deepEqual(entities.enabledModules.app?.value, ['mood', 'inspiration']);
  assert.equal(entities.habits['habit-1'].value.name, 'Stretch');
  assert.equal(entities.moods['mood:2026-06-06'].value.mood, 7);
  assert.equal(entities.timeBlocks['block-1'].value.label, 'Workout');
  assert.equal(entities.inspirations['idea-1'].value.content, 'Sync entities');
  assert.equal(entities.reflectionTemplates['daily-template'].value.name, 'Daily');
});

test('V3 adapter restores entities without overwriting local sync secrets', () => {
  const remoteState = {
    ...baseState(),
    tasks: [
      {
        id: 'task-remote',
        content: 'Remote task',
        column: 'SAT' as const,
        date: '2026-06-06',
        status: 'active' as const,
        order: 1,
      },
    ],
    syncConfig: {
      ...baseState().syncConfig,
      accessKeyId: 'remote-key',
      secretAccessKey: 'remote-secret',
    },
    syncStatus: {
      phase: 'success' as const,
      deviceId: 'remote-device',
    },
  };
  const entities = createV3SyncEntitiesFromAppState({
    state: remoteState,
    updatedAt: '2026-06-06T10:00:00.000Z',
    updatedBy: 'remote-device',
  });

  const restored = restoreAppStateFromV3SyncEntities(baseState(), entities);

  assert.deepEqual(restored.tasks.map((task) => task.id), ['task-remote']);
  assert.equal(restored.syncConfig.accessKeyId, 'local-key');
  assert.equal(restored.syncConfig.secretAccessKey, 'local-secret');
  assert.equal(restored.syncStatus.deviceId, 'device-1');
});

test('V3 adapter round-trips the current browser backup data', (t) => {
  const backupPath = 'E:/forge-backup-2026-06-06.json';
  if (!fs.existsSync(backupPath)) {
    t.skip('local backup fixture is not present');
    return;
  }

  const backup = JSON.parse(fs.readFileSync(backupPath, 'utf-8')) as AppState;
  const entities = createV3SyncEntitiesFromAppState({
    state: backup,
    updatedAt: '2026-06-06T10:00:00.000Z',
    updatedBy: backup.syncStatus.deviceId,
  });
  const restored = restoreAppStateFromV3SyncEntities(backup, entities);

  assert.equal(Object.keys(entities.tasks).length, 34);
  assert.equal(restored.tasks.length, backup.tasks.length);
  assert.equal(restored.reflections.length, backup.reflections.length);
  assert.equal(restored.moods.length, backup.moods.length);
  assert.deepEqual(
    restored.tasks
      .filter((task) => task.date === '2026-06-06' && task.column === 'SAT')
      .map((task) => task.content)
      .sort(),
    ['带弟弟去酒店', '拉伸锻炼一小时', '提前熟悉考场以及早餐店'].sort()
  );
});
