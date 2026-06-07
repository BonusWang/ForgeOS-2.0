import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { forgeCopy } from '../../copy/forge-copy';
import { calculateStreak, calculateWeekProgress } from '../../hooks/useHabitStreak';
import HabitEditor from './HabitEditor';
import AsciiBox from '../../components/AsciiBox';
import type { HabitColor } from '../../types';

const COLOR_CSS: Record<HabitColor, string> = {
  gold: 'var(--accent-gold)',
  green: 'var(--accent-success)',
  blue: '#5a7a9a',
  red: 'var(--accent-danger)',
  purple: '#7a5a9a',
};

const getTodayString = () => new Date().toISOString().split('T')[0];
const getWeekStart = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const HabitTrackerPanel: React.FC = () => {
  const habits = useAppStore((s) => s.habits);
  const toggleHabitCompletion = useAppStore((s) => s.toggleHabitCompletion);
  const addHabit = useAppStore((s) => s.addHabit);
  const deleteHabit = useAppStore((s) => s.deleteHabit);

  const [editorOpen, setEditorOpen] = useState(false);

  const today = getTodayString();
  const weekStart = getWeekStart();

  const getWeekdayLabels = () => {
    const labels: string[] = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      labels.push(d.toISOString().split('T')[0]);
    }
    return labels;
  };

  const weekdayLabels = getWeekdayLabels();
  const shortDayNames = ['一', '二', '三', '四', '五', '六', '日'];

  const renderAsciiProgress = (completed: number, target: number) => {
    const filled = Math.round((completed / target) * 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${completed}/${target}`;
  };

  return (
    <>
      <AsciiBox title="习惯追踪">
        {habits.length === 0 ? (
          <div
            className="font-body"
            style={{
              color: 'var(--text-secondary)',
              textAlign: 'center',
              padding: 'var(--space-4)',
            }}
          >
            <p>{forgeCopy.emptyStates.habitTracker}</p>
            <p className="font-caption" style={{ marginTop: 'var(--space-2)' }}>
              点击下方的 [+ 添加习惯] 开始填补人生空白
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {habits.map((habit) => {
              const isCompletedToday = habit.completions[today] ?? false;
              const streak = calculateStreak(habit, today);
              const { completed, target } = calculateWeekProgress(habit, weekStart);

              return (
                <div
                  key={habit.id}
                  style={{
                    borderBottom: '1px solid var(--border-primary)',
                    paddingBottom: 'var(--space-3)',
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          backgroundColor: COLOR_CSS[habit.color],
                          display: 'inline-block',
                        }}
                      />
                      <span className="font-body" style={{ color: 'var(--text-primary)' }}>
                        {habit.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      {streak > 0 && (
                        <span
                          className="font-caption"
                          style={{ color: 'var(--accent-gold)' }}
                        >
                          🔥 {streak}
                        </span>
                      )}
                      <button
                        onClick={() => toggleHabitCompletion(habit.id, today)}
                        className="font-h2"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isCompletedToday ? 'var(--accent-success)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                          padding: '0',
                          transition: 'color var(--duration-instant)',
                        }}
                        title={isCompletedToday ? '取消打卡' : '今日打卡'}
                      >
                        {isCompletedToday ? '[✓]' : '[ ]'}
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
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

                  {/* Week grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '4px',
                      textAlign: 'center',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {shortDayNames.map((name) => (
                      <div key={name} className="font-caption" style={{ color: 'var(--text-muted)' }}>
                        {name}
                      </div>
                    ))}
                    {weekdayLabels.map((dateStr) => {
                      const completed = habit.completions[dateStr] ?? false;
                      const isTodayCell = dateStr === today;
                      return (
                        <div
                          key={dateStr}
                          className="font-mono-data"
                          style={{
                            padding: '2px',
                            color: completed ? COLOR_CSS[habit.color] : 'var(--text-secondary)',
                            backgroundColor: isTodayCell ? 'var(--bg-tertiary)' : 'transparent',
                            fontWeight: isTodayCell ? 600 : 400,
                          }}
                        >
                          {completed ? '●' : '○'}
                        </div>
                      );
                    })}
                  </div>

                  {/* Week progress */}
                  <div
                    className="font-caption"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {renderAsciiProgress(completed, target)}
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
            [+ 添加习惯]
          </button>
        </div>
      </AsciiBox>

      <HabitEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSave={(habit) => addHabit(habit)}
      />
    </>
  );
};

export default HabitTrackerPanel;
