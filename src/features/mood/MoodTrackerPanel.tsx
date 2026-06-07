import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useMoodTrend } from '../../hooks/useMoodTrend';
import AsciiBox from '../../components/AsciiBox';
import { getTodayString } from '../../utils/date';
import type { MoodEntry } from '../../types';

const moodPointBottom = (value: number) => `${((value - 1) / 9) * 100}%`;

const MoodTrackerPanel: React.FC = () => {
  const moods = useAppStore((s) => s.moods);
  const saveMood = useAppStore((s) => s.saveMood);
  const deleteMood = useAppStore((s) => s.deleteMood);
  const today = getTodayString();
  const todayMood = moods.find((m) => m.date === today);

  return (
    <MoodTrackerForm
      key={`${today}-${todayMood?.id ?? 'new'}`}
      moods={moods}
      today={today}
      todayMood={todayMood}
      saveMood={saveMood}
      deleteMood={deleteMood}
    />
  );
};

interface MoodTrackerFormProps {
  moods: MoodEntry[];
  today: string;
  todayMood?: MoodEntry;
  saveMood: (entry: Omit<MoodEntry, 'id' | 'createdAt'>) => void;
  deleteMood: (id: string) => void;
}

const MoodTrackerForm: React.FC<MoodTrackerFormProps> = ({
  moods,
  today,
  todayMood,
  saveMood,
  deleteMood,
}) => {
  const [mood, setMood] = useState(() => todayMood?.mood ?? 5);
  const [energy, setEnergy] = useState(() => todayMood?.energy ?? 5);
  const [note, setNote] = useState(() => todayMood?.note ?? '');
  const [savedFlash, setSavedFlash] = useState(false);

  const trend = useMoodTrend(moods, today, 7);
  const hasTrendData = trend.some((d) => d.mood !== null);
  const trendColumns = `repeat(${trend.length}, minmax(0, 1fr))`;
  const hasUnsavedChanges =
    !todayMood ||
    todayMood.mood !== mood ||
    todayMood.energy !== energy ||
    todayMood.note !== note;

  const moodLabel = (value: number) => {
    if (value <= 3) return '低落';
    if (value <= 5) return '平静';
    if (value <= 7) return '不错';
    return '极好';
  };

  const handleSave = () => {
    if (!hasUnsavedChanges) return;
    saveMood({ date: today, mood, energy, note });
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  return (
    <AsciiBox title="情绪追踪" className="dashboard-status-card dashboard-status-card--mood">
      {/* Today's entry */}
      <div className="mood-today-entry" style={{ marginBottom: 'var(--space-4)' }}>
        <div
          className="font-caption mood-status-label"
          style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}
        >
          {todayMood ? '今日已记录 — 可修改' : '记录今日情绪'}
        </div>

        {/* Mood slider */}
        <div className="mood-control-group" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
            <label className="font-caption" style={{ color: 'var(--text-secondary)' }}>
              心情
            </label>
            <span className="font-mono-data" style={{ color: 'var(--accent-gold)' }}>
              {mood}/10 — {moodLabel(mood)}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={mood}
            onChange={(e) => {
              setMood(Number(e.target.value));
              setSavedFlash(false);
            }}
            style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
          />
        </div>

        {/* Energy slider */}
        <div className="mood-control-group" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
            <label className="font-caption" style={{ color: 'var(--text-secondary)' }}>
              能量
            </label>
            <span className="font-mono-data" style={{ color: 'var(--accent-success)' }}>
              {energy}/10
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={energy}
            onChange={(e) => {
              setEnergy(Number(e.target.value));
              setSavedFlash(false);
            }}
            style={{ width: '100%', accentColor: 'var(--accent-success)' }}
          />
        </div>

        {/* Note */}
        <div className="mood-note-field" style={{ marginBottom: 'var(--space-3)' }}>
          <input
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              setSavedFlash(false);
            }}
            placeholder="备注（可选）..."
            className="font-body"
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) 0',
              width: '100%',
              outline: 'none',
              caretColor: 'var(--accent-gold)',
            }}
          />
        </div>

        {/* Actions */}
        <div className="mood-actions" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="font-body"
            style={{
              background: hasUnsavedChanges ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
              border: `1px solid ${hasUnsavedChanges ? 'var(--accent-gold)' : 'var(--border-primary)'}`,
              color: hasUnsavedChanges ? 'var(--bg-primary)' : 'var(--text-muted)',
              cursor: hasUnsavedChanges ? 'pointer' : 'default',
              fontFamily: 'var(--font-mono)',
              opacity: hasUnsavedChanges ? 1 : 0.78,
              padding: 'var(--space-1) var(--space-3)',
              transition: 'all var(--duration-instant)',
            }}
          >
            {savedFlash || !hasUnsavedChanges ? '[✓ 已保存]' : todayMood ? '[保存修改]' : '[保存]'}
          </button>
          {todayMood && (
            <button
              onClick={() => deleteMood(todayMood.id)}
              className="font-caption"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-danger)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
              }}
            >
              [删除今日记录]
            </button>
          )}
        </div>
      </div>

      {/* ASCII Chart */}
      {hasTrendData && (
        <div
          className="mood-trend-section"
          style={{
            borderTop: '1px solid var(--border-primary)',
            paddingTop: 'var(--space-3)',
          }}
        >
          <div
            className="font-caption"
            style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}
          >
            近 7 天心情趋势
          </div>
          <div
            aria-label="近 7 天心情趋势图"
            style={{
              background:
                'repeating-linear-gradient(to top, transparent 0, transparent 17px, var(--border-primary) 18px)',
              borderBottom: '1px solid var(--border-primary)',
              display: 'grid',
              gridTemplateColumns: trendColumns,
              height: 88,
              marginBottom: 'var(--space-2)',
              padding: 'var(--space-2) 0',
            }}
          >
            {trend.map((d) => (
              <div
                key={d.date}
                style={{
                  minWidth: 0,
                  position: 'relative',
                }}
              >
                {d.mood !== null && (
                  <span
                    title={`${d.date} 心情 ${d.mood}/10`}
                    style={{
                      background: 'var(--text-secondary)',
                      borderRadius: '50%',
                      bottom: moodPointBottom(d.mood),
                      display: 'block',
                      height: 6,
                      left: '50%',
                      position: 'absolute',
                      transform: 'translate(-50%, 50%)',
                      width: 6,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div
            className="font-caption"
            style={{
              color: 'var(--text-muted)',
              display: 'grid',
              gridTemplateColumns: trendColumns,
              marginTop: 'var(--space-1)',
            }}
          >
            {trend.map((d) => (
              <span key={d.date} style={{ textAlign: 'center' }}>
                {d.date.slice(5)}
              </span>
            ))}
          </div>
        </div>
      )}
    </AsciiBox>
  );
};

export default MoodTrackerPanel;
