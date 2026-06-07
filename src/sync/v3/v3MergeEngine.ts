import type { Reflection } from '../../types';
import { createV3SyncedEntity } from './v3EntityAdapter.ts';
import { cloneV3SyncValue, v3SyncValuesEqual } from './v3SyncEnvelope.ts';
import {
  createEmptyV3SyncEntities,
  V3_SYNC_COLLECTIONS,
  type V3SyncCollectionName,
  type V3SyncConflict,
  type V3SyncEntities,
  type V3SyncEnvelope,
  type V3SyncTombstone,
  type V3SyncedEntity,
} from './v3SyncTypes.ts';

export interface MergeV3SyncDocumentsInput {
  base?: V3SyncEnvelope;
  local: V3SyncEnvelope;
  remote: V3SyncEnvelope;
  deviceId: string;
  now: string;
}

export interface MergeV3SyncDocumentsResult {
  entities: V3SyncEntities;
  tombstones: V3SyncTombstone[];
  conflicts: V3SyncConflict[];
  autoMerged: number;
}

interface MergeContext {
  collection: V3SyncCollectionName;
  entityKey: string;
}

interface MergeValueResult<T> {
  value: T;
  conflicts: V3SyncConflict[];
}

interface MergeEntityResult<T> {
  entity?: V3SyncedEntity<T>;
  tombstone?: V3SyncTombstone;
  conflicts: V3SyncConflict[];
  autoMerged: boolean;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const hasChanged = (baseValue: unknown, value: unknown): boolean =>
  !v3SyncValuesEqual(baseValue, value);

const conflictId = (
  kind: V3SyncConflict['kind'],
  collection: V3SyncCollectionName,
  entityKey: string,
  field: string
): string => `${kind}:${collection}:${entityKey}:${field}`;

const fieldPath = (field: string, child?: string): string => (child ? `${field}.${child}` : field);

const createFieldConflict = (
  context: MergeContext,
  field: string,
  localEntity: V3SyncedEntity<unknown>,
  remoteEntity: V3SyncedEntity<unknown>,
  localValue: unknown,
  remoteValue: unknown,
  baseRevision?: string
): V3SyncConflict => ({
  id: conflictId('field', context.collection, context.entityKey, field),
  kind: 'field',
  collection: context.collection,
  entityKey: context.entityKey,
  field,
  localValue: cloneV3SyncValue(localValue),
  remoteValue: cloneV3SyncValue(remoteValue),
  baseRevision,
  localUpdatedAt: localEntity.updatedAt,
  remoteUpdatedAt: remoteEntity.updatedAt,
});

const createDeleteEditConflict = <T,>(
  context: MergeContext,
  localEntity: V3SyncedEntity<T> | undefined,
  remoteEntity: V3SyncedEntity<T> | undefined,
  baseRevision?: string
): V3SyncConflict => ({
  id: conflictId('delete-edit', context.collection, context.entityKey, 'value'),
  kind: 'delete-edit',
  collection: context.collection,
  entityKey: context.entityKey,
  field: 'value',
  localDeleted: !localEntity,
  remoteDeleted: !remoteEntity,
  localValue: localEntity ? cloneV3SyncValue(localEntity.value) : undefined,
  remoteValue: remoteEntity ? cloneV3SyncValue(remoteEntity.value) : undefined,
  baseRevision,
  localUpdatedAt: localEntity?.updatedAt,
  remoteUpdatedAt: remoteEntity?.updatedAt,
});

const mergeFieldValue = (
  baseValue: unknown,
  localValue: unknown,
  remoteValue: unknown,
  localEntity: V3SyncedEntity<unknown>,
  remoteEntity: V3SyncedEntity<unknown>,
  context: MergeContext,
  field: string,
  baseRevision?: string
): { value: unknown; conflicts: V3SyncConflict[] } => {
  const localChanged = hasChanged(baseValue, localValue);
  const remoteChanged = hasChanged(baseValue, remoteValue);

  if (!localChanged && !remoteChanged) {
    return { value: cloneV3SyncValue(baseValue), conflicts: [] };
  }

  if (localChanged && !remoteChanged) {
    return { value: cloneV3SyncValue(localValue), conflicts: [] };
  }

  if (!localChanged && remoteChanged) {
    return { value: cloneV3SyncValue(remoteValue), conflicts: [] };
  }

  if (v3SyncValuesEqual(localValue, remoteValue)) {
    return { value: cloneV3SyncValue(localValue), conflicts: [] };
  }

  return {
    value: cloneV3SyncValue(localValue),
    conflicts: [
      createFieldConflict(
        context,
        field,
        localEntity,
        remoteEntity,
        localValue,
        remoteValue,
        baseRevision
      ),
    ],
  };
};

const mergeObjectFields = <T,>(
  baseValue: T | undefined,
  localEntity: V3SyncedEntity<T>,
  remoteEntity: V3SyncedEntity<T>,
  context: MergeContext,
  ignoredFields: string[] = [],
  baseRevision?: string
): MergeValueResult<T> => {
  const localValue = localEntity.value;
  const remoteValue = remoteEntity.value;
  if (!isPlainObject(localValue) || !isPlainObject(remoteValue)) {
    return mergeFieldValue(
      baseValue,
      localValue,
      remoteValue,
      localEntity as V3SyncedEntity<unknown>,
      remoteEntity as V3SyncedEntity<unknown>,
      context,
      'value',
      baseRevision
    ) as MergeValueResult<T>;
  }

  const baseRecord: Record<string, unknown> = isPlainObject(baseValue) ? baseValue : {};
  const localRecord = localValue as Record<string, unknown>;
  const remoteRecord = remoteValue as Record<string, unknown>;
  const merged: Record<string, unknown> = {};
  const conflicts: V3SyncConflict[] = [];
  const keys = new Set([
    ...Object.keys(baseRecord),
    ...Object.keys(localRecord),
    ...Object.keys(remoteRecord),
  ]);

  keys.forEach((key) => {
    if (ignoredFields.includes(key)) return;
    const result = mergeFieldValue(
      baseRecord[key],
      localRecord[key],
      remoteRecord[key],
      localEntity as V3SyncedEntity<unknown>,
      remoteEntity as V3SyncedEntity<unknown>,
      context,
      key,
      baseRevision
    );
    if (result.value !== undefined) {
      merged[key] = result.value;
    }
    conflicts.push(...result.conflicts);
  });

  return { value: merged as T, conflicts };
};

const mergeAnswerFields = (
  baseAnswers: Reflection['answers'] | undefined,
  localEntity: V3SyncedEntity<Reflection>,
  remoteEntity: V3SyncedEntity<Reflection>,
  context: MergeContext,
  baseRevision?: string
): MergeValueResult<Reflection['answers']> => {
  const localAnswers = localEntity.value.answers;
  const remoteAnswers = remoteEntity.value.answers;
  const merged: Reflection['answers'] = {};
  const conflicts: V3SyncConflict[] = [];
  const keys = new Set([
    ...Object.keys(baseAnswers ?? {}),
    ...Object.keys(localAnswers),
    ...Object.keys(remoteAnswers),
  ]);

  keys.forEach((key) => {
    const result = mergeFieldValue(
      baseAnswers?.[key],
      localAnswers[key],
      remoteAnswers[key],
      localEntity as V3SyncedEntity<unknown>,
      remoteEntity as V3SyncedEntity<unknown>,
      context,
      fieldPath('answers', key),
      baseRevision
    );
    if (result.value !== undefined) {
      merged[key] = result.value as string | number;
    }
    conflicts.push(...result.conflicts);
  });

  return { value: merged, conflicts };
};

const mergeTags = (
  baseTags: string[] | undefined,
  localEntity: V3SyncedEntity<Reflection>,
  remoteEntity: V3SyncedEntity<Reflection>,
  context: MergeContext,
  baseRevision?: string
): MergeValueResult<string[]> => {
  const localTags = localEntity.value.tags;
  const remoteTags = remoteEntity.value.tags;
  const localChanged = hasChanged(baseTags, localTags);
  const remoteChanged = hasChanged(baseTags, remoteTags);

  if (localChanged && remoteChanged) {
    return {
      value: Array.from(new Set([...localTags, ...remoteTags])).sort(),
      conflicts: [],
    };
  }

  return mergeFieldValue(
    baseTags,
    localTags,
    remoteTags,
    localEntity as V3SyncedEntity<unknown>,
    remoteEntity as V3SyncedEntity<unknown>,
    context,
    'tags',
    baseRevision
  ) as MergeValueResult<string[]>;
};

const mergeReflectionValue = (
  baseValue: Reflection | undefined,
  localEntity: V3SyncedEntity<Reflection>,
  remoteEntity: V3SyncedEntity<Reflection>,
  context: MergeContext,
  baseRevision?: string
): MergeValueResult<Reflection> => {
  const objectMerge = mergeObjectFields(baseValue, localEntity, remoteEntity, context, [
    'answers',
    'tags',
  ], baseRevision);
  const answerMerge = mergeAnswerFields(
    baseValue?.answers,
    localEntity,
    remoteEntity,
    context,
    baseRevision
  );
  const tagMerge = mergeTags(baseValue?.tags, localEntity, remoteEntity, context, baseRevision);

  return {
    value: {
      ...objectMerge.value,
      answers: answerMerge.value,
      tags: tagMerge.value,
    },
    conflicts: [...objectMerge.conflicts, ...answerMerge.conflicts, ...tagMerge.conflicts],
  };
};

const chooseUpdatedBy = <T,>(
  localEntity: V3SyncedEntity<T>,
  remoteEntity: V3SyncedEntity<T>
): string => (localEntity.updatedAt >= remoteEntity.updatedAt ? localEntity.updatedBy : remoteEntity.updatedBy);

const keepEntity = <T,>(entity: V3SyncedEntity<T>): MergeEntityResult<T> => ({
  entity: cloneV3SyncValue(entity),
  conflicts: [],
  autoMerged: false,
});

const createTombstone = (
  context: MergeContext,
  deletedAt: string,
  deletedBy: string,
  baseRevision?: string
): V3SyncTombstone => ({
  collection: context.collection,
  entityKey: context.entityKey,
  deletedAt,
  deletedBy,
  baseRevision,
});

const mergeEntity = <T,>(
  collection: V3SyncCollectionName,
  entityKey: string,
  baseEntity: V3SyncedEntity<T> | undefined,
  localEntity: V3SyncedEntity<T> | undefined,
  remoteEntity: V3SyncedEntity<T> | undefined,
  hasTombstone: boolean,
  deviceId: string,
  now: string,
  baseRevision?: string
): MergeEntityResult<T> => {
  const context = { collection, entityKey };

  if (!baseEntity && hasTombstone) {
    return {
      conflicts: [],
      autoMerged: false,
    };
  }

  if (!baseEntity) {
    if (!localEntity && !remoteEntity) return { conflicts: [], autoMerged: false };
    if (localEntity && !remoteEntity) return { ...keepEntity(localEntity), autoMerged: true };
    if (!localEntity && remoteEntity) return { ...keepEntity(remoteEntity), autoMerged: true };
  }

  if (!localEntity && !remoteEntity) {
    return {
      tombstone: baseEntity
        ? createTombstone(context, now, deviceId, baseRevision)
        : undefined,
      conflicts: [],
      autoMerged: Boolean(baseEntity),
    };
  }

  if (baseEntity && !localEntity && remoteEntity) {
    const remoteChanged = hasChanged(baseEntity.value, remoteEntity.value);
    if (!remoteChanged) {
      return {
        tombstone: createTombstone(context, now, deviceId, baseRevision),
        conflicts: [],
        autoMerged: true,
      };
    }

    return {
      entity: cloneV3SyncValue(remoteEntity),
      conflicts: [createDeleteEditConflict(context, localEntity, remoteEntity, baseRevision)],
      autoMerged: false,
    };
  }

  if (baseEntity && localEntity && !remoteEntity) {
    const localChanged = hasChanged(baseEntity.value, localEntity.value);
    if (!localChanged) {
      return {
        tombstone: createTombstone(context, now, deviceId, baseRevision),
        conflicts: [],
        autoMerged: true,
      };
    }

    return {
      entity: cloneV3SyncValue(localEntity),
      conflicts: [createDeleteEditConflict(context, localEntity, remoteEntity, baseRevision)],
      autoMerged: false,
    };
  }

  if (!localEntity || !remoteEntity) {
    return { conflicts: [], autoMerged: false };
  }

  const baseValue = baseEntity?.value;
  const localChanged = hasChanged(baseValue, localEntity.value);
  const remoteChanged = hasChanged(baseValue, remoteEntity.value);

  if (!localChanged && !remoteChanged) {
    return {
      entity: cloneV3SyncValue(baseEntity ?? localEntity),
      conflicts: [],
      autoMerged: false,
    };
  }

  if (localChanged && !remoteChanged) return { ...keepEntity(localEntity), autoMerged: true };
  if (!localChanged && remoteChanged) return { ...keepEntity(remoteEntity), autoMerged: true };

  if (v3SyncValuesEqual(localEntity.value, remoteEntity.value)) {
    return { ...keepEntity(localEntity), autoMerged: true };
  }

  const mergedValue: MergeValueResult<T> =
    collection === 'reflections'
      ? (mergeReflectionValue(
          baseValue as Reflection | undefined,
          localEntity as V3SyncedEntity<Reflection>,
          remoteEntity as V3SyncedEntity<Reflection>,
          context,
          baseRevision
        ) as unknown as MergeValueResult<T>)
      : mergeObjectFields(baseValue, localEntity, remoteEntity, context, [], baseRevision);

  return {
    entity: createV3SyncedEntity(
      mergedValue.value,
      now,
      chooseUpdatedBy(localEntity, remoteEntity)
    ),
    conflicts: mergedValue.conflicts,
    autoMerged: mergedValue.conflicts.length === 0,
  };
};

const tombstoneKey = (tombstone: Pick<V3SyncTombstone, 'collection' | 'entityKey'>): string =>
  `${tombstone.collection}:${tombstone.entityKey}`;

const mergeTombstones = (
  ...tombstoneGroups: (V3SyncTombstone[] | undefined)[]
): V3SyncTombstone[] => {
  const merged = new Map<string, V3SyncTombstone>();

  tombstoneGroups.flatMap((group) => group ?? []).forEach((tombstone) => {
    const key = tombstoneKey(tombstone);
    const existing = merged.get(key);
    if (!existing || tombstone.deletedAt >= existing.deletedAt) {
      merged.set(key, cloneV3SyncValue(tombstone));
    }
  });

  return [...merged.values()].sort((left, right) =>
    tombstoneKey(left).localeCompare(tombstoneKey(right))
  );
};

const mergeConflicts = (...conflictGroups: (V3SyncConflict[] | undefined)[]): V3SyncConflict[] => {
  const merged = new Map<string, V3SyncConflict>();

  conflictGroups.flatMap((group) => group ?? []).forEach((conflict) => {
    if (!merged.has(conflict.id)) {
      merged.set(conflict.id, cloneV3SyncValue(conflict));
    }
  });

  return [...merged.values()].sort((left, right) => left.id.localeCompare(right.id));
};

type AnyEntityRecord = Record<string, V3SyncedEntity<unknown>>;

const mergeCollection = (
  collection: V3SyncCollectionName,
  base: AnyEntityRecord,
  local: AnyEntityRecord,
  remote: AnyEntityRecord,
  existingTombstones: V3SyncTombstone[],
  deviceId: string,
  now: string,
  baseRevision?: string
) => {
  const merged: AnyEntityRecord = {};
  const tombstones: V3SyncTombstone[] = [];
  const conflicts: V3SyncConflict[] = [];
  let autoMerged = 0;
  const tombstonedKeys = new Set(
    existingTombstones
      .filter((tombstone) => tombstone.collection === collection)
      .map((tombstone) => tombstone.entityKey)
  );
  const keys = new Set([
    ...Object.keys(base),
    ...Object.keys(local),
    ...Object.keys(remote),
    ...tombstonedKeys,
  ]);

  keys.forEach((key) => {
    const result = mergeEntity(
      collection,
      key,
      base[key],
      local[key],
      remote[key],
      tombstonedKeys.has(key),
      deviceId,
      now,
      baseRevision
    );

    if (result.entity) {
      merged[key] = result.entity;
    }
    if (result.tombstone) {
      tombstones.push(result.tombstone);
    }
    conflicts.push(...result.conflicts);
    if (result.autoMerged) {
      autoMerged += 1;
    }
  });

  return { merged, tombstones, conflicts, autoMerged };
};

export const mergeV3SyncDocuments = ({
  base,
  local,
  remote,
  deviceId,
  now,
}: MergeV3SyncDocumentsInput): MergeV3SyncDocumentsResult => {
  const baseEntities = base?.entities ?? createEmptyV3SyncEntities();
  const existingTombstones = mergeTombstones(base?.tombstones, local.tombstones, remote.tombstones);
  const entities = createEmptyV3SyncEntities();
  const tombstones: V3SyncTombstone[] = [];
  const conflicts: V3SyncConflict[] = [];
  let autoMerged = 0;

  V3_SYNC_COLLECTIONS.forEach((collection) => {
    const result = mergeCollection(
      collection,
      baseEntities[collection] as AnyEntityRecord,
      local.entities[collection] as AnyEntityRecord,
      remote.entities[collection] as AnyEntityRecord,
      existingTombstones,
      deviceId,
      now,
      base?.revision
    );

    (entities[collection] as AnyEntityRecord) = result.merged;
    tombstones.push(...result.tombstones);
    conflicts.push(...result.conflicts);
    autoMerged += result.autoMerged;
  });

  return {
    entities,
    tombstones: mergeTombstones(existingTombstones, tombstones),
    conflicts: mergeConflicts(base?.conflicts, local.conflicts, remote.conflicts, conflicts),
    autoMerged,
  };
};
