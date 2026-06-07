import React, { useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { CloudBackupSnapshot, CosSyncConfig } from '../../types/sync';
import AsciiBox from '../../components/AsciiBox';
import { systemCopy } from '../../copy/system-copy';
import { createCosSyncClient } from '../../sync/cosSyncClient';
import { createDirectCloudBackupHistoryProvider } from '../../sync/directCloudBackupHistoryProvider';
import {
  createDirectCosCredentialProvider,
  hasDirectCosCredentials,
} from '../../sync/directCosCredentialProvider';
import { createHttpCloudBackupHistoryProvider } from '../../sync/httpCloudBackupHistoryProvider';
import { createHttpCosCredentialProvider } from '../../sync/httpCosCredentialProvider';
import { restoreCloudSnapshot, type ManualSyncResult } from '../../sync/manualSync';
import { APP_VERSION } from '../../utils/checkUpdate';
import { getPlatformStorageDisplayUrl } from '../../utils/platformStorage';

const HISTORY_LIMIT = 5;

const createCloudConfig = (): CosSyncConfig => ({
  ...useAppStore.getState().syncConfig,
  enabled: true,
});

const createClient = (config: CosSyncConfig) =>
  createCosSyncClient({
    credentialProvider: hasDirectCosCredentials(config)
      ? createDirectCosCredentialProvider({
          accessKeyId: config.accessKeyId ?? '',
          secretAccessKey: config.secretAccessKey ?? '',
          bucket: config.bucket,
          region: config.region,
          endpoint: config.endpoint,
        })
      : createHttpCosCredentialProvider({
          endpoint: config.credentialProviderUrl,
        }),
  });

const createHistoryProvider = (config: CosSyncConfig) =>
  hasDirectCosCredentials(config)
    ? createDirectCloudBackupHistoryProvider({ config })
    : createHttpCloudBackupHistoryProvider({
        credentialProviderUrl: config.credentialProviderUrl,
      });

const snapshotFileName = (snapshot: CloudBackupSnapshot): string =>
  snapshot.key.split('/').pop() ?? snapshot.key;

const snapshotSyncedAt = (snapshot: CloudBackupSnapshot): string | undefined =>
  snapshotFileName(snapshot)
    .match(/^(\d{4}-\d{2}-\d{2}T\d{2}[-:]\d{2}[-:]\d{2}(?:\.\d+)?Z)-/)?.[1]
    ?.replace(/T(\d{2})-(\d{2})-(\d{2})/, 'T$1:$2:$3');

const formatDateTime = (value?: string): string => {
  if (!value) return '未知';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (part: number) => String(part).padStart(2, '0');

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join(' ');
};

const V3_REBASE_REQUIRED_MESSAGE = '历史恢复完成后需要重新初始化或刷新 V3 基线';

const clearV3SyncStatusAfterRestore = (
  syncStatus: ReturnType<typeof useAppStore.getState>['syncStatus'],
  deviceId: string
) => ({
  ...syncStatus,
  phase: 'idle' as const,
  deviceId,
  lastLocalUpdatedAt: new Date().toISOString(),
  lastError: V3_REBASE_REQUIRED_MESSAGE,
  lastSyncedRevision: undefined,
  conflict: undefined,
  v3SyncRevision: undefined,
  v3SyncBase: undefined,
  v3SyncNamespace: undefined,
  v3SyncInitializedAt: undefined,
  v3SyncAutoMerged: 0,
  v3SyncConflicts: 0,
  v3SyncLastError: V3_REBASE_REQUIRED_MESSAGE,
});

const buttonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--border-primary)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontFamily: 'var(--font-mono)',
  textTransform: 'uppercase',
  padding: 'var(--space-1) var(--space-3)',
};

