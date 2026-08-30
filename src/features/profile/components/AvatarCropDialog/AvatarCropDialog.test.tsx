import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { AvatarCropDialog } from './AvatarCropDialog';

interface MockArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const REPORTED_PIXEL_CROP: MockArea = { x: 10, y: 20, width: 200, height: 200 };

/**
 * `react-easy-crop`'s own drag/zoom internals aren't ours to test (per
 * spec) and can't run meaningfully in jsdom anyway (no real image
 * decoding). This stub only exposes the one thing `AvatarCropDialog`
 * actually depends on: that `onCropComplete` eventually fires with a
 * pixel crop.
 */
vi.mock('react-easy-crop', () => ({
  default: ({
    onCropComplete,
  }: {
    onCropComplete: (croppedArea: MockArea, croppedAreaPixels: MockArea) => void;
  }) => (
    <button
      type="button"
      onClick={() => onCropComplete({ x: 0, y: 0, width: 100, height: 100 }, REPORTED_PIXEL_CROP)}
    >
      mock cropper
    </button>
  ),
}));

describe('AvatarCropDialog', () => {
  it('is not visible when closed', () => {
    render(
      <AvatarCropDialog open={false} imageSrc={null} onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the title and the zoom/rotation controls when open', () => {
    render(<AvatarCropDialog open imageSrc="blob:source" onCancel={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Ajustar foto' })).toBeInTheDocument();
    expect(screen.getByText('Zoom')).toBeInTheDocument();
    expect(screen.getByText('Rotação')).toBeInTheDocument();
  });

  it('disables "Usar esta foto" until a crop area has been reported', () => {
    render(<AvatarCropDialog open imageSrc="blob:source" onCancel={vi.fn()} onConfirm={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Usar esta foto' })).toBeDisabled();
  });

  it('calls onCancel when "Cancelar" is clicked', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <AvatarCropDialog open imageSrc="blob:source" onCancel={onCancel} onConfirm={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm with the reported pixel crop and the current rotation', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(
      <AvatarCropDialog open imageSrc="blob:source" onCancel={vi.fn()} onConfirm={onConfirm} />,
    );

    await user.click(screen.getByRole('button', { name: 'mock cropper' }));
    const confirmButton = screen.getByRole('button', { name: 'Usar esta foto' });
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledWith(REPORTED_PIXEL_CROP, 0);
  });

  it('resets to a fresh crop state for a new source image', () => {
    const { rerender } = render(
      <AvatarCropDialog open imageSrc="blob:source-a" onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );

    rerender(
      <AvatarCropDialog open imageSrc="blob:source-b" onCancel={vi.fn()} onConfirm={vi.fn()} />,
    );

    // A new source never inherits the previous image's reported crop area.
    expect(screen.getByRole('button', { name: 'Usar esta foto' })).toBeDisabled();
  });
});
