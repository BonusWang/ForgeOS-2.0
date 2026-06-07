import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useAppStore } from '../../store/useAppStore';
import type { InboxItem } from '../../types';

interface OKRInboxItemRowProps {
  item: InboxItem;
}

const OKRInboxItemRow: React.FC<OKRInboxItemRowProps> = ({ item }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `inbox-${item.id}`,
  });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
    position: 'relative',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="okr-inbox-item"
    >
      <span className="font-body" style={{ flex: 1 }}>
        {item.content}
        {item.abilityId && item.abilityPoints && (
          <span className="font-caption" style={{ color: 'var(--accent-gold)', marginLeft: 'var(--space-2)' }}>
            [{item.abilityName} +{item.abilityPoints}]
          </span>
        )}
      </span>
      <span className="font-caption" style={{ color: 'var(--text-muted)' }}>
        {item.abilityId ? (
          <>← {item.abilityName}</>
        ) : item.objectiveTitle ? (
          <>← {item.objectiveTitle}</>
        ) : (
          <>← 待澄清</>
        )}
      </span>
      <style>{`
        .okr-inbox-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 0 var(--space-2);
          margin-bottom: var(--space-1);
          border: 1px dashed var(--border-primary);
          background-color: var(--bg-primary);
          cursor: grab;
          line-height: 28px;
          transition: background-color var(--duration-instant), border-color var(--duration-instant);
        }
        .okr-inbox-item:hover {
          background-color: var(--bg-tertiary);
          border-color: var(--accent-gold);
        }
        .okr-inbox-item:active {
          cursor: grabbing;
        }
      `}</style>
    </div>
  );
};

const OKRInboxColumn: React.FC = () => {
  const inboxItems = useAppStore((s) => s.inboxItems);

  if (inboxItems.length === 0) return null;

  return (
    <div
      className="okr-inbox-column"
      style={{
        border: '1px dashed var(--accent-gold)',
        backgroundColor: 'var(--bg-secondary)',
        minWidth: '160px',
        flex: '0 0 160px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          padding: 'var(--space-2) var(--space-3)',
          borderBottom: '1px solid var(--border-primary)',
          textAlign: 'center',
        }}
      >
        <div className="font-h3" style={{ color: 'var(--accent-gold)' }}>
          待澄清
        </div>
        <div className="font-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
          拖到日期列，或在待澄清入口处理
        </div>
      </div>

      <div style={{ flex: 1, padding: 'var(--space-2) var(--space-3)', minHeight: '80px' }}>
        {inboxItems.map((item) => (
          <OKRInboxItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default OKRInboxColumn;
