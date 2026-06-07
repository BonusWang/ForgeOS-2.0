import React, { useState } from 'react';
import AsciiBox from '../../components/AsciiBox';
import { systemCopy } from '../../copy/system-copy';

const ritualOrder = ['morning', 'daytime', 'evening', 'weekend', 'monthEnd'] as const;

const UsageRitualPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AsciiBox title={systemCopy.ritual.title}>
      <div className="usage-ritual-panel">
        <div className="usage-ritual-header">
          <div className="font-caption" style={{ color: 'var(--text-muted)' }}>
            {systemCopy.ritual.collapsedSummary}
          </div>
          <button
            type="button"
            className="usage-ritual-toggle font-caption btn-invert"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((current) => !current)}
          >
            [ {isOpen ? systemCopy.ritual.collapseButton : systemCopy.ritual.expandButton} ]
          </button>
        </div>

        {isOpen && (
          <div className="usage-ritual-list">
            {ritualOrder.map((key) => {
              const step = systemCopy.ritual.steps[key];
              return (
                <div className="usage-ritual-step" key={key}>
                  <span className="font-caption usage-ritual-label">{step.label}</span>
                  <span className="font-caption usage-ritual-text">{step.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        .usage-ritual-panel {
          display: grid;
          gap: var(--space-3);
        }

        .usage-ritual-header {
          align-items: start;
          display: grid;
          gap: var(--space-2);
          grid-template-columns: minmax(0, 1fr) auto;
        }

        .usage-ritual-toggle {
          background: none;
          border: 1px solid var(--border-primary);
          color: var(--text-secondary);
          cursor: pointer;
          font-family: var(--font-mono);
          padding: var(--space-1) var(--space-3);
          white-space: nowrap;
        }

        .usage-ritual-list {
          display: grid;
          gap: var(--space-2);
        }

        .usage-ritual-step {
          border: 1px solid var(--border-primary);
          display: grid;
          gap: var(--space-2);
          grid-template-columns: 64px minmax(0, 1fr);
          padding: var(--space-2);
        }

        .usage-ritual-label {
          color: var(--accent-gold);
        }

        .usage-ritual-text {
          color: var(--text-secondary);
          overflow-wrap: anywhere;
        }

        @media (max-width: 767px) {
          .usage-ritual-header,
          .usage-ritual-step {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AsciiBox>
  );
};

export default UsageRitualPanel;
