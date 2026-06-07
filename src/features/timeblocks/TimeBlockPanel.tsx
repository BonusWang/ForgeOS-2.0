import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { forgeCopy } from '../../copy/forge-copy';
import TimeBlockEditor from './TimeBlockEditor';
import AsciiBox from '../../components/AsciiBox';

const getTodayString = () => new Date().toISOString().split('T')[0];

const TimeBlockPanel: React.FC = () => {
  const timeBlocks = useAppStore((s) => s.timeBlocks);
  const tasks = useAppStore((s) => s.tasks);
  const addTimeBlock = useAppStore((s) => s.addTimeBlock);
  const deleteTimeBlock = useAppStore((s) => s.deleteTimeBlock);
  const toggleTimeBlockCompleted = useAppStore((s) => s.toggleTimeBlockCompleted);
  const toggleTask = useAppStore((s) => s.toggleTask);

  const [editorOpen, setEditorOpen] = useState(false);

  const today = getTodayString();
  const todayBlocks = timeBlocks
    .filter((b) => b.date === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getTaskName = (taskId?: string) => {
    if (!taskId) return null;
    const task = tasks.find((t) => t.id === taskId);
    return task ? task.content : null;
  };

  const getTaskStatus = (taskId?: string) => {
    if (!taskId) return null;
    const task = tasks.find((t) => t.id === taskId);
    return task ? task.status : null;
  };

  return (
    <>
      <AsciiBox title="时间块" className="dashboard-status-card dashboard-status-card--time-block">
        {todayBlocks.length === 0 ? (
          <div
            className="font-body time-block-empty"
            style={{
              color: 'var(--text-secondary)',
              textAlign: 'center',
              padding: 'var(--space-4)',
            }}
          >
            <p>{forgeCopy.emptyStates.timeBlock}</p>
            <p className="font-caption" style={{ marginTop: 'var(--space-2)' }}>
              点击下方按钮，假装时间是可以被规划的
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {todayBlocks.map((block) => {
              const taskName = getTaskName(block.taskId);
              const taskStatus = getTaskStatus(block.taskId);
              const duration =
                (new Date(`2000-01-01T${block.endTime}`).getTime() -
                  new Date(`2000-01-01T${block.startTime}`).getTime()) /
                (1000 * 60);

              return (
                <div
                  key={block.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-2)',
                    borderBottom: '1px solid var(--border-primary)',
                    opacity: block.completed ? 0.6 : 1,
                  }}
                >
                  {/* Time */}
                  <div
                    className="font-mono-data"
                    style={{
                      color: 'var(--text-muted)',
                      minWidth: '90px',
                      textAlign: 'right',
                    }}
                  >
                    {block.startTime}
                    <br />
                    {block.endTime}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="font-body"
                      style={{
                        color: block.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                        textDecoration: block.completed ? 'line-through' : 'none',
                      }}
                    >
                      {block.label}
                      <span
                        className="font-caption"
                        style={{ color: 'var(--text-muted)', marginLeft: 'var(--space-2)' }}
                      >
                        ({duration}min)
                      </span>
                    </div>

                    {taskName && (
                      <div
                        className="font-caption"
                        style={{
                          color: taskStatus === 'completed' ? 'var(--accent-success)' : 'var(--accent-gold)',
                          marginTop: '2px',
                        }}
                      >
                        {taskStatus === 'completed' ? '☑' : '☐'} {taskName}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                    {block.taskId && taskStatus !== 'completed' && (
                      <button
                        onClick={() => toggleTask(block.taskId!)}
                        className="font-caption"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-success)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                          padding: '0',
                        }}
                        title="完成任务"
                      >
                        [完成]
                      </button>
                    )}
                    <button
                      onClick={() => toggleTimeBlockCompleted(block.id)}
                      className="font-h2"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: block.completed ? 'var(--accent-success)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        padding: '0',
                      }}
                      title={block.completed ? '标记未完成' : '标记完成'}
                    >
                      {block.completed ? '[✓]' : '[ ]'}
                    </button>
                    <button
                      onClick={() => deleteTimeBlock(block.id)}
                      className="font-caption"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-danger)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        padding: '0 var(--space-1)',
                      }}
                      title="删除"
                    >
                      [x]
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add button */}
        <div className="time-block-actions" style={{ marginTop: 'var(--space-3)', textAlign: 'center' }}>
          <button
            onClick={() => setEditorOpen(true)}
            className="font-body"
            style={{
              background: 'none',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-3)',
              transition: 'all var(--duration-instant)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-gold)';
              e.currentTarget.style.color = 'var(--accent-gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            [+ 添加时间块]
          </button>
        </div>
      </AsciiBox>

      <TimeBlockEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={(block) => addTimeBlock(block)}
      />
    </>
  );
};

export default TimeBlockPanel;