const DataBackupPanel: React.FC = () => {
  const store = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isHistoryBusy, setIsHistoryBusy] = useState(false);
  const [historySnapshots, setHistorySnapshots] = useState<CloudBackupSnapshot[]>([]);
  const [selectedHistoryKey, setSelectedHistoryKey] = useState('');
  const [localStorageUrl] = useState(() => getPlatformStorageDisplayUrl());
  const recentHistorySnapshots = historySnapshots.slice(0, 5);

  const handleExport = () => {
    const data = {
      tasks: store.tasks,
      calendarEvents: store.calendarEvents,
      principles: store.principles,
      abilities: store.abilities,
      reflections: store.reflections,
      entertainments: store.entertainments,
      objectives: store.objectives,
      inboxItems: store.inboxItems,
      config: store.config,
      enabledModules: store.enabledModules,
      habits: store.habits,
      moods: store.moods,
      timeBlocks: store.timeBlocks,
      inspirations: store.inspirations,
      reflectionTemplates: store.reflectionTemplates,
      syncConfig: store.syncConfig,
      syncStatus: store.syncStatus,
      __version: store.__version ?? '0.1.1',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forge-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessage(systemCopy.backup.exportSuccess);
    setTimeout(() => setStatusMessage(''), 2000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const requiredKeys = [
          'tasks',
          'principles',
          'abilities',
          'reflections',
          'entertainments',
          'calendarEvents',
          'config',
        ];
        const missing = requiredKeys.filter((k) => !(k in json));
        if (missing.length > 0) {
          setStatusMessage(systemCopy.backup.importFailed);
          return;
        }

        useAppStore.setState({
          tasks: json.tasks,
          principles: json.principles,
          abilities: json.abilities,
          reflections: json.reflections,
          entertainments: json.entertainments,
          objectives: json.objectives ?? [],
          inboxItems: json.inboxItems ?? [],
          config: json.config,
          enabledModules: json.enabledModules ?? [],
          habits: json.habits ?? [],
          moods: json.moods ?? [],
          timeBlocks: json.timeBlocks ?? [],
          inspirations: json.inspirations ?? [],
          reflectionTemplates: json.reflectionTemplates ?? [],
          syncConfig: json.syncConfig ?? store.syncConfig,
          syncStatus: clearV3SyncStatusAfterRestore(
            json.syncStatus ?? store.syncStatus,
            store.syncStatus.deviceId
          ),
          __version: json.__version ?? '0.1.1',
        });

        setStatusMessage(`${systemCopy.backup.importSuccess}，${V3_REBASE_REQUIRED_MESSAGE}`);
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } catch {
        setStatusMessage(systemCopy.backup.importFailed);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyHistoryRestoreResult = (result: ManualSyncResult) => {
    const current = useAppStore.getState();
    const deviceId = current.syncStatus.deviceId;

    if (result.phase === 'not-configured') {
      current.setSyncStatus({ phase: 'not-configured', lastError: '请先确认 COS 云服务配置' });
      setStatusMessage('请先确认 COS 云服务配置');
      return;
    }

    if (result.phase === 'error') {
      current.setSyncStatus({ phase: 'error', lastError: result.error });
      setStatusMessage(result.error);
      return;
    }

    if (result.phase !== 'success') {
      current.setSyncStatus({
        phase: 'conflict',
        lastError: systemCopy.backup.cloudConflict,
      });
      setStatusMessage(systemCopy.backup.cloudConflict);
      return;
    }

    if (result.state) {
      useAppStore.setState({
        ...result.state,
        syncConfig: current.syncConfig,
        syncStatus: {
          phase: 'success',
          deviceId,
          lastSyncedAt: new Date().toISOString(),
          lastSyncedRevision: undefined,
          lastLocalUpdatedAt: new Date().toISOString(),
          lastError: V3_REBASE_REQUIRED_MESSAGE,
          conflict: undefined,
          v3SyncRevision: undefined,
          v3SyncBase: undefined,
          v3SyncNamespace: undefined,
          v3SyncInitializedAt: undefined,
          v3SyncAutoMerged: 0,
          v3SyncConflicts: 0,
          v3SyncLastError: V3_REBASE_REQUIRED_MESSAGE,
        },
      });
    } else {
      current.setSyncStatus({
        phase: 'success',
        lastSyncedAt: new Date().toISOString(),
        lastSyncedRevision: undefined,
        lastLocalUpdatedAt: new Date().toISOString(),
        lastError: V3_REBASE_REQUIRED_MESSAGE,
        conflict: undefined,
        v3SyncRevision: undefined,
        v3SyncBase: undefined,
        v3SyncNamespace: undefined,
        v3SyncInitializedAt: undefined,
        v3SyncAutoMerged: 0,
        v3SyncConflicts: 0,
        v3SyncLastError: V3_REBASE_REQUIRED_MESSAGE,
      });
    }

    setStatusMessage(`${systemCopy.backup.historyRestoreSuccess}，${V3_REBASE_REQUIRED_MESSAGE}`);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const loadHistorySnapshots = async () => {
    setIsHistoryBusy(true);
    setStatusMessage(systemCopy.backup.historyLoading);
    const config = createCloudConfig();
    const provider = createHistoryProvider(config);

    try {
      const snapshots = (await provider.listSnapshots(config)).slice(0, HISTORY_LIMIT);
      setHistorySnapshots(snapshots);
      setSelectedHistoryKey(snapshots[0]?.key ?? '');
      setStatusMessage(
        snapshots.length > 0 ? systemCopy.backup.historyLoaded : systemCopy.backup.historyEmpty
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'cloud history failed');
    } finally {
      setIsHistoryBusy(false);
    }
  };

  const handleRestoreSelectedHistory = async () => {
    if (!selectedHistoryKey) {
      await loadHistorySnapshots();
      return;
    }

    setIsHistoryBusy(true);
    setStatusMessage(systemCopy.backup.syncLocalRunning);
    const config = createCloudConfig();
    const state = useAppStore.getState();
    state.setSyncStatus({ phase: 'syncing', lastError: undefined });

    try {
      const result = await restoreCloudSnapshot({
        config,
        client: createClient(config),
        key: selectedHistoryKey,
        appVersion: APP_VERSION,
      });

      applyHistoryRestoreResult(result);
    } finally {
      setIsHistoryBusy(false);
    }
  };

  return (
    <AsciiBox title={systemCopy.backup.title}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div
          className="font-caption"
          style={{
            alignItems: 'baseline',
            color: 'var(--text-muted)',
            display: 'grid',
            gap: 'var(--space-2)',
            gridTemplateColumns: 'max-content minmax(0, 1fr)',
          }}
        >
          <span>{systemCopy.backup.localStorageUrlLabel}：</span>
          <span
            title={localStorageUrl}
            style={{
              color: 'var(--text-secondary)',
              minWidth: 0,
              overflowWrap: 'anywhere',
            }}
          >
            {localStorageUrl}
          </span>
        </div>

        <div className="font-caption" style={{ color: 'var(--text-muted)' }}>
          {systemCopy.backup.sepiaHint}
        </div>

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <button
            onClick={handleExport}
            className="font-caption btn-invert"
            style={buttonStyle}
          >
            [ {systemCopy.backup.exportButton} ]
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="font-caption btn-invert"
            style={buttonStyle}
          >
            [ {systemCopy.backup.importButton} ]
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <button
            onClick={loadHistorySnapshots}
            disabled={isHistoryBusy}
            className="font-caption btn-invert"
            style={{ ...buttonStyle, opacity: isHistoryBusy ? 0.5 : 1 }}
          >
            [ {systemCopy.backup.restoreHistoryButton} ]
          </button>
        </div>

        {recentHistorySnapshots.length > 0 && (
          <div
            style={{
              borderTop: '1px solid var(--border-primary)',
              display: 'grid',
              gap: 'var(--space-2)',
              paddingTop: 'var(--space-2)',
            }}
          >
            <div className="font-caption" style={{ color: 'var(--text-muted)' }}>
              最近 5 次同步节点
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
              {recentHistorySnapshots.map((snapshot) => (
                <label
                  key={snapshot.key}
                  className="font-caption"
                  style={{
                    alignItems: 'start',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'grid',
                    gap: 'var(--space-2)',
                    gridTemplateColumns: 'auto minmax(0, 1fr)',
                    padding: 'var(--space-2)',
                  }}
                >
                  <input
                    type="radio"
                    checked={selectedHistoryKey === snapshot.key}
                    onChange={() => setSelectedHistoryKey(snapshot.key)}
                  />
                  <span
                    style={{
                      display: 'grid',
                      gap: 'var(--space-1)',
                      minWidth: 0,
                    }}
                  >
                    <span style={{ overflowWrap: 'anywhere' }}>文件：{snapshotFileName(snapshot)}</span>
                    <span>同步时间：{formatDateTime(snapshotSyncedAt(snapshot))}</span>
                    <span>修改时间：{formatDateTime(snapshot.lastModified)}</span>
                  </span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleRestoreSelectedHistory}
                disabled={isHistoryBusy || !selectedHistoryKey}
                className="font-caption btn-invert"
                style={{ ...buttonStyle, opacity: isHistoryBusy || !selectedHistoryKey ? 0.5 : 1 }}
              >
                [ {systemCopy.backup.confirmHistoryRestoreButton} ]
              </button>
            </div>
          </div>
        )}

        {statusMessage && (
          <div
            className="font-caption"
            style={{ marginTop: 'var(--space-1)', color: 'var(--text-secondary)' }}
          >
            {statusMessage}
          </div>
        )}
      </div>
    </AsciiBox>
  );
};

export default DataBackupPanel;
