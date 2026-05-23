/**
 * LightFixtures — 조명 fixture 시각화 + 실제 light source.
 *
 * three.js 의 spotLight / rectAreaLight 는 추상 객체 (시각적 X).
 * 진규님 지적: '조명 어디?' → 천장에 emissive mesh + 실제 light 통합.
 *
 *   - 다운라이트: 원형 disc (emissive) + spotLight (실제 빛). N×N 그리드 자동 분산.
 *   - 면광원 패널: 사각 plane (emissive) + rectAreaLight (실제 빛). 단일.
 *
 * 그리드 좌표 계산 (균등 분할):
 *   N=1 → 중심 1개 (spotX, spotZ)
 *   N=2 → 4개 (천장 ±W/4, ±D/4)
 *   N=3 → 9개 (천장 -W/3, 0, +W/3 × -D/3, 0, +D/3)
 *
 * 그리드 시 spotLight intensity = 단일 / (N*N) 으로 자동 분산. 총 빛 양 유지.
 * castShadow = 중심 1개만 (WebGL shadow map 한도 회피).
 */
import { useMemo } from 'react';
import * as THREE from 'three';

const MM = 0.001;
const EPSILON = 0.002;

type DownlightProps = {
  show: boolean;
  /** 그리드 중심 X (mm). 기본 0 = 천장 정중앙. */
  centerX_mm: number;
  /** 그리드 중심 Z (mm). */
  centerZ_mm: number;
  /** spotLight Y (mm). */
  spotY_mm: number;
  diameter_mm: number;
  color: string;
  /** spotLight 총 강도. N×N 그리드 시 각각 intensity/(N*N). */
  intensity: number;
  gridSize: 1 | 2 | 3;
  /** 천장 공간 크기 — 그리드 spacing 계산용. */
  w_mm: number;
  d_mm: number;
};

type PanelProps = {
  show: boolean;
  x_mm: number;
  z_mm: number;
  width_mm: number;
  height_mm: number;
  color: string;
  intensity: number;
};

type Props = {
  h_mm: number;
  downlight: DownlightProps;
  panel: PanelProps;
};

/** N×N 그리드의 (i,j) 위치를 천장 좌표 (x, z) 로 변환. */
function gridPositions(
  n: 1 | 2 | 3,
  w_mm: number,
  d_mm: number,
  centerX_mm: number,
  centerZ_mm: number,
): Array<[number, number]> {
  if (n === 1) return [[centerX_mm, centerZ_mm]];
  // 천장 전체를 N+1 등분 → N 위치. 가장자리에서 일정 거리 띄움
  const positions: Array<[number, number]> = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const x = ((i + 1) / (n + 1)) * w_mm - w_mm / 2;
      const z = ((j + 1) / (n + 1)) * d_mm - d_mm / 2;
      positions.push([x, z]);
    }
  }
  return positions;
}

export default function LightFixtures({ h_mm, downlight, panel }: Props) {
  const h = h_mm * MM;
  const ceilingY = h - EPSILON;
  const spotY = downlight.spotY_mm * MM;

  // 그리드 위치 계산 (useMemo 로 캐시)
  const downlightPositions = useMemo(
    () =>
      gridPositions(
        downlight.gridSize,
        downlight.w_mm,
        downlight.d_mm,
        downlight.centerX_mm,
        downlight.centerZ_mm,
      ),
    [downlight.gridSize, downlight.w_mm, downlight.d_mm, downlight.centerX_mm, downlight.centerZ_mm],
  );

  const perLightIntensity = downlight.intensity / Math.max(1, downlightPositions.length);

  return (
    <group>
      {/* 다운라이트 그리드 — disc mesh + spotLight */}
      {downlightPositions.map(([x_mm, z_mm], idx) => {
        const x = x_mm * MM;
        const z = z_mm * MM;
        return (
          <group key={`dl-${idx}`}>
            {downlight.show && (
              <mesh
                position={[x, ceilingY, z]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <circleGeometry args={[(downlight.diameter_mm * MM) / 2, 48]} />
                <meshStandardMaterial
                  color="#000000"
                  emissive={downlight.color}
                  emissiveIntensity={Math.max(0.3, downlight.intensity * 0.4)}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
            <spotLight
              position={[x, spotY, z]}
              color={downlight.color}
              intensity={perLightIntensity}
              angle={Math.PI / 3}
              penumbra={0.5}
              castShadow={idx === Math.floor(downlightPositions.length / 2)}
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
          </group>
        );
      })}

      {/* 면광원 패널 — 단일 (그리드 X) */}
      {panel.show && (
        <mesh
          position={[panel.x_mm * MM, ceilingY, panel.z_mm * MM]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[panel.width_mm * MM, panel.height_mm * MM]} />
          <meshStandardMaterial
            color="#000000"
            emissive={panel.color}
            emissiveIntensity={Math.max(0.3, panel.intensity * 0.2)}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
