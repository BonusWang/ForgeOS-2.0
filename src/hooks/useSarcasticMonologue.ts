import { useMemo } from 'react';
import { forgeCopy } from '../copy/forge-copy';
import { useAppStore } from '../store/useAppStore';

export type MonologueScene =
  | 'emptyBoard'
  | 'streakBroken'
  | 'lateNight'
  | 'allCompleted'
  | 'none';

interface MonologueResult {
  scene: MonologueScene;
  text: string | null;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getBrokenStreakDays(reflections: { date: string }[]): number {
  if (reflections.length === 0) return 0;
  const sorted = [...reflections]
    .map((r) => r.date)
    .sort((a, b) => b.localeCompare(a));
  let days = 0;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const todayStr = new Date().toISOString().split('T')[0];
  while (d.toISOString().split('T')[0] >= sorted[0] && d.toISOString().split('T')[0] !== todayStr) {
    const ds = d.toISOString().split('T')[0];
    if (!sorted.includes(ds)) {
      days++;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return days;
}

export function useSarcasticMonologue(): MonologueResult {
  const { tasks, reflections, habits } = useAppStore();

  return useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const today = now.toISOString().split('T')[0];

    const todayTasks = tasks.filter((t) => t.date === today);
    const completedToday = todayTasks.filter((t) => t.status === 'completed').length;
    const totalToday = todayTasks.length;

    // Scene: all completed
    if (totalToday > 0 && completedToday === totalToday) {
      return {
        scene: 'allCompleted',
        text: pickRandom(forgeCopy.monologues.allCompleted),
      };
    }

    // Scene: empty board (no tasks at all today, and no habits)
    if (totalToday === 0 && habits.length === 0) {
      return {
        scene: 'emptyBoard',
        text: pickRandom(forgeCopy.monologues.emptyBoard),
      };
    }

    // Scene: late night (23:00 - 05:00)
    if (hour >= 23 || hour <= 4) {
      return {
        scene: 'lateNight',
        text: pickRandom(forgeCopy.monologues.lateNight),
      };
    }

    // Scene: streak broken (3+ days without reflection)
    const brokenDays = getBrokenStreakDays(reflections);
    if (brokenDays >= 3) {
      return {
        scene: 'streakBroken',
        text: pickRandom(forgeCopy.monologues.streakBroken).replace(
          '{days}',
          String(brokenDays)
        ),
      };
    }

    return { scene: 'none', text: null };
  }, [tasks, reflections, habits]);
}
