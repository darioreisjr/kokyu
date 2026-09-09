import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '../../../../../test/test-utils';
import { CoverImageField } from './CoverImageField';

vi.mock('../../services/leisureCoverUploadService', () => ({
  uploadLeisureCoverImage: vi.fn(),
}));

const { uploadLeisureCoverImage } = await import('../../services/leisureCoverUploadService');

describe('CoverImageField', () => {
  beforeEach(() => {
    vi.mocked(uploadLeisureCoverImage).mockReset();
  });

  it('calls onChange with the full URL when the link field changes', () => {
    const onChange = vi.fn();
    render(<CoverImageField value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Link da imagem (opcional)'), {
      target: { value: 'https://x.test/a.png' },
    });

    expect(onChange).toHaveBeenCalledWith('https://x.test/a.png');
  });

  it('shows the placeholder icon only when there is no value', () => {
    const { rerender } = render(<CoverImageField value="" onChange={vi.fn()} />);
    expect(screen.getByTestId('ImageRoundedIcon')).toBeInTheDocument();

    rerender(<CoverImageField value="https://x.test/cover.png" onChange={vi.fn()} />);
    expect(screen.queryByTestId('ImageRoundedIcon')).not.toBeInTheDocument();
  });

  it('uploads a selected file and reports the resolved public URL via onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    vi.mocked(uploadLeisureCoverImage).mockResolvedValueOnce('https://x.test/uploaded.png');
    render(<CoverImageField value="" onChange={onChange} />);

    const file = new File([new Uint8Array(4)], 'cover.png', { type: 'image/png' });
    const input = screen.getByLabelText('Enviar imagem do computador', { exact: false });
    await user.upload(input, file);

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('https://x.test/uploaded.png'));
  });

  it('shows a validation error for an unsupported file type without uploading', async () => {
    render(<CoverImageField value="" onChange={vi.fn()} />);

    // fireEvent, not user.upload(): user-event v14 itself filters files
    // against the input's `accept` attribute (emulating the OS picker),
    // so it can never deliver a mismatched file in the first place - this
    // exercises validateCoverImageFile's own defense-in-depth check
    // instead (e.g. a drag-and-drop or a tampered `accept` attribute).
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const input = screen.getByLabelText('Enviar imagem do computador', { exact: false });
    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByText(/JPEG, PNG ou WebP/)).toBeInTheDocument();
    expect(uploadLeisureCoverImage).not.toHaveBeenCalled();
  });
});
