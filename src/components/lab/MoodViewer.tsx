/**
 * MoodViewer — bath lab Step 2 통합 화면.
 *
 * 좌측 = MoodControls (8 컨트롤 패널), 우측 = three.js Canvas.
 * Canvas 안: BathRoom + Environment + ambient/spotLight + OrbitControls.
 * tone mapping / exposure 는 Canvas gl 의 toneMapping 동적 변경.
 */
import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, SoftShadows, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

// Step 4 — module 로드 시 1회 init. R3F + meshPhysical 와 호환.
RectAreaLightUniformsLib.init();
import BathRoom from './BathRoom';
import MoodControls from './MoodControls';
import { MoodState, HDR_URL } from './moodState';
import { BathDimensions } from './DimensionForm';

const MM = 0.001;

type Props = {
  dims: BathDimensions;
  mood: MoodState;
  setMood: (m: MoodState) => void;
  onBack: () => void;
  onSnapshot: () => void;
};

export default function MoodViewer({ dims, mood, setMood, onBack, onSnapshot }: Props) {

  const w = dims.w_mm * MM;
  const d = dims.d_mm * MM;
  const h = dims.h_mm * MM;

  // 카메라 — 안쪽 한 모퉁이에서 중심 응시.
  const camPos: [number, number, number] = [w * 0.25, h * 0.55, d * 0.25];
  const camTarget: [number, number, number] = [0, h * 0.5, 0];

  return (
    <div className="flex h-screen w-full bg-slate-900">
      <aside className="w-80 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-3 border-b border-slate-200 bg-amber-50">
          <button
            onClick={onSnapshot}
            className="w-full py-2 rounded font-medium text-sm bg-amber-600 text-white hover:bg-amber-700"
          >
            ★ 스냅샷 모드 (Path Tracer — V-Ray 급)
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <MoodControls state={mood} setState={setMood} onBack={onBack} />
        </div>
      </aside>
      <main className="flex-1 relative">
        <Canvas
          shadows
          camera={{ position: camPos, fov: 55, near: 0.01, far: 100 }}
          gl={{ antialias: true }}
        >
          <ToneMappingSetter mode={mood.toneMapping} exposure={mood.exposure} />

          {/* Step 5 — SoftShadows: 셰이더 inject, 모든 그림자 부드럽게 */}
          {mood.softShadowEnabled && (
            <SoftShadows
              samples={mood.softShadowSamples}
              focus={mood.softShadowFocus}
              size={mood.softShadowSize}
            />
          )}

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

          {/* Step 4 — rectAreaLight 면광원 (다운라이트). castShadow 미지원이라 spotLight 와 병용. */}
          {mood.rectAreaEnabled && (
            <RectAreaLight
              x_mm={mood.rectAreaX_mm}
              y_mm={mood.rectAreaY_mm}
              z_mm={mood.rectAreaZ_mm}
              width_mm={mood.rectAreaWidth_mm}
              height_mm={mood.rectAreaHeight_mm}
              color={mood.rectAreaColor}
              intensity={mood.rectAreaIntensity}
            />
          )}

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

          {/* Step 5 — ContactShadows: 바닥 위 접지 그림자 (가구 추가 시 자연 접지감) */}
          {mood.contactShadowEnabled && (
            <ContactShadows
              position={[0, 0.001, 0]}
              scale={Math.max(w, d) * 1.2}
              opacity={mood.contactShadowOpacity}
              blur={mood.contactShadowBlur}
              far={1}
              resolution={512}
            />
          )}

          <OrbitControls
            target={camTarget}
            enableDamping
            dampingFactor={0.08}
            minDistance={0.1}
            maxDistance={Math.max(w, d, h) * 3}
          />

          {/* Step 6 — postprocessing. Bloom 광원 발광 + SSAO 공간 AO + SSR 스크린 반사 */}
          {/* Step 6 — postprocessing v2 (다운그레이드 후 재활성). Bloom + SSAO. */}
          {(mood.bloomEnabled || mood.ssaoEnabled) && (
            <EffectComposer enableNormalPass={mood.ssaoEnabled} multisampling={0}>
              <>
                {mood.bloomEnabled && (
                  <Bloom
                    intensity={mood.bloomIntensity}
                    luminanceThreshold={mood.bloomThreshold}
                    luminanceSmoothing={0.4}
                  />
                )}
                {mood.ssaoEnabled && (
                  <SSAO
                    intensity={mood.ssaoIntensity}
                    radius={mood.ssaoRadius}
                    samples={16}
                    rings={4}
                    luminanceInfluence={0.6}
                    distanceThreshold={1.0}
                    distanceFalloff={0.1}
                    rangeThreshold={0.0005}
                    rangeFalloff={0.001}
                    worldDistanceThreshold={1.0}
                    worldDistanceFalloff={1.0}
                    worldProximityThreshold={1.0}
                    worldProximityFalloff={1.0}
                  />
                )}
                {/* SSR — v2 미export 동일. 백로그 (별도 패키지). */}
              </>
            </EffectComposer>
          )}
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

/** Step 4 — rectAreaLight. ref 통해 lookAt(0, 0, 0) 설정해 아래쪽 비추기. */
function RectAreaLight({
  x_mm,
  y_mm,
  z_mm,
  width_mm,
  height_mm,
  color,
  intensity,
}: {
  x_mm: number;
  y_mm: number;
  z_mm: number;
  width_mm: number;
  height_mm: number;
  color: string;
  intensity: number;
}) {
  const ref = useRef<THREE.RectAreaLight>(null);
  useEffect(() => {
    // 항상 공간 중심 (바닥) 을 향하게.
    if (ref.current) ref.current.lookAt(0, 0, 0);
  }, [x_mm, y_mm, z_mm]);
  return (
    <rectAreaLight
      ref={ref}
      position={[x_mm * MM, y_mm * MM, z_mm * MM]}
      width={width_mm * MM}
      height={height_mm * MM}
      color={color}
      intensity={intensity}
    />
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
