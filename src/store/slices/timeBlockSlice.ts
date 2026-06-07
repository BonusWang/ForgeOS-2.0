import type { StateCreator } from 'zustand';
import type { TimeBlock } from '../../types';

export interface TimeBlockSlice {
  timeBlocks: TimeBlock[];
  addTimeBlock: (block: Omit<TimeBlock, 'id'>) => void;
  updateTimeBlock: (id: string, updates: Partial<Omit<TimeBlock, 'id'>>) => void;
  deleteTimeBlock: (id: string) => void;
  toggleTimeBlockCompleted: (id: string) => void;
  getTimeBlocksForDate: (date: string) => TimeBlock[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createTimeBlockSlice: StateCreator<TimeBlockSlice> = (set, get) => ({
  timeBlocks: [],

  addTimeBlock: (block) =>
    set((state) => ({
      timeBlocks: [...state.timeBlocks, { ...block, id: generateId() }],
    })),

  updateTimeBlock: (id, updates) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      ),
    })),

  deleteTimeBlock: (id) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.filter((b) => b.id !== id),
    })),

  toggleTimeBlockCompleted: (id) =>
    set((state) => ({
      timeBlocks: state.timeBlocks.map((b) =>
        b.id === id ? { ...b, completed: !b.completed } : b
      ),
    })),

  getTimeBlocksForDate: (date: string) => {
    return get().timeBlocks
      .filter((b) => b.date === date)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  },
});
