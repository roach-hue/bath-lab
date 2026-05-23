/**
 * Vitest setup — jest-dom matcher + R3F / WebGL mock.
 *
 * @react-three/fiber 의 Canvas + drei 컴포넌트는 jsdom 환경에서 WebGL 컨텍스트
 * 없어 직접 렌더 X. R3F 컴포넌트의 props 통과 / state 동기화는 mock 으로 검증.
 */
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// fetch 가 jsdom 에 기본 없음 (texture/HDR 로드 시뮬용)
if (typeof globalThis.fetch === 'undefined') {
  // @ts-expect-error mock fetch
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
    })
  );
}

// WebGL context mock (three.js Canvas 호출 시 에러 방지)
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  getExtension: vi.fn(),
  getParameter: vi.fn(),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  enable: vi.fn(),
  blendFunc: vi.fn(),
  viewport: vi.fn(),
  clear: vi.fn(),
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;
