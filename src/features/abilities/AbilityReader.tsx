import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import AsciiBox from '../../components/AsciiBox';
import { forgeCopy } from '../../copy/forge-copy';
import { resources } from '../../utils/assets';

const AbilityReader: React.FC = () => {
  const { abilities } = useAppStore();

  if (abilities.length === 0) {
    return (
      <AsciiBox title="能力阅读">
        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          <img
            src={resources.emptyState}
            className="forge-empty-state-image"
            alt="Empty state"
            style={{ width: '120px', height: 'auto', opacity: 0.7, marginBottom: 'var(--space-3)' }}
          />
          <div className="font-body" style={{ color: 'var(--text-muted)' }}>
            {forgeCopy.emptyStates.abilityTracker}
          </div>
        </div>
      </AsciiBox>
    );
  }

  const size = 280;
  const center = size / 2;
  const maxRadius = size * 0.32;
  const count = abilities.length;
  const levels = 4;

  // Compute polygon points for each ability
  const points = abilities.map((ability, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const ratio = ability.maxScore > 0 ? ability.currentScore / ability.maxScore : 0;
    const r = maxRadius * ratio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      label: ability.name,
      value: ability.currentScore,
      max: ability.maxScore,
      angle,
    };
  });

  // Label positions (slightly outside the outer ring)
  const labelRadius = maxRadius + 28;
  const labels = abilities.map((ability, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
      label: ability.name,
      value: ability.currentScore,
      max: ability.maxScore,
    };
  });

  // Concentric polygon paths
  const gridPolygons: string[] = [];
  for (let level = 1; level <= levels; level++) {
    const lr = (maxRadius * level) / levels;
    const polyPoints: string[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const x = center + lr * Math.cos(angle);
      const y = center + lr * Math.sin(angle);
      polyPoints.push(`${x},${y}`);
    }
    gridPolygons.push(polyPoints.join(' '));
  }

  // Axis lines from center to outer ring
  const axes = abilities.map((_, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    return {
      x2: center + maxRadius * Math.cos(angle),
      y2: center + maxRadius * Math.sin(angle),
    };
  });

  // Ability polygon path
  const abilityPolygon = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <AsciiBox title="能力阅读">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
          {/* Grid polygons */}
          {gridPolygons.map((d, i) => (
            <polygon
              key={`grid-${i}`}
              points={d}
              fill="none"
              stroke="var(--border-primary)"
              strokeWidth="1"
              opacity={0.6}
            />
          ))}

          {/* Axes */}
          {axes.map((axis, i) => (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={axis.x2}
              y2={axis.y2}
              stroke="var(--border-primary)"
              strokeWidth="1"
              opacity={0.5}
            />
          ))}

          {/* Ability filled polygon */}
          <polygon
            points={abilityPolygon}
            fill="var(--accent-success)"
            fillOpacity={0.25}
            stroke="var(--accent-success)"
            strokeWidth="2"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <circle
              key={`pt-${i}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--accent-gold)"
              stroke="var(--bg-primary)"
              strokeWidth="1.5"
            />
          ))}

          {/* Labels */}
          {labels.map((l, i) => (
            <text
              key={`lbl-${i}`}
              x={l.x}
              y={l.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-caption"
              style={{
                fontSize: '10px',
                fill: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {l.label}
            </text>
          ))}
        </svg>

        {/* Legend */}
        <div
          style={{
            marginTop: 'var(--space-2)',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--space-1) var(--space-4)',
            width: '100%',
          }}
        >
          {labels.map((l, i) => (
            <div
              key={`legend-${i}`}
              className="font-caption"
              style={{
                color: 'var(--text-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 'var(--space-2)',
              }}
            >
              <span>{l.label}</span>
              <span style={{ color: 'var(--accent-gold)' }}>
                {l.value}/{l.max}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AsciiBox>
  );
};

export default AbilityReader;
