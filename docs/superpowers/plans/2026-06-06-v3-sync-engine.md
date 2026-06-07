# V3 Sync Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean V3 COS sync engine that initializes from the current browser-local data, isolates data by profile namespace, and automatically merges safe Android/browser changes without whole-snapshot conflict loops.

**Architecture:** Add a V3-only sync stack under `src/sync/v3/`: namespace/key helpers, envelope validation, AppState adapter, pure merge engine, COS transport, and runner. Wire existing manual/startup/auto sync through V3 first; keep legacy snapshot code only for manual backup/restore fallback.

**Tech Stack:** TypeScript, React hooks, Zustand persisted AppState, Tencent COS signed URLs, Node test runner.

---

## File Structure

- Create `src/sync/v3/v3SyncTypes.ts`: V3 envelope, entity tables, tombstones, conflicts, namespace, local cache types.
- Create `src/sync/v3/v3SyncNamespace.ts`: namespace and COS object key generation from `objectPrefix`, `profileId`, and future `userId`.
- Create `src/sync/v3/v3SyncEnvelope.ts`: checksum, validation, local cache helpers.
- Create `src/sync/v3/v3EntityAdapter.ts`: AppState to V3 entity document and V3 document back to AppState.
- Create `src/sync/v3/v3MergeEngine.ts`: pure three-way merge, tombstone handling, conflict generation and de-duplication.
- Create `src/sync/v3/v3SyncClient.ts`: COS download/upload for V3 envelopes.
- Create `src/sync/v3/v3SyncRunner.ts`: orchestration for clean initialization and daily sync.
- Modify `src/types/sync.ts`: add V3 sync status/cache fields without adding fields to business entities.
- Modify `src/sync/cosObjectKeys.ts`: expose V3 key helper or delegate to `v3SyncNamespace`.
- Modify `src/hooks/useAutoCosSync.ts`, `src/hooks/useStartupCosSync.ts`, `src/features/system/SyncPanel.tsx`: V3-first wiring and status display.
- Add tests: `tests/v3SyncNamespace.test.ts`, `tests/v3EntityAdapter.test.ts`, `tests/v3MergeEngine.test.ts`, `tests/v3SyncRunner.test.ts`.
- Update structure tests: auto/startup hook, SyncPanel, COS object keys.
- Remove or supersede the current uncommitted MVP `src/sync/entitySync*.ts` and `tests/entitySync*.test.ts` once V3 equivalents pass.

---

## Task 1: Namespace And V3 Types

**Files:**
- Create: `tests/v3SyncNamespace.test.ts`
- Create: `src/sync/v3/v3SyncTypes.ts`
- Create: `src/sync/v3/v3SyncNamespace.ts`
- Modify: `src/types/sync.ts`
- Modify: `src/sync/cosObjectKeys.ts`

- [ ] **Step 1: Write failing namespace tests**

Add tests that prove V3 paths differ by `profileId` and future `userId`:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { createV3SyncNamespace, v3SyncObjectKey } from '../src/sync/v3/v3SyncNamespace.ts';

const baseConfig = {
  objectPrefix: 'Forge-OS_Base/v2.0/Domain1127',
  profileId: 'default',
};

test('V3 sync key is isolated by profile namespace', () => {
  assert.equal(
    v3SyncObjectKey(baseConfig),
    'Forge-OS_Base/v2.0/Domain1127/profiles/default/forge-data.entities.v3.json'
  );
  assert.equal(
    v3SyncObjectKey({ ...baseConfig, profileId: 'work' }),
    'Forge-OS_Base/v2.0/Domain1127/profiles/work/forge-data.entities.v3.json'
  );
});

test('V3 namespace can reserve a future user id', () => {
  assert.equal(
    createV3SyncNamespace({ ...baseConfig, userId: 'user-a' }),
    'Forge-OS_Base/v2.0/Domain1127/users/user-a/profiles/default'
  );
});
```

- [ ] **Step 2: Run RED**

Run: `node --test tests\v3SyncNamespace.test.ts`

Expected: FAIL because `src/sync/v3/v3SyncNamespace.ts` does not exist.

- [ ] **Step 3: Implement V3 types and namespace helpers**

Define:

```ts
export interface V3SyncOwner {
  namespace: string;
  profileId: string;
  userId?: string;
}
```

Implement `createV3SyncNamespace(config)` and `v3SyncObjectKey(config)`.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests\v3SyncNamespace.test.ts`

