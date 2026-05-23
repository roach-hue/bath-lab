/**
 * BathRoom — 화장실 직사각형 공간.
 *
 * Step 2: Box 1개 + boxGeometry 의 6 face group 에 면별 material attach.
 * boxGeometry face 순서 (R3F + three.js):
 *   material-0 = +X (오른벽)
 *   material-1 = -X (왼벽)
 *   material-2 = +Y (천장 = 안쪽에서 위로 봄)
 *   material-3 = -Y (바닥 = 안쪽에서 아래로 봄)
 *   material-4 = +Z (앞벽)
 *   material-5 = -Z (뒷벽)
 *
 * 벽 = 0,1,4,5 / 천장 = 2 / 바닥 = 3.
 * 안쪽이 보이도록 side: BackSide.
 *
 * Step 3: meshStandardMaterial → meshPhysicalMaterial.
 *   clearcoat / sheen / transmission / ior 등 superset prop 활용.
 */
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import {
  TEXTURE_SETS,
  TextureSet,
  TextureSetKey,
} from './textureSets';

const MM = 0.001;

export type BathRoomMaterial = {
  color: string;
  roughness: number;
  metalness: number;
};

/** Step 3 — meshPhysicalMaterial 의 확장 prop. 모든 face material 에 공통 적용. */
export type PhysicalExtras = {
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  sheenColor: string;
  sheenRoughness: number;
  transmission: number;
  thickness: number;
  ior: number;
};

type Props = {
  w_mm: number;
  d_mm: number;
  h_mm: number;
  material: BathRoomMaterial;
  physical: PhysicalExtras;
  // Step 2 — 면별 텍스쳐 키
  wallTexture: TextureSetKey;
  floorTexture: TextureSetKey;
  ceilingTexture: TextureSetKey;
  textureRepeat: number;
};

export default function BathRoom({
  w_mm,
  d_mm,
  h_mm,
  material,
  physical,
  wallTexture,
  floorTexture,
  ceilingTexture,
  textureRepeat,
}: Props) {
  const w = w_mm * MM;
  const d = d_mm * MM;
  const h = h_mm * MM;

  const geom = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);

  const faceCommon = { base: material, physical, repeat: textureRepeat };

  return (
    <mesh geometry={geom} position={[0, h / 2, 0]} receiveShadow castShadow>
      {/* 벽 4면 (0, 1, 4, 5) */}
      <FaceMaterial attach="material-0" textureKey={wallTexture} {...faceCommon} />
      <FaceMaterial attach="material-1" textureKey={wallTexture} {...faceCommon} />
      {/* 천장 (2) */}
      <FaceMaterial attach="material-2" textureKey={ceilingTexture} {...faceCommon} />
      {/* 바닥 (3) */}
      <FaceMaterial attach="material-3" textureKey={floorTexture} {...faceCommon} />
      {/* 벽 4면 (계속) */}
      <FaceMaterial attach="material-4" textureKey={wallTexture} {...faceCommon} />
      <FaceMaterial attach="material-5" textureKey={wallTexture} {...faceCommon} />
    </mesh>
  );
}

type FaceMaterialProps = {
  attach: string;
  textureKey: TextureSetKey;
  base: BathRoomMaterial;
  physical: PhysicalExtras;
  repeat: number;
};

function FaceMaterial({ attach, textureKey, base, physical, repeat }: FaceMaterialProps) {
  if (textureKey === 'none') {
    return (
      <meshPhysicalMaterial
        attach={attach}
        color={base.color}
        roughness={base.roughness}
        metalness={base.metalness}
        clearcoat={physical.clearcoat}
        clearcoatRoughness={physical.clearcoatRoughness}
        sheen={physical.sheen}
        sheenColor={physical.sheenColor}
        sheenRoughness={physical.sheenRoughness}
        transmission={physical.transmission}
        thickness={physical.thickness}
        ior={physical.ior}
        side={THREE.BackSide}
      />
    );
  }
  return (
    <TexturedFaceMaterial
      attach={attach}
      set={TEXTURE_SETS[textureKey]}
      base={base}
      physical={physical}
      repeat={repeat}
    />
  );
}

function TexturedFaceMaterial({
  attach,
  set,
  base,
  physical,
  repeat,
}: {
  attach: string;
  set: TextureSet;
  base: BathRoomMaterial;
  physical: PhysicalExtras;
  repeat: number;
}) {
  const textures = useTexture({
    map: set.diff,
    normalMap: set.normal,
    roughnessMap: set.rough,
    aoMap: set.ao,
  });

  // tiling repeat 설정 + colorSpace 정합 (diff 만 sRGB, 나머지는 linear)
  useEffect(() => {
    Object.values(textures).forEach((t) => {
      if (!t) return;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat, repeat);
      t.needsUpdate = true;
    });
    if (textures.map) textures.map.colorSpace = THREE.SRGBColorSpace;
    if (textures.normalMap) textures.normalMap.colorSpace = THREE.NoColorSpace;
    if (textures.roughnessMap) textures.roughnessMap.colorSpace = THREE.NoColorSpace;
    if (textures.aoMap) textures.aoMap.colorSpace = THREE.NoColorSpace;
  }, [textures, repeat]);

  return (
    <meshPhysicalMaterial
      attach={attach}
      map={textures.map}
      normalMap={textures.normalMap}
      roughnessMap={textures.roughnessMap}
      aoMap={textures.aoMap}
      color={base.color}
      metalness={base.metalness}
      clearcoat={physical.clearcoat}
      clearcoatRoughness={physical.clearcoatRoughness}
      sheen={physical.sheen}
      sheenColor={physical.sheenColor}
      sheenRoughness={physical.sheenRoughness}
      transmission={physical.transmission}
      thickness={physical.thickness}
      ior={physical.ior}
      side={THREE.BackSide}
    />
  );
}
