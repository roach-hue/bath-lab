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
import { useThree } from '@react-three/fiber';
import { useTexture, MeshReflectorMaterial } from '@react-three/drei';
import {
  TEXTURE_SETS,
  TextureSet,
  TextureSetKey,
} from './textureSets';

const MM = 0.001;

/** 면별 PBR 파라미터 (Phase 2-I — roughness/metalness 면별 독립). */
export type FaceMat = {
  color: string;
  roughness: number;
  metalness: number;
};

/** Step 3 + Phase 2 + Phase 4 — meshPhysicalMaterial 확장 prop. 모든 face material 공통. */
export type PhysicalExtras = {
  clearcoat: number;
  clearcoatRoughness: number;
  sheen: number;
  sheenColor: string;
  sheenRoughness: number;
  transmission: number;
  thickness: number;
  ior: number;
  // Phase 2-A
  anisotropy: number;
  anisotropyRotation: number;
  iridescence: number;
  iridescenceIOR: number;
  // Phase 2-E
  envIntensity: number;
  // Phase 4-H — displacement scale (모든 face 동일 scale)
  displacementScale: number;
};

/** Phase 3-B — MeshReflectorMaterial 컨트롤 prop. */
export type ReflectorSettings = {
  enabled: boolean;
  mixStrength: number;
  blur: number;
  mixBlur: number;
  roughness: number;
  resolution: 256 | 512 | 1024 | 2048;
};

/** Phase 4-H — Displacement (vertex 변형). */
export type DisplacementSettings = {
  scale: number; // 0 = 효과 X. 0.05 정도면 강함 (5cm)
  segments: 16 | 32 | 64 | 128;
};

type Props = {
  w_mm: number;
  d_mm: number;
  h_mm: number;
  wallMat: FaceMat;
  floorMat: FaceMat;
  ceilingMat: FaceMat;
  physical: PhysicalExtras;
  wallTexture: TextureSetKey;
  floorTexture: TextureSetKey;
  ceilingTexture: TextureSetKey;
  textureRepeat: number;
  reflector: ReflectorSettings;
  displacement: DisplacementSettings;
};

export default function BathRoom({
  w_mm,
  d_mm,
  h_mm,
  wallMat,
  floorMat,
  ceilingMat,
  physical,
  wallTexture,
  floorTexture,
  ceilingTexture,
  textureRepeat,
  reflector,
  displacement,
}: Props) {
  const w = w_mm * MM;
  const d = d_mm * MM;
  const h = h_mm * MM;

  // Phase 4-H: BoxGeometry 의 segments 늘려 displacement 가 실제 vertex 변형.
  const segs = displacement.segments;
  const geom = useMemo(
    () => new THREE.BoxGeometry(w, h, d, segs, segs, segs),
    [w, h, d, segs],
  );

  return (
    <group>
      <mesh geometry={geom} position={[0, h / 2, 0]} receiveShadow>
        <FaceMaterial attach="material-0" textureKey={wallTexture} base={wallMat} physical={physical} repeat={textureRepeat} />
        <FaceMaterial attach="material-1" textureKey={wallTexture} base={wallMat} physical={physical} repeat={textureRepeat} />
        <FaceMaterial attach="material-2" textureKey={ceilingTexture} base={ceilingMat} physical={physical} repeat={textureRepeat} />
        {/* 바닥 자리 = 항상 invisible. ReflectorFloor 또는 FloorPlane 이 대체 */}
        <meshBasicMaterial attach="material-3" visible={false} />
        <FaceMaterial attach="material-4" textureKey={wallTexture} base={wallMat} physical={physical} repeat={textureRepeat} />
        <FaceMaterial attach="material-5" textureKey={wallTexture} base={wallMat} physical={physical} repeat={textureRepeat} />
      </mesh>
      <FloorElement
        w={w}
        d={d}
        textureKey={floorTexture}
        base={floorMat}
        physical={physical}
        repeat={textureRepeat}
        reflector={reflector}
        segments={segs}
      />
    </group>
  );
}

