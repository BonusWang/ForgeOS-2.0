import React from 'react';
import TaskBoard from '../features/tasks/TaskBoard';
import TodayProgress from '../features/tasks/TodayProgress';
import EntertainmentPanel from '../features/entertainment/EntertainmentPanel';
import PrinciplesPanel from '../features/principles/PrinciplesPanel';
import HabitTrackerPanel from '../features/habits/HabitTrackerPanel';
import MoodTrackerPanel from '../features/mood/MoodTrackerPanel';
import TimeBlockPanel from '../features/timeblocks/TimeBlockPanel';
import InspirationVaultPanel from '../features/inspiration/InspirationVaultPanel';
import ReflectionQuickEntry from '../features/reflections/ReflectionQuickEntry';
import DesktopCaptureInbox from '../features/capture/DesktopCaptureInbox';
import MonkQuote from '../features/system/MonkQuote';
import MiniCalendar from '../components/MiniCalendar';
import AsciiBox from '../components/AsciiBox';
import { useAppStore } from '../store/useAppStore';
import { useSarcasticMonologue } from '../hooks/useSarcasticMonologue';
import type { ModuleId } from '../types';

const Dashboard: React.FC = () => {
  const enabledModules = useAppStore((s) => s.enabledModules);
  const isEnabled = (id: ModuleId) => enabledModules.includes(id);
  const { text: monologue } = useSarcasticMonologue();

  return (
    <div className="workspace-page dashboard-page">
      {/* Sarcastic Monologue Banner */}
      {monologue && (
        <div
          className="font-caption"
          style={{
            textAlign: 'center',
            padding: 'var(--space-2) var(--space-4)',
            marginBottom: 'var(--space-4)',
            color: 'var(--text-muted)',
            borderBottom: '1px dashed var(--border-primary)',
            fontStyle: 'italic',
          }}
        >
          {monologue}
        </div>
      )}

      <div className="dashboard-command-grid">
        <div className="dashboard-primary-canvas">
          <DesktopCaptureInbox />

          <section className="dashboard-board-section" aria-label="本周任务看板">
            <TaskBoard />
          </section>

          <section className="dashboard-today-strip" aria-label="今日执行">
            <AsciiBox title="今日进度" className="dashboard-status-card dashboard-status-card--progress">
              <TodayProgress />
            </AsciiBox>

            <AsciiBox title="每日反思" className="dashboard-status-card dashboard-status-card--reflection">
              <ReflectionQuickEntry />
            </AsciiBox>

            {isEnabled('timeBlocks') && <TimeBlockPanel />}

            {isEnabled('mood') && <MoodTrackerPanel />}
          </section>

          <section className="dashboard-support-grid" aria-label="辅助沉淀">
            {isEnabled('principles') && <PrinciplesPanel />}

            <MonkQuote />

            {isEnabled('calendar') && (
              <AsciiBox title="日历">
                <MiniCalendar />
              </AsciiBox>
            )}

            {isEnabled('entertainment') && <EntertainmentPanel />}

            {isEnabled('habits') && <HabitTrackerPanel />}

            {isEnabled('inspiration') && <InspirationVaultPanel />}
          </section>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
