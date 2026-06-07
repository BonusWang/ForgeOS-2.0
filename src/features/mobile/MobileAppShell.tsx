import React, { useEffect, useState } from 'react';
import MobileCaptureHub from './MobileCaptureHub';
import MobileTodayForge from './MobileTodayForge';
import MobileWeekProgress from './MobileWeekProgress';
import SyncPanel from '../system/SyncPanel';
import { useAppStore } from '../../store/useAppStore';
import { useMobilePanelHistory } from './useMobilePanelHistory';

type MobileSection = 'today' | 'progress' | 'capture' | 'system';

interface MobileAppShellProps {
  onOpenModulePicker: () => void;
  onToggleTheme: () => void;
  onToggleVisualStyle: () => void;
  onToggleMobileVisualStyleLocal: () => void;
  theme: 'dark' | 'light';
  visualStyleLabel: string;
  isMobileVisualStyleLocal: boolean;
  hasUpdate: boolean;
}

const navItems: Array<{ id: MobileSection; label: string; index: string }> = [
  { id: 'today', label: '今日', index: '01' },
  { id: 'progress', label: '推进', index: '02' },
  { id: 'capture', label: '记录', index: '03' },
  { id: 'system', label: '系统', index: '04' },
];

const MOBILE_SECTION_HASH_PREFIX = '#mobile-';
const mobileMediaQuery = '(max-width: 767px), (hover: none) and (pointer: coarse)';

const isMobileSection = (value: string): value is MobileSection =>
  navItems.some((item) => item.id === value);

const getSectionHash = (section: MobileSection) => `${MOBILE_SECTION_HASH_PREFIX}${section}`;

const getSectionFromLocation = (): MobileSection => {
  if (typeof window === 'undefined') return 'today';
  if (!window.location.hash.startsWith(MOBILE_SECTION_HASH_PREFIX)) return 'today';

  const section = window.location.hash.slice(MOBILE_SECTION_HASH_PREFIX.length);
  return isMobileSection(section) ? section : 'today';
};

const canUseMobileHistory = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.(mobileMediaQuery).matches ?? true;
};

