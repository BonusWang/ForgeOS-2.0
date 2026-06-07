import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { forgeCopy } from '../../copy/forge-copy';
import ReflectionForm from './ReflectionForm';
import TemplateEditor from './TemplateEditor';

const ReflectionQuickEntry: React.FC = () => {
  const { reflections, getDefaultTemplate } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayReflection = reflections.find((r) => r.date === today);
  const defaultTemplate = getDefaultTemplate();

  // Find control value for display
  const getControlDisplay = () => {
    if (!todayReflection || !defaultTemplate) return null;
    const controlQ = defaultTemplate.questions.find((q) => q.label.includes('掌控'));
    if (!controlQ) return null;
    const val = todayReflection.answers[controlQ.id];
    return val !== undefined ? `${val}/10` : null;
  };

  const controlDisplay = getControlDisplay();

  if (todayReflection && !showForm) {
    return (
      <div>
        <div className="font-body" style={{ color: 'var(--accent-success)', marginBottom: 'var(--space-2)' }}>
          {forgeCopy.status.reflectionDone}
        </div>
        {controlDisplay && (
          <div className="font-caption" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
            {forgeCopy.status.controlLevel}: {controlDisplay}
          </div>
        )}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={() => setShowForm(true)}
            className="font-caption"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
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
            [{forgeCopy.actions.viewEdit}]
          </button>
          <button
            onClick={() => setTemplateEditorOpen(true)}
            className="font-caption"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
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
            [{forgeCopy.actions.manageTemplate}]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showForm && todayReflection ? (
        <ReflectionForm
          date={today}
          existingReflection={todayReflection}
          onSave={() => setShowForm(false)}
        />
      ) : (
        <>
          <ReflectionForm
            date={today}
            onSave={() => setShowForm(false)}
          />
          <div style={{ marginTop: 'var(--space-3)' }}>
            <button
              onClick={() => setTemplateEditorOpen(true)}
              className="font-caption"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
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
              [管理模板]
            </button>
          </div>
        </>
      )}

      <TemplateEditor
        isOpen={templateEditorOpen}
        onClose={() => setTemplateEditorOpen(false)}
      />
    </div>
  );
};

export default ReflectionQuickEntry;
