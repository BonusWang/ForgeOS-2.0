import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { forgeCopy } from '../../copy/forge-copy';
import InspirationForm from './InspirationForm';
import AsciiBox from '../../components/AsciiBox';

const InspirationVaultPanel: React.FC = () => {
  const inspirations = useAppStore((s) => s.inspirations);
  const addInspiration = useAppStore((s) => s.addInspiration);
  const deleteInspiration = useAppStore((s) => s.deleteInspiration);
  const addTask = useAppStore((s) => s.addTask);
  const convertToTask = useAppStore((s) => s.convertToTask);
  const tasks = useAppStore((s) => s.tasks);

  const [editorOpen, setEditorOpen] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(inspirations.flatMap((i) => i.tags))
  ).sort();

  const filtered = filterTag
    ? inspirations.filter((i) => i.tags.includes(filterTag))
    : inspirations;

  const handleConvertToTask = (inspirationId: string, content: string) => {
    const today = new Date().toISOString().split('T')[0];
    addTask(content, today);
    // 找到刚添加的任务（最后一个）
    setTimeout(() => {
      const allTasks = useAppStore.getState().tasks;
      const newTask = allTasks.find((t) => t.content === content && t.date === today);
      if (newTask) {
        convertToTask(inspirationId, newTask.id);
      }
    }, 0);
  };

  return (
    <>
      <AsciiBox title="灵感库">
        {/* Tag filter */}
        {allTags.length > 0 && (
          <div style={{ marginBottom: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
            <button
              onClick={() => setFilterTag(null)}
              className="font-caption"
              style={{
                background: filterTag === null ? 'var(--accent-gold)' : 'transparent',
                border: '1px solid var(--border-primary)',
                color: filterTag === null ? 'var(--bg-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                padding: '2px var(--space-2)',
              }}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilterTag(tag === filterTag ? null : tag)}
                className="font-caption"
                style={{
                  background: filterTag === tag ? 'var(--accent-gold)' : 'transparent',
                  border: '1px solid var(--border-primary)',
                  color: filterTag === tag ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  padding: '2px var(--space-2)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div
            className="font-body"
            style={{
              color: 'var(--text-secondary)',
              textAlign: 'center',
              padding: 'var(--space-4)',
            }}
          >
            <p>{forgeCopy.emptyStates.inspirationVault}</p>
            <p className="font-caption" style={{ marginTop: 'var(--space-2)' }}>
              灵感只拜访有准备的人，而你的门铃坏了
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {filtered.map((inspiration) => {
              const isConverted = !!inspiration.convertedToTaskId;
              const linkedTask = tasks.find((t) => t.id === inspiration.convertedToTaskId);

              return (
                <div
                  key={inspiration.id}
                  style={{
                    borderBottom: '1px solid var(--border-primary)',
                    paddingBottom: 'var(--space-2)',
                    opacity: isConverted ? 0.6 : 1,
                  }}
                >
                  <div
                    className="font-body"
                    style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}
                  >
                    {inspiration.content}
                  </div>

                  {(inspiration.source || inspiration.tags.length > 0) && (
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-1)', flexWrap: 'wrap' }}>
                      {inspiration.source && (
                        <span className="font-caption" style={{ color: 'var(--text-muted)' }}>
                          来源: {inspiration.source}
                        </span>
                      )}
                      {inspiration.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-caption"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                            padding: '1px var(--space-1)',
                            border: '1px solid var(--border-primary)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginTop: 'var(--space-1)' }}>
                    {!isConverted ? (
                      <button
                        onClick={() => handleConvertToTask(inspiration.id, inspiration.content)}
                        className="font-caption"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-gold)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                          padding: '0',
                        }}
                      >
                        [转为任务]
                      </button>
                    ) : (
                      <span className="font-caption" style={{ color: 'var(--accent-success)' }}>
                        [已转为任务{linkedTask ? `: ${linkedTask.content}` : ''}]
                      </span>
                    )}
                    <button
                      onClick={() => deleteInspiration(inspiration.id)}
                      className="font-caption"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-danger)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        padding: '0',
                      }}
                    >
                      [删除]
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add button */}
        <div style={{ marginTop: 'var(--space-3)', textAlign: 'center' }}>
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
            [+ 记录灵感]
          </button>
        </div>
      </AsciiBox>

      <InspirationForm
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={(data) => addInspiration(data)}
      />
    </>
  );
};

export default InspirationVaultPanel;