Expected: PASS.

---

## Task 2: Envelope Validation And Local Cache

**Files:**
- Create: `tests/v3SyncEnvelope.test.ts`
- Create: `src/sync/v3/v3SyncEnvelope.ts`
- Modify: `src/types/sync.ts`

- [ ] **Step 1: Write failing envelope tests**

Cover:
- valid V3 envelope validates checksum
- namespace mismatch is rejected
- newer app version is rejected

Use expected errors: `checksum-mismatch`, `namespace-mismatch`, `newer-remote-version`.

- [ ] **Step 2: Run RED**

Run: `node --test tests\v3SyncEnvelope.test.ts`

Expected: FAIL because envelope helpers do not exist.

- [ ] **Step 3: Implement envelope helpers**

Implement:
- `createV3SyncEnvelope`
- `validateV3SyncEnvelope`
- `checksumV3SyncPayload`
- `isV3SyncEnvelope`

The envelope must include:

```ts
{
  schemaVersion: 3,
  appVersion,
  deviceId,
  owner: { namespace, profileId, userId },
  revision,
  updatedAt,
  checksum,
  entities,
  tombstones,
  conflicts
}
```

- [ ] **Step 4: Run GREEN**

Run: `node --test tests\v3SyncEnvelope.test.ts`

Expected: PASS.

---

## Task 3: Entity Adapter

**Files:**
- Create: `tests/v3EntityAdapter.test.ts`
- Create: `src/sync/v3/v3EntityAdapter.ts`

- [ ] **Step 1: Write failing adapter tests**

Test that all persisted collections become V3 entities:

```ts
assert.equal(snapshot.entities.tasks['task-1'].value.content, 'Task');
assert.equal(snapshot.entities.reflections['daily:2026-06-06'].value.id, 'reflection-1');
assert.equal(snapshot.entities.config.app.value.theme, 'dark');
```

Also test that restoring V3 entities does not overwrite local-only `syncConfig` secrets or current `syncStatus.deviceId`.

- [ ] **Step 2: Run RED**

Run: `node --test tests\v3EntityAdapter.test.ts`

Expected: FAIL because adapter helpers do not exist.

- [ ] **Step 3: Implement adapter**

Create stable keys:
- tasks/id-based collections by `id`
- daily reflection by `daily:${date}`
- weekly review by `weeklyReview:${periodStart}`
- moods by `mood:${date}`
- config and enabledModules by `app`

- [ ] **Step 4: Run GREEN**

Run: `node --test tests\v3EntityAdapter.test.ts`

Expected: PASS.

---

## Task 4: Merge Engine With Tombstones

**Files:**
- Create: `tests/v3MergeEngine.test.ts`
- Create: `src/sync/v3/v3MergeEngine.ts`

- [ ] **Step 1: Write failing merge tests**

Cover these cases:
- Android adds Saturday task while browser edits daily reflection answer, both survive.
- Same reflection answer changed differently creates one field conflict.
- Local deletes unchanged task, remote unchanged: merged task absent and tombstone recorded.
- Local deletes task while remote edits task: delete/edit conflict, no silent winner.
- Re-running merge with existing conflict does not duplicate conflict record.

- [ ] **Step 2: Run RED**

Run: `node --test tests\v3MergeEngine.test.ts`

Expected: FAIL because merge engine does not exist.

- [ ] **Step 3: Implement pure merge**

Implement `mergeV3SyncDocuments({ base, local, remote })`.

