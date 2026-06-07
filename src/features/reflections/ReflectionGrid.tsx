import React, { useState } from 'react';
import ReflectionCard from './ReflectionCard';
import ReflectionFilter from './ReflectionFilter';
import { useAppStore } from '../../store/useAppStore';
import { forgeCopy } from '../../copy/forge-copy';
import type { Reflection } from '../../types';
import { resources } from '../../utils/assets';

interface ReflectionGridProps {
  onViewDetail?: (reflection: Reflection) => void;
}

const ITEMS_PER_PAGE = 12;

const ReflectionGrid: React.FC<ReflectionGridProps> = ({ onViewDetail }) => {
  const { reflections } = useAppStore();
  const [filterTag, setFilterTag] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(0);

  const allTags = Array.from(
    new Set(reflections.flatMap((r) => r.tags))
  );

  let filtered = [...reflections];

  if (filterTag !== 'all') {
    filtered = filtered.filter((r) => r.tags.includes(filterTag));
  }

  filtered.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <div>
      <ReflectionFilter
        tags={allTags}
        currentTag={filterTag}
        onTagChange={(tag) => {
          setFilterTag(tag);
          setPage(0);
        }}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />

      <div
        className="reflection-card-grid"
        data-card-count={paginated.length}
        style={{
          display: 'grid',
          gridTemplateColumns:
            paginated.length <= 2
              ? 'repeat(auto-fit, minmax(260px, 360px))'
              : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-3)',
          alignItems: 'start',
        }}
      >
        {paginated.map((r) => (
          <ReflectionCard
            key={r.id}
            reflection={r}
            onClick={onViewDetail ? () => onViewDetail(r) : undefined}
          />
        ))}
      </div>

      {paginated.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
          <img
            src={resources.emptyState}
            className="forge-empty-state-image"
            alt="Empty state"
            style={{ width: '120px', height: 'auto', opacity: 0.7, marginBottom: 'var(--space-3)' }}
          />
          <div className="font-body" style={{ color: 'var(--text-muted)' }}>
            {forgeCopy.emptyStates.reflectionLibrary}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="font-caption"
            style={{
              background: 'none',
              border: 'none',
              color: page === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-2)',
              transition: `color var(--duration-instant) var(--ease-instant)`,
            }}
            onMouseEnter={(e) => {
              if (page !== 0) e.currentTarget.style.color = 'var(--accent-gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = page === 0 ? 'var(--text-muted)' : 'var(--text-primary)';
            }}
          >
            [←]
          </button>
          <span className="font-caption" style={{ color: 'var(--text-secondary)', padding: 'var(--space-1) var(--space-2)' }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="font-caption"
            style={{
              background: 'none',
              border: 'none',
              color: page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-2)',
              transition: `color var(--duration-instant) var(--ease-instant)`,
            }}
            onMouseEnter={(e) => {
              if (page < totalPages - 1) e.currentTarget.style.color = 'var(--accent-gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = page >= totalPages - 1 ? 'var(--text-muted)' : 'var(--text-primary)';
            }}
          >
            [→]
          </button>
        </div>
      )}
    </div>
  );
};

export default ReflectionGrid;
