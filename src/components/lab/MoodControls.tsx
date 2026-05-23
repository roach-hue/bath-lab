/**
 * MoodControls — bath lab Step 2 좌측 컨트롤 패널.
 *
 * 8개 컨트롤:
 *   1) 벽 색
 *   2) roughness (매트 ↔ 광택)
 *   3) metalness (비금속 ↔ 금속)
 *   4) 환경맵 preset (반사 IBL — drei <Environment>)
 *   5) ambient 조명 강도
 *   6) spotLight 위치 (X / Y / Z mm)
 *   7) spotLight 색
 *   8) tone mapping (Linear / ACES) + exposure
 */
import type {
  MoodState,
  EnvBuiltinPreset,
  EnvHdrFile,
} from './moodState';
import { TEXTURE_OPTIONS, type TextureSetKey } from './textureSets';

const ENV_PRESETS: EnvBuiltinPreset[] = [
  'apartment',
  'city',
  'dawn',
  'forest',
  'lobby',
  'night',
  'park',
  'studio',
  'sunset',
  'warehouse',
];

const ENV_HDRS: EnvHdrFile[] = [
  'studio_small_03_1k',
  'lebombo_1k',
  'kloofendal_48d_partly_cloudy_puresky_1k',
];

type Props = {
  state: MoodState;
  setState: (next: MoodState) => void;
  onBack: () => void;
};

