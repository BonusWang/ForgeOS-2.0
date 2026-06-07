import React, { useState } from 'react';
import ReflectionGrid from '../features/reflections/ReflectionGrid';
import ReflectionDetailModal from '../features/reflections/ReflectionDetailModal';
import AbilityReader from '../features/abilities/AbilityReader';
import AbilityTraining from '../features/abilities/AbilityTraining';
import GrowthEvidenceArchive from '../features/evidence/GrowthEvidenceArchive';
import AsciiBox from '../components/AsciiBox';
import type { Reflection } from '../types';

const ReflectionPage: React.FC = () => {
  const [selectedReflection, setSelectedReflection] = useState<Reflection | null>(null);

  return (
    <div className="workspace-page reflection-page">
      <section
        className="reflection-grid workspace-grid workspace-grid--reflection"
        aria-label="反思库与能力训练"
      >
        <div>
          <AsciiBox title="反思库" className="reflection-library-box">
            <ReflectionGrid onViewDetail={setSelectedReflection} />
          </AsciiBox>
        </div>

        <div className="workspace-stack reflection-side-stack">
          <GrowthEvidenceArchive />
          <AbilityReader />
          <AbilityTraining />
        </div>
      </section>

      <ReflectionDetailModal
        reflection={selectedReflection}
        onClose={() => setSelectedReflection(null)}
      />
    </div>
  );
};

export default ReflectionPage;
