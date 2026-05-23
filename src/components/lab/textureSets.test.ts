/**
 * textureSets 단위 테스트.
 *
 * 회귀 차단:
 *  - 모든 셋이 4 맵 (diff/normal/rough/ao) 정의
 *  - 모든 URL 이 frontend/public/textures/bath/ 기준 형식
 *  - TEXTURE_OPTIONS 에 'none' 옵션 포함 + TEXTURE_SETS 와 키 정합
 *  - 1k → 2k 경로 교체 시 path 검증 단계 별도 추가 가능
 */
import { describe, it, expect } from 'vitest';
import {
  TEXTURE_SETS,
  TEXTURE_OPTIONS,
  type TextureSetKey,
} from './textureSets';

describe('textureSets', () => {
  it('모든 셋이 5 맵 (diff/normal/rough/ao/disp) 정의 + URL 형식', () => {
    for (const [slug, set] of Object.entries(TEXTURE_SETS)) {
      expect(set, `${slug}.diff`).toHaveProperty('diff');
      expect(set, `${slug}.normal`).toHaveProperty('normal');
      expect(set, `${slug}.rough`).toHaveProperty('rough');
      expect(set, `${slug}.ao`).toHaveProperty('ao');
      expect(set, `${slug}.disp`).toHaveProperty('disp');
      // path 형식 — /textures/bath/{slug}/{slug}_{map}_*.jpg
      expect(set.diff).toMatch(new RegExp(`^/textures/bath/${slug}/${slug}_diff_\\dk\\.jpg$`));
      expect(set.normal).toMatch(new RegExp(`^/textures/bath/${slug}/${slug}_nor_gl_\\dk\\.jpg$`));
      expect(set.rough).toMatch(new RegExp(`^/textures/bath/${slug}/${slug}_rough_\\dk\\.jpg$`));
      expect(set.ao).toMatch(new RegExp(`^/textures/bath/${slug}/${slug}_ao_\\dk\\.jpg$`));
      expect(set.disp).toMatch(new RegExp(`^/textures/bath/${slug}/${slug}_disp_\\dk\\.jpg$`));
    }
  });

  it('TEXTURE_OPTIONS 에 none 포함 + TEXTURE_SETS 와 키 정합', () => {
    const noneOpt = TEXTURE_OPTIONS.find((o) => o.key === 'none');
    expect(noneOpt).toBeDefined();

    const setKeys = Object.keys(TEXTURE_SETS) as TextureSetKey[];
    for (const k of setKeys) {
      const opt = TEXTURE_OPTIONS.find((o) => o.key === k);
      expect(opt, `option for ${k}`).toBeDefined();
    }

    // 'none' + 5 셋 = 6 옵션 (sub-step 추가 시 갱신 필요)
    expect(TEXTURE_OPTIONS.length).toBeGreaterThanOrEqual(6);
  });

  it('각 셋의 category 는 wall / floor / any 중 하나', () => {
    for (const set of Object.values(TEXTURE_SETS)) {
      expect(['wall', 'floor', 'any']).toContain(set.category);
    }
  });
});
