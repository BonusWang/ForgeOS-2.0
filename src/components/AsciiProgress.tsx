import React from 'react';

interface AsciiProgressProps {
  current: number;
  total: number;
  width?: number;
  showPercent?: boolean;
  className?: string;
}

const AsciiProgress: React.FC<AsciiProgressProps> = ({
  current,
  total,
  width = 20,
  showPercent = true,
  className = '',
}) => {
  const percent = total <= 0 ? 0 : Math.min(100, Math.max(0, (current / total) * 100));
  const label = showPercent ? `${Math.round(percent)}%` : `${current}/${total}`;
  const progressStyle = {
    '--ascii-progress-width': `${width}ch`,
  } as React.CSSProperties;

  return (
    <span className={`ascii-progress font-mono-data ${className}`} style={progressStyle}>
      <span className="ascii-progress-frame" aria-hidden="true">
        <span className="ascii-progress-bracket">[</span>
        <span className="ascii-progress-track">
          <span className="ascii-progress-fill" style={{ width: `${percent}%` }} />
        </span>
        <span className="ascii-progress-bracket">]</span>
      </span>
      <span style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
    </span>
  );
};

export default AsciiProgress;
