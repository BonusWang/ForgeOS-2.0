export type ConflictChoice = 'keep-local' | 'use-remote' | 'later';

export const recommendConflictChoice = (
  localUpdatedAt?: string,
  remoteUpdatedAt?: string
): ConflictChoice | null => {
  if (!localUpdatedAt || !remoteUpdatedAt) return null;
  return Date.parse(localUpdatedAt) >= Date.parse(remoteUpdatedAt) ? 'keep-local' : 'use-remote';
};
