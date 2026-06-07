import React, { useMemo } from 'react';
import AsciiBox from '../../components/AsciiBox';
import { useAppStore } from '../../store/useAppStore';

const GrowthEvidenceArchive: React.FC = () => {
  const tasks = useAppStore((s) => s.tasks);
  const allReflections = useAppStore((s) => s.reflections);
  const objectives = useAppStore((s) => s.objectives);
  const abilities = useAppStore((s) => s.abilities);

  const weeklyReviews = useMemo(
    () => allReflections.filter((item) => item.kind === 'weeklyReview'),
    [allReflections]
  );
  const reflections = useMemo(
    () => allReflections.filter((item) => item.kind !== 'weeklyReview'),
    [allReflections]
  );

  const evidence = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.status === 'completed');
    const completedObjectives = objectives.filter(
      (objective) => objective.keyResults.length > 0 && objective.keyResults.every((kr) => kr.completed)
    );
    const abilityScore = abilities.reduce((sum, ability) => sum + ability.currentScore, 0);
    const recentReflections = [...reflections]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 3);

    return {
      completedTasks,
      completedObjectives,
      abilityScore,
      recentReflections,
    };
  }, [abilities, objectives, reflections, tasks]);

  return (
    <AsciiBox title="成长证据档案" className="growth-evidence-archive">
      <div className="growth-evidence-metrics">
        <div>
          <span className="font-caption">完成任务</span>
          <strong>{evidence.completedTasks.length}</strong>
        </div>
        <div>
          <span className="font-caption">周复盘</span>
          <strong>{weeklyReviews.length}</strong>
        </div>
        <div>
          <span className="font-caption">完成目标</span>
          <strong>{evidence.completedObjectives.length}</strong>
        </div>
        <div>
          <span className="font-caption">能力积累</span>
          <strong>{evidence.abilityScore}</strong>
        </div>
      </div>

      <div className="growth-evidence-list">
        {evidence.recentReflections.length === 0 ? (
          <div className="font-body" style={{ color: 'var(--text-muted)' }}>
            暂无可归档反思
          </div>
        ) : (
          evidence.recentReflections.map((reflection) => (
            <div key={reflection.id} className="font-body growth-evidence-row">
              {reflection.date} · {reflection.tags.slice(0, 2).join(' / ') || '每日反思'}
            </div>
          ))
        )}
      </div>
    </AsciiBox>
  );
};

export default GrowthEvidenceArchive;
