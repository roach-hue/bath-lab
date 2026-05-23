/**
 * MoodViewer — bath lab Step 2 통합 화면.
 *
 * 좌측 = MoodControls (8 컨트롤 패널), 우측 = three.js Canvas.
 * Canvas 안: BathRoom + Environment + ambient/spotLight + OrbitControls.
 * tone mapping / exposure 는 Canvas gl 의 toneMapping 동적 변경.
 */
import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import BathRoom from './BathRoom';
import MoodControls from './MoodControls';
import { DEFAULT_MOOD, MoodState, HDR_URL } from './moodState';
import { BathDimensions } from './DimensionForm';

const MM = 0.001;

type Props = {
  dims: BathDimensions;
  onBack: () => void;
};

export default function MoodViewer({ dims, onBack }: Props) {
  const [mood, setMood] = useState<MoodState>(DEFAULT_MOOD);

  const w = dims.w_mm * MM;
  const d = dims.d_mm * MM;
  const h = dims.h_mm * MM;

  // 카메라 — 안쪽 한 모퉁이에서 중심 응시.
  const camPos: [number, number, number] = [w * 0.25, h * 0.55, d * 0.25];
  const camTarget: [number, number, number] = [0, h * 0.5, 0];

  return (
    <div className="flex h-screen w-full bg-slate-900">
      <aside className="w-80 shrink-0 border-r border-slate-200 bg-white">
        <MoodControls state={mood} setState={setMood} onBack={onBack} />
      </aside>
      <main className="flex-1 relative">
        <Canvas
          shadows
          camera={{ position: camPos, fov: 55, near: 0.01, far: 100 }}
          gl={{ antialias: true }}
        >
          <ToneMappingSetter mode={mood.toneMapping} exposure={mood.exposure} />

          {/* 환경맵 — IBL 반사. preset (LDR 내장) 또는 .hdr 실파일 분기. */}
          {mood.env.source === 'preset' ? (
            <Environment preset={mood.env.key} background={false} />
          ) : (
            <Environment files={HDR_URL[mood.env.key]} background={false} />
          )}

          {/* ambient */}
          <ambientLight intensity={mood.ambientIntensity} />

          {/* spotLight — 위치는 mm 입력, 공간 중심 기준이므로 그대로 m 변환 */}
          <spotLight
            position={[mood.spotX_mm * MM, mood.spotY_mm * MM, mood.spotZ_mm * MM]}
            color={mood.spotColor}
            intensity={mood.spotIntensity}
            angle={Math.PI / 3}
            penumbra={0.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {/* 화장실 공간 — Step 2 텍스쳐 + Step 3 physical + Phase 2 면별/anisotropy/envIntensity */}
          <BathRoom
            w_mm={dims.w_mm}
            d_mm={dims.d_mm}
            h_mm={dims.h_mm}
            wallMat={{
              color: mood.wallColor,
              roughness: mood.wallRoughness,
              metalness: mood.wallMetalness,
            }}
            floorMat={{
              color: mood.wallColor,
              roughness: mood.floorRoughness,
              metalness: mood.floorMetalness,
            }}
            ceilingMat={{
              color: mood.wallColor,
              roughness: mood.ceilingRoughness,
              metalness: mood.ceilingMetalness,
            }}
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
              enabled: mood.reflectorEnabled,
              mixStrength: mood.reflectorMixStrength,
              blur: mood.reflectorBlur,
              mixBlur: mood.reflectorMixBlur,
              roughness: mood.reflectorRoughness,
              resolution: mood.reflectorResolution,
            }}
            displacement={{
              scale: mood.displacementScale,
              segments: mood.geometrySegments,
            }}
          />

          <OrbitControls
            target={camTarget}
            enableDamping
            dampingFactor={0.08}
            minDistance={0.1}
            maxDistance={Math.max(w, d, h) * 3}
          />
        </Canvas>

        {/* 우측 하단 dims HUD */}
        <div className="absolute bottom-3 right-3 bg-slate-900/80 text-slate-100 text-xs rounded px-3 py-2 font-mono">
          W {dims.w_mm.toLocaleString()} · D {dims.d_mm.toLocaleString()} · H{' '}
          {dims.h_mm.toLocaleString()} mm
        </div>
      </main>
    </div>
  );
}

/** Canvas gl 의 toneMapping/exposure 를 mood state 와 동기화. */
function ToneMappingSetter({
  mode,
  exposure,
}: {
  mode: 'linear' | 'aces';
  exposure: number;
}) {
  const { gl } = useThree();
  const ref = useRef({ mode, exposure });
  ref.current = { mode, exposure };

  useEffect(() => {
    gl.toneMapping =
      mode === 'aces' ? THREE.ACESFilmicToneMapping : THREE.LinearToneMapping;
    gl.toneMappingExposure = exposure;
    // outputColorSpace 는 drei default (SRGB) 유지
  }, [gl, mode, exposure]);

  return null;
}
