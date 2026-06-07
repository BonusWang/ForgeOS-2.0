import React, { useMemo, useState } from 'react';
import { addDays, format } from 'date-fns';
import AsciiBox from '../components/AsciiBox';
import { useAppStore } from '../store/useAppStore';
import { WEEKLY_REVIEW_LITE_TEMPLATE_ID } from '../store/slices/reflectionTemplateSlice';
import { getNextWeekStart, getPrevWeekStart, getWeekDates, getWeekStart } from '../utils/date';
import type { Reflection, Task } from '../types';

interface WeeklyReviewPageProps {
  initialWeekStart?: string;
}

interface WeeklyReviewEditorProps {
  periodStart: string;
  periodEnd: string;
  existingReview?: Reflection;
}

const getTextAnswer = (review: Reflection | undefined, ids: string[]) => {
  if (!review) return '';
  const value = ids.map((id) => review.answers[id]).find((answer) => typeof answer === 'string' && answer.trim());
  return value ? String(value) : '';
};

const getTaskEvidence = (tasks: Task[], weekStart: string) => {
  const weekDateSet = new Set(getWeekDates(weekStart));
  const weekTasks = tasks
    .filter((task) => weekDateSet.has(task.date))
    .sort((a, b) => `${a.date}-${a.order}`.localeCompare(`${b.date}-${b.order}`));
  const completed = weekTasks.filter((task) => task.status === 'completed');
  const active = weekTasks.filter((task) => task.status === 'active');
  const abilityPoints = completed.reduce((sum, task) => sum + (task.abilityPoints ?? 0), 0);

  return { weekTasks, completed, active, abilityPoints };
};

const isDateInWeek = (weekStart: string, date: string) => new Set(getWeekDates(weekStart)).has(date);

const WeeklyReviewEditor: React.FC<WeeklyReviewEditorProps> = ({
  periodStart,
  periodEnd,
  existingReview,
}) => {
  const saveReflection = useAppStore((s) => s.saveReflection);
  const [done, setDone] = useState(() =>
    getTextAnswer(existingReview, ['weekly-done', 'weekly-facts'])
  );
  const [blocked, setBlocked] = useState(() =>
    getTextAnswer(existingReview, ['weekly-blocked', 'weekly-questions'])
  );
  const [nextOne, setNextOne] = useState(() =>
    getTextAnswer(existingReview, ['weekly-next-one', 'weekly-next'])
  );
  const [isEditing, setIsEditing] = useState(() => !existingReview);

  const canSave = done.trim().length > 0 && nextOne.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    saveReflection({
      date: periodEnd,
      kind: 'weeklyReview',
      periodStart,
      periodEnd,
      templateId: WEEKLY_REVIEW_LITE_TEMPLATE_ID,
      answers: {
        'weekly-done': done,
        'weekly-blocked': blocked,
        'weekly-next-one': nextOne,
      },
      tags: ['周复盘', `${periodStart}~${periodEnd}`, periodStart.slice(0, 7)],
    });
    setIsEditing(false);
  };

  if (existingReview && !isEditing) {
    const savedDone = getTextAnswer(existingReview, ['weekly-done', 'weekly-facts']);
    const savedNext = getTextAnswer(existingReview, ['weekly-next-one', 'weekly-next']);

    return (
      <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <div
          aria-live="polite"
          className="font-body"
          role="status"
          style={{ color: 'var(--accent-success)' }}
        >
          周复盘已保存
        </div>
        <div className="font-caption" style={{ color: 'var(--text-secondary)' }}>
          完成：{savedDone || '未填写'}
        </div>
        <div className="font-caption" style={{ color: 'var(--text-secondary)' }}>
          下周调整：{savedNext || '未填写'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setIsEditing(true)}
            className="font-caption weekly-review-save-button"
            style={{
              background: 'none',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-3)',
            }}
          >
            查看/编辑周复盘
          </button>
        </div>
      </div>
    );
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '88px',
    resize: 'vertical',
    boxSizing: 'border-box',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    lineHeight: 1.7,
    outline: 'none',
    padding: 'var(--space-2)',
  };

  return (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <label>
        <span className="font-caption" style={{ color: 'var(--text-secondary)' }}>
          本周完成了什么 *
        </span>
        <textarea
          value={done}
          onChange={(event) => setDone(event.target.value)}
          style={fieldStyle}
        />
      </label>

      <label>
        <span className="font-caption" style={{ color: 'var(--text-secondary)' }}>
          本周卡在哪里
        </span>
        <textarea
          value={blocked}
          onChange={(event) => setBlocked(event.target.value)}
          style={fieldStyle}
        />
      </label>

      <label>
        <span className="font-caption" style={{ color: 'var(--text-secondary)' }}>
          下周只调整一件什么事 *
        </span>
        <textarea
          value={nextOne}
          onChange={(event) => setNextOne(event.target.value)}
          style={fieldStyle}
        />
      </label>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="font-caption weekly-review-save-button"
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
      </div>
    </div>
  );
};

