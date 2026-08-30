import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { ProfileAvatar } from './ProfileAvatar';

function makeFile(name: string, type: string, size = 1000): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe('ProfileAvatar', () => {
  it('renders initials when there is no photo', () => {
    render(
      <ProfileAvatar
        previewUrl={null}
        firstName="Dario"
        lastName="Reis"
        onFileSelected={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText('DR')).toBeInTheDocument();
  });

  it('renders the image with an accessible alt text when a photo exists', () => {
    render(
      <ProfileAvatar
        previewUrl="blob:mock-avatar"
        firstName="Dario"
        lastName="Reis"
        onFileSelected={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByRole('img', { name: 'Foto de perfil de Dario Reis' })).toBeInTheDocument();
  });

  it('does not show "Remover foto" when there is no photo', () => {
    render(
      <ProfileAvatar
        previewUrl={null}
        firstName="Dario"
        lastName="Reis"
        onFileSelected={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Remover foto' })).not.toBeInTheDocument();
  });

  it('shows "Remover foto" once there is a photo, and calls onRemove', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(
      <ProfileAvatar
        previewUrl="blob:mock-avatar"
        firstName="Dario"
        lastName="Reis"
        onFileSelected={vi.fn()}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Remover foto' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('calls onFileSelected with the chosen file via the accessible file input', async () => {
    const onFileSelected = vi.fn();
    const user = userEvent.setup();
    render(
      <ProfileAvatar
        previewUrl={null}
        firstName="Dario"
        lastName="Reis"
        onFileSelected={onFileSelected}
        onRemove={vi.fn()}
      />,
    );

    const file = makeFile('avatar.jpg', 'image/jpeg');
    await user.upload(screen.getByLabelText('Foto de perfil'), file);

    expect(onFileSelected).toHaveBeenCalledTimes(1);
    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  it('triggers the hidden file input when "Alterar foto" is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProfileAvatar
        previewUrl={null}
        firstName="Dario"
        lastName="Reis"
        onFileSelected={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    const input = screen.getByLabelText('Foto de perfil') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    await user.click(screen.getByRole('button', { name: 'Alterar foto' }));
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('shows a validation error message when given one', () => {
    render(
      <ProfileAvatar
        previewUrl={null}
        firstName="Dario"
        lastName="Reis"
        error="A imagem deve ter no máximo 5 MB."
        onFileSelected={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByText('A imagem deve ter no máximo 5 MB.')).toBeInTheDocument();
  });

  it('shows a non-blocking dimension warning when given one', () => {
    render(
      <ProfileAvatar
        previewUrl="blob:mock-avatar"
        firstName="Dario"
        lastName="Reis"
        warning="Para melhor qualidade, use uma imagem de pelo menos 256x256px."
        onFileSelected={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Para melhor qualidade, use uma imagem de pelo menos 256x256px.'),
    ).toBeInTheDocument();
    // A warning never blocks "Remover foto" from still being usable.
    expect(screen.getByRole('button', { name: 'Remover foto' })).toBeEnabled();
  });

  it('disables both actions while disabled', () => {
    render(
      <ProfileAvatar
        previewUrl="blob:mock-avatar"
        firstName="Dario"
        lastName="Reis"
        disabled
        onFileSelected={vi.fn()}
        onRemove={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Alterar foto' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remover foto' })).toBeDisabled();
  });
});
