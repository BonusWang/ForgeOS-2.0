import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import AsciiBox from '../../components/AsciiBox';
import { forgeCopy } from '../../copy/forge-copy';
import { resources } from '../../utils/assets';

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const OKRPanel: React.FC = () => {
  const {
    objectives,
    inboxItems,
    addObjective,
    deleteObjective,
    updateObjectiveTitle,
    addKeyResult,
    deleteKeyResult,
    toggleKeyResult,
    updateKeyResult,
    collectToInbox,
    removeFromInbox,
    toggleInboxItem,
    addTask,
  } = useAppStore();

  const currentMonth = getCurrentMonth();
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [isAddingObj, setIsAddingObj] = useState(false);
  const [newObjTitle, setNewObjTitle] = useState('');
  const [addingKRFor, setAddingKRFor] = useState<string | null>(null);
  const [newKRContent, setNewKRContent] = useState('');
  const [editingObjId, setEditingObjId] = useState<string | null>(null);
  const [editObjTitle, setEditObjTitle] = useState('');
  const [editingKR, setEditingKR] = useState<{ objId: string; krId: string } | null>(null);
  const [editKRContent, setEditKRContent] = useState('');

  const currentObjectives = objectives.filter((o) => o.period === currentMonth);

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddObjective = () => {
    if (newObjTitle.trim()) {
      addObjective(newObjTitle.trim(), currentMonth);
      setNewObjTitle('');
      setIsAddingObj(false);
    }
  };

  const handleAddKR = (objId: string) => {
    if (newKRContent.trim()) {
      addKeyResult(objId, newKRContent.trim());
      setNewKRContent('');
      setAddingKRFor(null);
    }
  };

  const startEditObj = (obj: typeof currentObjectives[0]) => {
    setEditingObjId(obj.id);
    setEditObjTitle(obj.title);
  };

  const saveEditObj = (id: string) => {
    if (editObjTitle.trim()) {
      updateObjectiveTitle(id, editObjTitle.trim());
    }
    setEditingObjId(null);
  };

  const startEditKR = (objId: string, krId: string, content: string) => {
    setEditingKR({ objId, krId });
    setEditKRContent(content);
  };

  const saveEditKR = () => {
    if (editingKR && editKRContent.trim()) {
      updateKeyResult(editingKR.objId, editingKR.krId, editKRContent.trim());
    }
    setEditingKR(null);
  };

  const sendToBacklog = (item: typeof inboxItems[0]) => {
    addTask(item.content, 'BACKLOG', item.abilityId, item.abilityPoints);
    removeFromInbox(item.id);
  };

  const completedKRCount = currentObjectives.reduce(
    (sum, obj) => sum + obj.keyResults.filter((kr) => kr.completed).length,
    0
  );
  const totalKRCount = currentObjectives.reduce((sum, obj) => sum + obj.keyResults.length, 0);

  const isInInbox = (krId: string) => inboxItems.some((item) => item.id === krId);

  return (
    <AsciiBox title={`月度 OKR (${currentMonth})`} className="okr-panel">
      <div className="font-caption" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
        KR 完成: {completedKRCount}/{totalKRCount} | 待澄清: {inboxItems.length} 项
      </div>

      {/* Objectives */}
      {currentObjectives.length === 0 && !isAddingObj && (
        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          <img
            src={resources.emptyState}
            className="forge-empty-state-image"
            alt="Empty state"
            style={{ width: '120px', height: 'auto', opacity: 0.7, marginBottom: 'var(--space-3)' }}
          />
          <div className="font-body" style={{ color: 'var(--text-muted)' }}>
            {forgeCopy.emptyStates.okr}
          </div>
        </div>
      )}

      {currentObjectives.map((obj) => (
        <div
          key={obj.id}
          style={{
            border: '1px solid var(--border-primary)',
            marginBottom: 'var(--space-2)',
            backgroundColor: 'var(--bg-primary)',
          }}
        >
          {/* Objective Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-1) var(--space-2)',
              cursor: 'pointer',
              borderBottom: collapsedIds.has(obj.id) ? 'none' : '1px solid var(--border-primary)',
              transition: 'background-color var(--duration-instant)',
            }}
            onClick={() => toggleCollapse(obj.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
            }}
          >
            <span className="font-caption" style={{ color: 'var(--text-muted)' }}>
              {collapsedIds.has(obj.id) ? '[+]' : '[-]'}
            </span>
            {editingObjId === obj.id ? (
              <input
                autoFocus
                value={editObjTitle}
                onChange={(e) => setEditObjTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEditObj(obj.id);
                  if (e.key === 'Escape') setEditingObjId(null);
                }}
                onBlur={() => saveEditObj(obj.id)}
                onClick={(e) => e.stopPropagation()}
                className="font-h3"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  fontFamily: 'var(--font-mono)',
                  padding: 'var(--space-1)',
                  outline: 'none',
                  textTransform: 'uppercase',
                }}
              />
            ) : (
              <span
                className="font-h3"
                style={{ flex: 1, color: 'var(--accent-gold)' }}
              >
                {obj.title}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); startEditObj(obj); }}
              className="font-caption"
              style={{
                background: 'none', border: 'none', color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'var(--font-mono)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              [✎]
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteObjective(obj.id); }}
              className="font-caption"
              style={{
                background: 'none', border: 'none', color: 'var(--accent-danger)',
                cursor: 'pointer', fontFamily: 'var(--font-mono)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent-danger)'; }}
            >
              [x]
            </button>
          </div>

          {/* Key Results */}
          {!collapsedIds.has(obj.id) && (
            <div style={{ padding: 'var(--space-1) var(--space-2)' }}>
              {obj.keyResults.length === 0 && (
                <div className="font-caption" style={{ color: 'var(--text-muted)', padding: 'var(--space-1) 0' }}>
                  {forgeCopy.emptyStates.keyResults}
                </div>
              )}
              {obj.keyResults.map((kr) => (
                <div
                  key={kr.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-1) 0',
                    borderBottom: '1px solid var(--border-primary)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={kr.completed}
                    onChange={() => toggleKeyResult(obj.id, kr.id)}
                    style={{ cursor: 'pointer', accentColor: 'var(--accent-success)' }}
                  />
                  {editingKR?.krId === kr.id ? (
                    <input
                      autoFocus
                      value={editKRContent}
                      onChange={(e) => setEditKRContent(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEditKR(); if (e.key === 'Escape') setEditingKR(null); }}
                      onBlur={() => saveEditKR()}
                      className="font-body"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--accent-gold)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        padding: 'var(--space-1)',
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <span
                      className="font-body"
                      style={{
                        flex: 1,
                        textDecoration: kr.completed ? 'line-through' : 'none',
                        color: kr.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                      }}
                    >
                      {kr.content}
                    </span>
                  )}
                  <button
                    onClick={() => collectToInbox(obj.id, kr.id)}
                    disabled={isInInbox(kr.id)}
                    className="font-caption"
                    title={isInInbox(kr.id) ? '已在待澄清' : '加入待澄清'}
                    style={{
                      background: 'none', border: 'none',
                      color: isInInbox(kr.id) ? 'var(--text-muted)' : 'var(--accent-success)',
                      cursor: isInInbox(kr.id) ? 'default' : 'pointer',
                      fontFamily: 'var(--font-mono)',
                      opacity: isInInbox(kr.id) ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isInInbox(kr.id)) e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isInInbox(kr.id)) e.currentTarget.style.color = 'var(--accent-success)';
                    }}
                  >
                    [+]
                  </button>
                  <button
                    onClick={() => startEditKR(obj.id, kr.id, kr.content)}
                    className="font-caption"
                    style={{
                      background: 'none', border: 'none', color: 'var(--text-secondary)',
                      cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    [✎]
                  </button>
                  <button
                    onClick={() => deleteKeyResult(obj.id, kr.id)}
                    className="font-caption"
                    style={{
                      background: 'none', border: 'none', color: 'var(--accent-danger)',
                      cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent-danger)'; }}
                  >
                    [x]
                  </button>
                </div>
              ))}

              {/* Add KR */}
              {addingKRFor === obj.id ? (
                <input
                  autoFocus
                  value={newKRContent}
                  onChange={(e) => setNewKRContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddKR(obj.id);
                    if (e.key === 'Escape') { setNewKRContent(''); setAddingKRFor(null); }
                  }}
                  onBlur={() => { if (!newKRContent.trim()) setAddingKRFor(null); }}
                  placeholder="输入关键结果..."
                  className="font-body"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--accent-gold)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    padding: 'var(--space-1) 0',
                    width: '100%',
                    marginTop: 'var(--space-1)',
                    outline: 'none',
                  }}
                />
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setAddingKRFor(obj.id); }}
                  className="font-caption"
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    marginTop: 'var(--space-1)', textTransform: 'uppercase',
                    transition: 'color var(--duration-instant)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  [+ 添加关键结果]
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add Objective */}
      {isAddingObj ? (
        <input
          autoFocus
          value={newObjTitle}
          onChange={(e) => setNewObjTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddObjective();
            if (e.key === 'Escape') { setNewObjTitle(''); setIsAddingObj(false); }
          }}
          onBlur={() => { if (!newObjTitle.trim()) setIsAddingObj(false); }}
          placeholder="输入目标名称..."
          className="font-body"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid var(--accent-gold)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            padding: 'var(--space-1) 0',
            width: '100%',
            marginTop: 'var(--space-1)',
            outline: 'none',
          }}
        />
      ) : (
        <button
          onClick={() => setIsAddingObj(true)}
          className="font-caption"
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'var(--font-mono)',
            marginTop: 'var(--space-2)', textTransform: 'uppercase',
            transition: 'color var(--duration-instant)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          [+ 添加目标]
        </button>
      )}

      {/* Inbox (待澄清) */}
      <div
        className="okr-inbox-section"
        style={{ marginTop: 'var(--space-4)', borderTop: '2px dashed var(--border-primary)', paddingTop: 'var(--space-3)' }}
      >
        <div className="font-h3" style={{ color: 'var(--accent-gold)', marginBottom: 'var(--space-2)' }}>
          待澄清 (已选 KR)
        </div>
        {inboxItems.length === 0 ? (
          <div className="okr-empty-inbox" style={{ textAlign: 'center', padding: 'var(--space-3) 0' }}>
            <img
              src={resources.emptyState}
              className="forge-empty-state-image"
              alt="Empty state"
              style={{ width: '80px', height: 'auto', opacity: 0.5, marginBottom: 'var(--space-2)' }}
            />
            <div className="font-caption" style={{ color: 'var(--text-muted)' }}>
              {forgeCopy.emptyStates.inbox}
            </div>
          </div>
        ) : (
          <div>
            {inboxItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-1) 0',
                  borderBottom: '1px solid var(--border-primary)',
                }}
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleInboxItem(item.id)}
                  style={{ cursor: 'pointer', accentColor: 'var(--accent-success)' }}
                />
                <span
                  className="font-body"
                  style={{
                    flex: 1,
                    textDecoration: item.completed ? 'line-through' : 'none',
                    color: item.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                  }}
                >
                  {item.content}
                </span>
                <span
                  className="font-caption"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.abilityId ? (
                    <>← {item.abilityName} +{item.abilityPoints}pts</>
                  ) : (
                    <>← {item.objectiveTitle}</>
                  )}
                </span>
                <button
                  onClick={() => sendToBacklog(item)}
                  className="font-caption"
                  title="转为待安排任务"
                  style={{
                    background: 'none', border: '1px solid var(--border-primary)',
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', padding: '0 var(--space-1)',
                    transition: 'all var(--duration-instant)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'var(--border-primary)';
                  }}
                >
                  → 看板
                </button>
                <button
                  onClick={() => removeFromInbox(item.id)}
                  className="font-caption"
                  style={{
                    background: 'none', border: 'none', color: 'var(--accent-danger)',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent-danger)'; }}
                >
                  [x]
                </button>
              </div>
            ))}
            <div className="font-caption" style={{ color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
              点击 [→ 看板] 将 KR 转为待安排任务，然后可在 Dashboard 拖拽到具体日期
            </div>
          </div>
        )}
      </div>
    </AsciiBox>
  );
};

export default OKRPanel;
