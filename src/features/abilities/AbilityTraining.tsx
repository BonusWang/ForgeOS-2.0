import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import AsciiBox from '../../components/AsciiBox';
import AsciiProgress from '../../components/AsciiProgress';
import { forgeCopy } from '../../copy/forge-copy';
import { resources } from '../../utils/assets';

const AbilityTraining: React.FC = () => {
  const { abilities, inboxItems, addAbility, deleteAbility, updateAbility, addAbilityTask, removeAbilityTask, incrementScore, collectAbilityTaskToInbox } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCurrentScore, setNewCurrentScore] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCurrentScore, setEditCurrentScore] = useState(0);

  const handleAddAbility = () => {
    if (newName.trim()) {
      addAbility({ name: newName.trim(), currentScore: newCurrentScore, maxScore: 100, tasks: [] });
      setNewName('');
      setNewCurrentScore(0);
      setIsAdding(false);
    }
  };

  const handleAddTask = (abilityId: string) => {
    if (newTaskContent.trim()) {
      addAbilityTask(abilityId, { content: newTaskContent.trim(), points: newTaskPoints });
      setNewTaskContent('');
      setNewTaskPoints(10);
    }
  };

  const handleCompleteTask = (abilityId: string, points: number) => {
    incrementScore(abilityId, points);
  };

  const startEditing = (ability: typeof abilities[0]) => {
    setEditingId(ability.id);
    setEditName(ability.name);
    setEditCurrentScore(ability.currentScore);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      updateAbility(id, { name: editName.trim(), currentScore: editCurrentScore });
    }
    setEditingId(null);
  };

  return (
    <AsciiBox title="能力训练">
      {abilities.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          <img
            src={resources.emptyState}
            className="forge-empty-state-image"
            alt="Empty state"
            style={{ width: '120px', height: 'auto', opacity: 0.7, marginBottom: 'var(--space-3)' }}
          />
          <div className="font-body" style={{ color: 'var(--text-muted)' }}>
            {forgeCopy.emptyStates.abilityTracker}
          </div>
        </div>
      )}

      {abilities.map((ability) => (
        <div
          key={ability.id}
          style={{
            border: '1px solid var(--border-primary)',
            marginBottom: 'var(--space-2)',
            padding: 'var(--space-2)',
            backgroundColor: 'var(--bg-tertiary)',
          }}
        >
          {editingId === ability.id ? (
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(ability.id); }}
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
                  caretColor: 'var(--accent-gold)',
                }}
              />
              <input
                type="number"
                value={editCurrentScore}
                onChange={(e) => setEditCurrentScore(Number(e.target.value))}
                placeholder="得分"
                className="font-caption"
                style={{
                  width: '60px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  padding: 'var(--space-1)',
                }}
              />
              <button
                onClick={() => saveEdit(ability.id)}
                className="font-caption"
                style={{
                  background: 'none', border: 'none', color: 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: 'var(--font-mono)',
                  transition: `color var(--duration-instant) var(--ease-instant)`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-success)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                [✓]
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="font-body" style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                  {ability.name}
                </span>
                <span className="font-caption" style={{ color: 'var(--text-muted)', marginLeft: 'var(--space-2)' }}>
                  {ability.currentScore}/{ability.maxScore}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                <button
                  onClick={() => startEditing(ability)}
                  className="font-caption"
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    transition: `color var(--duration-instant) var(--ease-instant)`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  [✎]
                </button>
                <button
                  onClick={() => deleteAbility(ability.id)}
                  className="font-caption"
                  style={{
                    background: 'none', border: 'none', color: 'var(--accent-danger)',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    transition: `color var(--duration-instant) var(--ease-instant)`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent-danger)'; }}
                >
                  [x]
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 'var(--space-1)' }}>
            <AsciiProgress current={ability.currentScore} total={ability.maxScore} width={16} />
          </div>

          <button
            onClick={() => setExpandedId(expandedId === ability.id ? null : ability.id)}
            className="font-caption"
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'var(--font-mono)',
              marginTop: 'var(--space-1)', width: '100%', textAlign: 'left',
              transition: `color var(--duration-instant) var(--ease-instant)`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {expandedId === ability.id ? '[-] 收起子任务' : '[+] 查看子任务'}
          </button>

          {expandedId === ability.id && (
            <div style={{ marginTop: 'var(--space-1)', paddingLeft: 'var(--space-2)' }}>
              {ability.tasks.map((task) => {
                const isInInbox = inboxItems.some((item) => item.id === task.id);
                return (
                <div
                  key={task.id}
                  className="font-caption"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '2px 0',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>
                    - {task.content} ({task.points}pts)
                  </span>
                  <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                    <button
                      onClick={() => handleCompleteTask(ability.id, task.points)}
                      className="font-caption"
                      style={{
                        background: 'none',
                        border: '1px solid var(--accent-success)',
                        color: 'var(--accent-success)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-mono)',
                        padding: '1px 6px',
                        fontSize: '10px',
                        borderRadius: '2px',
                        transition: `all var(--duration-instant) var(--ease-instant)`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-success)';
                        e.currentTarget.style.color = 'var(--bg-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'none';
                        e.currentTarget.style.color = 'var(--accent-success)';
                      }}
                    >
                      完成
                    </button>
                    <button
                      onClick={() => collectAbilityTaskToInbox(ability.id, task.id)}
                      disabled={isInInbox}
                      className="font-caption"
                      title={isInInbox ? '已在待澄清' : '加入待澄清'}
                      style={{
                        background: 'none', border: 'none',
                        color: isInInbox ? 'var(--text-muted)' : 'var(--accent-success)',
                        cursor: isInInbox ? 'default' : 'pointer',
                        fontFamily: 'var(--font-mono)',
                        opacity: isInInbox ? 0.5 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isInInbox) e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isInInbox) e.currentTarget.style.color = 'var(--accent-success)';
                      }}
                    >
                      [+]
                    </button>
                    <button
                      onClick={() => removeAbilityTask(ability.id, task.id)}
                      className="font-caption"
                      style={{
                        background: 'none', border: 'none', color: 'var(--accent-danger)',
                        cursor: 'pointer', fontFamily: 'var(--font-mono)',
                        transition: `color var(--duration-instant) var(--ease-instant)`,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent-danger)'; }}
                    >
                      [x]
                    </button>
                  </div>
                </div>
                );
              })}
              {ability.tasks.length === 0 && (
                <div className="font-caption" style={{ color: 'var(--text-muted)' }}>{forgeCopy.emptyStates.keyResults}</div>
              )}
              <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
                <input
                  value={newTaskContent}
                  onChange={(e) => setNewTaskContent(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask(ability.id); }}
                  placeholder="子任务名称"
                  className="font-caption"
                  style={{
                    flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                    padding: 'var(--space-1)',
                  }}
                />
                <input
                  type="number"
                  value={newTaskPoints}
                  onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                  placeholder="分值"
                  className="font-caption"
                  style={{
                    width: '50px', background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
                    padding: 'var(--space-1)',
                  }}
                />
                <button
                  onClick={() => handleAddTask(ability.id)}
                  className="font-caption"
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', fontFamily: 'var(--font-mono)',
                    transition: `color var(--duration-instant) var(--ease-instant)`,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-success)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  [+]
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {isAdding ? (
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddAbility(); }}
            placeholder="能力名称"
            className="font-body"
            style={{
              flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid var(--accent-gold)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1)', outline: 'none', caretColor: 'var(--accent-gold)',
            }}
          />
          <input
            type="number"
            value={newCurrentScore}
            onChange={(e) => setNewCurrentScore(Number(e.target.value))}
            placeholder="当前得分"
            className="font-caption"
            style={{
              width: '80px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)', fontFamily: 'var(--font-mono)',
              padding: 'var(--space-1)',
            }}
          />
          <button
            onClick={handleAddAbility}
            className="font-caption"
            style={{
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'var(--font-mono)',
              transition: `color var(--duration-instant) var(--ease-instant)`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-success)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            [✓]
          </button>
          <button
            onClick={() => { setIsAdding(false); setNewName(''); setNewCurrentScore(0); }}
            className="font-caption"
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'var(--font-mono)',
              transition: `color var(--duration-instant) var(--ease-instant)`,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            [x]
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="font-caption"
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontFamily: 'var(--font-mono)',
            marginTop: 'var(--space-2)', width: '100%', textAlign: 'left',
            textTransform: 'uppercase',
            transition: `color var(--duration-instant) var(--ease-instant)`,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          [+ 添加能力]
        </button>
      )}
    </AsciiBox>
  );
};

export default AbilityTraining;
