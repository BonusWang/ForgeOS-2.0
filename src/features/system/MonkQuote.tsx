import React, { useState } from 'react';
import AsciiBox from '../../components/AsciiBox';
import { getDailyQuote, type Quote } from '../../copy/monkQuotes';
import { systemCopy } from '../../copy/system-copy';

const LEVEL_COLORS: Record<number, string> = {
  1: 'var(--text-secondary)',
  2: 'var(--accent-gold)',
  3: 'var(--accent-danger)',
};

const MonkQuote: React.FC = () => {
  const [quote] = useState<Quote>(() => getDailyQuote());

  return (
    <AsciiBox title={systemCopy.quoteTitle}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <div
          className="font-body"
          style={{
            color: LEVEL_COLORS[quote.level] ?? 'var(--text-secondary)',
            fontStyle: 'italic',
            lineHeight: 1.8,
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          “{quote.text}”
        </div>
        <div
          className="font-caption"
          style={{
            color: 'var(--text-muted)',
            textAlign: 'right',
            userSelect: 'none',
          }}
        >
          —— Forge-OS
        </div>
      </div>
    </AsciiBox>
  );
};

export default MonkQuote;
