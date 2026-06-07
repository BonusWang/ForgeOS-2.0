import { useState, useEffect, useRef, type CSSProperties } from 'react';
import Dashboard from './pages/Dashboard';
import Reflection from './pages/Reflection';
import System from './pages/System';
import WeeklyReview from './pages/WeeklyReview';
import MonthlyOKR from './pages/MonthlyOKR';
import ModulePicker from './features/modules/ModulePicker';
import MobileAppShell from './features/mobile/MobileAppShell';
import { useWeekCleanup } from './hooks/useWeekCleanup';
import { useStartupCosSync } from './hooks/useStartupCosSync';
import { useAutoCosSync } from './hooks/useAutoCosSync';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { useAppStore } from './store/useAppStore';
import { checkUpdate, APP_VERSION } from './utils/checkUpdate';
import { systemCopy } from './copy/system-copy';
import { forgeCopy } from './copy/forge-copy';
import { resources } from './utils/assets';
import { platformStorage } from './utils/platformStorage';

type VisualStyle = 'classic' | 'claude' | 'supabase' | 'dossier';

const MOBILE_VISUAL_STYLE_LOCAL_KEY = 'forge-os.mobileVisualStyleLocal';
const MOBILE_VISUAL_STYLE_KEY = 'forge-os.mobileVisualStyle';

const classicDarkStyleTokens = {
  '--bg-primary': '#1c1610',
  '--bg-secondary': '#241e16',
  '--bg-tertiary': '#2c261e',
  '--text-primary': '#b0a080',
  '--text-secondary': '#5a5040',
  '--text-muted': '#3d3528',
  '--accent-gold': '#a08040',
  '--accent-success': '#5a7a5a',
  '--accent-danger': '#7a3030',
  '--border-primary': '#3d3528',
  '--border-hover': '#504838',
  '--font-display': '"JetBrains Mono", "Courier New", Consolas, monospace',
  '--font-sans': '"JetBrains Mono", "Courier New", Consolas, monospace',
  '--font-mono': '"JetBrains Mono", "Courier New", Consolas, monospace',
} as CSSProperties;

const classicLightStyleTokens = {
  '--bg-primary': '#e8e0d0',
  '--bg-secondary': '#dcd4c4',
  '--bg-tertiary': '#d0c8b8',
  '--text-primary': '#1a1814',
  '--text-secondary': '#7a7060',
  '--text-muted': '#a09888',
  '--accent-gold': '#9a7a3a',
  '--accent-success': '#5a7a5a',
  '--accent-danger': '#a04040',
  '--border-primary': '#b8b0a0',
  '--border-hover': '#9a9078',
  '--font-display': '"JetBrains Mono", "Courier New", Consolas, monospace',
  '--font-sans': '"JetBrains Mono", "Courier New", Consolas, monospace',
  '--font-mono': '"JetBrains Mono", "Courier New", Consolas, monospace',
} as CSSProperties;

const claudeStyleTokens = {
  '--bg-primary': '#faf9f5',
  '--bg-secondary': '#ffffff',
  '--bg-tertiary': '#f5f0e8',
  '--text-primary': '#141413',
  '--text-secondary': '#3d3d3a',
  '--text-muted': '#6c6a64',
  '--accent-gold': '#cc785c',
  '--accent-success': '#5db872',
  '--accent-danger': '#c64545',
  '--border-primary': '#e6dfd8',
  '--border-hover': '#cc785c',
  '--font-display': '"Cormorant Garamond", "EB Garamond", Georgia, "Times New Roman", serif',
  '--font-sans': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  '--font-mono': '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
} as CSSProperties;

const supabaseStyleTokens = {
  '--bg-primary': '#0f0f0f',
  '--bg-secondary': '#171717',
  '--bg-tertiary': '#202020',
  '--text-primary': '#fafafa',
  '--text-secondary': '#b7b7b7',
  '--text-muted': '#737373',
  '--accent-gold': '#3ecf8e',
  '--accent-success': '#3ecf8e',
  '--accent-danger': '#ff7b72',
  '--border-primary': '#2f2f2f',
  '--border-hover': '#3ecf8e',
  '--font-display': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  '--font-sans': 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  '--font-mono': 'JetBrains Mono, "Source Code Pro", Consolas, monospace',
} as CSSProperties;

const dossierStyleTokens = {
  '--bg-primary': '#f7f2e8',
  '--bg-secondary': '#fffaf0',
  '--bg-tertiary': '#eee5d4',
  '--text-primary': '#171412',
  '--text-secondary': '#4f463d',
  '--text-muted': '#6a6258',
  '--accent-gold': '#9f2019',
  '--accent-success': '#1f6f49',
  '--accent-danger': '#9f2019',
  '--border-primary': '#8d7d64',
  '--border-hover': '#9f2019',
  '--font-display': '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  '--font-sans': '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  '--font-mono': '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
} as CSSProperties;

const normalizeVisualStyle = (value: string | null): VisualStyle | undefined => {
  const normalized = value === 'orbit' ? 'claude' : value;
  if (
    normalized === 'classic' ||
    normalized === 'claude' ||
    normalized === 'supabase' ||
    normalized === 'dossier'
  ) {
    return normalized;
  }
  return undefined;
};

