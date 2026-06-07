import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAsciiRadar } from '../../hooks/useAsciiRadar';
import AsciiBox from '../../components/AsciiBox';
import { forgeCopy } from '../../copy/forge-copy';

const AsciiRadar: React.FC = () => {
  const { abilities } = useAppStore();
  const { gridLines, points } = useAsciiRadar(abilities, 12);

  if (abilities.length === 0) {
    return (
      <AsciiBox title="能力雷达">
        <div className="font-body" style={{ color: 'var(--text-muted)' }}>
          {forgeCopy.emptyStates.radar}
        </div>
      </AsciiBox>
    );
  }

  const asciiArt = gridLines.map((row) => row.join('')).join('\n');

  return (
    <AsciiBox title="能力雷达">
      <pre
        className="font-mono-data"
        style={{
          color: 'var(--accent-success)',
          lineHeight: '1.2',
          margin: 0,
          overflow: 'auto',
        }}
      >
        {asciiArt}
      </pre>
      <div style={{ marginTop: 'var(--space-2)' }}>
        {points.map((p, i) => (
          <div key={i} className="font-caption" style={{ color: 'var(--text-secondary)' }}>
            {p.label}: {p.value}/{p.max}
          </div>
        ))}
      </div>
    </AsciiBox>
  );
};

export default AsciiRadar;
