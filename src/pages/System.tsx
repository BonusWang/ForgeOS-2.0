import React from 'react';
import AsciiBox from '../components/AsciiBox';
import UpdatePanel from '../features/system/UpdatePanel';
import DataBackupPanel from '../features/system/DataBackupPanel';
import DataHealthPanel from '../features/system/DataHealthPanel';
import SyncPanel from '../features/system/SyncPanel';
import UsageRitualPanel from '../features/system/UsageRitualPanel';
import { systemCopy } from '../copy/system-copy';

const System: React.FC = () => {
  return (
    <div className="workspace-page system-page">
      <section className="system-layout workspace-grid workspace-grid--system">
        <div className="system-column system-column--identity">
          <AsciiBox title={systemCopy.about.title} className="system-about-update-card">
            <div className="system-about-update">
              <div className="system-about-copy">
                <div className="font-h2" style={{ color: 'var(--accent-gold)' }}>
                  {systemCopy.about.appName}
                </div>
                <div className="font-body" style={{ color: 'var(--text-secondary)' }}>
                  {systemCopy.about.description}
                </div>
                <div className="font-caption" style={{ color: 'var(--text-muted)' }}>
                  {systemCopy.about.author} · {systemCopy.about.license}
                </div>
              </div>
              <div className="system-update-embed">
                <UpdatePanel embedded />
              </div>
            </div>
          </AsciiBox>
          <DataHealthPanel />
          <DataBackupPanel />
        </div>

        <div className="system-column system-column--operations">
          <UsageRitualPanel />
          <SyncPanel />
        </div>
      </section>
    </div>
  );
};

export default System;
