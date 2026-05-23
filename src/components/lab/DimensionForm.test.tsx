/**
 * DimensionForm 단위 테스트.
 *
 * 회귀 차단:
 *  - 양수 W/D/H 입력 → onSubmit 호출 + 값 정확
 *  - 음수/0 입력 → 시작 버튼 disabled, onSubmit 호출 X
 *  - 기본값 (initial 없으면 W=2000, D=1800, H=2400)
 *  - HTML5 number input step=1 (회귀 — 이전 step=10 으로 8000 reject 사례)
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DimensionForm from './DimensionForm';

describe('DimensionForm', () => {
  it('기본값으로 [시작] 클릭 시 onSubmit 호출', async () => {
    const onSubmit = vi.fn();
    render(<DimensionForm onSubmit={onSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /시작/ });
    expect(submitBtn).not.toBeDisabled();

    await userEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({ w_mm: 2000, d_mm: 1800, h_mm: 2400 });
  });

  it('initial 전달 시 입력값 prefill', () => {
    render(
      <DimensionForm
        onSubmit={vi.fn()}
        initial={{ w_mm: 3000, d_mm: 2500, h_mm: 2700 }}
      />,
    );
    expect((screen.getByLabelText(/가로/i) as HTMLInputElement).value).toBe('3000');
    expect((screen.getByLabelText(/세로/i) as HTMLInputElement).value).toBe('2500');
    expect((screen.getByLabelText(/높이/i) as HTMLInputElement).value).toBe('2700');
  });

  it('W=0 시 [시작] disabled', async () => {
    const onSubmit = vi.fn();
    render(<DimensionForm onSubmit={onSubmit} />);

    const widthInput = screen.getByLabelText(/가로/i) as HTMLInputElement;
    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, '0');

    const submitBtn = screen.getByRole('button', { name: /시작/ });
    expect(submitBtn).toBeDisabled();
  });

  it('입력 8000 (이전 step=10 회귀 사례) 정상 허용', async () => {
    const onSubmit = vi.fn();
    render(<DimensionForm onSubmit={onSubmit} />);

    const widthInput = screen.getByLabelText(/가로/i) as HTMLInputElement;
    await userEvent.clear(widthInput);
    await userEvent.type(widthInput, '8000');

    const submitBtn = screen.getByRole('button', { name: /시작/ });
    expect(submitBtn).not.toBeDisabled();

    await userEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalled();
    expect(onSubmit.mock.calls[0][0].w_mm).toBe(8000);
  });
});
