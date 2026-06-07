# Entity-Level Sync MVP Implementation Plan

> Implementation rule: keep this as a first-phase MVP. The goal is real data flow between browser and mobile, not a complete sync platform.

## Goal

Browser and mobile can both edit data, then sync into one merged state without whole-snapshot overwrites. The 2026-06-04 incident must be covered: a browser-side reflection update and a mobile-side tomorrow task must both survive the next sync.

## Necessary Scope

Build only these pieces:

- A separate v2 COS object: `forge-data.entities.v2.json`.
- Stable entity keys for existing records that already have durable identity:
  - tasks by `id`
  - reflections by `kind:date` for daily reflections, otherwise `id`
  - moods by `date`
  - inspirations by `id`
  - app config as `app`
  - enabled modules as `app`
- Local `AppState` to normalized entity collections.
- Normalized entity collections back to `AppState`.
- Three-way merge from `base + local + remote`.
- Field-level merge for reflection `answers`.
- Conflict detection only when local and remote changed the same field differently.
- Minimal status/debug info in `syncStatus` and Sync Panel.
- Keep current v1 snapshot object for recovery/fallback, but v2 must run first.

Explicitly defer:

- Delete tombstones.
- Conflict inbox UI.
- Audit log.
- Full per-field metadata.
- Full v1 migration wizard.
- Broad refactors of existing stores and UI.

## Why This Is Necessary

The current v1 sync treats the whole persisted state as one document. If browser and mobile both changed different parts, the later upload can overwrite the earlier one. A timestamp-only rule cannot know that "mobile added a task" and "browser edited a reflection answer" are independent changes.

The MVP adds the smallest missing concept: entity-level merge with a remembered base version. That is what allows data to flow automatically when changes are independent.

## Tasks

### 1. Snapshot Shape

Files:

- Create `src/sync/entitySyncTypes.ts`
- Create `src/sync/entitySyncKeys.ts`
- Create `src/sync/entitySyncSnapshot.ts`
- Modify `src/sync/cosObjectKeys.ts`
- Modify `src/types/sync.ts`
- Add `tests/entitySyncSnapshot.test.ts`

Work:

- Add v2 envelope and collection types.
- Add stable key helpers.
- Convert current `AppState` into normalized collections.
- Restore merged collections back into `AppState`.
- Add minimal v2 sync status fields:
  - `entitySyncRevision`
  - `entitySyncBase`
  - `entitySyncAutoMerged`
  - `entitySyncConflicts`

Verify:

- `node --test tests\entitySyncSnapshot.test.ts`

### 2. Three-Way Merge

Files:

- Create `src/sync/entitySyncMerge.ts`
- Add `tests/entitySyncMerge.test.ts`

Work:

- Compare each entity against base/local/remote.
- Auto-merge independent changes.
- For reflections, merge independent `answers` keys field-by-field.
- Return conflicts only for same-field divergent edits.
- Do not implement delete handling in MVP.

Verify:

- `node --test tests\entitySyncMerge.test.ts`

### 3. COS V2 Sync Runner

Files:

- Create `src/sync/entitySyncClient.ts`
- Create `src/sync/entitySync.ts`
- Add `tests/entitySync.test.ts`

Work:

- Download `forge-data.entities.v2.json`.
- If missing, bootstrap v2 from current local state.
- Use local `entitySyncBase` as the merge base.
- Apply merged state locally.
- Upload merged v2 envelope.
- Store merged envelope as the new local base.
- Keep existing v1 object untouched.

Verify:

- Incident regression: browser reflection edit plus mobile tomorrow task both remain after sync.
- `node --test tests\entitySync.test.ts`

### 4. Hook And Panel Wiring

Files:

- Modify `src/hooks/useStartupCosSync.ts`
- Modify `src/hooks/useAutoCosSync.ts`
- Modify `src/features/system/SyncPanel.tsx`
- Add/adjust structure tests if needed

Work:

- Run v2 sync before existing v1 snapshot sync.
- If v2 succeeds, do not run v1 snapshot upload afterward.
- If v2 fails, keep current v1 fallback so rollout is reversible.
- Show minimal v2 revision, auto-merge count, and conflict count in Sync Panel.

Verify:

- Existing hook/panel structure tests still pass.
- Manual sync UI does not label unsynced local changes as "already latest".

### 5. Final Verification

Run:

- `node --test tests\entitySyncSnapshot.test.ts tests\entitySyncMerge.test.ts tests\entitySync.test.ts`
- `node --test tests\manualSync.test.ts tests\syncEnvelope.test.ts tests\storageRecord.test.ts tests\startupSync.test.ts`
- `node --test tests\autoSyncHookStructure.test.ts tests\startupSyncHookStructure.test.ts tests\syncPanelStructure.test.ts`
- `npm run build`

Success means:

- Independent browser/mobile changes merge automatically.
- Same-field divergent edits are surfaced as conflicts.
- Existing v1 snapshot data is not deleted.
- The implementation does not touch unrelated mobile UI/CSS changes.