/** Phase 3-B — 바닥 단독 plane. reflector.enabled 시 MeshReflectorMaterial, 아니면 일반 PBR.
 *  Phase 4 — planeGeometry 의 segments 도 분할 (displacement 동작). */
function FloorElement({
  w,
  d,
  textureKey,
  base,
  physical,
  repeat,
  reflector,
  segments,
}: {
  w: number;
  d: number;
  textureKey: TextureSetKey;
  base: FaceMat;
  physical: PhysicalExtras;
  repeat: number;
  reflector: ReflectorSettings;
  segments: number;
}) {
  if (reflector.enabled) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d, segments, segments]} />
        <ReflectorFloorMaterial textureKey={textureKey} base={base} repeat={repeat} reflector={reflector} />
      </mesh>
    );
  }
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[w, d, segments, segments]} />
      <SoloFaceMaterial textureKey={textureKey} base={base} physical={physical} repeat={repeat} />
    </mesh>
  );
}

/** 단일 mesh 에 붙는 FaceMaterial (attach prop 없는 version). */
function SoloFaceMaterial({
  textureKey,
  base,
  physical,
  repeat,
}: {
  textureKey: TextureSetKey;
  base: FaceMat;
  physical: PhysicalExtras;
  repeat: number;
}) {
  if (textureKey === 'none') {
    return (
      <meshPhysicalMaterial
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
        anisotropy={physical.anisotropy}
        anisotropyRotation={physical.anisotropyRotation}
        iridescence={physical.iridescence}
        iridescenceIOR={physical.iridescenceIOR}
        envMapIntensity={physical.envIntensity}
      />
    );
  }
  return <SoloTexturedFaceMaterial set={TEXTURE_SETS[textureKey]} base={base} physical={physical} repeat={repeat} />;
}

function SoloTexturedFaceMaterial({
  set,
  base,
  physical,
  repeat,
}: {
  set: TextureSet;
  base: FaceMat;
  physical: PhysicalExtras;
  repeat: number;
}) {
  const textures = useTexture({
    map: set.diff,
    normalMap: set.normal,
    roughnessMap: set.rough,
    aoMap: set.ao,
    displacementMap: set.disp,
  });
  const { gl } = useThree();
  useEffect(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    Object.values(textures).forEach((t) => {
      if (!t) return;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat, repeat);
      t.anisotropy = maxAniso;
      t.needsUpdate = true;
    });
    if (textures.map) textures.map.colorSpace = THREE.SRGBColorSpace;
    if (textures.normalMap) textures.normalMap.colorSpace = THREE.NoColorSpace;
    if (textures.roughnessMap) textures.roughnessMap.colorSpace = THREE.NoColorSpace;
    if (textures.aoMap) textures.aoMap.colorSpace = THREE.NoColorSpace;
    if (textures.displacementMap) textures.displacementMap.colorSpace = THREE.NoColorSpace;
  }, [textures, repeat, gl]);

  return (
    <meshPhysicalMaterial
      map={textures.map}
      normalMap={textures.normalMap}
      roughnessMap={textures.roughnessMap}
      aoMap={textures.aoMap}
      displacementMap={textures.displacementMap}
      displacementScale={physical.displacementScale}
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
      anisotropy={physical.anisotropy}
      anisotropyRotation={physical.anisotropyRotation}
      iridescence={physical.iridescence}
      iridescenceIOR={physical.iridescenceIOR}
      envMapIntensity={physical.envIntensity}
    />
  );
}

/** MeshReflectorMaterial 분기 wrapper. */
function ReflectorFloorMaterial({
  textureKey,
  base,
  repeat,
  reflector,
}: {
  textureKey: TextureSetKey;
  base: FaceMat;
  repeat: number;
  reflector: ReflectorSettings;
}) {
  if (textureKey === 'none') {
    return <SolidReflector base={base} reflector={reflector} />;
  }
  return <TexturedReflector set={TEXTURE_SETS[textureKey]} base={base} repeat={repeat} reflector={reflector} />;
}

