import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const { toggleTask, deleteTask, updateTask, incrementScore, abilities } = useAppStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editContent.trim()) {
      updateTask(task.id, { content: editContent.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditContent(task.content);
      setIsEditing(false);
    }
  };

  const handleToggle = () => {
    if (task.status === 'active' && task.abilityId && task.abilityPoints) {
      incrementScore(task.abilityId, task.abilityPoints);
    }
    toggleTask(task.id);
  };

  const ability = abilities.find((a) => a.id === task.abilityId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card"
      onMouseEnter={(e) => {
        const actions = e.currentTarget.querySelector('.task-actions');
        if (actions) actions.classList.remove('hidden');
      }}
      onMouseLeave={(e) => {
        const actions = e.currentTarget.querySelector('.task-actions');
        if (actions) actions.classList.add('hidden');
      }}
    >
      {isEditing ? (
        <input
          autoFocus
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="font-body"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid var(--accent-gold)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            padding: '0 var(--space-1)',
            width: '100%',
            outline: 'none',
            caretColor: 'var(--accent-gold)',
          }}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            onClick={handleToggle}
            className="font-body"
            style={{
              cursor: 'pointer',
              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
              color: task.status === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)',
              flex: 1,
              lineHeight: '28px',
            }}
          >
            {task.status === 'completed' ? (
              <span style={{ color: 'var(--accent-success)' }}>☑</span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>☐</span>
            )}{' '}
            {task.content}
            {ability && task.abilityPoints && (
              <span className="font-caption" style={{ color: 'var(--accent-gold)', marginLeft: 'var(--space-2)' }}>
                [{ability.name} +{task.abilityPoints}]
              </span>
            )}
            {task.migratedFrom && (
              <span className="font-caption" style={{ color: 'var(--accent-gold)', marginLeft: 'var(--space-2)' }}>
                ^ 来自昨日
              </span>
            )}
          </span>
          <span className="task-actions hidden" style={{ display: 'flex', gap: 'var(--space-1)' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="font-caption"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                padding: '0 var(--space-1)',
                transition: `color var(--duration-instant) var(--ease-instant)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              [✎]
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
              className="font-caption"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-danger)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                padding: '0 var(--space-1)',
                transition: `color var(--duration-instant) var(--ease-instant)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--accent-danger)';
              }}
            >
              [x]
            </button>
          </span>
        </div>
      )}
      <style>{`
        .task-card {
          padding: 0 var(--space-2);
          margin-bottom: var(--space-1);
          border: 1px solid var(--border-primary);
          background-color: var(--bg-tertiary);
          cursor: grab;
          transition: background-color var(--duration-instant) var(--ease-instant),
                      border-color var(--duration-instant) var(--ease-instant);
        }
        .task-card:hover {
          background-color: var(--bg-secondary);
          border-color: var(--border-hover);
        }
        .task-card:active {
          cursor: grabbing;
        }
        .hidden {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default TaskCard;
