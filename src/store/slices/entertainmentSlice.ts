import type { StateCreator } from 'zustand';
import type { Entertainment } from '../../types';

export interface EntertainmentSlice {
  entertainments: Entertainment[];
  addEntertainment: (content: string, date: string) => void;
  deleteEntertainment: (id: string) => void;
  getEntertainmentsByDate: (date: string) => Entertainment[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createEntertainmentSlice: StateCreator<EntertainmentSlice> = (set, get) => ({
  entertainments: [],

  addEntertainment: (content, date) => {
    const newEnt: Entertainment = {
      id: generateId(),
      content,
      date,
    };
    set({ entertainments: [...get().entertainments, newEnt] });
  },

  deleteEntertainment: (id) => {
    set({ entertainments: get().entertainments.filter((e) => e.id !== id) });
  },

  getEntertainmentsByDate: (date) => {
    return get().entertainments.filter((e) => e.date === date);
  },
});
