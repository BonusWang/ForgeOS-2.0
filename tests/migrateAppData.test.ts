import assert from 'node:assert/strict';
import test from 'node:test';
import { migrateAppData } from '../src/utils/migrateAppData.ts';
import type { AppState } from '../src/types';

const createState = (objectPrefix: string): AppState =>
  ({
    tasks: [],
    calendarEvents: [],
    principles: [],
    abilities: [],
    reflections: [],
    entertainments: [],
    objectives: [],
    inboxItems: [],
    config: {
      currentWeekStart: '2026-06-01',
      lastVisitDate: '2026-06-03',
      theme: 'dark',
    },
    enabledModules: [],
    habits: [],
    moods: [],
    timeBlocks: [],
    inspirations: [],
    reflectionTemplates: [],
    syncConfig: {
      enabled: false,
      endpoint: 'cos.ap-guangzhou.myqcloud.com',
      region: 'ap-guangzhou',
      bucket: 'workbase-1321785586',
      profileId: 'default',
      objectPrefix,
      credentialProviderUrl: 'http://127.0.0.1:8787/cos/sign',
      accessKeyId: '',
      secretAccessKey: '',
    },
    syncStatus: {
      phase: 'idle',
      deviceId: 'device-1',
    },
    __version: '1.0.2',
  }) as AppState;

test('migrateAppData preserves explicitly customized COS object prefixes', () => {
  const migrated = migrateAppData(createState('Forge-OS_Base/v2.0/Domain1127/Android'), '1.0.2');

  assert.equal(migrated.syncConfig.objectPrefix, 'Forge-OS_Base/v2.0/Domain1127/Android');
});
