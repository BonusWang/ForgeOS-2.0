import type { StateCreator } from 'zustand';
import type { Task, DayColumn } from '../../types';
import { getDayColumnFromDate } from '../../utils/date';

export interface TaskSlice {
  tasks: Task[];
  addTask: (content: string, date: string, abilityId?: string, abilityPoints?: number) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, targetDate: string, newOrder: number) => void;
  toggleTask: (id: string) => void;
  archiveWeekTasks: (currentWeekStart: string) => void;
  migrateUnfinishedTasks: (fromDate: string, toDate: string) => void;
  reorderTasks: (date: string, taskIds: string[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const createTaskSlice: StateCreator<TaskSlice> = (set, get) => ({
  tasks: [],

  addTask: (content, date, abilityId, abilityPoints) => {
    const tasks = get().tasks;
    const column = date === 'BACKLOG' ? 'MON' as DayColumn : getDayColumnFromDate(new Date(date));
    const columnTasks = tasks.filter((t) => t.date === date);
    const newTask: Task = {
      id: generateId(),
      content,
      column,
      date,
      status: 'active',
      order: columnTasks.length,
      abilityId,
      abilityPoints,
    };
    set({ tasks: [...tasks, newTask] });
  },

  deleteTask: (id) => {
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },

  moveTask: (id, targetDate, newOrder) => {
    const tasks = get().tasks;
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const targetColumn = targetDate === 'BACKLOG'
      ? ('MON' as DayColumn)
      : getDayColumnFromDate(new Date(targetDate));

    const otherTasks = tasks.filter((t) => t.id !== id);
    const targetDateTasks = otherTasks
      .filter((t) => t.date === targetDate)
      .sort((a, b) => a.order - b.order);

    const updatedTargetTasks = [...targetDateTasks];
    const movedTask = { ...task, date: targetDate, column: targetColumn };
    updatedTargetTasks.splice(newOrder, 0, movedTask);

    const reorderedTarget = updatedTargetTasks.map((t, idx) => ({ ...t, order: idx }));
    const otherDates = otherTasks.filter((t) => t.date !== targetDate);

    set({ tasks: [...otherDates, ...reorderedTarget] });
  },

  toggleTask: (id) => {
    set({
      tasks: get().tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: t.status === 'active' ? 'completed' : 'active',
              completedAt: t.status === 'active' ? new Date().toISOString() : undefined,
            }
          : t
      ),
    });
  },

  archiveWeekTasks: () => {
    const tasks = get().tasks;
    const activeTasks = tasks.filter(
      (t) => t.date !== 'BACKLOG' && t.status === 'active'
    );
    const backlogTasks = tasks.filter((t) => t.date === 'BACKLOG');
    const migrated = activeTasks.map((t, idx) => ({
      ...t,
      date: 'BACKLOG',
      column: 'MON' as DayColumn,
      order: backlogTasks.length + idx,
      migratedFrom: t.date,
    }));

    set({ tasks: [...backlogTasks, ...migrated] });
  },

  migrateUnfinishedTasks: (fromDate, toDate) => {
    const tasks = get().tasks;
    const toColumn = getDayColumnFromDate(new Date(toDate));
    const toMigrate = tasks
      .filter((t) => t.date === fromDate && t.status === 'active')
      .sort((a, b) => a.order - b.order);

    const existingTarget = tasks
      .filter((t) => t.date === toDate)
      .sort((a, b) => a.order - b.order);

    const migrated = toMigrate.map((t, idx) => ({
      ...t,
      date: toDate,
      column: toColumn,
      order: idx,
      migratedFrom: fromDate,
    }));

    const shiftedExisting = existingTarget.map((t, idx) => ({
      ...t,
      order: toMigrate.length + idx,
    }));

    const others = tasks.filter(
      (t) => t.date !== fromDate && t.date !== toDate
    );

    set({ tasks: [...others, ...migrated, ...shiftedExisting] });
  },

  reorderTasks: (date, taskIds) => {
    const tasks = get().tasks;
    const otherTasks = tasks.filter((t) => t.date !== date);
    const dateTasks = tasks.filter((t) => t.date === date);

    const reordered = taskIds
      .map((id) => dateTasks.find((t) => t.id === id))
      .filter(Boolean) as Task[];

    const updated = reordered.map((t, idx) => ({ ...t, order: idx }));
    set({ tasks: [...otherTasks, ...updated] });
  },

  updateTask: (id, updates) => {
    set({
      tasks: get().tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    });
  },
});
