/**
 * BathPage — bath lab entry.
 *
 * 3-step 흐름:
 *   form     → DimensionForm (W/D/H 입력)
 *   live     → MoodViewer (three.js 실시간 + 슬라이더)
 *   snapshot → SnapshotViewer (Step 7 path tracer)
 *
 * 기존 도면 파싱 / 브랜드 매뉴얼 / 배치 엔진 미경유 — 순수 시각화 prototype.
 */
import { useState } from 'react';
import DimensionForm, { BathDimensions } from '../../components/lab/DimensionForm';
import MoodViewer from '../../components/lab/MoodViewer';
import SnapshotViewer from '../../components/lab/SnapshotViewer';
import { DEFAULT_MOOD, MoodState } from '../../components/lab/moodState';

type Step = 'form' | 'live' | 'snapshot';

export default function BathPage() {
  const [step, setStep] = useState<Step>('form');
  const [dims, setDims] = useState<BathDimensions | null>(null);
  // Step 7 — mood 를 BathPage 가 보유 → live/snapshot 전환 시 슬라이더 셋업 보존
  const [mood, setMood] = useState<MoodState>(DEFAULT_MOOD);

  if (step === 'snapshot' && dims) {
    return (
      <SnapshotViewer
        dims={dims}
        mood={mood}
        onBack={() => setStep('form')}
        onLiveMode={() => setStep('live')}
      />
    );
  }

  if (step === 'live' && dims) {
    return (
      <MoodViewer
        dims={dims}
        mood={mood}
        setMood={setMood}
        onBack={() => setStep('form')}
        onSnapshot={() => setStep('snapshot')}
      />
    );
  }

  return (
    <DimensionForm
      initial={dims}
      onSubmit={(d) => {
        setDims(d);
        setStep('live');
      }}
    />
  );
}