Rules:
- Base missing + local only: add local.
- Base missing + remote only: add remote.
- Base exists + one side changed: use changed side.
- Both changed same field same value: accept.
- Both changed same field different value: conflict.
- Base exists + one side missing + other unchanged: tombstone delete.
- Base exists + one side missing + other changed: delete/edit conflict.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests\v3MergeEngine.test.ts`

Expected: PASS.

---

## Task 5: V3 COS Client And Runner

**Files:**
- Create: `tests/v3SyncRunner.test.ts`
- Create: `src/sync/v3/v3SyncClient.ts`
- Create: `src/sync/v3/v3SyncRunner.ts`

- [ ] **Step 1: Write failing runner tests**

Cover:
- empty COS initializes from browser local state
- remote namespace mismatch returns error and does not mutate local
- browser reflection + Android task sync uploads merged V3 envelope
- unresolved conflict returns conflict result and preserves local state

- [ ] **Step 2: Run RED**

Run: `node --test tests\v3SyncRunner.test.ts`

Expected: FAIL because runner/client do not exist.

- [ ] **Step 3: Implement V3 client and runner**

Implement:
- `createV3SyncClient`
- `runV3Sync`
- `applyV3SyncSuccessToState`

Runner flow:
1. Build local V3 document from AppState.
2. Download remote V3 envelope.
3. If remote missing, upload local as first baseline.
4. If remote exists, validate namespace and checksum.
5. Merge base/local/remote.
6. Upload merged if no blocking conflicts.
7. Return updated AppState and local cache fields.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests\v3SyncRunner.test.ts`

Expected: PASS.

---

## Task 6: Hook And UI Wiring

**Files:**
- Modify: `src/hooks/useAutoCosSync.ts`
- Modify: `src/hooks/useStartupCosSync.ts`
- Modify: `src/features/system/SyncPanel.tsx`
- Modify: `tests/autoSyncHookStructure.test.ts`
- Modify: `tests/startupSyncHookStructure.test.ts`
- Modify: `tests/syncPanelStructure.test.ts`

- [ ] **Step 1: Update structure tests first**

Assert hooks import/use:
- `runV3Sync`
- `createV3SyncClient`
- `v3SyncObjectKey`
- `v3SyncBase`
- `v3SyncRevision`

Assert SyncPanel displays:
- V3 namespace
- V3 revision
- V3 auto merged count
- V3 conflict count

- [ ] **Step 2: Run RED**

Run: `node --test tests\autoSyncHookStructure.test.ts tests\startupSyncHookStructure.test.ts tests\syncPanelStructure.test.ts`

Expected: FAIL until wiring is updated.

- [ ] **Step 3: Wire V3 first**

Manual/startup/auto sync must call V3 first. If V3 succeeds, do not run legacy v1/v2 daily sync. If V3 returns explicit namespace mismatch or conflict, show error/conflict. Keep legacy history restore controls unchanged.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests\autoSyncHookStructure.test.ts tests\startupSyncHookStructure.test.ts tests\syncPanelStructure.test.ts`

Expected: PASS.

---

## Task 7: Verification And Android Build

**Files:**
- Modify tests as needed only for V3 behavior.
- Android generated output from build is allowed.

- [ ] **Step 1: Remove superseded MVP V2 files**

Remove uncommitted `src/sync/entitySync*.ts` and `tests/entitySync*.test.ts` once V3 tests cover the same behavior.

- [ ] **Step 2: Run focused V3 tests**

Run:

```powershell
node --test tests\v3SyncNamespace.test.ts tests\v3SyncEnvelope.test.ts tests\v3EntityAdapter.test.ts tests\v3MergeEngine.test.ts tests\v3SyncRunner.test.ts
```

Expected: all pass.

- [ ] **Step 3: Run full tests**

Run:

```powershell
node --test tests\*.test.ts
```

Expected: all pass.

- [ ] **Step 4: Run build and lint**

Run:

```powershell
npm run build
npm run lint
```

Expected: both exit 0.

- [ ] **Step 5: Build Android APK**

Run:

```powershell
npm run android:build
```

Expected: `android/app/build/outputs/apk/debug/app-debug.apk` updated and build exits 0.

- [ ] **Step 6: Verify COS cleanup before first initialization**

Run a read-only COS listing for `Forge-OS_Base/v2.0/Domain1127/` and confirm no old `forge-data.sync.json`, `forge-data.entities.v2.json`, or `forge-data.entities.v3.json` exists before the browser initializes V3.
