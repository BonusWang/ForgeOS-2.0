import React, { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { WEEKLY_REVIEW_TEMPLATE_ID } from '../../store/slices/reflectionTemplateSlice';
import {
  generateWeeklyReviewDraft,
  WEEKLY_REVIEW_TAG,
  type WeeklyReviewDraft,
} from './weeklyReviewDraft';

interface WeeklyReviewDraftPanelProps {
  isOpen: boolean;
  weekStart: string;
  onClose: () => void;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '132px',
  resize: 'vertical',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-primary)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  lineHeight: 1.7,
  padding: 'var(--space-2)',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  color: 'var(--text-secondary)',
  marginBottom: 'var(--space-1)',
};

const WeeklyReviewDraftPanel: React.FC<WeeklyReviewDraftPanelProps> = ({
  isOpen,
  weekStart,
  onClose,
}) => {
  const { tasks, objectives, abilities, reflections, saveReflection } = useAppStore();
  const draft = useMemo(
    () =>
      generateWeeklyReviewDraft({
        weekStart,
        tasks,
        objectives,
        abilities,
        reflections,
      }),
    [abilities, objectives, reflections, tasks, weekStart]
  );

  const handleSave = (editableDraft: WeeklyReviewDraft) => {
    saveReflection({
      date: editableDraft.periodEnd,
      kind: 'weeklyReview',
      periodStart: editableDraft.periodStart,
      periodEnd: editableDraft.periodEnd,
      templateId: WEEKLY_REVIEW_TEMPLATE_ID,
      answers: {
        'weekly-facts': editableDraft.facts,
        'weekly-questions': editableDraft.questions,
        'weekly-next': editableDraft.nextActions,
      },
      tags: [
        WEEKLY_REVIEW_TAG,
        `${editableDraft.periodStart}~${editableDraft.periodEnd}`,
        editableDraft.periodStart.slice(0, 7),
      ],
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <WeeklyReviewDraftPanelContent
      key={draft.periodStart}
      draft={draft}
      onClose={onClose}
      onSave={handleSave}
    />
  );
};

interface WeeklyReviewDraftPanelContentProps {
  draft: WeeklyReviewDraft;
  onClose: () => void;
  onSave: (draft: WeeklyReviewDraft) => void;
}

const WeeklyReviewDraftPanelContent: React.FC<WeeklyReviewDraftPanelContentProps> = ({
  draft,
  onClose,
  onSave,
}) => {
  const [editableDraft, setEditableDraft] = useState<WeeklyReviewDraft>(draft);

  const canSave =
    editableDraft.facts.trim().length > 0 &&
    editableDraft.questions.trim().length > 0 &&
    editableDraft.nextActions.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(editableDraft);
  };

  const setField = (field: keyof Pick<WeeklyReviewDraft, 'facts' | 'questions' | 'nextActions'>) => (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditableDraft((current) => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 10, 8, 0.86)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-4)',
      }}
    >
      <section
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 'min(960px, 96vw)',
          maxHeight: '88vh',
          overflow: 'auto',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          padding: 'var(--space-5)',
          boxSizing: 'border-box',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div>
            <div className="font-caption" style={{ color: 'var(--accent-gold)', marginBottom: 'var(--space-1)' }}>
              Weekly review
            </div>
            <h3 className="font-h2" style={{ color: 'var(--text-primary)', margin: 0 }}>
              周复盘草稿
            </h3>
            <div className="font-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
              {editableDraft.periodStart} - {editableDraft.periodEnd}
            </div>
          </div>
          <button
            onClick={onClose}
            className="font-h2"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            [x]
          </button>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          <label>
            <span className="font-caption" style={labelStyle}>事实报告</span>
            <textarea
              value={editableDraft.facts}
              onChange={setField('facts')}
              className="font-body"
              style={fieldStyle}
            />
          </label>
          <label>
            <span className="font-caption" style={labelStyle}>教练追问</span>
            <textarea
              value={editableDraft.questions}
              onChange={setField('questions')}
              className="font-body"
              style={fieldStyle}
            />
          </label>
          <label>
            <span className="font-caption" style={labelStyle}>下周调整建议</span>
            <textarea
              value={editableDraft.nextActions}
              onChange={setField('nextActions')}
              className="font-body"
              style={fieldStyle}
            />
          </label>
        </div>

        <footer
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-4)',
          }}
        >
          <button
            onClick={onClose}
            className="font-caption"
            style={{
              background: 'none',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-3)',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="font-caption"
            style={{
              background: canSave ? 'var(--text-primary)' : 'var(--bg-tertiary)',
              border: `1px solid ${canSave ? 'var(--text-primary)' : 'var(--border-primary)'}`,
              color: canSave ? 'var(--bg-primary)' : 'var(--text-muted)',
              cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-3)',
            }}
          >
            保存周复盘
          </button>
        </footer>
      </section>
    </div>
  );
};

export default WeeklyReviewDraftPanel;
