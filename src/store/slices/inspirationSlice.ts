import type { StateCreator } from 'zustand';
import type { Inspiration } from '../../types';

export interface InspirationSlice {
  inspirations: Inspiration[];
  addInspiration: (inspiration: Omit<Inspiration, 'id' | 'createdAt'>) => string;
  deleteInspiration: (id: string) => void;
  convertToTask: (inspirationId: string, taskId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createInspirationSlice: StateCreator<InspirationSlice> = (set) => ({
  inspirations: [],

  addInspiration: (inspiration) => {
    const id = generateId();
    set((state) => ({
      inspirations: [
        ...state.inspirations,
        { ...inspiration, id, createdAt: new Date().toISOString() },
      ],
    }));
    return id;
  },

  deleteInspiration: (id) =>
    set((state) => ({
      inspirations: state.inspirations.filter((i) => i.id !== id),
    })),

  convertToTask: (inspirationId, taskId) =>
    set((state) => ({
      inspirations: state.inspirations.map((i) =>
        i.id === inspirationId ? { ...i, convertedToTaskId: taskId } : i
      ),
    })),
});
