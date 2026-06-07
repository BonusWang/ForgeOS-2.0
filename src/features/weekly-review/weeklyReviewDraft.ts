import { addDays, format } from 'date-fns';
import type { Ability, Objective, Reflection, Task } from '../../types';
import { getWeekDates } from '../../utils/date';

export const WEEKLY_REVIEW_TAG = '周复盘';

export interface WeeklyReviewDraftInput {
  weekStart: string;
  tasks: Task[];
  objectives: Objective[];
  abilities: Ability[];
  reflections: Reflection[];
}

export interface WeeklyReviewDraft {
  periodStart: string;
  periodEnd: string;
  facts: string;
  questions: string;
  nextActions: string;
}

const formatList = (items: string[], emptyText: string) => {
  if (items.length === 0) return `- ${emptyText}`;
  return items.map((item) => `- ${item}`).join('\n');
};

const getAnswerPreview = (reflection: Reflection) => {
  const firstTextAnswer = Object.values(reflection.answers).find(
    (answer) => typeof answer === 'string' && answer.trim().length > 0
  );
  return firstTextAnswer ? String(firstTextAnswer).trim() : '';
};

export function generateWeeklyReviewDraft({
  weekStart,
  tasks,
  objectives,
  abilities,
  reflections,
}: WeeklyReviewDraftInput): WeeklyReviewDraft {
  const weekDates = getWeekDates(weekStart);
  const weekDateSet = new Set(weekDates);
  const periodEnd = format(addDays(new Date(weekStart), 6), 'yyyy-MM-dd');
  const month = weekStart.slice(0, 7);

  const weekTasks = tasks.filter((task) => weekDateSet.has(task.date));
  const completedTasks = weekTasks.filter((task) => task.status === 'completed');
  const activeTasks = weekTasks.filter((task) => task.status === 'active');
  const backlogTasks = tasks.filter((task) => task.date === 'BACKLOG');

  const monthObjectives = objectives.filter((objective) => objective.period === month);
  const completedKeyResults = monthObjectives.flatMap((objective) =>
    objective.keyResults
      .filter((keyResult) => keyResult.completed)
      .map((keyResult) => `${objective.title} / ${keyResult.content}`)
  );
  const openKeyResults = monthObjectives.flatMap((objective) =>
    objective.keyResults
      .filter((keyResult) => !keyResult.completed)
      .map((keyResult) => `${objective.title} / ${keyResult.content}`)
  );

  const abilityTaskMap = new Map(abilities.map((ability) => [ability.id, ability.name]));
  const abilityEvidence = completedTasks
    .filter((task) => task.abilityId)
    .map((task) => {
      const abilityName = abilityTaskMap.get(task.abilityId ?? '') ?? '未命名能力';
      const points = task.abilityPoints ? ` +${task.abilityPoints}` : '';
      return `${abilityName}${points}: ${task.content}`;
    });

  const weekReflections = reflections
    .filter((reflection) => (reflection.kind ?? 'daily') === 'daily')
    .filter((reflection) => weekDateSet.has(reflection.date))
    .map((reflection) => {
      const preview = getAnswerPreview(reflection);
      return preview ? `${reflection.date}: ${preview}` : `${reflection.date}: 已记录反思`;
    });

  const facts = [
    `周期: ${weekStart} - ${periodEnd}`,
    `任务: 本周共 ${weekTasks.length} 项，完成 ${completedTasks.length} 项，未完成 ${activeTasks.length} 项，待安排任务 ${backlogTasks.length} 项。`,
    `月目标: ${monthObjectives.length} 个，已完成关键结果 ${completedKeyResults.length} 个，待推进关键结果 ${openKeyResults.length} 个。`,
    '',
    '本周完成',
    formatList(completedTasks.slice(0, 8).map((task) => task.content), '本周暂无完成任务。'),
    '',
    '能力证据',
    formatList(abilityEvidence.slice(0, 6), '本周暂无明确能力训练证据。'),
    '',
    '反思摘录',
    formatList(weekReflections.slice(0, 5), '本周暂无每日反思记录。'),
  ].join('\n');

  const questions = [
    '- 哪一件完成的事最接近本月目标？它为什么有效？',
    '- 哪一类未完成任务反复出现？是任务太大、节奏不对，还是优先级不清？',
    '- 本周能力训练有没有真实证据？如果没有，下周应该把哪件任务改造成训练动作？',
    '- 哪条每日反思最值得保留为下周规则？',
  ].join('\n');

  const nextActions = [
    `- 保留 ${Math.max(1, Math.min(3, completedTasks.length || 1))} 个已经有效的动作，放入下周前半周。`,
    `- 从 ${activeTasks.length} 个未完成任务中挑 1 个真正重要的任务，拆成可在一天内完成的版本。`,
    `- 围绕 ${monthObjectives[0]?.title ?? '本月目标'} 选择 1 个关键结果，设为下周主线。`,
    `- 选择 1 个能力项，把任务写成“行动 + 证据 + 分值”的形式。`,
  ].join('\n');

  return {
    periodStart: weekStart,
    periodEnd,
    facts,
    questions,
    nextActions,
  };
}
