import React, { useState, useRef, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { useAppStore } from '../store/useAppStore';

interface MiniCalendarProps {
  year?: number;
  month?: number;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ year, month }) => {
  const { reflections, calendarEvents, tasks, addCalendarEvent, deleteCalendarEvent, addTask, habits, toggleHabitCompletion } = useAppStore();

  const now = new Date();
  const currentYear = year ?? now.getFullYear();
  const currentMonth = month ?? now.getMonth();
  const baseDate = new Date(currentYear, currentMonth, 1);

  const monthStart = startOfMonth(baseDate);
  const monthEnd = endOfMonth(baseDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const [popupDate, setPopupDate] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [newEventContent, setNewEventContent] = useState('');
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupDate(null);
      }
    };
    if (popupDate) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [popupDate]);

  const getReflectionStatus = (date: Date): 'has' | 'none' | 'future' => {
    if (date > now) return 'future';
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasReflection = reflections.some((r) => r.date === dateStr);
    return hasReflection ? 'has' : 'none';
  };

  const getEventsForDate = (dateStr: string) => {
    return calendarEvents.filter((e) => e.date === dateStr);
  };

  const getTasksForDate = (dateStr: string) => {
    return tasks.filter((t) => t.date === dateStr);
  };

  const getHabitsForDate = (dateStr: string) => {
    return habits.map((h) => ({
      habit: h,
      completed: h.completions[dateStr] ?? false,
    }));
  };

  const handleDayClick = (dateStr: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const popupHeight = 340; // maxHeight of popup
    const popupWidth = 260;
    const gap = 4;

    let top = rect.bottom + gap;
    // If popup would overflow bottom of viewport, show it above the cell instead
    if (rect.bottom + popupHeight + gap > window.innerHeight) {
      top = rect.top - popupHeight - gap;
    }
    if (top < gap) {
      top = gap;
    }

    let left = rect.left;
    // Keep popup within horizontal viewport bounds
    if (left + popupWidth > window.innerWidth) {
      left = window.innerWidth - popupWidth - gap;
    }
    if (left < gap) {
      left = gap;
    }

    setPopupPosition({ top, left });
    setPopupDate(dateStr);
    setNewEventContent('');
  };

  const handleAddEvent = () => {
    if (popupDate && newEventContent.trim()) {
      addCalendarEvent(popupDate, newEventContent.trim());
      setNewEventContent('');
    }
  };

  const handleAddTask = () => {
    if (popupDate && newEventContent.trim()) {
      addTask(newEventContent.trim(), popupDate);
      setNewEventContent('');
    }
  };

  const handleEventKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddEvent();
    if (e.key === 'Escape') setPopupDate(null);
  };

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  const popupEvents = popupDate ? getEventsForDate(popupDate) : [];
  const popupTasks = popupDate ? getTasksForDate(popupDate) : [];
  const popupHabits = popupDate ? getHabitsForDate(popupDate) : [];

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="font-h3"
        style={{
          textAlign: 'center',
          marginBottom: 'var(--space-2)',
          color: 'var(--text-primary)',
        }}
      >
        {format(baseDate, 'yyyy年M月')}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px',
          textAlign: 'center',
        }}
      >
        {weekDays.map((d) => (
          <div key={d} className="font-caption" style={{ color: 'var(--text-muted)', padding: 'var(--space-1)' }}>
            {d}
          </div>
        ))}

        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const status = getReflectionStatus(day);
          const isToday = isSameDay(day, now);
          const isCurrentMonth = isSameMonth(day, baseDate);
          const events = getEventsForDate(dateStr);
          const dateTasks = getTasksForDate(dateStr);
          const hasEvents = events.length > 0;
          const hasTasks = dateTasks.filter((t) => t.status === 'active').length > 0;
          const hasHabits = habits.length > 0;

          let display = format(day, 'd');
          let color: string = 'var(--text-secondary)';
          let bg: string = 'transparent';
          let fontWeight: number = 400;

          if (!isCurrentMonth) {
            color = 'var(--bg-tertiary)';
          } else if (isToday) {
            bg = 'var(--accent-gold)';
            color = 'var(--bg-primary)';
            fontWeight = 600;
          } else if (status === 'has') {
            display = '☑';
            color = 'var(--accent-success)';
          } else if (status === 'none') {
            display = '✗';
            color = 'var(--accent-danger)';
          }

          return (
            <div
              key={day.toISOString()}
              className="font-mono-data"
              onClick={(e) => handleDayClick(dateStr, e)}
              title={isCurrentMonth ? `${dateStr} — 点击查看/添加事项` : undefined}
              style={{
                padding: 'var(--space-1)',
                color,
                backgroundColor: bg,
                fontWeight,
                cursor: isCurrentMonth ? 'pointer' : 'default',
                position: 'relative',
                transition: 'background-color var(--duration-instant)',
              }}
              onMouseEnter={(e) => {
                if (isCurrentMonth && !isToday) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (isCurrentMonth && !isToday) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {display}
              {(hasEvents || hasTasks || hasHabits) && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '2px',
                  }}
                >
                  {hasTasks && (
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '0',
                        backgroundColor: 'var(--accent-gold)',
                        display: 'inline-block',
                      }}
                    />
                  )}
                  {hasEvents && (
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '0',
                        backgroundColor: 'var(--accent-success)',
                        display: 'inline-block',
                      }}
                    />
                  )}
                  {hasHabits && (
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '0',
                        backgroundColor: 'var(--text-secondary)',
                        display: 'inline-block',
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="font-caption" style={{ marginTop: 'var(--space-2)', color: 'var(--text-muted)' }}>
        图例: ☑已写 ✗未写 <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: 'var(--accent-gold)', verticalAlign: 'middle', marginLeft: '4px' }} />任务 <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: 'var(--accent-success)', verticalAlign: 'middle', marginLeft: '4px' }} />事项 <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: 'var(--text-secondary)', verticalAlign: 'middle', marginLeft: '4px' }} />习惯
      </div>

      {/* Popup */}
      {popupDate && (
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            width: '260px',
            maxHeight: '340px',
            overflowY: 'auto',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            padding: 'var(--space-3)',
            zIndex: 10000,
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          <div
            className="font-h3"
            style={{
              color: 'var(--accent-gold)',
              marginBottom: 'var(--space-3)',
              borderBottom: '1px solid var(--border-primary)',
              paddingBottom: 'var(--space-2)',
            }}
          >
            {popupDate}
          </div>

          {/* Existing events */}
          {popupEvents.length > 0 && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div className="font-caption" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                事项:
              </div>
              {popupEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="font-body"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-1) 0',
                    borderBottom: '1px solid var(--border-primary)',
                  }}
                >
                  <span style={{ color: 'var(--text-primary)', flex: 1 }}>{ev.content}</span>
                  <button
                    onClick={() => deleteCalendarEvent(ev.id)}
                    className="font-caption"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-danger)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      padding: '0 var(--space-1)',
                    }}
                  >
                    [x]
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Existing habits for this date */}
          {popupHabits.length > 0 && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div className="font-caption" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                习惯:
              </div>
              {popupHabits.map(({ habit, completed }) => (
                <div
                  key={habit.id}
                  className="font-body"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-1) 0',
                    borderBottom: '1px solid var(--border-primary)',
                  }}
                >
                  <span
                    style={{
                      color: completed ? 'var(--accent-success)' : 'var(--text-primary)',
                      textDecoration: completed ? 'line-through' : 'none',
                      flex: 1,
                    }}
                  >
                    {completed ? '☑' : '☐'} {habit.name}
                  </span>
                  <button
                    onClick={() => popupDate && toggleHabitCompletion(habit.id, popupDate)}
                    className="font-caption"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: completed ? 'var(--accent-danger)' : 'var(--accent-success)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      padding: '0 var(--space-1)',
                    }}
                  >
                    {completed ? '[取消]' : '[打卡]'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Existing tasks for this date */}
          {popupTasks.length > 0 && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div className="font-caption" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                任务:
              </div>
              {popupTasks.map((t) => (
                <div
                  key={t.id}
                  className="font-body"
                  style={{
                    padding: 'var(--space-1) 0',
                    borderBottom: '1px solid var(--border-primary)',
                    color: t.status === 'completed' ? 'var(--text-secondary)' : 'var(--text-primary)',
                    textDecoration: t.status === 'completed' ? 'line-through' : 'none',
                  }}
                >
                  {t.status === 'completed' ? '☑' : '☐'} {t.content}
                </div>
              ))}
            </div>
          )}

          {/* Add new */}
          <div>
            <input
              autoFocus
              value={newEventContent}
              onChange={(e) => setNewEventContent(e.target.value)}
              onKeyDown={handleEventKeyDown}
              placeholder="添加内容..."
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
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                onClick={handleAddEvent}
                className="font-caption"
                style={{
                  flex: 1,
                  background: 'none',
                  border: '1px solid var(--accent-success)',
                  color: 'var(--accent-success)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  padding: 'var(--space-1) var(--space-2)',
                  transition: 'background-color var(--duration-instant), color var(--duration-instant)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-success)';
                  e.currentTarget.style.color = 'var(--bg-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--accent-success)';
                }}
              >
                加事项
              </button>
              <button
                onClick={handleAddTask}
                className="font-caption"
                style={{
                  flex: 1,
                  background: 'none',
                  border: '1px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  padding: 'var(--space-1) var(--space-2)',
                  transition: 'background-color var(--duration-instant), color var(--duration-instant)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
                  e.currentTarget.style.color = 'var(--bg-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--accent-gold)';
                }}
              >
                加任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiniCalendar;
