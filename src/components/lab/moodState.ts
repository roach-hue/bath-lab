/**
 * moodState — bath lab MoodViewer 의 컨트롤 상태 타입 + 기본값.
 * Step 1 (HDRI) + Step 2 (PBR 텍스쳐) 포함.
 */
import type { TextureSetKey } from './textureSets';

/** drei <Environment preset="..."> 내장 LDR preset (10종). */
export type EnvBuiltinPreset =
  | 'apartment'
  | 'city'
  | 'dawn'
  | 'forest'
  | 'lobby'
  | 'night'
  | 'park'
  | 'studio'
  | 'sunset'
  | 'warehouse';

/** Step 1 — 외부 .hdr 실파일 키. frontend/public/hdr/ 에 위치.
 *  Phase 1 — 1k → 2k 해상도 업그레이드 (반사 디테일 ↑). */
export type EnvHdrFile =
  | 'studio_small_03_2k'
  | 'lebombo_2k'
  | 'kloofendal_48d_partly_cloudy_puresky_2k';

/** 환경맵 선택 — 내장 preset 또는 외부 .hdr 파일.
 *  source: 'preset' 일 때 key 는 EnvBuiltinPreset, 'hdr' 일 때 EnvHdrFile. */
export type EnvSelection =
  | { source: 'preset'; key: EnvBuiltinPreset }
  | { source: 'hdr'; key: EnvHdrFile };

/** .hdr 파일 URL 매핑 (Vite public 경로 기준). 2k 해상도. */
export const HDR_URL: Record<EnvHdrFile, string> = {
  studio_small_03_2k: '/hdr/studio_small_03_2k.hdr',
  lebombo_2k: '/hdr/lebombo_2k.hdr',
  kloofendal_48d_partly_cloudy_puresky_2k:
    '/hdr/kloofendal_48d_partly_cloudy_puresky_2k.hdr',
};

export type ToneMappingMode = 'linear' | 'aces';

export type MoodState = {
  // 벽 색 (텍스쳐 multiply / 단색 fallback)
  wallColor: string;
  // Phase 2-I — 면별 roughness / metalness 독립
  wallRoughness: number;
  wallMetalness: number;
  floorRoughness: number;
  floorMetalness: number;
  ceilingRoughness: number;
  ceilingMetalness: number;
  // Step 2 — 면별 PBR 텍스쳐 셋 + tiling
  wallTexture: TextureSetKey;
  floorTexture: TextureSetKey;
  ceilingTexture: TextureSetKey;
  textureRepeat: number; // tiling 반복 수 (1~10)
  // Step 3 — meshPhysicalMaterial 확장 prop
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  sheenColor: string;
  sheenRoughness: number;
  transmission: number;
  thickness: number;
  ior: number;
  // Phase 2-A — anisotropy + iridescence
  anisotropy: number;
  anisotropyRotation: number; // 0 ~ 2π
  iridescence: number;
  iridescenceIOR: number; // 1.0 ~ 2.5
  // Phase 2-E — envMap intensity (IBL 영향 강약)
  envIntensity: number;
  // Phase 3-B — MeshReflectorMaterial (바닥 진짜 반사)
  reflectorEnabled: boolean;
  reflectorMixStrength: number; // 0~5, 반사 강도
  reflectorBlur: number; // 0~500, 반사 블러
  reflectorMixBlur: number; // 0~5, 블러 혼합
  reflectorRoughness: number; // 반사면 자체 거칠기 (0=완전 거울)
  reflectorResolution: 256 | 512 | 1024 | 2048;
  // Phase 4-H — Displacement (진짜 vertex 변형, 울룩불룩)
  displacementScale: number; // 보통 0 ~ 0.05 (m 단위). 0 = 효과 X.
  geometrySegments: 16 | 32 | 64 | 128; // vertex 분할 수. 높을수록 부드러운 디테일
  // Step 4 — rectAreaLight (면광원, 다운라이트/거울조명 자연스러움)
  rectAreaEnabled: boolean;
  rectAreaX_mm: number;
  rectAreaY_mm: number;
  rectAreaZ_mm: number;
  rectAreaWidth_mm: number;
  rectAreaHeight_mm: number;
  rectAreaColor: string;
  rectAreaIntensity: number;
  // 환경맵 (preset OR hdr 파일)
  env: EnvSelection;
  // 조명
  ambientIntensity: number;
  spotX_mm: number;
  spotY_mm: number;
  spotZ_mm: number;
  spotColor: string;
  spotIntensity: number;
  // 톤
  toneMapping: ToneMappingMode;
  exposure: number;
};

export const DEFAULT_MOOD: MoodState = {
  wallColor: '#dddddd',
  wallRoughness: 0.4,
  wallMetalness: 0.0,
  floorRoughness: 0.5,
  floorMetalness: 0.0,
  ceilingRoughness: 0.6,
  ceilingMetalness: 0.0,
  wallTexture: 'red_brick_03',
  floorTexture: 'wood_planks',
  ceilingTexture: 'concrete_wall_004',
  textureRepeat: 2,
  // Step 3 — 기본은 다 0 (효과 끄기). 진규님이 슬라이더 만지면서 비교.
  clearcoat: 0.0,
  clearcoatRoughness: 0.1,
  sheen: 0.0,
  sheenColor: '#ffffff',
  sheenRoughness: 0.5,
  transmission: 0.0,
  thickness: 0.5,
  ior: 1.5,
  // Phase 2-A 기본은 0 (효과 X)
  anisotropy: 0.0,
  anisotropyRotation: 0.0,
  iridescence: 0.0,
  iridescenceIOR: 1.3,
  // Phase 2-E IBL 강도
  envIntensity: 1.0,
  // Phase 3-B 기본은 반사 켜기 — 진규님 효과 즉시 확인용
  reflectorEnabled: true,
  reflectorMixStrength: 0.6,
  reflectorBlur: 100,
  reflectorMixBlur: 1.0,
  reflectorRoughness: 0.5,
  reflectorResolution: 1024,
  // Phase 4-H — 기본은 약하게 켜기. 효과 즉시 보임 (벽돌 줄눈 깊이감).
  displacementScale: 0.015,
  geometrySegments: 64,
  // Step 4 — 천장 중앙 다운라이트 (600×600mm 면광원)
  rectAreaEnabled: true,
  rectAreaX_mm: 0,
  rectAreaY_mm: 2380, // 천장 거의 닿게
  rectAreaZ_mm: 0,
  rectAreaWidth_mm: 600,
  rectAreaHeight_mm: 600,
  rectAreaColor: '#fff2d6',
  rectAreaIntensity: 4.0,
  env: { source: 'hdr', key: 'studio_small_03_2k' },
  ambientIntensity: 0.6,
  spotX_mm: 0,
  spotY_mm: 2200,
  spotZ_mm: 0,
  spotColor: '#fff2d6',
  spotIntensity: 8.0,
  toneMapping: 'aces',
  exposure: 1.0,
};
