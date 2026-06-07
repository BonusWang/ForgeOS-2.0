import React from 'react';
import OKRPanel from '../features/okr/OKRPanel';
import MonthlyEvidencePreview from '../features/evidence/MonthlyEvidencePreview';

const MonthlyOKR: React.FC = () => {
  return (
    <div className="workspace-page monthly-okr-page">
      <section className="workspace-section monthly-okr-section" aria-label="月度 OKR">
        <MonthlyEvidencePreview />
        <OKRPanel />
      </section>
    </div>
  );
};

export default MonthlyOKR;
