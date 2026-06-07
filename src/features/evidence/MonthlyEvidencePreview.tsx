import React, { useMemo } from 'react';
import AsciiBox from '../../components/AsciiBox';
import { useAppStore } from '../../store/useAppStore';

const MonthlyEvidencePreview: React.FC = () => {
  const tasks = useAppStore((s) => s.tasks);
  const reflections = useAppStore((s) => s.reflections);
  const objectives = useAppStore((s) => s.objectives);

  const month = new Date().toISOString().slice(0, 7);
  const weeklyReviews = useMemo(
    () => reflections.filter((item) => item.kind === 'weeklyReview'),
    [reflections]
  );
  const summary = useMemo(() => {
    const completedTasks = tasks.filter(
      (task) => task.date.startsWith(month) && task.status === 'completed'
    );
    const monthlyReviews = weeklyReviews.filter((review) => review.periodStart?.startsWith(month));
    const completedKeyResults = objectives.flatMap((objective) =>
      objective.keyResults.filter((kr) => kr.completed)
    );

    return {
      completedTasks,
      monthlyReviews,
      completedKeyResults,
    };
  }, [month, objectives, tasks, weeklyReviews]);

  return (
    <AsciiBox title="本月证据" className="monthly-evidence-preview">
      <div className="growth-evidence-metrics">
        <div>
          <span className="font-caption">完成任务</span>
          <strong>{summary.completedTasks.length}</strong>
        </div>
        <div>
          <span className="font-caption">周复盘</span>
          <strong>{summary.monthlyReviews.length}</strong>
        </div>
        <div>
          <span className="font-caption">完成 KR</span>
          <strong>{summary.completedKeyResults.length}</strong>
        </div>
      </div>
      <div className="font-caption" style={{ color: 'var(--text-secondary)' }}>
        本入口只从当前任务、周复盘与目标进展派生，为月度成长报告预留。
      </div>
    </AsciiBox>
  );
};

export default MonthlyEvidencePreview;
