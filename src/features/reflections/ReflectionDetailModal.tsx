import React, { useState } from 'react';
import type { Reflection } from '../../types';
import ReflectionForm from './ReflectionForm';
import { useAppStore } from '../../store/useAppStore';

interface ReflectionDetailModalProps {
  reflection: Reflection | null;
  onClose: () => void;
}

const ReflectionDetailModal: React.FC<ReflectionDetailModalProps> = ({
  reflection,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const reflectionTemplates = useAppStore((s) => s.reflectionTemplates);

  if (!reflection) return null;

  const template = reflectionTemplates.find((t) => t.id === reflection.templateId);
  const isWeeklyReview = reflection.kind === 'weeklyReview';
  const detailTitle = isWeeklyReview && reflection.periodStart && reflection.periodEnd
    ? `周复盘详情 - ${reflection.periodStart} - ${reflection.periodEnd}`
    : `反思详情 - ${reflection.date}`;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10, 10, 8, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          padding: 'var(--space-6)',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 className="font-h2 modal-title" style={{ margin: 0, color: 'var(--accent-gold)' }}>
            {isEditing ? '编辑反思' : detailTitle}
          </h3>
          <button
            onClick={onClose}
            className="font-h2"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              transition: `color var(--duration-instant) var(--ease-instant)`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            [x]
          </button>
        </div>

        {isEditing ? (
          <ReflectionForm
            date={reflection.date}
            existingReflection={reflection}
            onSave={() => {
              setIsEditing(false);
            }}
          />
        ) : (
          <div>
            {template && (
              <div className="font-caption" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                模板: {template.name}
              </div>
            )}

            {template?.questions.map((q) => (
              <div key={q.id} style={{ marginBottom: 'var(--space-3)' }}>
                <div className="font-caption" style={{ color: 'var(--text-secondary)' }}>
                  {q.label}:
                </div>
                <div className="font-body">
                  {reflection.answers[q.id] !== undefined
                    ? String(reflection.answers[q.id])
                    : '—'}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div className="font-caption" style={{ color: 'var(--text-secondary)' }}>标签:</div>
              <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                {reflection.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-caption"
                    style={{
                      backgroundColor: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      padding: 'var(--space-1) var(--space-2)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="font-caption"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                padding: 'var(--space-1) var(--space-2)',
                marginTop: 'var(--space-2)',
                textTransform: 'uppercase',
                transition: `background-color var(--duration-instant) var(--ease-instant), color var(--duration-instant) var(--ease-instant)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--text-primary)';
                e.currentTarget.style.color = 'var(--bg-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              [✎ 编辑]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReflectionDetailModal;
