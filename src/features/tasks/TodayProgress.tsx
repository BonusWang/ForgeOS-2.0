import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import AsciiProgress from '../../components/AsciiProgress';
import { forgeCopy } from '../../copy/forge-copy';
import { resources } from '../../utils/assets';

const TodayProgress: React.FC = () => {
  const { tasks } = useAppStore();

  const today = new Date().toISOString().split('T')[0];

  const todayTasks = tasks.filter((t) => t.date === today);
  const completedCount = todayTasks.filter((t) => t.status === 'completed').length;
  const totalCount = todayTasks.length;

  // Calculate ability points earned today
  const todayPoints = tasks
    .filter((t) => t.status === 'completed' && t.completedAt?.startsWith(today))
    .reduce((sum, t) => sum + (t.abilityPoints || 0), 0);

  const allCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <div>
      <div className="font-body" style={{ marginBottom: 'var(--space-2)' }}>
        <span className="text-secondary">{forgeCopy.status.allComplete.includes('全部完成') ? '完成: ' : '完成: '}</span>
        <span style={{ color: 'var(--text-primary)' }}>
          {completedCount}/{totalCount}
        </span>
        {todayPoints > 0 && (
          <span className="font-caption" style={{ color: 'var(--accent-gold)', marginLeft: 'var(--space-4)' }}>
            {forgeCopy.status.abilityPoints}: +{todayPoints}pts
          </span>
        )}
      </div>

      {totalCount > 0 && (
        <div style={{ marginBottom: 'var(--space-2)' }}>
          <AsciiProgress current={completedCount} total={totalCount} className="today-progress-bar" />
        </div>
      )}

      {allCompleted && totalCount > 0 && (
        <div className="font-body" style={{ color: 'var(--accent-success)', marginTop: 'var(--space-2)' }}>
          [*] 全部完成
        </div>
      )}

      {totalCount === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
          <img
            src={resources.emptyState}
            className="forge-empty-state-image"
            alt="Empty state"
            style={{ width: '120px', height: 'auto', opacity: 0.7, marginBottom: 'var(--space-3)' }}
          />
          <div className="font-body" style={{ color: 'var(--text-muted)' }}>
            {forgeCopy.status.noTasksToday}
          </div>
        </div>
      )}
    </div>
  );
};

export default TodayProgress;
