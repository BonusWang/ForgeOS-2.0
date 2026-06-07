import React, { useMemo, useState } from 'react';
import AsciiBox from '../../components/AsciiBox';
import AsciiButton from '../../components/AsciiButton';
import { useAppStore } from '../../store/useAppStore';
import type { CosSyncConfig, SyncStatus } from '../../types/sync';
import {
  createDirectCosCredentialProvider,
  hasDirectCosCredentials,
} from '../../sync/directCosCredentialProvider';
import { createHttpCosCredentialProvider } from '../../sync/httpCosCredentialProvider';
import { isV3SyncEnvelope } from '../../sync/v3/v3SyncEnvelope.ts';
import { createV3SyncClient } from '../../sync/v3/v3SyncClient.ts';
import { createV3SyncOwner, v3SyncObjectKey } from '../../sync/v3/v3SyncNamespace.ts';
import { runV3Sync, type V3SyncResult } from '../../sync/v3/v3SyncRunner.ts';
import { APP_VERSION } from '../../utils/checkUpdate';

const createCredentialProvider = (config: CosSyncConfig) =>
  hasDirectCosCredentials(config)
    ? createDirectCosCredentialProvider({
        accessKeyId: config.accessKeyId ?? '',
        secretAccessKey: config.secretAccessKey ?? '',
        bucket: config.bucket,
        region: config.region,
        endpoint: config.endpoint,
      })
    : createHttpCosCredentialProvider({
        endpoint: config.credentialProviderUrl,
      });

const createV3Client = (config: CosSyncConfig) =>
  createV3SyncClient({
    credentialProvider: createCredentialProvider(config),
    appVersion: APP_VERSION,
    owner: createV3SyncOwner(config),
  });

const statusLabel: Record<SyncStatus['phase'], string> = {
  'not-configured': '未配置',
  idle: '待命',
  syncing: '同步中',
  success: '已同步',
  error: '失败',
  conflict: '冲突',
};

const formatSyncError = (error?: string) => {
  if (!error) return undefined;
  if (error === 'namespace-mismatch') {
    return 'V3 命名空间不匹配，已拒绝导入云端对象，避免写入其他用户或资料的数据。';
  }
  if (/浏览器无法访问 COS/i.test(error)) {
    return error;
  }
  if (/Failed to fetch|NetworkError/i.test(error)) {
    return '网络或授权服务不可用，请检查手机网络、签名服务地址或 COS 跨域配置。';
  }
  return error;
};