function SolidReflector({ base, reflector }: { base: FaceMat; reflector: ReflectorSettings }) {
  return (
    <MeshReflectorMaterial
      mirror={1}
      mixStrength={reflector.mixStrength}
      mixBlur={reflector.mixBlur}
      blur={[reflector.blur, reflector.blur]}
      resolution={reflector.resolution}
      color={base.color}
      roughness={reflector.roughness}
      metalness={base.metalness}
    />
  );
}

function TexturedReflector({
  set,
  base,
  repeat,
  reflector,
}: {
  set: TextureSet;
  base: FaceMat;
  repeat: number;
  reflector: ReflectorSettings;
}) {
  const { gl } = useThree();
  const textures = useTexture({
    map: set.diff,
    normalMap: set.normal,
    roughnessMap: set.rough,
  });
  useEffect(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    Object.values(textures).forEach((t) => {
      if (!t) return;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat, repeat);
      t.anisotropy = maxAniso;
      t.needsUpdate = true;
    });
    if (textures.map) textures.map.colorSpace = THREE.SRGBColorSpace;
    if (textures.normalMap) textures.normalMap.colorSpace = THREE.NoColorSpace;
    if (textures.roughnessMap) textures.roughnessMap.colorSpace = THREE.NoColorSpace;
  }, [textures, repeat, gl]);

  return (
    <MeshReflectorMaterial
      mirror={1}
      mixStrength={reflector.mixStrength}
      mixBlur={reflector.mixBlur}
      blur={[reflector.blur, reflector.blur]}
      resolution={reflector.resolution}
      color={base.color}
      roughness={reflector.roughness}
      metalness={base.metalness}
      map={textures.map}
      normalMap={textures.normalMap}
      roughnessMap={textures.roughnessMap}
    />
  );
}

type FaceMaterialProps = {
  attach: string;
  textureKey: TextureSetKey;
  base: FaceMat;
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
        anisotropy={physical.anisotropy}
        anisotropyRotation={physical.anisotropyRotation}
        iridescence={physical.iridescence}
        iridescenceIOR={physical.iridescenceIOR}
        envMapIntensity={physical.envIntensity}
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
  base: FaceMat;
  physical: PhysicalExtras;
  repeat: number;
}) {
  const textures = useTexture({
    map: set.diff,
    normalMap: set.normal,
    roughnessMap: set.rough,
    aoMap: set.ao,
    displacementMap: set.disp,
  });
  const { gl } = useThree();

  useEffect(() => {
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    Object.values(textures).forEach((t) => {
      if (!t) return;
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat, repeat);
      t.anisotropy = maxAniso;
      t.needsUpdate = true;
    });
    if (textures.map) textures.map.colorSpace = THREE.SRGBColorSpace;
    if (textures.normalMap) textures.normalMap.colorSpace = THREE.NoColorSpace;
    if (textures.roughnessMap) textures.roughnessMap.colorSpace = THREE.NoColorSpace;
    if (textures.aoMap) textures.aoMap.colorSpace = THREE.NoColorSpace;
    if (textures.displacementMap) textures.displacementMap.colorSpace = THREE.NoColorSpace;
  }, [textures, repeat, gl]);

  return (
    <meshPhysicalMaterial
      attach={attach}
      map={textures.map}
      normalMap={textures.normalMap}
      roughnessMap={textures.roughnessMap}
      aoMap={textures.aoMap}
      displacementMap={textures.displacementMap}
      displacementScale={physical.displacementScale}
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
      anisotropy={physical.anisotropy}
      anisotropyRotation={physical.anisotropyRotation}
      iridescence={physical.iridescence}
      iridescenceIOR={physical.iridescenceIOR}
      envMapIntensity={physical.envIntensity}
      side={THREE.BackSide}
    />
  );
}
