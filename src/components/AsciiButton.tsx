import React from 'react';

interface AsciiButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit';
}

const AsciiButton: React.FC<AsciiButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  style,
  type = 'button',
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case 'danger':
        return 'var(--accent-danger)';
      case 'secondary':
        return 'var(--text-secondary)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const color = getVariantColor();

  return (
    <button
      type={type}
      className={`ascii-button font-caption ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: 'var(--font-mono)',
        padding: 'var(--space-1) var(--space-2)',
        border: 'none',
        background: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        color: color,
        textTransform: 'uppercase' as const,
        transition: `background-color var(--duration-instant) var(--ease-instant), color var(--duration-instant) var(--ease-instant)`,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'var(--text-primary)';
          e.currentTarget.style.color = 'var(--bg-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = color;
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'var(--accent-gold)';
          e.currentTarget.style.color = 'var(--bg-primary)';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = 'var(--text-primary)';
          e.currentTarget.style.color = 'var(--bg-primary)';
        }
      }}
    >
      [  {children}  ]
    </button>
  );
};

export default AsciiButton;
