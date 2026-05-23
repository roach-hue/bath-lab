/**
 * DimensionForm — bath lab Step 1 진입 폼.
 *
 * 가로(W) / 세로(D) / 높이(H) mm 만 입력. 모두 양수일 때 [시작] 활성.
 * 입력 단위는 mm (기존 프로젝트 표준 따름).
 */
import { useState } from 'react';

export type BathDimensions = {
  w_mm: number;
  d_mm: number;
  h_mm: number;
};

type Props = {
  onSubmit: (dims: BathDimensions) => void;
  initial?: BathDimensions | null;
};

const DEFAULTS: BathDimensions = { w_mm: 2000, d_mm: 1800, h_mm: 2400 };

export default function DimensionForm({ onSubmit, initial }: Props) {
  const seed = initial ?? DEFAULTS;
  const [w, setW] = useState<string>(String(seed.w_mm));
  const [d, setD] = useState<string>(String(seed.d_mm));
  const [h, setH] = useState<string>(String(seed.h_mm));

  const wNum = Number(w);
  const dNum = Number(d);
  const hNum = Number(h);
  const valid =
    Number.isFinite(wNum) && wNum > 0 &&
    Number.isFinite(dNum) && dNum > 0 &&
    Number.isFinite(hNum) && hNum > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ w_mm: wNum, d_mm: dNum, h_mm: hNum });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50 text-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">bath lab</h1>
          <p className="text-sm text-slate-600 mt-2">화장실 분위기 검증 prototype</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-slate-900"
        >
          <DimField label="가로 (W)" value={w} onChange={setW} />
          <DimField label="세로 (D)" value={d} onChange={setD} />
          <DimField label="높이 (H)" value={h} onChange={setH} />

          <button
            type="submit"
            disabled={!valid}
            className="w-full mt-4 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed bg-slate-800 text-white hover:bg-slate-700"
          >
            시작
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-500 text-center">
          단위: mm. 직사각형 공간 기준.
        </p>
      </div>
    </div>
  );
}

function DimField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-medium text-slate-900 mb-1.5">{label}</span>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 pr-12 bg-white text-slate-900 placeholder-slate-400 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">
          mm
        </span>
      </div>
    </label>
  );
}
