/**
 * BathPage — bath lab entry (라우트: /bath).
 *
 * 2-step 흐름:
 *   form   → DimensionForm (W/D/H 입력)
 *   viewer → MoodViewer (three.js + 8 컨트롤)
 *
 * 기존 도면 파싱 / 브랜드 매뉴얼 / 배치 엔진 미경유 — 순수 시각화 prototype.
 */
import { useState } from 'react';
import DimensionForm, { BathDimensions } from '../../components/lab/DimensionForm';
import MoodViewer from '../../components/lab/MoodViewer';

type Step = 'form' | 'viewer';

export default function BathPage() {
  const [step, setStep] = useState<Step>('form');
  const [dims, setDims] = useState<BathDimensions | null>(null);

  if (step === 'viewer' && dims) {
    return <MoodViewer dims={dims} onBack={() => setStep('form')} />;
  }

  return (
    <DimensionForm
      initial={dims}
      onSubmit={(d) => {
        setDims(d);
        setStep('viewer');
      }}
    />
  );
}
