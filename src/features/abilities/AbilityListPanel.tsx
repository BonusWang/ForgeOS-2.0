import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import AsciiBox from '../../components/AsciiBox';
import AsciiProgress from '../../components/AsciiProgress';
import { forgeCopy } from '../../copy/forge-copy';
import { resources } from '../../utils/assets';

const AbilityListPanel: React.FC = () => {
  const { abilities } = useAppStore();

  if (abilities.length === 0) {
    return (
      <AsciiBox title="能力分布">
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

  return (
    <AsciiBox title="能力分布">
      {abilities.map((ability) => (
        <div
          key={ability.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-1) 0',
            borderBottom: '1px solid var(--border-primary)',
          }}
        >
          <span className="font-body" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            {ability.name}
          </span>
          <AsciiProgress current={ability.currentScore} total={ability.maxScore} width={14} />
        </div>
      ))}
    </AsciiBox>
  );
};

export default AbilityListPanel;
