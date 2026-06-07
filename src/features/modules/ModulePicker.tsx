import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getAllModules } from './moduleRegistry';
import type { ModuleId } from '../../types';

interface ModulePickerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MODULE_PHASE_GROUPS: Array<{
  title: string;
  description: string;
  moduleIds: ModuleId[];
}> = [
  {
    title: '定向',
    description: '原则与目标感，帮助系统先回答为什么做。',
    moduleIds: ['principles'],
  },
  {
    title: '捕捉',
    description: '把临时想法先收住，再决定是否进入行动。',
    moduleIds: ['inspiration'],
  },
  {
    title: '执行',
    description: '承接今日推进、周看板和日常状态辅助模块。',
    moduleIds: ['timeBlocks', 'habits', 'mood', 'entertainment', 'calendar'],
  },
  {
    title: '复盘',
    description: '每日反思和周复盘是核心页面，不写入模块开关。',
    moduleIds: [],
  },
  {
    title: '成长证据',
    description: '反思库、能力和完成目标在核心页面中聚合展示。',
    moduleIds: [],
  },
  {
    title: '维护',
    description: '备份、同步、系统健康和模块管理由系统页承接。',
    moduleIds: [],
  },
];

const ModulePicker: React.FC<ModulePickerProps> = ({ isOpen, onClose }) => {
  const enabledModules = useAppStore((s) => s.enabledModules);
  const toggleModule = useAppStore((s) => s.toggleModule);
  const overlayRef = useRef<HTMLDivElement>(null);
  const feedbackTimerRef = useRef<number | undefined>(undefined);
  const [changedModuleId, setChangedModuleId] = useState<ModuleId | undefined>();
  const [changeNotice, setChangeNotice] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => () => {
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleModuleToggle = (moduleId: ModuleId, moduleName: string, nextEnabled: boolean) => {
    toggleModule(moduleId);
    setChangedModuleId(moduleId);
    setChangeNotice(`${nextEnabled ? '已显示' : '已隐藏'} ${moduleName}`);

    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    feedbackTimerRef.current = window.setTimeout(() => {
      setChangedModuleId(undefined);
      setChangeNotice('');
    }, 1400);
  };

  if (!isOpen) return null;

  const modules = getAllModules();
  const moduleById = new Map(modules.map((mod) => [mod.id, mod]));
  const enabledCount = enabledModules.length;

  return (
    <div
      className="module-picker-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div
        className="module-picker-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="module-picker-title"
      >
        <div className="module-picker-header">
          <div>
            <div className="font-h2 module-picker-title" id="module-picker-title">
              模块管理
            </div>
            <div className="font-caption module-picker-count">
              已显示 {enabledCount} / {modules.length}
            </div>
            <div className="font-caption module-picker-feedback" aria-live="polite" role="status">
              {changeNotice}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="module-picker-close"
            aria-label="完成模块管理"
          >
            完成
          </button>
        </div>

        <div className="module-picker-list">
          {MODULE_PHASE_GROUPS.map((phase) => (
            <section key={phase.title} className="module-picker-phase">
              <div className="module-picker-phase-heading">
                <div className="font-h3">{phase.title}</div>
                <div className="font-caption">{phase.description}</div>
              </div>

              {phase.moduleIds.length === 0 ? (
                <div className="font-caption module-picker-phase-note">
                  核心入口固定保留，无需在模块开关中管理。
                </div>
              ) : (
                phase.moduleIds.map((moduleId) => {
                  const mod = moduleById.get(moduleId);
                  if (!mod) return null;
                  const isEnabled = enabledModules.includes(mod.id as ModuleId);
                  const zoneLabel = mod.defaultZone === 'main' ? '主区' : '侧栏';
                  return (
                    <label
                      key={mod.id}
                      className={`module-picker-row${isEnabled ? ' is-enabled' : ' is-disabled'}${changedModuleId === mod.id ? ' is-changing' : ''}`}
                    >
                      <span className="module-picker-icon" aria-hidden="true">
                        {mod.icon}
                      </span>

                      <span className="module-picker-copy">
                        <span className="font-body module-picker-name">
                          {mod.name}
                        </span>
                        <span className="font-caption module-picker-description">
                          {mod.description}
                        </span>
                        <span className="module-picker-zone">{zoneLabel}</span>
                      </span>

                      <span className="module-picker-control">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleModuleToggle(mod.id as ModuleId, mod.name, !isEnabled)}
                          aria-label={`${isEnabled ? '隐藏' : '显示'}${mod.name}`}
                        />
                        <span className="module-picker-switch-track" aria-hidden="true">
                          <span className="module-picker-switch-thumb" />
                        </span>
                        <span className="module-picker-state">
                          {isEnabled ? '已显示' : '已隐藏'}
                        </span>
                      </span>
                    </label>
                  );
                })
              )}
            </section>
          ))}
        </div>

        <div className="module-picker-footer">
          <div className="module-picker-meter" aria-hidden="true">
            <span style={{ width: `${(enabledCount / modules.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePicker;
