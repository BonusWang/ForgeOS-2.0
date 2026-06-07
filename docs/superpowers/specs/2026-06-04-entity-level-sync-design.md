# Forge-OS Entity-Level Sync Design

## Context

Forge-OS currently syncs a complete Zustand storage snapshot through Tencent COS. That made the first Android/browser sync path simple, but it also created a high-risk behavior: when browser and mobile both changed data, whichever whole snapshot won could silently overwrite unrelated changes from the other side.

The immediate guardrail is to stop automatic whole-snapshot overwrites when both sides changed. This design replaces that guardrail with a full entity-level sync model so data can flow automatically across browser and mobile while preserving recoverability.

## Goals

- Automatically merge independent changes from browser and mobile.
- Prevent unrelated data from being lost because another device has a newer whole snapshot.
- Keep manual conflict resolution rare and focused on the smallest meaningful conflict.
- Preserve local-first behavior: the app remains usable offline and sync failures do not block local saves.
- Keep COS as the existing cloud transport and retain historical snapshots for recovery.
- Support migration from the current schema version 1 whole-snapshot object.

## Non-Goals

- No real-time collaborative editing.
- No multi-user account or permission system.
- No full CRDT rewrite.
- No server-side database. COS remains the backing cloud store.
- No automatic semantic merge of free-form text written into the same reflection answer field.

## Recommended Approach

Use entity-level merge as the primary sync strategy, with field-level merge for daily reflections.

Most collections merge by stable entity key. For example, tasks merge by `task.id`, inspirations by `id`, moods by `date`, and daily reflections by `(kind, date)` normalized to a stable sync key. Reflections receive a stronger merge rule because the `answers` object often contains multiple independently editable fields.

Whole snapshots remain useful as bootstrap and disaster recovery artifacts, but they no longer decide day-to-day sync winners.

## Data Model

### Sync Envelope v2

The main COS object becomes a normalized sync document:

```ts
interface EntitySyncEnvelopeV2 {
  schemaVersion: 2;
  appVersion: string;
  profileId: string;
  updatedAt: string;
  updatedBy: string;
  baseRevision?: string;
  collections: SyncedCollections;
  conflicts: SyncConflict[];
  compactedAt?: string;
}
```

### Collections

```ts
interface SyncedCollections {
  tasks: Record<string, SyncedEntity<Task>>;
  reflections: Record<string, SyncedEntity<Reflection>>;
  moods: Record<string, SyncedEntity<MoodEntry>>;
  inspirations: Record<string, SyncedEntity<Inspiration>>;
  objectives: Record<string, SyncedEntity<Objective>>;
  inboxItems: Record<string, SyncedEntity<InboxItem>>;
  habits: Record<string, SyncedEntity<Habit>>;
  timeBlocks: Record<string, SyncedEntity<TimeBlock>>;
  entertainments: Record<string, SyncedEntity<Entertainment>>;
  principles: Record<string, SyncedEntity<Principle>>;
  abilities: Record<string, SyncedEntity<Ability>>;
  reflectionTemplates: Record<string, SyncedEntity<ReflectionTemplate>>;
  config: Record<'app', SyncedEntity<AppConfig>>;
  enabledModules: Record<'app', SyncedEntity<ModuleConfig>>;
}
```

### Entity Metadata

```ts
interface SyncedEntity<T> {
  value: T;
  syncMeta: {
    entityKey: string;
    updatedAt: string;
    updatedBy: string;
    revision: string;
    deletedAt?: string;
    deletedBy?: string;
  };
}
```

`updatedAt` records local entity edits, not whole-app sync time. `revision` is generated per entity update, for example `${deviceId}:${updatedAt}:${entityKey}`.

### Reflection Field Metadata

Reflections add optional field metadata:

```ts
interface ReflectionSyncMeta {
  answers: Record<string, {
    updatedAt: string;
    updatedBy: string;
    revision: string;
  }>;
}
```

This lets browser and mobile automatically merge different answer fields inside the same daily reflection.

## Entity Keys

- `tasks`: `task.id`
- `reflections`: `weekly:${periodStart}` for weekly reviews, `daily:${date}` for daily reflections
- `moods`: `mood:${date}`
- `timeBlocks`: `timeBlock.id`
- `habits`, `inspirations`, `objectives`, `inboxItems`, `principles`, `abilities`, `reflectionTemplates`, `entertainments`: existing `id`
- `config`: `app`
- `enabledModules`: `app`

Daily reflection keys intentionally normalize by date so old duplicate daily entries do not split across devices.

## Sync Algorithm

Each device stores the last synced v2 envelope as its local base revision. A sync run performs a three-way merge:

1. Load local app state.
2. Convert local state to normalized collections.
3. Download remote v2 envelope from COS.
4. Load local base envelope from persisted sync status or local sync cache.
5. For each collection and entity key, compare base, local, and remote.
6. Auto-merge non-conflicting changes.
7. Produce conflict records for unresolved same-entity same-field conflicts.
8. Apply merged collections back to local app state.
9. Upload merged v2 envelope to COS.
10. Update local sync status with the new base revision.

## Merge Rules

### Additions

- Entity exists only locally: add to merged result.
- Entity exists only remotely: add to merged result.

### Single-Side Updates

- Local changed and remote equals base: use local.
- Remote changed and local equals base: use remote.

