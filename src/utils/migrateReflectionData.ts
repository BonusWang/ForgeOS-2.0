import type { Reflection, ReflectionTemplate } from '../types';
import {
  DEFAULT_TEMPLATE,
  WEEKLY_REVIEW_LITE_TEMPLATE,
  WEEKLY_REVIEW_TEMPLATE,
} from '../store/slices/reflectionTemplateSlice';

/**
 * 检测并迁移旧格式的反思数据到新格式
 * 旧格式: template: 'obstacle-breakthrough', answers: { obstacle, solution, effective, adjustment, control }
 * 新格式: templateId: 'obstacle-breakthrough', answers: Record<string, string | number>
 */
export interface LegacyReflection {
  id: string;
  date: string;
  template: 'obstacle-breakthrough';
  answers: {
    obstacle: string;
    solution: string;
    effective: string;
    adjustment: string;
    control: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function isLegacyReflection(r: unknown): r is LegacyReflection {
  if (!isRecord(r) || !isRecord(r.answers)) return false;

  return (
    typeof r.template === 'string' &&
    r.template === 'obstacle-breakthrough' &&
    !Array.isArray(r.answers) &&
    'obstacle' in r.answers
  );
}

export function migrateReflection(
  legacy: LegacyReflection
): Reflection {
  return {
    id: legacy.id,
    date: legacy.date,
    templateId: legacy.template,
    answers: {
      'q-obstacle': legacy.answers.obstacle,
      'q-solution': legacy.answers.solution,
      'q-effective': legacy.answers.effective,
      'q-adjustment': legacy.answers.adjustment,
      'q-control': legacy.answers.control,
    },
    tags: legacy.tags,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
  };
}

export function migrateAllReflections(
  reflections: unknown[],
  templates: ReflectionTemplate[]
): { reflections: Reflection[]; templates: ReflectionTemplate[] } {
  const hasLegacy = reflections.some(isLegacyReflection);
  const builtinTemplates = [DEFAULT_TEMPLATE, WEEKLY_REVIEW_LITE_TEMPLATE, WEEKLY_REVIEW_TEMPLATE];
  const nextTemplates = [...templates];

  for (const template of builtinTemplates) {
    if (!nextTemplates.some((t) => t.id === template.id)) {
      nextTemplates.unshift(template);
    }
  }

  if (!hasLegacy) {
    return { reflections: reflections as Reflection[], templates: nextTemplates };
  }

  const nextReflections = reflections.map((r) => {
    if (isLegacyReflection(r)) {
      return migrateReflection(r);
    }
    return r as Reflection;
  });

  return { reflections: nextReflections, templates: nextTemplates };
}
