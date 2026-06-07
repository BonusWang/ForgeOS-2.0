import type { StateCreator } from 'zustand';
import type { Principle } from '../../types';

export interface PrincipleSlice {
  principles: Principle[];
  updatePrinciples: (principles: Principle[]) => void;
  reorderPrinciples: (ids: string[]) => void;
}

export const createPrincipleSlice: StateCreator<PrincipleSlice> = (set, get) => ({
  principles: [
    { id: '1', content: '先完成再完美', order: 0 },
    { id: '2', content: '保持专注', order: 1 },
    { id: '3', content: '深度优于广度', order: 2 },
  ],

  updatePrinciples: (principles) => set({ principles }),

  reorderPrinciples: (ids) => {
    const principles = get().principles;
    const reordered = ids
      .map((id) => principles.find((p) => p.id === id))
      .filter(Boolean) as Principle[];
    set({
      principles: reordered.map((p, idx) => ({ ...p, order: idx })),
    });
  },
});
