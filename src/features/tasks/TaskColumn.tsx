import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { DayColumn, Task } from '../../types';
import TaskCard from './TaskCard';
import { useAppStore } from '../../store/useAppStore';

interface TaskColumnProps {
  date: string;
  column: DayColumn;
  tasks: Task[];
  title: string;
  dateLabel?: string;
  isBacklog?: boolean;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ date, column, tasks, title, dateLabel, isBacklog }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedAbilityId, setSelectedAbilityId] = useState<string>('');
  const [abilityPoints, setAbilityPoints] = useState<number>(10);
  const { addTask, abilities } = useAppStore();

  const droppableId = `column-${date}`;
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({ id: droppableId });

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);
  const columnClassName = [
    'task-column',
    isBacklog ? 'task-column--backlog' : 'task-column--day',
    sortedTasks.length === 0 ? 'task-column--empty' : 'task-column--active',
  ].join(' ');

  const handleAdd = () => {
    if (newContent.trim()) {
      const abilityId = selectedAbilityId || undefined;
      const points = selectedAbilityId ? abilityPoints : undefined;
      addTask(newContent.trim(), date, abilityId, points);
      setNewContent('');
      setSelectedAbilityId('');
      setAbilityPoints(10);
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') {
      setNewContent('');
      setSelectedAbilityId('');
      setAbilityPoints(10);
      setIsAdding(false);
    }
  };

  return (
    <div
      className={columnClassName}
      style={{
        border: isBacklog
          ? '1px dashed var(--border-primary)'
          : '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-secondary)',
        minWidth: '200px',
        flex: '0 0 200px',
        display: 'flex',
        flexDirection: 'column',
      }}
      data-column={column}
    >
      <div
        className="task-column-header"
        style={{
          padding: 'var(--space-2) var(--space-3)',
          borderBottom: '1px solid var(--border-primary)',
          backgroundColor: isBacklog ? 'var(--bg-tertiary)' : 'transparent',
          textAlign: 'center',
        }}
      >
        <div className="font-h3" style={{ color: 'var(--accent-gold)' }}>
          {title}
        </div>
        {dateLabel && (
          <div className="font-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
            {dateLabel}
          </div>
        )}
      </div>

      <div
        className="task-column-content"
        ref={setDroppableRef}
        style={{
          flex: 1,
          padding: 'var(--space-2) var(--space-3)',
          minHeight: '200px',
          backgroundColor: isOver ? 'var(--bg-tertiary)' : 'transparent',
          transition: 'background-color var(--duration-instant)',
        }}
      >
        <SortableContext items={sortedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      <div
        className="task-column-footer"
        style={{
          padding: 'var(--space-2) var(--space-3)',
          borderTop: '1px solid var(--border-primary)',
        }}
      >
        {isAdding ? (
          <div>
            <input
              autoFocus
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newContent.trim()) setIsAdding(false);
              }}
              placeholder="输入任务..."
              className="font-body"
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--accent-gold)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                padding: 'var(--space-1) 0',
                width: '100%',
                outline: 'none',
                caretColor: 'var(--accent-gold)',
                marginBottom: 'var(--space-2)',
              }}
            />
            {abilities.length > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <select
                  value={selectedAbilityId}
                  onChange={(e) => setSelectedAbilityId(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="font-caption"
                  style={{
                    flex: 1,
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    padding: 'var(--space-1)',
                  }}
                >
                  <option value="">-- 关联能力 --</option>
                  {abilities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {selectedAbilityId && (
                  <input
                    type="number"
                    value={abilityPoints}
                    onChange={(e) => setAbilityPoints(Number(e.target.value))}
                    onKeyDown={handleKeyDown}
                    placeholder="分值"
                    className="font-caption"
                    style={{
                      width: '60px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      padding: 'var(--space-1)',
                    }}
                  />
                )}
                <button
                  onClick={handleAdd}
                  className="font-caption"
                  style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--accent-gold)',
                    color: 'var(--accent-gold)',
                    fontFamily: 'var(--font-mono)',
                    padding: 'var(--space-1) var(--space-2)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  确认
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="font-caption"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              width: '100%',
              textAlign: 'center',
              padding: 'var(--space-1)',
              transition: `color var(--duration-instant) var(--ease-instant)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            [+]
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;
