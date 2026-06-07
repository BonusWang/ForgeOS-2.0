import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { ReflectionQuestion } from '../../types';

interface TemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUESTION_TYPE_LABELS: Record<ReflectionQuestion['type'], string> = {
  text: '文本',
  number: '数字',
  select: '选择',
};

const createQuestionId = () => `q-${Math.random().toString(36).substring(2, 7)}`;

const TemplateEditor: React.FC<TemplateEditorProps> = ({ isOpen, onClose }) => {
  const templates = useAppStore((s) => s.reflectionTemplates);
  const addTemplate = useAppStore((s) => s.addTemplate);
  const updateTemplate = useAppStore((s) => s.updateTemplate);
  const deleteTemplate = useAppStore((s) => s.deleteTemplate);
  const setDefaultTemplate = useAppStore((s) => s.setDefaultTemplate);
  const abilities = useAppStore((s) => s.abilities);

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newQuestion, setNewQuestion] = useState<Partial<ReflectionQuestion>>({
    type: 'text',
    required: false,
  });
  const [optionsInput, setOptionsInput] = useState('');

  if (!isOpen) return null;

  const editingTemplate = templates.find((t) => t.id === editingTemplateId);

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) return;
    const id = addTemplate({
      name: newTemplateName.trim(),
      isDefault: false,
      questions: [],
    });
    setEditingTemplateId(id);
    setNewTemplateName('');
  };

  const handleAddQuestion = () => {
    if (!editingTemplate || !newQuestion.label?.trim()) return;
    const question: ReflectionQuestion = {
      id: createQuestionId(),
      label: newQuestion.label.trim(),
      type: newQuestion.type || 'text',
      required: newQuestion.required || false,
      min: newQuestion.type === 'number' ? newQuestion.min : undefined,
      max: newQuestion.type === 'number' ? newQuestion.max : undefined,
      options: newQuestion.type === 'select' && optionsInput
        ? optionsInput.split(/[,，]/).map((o) => o.trim()).filter(Boolean)
        : undefined,
      abilityLink: newQuestion.abilityLink,
    };
    updateTemplate(editingTemplate.id, {
      questions: [...editingTemplate.questions, question],
    });
    setNewQuestion({ type: 'text', required: false });
    setOptionsInput('');
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!editingTemplate) return;
    updateTemplate(editingTemplate.id, {
      questions: editingTemplate.questions.filter((q) => q.id !== questionId),
    });
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
          width: '480px',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
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
          [ 反思模板 ]
        </div>

        {/* Template list */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div className="font-caption" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
            现有模板
          </div>
          {templates.map((t) => (
            <div
              key={t.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-2)',
                borderBottom: '1px solid var(--border-primary)',
                backgroundColor: editingTemplateId === t.id ? 'var(--bg-tertiary)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span className="font-body" style={{ color: 'var(--text-primary)' }}>
                  {t.name}
                </span>
                {t.isDefault && (
                  <span
                    className="font-caption"
                    style={{
                      color: 'var(--accent-gold)',
                      border: '1px solid var(--accent-gold)',
                      padding: '1px var(--space-1)',
                    }}
                  >
                    默认
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {!t.isDefault && (
                  <button
                    onClick={() => setDefaultTemplate(t.id)}
                    className="font-caption"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    [设为默认]
                  </button>
                )}
                <button
                  onClick={() => setEditingTemplateId(t.id)}
                  className="font-caption"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-gold)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  [编辑]
                </button>
                {t.id !== 'obstacle-breakthrough' && (
                  <button
                    onClick={() => deleteTemplate(t.id)}
                    className="font-caption"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-danger)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    [删除]
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* New template */}
        <div style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
          <input
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="新模板名称..."
            className="font-body"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--accent-gold)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1) 0',
              outline: 'none',
              caretColor: 'var(--accent-gold)',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateTemplate();
            }}
          />
          <button
            onClick={handleCreateTemplate}
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
            新建
          </button>
        </div>

        {/* Edit questions */}
        {editingTemplate && (
          <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: 'var(--space-4)' }}>
            <div className="font-h3" style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
              编辑: {editingTemplate.name}
            </div>

            {/* Question list */}
            {editingTemplate.questions.map((q, idx) => (
              <div
                key={q.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-1) 0',
                  borderBottom: '1px solid var(--border-primary)',
                }}
              >
                <div>
                  <span className="font-body" style={{ color: 'var(--text-primary)' }}>
                    {idx + 1}. {q.label}
                  </span>
                  <span className="font-caption" style={{ color: 'var(--text-muted)', marginLeft: 'var(--space-2)' }}>
                    {QUESTION_TYPE_LABELS[q.type]}
                    {q.required ? ' · 必填' : ''}
                    {q.abilityLink ? ` · 关联能力` : ''}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="font-caption"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-danger)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  [x]
                </button>
              </div>
            ))}

            {/* Add question */}
            <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <input
                value={newQuestion.label || ''}
                onChange={(e) => setNewQuestion((p) => ({ ...p, label: e.target.value }))}
                placeholder="问题描述..."
                className="font-body"
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  padding: 'var(--space-1) 0',
                  outline: 'none',
                  caretColor: 'var(--accent-gold)',
                }}
              />

              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                {(Object.keys(QUESTION_TYPE_LABELS) as ReflectionQuestion['type'][]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewQuestion((p) => ({ ...p, type: t }))}
                    className="font-caption"
                    style={{
                      background: newQuestion.type === t ? 'var(--accent-gold)' : 'transparent',
                      border: '1px solid var(--border-primary)',
                      color: newQuestion.type === t ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-mono)',
                      padding: '2px var(--space-2)',
                    }}
                  >
                    {QUESTION_TYPE_LABELS[t]}
                  </button>
                ))}
                <button
                  onClick={() => setNewQuestion((p) => ({ ...p, required: !p.required }))}
                  className="font-caption"
                  style={{
                    background: newQuestion.required ? 'var(--accent-success)' : 'transparent',
                    border: '1px solid var(--border-primary)',
                    color: newQuestion.required ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px var(--space-2)',
                  }}
                >
                  {newQuestion.required ? '必填' : '可选'}
                </button>
              </div>

              {newQuestion.type === 'number' && (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <input
                    type="number"
                    placeholder="最小值"
                    value={newQuestion.min ?? ''}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, min: e.target.value ? Number(e.target.value) : undefined }))}
                    className="font-caption"
                    style={{
                      width: '80px',
                      background: 'transparent',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      padding: 'var(--space-1)',
                    }}
                  />
                  <input
                    type="number"
                    placeholder="最大值"
                    value={newQuestion.max ?? ''}
                    onChange={(e) => setNewQuestion((p) => ({ ...p, max: e.target.value ? Number(e.target.value) : undefined }))}
                    className="font-caption"
                    style={{
                      width: '80px',
                      background: 'transparent',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      padding: 'var(--space-1)',
                    }}
                  />
                </div>
              )}

              {newQuestion.type === 'select' && (
                <input
                  value={optionsInput}
                  onChange={(e) => setOptionsInput(e.target.value)}
                  placeholder="选项，用逗号分隔"
                  className="font-caption"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    padding: 'var(--space-1) 0',
                    outline: 'none',
                  }}
                />
              )}

              {abilities.length > 0 && (
                <select
                  value={newQuestion.abilityLink || ''}
                  onChange={(e) => setNewQuestion((p) => ({ ...p, abilityLink: e.target.value || undefined }))}
                  className="font-caption"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    padding: 'var(--space-1)',
                  }}
                >
                  <option value="">-- 不关联能力 --</option>
                  {abilities.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleAddQuestion}
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
                添加问题
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 'var(--space-4)', textAlign: 'right' }}>
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
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;
