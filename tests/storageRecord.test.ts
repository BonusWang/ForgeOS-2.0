import assert from 'node:assert/strict';
import test from 'node:test';
import { createStorageRecordFromAppState } from '../src/utils/storageRecord.ts';
import type { AppState } from '../src/types/index.ts';

test('createStorageRecordFromAppState includes sync config without long-term secrets', () => {
  const state = {
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
      enabled: true,
      endpoint: 'cos.ap-guangzhou.myqcloud.com',
      region: 'ap-guangzhou',
      bucket: 'workbase-1321785586',
      profileId: 'default',
      objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
      credentialProviderUrl: 'http://127.0.0.1:8787/cos/sign',
      accessKeyId: 'AKIDEXAMPLE',
      secretAccessKey: 'SECRETEXAMPLE',
    },
    syncStatus: {
      phase: 'idle',
      deviceId: 'device-1',
    },
    __version: '1.0.2',
  } satisfies AppState;

  const record = createStorageRecordFromAppState(state);
  const persisted = JSON.parse(record['forge-storage']).state;

  assert.equal(persisted.syncConfig.endpoint, 'cos.ap-guangzhou.myqcloud.com');
  assert.equal(persisted.syncStatus.deviceId, 'device-1');
  assert.equal('accessKeyId' in persisted.syncConfig, false);
  assert.equal('secretAccessKey' in persisted.syncConfig, false);
  assert.equal(JSON.stringify(persisted).includes('AKIDEXAMPLE'), false);
  assert.equal(JSON.stringify(persisted).includes('SECRETEXAMPLE'), false);
});