const readMobilePreferenceState = (key: string): unknown => {
  try {
    const stored = platformStorage.getItem(key);
    if (stored && typeof (stored as Promise<unknown>).then === 'function') return undefined;
    return (stored as { state?: unknown } | null)?.state;
  } catch {
    return undefined;
  }
};

const writeMobilePreferenceState = (key: string, value: string | boolean) => {
  try {
    platformStorage.setItem(key, { state: value });
  } catch {
    // Android WebView may not expose DOM storage; platform storage failures should not block startup.
  }
};

const readStoredMobileVisualStyle = (): VisualStyle => {
  const value = readMobilePreferenceState(MOBILE_VISUAL_STYLE_KEY);
  return typeof value === 'string' ? (normalizeVisualStyle(value) ?? 'classic') : 'classic';
};

const readStoredMobileVisualStyleLocal = () => {
  return readMobilePreferenceState(MOBILE_VISUAL_STYLE_LOCAL_KEY) === true;
};

const getNextVisualStyle = (style: VisualStyle): VisualStyle => {
  if (style === 'classic') return 'claude';
  if (style === 'claude') return 'supabase';
  if (style === 'supabase') return 'dossier';
  return 'classic';
};

const getStyleShellClassName = (style: VisualStyle) =>
  style === 'claude'
    ? 'claude-style-shell'
    : style === 'supabase'
      ? 'supabase-style-shell'
      : style === 'dossier'
        ? 'dossier-style-shell'
        : '';

const getVisualStyleLabel = (style: VisualStyle) =>
  style === 'claude' ? 'Claude' : style === 'supabase' ? 'Supabase' : style === 'dossier' ? 'Dossier' : '复古';

const getVisualStyleTokens = (style: VisualStyle, theme: 'dark' | 'light') => {
  if (style === 'claude') return claudeStyleTokens;
  if (style === 'supabase') return supabaseStyleTokens;
  if (style === 'dossier') return dossierStyleTokens;
  return theme === 'light' ? classicLightStyleTokens : classicDarkStyleTokens;
};

const lastWordsMessage =
  systemCopy.lastWords[Math.floor(Math.random() * systemCopy.lastWords.length)] ?? '';

const canAutoCheckUpdates = () => Boolean(window.electronAPI?.getAppVersion);

