/**
 * SnapshotViewer — Step 7 path tracer 정적 스냅샷 모드.
 *
 * three-gpu-pathtracer 의 WebGLPathTracer 로 V-Ray 급 정적 1컷 렌더.
 *   - mount 시 BVH 빌드 (1~3초)
 *   - useFrame 매 프레임 renderSample (점진적 누적)
 *   - maxSamples 도달 시 자동 정지 + PNG 다운로드 가능
 *   - 인터랙티브 X (카메라 이동 시 reset 필요)
 *
 * 라이브 모드 (MoodViewer) 의 셋업 일부 재사용:
 *   - BathRoom 같은 mesh 트리
 *   - Environment / rectAreaLight / spotLight / ambientLight
 *
 * 단 MeshReflectorMaterial / postprocessing 효과는 path tracer 미지원
 * (path tracer 자체가 진짜 GI + 반사 시뮬레이션이라 별도 셰이더 불필요).
 */
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { WebGLPathTracer } from 'three-gpu-pathtracer';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import BathRoom from './BathRoom';
import { MoodState, HDR_URL } from './moodState';
import { BathDimensions } from './DimensionForm';
import { computeCameraView } from './cameraPresets';

RectAreaLightUniformsLib.init();

const MM = 0.001;

type Props = {
  dims: BathDimensions;
  mood: MoodState;
  onBack: () => void;
  onLiveMode: () => void;
};

/** 해상도별 dpr (대략적 — main 영역 크기 약 1280×900 기준 근사). */
const RESOLUTION_DPR: Record<MoodState['snapshotResolution'], number> = {
  fhd: 1.5,  // ~1920×1080
  '2k': 2.0, // ~2560×1440
  '4k': 3.0, // ~3840×2160
  '8k': 6.0, // ~7680×4320
};
const RESOLUTION_LABEL: Record<MoodState['snapshotResolution'], string> = {
  fhd: 'FHD (1920×1080)',
  '2k': '2K (2560×1440)',
  '4k': '4K (3840×2160) ★',
  '8k': '8K (7680×4320) — 무거움',
};

