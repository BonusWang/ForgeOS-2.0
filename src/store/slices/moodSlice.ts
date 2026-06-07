import type { StateCreator } from 'zustand';
import type { MoodEntry } from '../../types';

export interface MoodSlice {
  moods: MoodEntry[];
  saveMood: (entry: Omit<MoodEntry, 'id' | 'createdAt'>) => void;
  deleteMood: (id: string) => void;
  getMoodByDate: (date: string) => MoodEntry | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createMoodSlice: StateCreator<MoodSlice> = (set, get) => ({
  moods: [],

  saveMood: (entry) =>
    set((state) => {
      const existingIndex = state.moods.findIndex((m) => m.date === entry.date);
      if (existingIndex >= 0) {
        const next = [...state.moods];
        next[existingIndex] = {
          ...next[existingIndex],
          ...entry,
        };
        return { moods: next };
      }
      return {
        moods: [
          ...state.moods,
          { ...entry, id: generateId(), createdAt: new Date().toISOString() },
        ],
      };
    }),

  deleteMood: (id) =>
    set((state) => ({
      moods: state.moods.filter((m) => m.id !== id),
    })),

  getMoodByDate: (date: string) => {
    return get().moods.find((m) => m.date === date);
  },
});
