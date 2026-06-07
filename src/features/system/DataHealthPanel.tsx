import React, { useState } from 'react';
import AsciiBox from '../../components/AsciiBox';
import { systemCopy } from '../../copy/system-copy';
import { useAppStore } from '../../store/useAppStore';
import { getPlatformStorageDisplayUrl } from '../../utils/platformStorage';

const syncPhaseLabel = {
  'not-configured': '未配置',
  idle: '待命',
  syncing: '同步中',
  success: '已同步',
  error: '失败',
  conflict: '冲突',
} as const;

const formatCount = (label: string, count: number) => `${label} ${count}`;

const DataHealthPanel: React.FC = () => {
  const tasks = useAppStore((state) => state.tasks);
  const reflections = useAppStore((state) => state.reflections);
  const inspirations = useAppStore((state) => state.inspirations);
  const objectives = useAppStore((state) => state.objectives);
  const inboxItems = useAppStore((state) => state.inboxItems);
  const syncConfig = useAppStore((state) => state.syncConfig);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const [localStorageUrl] = useState(() => getPlatformStorageDisplayUrl());

  const localRecordSummary = [
    formatCount('任务', tasks.length),
    formatCount('反思', reflections.length),
    formatCount('灵感', inspirations.length),
    formatCount('目标', objectives.length),
    formatCount('收集', inboxItems.length),
  ].join(' · ');

  const rows = [
    {
      label: systemCopy.health.localRecords,
      value: localRecordSummary,
    },
    {
      label: systemCopy.health.syncEnabled,
      value: syncConfig.enabled ? systemCopy.health.enabled : systemCopy.health.disabled,
    },
    {
      label: systemCopy.health.syncPhase,
      value: syncPhaseLabel[syncStatus.phase],
    },
    {
      label: systemCopy.health.v3Baseline,
      value: syncStatus.v3SyncRevision
        ? `${systemCopy.health.initialized} · ${syncStatus.v3SyncRevision}`
        : systemCopy.health.notInitialized,
    },
    {
      label: systemCopy.health.conflicts,
      value: String(syncStatus.v3SyncConflicts ?? 0),
    },
    {
      label: systemCopy.health.pendingUpload,
      value: syncStatus.lastLocalUpdatedAt ?? systemCopy.health.none,
    },
    {
      label: systemCopy.health.recentSync,
      value: syncStatus.lastSyncedAt ?? systemCopy.health.unavailable,
    },
    {
      label: systemCopy.health.localStorageUrl,
      value: localStorageUrl,
    },
  ];

  return (
    <AsciiBox title={systemCopy.health.title}>
      <div className="system-health-panel">
        <div className="font-caption" style={{ color: 'var(--text-muted)' }}>
          {systemCopy.health.summary}
        </div>
        <div className="system-health-grid">
          {rows.map((row) => (
            <div className="system-health-row" key={row.label}>
              <span className="font-caption system-health-label">{row.label}</span>
              <span className="font-caption system-health-value" title={row.value}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .system-health-panel {
          display: grid;
          gap: var(--space-3);
        }

        .system-health-grid {
          display: grid;
          gap: var(--space-2);
        }

        .system-health-row {
          align-items: start;
          border: 1px solid var(--border-primary);
          display: grid;
          gap: var(--space-2);
          grid-template-columns: 128px minmax(0, 1fr);
          padding: var(--space-2);
        }

        .system-health-label {
          color: var(--text-muted);
        }

        .system-health-value {
          color: var(--text-secondary);
          min-width: 0;
          overflow-wrap: anywhere;
        }

        @media (max-width: 767px) {
          .system-health-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AsciiBox>
  );
};

export default DataHealthPanel;
