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

/** Step 1 — 외부 .hdr 실파일 키. frontend/public/hdr/ 에 위치. */
export type EnvHdrFile =
  | 'studio_small_03_1k'
  | 'lebombo_1k'
  | 'kloofendal_48d_partly_cloudy_puresky_1k';

/** 환경맵 선택 — 내장 preset 또는 외부 .hdr 파일.
 *  source: 'preset' 일 때 key 는 EnvBuiltinPreset, 'hdr' 일 때 EnvHdrFile. */
export type EnvSelection =
  | { source: 'preset'; key: EnvBuiltinPreset }
  | { source: 'hdr'; key: EnvHdrFile };

/** .hdr 파일 URL 매핑 (Vite public 경로 기준). */
export const HDR_URL: Record<EnvHdrFile, string> = {
  studio_small_03_1k: '/hdr/studio_small_03_1k.hdr',
  lebombo_1k: '/hdr/lebombo_1k.hdr',
  kloofendal_48d_partly_cloudy_puresky_1k:
    '/hdr/kloofendal_48d_partly_cloudy_puresky_1k.hdr',
};

export type ToneMappingMode = 'linear' | 'aces';

export type MoodState = {
  // 벽 (단색 + 공통 PBR 파라미터)
  wallColor: string;
  roughness: number;
  metalness: number;
  // Step 2 — 면별 PBR 텍스쳐 셋 + tiling
  wallTexture: TextureSetKey;
  floorTexture: TextureSetKey;
  ceilingTexture: TextureSetKey;
  textureRepeat: number; // tiling 반복 수 (1~10)
  // Step 3 — meshPhysicalMaterial 확장 prop
  clearcoat: number; // 코팅 광택 (도자기 타일)
  clearcoatRoughness: number;
  sheen: number; // 패브릭 광택 (수건 등)
  sheenColor: string;
  sheenRoughness: number;
  transmission: number; // 투명 (유리 등)
  thickness: number; // transmission 두께
  ior: number; // 굴절률 (유리 표준 1.5)
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
  roughness: 0.4,
  metalness: 0.0,
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
  env: { source: 'hdr', key: 'studio_small_03_1k' },
  ambientIntensity: 0.6,
  spotX_mm: 0,
  spotY_mm: 2200,
  spotZ_mm: 0,
  spotColor: '#fff2d6',
  spotIntensity: 8.0,
  toneMapping: 'aces',
  exposure: 1.0,
};
