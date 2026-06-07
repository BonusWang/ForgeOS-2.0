import React, { useState } from 'react';

interface InspirationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inspiration: { content: string; source?: string; tags: string[] }) => void;
}

const InspirationForm: React.FC<InspirationFormProps> = ({ isOpen, onClose, onSave }) => {
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [tagInput, setTagInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!content.trim()) return;
    const tags = tagInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    onSave({ content: content.trim(), source: source.trim() || undefined, tags });
    setContent('');
    setSource('');
    setTagInput('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          padding: 'var(--space-5)',
          width: '400px',
          maxWidth: '90vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div
          className="font-h2"
          style={{
            color: 'var(--accent-gold)',
            marginBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--border-primary)',
            paddingBottom: 'var(--space-2)',
          }}
        >
          [ 记录灵感 ]
        </div>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label className="font-caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
            内容
          </label>
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="突然想到..."
            className="font-body"
            rows={3}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-2)',
              width: '100%',
              outline: 'none',
              caretColor: 'var(--accent-gold)',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: 'var(--space-3)' }}>
          <label className="font-caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
            来源（可选）
          </label>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="书/文章/对话..."
            className="font-body"
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) 0',
              width: '100%',
              outline: 'none',
              caretColor: 'var(--accent-gold)',
            }}
          />
        </div>

        <div style={{ marginBottom: 'var(--space-4)' }}>
          <label className="font-caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>
            标签（用逗号分隔）
          </label>
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="设计, 写作, 产品..."
            className="font-body"
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) 0',
              width: '100%',
              outline: 'none',
              caretColor: 'var(--accent-gold)',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="font-body"
            style={{
              background: 'none',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-3)',
            }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="font-body"
            style={{
              background: 'var(--accent-gold)',
              border: '1px solid var(--accent-gold)',
              color: 'var(--bg-primary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) var(--space-3)',
            }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspirationForm;
