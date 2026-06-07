import type { StateCreator } from 'zustand';
import type { ReflectionTemplate } from '../../types';

export interface ReflectionTemplateSlice {
  reflectionTemplates: ReflectionTemplate[];
  addTemplate: (template: Omit<ReflectionTemplate, 'id'>) => string;
  updateTemplate: (id: string, updates: Partial<Omit<ReflectionTemplate, 'id'>>) => void;
  deleteTemplate: (id: string) => void;
  setDefaultTemplate: (id: string) => void;
  getDefaultTemplate: () => ReflectionTemplate | undefined;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const WEEKLY_REVIEW_TEMPLATE_ID = 'weekly-review-draft';
export const WEEKLY_REVIEW_LITE_TEMPLATE_ID = 'weekly-review-lite';

export const DEFAULT_TEMPLATE: ReflectionTemplate = {
  id: 'obstacle-breakthrough',
  name: '障碍突破',
  isDefault: true,
  questions: [
    { id: 'q-obstacle', label: '最大障碍', type: 'text', required: true },
    { id: 'q-solution', label: '解决方法', type: 'text', required: false },
    { id: 'q-effective', label: '有效/无效', type: 'text', required: false },
    { id: 'q-adjustment', label: '明天调整', type: 'text', required: false },
    { id: 'q-control', label: '掌控感', type: 'number', min: 1, max: 10, required: false },
  ],
};

export const WEEKLY_REVIEW_TEMPLATE: ReflectionTemplate = {
  id: WEEKLY_REVIEW_TEMPLATE_ID,
  name: '周复盘',
  isDefault: false,
  questions: [
    { id: 'weekly-facts', label: '事实报告', type: 'text', required: true },
    { id: 'weekly-questions', label: '教练追问', type: 'text', required: true },
    { id: 'weekly-next', label: '下周调整建议', type: 'text', required: true },
  ],
};

export const WEEKLY_REVIEW_LITE_TEMPLATE: ReflectionTemplate = {
  id: WEEKLY_REVIEW_LITE_TEMPLATE_ID,
  name: '周复盘精简版',
  isDefault: false,
  questions: [
    { id: 'weekly-done', label: '本周完成了什么', type: 'text', required: true },
    { id: 'weekly-blocked', label: '本周卡在哪里', type: 'text', required: false },
    { id: 'weekly-next-one', label: '下周只调整一件什么事', type: 'text', required: true },
  ],
};

export const createReflectionTemplateSlice: StateCreator<ReflectionTemplateSlice> = (set, get) => ({
  reflectionTemplates: [DEFAULT_TEMPLATE, WEEKLY_REVIEW_LITE_TEMPLATE, WEEKLY_REVIEW_TEMPLATE],

  addTemplate: (template) => {
    const id = generateId();
    set((state) => ({
      reflectionTemplates: [
        ...state.reflectionTemplates,
        { ...template, id },
      ],
    }));
    return id;
  },

  updateTemplate: (id, updates) =>
    set((state) => ({
      reflectionTemplates: state.reflectionTemplates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  deleteTemplate: (id) =>
    set((state) => ({
      reflectionTemplates: state.reflectionTemplates.filter((t) => t.id !== id),
    })),

  setDefaultTemplate: (id) =>
    set((state) => ({
      reflectionTemplates: state.reflectionTemplates.map((t) => ({
        ...t,
        isDefault: t.id === id,
      })),
    })),

  getDefaultTemplate: () => {
    return get().reflectionTemplates.find((t) => t.isDefault);
  },
});
