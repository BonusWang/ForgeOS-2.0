import type { StateCreator } from 'zustand';
import type { AppConfig } from '../../types';

export interface ConfigSlice {
  config: AppConfig;
  updateConfig: (config: Partial<AppConfig>) => void;
  toggleTheme: () => void;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

export const createConfigSlice: StateCreator<ConfigSlice> = (set) => ({
  config: {
    currentWeekStart: getWeekStart(),
    lastVisitDate: getTodayString(),
    theme: 'dark',
  },

  updateConfig: (config) =>
    set((state) => ({ config: { ...state.config, ...config } })),

  toggleTheme: () =>
    set((state) => ({
      config: {
        ...state.config,
        theme: state.config.theme === 'dark' ? 'light' : 'dark',
      },
    })),
});
