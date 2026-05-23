/**
 * moodState 단위 테스트.
 *
 * 회귀 차단 대상:
 *  - DEFAULT_MOOD 의 모든 키 존재 (sub-step 추가 시 누락 차단)
 *  - HDR_URL 매핑이 EnvHdrFile union 과 정합 (1k → 2k path 교체 시 검증)
 *  - 텍스쳐 path 가 frontend/public 기준 URL 형식
 */
import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MOOD,
  HDR_URL,
  type MoodState,
  type EnvHdrFile,
} from './moodState';

describe('moodState', () => {
  it('DEFAULT_MOOD 모든 키 정의', () => {
    const requiredKeys: Array<keyof MoodState> = [
      'wallColor',
      // Phase 2-I 면별
      'wallRoughness', 'wallMetalness',
      'floorRoughness', 'floorMetalness',
      'ceilingRoughness', 'ceilingMetalness',
      'wallTexture', 'floorTexture', 'ceilingTexture', 'textureRepeat',
      'clearcoat', 'clearcoatRoughness',
      'sheen', 'sheenColor', 'sheenRoughness',
      'transmission', 'thickness', 'ior',
      // Phase 2-A
      'anisotropy', 'anisotropyRotation', 'iridescence', 'iridescenceIOR',
      // Phase 2-E
      'envIntensity',
      // Phase 3-B reflector
      'reflectorEnabled', 'reflectorMixStrength', 'reflectorBlur',
      'reflectorMixBlur', 'reflectorRoughness', 'reflectorResolution',
      // Phase 4-H displacement
      'displacementScale', 'geometrySegments',
      // Step 4 rectArea
      'rectAreaEnabled', 'rectAreaX_mm', 'rectAreaY_mm', 'rectAreaZ_mm',
      'rectAreaWidth_mm', 'rectAreaHeight_mm', 'rectAreaColor', 'rectAreaIntensity',
      // Step 5 shadows
      'softShadowEnabled', 'softShadowSamples', 'softShadowFocus', 'softShadowSize',
      'contactShadowEnabled', 'contactShadowOpacity', 'contactShadowBlur',
      'env',
      'ambientIntensity',
      'spotX_mm', 'spotY_mm', 'spotZ_mm', 'spotColor', 'spotIntensity',
      'toneMapping', 'exposure',
    ];
    for (const k of requiredKeys) {
      expect(DEFAULT_MOOD).toHaveProperty(k);
    }
  });

  it('DEFAULT_MOOD 의 숫자 범위 유효', () => {
    // Phase 2-I 면별 roughness/metalness
    for (const k of ['wallRoughness', 'floorRoughness', 'ceilingRoughness'] as const) {
      expect(DEFAULT_MOOD[k]).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_MOOD[k]).toBeLessThanOrEqual(1);
    }
    for (const k of ['wallMetalness', 'floorMetalness', 'ceilingMetalness'] as const) {
      expect(DEFAULT_MOOD[k]).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_MOOD[k]).toBeLessThanOrEqual(1);
    }
    expect(DEFAULT_MOOD.clearcoat).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_MOOD.clearcoat).toBeLessThanOrEqual(1);
    expect(DEFAULT_MOOD.transmission).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_MOOD.transmission).toBeLessThanOrEqual(1);
    expect(DEFAULT_MOOD.ior).toBeGreaterThanOrEqual(1.0);
    expect(DEFAULT_MOOD.ior).toBeLessThanOrEqual(2.5);
    // Phase 2-A
    expect(DEFAULT_MOOD.anisotropy).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_MOOD.anisotropy).toBeLessThanOrEqual(1);
    expect(DEFAULT_MOOD.iridescence).toBeGreaterThanOrEqual(0);
    expect(DEFAULT_MOOD.iridescence).toBeLessThanOrEqual(1);
    // Phase 2-E
    expect(DEFAULT_MOOD.envIntensity).toBeGreaterThan(0);
    expect(DEFAULT_MOOD.exposure).toBeGreaterThan(0);
  });

  it('HDR_URL 의 모든 키가 EnvHdrFile union 과 정합 (Phase 1 — 2k)', () => {
    const keys: EnvHdrFile[] = [
      'studio_small_03_2k',
      'lebombo_2k',
      'kloofendal_48d_partly_cloudy_puresky_2k',
    ];
    for (const k of keys) {
      expect(HDR_URL).toHaveProperty(k);
      expect(HDR_URL[k]).toMatch(/^\/hdr\/.+_2k\.hdr$/);
    }
  });

  it('env source = preset OR hdr 의 discriminated union 정합', () => {
    if (DEFAULT_MOOD.env.source === 'preset') {
      expect(typeof DEFAULT_MOOD.env.key).toBe('string');
    } else {
      expect(DEFAULT_MOOD.env.source).toBe('hdr');
      expect(HDR_URL).toHaveProperty(DEFAULT_MOOD.env.key);
    }
  });
});