const SyncPanel: React.FC = () => {
  const syncConfig = useAppStore((state) => state.syncConfig);
  const syncStatus = useAppStore((state) => state.syncStatus);
  const updateSyncConfig = useAppStore((state) => state.updateSyncConfig);
  const setSyncStatus = useAppStore((state) => state.setSyncStatus);
  const [form, setForm] = useState(syncConfig);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const displayError = formatSyncError(syncStatus.lastError);
  const v3Namespace = useMemo(
    () => syncStatus.v3SyncNamespace ?? createV3SyncOwner(syncConfig).namespace,
    [syncConfig, syncStatus.v3SyncNamespace]
  );
  const v3ObjectKey = useMemo(() => v3SyncObjectKey(syncConfig), [syncConfig]);
  const hasActiveV3SyncStatus = Boolean(syncStatus.v3SyncRevision || syncStatus.v3SyncInitializedAt);

  const updateForm = (field: keyof CosSyncConfig, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const applyV3Result = (result: V3SyncResult, config: CosSyncConfig = form) => {
    const state = useAppStore.getState();
    const deviceId = state.syncStatus.deviceId;

    if (result.phase === 'not-configured') {
      setSyncStatus({ phase: 'not-configured', lastError: '请先启用并保存 COS 同步配置' });
      return;
    }

    if (result.phase === 'error') {
      setSyncStatus({
        phase: 'error',
        lastError: result.error,
        v3SyncLastError: result.error,
      });
      return;
    }

    if (result.phase === 'conflict') {
      setSyncStatus({
        phase: 'conflict',
        lastError: `V3 同步检测到 ${result.conflicts.length} 个字段冲突`,
        conflict: undefined,
        v3SyncRevision: result.revision,
        v3SyncBase: result.baseEnvelope,
        v3SyncNamespace: result.baseEnvelope.owner.namespace,
        v3SyncAutoMerged: result.autoMerged,
        v3SyncConflicts: result.conflicts.length,
        v3SyncLastError: undefined,
      });
      return;
    }

    useAppStore.setState({
      ...result.state,
      syncConfig: config,
      syncStatus: {
        ...state.syncStatus,
        phase: 'success',
        deviceId,
        lastSyncedAt: new Date().toISOString(),
        lastLocalUpdatedAt: undefined,
        lastError: undefined,
        conflict: undefined,
        v3SyncRevision: result.revision,
        v3SyncBase: result.baseEnvelope,
        v3SyncNamespace: result.baseEnvelope.owner.namespace,
        v3SyncInitializedAt:
          state.syncStatus.v3SyncInitializedAt ?? result.baseEnvelope.updatedAt,
        v3SyncAutoMerged: result.autoMerged,
        v3SyncConflicts: result.conflicts.length,
        v3SyncLastError: undefined,
      },
    });
  };

  const saveConfig = () => {
    updateSyncConfig(form);
    setSyncStatus({
      phase: form.enabled ? 'idle' : 'not-configured',
      lastError: undefined,
      conflict: undefined,
    });
    setIsConfigOpen(false);
  };

  const openConfig = () => {
    setForm(syncConfig);
    setIsConfigOpen(true);
  };

  const handleManualSync = async () => {
    const activeConfig = isConfigOpen ? form : syncConfig;
    updateSyncConfig(activeConfig);
    setSyncStatus({ phase: 'syncing', lastError: undefined });

    const state = useAppStore.getState();
    const result = await runV3Sync({
      config: activeConfig,
      client: createV3Client(activeConfig),
      key: v3SyncObjectKey(activeConfig),
      appVersion: APP_VERSION,
      deviceId: state.syncStatus.deviceId,
      state,
      baseEnvelope: isV3SyncEnvelope(state.syncStatus.v3SyncBase)
        ? state.syncStatus.v3SyncBase
        : undefined,
      hasLocalChanges: Boolean(syncStatus.lastLocalUpdatedAt),
    });

    applyV3Result(result, activeConfig);
  };

  return (
    <AsciiBox title="COS 数据同步">
      <div className="sync-panel">
        <div className={`sync-status-banner sync-status-banner--${syncStatus.phase}`}>
          <div className="sync-status-main">
            <span className="font-body sync-status-title">状态：{statusLabel[syncStatus.phase]}</span>
            <span className="font-caption sync-status-device">设备：{syncStatus.deviceId}</span>
          </div>
          <div className="sync-status-meta font-caption">
            <span>最近同步：{syncStatus.lastSyncedAt ?? '暂无'}</span>
            {!hasActiveV3SyncStatus && (
              <span>基线：{syncStatus.lastSyncedRevision ?? '暂无'}</span>
            )}
            <span>V3 基线：{syncStatus.v3SyncRevision ?? '暂无'}</span>
            <span>V3 初始化：{syncStatus.v3SyncInitializedAt ?? '暂无'}</span>
            <span>V3 合并：{syncStatus.v3SyncAutoMerged ?? 0}</span>
            <span>V3 冲突：{syncStatus.v3SyncConflicts ?? 0}</span>
            <span>待上传本地变更：{syncStatus.lastLocalUpdatedAt ?? '无'}</span>
            <span>V3 命名空间：{v3Namespace}</span>
          </div>
          {displayError && <div className="font-caption sync-error">{displayError}</div>}
        </div>

        {!isConfigOpen && (
          <div className="sync-config-summary font-caption">
            <span>Bucket：{syncConfig.bucket}</span>
            <span>对象前缀：{syncConfig.objectPrefix}</span>
            <span>V3 对象：{v3ObjectKey}</span>
            <span>授权：{hasDirectCosCredentials(syncConfig) ? '手动密钥' : '签名服务'}</span>
          </div>
        )}

        {isConfigOpen && (
          <>
            <div className="sync-setting-section sync-setting-section--connection">
              <div className="sync-section-heading">
                <div className="font-body">连接设置</div>
                <div className="font-caption">COS Bucket 与对象路径</div>
              </div>

              <label className="sync-field sync-field--toggle font-caption">
                <span>
                  <span className="sync-field-label">启动自动同步</span>
                  <span className="sync-field-help">应用启动时自动拉取云端，仍可手动触发同步。</span>
                </span>
                <span className="sync-switch">
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={(event) => updateForm('enabled', event.currentTarget.checked)}
                  />
                  <span className="sync-switch-track" aria-hidden="true">
                    <span className="sync-switch-thumb" />
                  </span>
                </span>
              </label>

              <label className="sync-field font-caption">
                <span className="sync-field-label">Endpoint</span>
                <input value={form.endpoint} onChange={(event) => updateForm('endpoint', event.target.value)} />
              </label>
              <label className="sync-field font-caption">
                <span className="sync-field-label">Region</span>
                <input value={form.region} onChange={(event) => updateForm('region', event.target.value)} />
              </label>
              <label className="sync-field font-caption">
                <span className="sync-field-label">Bucket</span>
                <input value={form.bucket} onChange={(event) => updateForm('bucket', event.target.value)} />
              </label>
              <label className="sync-field font-caption">
                <span className="sync-field-label">Profile</span>
                <input
                  value={form.profileId}
                  onChange={(event) => updateForm('profileId', event.target.value)}
                />
              </label>
              <label className="sync-field font-caption">
                <span className="sync-field-label">对象前缀</span>
                <input
                  value={form.objectPrefix}
                  onChange={(event) => updateForm('objectPrefix', event.target.value)}
                />
              </label>
            </div>

            <div className="sync-setting-section sync-setting-section--security">
              <div className="sync-section-heading">
                <div className="font-body">授权设置</div>
                <div className="font-caption">优先使用签名服务；填写密钥时将直接签名请求。</div>
              </div>

              <label className="sync-field font-caption">
                <span className="sync-field-label">签名服务</span>
                <input
                  value={form.credentialProviderUrl}
                  onChange={(event) => updateForm('credentialProviderUrl', event.target.value)}
                />
              </label>
              <label className="sync-field font-caption">
                <span className="sync-field-label">Access Key ID</span>
                <input
                  value={form.accessKeyId ?? ''}
                  onChange={(event) => updateForm('accessKeyId', event.target.value)}
                />
              </label>
              <label className="sync-field font-caption">
                <span className="sync-field-label">Secret Access Key</span>
                <input
                  type="password"
                  value={form.secretAccessKey ?? ''}
                  onChange={(event) => updateForm('secretAccessKey', event.target.value)}
                />
              </label>
            </div>
          </>
        )}

        <div className="sync-action-bar sync-actions">
          {isConfigOpen ? (
            <AsciiButton onClick={saveConfig} variant="secondary">
              保存配置
            </AsciiButton>
          ) : (
            <AsciiButton onClick={openConfig} variant="secondary">
              修改配置
            </AsciiButton>
          )}
          <AsciiButton onClick={handleManualSync} disabled={syncStatus.phase === 'syncing'}>
            立即同步
          </AsciiButton>
        </div>

        {syncStatus.phase === 'conflict' && (
          <div className="sync-conflict">
            <div className="font-caption text-gold">
              V3 同步发现字段冲突：{syncStatus.v3SyncConflicts ?? 0} 个。冲突值已保留在 V3 同步元数据中，本地数据不会被云端覆盖。
            </div>
          </div>
        )}
      </div>
    </AsciiBox>
  );
};

export default SyncPanel;
