import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { UseAvatarEditorResult } from '../../hooks/useAvatarEditor';
import { ProfileSummary } from './ProfileSummary';

function makeAvatar(overrides: Partial<UseAvatarEditorResult> = {}): UseAvatarEditorResult {
  return {
    previewUrl: null,
    isDirty: false,
    warning: null,
    error: null,
    cropSource: null,
    pendingChange: null,
    onFileSelected: vi.fn(),
    onCancelCrop: vi.fn(),
    onConfirmCrop: vi.fn(),
    onRemove: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
}

describe('ProfileSummary', () => {
  it('shows the full name and @username', () => {
    render(
      <ProfileSummary
        firstName="Dario"
        lastName="Reis"
        username="darioreis"
        bio=""
        avatar={makeAvatar()}
      />,
    );

    expect(screen.getByText('Dario Reis')).toBeInTheDocument();
    expect(screen.getByText('@darioreis')).toBeInTheDocument();
  });

  it('updates live as the given values change (the preview reflects the form)', () => {
    const { rerender } = render(
      <ProfileSummary
        firstName="Dario"
        lastName="Reis"
        username="darioreis"
        bio=""
        avatar={makeAvatar()}
      />,
    );

    rerender(
      <ProfileSummary
        firstName="Novo"
        lastName="Nome"
        username="novo_nome"
        bio=""
        avatar={makeAvatar()}
      />,
    );

    expect(screen.getByText('Novo Nome')).toBeInTheDocument();
    expect(screen.getByText('@novo_nome')).toBeInTheDocument();
  });

  it('shows the bio only when there is one', () => {
    const { rerender } = render(
      <ProfileSummary
        firstName="Dario"
        lastName="Reis"
        username="darioreis"
        bio=""
        avatar={makeAvatar()}
      />,
    );
    expect(screen.queryByText('Uma bio qualquer')).not.toBeInTheDocument();

    rerender(
      <ProfileSummary
        firstName="Dario"
        lastName="Reis"
        username="darioreis"
        bio="Uma bio qualquer"
        avatar={makeAvatar()}
      />,
    );
    expect(screen.getByText('Uma bio qualquer')).toBeInTheDocument();
  });

  it('opens the crop dialog when the avatar has a pending crop source', () => {
    render(
      <ProfileSummary
        firstName="Dario"
        lastName="Reis"
        username="darioreis"
        bio=""
        avatar={makeAvatar({ cropSource: 'blob:source' })}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Ajustar foto' })).toBeInTheDocument();
  });
});
