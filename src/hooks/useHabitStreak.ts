import { useMemo } from 'react';
import type { Habit } from '../types';

/**
 * 计算某个习惯在指定日期之前的连续打卡天数
 * 只向后追溯（从 date 往前数），遇到中断即停止
 */
export function calculateStreak(habit: Habit, date: string): number {
  const targetDate = new Date(date);
  let streak = 0;

  // 从指定日期开始往前回溯
  for (let i = 0; i < 365; i++) {
    const d = new Date(targetDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    if (habit.completions[dateStr]) {
      streak++;
    } else {
      // 如果指定日期本身就没完成， streak 保持 0
      // 如果回溯过程中遇到中断，停止计数
      if (i === 0) {
        // 当天未完成，继续往前看是否有连续记录（用于显示"上次连续"）
        // 但这里我们按标准 streak 定义：当天未完成则 streak = 0
        streak = 0;
        break;
      }
      break;
    }
  }

  return streak;
}

/**
 * 计算本周完成天数
 */
export function calculateWeekProgress(habit: Habit, weekStart: string): { completed: number; target: number } {
  const start = new Date(weekStart);
  let completed = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    if (habit.completions[dateStr]) {
      completed++;
    }
  }

  return { completed, target: habit.targetDays };
}

/**
 * Hook: 计算所有习惯的 streak 和本周进度
 */
export function useHabitStats(habits: Habit[], date: string, weekStart: string) {
  return useMemo(() => {
    return habits.map((habit) => ({
      habit,
      streak: calculateStreak(habit, date),
      weekProgress: calculateWeekProgress(habit, weekStart),
    }));
  }, [habits, date, weekStart]);
}