export default function MoodControls({ state, setState, onBack }: Props) {
  const patch = (p: Partial<MoodState>) => setState({ ...state, ...p });

  return (
    <div className="w-full h-full overflow-y-auto bg-white text-slate-900 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">bath lab · 분위기 컨트롤</h2>
        <button
          onClick={onBack}
          className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-300 bg-white"
        >
          ← 수치
        </button>
      </div>

      <Section title="0 · PBR 텍스쳐 (면별)">
        <div className="space-y-2">
          <TextureSelect
            face="벽"
            value={state.wallTexture}
            onChange={(k) => patch({ wallTexture: k })}
          />
          <TextureSelect
            face="바닥"
            value={state.floorTexture}
            onChange={(k) => patch({ floorTexture: k })}
          />
          <TextureSelect
            face="천장"
            value={state.ceilingTexture}
            onChange={(k) => patch({ ceilingTexture: k })}
          />
        </div>
        <div className="mt-2">
          <Slider
            title="텍스쳐 반복 (tiling)"
            value={state.textureRepeat}
            min={1}
            max={10}
            step={0.5}
            onChange={(v) => patch({ textureRepeat: v })}
            hint={`${state.textureRepeat.toFixed(1)}×`}
          />
        </div>
      </Section>

      <Section title="1 · 벽 색 (텍스쳐 없을 때 / multiply)">
        <input
          type="color"
          value={state.wallColor}
          onChange={(e) => patch({ wallColor: e.target.value })}
          className="w-full h-9 rounded border border-slate-300 bg-white cursor-pointer"
        />
      </Section>

      <Slider
        title="2 · roughness (매트 ↔ 광택)"
        value={state.roughness}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => patch({ roughness: v })}
        hint={`${state.roughness.toFixed(2)}`}
      />

      <Slider
        title="3 · metalness (비금속 ↔ 금속)"
        value={state.metalness}
        min={0}
        max={1}
        step={0.01}
        onChange={(v) => patch({ metalness: v })}
        hint={`${state.metalness.toFixed(2)}`}
      />

      <Section title="4 · 환경맵 (반사 IBL)">
        <select
          value={
            state.env.source === 'preset'
              ? `preset:${state.env.key}`
              : `hdr:${state.env.key}`
          }
          onChange={(e) => {
            const [src, key] = e.target.value.split(':') as ['preset' | 'hdr', string];
            patch({
              env:
                src === 'preset'
                  ? { source: 'preset', key: key as EnvBuiltinPreset }
                  : { source: 'hdr', key: key as EnvHdrFile },
            });
          }}
          className="w-full px-2 py-1.5 text-sm bg-white text-slate-900 border border-slate-300 rounded"
        >
          <optgroup label="실파일 HDRI (PolyHaven CC0)">
            {ENV_HDRS.map((k) => (
              <option key={`hdr:${k}`} value={`hdr:${k}`}>
                {k}
              </option>
            ))}
          </optgroup>
          <optgroup label="내장 preset (drei LDR)">
            {ENV_PRESETS.map((p) => (
              <option key={`preset:${p}`} value={`preset:${p}`}>
                {p}
              </option>
            ))}
          </optgroup>
        </select>
      </Section>

      <Slider
        title="5 · ambient 조명 강도"
        value={state.ambientIntensity}
        min={0}
        max={5}
        step={0.05}
        onChange={(v) => patch({ ambientIntensity: v })}
        hint={`${state.ambientIntensity.toFixed(2)}`}
      />

      <Section title="6 · spotLight 위치 (mm, 공간 중심 기준)">
        <div className="grid grid-cols-3 gap-2">
          <NumField
            label="X"
            value={state.spotX_mm}
            onChange={(v) => patch({ spotX_mm: v })}
          />
          <NumField
            label="Y"
            value={state.spotY_mm}
            onChange={(v) => patch({ spotY_mm: v })}
          />
          <NumField
            label="Z"
            value={state.spotZ_mm}
            onChange={(v) => patch({ spotZ_mm: v })}
          />
        </div>
        <Slider
          title="spot 강도"
          value={state.spotIntensity}
          min={0}
          max={20}
          step={0.1}
          onChange={(v) => patch({ spotIntensity: v })}
          hint={`${state.spotIntensity.toFixed(1)}`}
        />
      </Section>

      <Section title="7 · spotLight 색">
        <input
          type="color"
          value={state.spotColor}
          onChange={(e) => patch({ spotColor: e.target.value })}
          className="w-full h-9 rounded border border-slate-300 bg-white cursor-pointer"
        />
      </Section>

      <Section title="3+ · meshPhysical 확장 (Step 3)">
        <div className="space-y-3 border-l-2 border-slate-200 pl-3">
          <Slider
            title="clearcoat (코팅 광택, 도자기)"
            value={state.clearcoat}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ clearcoat: v })}
            hint={`${state.clearcoat.toFixed(2)}`}
          />
          <Slider
            title="clearcoat roughness"
            value={state.clearcoatRoughness}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ clearcoatRoughness: v })}
            hint={`${state.clearcoatRoughness.toFixed(2)}`}
          />
          <Slider
            title="sheen (패브릭 광택)"
            value={state.sheen}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ sheen: v })}
            hint={`${state.sheen.toFixed(2)}`}
          />
          <div>
            <div className="text-xs font-medium text-slate-700 mb-1.5">sheen color</div>
            <input
              type="color"
              value={state.sheenColor}
              onChange={(e) => patch({ sheenColor: e.target.value })}
              className="w-full h-8 rounded border border-slate-300 bg-white cursor-pointer"
            />
          </div>
          <Slider
            title="sheen roughness"
            value={state.sheenRoughness}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ sheenRoughness: v })}
            hint={`${state.sheenRoughness.toFixed(2)}`}
          />
          <Slider
            title="transmission (투명, 유리)"
            value={state.transmission}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ transmission: v })}
            hint={`${state.transmission.toFixed(2)}`}
          />
          <Slider
            title="thickness (transmission 두께)"
            value={state.thickness}
            min={0}
            max={5}
            step={0.05}
            onChange={(v) => patch({ thickness: v })}
            hint={`${state.thickness.toFixed(2)}`}
          />
          <Slider
            title="ior (굴절률, 유리 1.5)"
            value={state.ior}
            min={1.0}
            max={2.5}
            step={0.01}
            onChange={(v) => patch({ ior: v })}
            hint={`${state.ior.toFixed(2)}`}
          />
        </div>
      </Section>

      <Section title="8 · tone mapping + exposure">
        <div className="flex gap-2 mb-2">
          <ToneOption
            label="Linear"
            active={state.toneMapping === 'linear'}
            onClick={() => patch({ toneMapping: 'linear' })}
          />
          <ToneOption
            label="ACES"
            active={state.toneMapping === 'aces'}
            onClick={() => patch({ toneMapping: 'aces' })}
          />
        </div>
        <Slider
          title="exposure"
          value={state.exposure}
          min={0.1}
          max={3.0}
          step={0.05}
          onChange={(v) => patch({ exposure: v })}
          hint={`${state.exposure.toFixed(2)}`}
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-700 mb-1.5">{title}</div>
      {children}
    </div>
  );
}

function Slider({
  title,
  value,
  min,
  max,
  step,
  onChange,
  hint,
}: {
  title: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
        <span>{title}</span>
        {hint && <span className="text-slate-500 font-mono">{hint}</span>}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-slate-700"
      />
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] text-slate-500 mb-0.5">{label}</span>
      <input
        type="number"
        step={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full px-2 py-1 text-xs bg-white text-slate-900 border border-slate-300 rounded"
      />
    </label>
  );
}

function TextureSelect({
  face,
  value,
  onChange,
}: {
  face: string;
  value: TextureSetKey;
  onChange: (k: TextureSetKey) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-10 shrink-0 text-xs text-slate-700">{face}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TextureSetKey)}
        className="flex-1 px-2 py-1 text-xs bg-white text-slate-900 border border-slate-300 rounded"
      >
        {TEXTURE_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToneOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-1.5 text-xs rounded border transition-colors ${
        active
          ? 'bg-slate-800 text-white border-slate-800'
          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}
