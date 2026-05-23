# bath lab

화장실 인테리어 분위기 검증 prototype. three.js + R3F + drei 기반.

W / D / H 수치 입력 → 직사각형 공간 → 벽 텍스쳐 × 조명 슬라이더로 분위기 실시간 비교.

---

## 기능

- **수치 입력 entry** — W (가로) / D (세로) / H (높이) mm 만 받음. 도면 파싱 / 매뉴얼 입력 없음.
- **8 컨트롤 + 8 physical material 슬라이더**:
  - 벽 색 / roughness / metalness
  - PBR 텍스쳐 (면별 — 벽 / 바닥 / 천장) + tiling
  - 환경맵 (실파일 HDRI 3종 + drei 내장 preset 10종)
  - ambient + spotLight (위치 X/Y/Z + 색 + 강도)
  - tone mapping (Linear / ACES) + exposure
  - clearcoat / sheen / transmission / ior (meshPhysicalMaterial)

---

## 스택

| 영역 | 라이브러리 |
|---|---|
| 3D | three@0.170 + @react-three/fiber@8.17 + @react-three/drei@9.114 |
| UI | React 18 + Tailwind 3.4 |
| 빌드 | Vite 6 + TypeScript 5.6 |
| 테스트 | Vitest 4 + @testing-library/react + jsdom |

---

## 실행

```bash
npm install
npm run dev       # http://localhost:3000
npm run test      # vitest 단발
npm run test:watch
npm run build
```

---

## 에셋 출처

- HDRI: [PolyHaven](https://polyhaven.com/hdris) (CC0)
  - studio_small_03 / lebombo / kloofendal_48d_partly_cloudy_puresky (1k)
- PBR 텍스쳐: [PolyHaven](https://polyhaven.com/textures) (CC0)
  - red_brick_03 / castle_brick_07 / concrete_wall_004 / wood_planks / marble_01 (1k, 4 maps)

---

## 후속 계획

`/reports` 폴더의 plan md 참조 (별도 보관). Phase 1~4 단계:
- Phase 1: 2k HDRI / 2k 텍스쳐 / anisotropic filtering
- Phase 2: envMap intensity / anisotropy + iridescence / 면별 roughness/metalness
- Phase 3: MeshReflectorMaterial (바닥/거울 정확 반사)
- Phase 4: Displacement map (진짜 깊이 줄눈)

이후 plan 의 Step 4~7:
- Step 4: rectAreaLight (면광원)
- Step 5: SoftShadow + ContactShadow
- Step 6: postprocessing (Bloom + GTAO + SSR)
- Step 7: three-gpu-pathtracer (스냅샷 모드)