const MobileAppShell: React.FC<MobileAppShellProps> = ({
  onOpenModulePicker,
  onToggleTheme,
  onToggleVisualStyle,
  onToggleMobileVisualStyleLocal,
  theme,
  visualStyleLabel,
  isMobileVisualStyleLocal,
  hasUpdate,
}) => {
  const [activeSection, setActiveSection] = useState<MobileSection>(() => getSectionFromLocation());
  const [isSystemToolsOpen, setIsSystemToolsOpen] = useState(false);
  const tasks = useAppStore((s) => s.tasks);
  const inboxItems = useAppStore((s) => s.inboxItems);
  const reflections = useAppStore((s) => s.reflections);
  const inspirations = useAppStore((s) => s.inspirations);
  const syncConfig = useAppStore((s) => s.syncConfig);
  const syncStatus = useAppStore((s) => s.syncStatus);
  const v3SyncConflicts = syncStatus.v3SyncConflicts ?? 0;
  const mobileSystemHealth = {
    localRecords: tasks.length + reflections.length + inspirations.length,
    pendingInbox: inboxItems.length,
    syncLabel: syncConfig.enabled ? syncStatus.phase : 'not-configured',
    conflicts: v3SyncConflicts,
    pendingLocal: Boolean(syncStatus.lastLocalUpdatedAt && syncStatus.lastLocalUpdatedAt !== syncStatus.lastSyncedAt),
  };

  useMobilePanelHistory(isSystemToolsOpen, () => setIsSystemToolsOpen(false), 'system-tools-panel');

  useEffect(() => {
    if (!canUseMobileHistory()) return;

    const nextHash = getSectionHash(activeSection);
    if (window.location.hash !== nextHash) {
      window.history.replaceState({ mobileSection: activeSection }, '', nextHash);
    }
  }, [activeSection]);

  useEffect(() => {
    if (!canUseMobileHistory()) return;

    const handlePopState = () => {
      setActiveSection(getSectionFromLocation());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const selectSection = (nextSection: MobileSection) => {
    if (nextSection === activeSection) return;
    setActiveSection(nextSection);
    if (canUseMobileHistory()) {
      window.history.pushState({ mobileSection: nextSection }, '', getSectionHash(nextSection));
    }
  };

  const renderSection = () => {
    if (activeSection === 'today') return <MobileTodayForge />;
    if (activeSection === 'progress') return <MobileWeekProgress />;
    if (activeSection === 'capture') return <MobileCaptureHub />;

    return (
      <section className="mobile-system-panel" aria-label="移动端系统入口">
        <div className="mobile-system-status">
          <div className="mobile-card-label">我的系统</div>
          <h1>桌面内容，移动承载</h1>
          <p>设置、模块和完整复盘仍使用同一套 Forge-OS 数据。</p>
        </div>
        <div className="mobile-system-health" aria-label="移动端数据健康" role="status" aria-live="polite">
          <div>
            <span>本地记录</span>
            <strong>{mobileSystemHealth.localRecords}</strong>
          </div>
          <div>
            <span>待澄清</span>
            <strong>{mobileSystemHealth.pendingInbox}</strong>
          </div>
          <div>
            <span>同步状态</span>
            <strong>{mobileSystemHealth.syncLabel}</strong>
          </div>
          <div>
            <span>冲突</span>
            <strong>{mobileSystemHealth.conflicts}</strong>
          </div>
          <div>
            <span>本机待上传</span>
            <strong>{mobileSystemHealth.pendingLocal ? '有' : '无'}</strong>
          </div>
        </div>
        <div className="mobile-system-rows">
          <button type="button" className="mobile-system-row" onClick={onOpenModulePicker}>
            <span>模块</span>
            <strong>模块管理</strong>
            <small>调整移动端可见入口</small>
          </button>
          <button type="button" className="mobile-system-row" onClick={onToggleTheme}>
            <span>主题</span>
            <strong>{theme === 'dark' ? '切到浅色' : '切到深色'}</strong>
            <small>当前 {theme === 'dark' ? '深色' : '浅色'}</small>
          </button>
          <button type="button" className="mobile-system-row" onClick={onToggleVisualStyle}>
            <span>风格</span>
            <strong>{visualStyleLabel}</strong>
            <small>{isMobileVisualStyleLocal ? '仅当前手机' : '跟随桌面'}</small>
          </button>
          <button
            type="button"
            className="mobile-system-row mobile-system-row--toggle"
            aria-pressed={isMobileVisualStyleLocal}
            onClick={onToggleMobileVisualStyleLocal}
          >
            <span>本机</span>
            <strong>本机独立风格</strong>
            <small>{isMobileVisualStyleLocal ? '当前手机固定风格，不影响桌面' : '跟随桌面，切换会同步桌面视觉'}</small>
            <span className="mobile-local-style-switch" aria-hidden="true">
              <span />
            </span>
          </button>
          <button
            type="button"
            className="mobile-system-row"
            aria-controls="mobile-system-tools"
            aria-expanded={isSystemToolsOpen}
            onClick={() => setIsSystemToolsOpen((open) => !open)}
          >
            <span>完整</span>
            <strong>{isSystemToolsOpen ? '收起系统页' : '打开系统页'}</strong>
            <small>{hasUpdate ? '发现新版本，含 COS 同步' : 'COS 数据同步'}</small>
          </button>
        </div>
        {isSystemToolsOpen && (
          <div id="mobile-system-tools" className="mobile-system-tools">
            <SyncPanel />
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="mobile-app-shell" aria-label="Forge-OS mobile">
      <main className="mobile-content">
        {renderSection()}
      </main>

      <nav className="mobile-bottom-nav" aria-label="移动端主导航">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="mobile-nav-button"
            aria-current={activeSection === item.id ? 'page' : undefined}
            aria-label={`切换到${item.label}模块`}
            onClick={() => selectSection(item.id)}
          >
            <span>{item.index}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MobileAppShell;
