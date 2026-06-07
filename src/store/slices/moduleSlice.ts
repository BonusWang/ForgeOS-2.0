import type { StateCreator } from 'zustand';
import type { ModuleId } from '../../types';
import { DEFAULT_ENABLED_MODULES } from '../../features/modules/moduleRegistry';

export interface ModuleSlice {
  enabledModules: ModuleId[];
  toggleModule: (moduleId: ModuleId) => void;
  setEnabledModules: (modules: ModuleId[]) => void;
  isModuleEnabled: (moduleId: ModuleId) => boolean;
}

export const createModuleSlice: StateCreator<ModuleSlice> = (set, get) => ({
  enabledModules: DEFAULT_ENABLED_MODULES,

  toggleModule: (moduleId: ModuleId) =>
    set((state) => {
      const isEnabled = state.enabledModules.includes(moduleId);
      const next = isEnabled
        ? state.enabledModules.filter((id) => id !== moduleId)
        : [...state.enabledModules, moduleId];
      return { enabledModules: next };
    }),

  setEnabledModules: (modules: ModuleId[]) => set({ enabledModules: modules }),

  isModuleEnabled: (moduleId: ModuleId) => get().enabledModules.includes(moduleId),
});
