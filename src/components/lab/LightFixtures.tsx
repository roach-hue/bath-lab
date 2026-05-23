/**
 * LightFixtures — 조명 fixture 시각화 (mesh + emissive material).
 *
 * three.js 의 spotLight / rectAreaLight 는 추상 객체라 시각적으로 안 보임.
 * 진규님 지적: '조명이 어디 있는지 모르겠다' → 천장에 빛나는 mesh 추가.
 *
 *   - 다운라이트 (downlight): spotLight 위치에 원형 disc. emissive = spot color.
 *   - 면광원 패널 (panel): rectAreaLight 위치에 사각 plane. emissive = rectArea color.
 *
 * emissive material 은 path tracer 가 자동으로 light source 로 인식 (정확한 발광).
 * Bloom 후처리와 결합 시 후광 효과 자연.
 *
 * 위치 = 천장 면 (y = h) 살짝 아래로 (z-fighting 회피 1mm).
 */
import * as THREE from 'three';

const MM = 0.001;
const EPSILON = 0.002; // 천장면에서 2mm 아래

type Props = {
  h_mm: number;
  downlight: {
    show: boolean;
    x_mm: number;
    z_mm: number;
    diameter_mm: number;
    color: string;
    intensity: number; // emissiveIntensity 에 곱해짐
  };
  panel: {
    show: boolean;
    x_mm: number;
    z_mm: number;
    width_mm: number;
    height_mm: number;
    color: string;
    intensity: number;
  };
};

export default function LightFixtures({ h_mm, downlight, panel }: Props) {
  const h = h_mm * MM;
  const ceilingY = h - EPSILON;

  return (
    <group>
      {downlight.show && (
        <mesh
          position={[downlight.x_mm * MM, ceilingY, downlight.z_mm * MM]}
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
