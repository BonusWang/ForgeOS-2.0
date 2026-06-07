import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { forgeCopy } from '../../copy/forge-copy';
import { generateTags } from '../../hooks/useReflectionTags';
import type { Reflection, ReflectionTemplate } from '../../types';

interface ReflectionFormProps {
  date: string;
  existingReflection?: Reflection;
  onSave?: () => void;
}

const createInitialAnswers = (
  existingReflection: Reflection | undefined,
  template: ReflectionTemplate | undefined
) => {
  if (existingReflection) {
    return { ...existingReflection.answers };
  }

  const initial: Record<string, string | number> = {};
  template?.questions.forEach((q) => {
    initial[q.id] = q.type === 'number' ? q.min ?? 1 : '';
  });
  return initial;
};

const ReflectionForm: React.FC<ReflectionFormProps> = ({
  date,
  existingReflection,
  onSave,
}) => {
  const { saveReflection, reflectionTemplates, getDefaultTemplate, getMoodByDate, incrementScore } = useAppStore();

  const defaultTemplate = getDefaultTemplate();
  const templateId = existingReflection?.templateId ?? defaultTemplate?.id ?? '';
  const template = reflectionTemplates.find((t) => t.id === templateId) || defaultTemplate;

  const todayMood = getMoodByDate(date);

  const [answers, setAnswers] = useState<Record<string, string | number>>(() =>
    createInitialAnswers(existingReflection, template)
  );

  const handleSubmit = () => {
    if (!template) return;
    // 检查必填项
    const missingRequired = template.questions.some(
      (q) => q.required && !String(answers[q.id] ?? '').trim()
    );
    if (missingRequired) return;

    const tags =
      existingReflection?.kind === 'weeklyReview'
        ? existingReflection.tags
        : generateTags(template, answers);

    saveReflection({
      date,
      kind: existingReflection?.kind,
      periodStart: existingReflection?.periodStart,
      periodEnd: existingReflection?.periodEnd,
      templateId: template.id,
      answers,
      tags,
    });

    // 能力联动：给关联能力的非空答案加分
    template.questions.forEach((q) => {
      if (!q.abilityLink) return;
      const answer = answers[q.id];
      if (answer === undefined || answer === '' || answer === null) return;

      let points = 1;
      if (q.type === 'number' && q.max) {
        const val = Number(answer);
        if (!isNaN(val)) {
          points = Math.max(1, Math.round((val / q.max) * 5));
        }
      }
      incrementScore(q.abilityLink, points);
    });

    if (onSave) onSave();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid var(--border-primary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    padding: 'var(--space-1) 0',
    fontSize: '13px',
    marginBottom: 'var(--space-3)',
    outline: 'none',
    caretColor: 'var(--accent-gold)',
    transition: `border-color var(--duration-instant) var(--ease-instant)`,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    letterSpacing: '0.03em',
    marginBottom: 'var(--space-1)',
    textTransform: 'uppercase',
  };

  if (!template) {
    return (
      <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
        {forgeCopy.emptyStates.reflectionTemplate}
      </div>
    );
  }

  return (
    <div>
      {/* Mood summary if available */}
      {todayMood && (
        <div
          style={{
            marginBottom: 'var(--space-3)',
            padding: 'var(--space-2)',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <span className="font-caption" style={{ color: 'var(--text-muted)' }}>
            今日情绪: {' '}
          </span>
          <span className="font-body" style={{ color: 'var(--accent-gold)' }}>
            {todayMood.mood}/10
          </span>
          <span className="font-caption" style={{ color: 'var(--text-muted)', marginLeft: 'var(--space-2)' }}>
            能量: {' '}
          </span>
          <span className="font-body" style={{ color: 'var(--accent-success)' }}>
            {todayMood.energy}/10
          </span>
          {todayMood.note && (
            <span className="font-caption" style={{ color: 'var(--text-secondary)', marginLeft: 'var(--space-2)' }}>
              — {todayMood.note}
            </span>
          )}
        </div>
      )}

      {/* Template indicator */}
      <div
        className="font-caption"
        style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}
      >
        使用模板: {template.name}
      </div>

      {template.questions.map((q) => (
        <div key={q.id}>
          <label className="font-caption" style={labelStyle}>
            {q.label}
            {q.required ? ' *' : ''}
            {q.abilityLink ? ' (能力加分)' : ''}
          </label>

          {q.type === 'text' && (
            <input
              value={String(answers[q.id] ?? '')}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
              placeholder="..."
              className="font-body"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomColor = 'var(--accent-gold)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomColor = 'var(--border-primary)';
              }}
            />
          )}

          {q.type === 'number' && (
            <input
              type="number"
              min={q.min}
              max={q.max}
              value={Number(answers[q.id] ?? q.min ?? 1)}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [q.id]: Number(e.target.value) || 0,
                }))
              }
              className="font-body"
              style={{ ...inputStyle, width: '80px' }}
            />
          )}

          {q.type === 'select' && q.options && (
            <select
              value={String(answers[q.id] ?? '')}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
              className="font-body"
              style={{
                ...inputStyle,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                padding: 'var(--space-1) var(--space-2)',
              }}
            >
              <option value="">-- 请选择 --</option>
              {q.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
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
        [  保存反思  ]
      </button>
    </div>
  );
};

export default ReflectionForm;
