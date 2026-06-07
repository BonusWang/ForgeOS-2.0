import React, { useState } from 'react';
import type { HabitColor, HabitFrequency } from '../../types';

interface HabitEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: { name: string; color: HabitColor; frequency: HabitFrequency; targetDays: number }) => void;
}

const COLOR_MAP: Record<HabitColor, string> = {
  gold: 'var(--accent-gold)',
  green: 'var(--accent-success)',
  blue: '#5a7a9a',
  red: 'var(--accent-danger)',
  purple: '#7a5a9a',
};

const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  daily: '每天',
  weekdays: '工作日',
  weekends: '周末',
  weekly: '每周一次',
};

const HabitEditor: React.FC<HabitEditorProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState<HabitColor>('gold');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [targetDays, setTargetDays] = useState(7);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, frequency, targetDays });
    setName('');
    setColor('gold');
    setFrequency('daily');
    setTargetDays(7);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          padding: 'var(--space-5)',
          width: '360px',
          maxWidth: '90vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="font-h2"
          style={{
            color: 'var(--accent-gold)',
            marginBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-primary)',
            paddingBottom: 'var(--space-2)',
          }}
        >
          [ 新建习惯 ]
        </div>

        {/* Name */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label className="font-caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
            习惯名称
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="例如：早起、阅读 30 分钟..."
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
            }}
          />
        </div>

        {/* Color */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label className="font-caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
            颜色标记
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {(Object.keys(COLOR_MAP) as HabitColor[]).map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: COLOR_MAP[c],
                  border: color === c ? '2px solid var(--text-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  opacity: color === c ? 1 : 0.6,
                  transition: 'opacity var(--duration-instant)',
                }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label className="font-caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
            频率
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {(Object.keys(FREQUENCY_LABELS) as HabitFrequency[]).map((f) => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className="font-caption"
                style={{
                  background: frequency === f ? 'var(--accent-gold)' : 'transparent',
                  border: '1px solid var(--border-primary)',
                  color: frequency === f ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  padding: 'var(--space-1) var(--space-2)',
                  transition: 'all var(--duration-instant)',
                }}
              >
                {FREQUENCY_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        {/* Target Days */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label className="font-caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
            每周目标天数: {targetDays}
          </label>
          <input
            type="range"
            min={1}
            max={7}
            value={targetDays}
            onChange={(e) => setTargetDays(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--accent-gold)',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="font-body"
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
            onClick={handleSubmit}
            className="font-body"
            style={{
              background: 'var(--accent-gold)',
              border: '1px solid var(--accent-gold)',
              color: 'var(--bg-primary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-3)',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitEditor;
