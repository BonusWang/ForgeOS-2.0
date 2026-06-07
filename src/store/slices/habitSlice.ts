import type { StateCreator } from 'zustand';
import type { Habit } from '../../types';

export interface HabitSlice {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (habitId: string, date: string) => void;
  getHabitCompletionsForDate: (date: string) => { habit: Habit; completed: boolean }[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createHabitSlice: StateCreator<HabitSlice> = (set, get) => ({
  habits: [],

  addHabit: (habit) =>
    set((state) => ({
      habits: [
        ...state.habits,
        {
          ...habit,
          id: generateId(),
          createdAt: new Date().toISOString(),
          completions: {},
        },
      ],
    })),

  updateHabit: (id, updates) =>
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      ),
    })),

  deleteHabit: (id) =>
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
    })),

  toggleHabitCompletion: (habitId, date) =>
    set((state) => ({
      habits: state.habits.map((h) => {
        if (h.id !== habitId) return h;
        const current = h.completions[date] ?? false;
        return {
          ...h,
          completions: {
            ...h.completions,
            [date]: !current,
          },
        };
      }),
    })),

  getHabitCompletionsForDate: (date: string) => {
    const { habits } = get();
    return habits.map((h) => ({ habit: h, completed: h.completions[date] ?? false }));
  },
});