export default function SnapshotViewer({ dims, mood, onBack, onLiveMode }: Props) {
  const [samples, setSamples] = useState(0);
  const [busy, setBusy] = useState(true);
  const [resolution, setResolution] = useState<MoodState['snapshotResolution']>(mood.snapshotResolution);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const w = dims.w_mm * MM;
  const d = dims.d_mm * MM;
  const h = dims.h_mm * MM;
  const cam = computeCameraView(mood.cameraPreset, mood.entranceWall, dims.w_mm, dims.d_mm, dims.h_mm);
  const camPos = cam.position;
  const camTarget = cam.target;
  const camFov = cam.fov;

  const progress = Math.min((samples / mood.pathTracerMaxSamples) * 100, 100);
  const dpr = RESOLUTION_DPR[resolution];

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `bath-lab-snapshot-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex h-screen w-full bg-slate-900">
      <aside className="w-80 shrink-0 border-r border-slate-200 bg-white p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">스냅샷 모드 (Path Tracer)</h2>
          <button
            onClick={onBack}
            className="text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded border border-slate-300 bg-white"
          >
            ← 수치
          </button>
        </div>
        <button
          onClick={onLiveMode}
          className="w-full mb-4 py-2 rounded border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-50"
        >
          ← 라이브 모드로
        </button>

        <div className="space-y-3 text-sm">
          <div>
            <div className="text-xs text-slate-500 mb-1">진행률</div>
            <div className="w-full h-2 bg-slate-200 rounded">
              <div
                className="h-2 bg-amber-500 rounded transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 font-mono">
              {samples} / {mood.pathTracerMaxSamples} samples · {progress.toFixed(0)}%
              {!busy && samples >= mood.pathTracerMaxSamples && ' · 완료'}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-700 mb-1.5">출력 해상도 (dpr {dpr}×)</div>
            <select
              value={resolution}
              onChange={(e) => {
                setResolution(e.target.value as MoodState['snapshotResolution']);
                setSamples(0); // 해상도 변경 = canvas remount = sample reset
              }}
              className="w-full px-2 py-1.5 text-sm bg-white text-slate-900 border border-slate-300 rounded"
              style={{ colorScheme: 'light' }}
            >
              {(['fhd', '2k', '4k', '8k'] as const).map((k) => (
                <option key={k} value={k} style={{ background: 'white', color: '#0f172a' }}>
                  {RESOLUTION_LABEL[k]}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownload}
            disabled={samples < 4}
            className="w-full py-2 rounded font-medium text-sm bg-slate-800 text-white disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            PNG 다운로드
          </button>

          <div className="text-[10px] text-slate-500 leading-snug pt-2 border-t border-slate-100">
            Path tracer = 실제 빛 경로 시뮬레이션 (V-Ray 급). MeshReflector / postprocessing 효과는 미적용.
            카메라 회전 시 sample 자동 reset.
          </div>
        </div>
      </aside>

      <main className="flex-1 relative">
        <Canvas
          key={`${resolution}-${mood.cameraPreset}-${mood.entranceWall}`}
          shadows
          dpr={dpr}
          camera={{ position: camPos, fov: camFov, near: 0.01, far: 100 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          onCreated={({ gl }) => {
            canvasRef.current = gl.domElement;
          }}
        >
          <PathTracerSetup
            mood={mood}
            onSamples={(n, done) => {
              setSamples(n);
              if (done) setBusy(false);
            }}
          />

          {mood.env.source === 'preset' ? (
            <Environment preset={mood.env.key} background={false} />
          ) : (
            <Environment files={HDR_URL[mood.env.key]} background={false} />
          )}

          <ambientLight intensity={mood.ambientIntensity} />
          <spotLight
            position={[mood.spotX_mm * MM, mood.spotY_mm * MM, mood.spotZ_mm * MM]}
            color={mood.spotColor}
            intensity={mood.spotIntensity}
            angle={Math.PI / 3}
            penumbra={0.5}
          />
          {mood.rectAreaEnabled && (
            <rectAreaLight
              position={[mood.rectAreaX_mm * MM, mood.rectAreaY_mm * MM, mood.rectAreaZ_mm * MM]}
              width={mood.rectAreaWidth_mm * MM}
              height={mood.rectAreaHeight_mm * MM}
              color={mood.rectAreaColor}
              intensity={mood.rectAreaIntensity}
            />
          )}

          <BathRoom
            w_mm={dims.w_mm}
            d_mm={dims.d_mm}
            h_mm={dims.h_mm}
            wallMat={{ color: mood.wallColor, roughness: mood.wallRoughness, metalness: mood.wallMetalness }}
            floorMat={{ color: mood.wallColor, roughness: mood.floorRoughness, metalness: mood.floorMetalness }}
            ceilingMat={{ color: mood.wallColor, roughness: mood.ceilingRoughness, metalness: mood.ceilingMetalness }}
            physical={{
              clearcoat: mood.clearcoat,
              clearcoatRoughness: mood.clearcoatRoughness,
              sheen: mood.sheen,
              sheenColor: mood.sheenColor,
              sheenRoughness: mood.sheenRoughness,
              transmission: mood.transmission,
              thickness: mood.thickness,
              ior: mood.ior,
              anisotropy: mood.anisotropy,
              anisotropyRotation: mood.anisotropyRotation,
              iridescence: mood.iridescence,
              iridescenceIOR: mood.iridescenceIOR,
              envIntensity: mood.envIntensity,
              displacementScale: mood.displacementScale,
            }}
            wallTexture={mood.wallTexture}
            floorTexture={mood.floorTexture}
            ceilingTexture={mood.ceilingTexture}
            textureRepeat={mood.textureRepeat}
            reflector={{
              enabled: false, // path tracer 모드 = MeshReflectorMaterial 비활성 (대체)
              mixStrength: 0,
              blur: 0,
              mixBlur: 0,
              roughness: mood.reflectorRoughness,
              resolution: 256,
            }}
            displacement={{
              scale: mood.displacementScale,
              segments: mood.geometrySegments,
            }}
          />

          <OrbitControls target={camTarget} enableDamping dampingFactor={0.08} />

          {/* Step 7.5 — path tracer 결과 위에 Bloom 후처리 (광원 발광감). */}
          {mood.bloomEnabled && (
            <EffectComposer>
              <Bloom
                intensity={mood.bloomIntensity}
                luminanceThreshold={mood.bloomThreshold}
                luminanceSmoothing={0.4}
              />
            </EffectComposer>
          )}
        </Canvas>
      </main>
    </div>
  );
}

/**
 * PathTracerSetup — Canvas 안에 mount.
 *   - WebGLPathTracer 인스턴스 생성 + scene/camera 등록
 *   - useFrame 으로 매 프레임 renderSample (BVH 빌드 후)
 *   - 카메라 이동 감지 시 reset
 */
function PathTracerSetup({
  mood,
  onSamples,
}: {
  mood: MoodState;
  onSamples: (n: number, done: boolean) => void;
}) {
  const { gl, scene, camera } = useThree();
  const ptRef = useRef<WebGLPathTracer | null>(null);
  const lastCamRef = useRef<string>('');

  useEffect(() => {
    const pt = new WebGLPathTracer(gl);
    pt.bounces = mood.pathTracerBounces;
    pt.setScene(scene, camera);
    ptRef.current = pt;
    return () => {
      // pt.dispose?.()
      ptRef.current = null;
    };
  }, [gl, scene, camera, mood.pathTracerBounces]);

  useFrame(() => {
    const pt = ptRef.current;
    if (!pt) return;

    // 카메라 이동 감지 — position + rotation hash
    const camKey = `${camera.position.toArray().join(',')}|${camera.rotation.toArray().slice(0, 3).join(',')}`;
    if (camKey !== lastCamRef.current) {
      lastCamRef.current = camKey;
      // path tracer 의 reset 메서드 — 위치별로 명칭 다름. 사용 가능한 것:
      pt.setScene(scene, camera);
    }

    if (pt.samples >= mood.pathTracerMaxSamples) {
      onSamples(Math.floor(pt.samples), true);
      return; // max 도달 시 정지
    }

    pt.renderSample();
    onSamples(Math.floor(pt.samples), false);
  });

  return null;
}
