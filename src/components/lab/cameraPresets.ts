/**
 * cameraPresets — 입구 방향 (entranceWall) 기준 4개 카메라 시점 계산.
 *
 * 좌표계: 공간 바닥 중심 = (0, 0, 0)
 *   X = 가로 (W). 왼벽 -W/2, 오른벽 +W/2
 *   Y = 높이 (H). 바닥 0, 천장 H
 *   Z = 세로 (D). front -D/2, back +D/2
 *
 * entranceWall 매핑:
 *   front = -Z 면 (앞 벽이 입구)
 *   back  = +Z 면 (뒷 벽이 입구)
 *   left  = -X 면 (왼 벽이 입구)
 *   right = +X 면 (오른 벽이 입구)
 */
import type { MoodState } from './moodState';

const MM = 0.001;

export type CameraView = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};

/** 입구 방향의 단위 벡터 (입구에서 바라보는 안쪽 방향 = +inward). */
function inwardOf(wall: MoodState['entranceWall']): [number, number, number] {
  switch (wall) {
    case 'front': return [0, 0, 1];   // -Z 입구 → +Z 안쪽
    case 'back':  return [0, 0, -1];  // +Z 입구 → -Z 안쪽
    case 'left':  return [1, 0, 0];
    case 'right': return [-1, 0, 0];
  }
}

/** 입구 벽 위 정중앙 위치 (X/Z 좌표). 입구 안쪽 보는 시작점. */
function entrancePoint(wall: MoodState['entranceWall'], w: number, d: number): [number, number] {
  switch (wall) {
    case 'front': return [0, -d / 2];
    case 'back':  return [0, d / 2];
    case 'left':  return [-w / 2, 0];
    case 'right': return [w / 2, 0];
  }
}

/** preset 별 카메라 view 계산. */
export function computeCameraView(
  preset: MoodState['cameraPreset'],
  wall: MoodState['entranceWall'],
  w_mm: number,
  d_mm: number,
  h_mm: number,
): CameraView {
  const w = w_mm * MM;
  const d = d_mm * MM;
  const h = h_mm * MM;
  const [inX, , inZ] = inwardOf(wall);
  const [eX, eZ] = entrancePoint(wall, w, d);
  const centerY = h * 0.5;

  switch (preset) {
    case 'corner': {
      // 입구 옆 모서리에서 공간 중심 응시 (한 모서리 안쪽으로 약간 들어옴)
      // 입구 벽의 한 변 쪽 + 안쪽 약간
      const sideSign = wall === 'left' || wall === 'right' ? 1 : 1;
      const cornerX = wall === 'left' || wall === 'right' ? eX + inX * w * 0.15 : -w * 0.4 * sideSign + inX * w * 0.15;
      const cornerZ = wall === 'front' || wall === 'back' ? eZ + inZ * d * 0.15 : -d * 0.4 * sideSign + inZ * d * 0.15;
      return {
        position: [cornerX, h * 0.6, cornerZ],
        target: [0, centerY, 0],
        fov: 55,
      };
    }
    case 'frontal': {
      // 입구 정면 (입구에서 안쪽 정중앙 응시) — 시안 정면 샷
      // 카메라 = 입구에서 약간 뒤로 빠진 위치
      const backOff = 0.3; // 입구에서 더 뒤로 30cm
      return {
        position: [eX - inX * backOff, centerY, eZ - inZ * backOff],
        target: [eX + inX * w, centerY, eZ + inZ * d],
        fov: 60,
      };
    }
    case 'human': {
      // 사람 시점 (눈 높이 1.6m, 입구 정중앙에 서서 안쪽 응시)
      const eyeH = Math.min(1.6, h * 0.7);
      return {
        position: [eX + inX * 0.1, eyeH, eZ + inZ * 0.1], // 입구 안쪽 10cm
        target: [-eX, eyeH * 0.95, -eZ], // 반대편 벽 보기
        fov: 75, // 사람 시야 근사
      };
    }
    case 'top': {
      // 부감 (천장 살짝 아래에서 바닥 보기 — 평면도 같은 효과)
      return {
        position: [0, h * 0.95, 0.001], // 정중앙 천장 바로 아래 (0,0,0 lookAt 위해 약간 offset)
        target: [0, 0, 0],
        fov: 70,
      };
    }
  }
}

export const PRESET_LABEL: Record<MoodState['cameraPreset'], string> = {
  corner: '코너 샷 (모서리 안쪽)',
  frontal: '정면 샷 (입구→안쪽)',
  human: '사람 시점 (입구 1.6m)',
  top: '부감 (위에서 아래)',
};

export const WALL_LABEL: Record<MoodState['entranceWall'], string> = {
  front: '앞 벽 (-Z)',
  back: '뒷 벽 (+Z)',
  left: '왼 벽 (-X)',
  right: '오른 벽 (+X)',
};