### Different Entity Updates

- Local changes entity A and remote changes entity B: keep both.

### Same Entity Updates

Default rule:

- If only one side changed since base, use the changed side.
- If both sides changed the same entity, use type-specific merge logic.

Task rule:

- If both sides changed the same task, prefer the entity with the latest `syncMeta.updatedAt`.
- Preserve the losing version in a non-blocking conflict/audit record.

Reflection rule:

- Merge `answers` by answer key.
- If local changed `q-obstacle` and remote changed `q-solution`, keep both.
- If both changed the same answer key, create a conflict for that answer only.
- Non-answer fields such as `tags`, `templateId`, and date metadata use type-specific merge:
  - `tags` merge as a unique set.
  - `templateId` uses latest update unless both changed from base, then create an entity-level conflict.
  - `date`, `kind`, `periodStart`, and `periodEnd` are identity fields and should not change after creation.

Delete rule:

- Deletion is represented by `deletedAt`, not immediate removal.
- If one side deletes and the other side is unchanged from base, delete wins.
- If one side deletes and the other side edits after base, create a conflict.
- Deleted entities can be compacted after a retention window.

## Conflict Model

Conflicts do not block safe data flow. The merged document still uploads all non-conflicting changes.

```ts
interface SyncConflict {
  id: string;
  collection: keyof SyncedCollections;
  entityKey: string;
  fieldPath?: string;
  localValue: unknown;
  remoteValue: unknown;
  baseValue?: unknown;
  localUpdatedAt?: string;
  remoteUpdatedAt?: string;
  detectedAt: string;
  status: 'open' | 'resolved';
  recommendedChoice: 'local' | 'remote' | 'manual';
}
```

The UI should show a small conflict inbox:

- `已自动合并 X 项`
- `有 Y 个冲突待处理`
- For each conflict: show local value, remote value, timestamps, and recommended choice.

Resolving a conflict writes a normal entity update and marks the conflict resolved.

## COS Object Strategy

Use a new main object name:

- `Forge-OS_Base/v2.0/Domain1127/forge-data.entities.v2.json`

Keep the v1 object for compatibility:

- `Forge-OS_Base/v2.0/Domain1127/forge-data.sync.json`

Keep history snapshots:

- `Forge-OS_Base/v2.0/Domain1127/snapshots/{safeUpdatedAt}-{deviceId}.json`

During migration, v2 sync reads v1 if v2 does not exist, converts the v1 snapshot into v2 collections, uploads v2, and then continues using v2.

## Local Storage Changes

Add local sync cache fields to `syncStatus` or a dedicated persisted sync state:

```ts
interface EntitySyncStatus {
  lastEntitySyncAt?: string;
  lastEntityEnvelopeRevision?: string;
  lastEntityBase?: EntitySyncEnvelopeV2;
  pendingConflictCount?: number;
}
```

The base envelope allows true three-way merge without guessing from timestamps alone.

## Migration Plan

1. Keep the current v1 whole-snapshot sync code available as a fallback during rollout.
2. Add v2 conversion from current `AppState` to normalized collections.
3. Add conversion from normalized collections back to `AppState`.
4. On first v2 sync, download v2. If missing, download v1 and convert it.
5. After a successful v2 upload, use v2 for daily sync.
6. Keep v1 restore/history tools for manual disaster recovery.
7. Once stable, hide v1 daily sync controls and label old snapshots as recovery-only.

## Error Handling

- COS unavailable: keep local writes and show sync error.
- Invalid v2 envelope: do not overwrite local; keep using local state and surface error.
- Newer remote app version: do not import incompatible entity payloads.
- Partial merge error in one collection: fail the sync before upload to avoid writing a corrupt merged envelope.
- Conflict detected: upload non-conflicting merged state and expose conflict records.

## Testing

Unit tests:

- Entity key normalization.
- AppState to v2 envelope conversion.
- v2 envelope to AppState conversion.
- Three-way merge additions.
- Three-way merge single-side updates.
- Different entity updates auto-merge.
- Same task update latest-wins with audit conflict.
- Reflection different answer fields auto-merge.
- Reflection same answer field creates conflict.
- Delete versus unchanged.
- Delete versus edit creates conflict.
- v1 to v2 migration.

Integration tests:

- Browser adds tomorrow task while mobile edits today's reflection.
- Mobile adds mood while browser edits task status.
- Two devices edit different reflection fields.
- Two devices edit the same reflection field and UI reports one conflict.
- Offline local writes later sync into existing remote changes.

Regression tests:

- No whole-snapshot automatic overwrite when both devices changed.
- `lastLocalUpdatedAt` alone cannot mark cloud state as fully current.
- Historical snapshots remain restorable.

## Rollout

1. Implement v2 merge engine behind existing sync UI.
2. Add diagnostics showing active sync object, schema version, device ID, and conflict count.
3. Run local simulated two-device tests using separate base envelopes.
4. Enable v2 sync by default after migration succeeds.
5. Keep v1 recovery path visible until several successful v2 sync cycles complete.

## Initial Decisions

- Conflict UI can initially live inside the existing System sync panel.
- Task same-entity latest-wins is acceptable for the first v2 implementation because tasks are small and easily auditable.
- Reflection field-level merge is required for the first v2 implementation because reflection loss was the incident that triggered this design.