const WeeklyReviewPage: React.FC<WeeklyReviewPageProps> = ({
  initialWeekStart,
}) => {
  const [weekStart, setWeekStart] = useState(initialWeekStart || getWeekStart());
  const tasks = useAppStore((s) => s.tasks);
  const reflections = useAppStore((s) => s.reflections);
  const periodEnd = format(addDays(new Date(weekStart), 6), 'yyyy-MM-dd');
  const { weekTasks, completed, active, abilityPoints } = useMemo(
    () => getTaskEvidence(tasks, weekStart),
    [tasks, weekStart]
  );
  const relatedReflections = useMemo(
    () => reflections.filter((reflection) => reflection.kind !== 'weeklyReview' && isDateInWeek(weekStart, reflection.date)),
    [reflections, weekStart]
  );
  const weeklyReviews = reflections
    .filter((reflection) => reflection.kind === 'weeklyReview')
    .sort((a, b) => (b.periodStart ?? '').localeCompare(a.periodStart ?? ''));
  const existingReview = weeklyReviews.find((review) => review.periodStart === weekStart);

  return (
    <div className="workspace-page weekly-review-page">
      <section className="weekly-review-layout workspace-grid workspace-grid--weekly">
        <AsciiBox title="周页面" className="weekly-review-nav-panel">
          <div className="weekly-review-nav-content">
            <div className="weekly-review-nav-actions">
              <button
                onClick={() => setWeekStart(getPrevWeekStart(weekStart))}
                className="font-caption weekly-review-nav-button"
                style={navButtonStyle}
              >
                上一周
              </button>
              <button
                onClick={() => setWeekStart(getWeekStart())}
                className="font-caption weekly-review-nav-button"
                style={navButtonStyle}
              >
                本周
              </button>
              <button
                onClick={() => setWeekStart(getNextWeekStart(weekStart))}
                className="font-caption weekly-review-nav-button"
                style={navButtonStyle}
              >
                下一周
              </button>
            </div>

            <div className="weekly-review-history">
            {weeklyReviews.length === 0 ? (
              <div className="font-body" style={{ color: 'var(--text-muted)' }}>
                暂无周复盘
              </div>
            ) : (
              weeklyReviews.map((review) => (
                <button
                  key={review.id}
                  onClick={() => review.periodStart && setWeekStart(review.periodStart)}
                  className="font-caption weekly-review-history-button"
                  style={{
                    ...navButtonStyle,
                    width: '100%',
                    marginBottom: 'var(--space-1)',
                    color: review.periodStart === weekStart ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  }}
                >
                  {review.periodStart} - {review.periodEnd}
                </button>
              ))
            )}
            </div>
          </div>
        </AsciiBox>

        <div className="weekly-review-main-grid">
          <AsciiBox title={`${weekStart} - ${periodEnd}`} className="weekly-review-editor-box">
            <WeeklyReviewEditor
              key={`${weekStart}-${existingReview?.id ?? 'new'}`}
              periodStart={weekStart}
              periodEnd={periodEnd}
              existingReview={existingReview}
            />
          </AsciiBox>

          <AsciiBox title="本周证据" className="weekly-review-evidence-box">
            <div
              className="font-caption"
              style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}
            >
              完成 {completed.length} 项 / 未完成 {active.length} 项 / 能力加分 +{abilityPoints} / 相关反思 {relatedReflections.length} 篇
            </div>
            {relatedReflections.length > 0 && (
              <div
                className="font-caption"
                style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}
              >
                相关反思：{relatedReflections.map((reflection) => reflection.date).join('、')}
              </div>
            )}
            <div className="weekly-review-evidence-list" style={{ display: 'grid', gap: 'var(--space-1)' }}>
              {weekTasks.length === 0 ? (
                <div className="font-body" style={{ color: 'var(--text-muted)' }}>
                  本周暂无任务
                </div>
              ) : (
                weekTasks.map((task) => (
                  <div
                    key={task.id}
                    className="font-body"
                    style={{
                      borderBottom: '1px solid var(--border-primary)',
                      color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                      padding: 'var(--space-1) 0',
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    }}
                  >
                    {task.date.slice(5)} · {task.content}
                  </div>
                ))
              )}
            </div>
          </AsciiBox>
        </div>
      </section>
    </div>
  );
};

const navButtonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--border-primary)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
  padding: 'var(--space-1) var(--space-2)',
  textAlign: 'left',
};

export default WeeklyReviewPage;
