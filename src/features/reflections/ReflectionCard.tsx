import React from 'react';
import type { Reflection } from '../../types';
import { useAppStore } from '../../store/useAppStore';

interface ReflectionCardProps {
  reflection: Reflection;
  onClick?: () => void;
}

const ReflectionCard: React.FC<ReflectionCardProps> = ({ reflection, onClick }) => {
  const reflectionTemplates = useAppStore((s) => s.reflectionTemplates);
  const template = reflectionTemplates.find((t) => t.id === reflection.templateId);
  const isWeeklyReview = reflection.kind === 'weeklyReview';
  const dateLabel = isWeeklyReview && reflection.periodStart && reflection.periodEnd
    ? `${reflection.periodStart} - ${reflection.periodEnd}`
    : reflection.date;

  // Find a numeric question to display as "stars" (prefer control-related)
  const numericQuestion = template?.questions.find((q) => q.type === 'number');
  const numericValue = numericQuestion
    ? Number(reflection.answers[numericQuestion.id] ?? 0)
    : 0;
  const stars = numericQuestion
    ? '★'.repeat(Math.round(numericValue / 2)) + '☆'.repeat(5 - Math.round(numericValue / 2))
    : '';

  // Find first text answer for preview
  const textQuestion = template?.questions.find((q) => q.type === 'text');
  const preview = textQuestion
    ? String(reflection.answers[textQuestion.id] ?? '')
    : '';

  return (
    <div
      className="reflection-card"
      onClick={onClick}
      style={{
        border: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--space-3)',
        cursor: onClick ? 'pointer' : 'default',
        transition: `border-color var(--duration-instant) var(--ease-instant), transform var(--duration-instant) var(--ease-instant)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-hover)';
        e.currentTarget.style.transform = 'translateY(2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-primary)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
        <span className="font-h3" style={{ color: 'var(--text-primary)' }}>
          {dateLabel}
        </span>
        {stars && <span style={{ color: 'var(--accent-gold)' }}>{stars}</span>}
        {isWeeklyReview && !stars && (
          <span
            className="font-caption"
            style={{
              color: 'var(--accent-gold)',
              border: '1px solid var(--border-primary)',
              padding: '0 var(--space-1)',
            }}
          >
            周复盘
          </span>
        )}
      </div>

      {template && (
        <div className="font-caption" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
          {template.name}
        </div>
      )}

      {preview && (
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <div className="font-caption" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-1)' }}>
            {textQuestion?.label}:
          </div>
          <div className="font-body" style={{ color: 'var(--text-primary)' }}>
            {preview || '—'}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
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

      {onClick && (
        <div style={{ marginTop: 'var(--space-2)', textAlign: 'right' }}>
          <span className="font-caption" style={{ color: 'var(--text-muted)' }}>[查看详情]</span>
        </div>
      )}
    </div>
  );
};

export default ReflectionCard;
