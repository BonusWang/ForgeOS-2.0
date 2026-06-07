import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import AsciiBox from '../../components/AsciiBox';
import { forgeCopy } from '../../copy/forge-copy';
import AsciiProgress from '../../components/AsciiProgress';

const AbilityManagementPanel: React.FC = () => {
  const { abilities, addAbility, deleteAbility, updateAbility, addAbilityTask, removeAbilityTask } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMaxScore, setNewMaxScore] = useState(100);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newTaskContent, setNewTaskContent] = useState('');
  const [newTaskPoints, setNewTaskPoints] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editMaxScore, setEditMaxScore] = useState(100);

  const handleAddAbility = () => {
    if (newName.trim()) {
      addAbility({ name: newName.trim(), currentScore: 0, maxScore: newMaxScore, tasks: [] });
      setNewName('');
      setNewMaxScore(100);
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

  const startEditing = (ability: typeof abilities[0]) => {
    setEditingId(ability.id);
    setEditName(ability.name);
    setEditMaxScore(ability.maxScore);
  };

  const saveEdit = (id: string) => {
    if (editName.trim()) {
      updateAbility(id, { name: editName.trim(), maxScore: editMaxScore });
    }
    setEditingId(null);
  };

  return (
    <AsciiBox title="能力训练">
      {abilities.length === 0 && (
        <div className="font-body" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
          {forgeCopy.emptyStates.abilityManagement}
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
                value={editMaxScore}
                onChange={(e) => setEditMaxScore(Number(e.target.value))}
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
              {ability.tasks.map((task) => (
                <div key={task.id} className="font-caption" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    - {task.content} ({task.points}pts)
                  </span>
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
              ))}
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
            value={newMaxScore}
            onChange={(e) => setNewMaxScore(Number(e.target.value))}
            placeholder="满分"
            className="font-caption"
            style={{
              width: '70px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
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
            onClick={() => { setIsAdding(false); setNewName(''); setNewMaxScore(100); }}
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

export default AbilityManagementPanel;
