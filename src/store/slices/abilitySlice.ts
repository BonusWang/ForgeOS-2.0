import type { StateCreator } from 'zustand';
import type { Ability, InboxItem } from '../../types';

export interface AbilitySlice {
  abilities: Ability[];
  addAbility: (ability: Omit<Ability, 'id'>) => void;
  deleteAbility: (id: string) => void;
  updateAbility: (id: string, updates: Partial<Omit<Ability, 'id'>>) => void;
  addAbilityTask: (abilityId: string, task: { content: string; points: number }) => void;
  removeAbilityTask: (abilityId: string, taskId: string) => void;
  incrementScore: (abilityId: string, points: number) => void;
  collectAbilityTaskToInbox: (abilityId: string, taskId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

type AbilitySliceState = AbilitySlice & {
  inboxItems: InboxItem[];
};

export const createAbilitySlice: StateCreator<AbilitySliceState, [], [], AbilitySlice> = (set, get) => ({
  abilities: [],

  addAbility: (ability) => {
    set({ abilities: [...get().abilities, { ...ability, id: generateId() }] });
  },

  deleteAbility: (id) => {
    set({ abilities: get().abilities.filter((a) => a.id !== id) });
  },

  updateAbility: (id, updates) => {
    set({
      abilities: get().abilities.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    });
  },

  addAbilityTask: (abilityId, task) => {
    set({
      abilities: get().abilities.map((a) =>
        a.id === abilityId
          ? { ...a, tasks: [...a.tasks, { ...task, id: generateId() }] }
          : a
      ),
    });
  },

  removeAbilityTask: (abilityId, taskId) => {
    set({
      abilities: get().abilities.map((a) =>
        a.id === abilityId
          ? { ...a, tasks: a.tasks.filter((t) => t.id !== taskId) }
          : a
      ),
    });
  },

  incrementScore: (abilityId, points) => {
    set({
      abilities: get().abilities.map((a) =>
        a.id === abilityId
          ? {
              ...a,
              currentScore: Math.min(a.currentScore + points, a.maxScore),
            }
          : a
      ),
    });
  },

  collectAbilityTaskToInbox: (abilityId, taskId) => {
    const state = get();
    const alreadyInInbox = state.inboxItems.some((item: InboxItem) => item.id === taskId);
    if (alreadyInInbox) return;

    const ability = get().abilities.find((a) => a.id === abilityId);
    const task = ability?.tasks.find((t) => t.id === taskId);
    if (!ability || !task) return;

    const inboxItem: InboxItem = {
      id: task.id,
      content: task.content,
      completed: false,
      collectedAt: new Date().toISOString(),
      abilityId: ability.id,
      abilityPoints: task.points,
      abilityName: ability.name,
    };
    set({ inboxItems: [...state.inboxItems, inboxItem] });
  },
});
