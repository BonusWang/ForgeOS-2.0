import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import AsciiBox from '../../components/AsciiBox';
import { forgeCopy } from '../../copy/forge-copy';
import { resources } from '../../utils/assets';

const PrinciplesPanel: React.FC = () => {
  const { principles, updatePrinciples } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const sortedPrinciples = [...principles].sort((a, b) => a.order - b.order);

  const startEditing = () => {
    setEditText(sortedPrinciples.map((p, i) => `${i + 1}. ${p.content}`).join('\n'));
    setIsEditing(true);
  };

  const savePrinciples = () => {
    const lines = editText.split('\n').filter((l) => l.trim());
    const newPrinciples = lines.map((line, idx) => {
      const content = line.replace(/^\d+\.\s*/, '').trim();
      return {
        id: sortedPrinciples[idx]?.id || Math.random().toString(36).substring(2, 9),
        content,
        order: idx,
      };
    });
    updatePrinciples(newPrinciples);
    setIsEditing(false);
  };

  return (
    <AsciiBox title="我的原则">
      {isEditing ? (
        <div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="font-body"
            style={{
              width: '100%',
              minHeight: '100px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-2)',
              resize: 'vertical',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <button
              onClick={savePrinciples}
              className="font-caption"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                padding: 'var(--space-1) var(--space-2)',
                transition: `background-color var(--duration-instant) var(--ease-instant), color var(--duration-instant) var(--ease-instant)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--text-primary)';
                e.currentTarget.style.color = 'var(--bg-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              [ {forgeCopy.actions.save} ]
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="font-caption"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                padding: 'var(--space-1) var(--space-2)',
                transition: `background-color var(--duration-instant) var(--ease-instant), color var(--duration-instant) var(--ease-instant)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--text-primary)';
                e.currentTarget.style.color = 'var(--bg-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              [ {forgeCopy.actions.cancel} ]
            </button>
          </div>
        </div>
      ) : (
        <div>
          <ol style={{ paddingLeft: '1.2rem', margin: 0 }}>
            {sortedPrinciples.map((p) => (
              <li key={p.id} className="font-body" style={{ padding: 'var(--space-1) 0', color: 'var(--text-primary)' }}>
                {p.content}
              </li>
            ))}
          </ol>
          {sortedPrinciples.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-3) 0' }}>
              <img
                src={resources.emptyState}
                className="forge-empty-state-image"
                alt="Empty state"
                style={{ width: '80px', height: 'auto', opacity: 0.5, marginBottom: 'var(--space-2)' }}
              />
              <div className="font-body" style={{ color: 'var(--text-muted)' }}>
                {forgeCopy.emptyStates.inbox}
              </div>
            </div>
          )}
          <button
            onClick={startEditing}
            className="font-caption"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              marginTop: 'var(--space-2)',
              textTransform: 'uppercase',
              transition: `color var(--duration-instant) var(--ease-instant)`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            [{forgeCopy.actions.edit}原则]
          </button>
        </div>
      )}
    </AsciiBox>
  );
};

export default PrinciplesPanel;
