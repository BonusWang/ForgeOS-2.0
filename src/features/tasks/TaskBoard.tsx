import React, { useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import TaskColumn from './TaskColumn';
import OKRInboxColumn from '../okr/OKRInboxColumn';
import { useAppStore } from '../../store/useAppStore';
import { forgeCopy } from '../../copy/forge-copy';
import { format, addDays } from 'date-fns';
import {
  getWeekStart,
  getWeekDates,
  getNextWeekStart,
  getPrevWeekStart,
  getDayColumnFromDate,
} from '../../utils/date';

const DAY_LABELS: Record<string, string> = {
  MON: '周一',
  TUE: '周二',
  WED: '周三',
  THU: '周四',
  FRI: '周五',
  SAT: '周六',
  SUN: '周日',
};

const TaskBoard: React.FC = () => {
  const { tasks, moveTask, reorderTasks, inboxItems, addTask, removeFromInbox } = useAppStore();
  const [weekStart, setWeekStartState] = useState(() => getWeekStart());

  const weekDates = getWeekDates(weekStart);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );



  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // Handle inbox item drop
    if (activeId.startsWith('inbox-')) {
      const inboxItemId = activeId.replace('inbox-', '');
      let targetDate: string;

      if (overId.startsWith('column-')) {
        targetDate = overId.replace('column-', '');
      } else {
        const overTask = tasks.find((t) => t.id === overId);
        if (!overTask) return;
        targetDate = overTask.date;
      }

      const inboxItem = inboxItems.find((item) => item.id === inboxItemId);
      if (inboxItem) {
        addTask(inboxItem.content, targetDate, inboxItem.abilityId, inboxItem.abilityPoints);
        removeFromInbox(inboxItemId);
      }
      return;
    }

    // Handle drop onto empty column (overId is droppable container, not a task)
    if (overId.startsWith('column-')) {
      const targetDate = overId.replace('column-', '');
      const activeTask = tasks.find((t) => t.id === activeId);
      if (!activeTask || activeTask.date === targetDate) return;
      moveTask(activeId, targetDate, 0);
      return;
    }

    const activeTask = tasks.find((t) => t.id === activeId);
    const overTask = tasks.find((t) => t.id === overId);

    if (!activeTask || !overTask) return;

    if (activeTask.date === overTask.date) {
      const columnTasks = tasks
        .filter((t) => t.date === activeTask.date)
        .sort((a, b) => a.order - b.order);
      const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
      const newIndex = columnTasks.findIndex((t) => t.id === overId);
      const reordered = arrayMove(columnTasks, oldIndex, newIndex);
      reorderTasks(activeTask.date, reordered.map((t) => t.id));
    } else {
      const targetColumnTasks = tasks
        .filter((t) => t.date === overTask.date)
        .sort((a, b) => a.order - b.order);
      const newOrder = targetColumnTasks.findIndex((t) => t.id === overId);
      moveTask(activeId, overTask.date, newOrder >= 0 ? newOrder : targetColumnTasks.length);
    }
  };

  const getDateTasks = (date: string) => {
    return tasks.filter((t) => t.date === date);
  };

  const goToPrevWeek = () => setWeekStartState(getPrevWeekStart(weekStart));
  const goToNextWeek = () => setWeekStartState(getNextWeekStart(weekStart));
  const goToCurrentWeek = () => setWeekStartState(getWeekStart());

  const isCurrentWeek = weekStart === getWeekStart();

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div
          className="task-board-toolbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <button
            onClick={goToPrevWeek}
            className="font-caption task-board-toolbar-button"
            style={{
              background: 'none',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-3)',
              transition: 'color var(--duration-instant), border-color var(--duration-instant)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
          >
            {forgeCopy.actions.prevWeek}
          </button>
          <span className="font-h3 task-board-range" style={{ color: 'var(--accent-gold)' }}>
            {format(new Date(weekStart), 'yyyy年M月d日')} — {format(addDays(new Date(weekStart), 6), 'M月d日')}
          </span>
          <button
            onClick={goToNextWeek}
            className="font-caption task-board-toolbar-button"
            style={{
              background: 'none',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-3)',
              transition: 'color var(--duration-instant), border-color var(--duration-instant)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
          >
            {forgeCopy.actions.nextWeek}
          </button>
          {!isCurrentWeek && (
            <button
              onClick={goToCurrentWeek}
              className="font-caption task-board-toolbar-button"
              style={{
                background: 'none',
                border: '1px solid var(--accent-gold)',
                color: 'var(--accent-gold)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                padding: 'var(--space-1) var(--space-3)',
              }}
            >
              {forgeCopy.actions.currentWeek}
            </button>
          )}
        </div>

        <div className="task-board-scroll-shell">
          <div
            className="task-board-scroll"
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              overflowX: 'auto',
              paddingBottom: 'var(--space-2)',
            }}
          >
            <TaskColumn
              key="BACKLOG"
              date="BACKLOG"
              column="MON"
              tasks={getDateTasks('BACKLOG')}
              title="待安排任务"
              dateLabel=""
              isBacklog={true}
            />
            {weekDates.map((date) => {
              const dayColumn = getDayColumnFromDate(new Date(date));
              return (
                <TaskColumn
                  key={date}
                  date={date}
                  column={dayColumn}
                  tasks={getDateTasks(date)}
                  title={DAY_LABELS[dayColumn]}
                  dateLabel={format(new Date(date), 'MM/dd')}
                  isBacklog={false}
                />
              );
            })}
            <OKRInboxColumn />
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default TaskBoard;
