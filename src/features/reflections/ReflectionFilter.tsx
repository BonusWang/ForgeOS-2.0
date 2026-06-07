import React from 'react';

interface ReflectionFilterProps {
  tags: string[];
  currentTag: string;
  onTagChange: (tag: string) => void;
  sortOrder: 'newest' | 'oldest';
  onSortChange: (order: 'newest' | 'oldest') => void;
}

const ReflectionFilter: React.FC<ReflectionFilterProps> = ({
  tags,
  currentTag,
  onTagChange,
  sortOrder,
  onSortChange,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-2)',
        padding: 'var(--space-2)',
        borderBottom: '1px solid var(--border-primary)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
        <FilterButton active={currentTag === 'all'} onClick={() => onTagChange('all')}>
          全部
        </FilterButton>
        {tags.map((tag) => (
          <FilterButton
            key={tag}
            active={currentTag === tag}
            onClick={() => onTagChange(tag)}
          >
            {tag}
          </FilterButton>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
        <FilterButton active={sortOrder === 'newest'} onClick={() => onSortChange('newest')}>
          最新
        </FilterButton>
        <FilterButton active={sortOrder === 'oldest'} onClick={() => onSortChange('oldest')}>
          最早
        </FilterButton>
      </div>
    </div>
  );
};

const FilterButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="font-caption"
      style={{
        background: active ? 'var(--text-primary)' : 'var(--bg-tertiary)',
        color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--text-primary)' : 'var(--border-primary)'}`,
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        padding: 'var(--space-1) var(--space-2)',
        transition: `background-color var(--duration-instant) var(--ease-instant), color var(--duration-instant) var(--ease-instant), border-color var(--duration-instant) var(--ease-instant)`,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'var(--border-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border-primary)';
        }
      }}
    >
      {children}
    </button>
  );
};

export default ReflectionFilter;
