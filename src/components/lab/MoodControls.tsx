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
import { PRESET_LABEL, WALL_LABEL } from './cameraPresets';

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
  'studio_small_03_2k',
  'lebombo_2k',
  'kloofendal_48d_partly_cloudy_puresky_2k',
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

      <Section title="★ 카메라 시점 + 입구">
        <div className="space-y-2 border-l-2 border-slate-300 pl-3">
          <div>
            <div className="text-xs font-medium text-slate-700 mb-1.5">입구 위치 (시안 기준점)</div>
            <select
              value={state.entranceWall}
              onChange={(e) => patch({ entranceWall: e.target.value as MoodState['entranceWall'] })}
              className="w-full px-2 py-1.5 text-sm bg-white text-slate-900 border border-slate-300 rounded"
            >
              {(['front', 'back', 'left', 'right'] as const).map((w) => (
                <option key={w} value={w}>{WALL_LABEL[w]}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-700 mb-1.5">카메라 시점</div>
            <select
              value={state.cameraPreset}
              onChange={(e) => patch({ cameraPreset: e.target.value as MoodState['cameraPreset'] })}
              className="w-full px-2 py-1.5 text-sm bg-white text-slate-900 border border-slate-300 rounded"
            >
              {(['corner', 'frontal', 'human', 'top'] as const).map((p) => (
                <option key={p} value={p}>{PRESET_LABEL[p]}</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section title="0 · 표면 질감 (PBR 텍스쳐 — 면별)">
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
            title="텍스쳐 반복 (tiling — 무늬 크기)"
            value={state.textureRepeat}
            min={1}
            max={10}
            step={0.5}
            onChange={(v) => patch({ textureRepeat: v })}
            hint={`${state.textureRepeat.toFixed(1)}×`}
          />
        </div>
      </Section>

      <Section title="1 · 벽 색 (텍스쳐와 곱해짐)">
        <input
          type="color"
          value={state.wallColor}
          onChange={(e) => patch({ wallColor: e.target.value })}
          className="w-full h-9 rounded border border-slate-300 bg-white cursor-pointer"
        />
      </Section>

      <Section title="2 · 거칠기 + 금속성 (면별 — roughness/metalness)">
        <div className="space-y-3 border-l-2 border-slate-200 pl-3">
          <div className="text-[10px] text-slate-500">[벽]</div>
          <Slider title="거칠기" value={state.wallRoughness} min={0} max={1} step={0.01} onChange={(v) => patch({ wallRoughness: v })} hint={`${state.wallRoughness.toFixed(2)}`} />
          <Slider title="금속성" value={state.wallMetalness} min={0} max={1} step={0.01} onChange={(v) => patch({ wallMetalness: v })} hint={`${state.wallMetalness.toFixed(2)}`} />
          <div className="text-[10px] text-slate-500">[바닥]</div>
          <Slider title="거칠기" value={state.floorRoughness} min={0} max={1} step={0.01} onChange={(v) => patch({ floorRoughness: v })} hint={`${state.floorRoughness.toFixed(2)}`} />
          <Slider title="금속성" value={state.floorMetalness} min={0} max={1} step={0.01} onChange={(v) => patch({ floorMetalness: v })} hint={`${state.floorMetalness.toFixed(2)}`} />
          <div className="text-[10px] text-slate-500">[천장]</div>
          <Slider title="거칠기" value={state.ceilingRoughness} min={0} max={1} step={0.01} onChange={(v) => patch({ ceilingRoughness: v })} hint={`${state.ceilingRoughness.toFixed(2)}`} />
          <Slider title="금속성" value={state.ceilingMetalness} min={0} max={1} step={0.01} onChange={(v) => patch({ ceilingMetalness: v })} hint={`${state.ceilingMetalness.toFixed(2)}`} />
        </div>
      </Section>

      <Section title="4 · 환경맵 (주변 반사용 — IBL)">
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
          <optgroup label="실파일 HDRI (고해상도 환경맵)">
            {ENV_HDRS.map((k) => (
              <option key={`hdr:${k}`} value={`hdr:${k}`}>
                {k}
              </option>
            ))}
          </optgroup>
          <optgroup label="내장 환경맵 (drei preset — 간편)">
            {ENV_PRESETS.map((p) => (
              <option key={`preset:${p}`} value={`preset:${p}`}>
                {p}
              </option>
            ))}
          </optgroup>
        </select>
        <div className="mt-2">
          <Slider
            title="환경맵 강도 (envMap intensity — IBL 영향)"
            value={state.envIntensity}
            min={0}
            max={3}
            step={0.05}
            onChange={(v) => patch({ envIntensity: v })}
            hint={`${state.envIntensity.toFixed(2)}`}
          />
        </div>
      </Section>

      <Slider
        title="5 · 주변광 강도 (ambient — 전체 균일하게 밝아짐)"
        value={state.ambientIntensity}
        min={0}
        max={5}
        step={0.05}
        onChange={(v) => patch({ ambientIntensity: v })}
        hint={`${state.ambientIntensity.toFixed(2)}`}
      />

      <Section title="6 · 스폿라이트 위치 (다운라이트 — mm, 공간 중심 0)">
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
          title="스폿라이트 강도 (intensity)"
          value={state.spotIntensity}
          min={0}
          max={20}
          step={0.1}
          onChange={(v) => patch({ spotIntensity: v })}
          hint={`${state.spotIntensity.toFixed(1)}`}
        />
      </Section>

      <Section title="7 · 스폿라이트 색 (전구색)">
        <input
          type="color"
          value={state.spotColor}
          onChange={(e) => patch({ spotColor: e.target.value })}
          className="w-full h-9 rounded border border-slate-300 bg-white cursor-pointer"
        />
      </Section>

      <Section title="11 · 후처리 (Step 6 ★ — Bloom + SSAO · 빛 흐름 핵심)">
        <div className="space-y-3 border-l-2 border-red-200 pl-3">
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={state.bloomEnabled}
              onChange={(e) => patch({ bloomEnabled: e.target.checked })}
            />
            Bloom (광원 발광감)
          </label>
          <Slider title="bloom intensity" value={state.bloomIntensity} min={0} max={3} step={0.05} onChange={(v) => patch({ bloomIntensity: v })} hint={`${state.bloomIntensity.toFixed(2)}`} />
          <Slider title="bloom threshold (어디서부터 발광)" value={state.bloomThreshold} min={0} max={1} step={0.01} onChange={(v) => patch({ bloomThreshold: v })} hint={`${state.bloomThreshold.toFixed(2)}`} />
          <label className="flex items-center gap-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              checked={state.ssaoEnabled}
              onChange={(e) => patch({ ssaoEnabled: e.target.checked })}
            />
            SSAO (모서리 어두움 — 공간감)
          </label>
          <Slider title="ssao intensity" value={state.ssaoIntensity} min={0} max={5} step={0.05} onChange={(v) => patch({ ssaoIntensity: v })} hint={`${state.ssaoIntensity.toFixed(2)}`} />
          <Slider title="ssao radius" value={state.ssaoRadius} min={0.05} max={1} step={0.01} onChange={(v) => patch({ ssaoRadius: v })} hint={`${state.ssaoRadius.toFixed(2)}`} />
          <div className="pt-2 border-t border-slate-100 opacity-50">
            <div className="text-xs text-slate-500">
              SSR (스크린 공간 반사) — <span className="text-amber-700">미지원 (별도 패키지, 백로그)</span>
            </div>
          </div>
        </div>
      </Section>

      <Section title="10 · 부드러운 그림자 (Step 5 — SoftShadow + ContactShadow)">
        <div className="space-y-3 border-l-2 border-purple-200 pl-3">
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={state.softShadowEnabled}
              onChange={(e) => patch({ softShadowEnabled: e.target.checked })}
            />
            SoftShadow ON/OFF (셰이더 inject)
          </label>
          <Slider title="soft samples (품질)" value={state.softShadowSamples} min={4} max={20} step={1} onChange={(v) => patch({ softShadowSamples: v })} hint={`${state.softShadowSamples}`} />
          <Slider title="soft focus" value={state.softShadowFocus} min={0} max={1} step={0.01} onChange={(v) => patch({ softShadowFocus: v })} hint={`${state.softShadowFocus.toFixed(2)}`} />
          <Slider title="soft size" value={state.softShadowSize} min={1} max={50} step={1} onChange={(v) => patch({ softShadowSize: v })} hint={`${state.softShadowSize}`} />
          <label className="flex items-center gap-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              checked={state.contactShadowEnabled}
              onChange={(e) => patch({ contactShadowEnabled: e.target.checked })}
            />
            ContactShadow ON/OFF (접지)
          </label>
          <Slider title="contact opacity" value={state.contactShadowOpacity} min={0} max={1} step={0.01} onChange={(v) => patch({ contactShadowOpacity: v })} hint={`${state.contactShadowOpacity.toFixed(2)}`} />
          <Slider title="contact blur" value={state.contactShadowBlur} min={0} max={10} step={0.1} onChange={(v) => patch({ contactShadowBlur: v })} hint={`${state.contactShadowBlur.toFixed(1)}`} />
        </div>
      </Section>

      <Section title="9b · 조명 fixture 시각화 (Step 7.8 — 빛나는 mesh)">
        <div className="space-y-3 border-l-2 border-yellow-300 pl-3">
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={state.showDownlightFixture}
              onChange={(e) => patch({ showDownlightFixture: e.target.checked })}
            />
            다운라이트 disc (spotLight 위치)
          </label>
          <Slider
            title="다운라이트 직경"
            value={state.downlightDiameter_mm}
            min={50}
            max={400}
            step={10}
            onChange={(v) => patch({ downlightDiameter_mm: v })}
            hint={`${state.downlightDiameter_mm}mm`}
          />
          <label className="flex items-center gap-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              checked={state.showRectFixture}
              onChange={(e) => patch({ showRectFixture: e.target.checked })}
            />
            면광원 패널 (rectArea 위치, rectArea ON 시만)
          </label>
          <p className="text-[10px] text-slate-500 leading-snug">
            emissive material 로 발광. Bloom ON + 스냅샷 모드 (path tracer) 에서 가장 자연.
          </p>
        </div>
      </Section>

      <Section title="9 · 면광원 다운라이트 (rectAreaLight — Step 4)">
        <div className="space-y-3 border-l-2 border-yellow-200 pl-3">
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={state.rectAreaEnabled}
              onChange={(e) => patch({ rectAreaEnabled: e.target.checked })}
            />
            면광원 ON/OFF
          </label>
          <div>
            <div className="text-xs font-medium text-slate-700 mb-1.5">위치 (mm)</div>
            <div className="grid grid-cols-3 gap-2">
              <NumField label="X" value={state.rectAreaX_mm} onChange={(v) => patch({ rectAreaX_mm: v })} />
              <NumField label="Y" value={state.rectAreaY_mm} onChange={(v) => patch({ rectAreaY_mm: v })} />
              <NumField label="Z" value={state.rectAreaZ_mm} onChange={(v) => patch({ rectAreaZ_mm: v })} />
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-700 mb-1.5">크기 (W×H mm)</div>
            <div className="grid grid-cols-2 gap-2">
              <NumField label="W" value={state.rectAreaWidth_mm} onChange={(v) => patch({ rectAreaWidth_mm: v })} />
              <NumField label="H" value={state.rectAreaHeight_mm} onChange={(v) => patch({ rectAreaHeight_mm: v })} />
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-700 mb-1.5">면광원 색</div>
            <input
              type="color"
              value={state.rectAreaColor}
              onChange={(e) => patch({ rectAreaColor: e.target.value })}
              className="w-full h-8 rounded border border-slate-300 bg-white cursor-pointer"
            />
          </div>
          <Slider
            title="면광원 강도"
            value={state.rectAreaIntensity}
            min={0}
            max={20}
            step={0.1}
            onChange={(v) => patch({ rectAreaIntensity: v })}
            hint={`${state.rectAreaIntensity.toFixed(1)}`}
          />
        </div>
      </Section>

      <Section title="3+++ · 진짜 울룩불룩 (Displacement — Phase 4 ★)">
        <div className="space-y-3 border-l-2 border-orange-200 pl-3">
          <Slider
            title="displacement scale (vertex 변형 깊이)"
            value={state.displacementScale}
            min={0}
            max={0.1}
            step={0.001}
            onChange={(v) => patch({ displacementScale: v })}
            hint={`${state.displacementScale.toFixed(3)} m`}
          />
          <div>
            <div className="text-xs font-medium text-slate-700 mb-1.5">geometry segments (분할 — 부드러움)</div>
            <select
              value={state.geometrySegments}
              onChange={(e) => patch({ geometrySegments: Number(e.target.value) as 16 | 32 | 64 | 128 })}
              className="w-full px-2 py-1.5 text-sm bg-white text-slate-900 border border-slate-300 rounded"
            >
              <option value={16}>16 (가벼움, 거칠음)</option>
              <option value={32}>32</option>
              <option value={64}>64 (권장)</option>
              <option value={128}>128 (부드러움, 무거움)</option>
            </select>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            scale 0 = 효과 X (normalMap 만). 0.015 = 약함, 0.05 = 강함. 너무 크면 면 깨짐.
          </p>
        </div>
      </Section>

      <Section title="3++ · 바닥 반사 (MeshReflector — Phase 3)">
        <div className="space-y-3 border-l-2 border-blue-200 pl-3">
          <label className="flex items-center gap-2 text-xs text-slate-700">
            <input
              type="checkbox"
              checked={state.reflectorEnabled}
              onChange={(e) => patch({ reflectorEnabled: e.target.checked })}
            />
            반사 ON/OFF
          </label>
          <Slider
            title="반사 강도 (mixStrength)"
            value={state.reflectorMixStrength}
            min={0}
            max={5}
            step={0.05}
            onChange={(v) => patch({ reflectorMixStrength: v })}
            hint={`${state.reflectorMixStrength.toFixed(2)}`}
          />
          <Slider
            title="반사 블러 (blur)"
            value={state.reflectorBlur}
            min={0}
            max={500}
            step={5}
            onChange={(v) => patch({ reflectorBlur: v })}
            hint={`${state.reflectorBlur.toFixed(0)}`}
          />
          <Slider
            title="블러 혼합 (mixBlur)"
            value={state.reflectorMixBlur}
            min={0}
            max={5}
            step={0.05}
            onChange={(v) => patch({ reflectorMixBlur: v })}
            hint={`${state.reflectorMixBlur.toFixed(2)}`}
          />
          <Slider
            title="반사면 거칠기 (0=완전 거울)"
            value={state.reflectorRoughness}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ reflectorRoughness: v })}
            hint={`${state.reflectorRoughness.toFixed(2)}`}
          />
          <div>
            <div className="text-xs font-medium text-slate-700 mb-1.5">반사 해상도 (resolution)</div>
            <select
              value={state.reflectorResolution}
              onChange={(e) => patch({ reflectorResolution: Number(e.target.value) as 256 | 512 | 1024 | 2048 })}
              className="w-full px-2 py-1.5 text-sm bg-white text-slate-900 border border-slate-300 rounded"
            >
              <option value={256}>256 (가벼움)</option>
              <option value={512}>512</option>
              <option value={1024}>1024 (권장)</option>
              <option value={2048}>2048 (선명, 무거움)</option>
            </select>
          </div>
        </div>
      </Section>

      <Section title="3+ · 추가 재질 (meshPhysical — 광택/투과/굴절)">
        <div className="space-y-3 border-l-2 border-slate-200 pl-3">
          <Slider
            title="코팅막 (clearcoat — 도자기/락카 광택)"
            value={state.clearcoat}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ clearcoat: v })}
            hint={`${state.clearcoat.toFixed(2)}`}
          />
          <Slider
            title="코팅막 거칠기 (clearcoat roughness)"
            value={state.clearcoatRoughness}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ clearcoatRoughness: v })}
            hint={`${state.clearcoatRoughness.toFixed(2)}`}
          />
          <Slider
            title="표면 윤기 (sheen — 벨벳/패브릭)"
            value={state.sheen}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ sheen: v })}
            hint={`${state.sheen.toFixed(2)}`}
          />
          <div>
            <div className="text-xs font-medium text-slate-700 mb-1.5">윤기 색 (sheen color)</div>
            <input
              type="color"
              value={state.sheenColor}
              onChange={(e) => patch({ sheenColor: e.target.value })}
              className="w-full h-8 rounded border border-slate-300 bg-white cursor-pointer"
            />
          </div>
          <Slider
            title="윤기 거칠기 (sheen roughness)"
            value={state.sheenRoughness}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ sheenRoughness: v })}
            hint={`${state.sheenRoughness.toFixed(2)}`}
          />
          <Slider
            title="투과 (transmission — 불투명↔유리)"
            value={state.transmission}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ transmission: v })}
            hint={`${state.transmission.toFixed(2)}`}
          />
          <Slider
            title="두께 (thickness — 투과 시 빛 굴절량)"
            value={state.thickness}
            min={0}
            max={5}
            step={0.05}
            onChange={(v) => patch({ thickness: v })}
            hint={`${state.thickness.toFixed(2)}`}
          />
          <Slider
            title="굴절률 (ior — 공기 1.0 / 유리 1.5 / 다이아 2.4)"
            value={state.ior}
            min={1.0}
            max={2.5}
            step={0.01}
            onChange={(v) => patch({ ior: v })}
            hint={`${state.ior.toFixed(2)}`}
          />
          <Slider
            title="방향성 반사 (anisotropy — 브러시드 메탈)"
            value={state.anisotropy}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ anisotropy: v })}
            hint={`${state.anisotropy.toFixed(2)}`}
          />
          <Slider
            title="anisotropy 회전 (0 ~ 2π)"
            value={state.anisotropyRotation}
            min={0}
            max={Math.PI * 2}
            step={0.01}
            onChange={(v) => patch({ anisotropyRotation: v })}
            hint={`${state.anisotropyRotation.toFixed(2)}`}
          />
          <Slider
            title="무지개빛 반사 (iridescence — CD/비누거품)"
            value={state.iridescence}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => patch({ iridescence: v })}
            hint={`${state.iridescence.toFixed(2)}`}
          />
          <Slider
            title="iridescence IOR (얇은 막 굴절률)"
            value={state.iridescenceIOR}
            min={1.0}
            max={2.5}
            step={0.01}
            onChange={(v) => patch({ iridescenceIOR: v })}
            hint={`${state.iridescenceIOR.toFixed(2)}`}
          />
        </div>
      </Section>

      <Section title="8 · 톤매핑 + 노출 (tone mapping + exposure)">
        <div className="flex gap-2 mb-2">
          <ToneOption
            label="Linear (선형 — 평이)"
            active={state.toneMapping === 'linear'}
            onClick={() => patch({ toneMapping: 'linear' })}
          />
          <ToneOption
            label="ACES (영화톤 — 권장)"
            active={state.toneMapping === 'aces'}
            onClick={() => patch({ toneMapping: 'aces' })}
          />
        </div>
        <Slider
          title="노출 (exposure — 전체 밝기 보정)"
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