function App() {
  const [page, setPage] = useState<'dashboard' | 'reflection' | 'weeklyReview' | 'monthlyOKR' | 'system'>('dashboard');
  const [weeklyReviewWeekStart, setWeeklyReviewWeekStart] = useState('');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('classic');
  const [mobileVisualStyle, setMobileVisualStyle] = useState<VisualStyle>(() => readStoredMobileVisualStyle());
  const [isMobileVisualStyleLocal, setIsMobileVisualStyleLocal] = useState(() => readStoredMobileVisualStyleLocal());
  const [modulePickerOpen, setModulePickerOpen] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);
  const config = useAppStore((s) => s.config);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const lastWordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const theme = config.theme ?? 'dark';
    document.documentElement.dataset.theme = theme;
  }, [config.theme]);

  useWeekCleanup();
  useStartupCosSync();
  useAutoCosSync();
  useDocumentTitle();

  // Check for updates on mount
  useEffect(() => {
    if (!canAutoCheckUpdates()) return;

    let cancelled = false;
    const doCheck = async () => {
      const v = window.electronAPI?.getAppVersion?.() ?? APP_VERSION;
      const result = await checkUpdate(v);
      if (!cancelled && result.hasUpdate) {
        setHasUpdate(true);
      }
    };
    // Delay slightly so it doesn't block first paint
    const timer = setTimeout(doCheck, 3000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  // Last Words on quit
  useEffect(() => {
    if (!window.electronAPI?.onBeforeQuit) return;

    const handler = () => {
      const today = new Date().toISOString().split('T')[0];
      const reflections = useAppStore.getState().reflections;
      const hasReflection = reflections.some((r) => r.date === today);
      if (!hasReflection && lastWordsRef.current) {
        lastWordsRef.current.style.opacity = '1';
        lastWordsRef.current.style.transform = 'translateY(0)';
      }
    };

    window.electronAPI.onBeforeQuit(handler);
    // ipcRenderer.on returns nothing useful here; cleanup is optional
  }, []);

  const isClaudeStyle = visualStyle === 'claude';
  const isSupabaseStyle = visualStyle === 'supabase';
  const isDossierStyle = visualStyle === 'dossier';
  const activeStyleTokens =
    visualStyle === 'claude'
      ? claudeStyleTokens
      : visualStyle === 'dossier'
        ? dossierStyleTokens
        : getVisualStyleTokens(visualStyle, config.theme ?? 'dark');
  const visualStyleLabel = visualStyle === 'dossier' ? 'Dossier' : getVisualStyleLabel(visualStyle);
  const effectiveMobileVisualStyle = isMobileVisualStyleLocal ? mobileVisualStyle : visualStyle;
  const effectiveMobileVisualStyleLabel = getVisualStyleLabel(effectiveMobileVisualStyle);
  const mobileStyleScopeClassName = `mobile-style-scope ${getStyleShellClassName(effectiveMobileVisualStyle)}`.trim();
  const mobileStyleTokens = getVisualStyleTokens(effectiveMobileVisualStyle, config.theme ?? 'dark');
  const toggleVisualStyle = () => {
    setVisualStyle((style) => getNextVisualStyle(style));
  };
  const toggleMobileVisualStyle = () => {
    if (isMobileVisualStyleLocal) {
      setMobileVisualStyle((style) => getNextVisualStyle(style));
      return;
    }
    toggleVisualStyle();
  };
  const toggleMobileVisualStyleLocal = () => {
    setIsMobileVisualStyleLocal((current) => {
      const next = !current;
      if (next) setMobileVisualStyle(visualStyle);
      return next;
    });
  };

  useEffect(() => {
    document.body.dataset.aloVisualStyle = visualStyle;
    return () => {
      delete document.body.dataset.aloVisualStyle;
    };
  }, [visualStyle]);

  useEffect(() => {
    writeMobilePreferenceState(MOBILE_VISUAL_STYLE_LOCAL_KEY, isMobileVisualStyleLocal);
  }, [isMobileVisualStyleLocal]);

  useEffect(() => {
    writeMobilePreferenceState(MOBILE_VISUAL_STYLE_KEY, mobileVisualStyle);
  }, [mobileVisualStyle]);

  return (
    <div
      className={`app-shell${isClaudeStyle ? ' claude-style-shell' : ''}${isSupabaseStyle ? ' supabase-style-shell' : ''}${isDossierStyle ? ' dossier-style-shell' : ''}`}
      data-visual-style={visualStyle}
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: "var(--font-mono)",
        ...activeStyleTokens,
      }}
    >
      <ModulePicker isOpen={modulePickerOpen} onClose={() => setModulePickerOpen(false)} />

      <div className="app-frame desktop-app-frame">
        <aside className="app-rail" aria-label="Forge-OS navigation">
          <div className="app-rail-brand font-display notranslate" translate="no">
            <img src={resources.logoPixel} alt="" className="app-brand-mark" />
            <span className="app-brand-text notranslate" translate="no">
              <span className="app-brand-name" lang="en" translate="no">
                Forge-OS
              </span>
              <span className="app-brand-slogan" translate="no">
                Forge yourself
              </span>
            </span>
          </div>

          <div className="app-rail-section" aria-label="页面">
            <button
              type="button"
              onClick={() => setPage('dashboard')}
              className="app-rail-button"
              aria-current={page === 'dashboard' ? 'page' : undefined}
              title={forgeCopy.nav.dashboardHover}
            >
              <span className="app-rail-icon" aria-hidden="true">▦</span>
              <span className="app-rail-label">周看板</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setWeeklyReviewWeekStart('');
                setPage('weeklyReview');
              }}
              className="app-rail-button"
              aria-current={page === 'weeklyReview' ? 'page' : undefined}
            >
              <span className="app-rail-icon" aria-hidden="true">↺</span>
              <span className="app-rail-label">周复盘</span>
            </button>
            <button
              type="button"
              onClick={() => setPage('reflection')}
              className="app-rail-button"
              aria-current={page === 'reflection' ? 'page' : undefined}
              title={forgeCopy.nav.reflectionHover}
            >
              <span className="app-rail-icon" aria-hidden="true">◧</span>
              <span className="app-rail-label">反思库</span>
            </button>
            <button
              type="button"
              onClick={() => setPage('monthlyOKR')}
              className="app-rail-button"
              aria-current={page === 'monthlyOKR' ? 'page' : undefined}
            >
              <span className="app-rail-icon" aria-hidden="true">◎</span>
              <span className="app-rail-label">月度 OKR</span>
            </button>
          </div>

          <div className="app-rail-bottom">
            <div className="app-rail-section app-rail-section--system" aria-label="系统">
              <button
                type="button"
                onClick={() => setPage('system')}
                className="app-rail-button"
                aria-current={page === 'system' ? 'page' : undefined}
                title={forgeCopy.nav.systemHover}
              >
                <span className="app-rail-icon" aria-hidden="true">⚙</span>
                <span className="app-rail-label">系统</span>
                {hasUpdate && <span className="app-rail-badge">{systemCopy.nav.hasUpdateMarker}</span>}
              </button>
            </div>

            <div className="app-rail-section app-rail-section--tools" aria-label="工具">
              <button
                type="button"
                onClick={toggleVisualStyle}
                className="app-rail-button"
                aria-label={`切换视觉风格，当前：${visualStyleLabel}`}
                aria-pressed={visualStyle !== 'classic'}
                title={`当前风格：${visualStyleLabel}。点击切换复古、Claude、Supabase、Dossier 风格`}
              >
                <span className="app-rail-index">
                  {visualStyle === 'dossier' ? '档' : visualStyle === 'supabase' ? 'S' : visualStyle === 'claude' ? 'C' : '◇'}
                </span>
                <span className="app-rail-label">风格</span>
              </button>
              <button
                type="button"
                onClick={() => setModulePickerOpen(true)}
                className="app-rail-button"
                aria-label="打开模块管理"
                title={forgeCopy.nav.moduleHover}
              >
                <span className="app-rail-index">⊕</span>
                <span className="app-rail-label">模块</span>
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="app-rail-button"
                aria-label="切换明暗主题"
                title={forgeCopy.nav.themeHover}
              >
                <span className="app-rail-index">{config.theme === 'dark' ? '◐' : '◑'}</span>
                <span className="app-rail-label">主题</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="app-content-frame">
          <main className="app-main">
            {page === 'dashboard' && (
              <Dashboard />
            )}
            {page === 'reflection' && <Reflection />}
            {page === 'monthlyOKR' && <MonthlyOKR />}
            {page === 'weeklyReview' && (
              <WeeklyReview
                key={weeklyReviewWeekStart || 'current-week'}
                initialWeekStart={weeklyReviewWeekStart}
              />
            )}
            {page === 'system' && <System />}
          </main>
        </div>
      </div>

      <div className={mobileStyleScopeClassName} style={mobileStyleTokens}>
        <MobileAppShell
          onOpenModulePicker={() => setModulePickerOpen(true)}
          onToggleTheme={toggleTheme}
          onToggleVisualStyle={toggleMobileVisualStyle}
          onToggleMobileVisualStyleLocal={toggleMobileVisualStyleLocal}
          theme={config.theme ?? 'dark'}
          visualStyleLabel={effectiveMobileVisualStyleLabel}
          isMobileVisualStyleLocal={isMobileVisualStyleLocal}
          hasUpdate={hasUpdate}
        />
      </div>

      <style>{`
        body[data-forge-visual-style="claude"] {
          background-color: #faf9f5;
        }

        body[data-forge-visual-style="supabase"] {
          background-color: #0f0f0f;
        }

        body[data-forge-visual-style="dossier"] {
          background:
            linear-gradient(180deg, #2b2118 0, #2b2118 18px, transparent 18px),
            repeating-linear-gradient(90deg, rgba(30, 24, 15, 0.035) 0, rgba(30, 24, 15, 0.035) 1px, transparent 1px, transparent 24px),
            #f7f2e8;
        }

        body[data-forge-visual-style="claude"]::before {
          opacity: 0;
        }

        body[data-forge-visual-style="supabase"]::before {
          opacity: 0;
        }

        body[data-forge-visual-style="dossier"]::before {
          opacity: 0;
        }

        .claude-style-shell {
          --bg-primary: #faf9f5;
          --bg-secondary: #ffffff;
          --bg-tertiary: #f5f0e8;
          --text-primary: #141413;
          --text-secondary: #3d3d3a;
          --text-muted: #6c6a64;
          --accent-gold: #cc785c;
          --accent-success: #5db872;
          --accent-danger: #c64545;
          --border-primary: #e6dfd8;
          --border-hover: #cc785c;
          --font-display: "Cormorant Garamond", "EB Garamond", Georgia, "Times New Roman", serif;
          --font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
          --font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
          background-color: var(--bg-primary) !important;
          color: var(--text-primary) !important;
          font-variant-numeric: tabular-nums;
        }

        .supabase-style-shell {
          --bg-primary: #0f0f0f;
          --bg-secondary: #171717;
          --bg-tertiary: #202020;
          --text-primary: #fafafa;
          --text-secondary: #b7b7b7;
          --text-muted: #737373;
          --accent-gold: #3ecf8e;
          --accent-success: #3ecf8e;
          --accent-danger: #ff7b72;
          --border-primary: #2f2f2f;
          --border-hover: #3ecf8e;
          --font-display: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          --font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          --font-mono: "JetBrains Mono", "Source Code Pro", Consolas, monospace;
          background-color: var(--bg-primary) !important;
          color: var(--text-primary) !important;
          font-variant-numeric: tabular-nums;
        }

        .dossier-style-shell {
          --bg-primary: #f7f2e8;
          --bg-secondary: #fffaf0;
          --bg-tertiary: #eee5d4;
          --text-primary: #171412;
          --text-secondary: #4f463d;
          --text-muted: #6a6258;
          --accent-gold: #9f2019;
          --accent-success: #1f6f49;
          --accent-danger: #9f2019;
          --border-primary: #8d7d64;
          --border-hover: #9f2019;
          --font-display: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
          --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
          --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace;
          background:
            linear-gradient(180deg, #2b2118 0, #2b2118 18px, transparent 18px),
            repeating-linear-gradient(90deg, rgba(30, 24, 15, 0.035) 0, rgba(30, 24, 15, 0.035) 1px, transparent 1px, transparent 24px),
            var(--bg-primary) !important;
          color: var(--text-primary) !important;
          font-variant-numeric: tabular-nums;
        }

        .claude-style-shell .app-main {
          background: transparent !important;
          padding: var(--space-4) var(--space-5) var(--space-7) !important;
        }

        .supabase-style-shell .app-main {
          background:
            radial-gradient(circle at 18% 0%, rgba(62, 207, 142, 0.08), transparent 32%),
            radial-gradient(circle at 82% 10%, rgba(62, 207, 142, 0.05), transparent 28%);
          padding: var(--space-4) var(--space-5) var(--space-7) !important;
        }

        .dossier-style-shell .app-main {
          background:
            linear-gradient(180deg, rgba(255, 250, 240, 0.28), transparent 180px),
            repeating-linear-gradient(90deg, rgba(30, 24, 15, 0.03) 0, rgba(30, 24, 15, 0.03) 1px, transparent 1px, transparent 24px);
          padding: var(--space-4) var(--space-5) var(--space-7) !important;
        }

        .app-brand-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          line-height: 1;
        }

        .app-brand-name {
          color: var(--text-primary);
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0;
          line-height: 1;
          text-transform: none;
        }

        .app-brand-slogan {
          color: var(--text-secondary);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0;
          line-height: 1.2;
          text-transform: none;
          white-space: nowrap;
        }

        .claude-style-shell .app-rail {
          padding: 24px 16px !important;
          background-color: rgba(255, 255, 255, 0.82) !important;
          backdrop-filter: saturate(120%) blur(10px);
        }

        .supabase-style-shell .app-rail {
          padding: 24px 16px !important;
          background-color: rgba(10, 10, 10, 0.94) !important;
          border-right-color: var(--border-primary);
          backdrop-filter: saturate(120%) blur(14px);
        }

        .dossier-style-shell .app-rail {
          padding: 24px 16px !important;
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.46), transparent 180px),
            rgba(255, 250, 240, 0.92) !important;
          border-right: 2px solid var(--text-primary) !important;
          box-shadow: 10px 0 28px rgba(30, 24, 15, 0.08);
        }

        .claude-style-shell .app-rail-brand {
          color: var(--text-primary) !important;
          font-family: var(--font-display);
          font-size: 28px;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: none;
        }

        .supabase-style-shell .app-rail-brand {
          color: var(--text-primary) !important;
          font-family: var(--font-display);
          font-weight: 700;
          letter-spacing: -0.01em;
          text-transform: none;
        }

        .dossier-style-shell .app-rail-brand {
          align-items: center;
          border-bottom: 2px solid var(--text-primary);
          color: var(--text-primary) !important;
          font-family: var(--font-display);
          font-weight: 900;
          letter-spacing: 0;
          padding-bottom: 14px;
          text-transform: none;
        }

        .claude-style-shell .app-brand-name {
          font-family: var(--font-display);
          font-size: 28px;
        }

        .supabase-style-shell .app-brand-name {
          font-family: var(--font-display);
          font-size: 22px;
          letter-spacing: -0.01em;
        }

        .dossier-style-shell .app-brand-name {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 950;
          letter-spacing: 0;
        }

        .claude-style-shell .app-brand-slogan {
          font-family: var(--font-sans);
          font-size: 12px;
        }

        .supabase-style-shell .app-brand-slogan {
          color: var(--text-muted);
          font-family: var(--font-sans);
          font-size: 12px;
        }

        .dossier-style-shell .app-brand-slogan {
          color: var(--text-muted);
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .claude-style-shell .app-rail-button {
          min-height: 34px;
          border: 1px solid transparent !important;
          border-radius: 8px;
          background: transparent !important;
          color: var(--text-secondary) !important;
          font-family: var(--font-sans) !important;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0;
          line-height: 1;
          padding: 8px 10px !important;
          text-transform: none;
        }

        .supabase-style-shell .app-rail-button {
          min-height: 36px;
          border: 1px solid transparent !important;
          border-radius: 8px;
          background: transparent !important;
          color: var(--text-secondary) !important;
          font-family: var(--font-sans) !important;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0;
          line-height: 1;
          padding: 8px 10px !important;
          text-transform: none;
        }

        .dossier-style-shell .app-rail-button {
          min-height: 36px;
          border: 1px solid transparent !important;
          border-radius: 0;
          background: transparent !important;
          color: var(--text-secondary) !important;
          font-family: var(--font-sans) !important;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0;
          line-height: 1;
          padding: 8px 10px !important;
          text-transform: none;
        }

        .claude-style-shell .app-rail-button:hover {
          border-color: var(--border-primary) !important;
          background: rgba(255, 255, 255, 0.62) !important;
          color: var(--text-primary) !important;
        }

        .supabase-style-shell .app-rail-button:hover {
          border-color: var(--border-primary) !important;
          background: rgba(62, 207, 142, 0.08) !important;
          color: var(--text-primary) !important;
        }

        .dossier-style-shell .app-rail-button:hover {
          border-color: var(--border-primary) !important;
          background: rgba(159, 32, 25, 0.06) !important;
          color: var(--text-primary) !important;
        }

        .claude-style-shell .app-rail-button[aria-current="page"],
        .claude-style-shell .app-rail-button[aria-pressed="true"] {
          border-color: rgba(204, 120, 92, 0.28) !important;
          background: rgba(204, 120, 92, 0.08) !important;
          color: var(--accent-gold) !important;
        }

        .supabase-style-shell .app-rail-button[aria-current="page"],
        .supabase-style-shell .app-rail-button[aria-pressed="true"] {
          border-color: rgba(62, 207, 142, 0.26) !important;
          background: rgba(62, 207, 142, 0.1) !important;
          color: var(--accent-gold) !important;
          box-shadow: inset 0 0 0 1px rgba(62, 207, 142, 0.08);
        }

        .dossier-style-shell .app-rail-button[aria-current="page"],
        .dossier-style-shell .app-rail-button[aria-pressed="true"] {
          border-color: var(--accent-gold) !important;
          background: var(--accent-gold) !important;
          color: var(--bg-secondary) !important;
          box-shadow: 0 6px 14px rgba(30, 24, 15, 0.12);
        }

        .claude-style-shell .font-display {
          font-family: var(--font-display);
          font-weight: 700;
          letter-spacing: 0;
          text-transform: none;
        }

        .claude-style-shell .font-h1,
        .claude-style-shell .font-h2,
        .claude-style-shell .font-h3,
        .claude-style-shell .font-body,
        .claude-style-shell .font-caption {
          letter-spacing: 0;
          text-transform: none;
        }

        .supabase-style-shell .font-display,
        .supabase-style-shell .font-h1,
        .supabase-style-shell .font-h2,
        .supabase-style-shell .font-h3,
        .supabase-style-shell .font-body,
        .supabase-style-shell .font-caption {
          letter-spacing: 0;
          text-transform: none;
        }

        .dossier-style-shell .font-display,
        .dossier-style-shell .font-h1,
        .dossier-style-shell .font-h2,
        .dossier-style-shell .font-h3,
        .dossier-style-shell .font-body,
        .dossier-style-shell .font-caption {
          letter-spacing: 0;
          text-transform: none;
        }

        .supabase-style-shell .font-display,
        .supabase-style-shell .font-h1,
        .supabase-style-shell .font-h2,
        .supabase-style-shell .font-h3 {
          font-family: var(--font-display);
        }

        .dossier-style-shell .font-display,
        .dossier-style-shell .font-h1,
        .dossier-style-shell .font-h2,
        .dossier-style-shell .font-h3 {
          font-family: var(--font-display);
          font-weight: 900;
        }

        .claude-style-shell .font-body {
          font-size: 14px;
        }

        .supabase-style-shell .font-body {
          font-family: var(--font-sans);
          font-size: 14px;
        }

        .dossier-style-shell .font-body {
          font-family: var(--font-sans);
          font-size: 14px;
        }

        .claude-style-shell .font-caption {
          font-size: 12px;
        }

        .supabase-style-shell .font-caption {
          color: var(--text-muted);
          font-size: 12px;
        }

        .dossier-style-shell .font-caption {
          color: var(--text-muted);
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 800;
        }

        .claude-style-shell .ascii-box {
          overflow: hidden;
          border-radius: 8px;
          border-color: var(--border-primary);
          background-color: var(--bg-secondary);
          box-shadow: none;
        }

        .supabase-style-shell .ascii-box {
          overflow: hidden;
          border-radius: 12px;
          border-color: var(--border-primary);
          background-color: rgba(23, 23, 23, 0.92);
          box-shadow: none;
        }

        .dossier-style-shell .ascii-box {
          overflow: hidden;
          border: 2px solid var(--text-primary);
          border-radius: 0;
          background-color: var(--bg-secondary);
          box-shadow: 0 8px 24px rgba(30, 24, 15, 0.08);
        }

        .claude-style-shell .ascii-box:hover {
          border-color: rgba(204, 120, 92, 0.5);
        }

        .supabase-style-shell .ascii-box:hover {
          border-color: color-mix(in srgb, var(--accent-gold) 48%, var(--border-primary));
        }

        .dossier-style-shell .ascii-box:hover {
          border-color: var(--accent-gold);
        }

        .claude-style-shell .ascii-box-title {
          border-bottom-color: var(--border-primary);
          background: rgba(250, 249, 245, 0.72);
          color: var(--accent-gold);
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: none;
          white-space: normal;
        }

        .supabase-style-shell .ascii-box-title {
          border-bottom-color: var(--border-primary);
          background: rgba(32, 32, 32, 0.72);
          color: var(--accent-gold);
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.01em;
          text-transform: none;
          white-space: normal;
        }

        .dossier-style-shell .ascii-box-title {
          border-bottom: 2px solid var(--text-primary);
          background: var(--bg-tertiary);
          color: var(--accent-gold);
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 950;
          letter-spacing: 0;
          text-transform: none;
          white-space: normal;
        }

        .claude-style-shell .task-column {
          border: 1px solid var(--border-primary) !important;
          border-radius: 8px;
          background-color: var(--bg-secondary) !important;
          overflow: hidden;
        }

        .supabase-style-shell .task-column {
          border: 1px solid var(--border-primary) !important;
          border-radius: 12px;
          background-color: rgba(23, 23, 23, 0.92) !important;
          overflow: hidden;
        }

        .dossier-style-shell .task-column {
          border: 2px solid var(--text-primary) !important;
          border-radius: 0;
          background-color: var(--bg-secondary) !important;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(30, 24, 15, 0.08);
        }

        .claude-style-shell .task-column-header {
          background: rgba(250, 249, 245, 0.78) !important;
        }

        .supabase-style-shell .task-column-header {
          background: rgba(32, 32, 32, 0.88) !important;
          color: var(--accent-gold);
        }

        .dossier-style-shell .task-column-header {
          border-bottom: 2px solid var(--text-primary);
          background: var(--bg-tertiary) !important;
          color: var(--accent-gold);
        }

        .claude-style-shell .task-column-footer {
          background: rgba(250, 249, 245, 0.46);
        }

        .supabase-style-shell .task-column-footer {
          background: rgba(32, 32, 32, 0.52);
        }

        .dossier-style-shell .task-column-footer {
          background: rgba(238, 229, 212, 0.66);
          border-top: 1px dashed var(--border-primary);
        }

        .claude-style-shell .task-card {
          border-radius: 8px;
          background-color: #faf9f5 !important;
          border-color: var(--border-primary) !important;
        }

        .supabase-style-shell .task-card {
          border-radius: 8px;
          background-color: #202020 !important;
          border-color: var(--border-primary) !important;
        }

        .dossier-style-shell .task-card {
          border-radius: 0;
          background-color: var(--bg-primary) !important;
          border-color: var(--border-primary) !important;
        }

        .claude-style-shell .task-card:hover {
          background-color: var(--bg-secondary) !important;
          border-color: rgba(204, 120, 92, 0.5) !important;
        }

        .supabase-style-shell .task-card:hover {
          background-color: #252525 !important;
          border-color: color-mix(in srgb, var(--accent-gold) 50%, var(--border-primary)) !important;
        }

        .dossier-style-shell .task-card:hover {
          background-color: var(--bg-secondary) !important;
          border-color: var(--accent-gold) !important;
        }

        .claude-style-shell .forge-empty-state-image {
          display: none !important;
        }

        .supabase-style-shell .forge-empty-state-image {
          display: none !important;
        }

        .dossier-style-shell .forge-empty-state-image {
          display: none !important;
        }

        .claude-style-shell button:focus-visible,
        .claude-style-shell a:focus-visible,
        .claude-style-shell input:focus-visible,
        .claude-style-shell textarea:focus-visible,
        .claude-style-shell select:focus-visible {
          outline: 2px solid rgba(204, 120, 92, 0.58);
          outline-offset: 3px;
        }

        .supabase-style-shell button:focus-visible,
        .supabase-style-shell a:focus-visible,
        .supabase-style-shell input:focus-visible,
        .supabase-style-shell textarea:focus-visible,
        .supabase-style-shell select:focus-visible {
          outline: 2px solid rgba(62, 207, 142, 0.72);
          outline-offset: 3px;
        }

        .dossier-style-shell button:focus-visible,
        .dossier-style-shell a:focus-visible,
        .dossier-style-shell input:focus-visible,
        .dossier-style-shell textarea:focus-visible,
        .dossier-style-shell select:focus-visible {
          outline: 3px double rgba(159, 32, 25, 0.72);
          outline-offset: 3px;
        }

        .claude-style-shell .btn-invert:hover,
        .claude-style-shell .btn-invert:focus-visible {
          border-color: var(--accent-gold) !important;
          background-color: rgba(204, 120, 92, 0.08) !important;
          color: var(--accent-gold) !important;
        }

        .supabase-style-shell .btn-invert:hover,
        .supabase-style-shell .btn-invert:focus-visible {
          border-color: var(--accent-gold) !important;
          background-color: rgba(62, 207, 142, 0.1) !important;
          color: var(--accent-gold) !important;
        }

        .dossier-style-shell .btn-invert:hover,
        .dossier-style-shell .btn-invert:focus-visible {
          border-color: var(--accent-gold) !important;
          background-color: rgba(159, 32, 25, 0.08) !important;
          color: var(--accent-gold) !important;
        }

        .claude-style-shell .mobile-app-shell {
          --mobile-radius: 12px;
          --mobile-surface: rgba(255, 255, 255, 0.86);
          --mobile-surface-strong: #ffffff;
          --mobile-surface-soft: rgba(245, 240, 232, 0.82);
          --mobile-line: var(--border-primary);
          --mobile-muted-line: rgba(230, 223, 216, 0.9);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.42), transparent 180px),
            var(--bg-primary);
          color: var(--text-primary);
          font-family: var(--font-sans);
        }

        .claude-style-shell .mobile-daily-command,
        .claude-style-shell .mobile-capture-composer,
        .claude-style-shell .mobile-week-console,
        .claude-style-shell .mobile-system-status,
        .claude-style-shell .mobile-system-tools .ascii-box {
          border: 1px solid var(--mobile-line);
          border-radius: var(--mobile-radius);
          background: var(--mobile-surface);
          box-shadow: 0 10px 28px rgba(20, 20, 19, 0.06);
        }

        .claude-style-shell .mobile-bottom-nav {
          backdrop-filter: saturate(120%) blur(16px);
          background: rgba(250, 249, 245, 0.92);
          border-top: 1px solid var(--mobile-line);
        }

        .claude-style-shell .mobile-nav-button {
          border-radius: 10px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .claude-style-shell .mobile-nav-button[aria-current="page"] {
          background: rgba(204, 120, 92, 0.12);
          color: var(--accent-gold);
        }

        .claude-style-shell .mobile-nav-button[aria-current="page"] span {
          color: var(--accent-gold);
        }

        .claude-style-shell .mobile-system-row {
          border: 1px solid var(--mobile-muted-line);
          border-radius: 10px;
          background: var(--mobile-surface-soft);
        }

        .dossier-style-shell .mobile-app-shell {
          --mobile-radius: 8px;
          --mobile-surface: rgba(255, 250, 240, 0.92);
          --mobile-surface-strong: #fffaf0;
          --mobile-surface-soft: rgba(238, 229, 212, 0.72);
          --mobile-line: var(--border-primary);
          --mobile-muted-line: rgba(141, 125, 100, 0.58);
          background:
            repeating-linear-gradient(90deg, rgba(30, 24, 15, 0.035) 0, rgba(30, 24, 15, 0.035) 1px, transparent 1px, transparent 24px),
            var(--bg-primary);
          color: var(--text-primary);
        }

        .dossier-style-shell .mobile-daily-command,
        .dossier-style-shell .mobile-capture-composer,
        .dossier-style-shell .mobile-week-console,
        .dossier-style-shell .mobile-system-status,
        .dossier-style-shell .mobile-system-tools .ascii-box {
          border: 2px solid var(--text-primary);
          border-radius: var(--mobile-radius);
          background: var(--mobile-surface-strong);
          box-shadow: 0 8px 24px rgba(30, 24, 15, 0.08);
        }

        .dossier-style-shell .mobile-mood-summary {
          min-height: 44px;
        }

        .dossier-style-shell .mobile-bottom-nav {
          backdrop-filter: none;
          background: rgba(255, 250, 240, 0.96);
          border-top: 2px solid var(--text-primary);
        }

        .dossier-style-shell .mobile-nav-button {
          border-radius: 0;
          color: var(--text-secondary);
          font-weight: 900;
        }

        .dossier-style-shell .mobile-nav-button[aria-current="page"] {
          background: var(--accent-gold);
          border-radius: 0;
          color: var(--bg-secondary);
        }

        .dossier-style-shell .mobile-nav-button[aria-current="page"] span {
          color: var(--bg-secondary);
        }

        .dossier-style-shell .mobile-system-row {
          border: 1px solid var(--border-primary);
          border-radius: 0;
          background: rgba(255, 250, 240, 0.72);
        }

        @media (max-width: 767px) {
          .claude-style-shell .app-main {
            padding: 20px 14px 40px !important;
          }

          .supabase-style-shell .app-main {
            padding: 20px 14px 40px !important;
          }

          .dossier-style-shell .app-main {
            padding: 20px 14px 40px !important;
          }

          .claude-style-shell .app-rail {
            height: auto !important;
            min-height: 60px;
            padding: 6px 10px !important;
            flex-wrap: wrap !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
            gap: 4px;
          }

          .supabase-style-shell .app-rail {
            height: auto !important;
            min-height: 60px;
            padding: 6px 10px !important;
            flex-wrap: wrap !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
            gap: 4px;
          }

          .dossier-style-shell .app-rail {
            height: auto !important;
            min-height: 60px;
            padding: 6px 10px !important;
            flex-wrap: wrap !important;
            align-items: flex-start !important;
            justify-content: flex-start !important;
            gap: 4px;
          }

          .claude-style-shell .app-rail-brand {
            width: 100%;
            font-size: 22px;
          }

          .supabase-style-shell .app-rail-brand {
            width: 100%;
            font-size: 20px;
          }

          .dossier-style-shell .app-rail-brand {
            width: 100%;
            font-size: 20px;
          }

          .app-brand-slogan {
            display: none;
          }

          .claude-style-shell .app-rail-section {
            width: 100%;
            padding-bottom: 2px;
          }

          .supabase-style-shell .app-rail-section {
            width: 100%;
            padding-bottom: 2px;
          }

          .dossier-style-shell .app-rail-section {
            width: 100%;
            padding-bottom: 2px;
          }

          .claude-style-shell .app-rail-button,
          .supabase-style-shell .app-rail-button,
          .dossier-style-shell .app-rail-button {
            grid-template-columns: 1fr;
            justify-items: center;
            min-height: 40px;
            text-align: center;
          }

          .claude-style-shell .app-rail-section--tools .app-rail-button,
          .supabase-style-shell .app-rail-section--tools .app-rail-button,
          .dossier-style-shell .app-rail-section--tools .app-rail-button {
            min-height: 34px;
          }

          .claude-style-shell .reflection-grid,
          .claude-style-shell .weekly-review-layout,
          .claude-style-shell .system-layout {
            grid-template-columns: 1fr !important;
            flex-direction: column !important;
          }

          .supabase-style-shell .reflection-grid,
          .supabase-style-shell .weekly-review-layout,
          .supabase-style-shell .system-layout {
            grid-template-columns: 1fr !important;
            flex-direction: column !important;
          }

          .dossier-style-shell .reflection-grid,
          .dossier-style-shell .weekly-review-layout,
          .dossier-style-shell .system-layout {
            grid-template-columns: 1fr !important;
            flex-direction: column !important;
          }

          .weekly-review-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Last Words Overlay */}
      <div
        ref={lastWordsRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'var(--space-3) var(--space-6)',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-primary)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          textAlign: 'center',
          opacity: 0,
          transform: 'translateY(100%)',
          transition: 'opacity 300ms ease, transform 300ms ease',
          zIndex: 10000,
          pointerEvents: 'none',
        }}
      >
        {lastWordsMessage}
      </div>
    </div>
  );
}

export default App;
