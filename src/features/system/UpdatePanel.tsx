import React, { useState } from 'react';
import AsciiBox from '../../components/AsciiBox';
import { toMonksCalendar } from '../../utils/monksCalendar';
import { checkUpdate, APP_VERSION } from '../../utils/checkUpdate';
import { pickUpdateErrorCopy, systemCopy } from '../../copy/system-copy';

interface UpdatePanelProps {
  embedded?: boolean;
}

const UpdatePanel: React.FC<UpdatePanelProps> = ({ embedded = false }) => {
  const [version] = useState<string>(() => {
    try {
      return window.electronAPI?.getAppVersion?.() ?? APP_VERSION;
    } catch {
      return APP_VERSION;
    }
  });
  const [status, setStatus] = useState<
    'idle' | 'checking' | 'up-to-date' | 'has-update' | 'error'
  >('idle');
  const [latestUrl, setLatestUrl] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');

  const handleCheck = async () => {
    setStatus('checking');
    const result = await checkUpdate(version);
    if (result.error) {
      setErrorText(pickUpdateErrorCopy());
      setStatus('error');
      return;
    }
    if (result.hasUpdate && result.latest) {
      setStatus('has-update');
      setLatestUrl(result.latest.url);
    } else {
      setStatus('up-to-date');
    }
  };

  const statusText = {
    idle: '',
    checking: systemCopy.update.checking,
    'up-to-date': systemCopy.update.upToDate,
    'has-update': `${systemCopy.update.hasUpdate}`,
    error: errorText,
  }[status];

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
        {systemCopy.update.currentVersion}：
        <span
          className="font-mono-data"
          style={{ color: 'var(--accent-gold)', marginLeft: 'var(--space-2)' }}
        >
          {toMonksCalendar(version)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        <button
          onClick={handleCheck}
          disabled={status === 'checking'}
          className="font-caption btn-invert"
          style={{
            background: 'none',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-secondary)',
            cursor: status === 'checking' ? 'wait' : 'pointer',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            padding: 'var(--space-1) var(--space-3)',
            opacity: status === 'checking' ? 0.6 : 1,
          }}
        >
          {status === 'checking'
            ? `[  ${systemCopy.update.checking}  ]`
            : `[  ${systemCopy.update.checkButton}  ]`}
        </button>
      </div>

      {statusText && (
        <div
          className="font-caption"
          style={{
            color:
              status === 'has-update'
                ? 'var(--accent-gold)'
                : status === 'error'
                ? 'var(--accent-danger)'
                : 'var(--text-secondary)',
          }}
        >
          {statusText}
          {status === 'has-update' && latestUrl && (
            <>
              {' '}
              <a
                href={latestUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}
                className="font-caption"
              >
                {systemCopy.update.downloadUrl}
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <AsciiBox title="更新">
      {content}
    </AsciiBox>
  );
};

export default UpdatePanel;
