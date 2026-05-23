/**
 * textureSets — bath lab Step 2 의 PBR 텍스쳐 셋 메타.
 *
 * PolyHaven CC0 (1k). 각 셋 = diffuse(albedo) + normal(OpenGL) + roughness + AO.
 * 파일 경로는 frontend/public/textures/bath/ 기준.
 */

export type TextureSetKey =
  | 'none'
  | 'red_brick_03'
  | 'castle_brick_07'
  | 'concrete_wall_004'
  | 'wood_planks'
  | 'marble_01';

export type TextureSet = {
  label: string;
  category: 'wall' | 'floor' | 'any';
  diff: string;
  normal: string;
  rough: string;
  ao: string;
};

const base = (slug: string) => `/textures/bath/${slug}/${slug}`;

export const TEXTURE_SETS: Record<Exclude<TextureSetKey, 'none'>, TextureSet> = {
  red_brick_03: {
    label: '벽돌 (red brick, 깊은 줄눈)',
    category: 'wall',
    diff: `${base('red_brick_03')}_diff_1k.jpg`,
    normal: `${base('red_brick_03')}_nor_gl_1k.jpg`,
    rough: `${base('red_brick_03')}_rough_1k.jpg`,
    ao: `${base('red_brick_03')}_ao_1k.jpg`,
  },
  castle_brick_07: {
    label: '성벽 슬레이트 (castle brick)',
    category: 'wall',
    diff: `${base('castle_brick_07')}_diff_1k.jpg`,
    normal: `${base('castle_brick_07')}_nor_gl_1k.jpg`,
    rough: `${base('castle_brick_07')}_rough_1k.jpg`,
    ao: `${base('castle_brick_07')}_ao_1k.jpg`,
  },
  concrete_wall_004: {
    label: '콘크리트 (거친)',
    category: 'wall',
    diff: `${base('concrete_wall_004')}_diff_1k.jpg`,
    normal: `${base('concrete_wall_004')}_nor_gl_1k.jpg`,
    rough: `${base('concrete_wall_004')}_rough_1k.jpg`,
    ao: `${base('concrete_wall_004')}_ao_1k.jpg`,
  },
  wood_planks: {
    label: '나무 마루',
    category: 'floor',
    diff: `${base('wood_planks')}_diff_1k.jpg`,
    normal: `${base('wood_planks')}_nor_gl_1k.jpg`,
    rough: `${base('wood_planks')}_rough_1k.jpg`,
    ao: `${base('wood_planks')}_ao_1k.jpg`,
  },
  marble_01: {
    label: '대리석',
    category: 'any',
    diff: `${base('marble_01')}_diff_1k.jpg`,
    normal: `${base('marble_01')}_nor_gl_1k.jpg`,
    rough: `${base('marble_01')}_rough_1k.jpg`,
    ao: `${base('marble_01')}_ao_1k.jpg`,
  },
};

/** select 옵션 — 'none' 포함 전체 목록 (label 동반). */
export const TEXTURE_OPTIONS: Array<{ key: TextureSetKey; label: string; category: string }> = [
  { key: 'none', label: '없음 (단색)', category: 'any' },
  ...(Object.entries(TEXTURE_SETS).map(([k, v]) => ({
    key: k as TextureSetKey,
    label: v.label,
    category: v.category,
  }))),
];
