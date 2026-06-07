import type { StateCreator } from 'zustand';
import type { Objective, KeyResult, InboxItem } from '../../types';

export interface OKRSlice {
  objectives: Objective[];
  inboxItems: InboxItem[];
  addObjective: (title: string, period: string) => void;
  deleteObjective: (id: string) => void;
  updateObjectiveTitle: (id: string, title: string) => void;
  addKeyResult: (objectiveId: string, content: string) => void;
  deleteKeyResult: (objectiveId: string, krId: string) => void;
  toggleKeyResult: (objectiveId: string, krId: string) => void;
  updateKeyResult: (objectiveId: string, krId: string, content: string) => void;
  addInboxItem: (content: string) => string;
  collectToInbox: (objectiveId: string, krId: string) => void;
  removeFromInbox: (id: string) => void;
  toggleInboxItem: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createOKRSlice: StateCreator<OKRSlice> = (set, get) => ({
  objectives: [],
  inboxItems: [],

  addObjective: (title, period) => {
    const obj: Objective = {
      id: generateId(),
      title,
      period,
      keyResults: [],
    };
    set({ objectives: [...get().objectives, obj] });
  },

  deleteObjective: (id) => {
    set({
      objectives: get().objectives.filter((o) => o.id !== id),
      inboxItems: get().inboxItems.filter((item) => item.objectiveId !== id),
    });
  },

  updateObjectiveTitle: (id, title) => {
    set({
      objectives: get().objectives.map((o) =>
        o.id === id ? { ...o, title } : o
      ),
    });
  },

  addKeyResult: (objectiveId, content) => {
    const kr: KeyResult = {
      id: generateId(),
      content,
      completed: false,
    };
    set({
      objectives: get().objectives.map((o) =>
        o.id === objectiveId
          ? { ...o, keyResults: [...o.keyResults, kr] }
          : o
      ),
    });
  },

  deleteKeyResult: (objectiveId, krId) => {
    set({
      objectives: get().objectives.map((o) =>
        o.id === objectiveId
          ? { ...o, keyResults: o.keyResults.filter((kr) => kr.id !== krId) }
          : o
      ),
      inboxItems: get().inboxItems.filter((item) => item.id !== krId),
    });
  },

  toggleKeyResult: (objectiveId, krId) => {
    set({
      objectives: get().objectives.map((o) =>
        o.id === objectiveId
          ? {
              ...o,
              keyResults: o.keyResults.map((kr) =>
                kr.id === krId ? { ...kr, completed: !kr.completed } : kr
              ),
            }
          : o
      ),
    });
  },

  updateKeyResult: (objectiveId, krId, content) => {
    set({
      objectives: get().objectives.map((o) =>
        o.id === objectiveId
          ? {
              ...o,
              keyResults: o.keyResults.map((kr) =>
                kr.id === krId ? { ...kr, content } : kr
              ),
            }
          : o
      ),
    });
  },

  addInboxItem: (content) => {
    const trimmed = content.trim();
    if (!trimmed) return '';

    const inboxItem: InboxItem = {
      id: generateId(),
      content: trimmed,
      completed: false,
      collectedAt: new Date().toISOString(),
    };
    set({ inboxItems: [...get().inboxItems, inboxItem] });
    return inboxItem.id;
  },

  collectToInbox: (objectiveId, krId) => {
    const state = get();
    const alreadyInInbox = state.inboxItems.some((item) => item.id === krId);
    if (alreadyInInbox) return;

    const objective = state.objectives.find((o) => o.id === objectiveId);
    const kr = objective?.keyResults.find((k) => k.id === krId);
    if (!objective || !kr) return;

    const inboxItem: InboxItem = {
      id: kr.id,
      objectiveId: objective.id,
      objectiveTitle: objective.title,
      content: kr.content,
      completed: kr.completed,
      collectedAt: new Date().toISOString(),
    };
    set({ inboxItems: [...state.inboxItems, inboxItem] });
  },

  removeFromInbox: (id) => {
    set({ inboxItems: get().inboxItems.filter((item) => item.id !== id) });
  },

  toggleInboxItem: (id) => {
    set({
      inboxItems: get().inboxItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    });
  },
});
