import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { AuthVisualPanel } from './AuthVisualPanel';

describe('AuthVisualPanel', () => {
  it('renders the eyebrow, headline and body copy it is given', () => {
    render(
      <AuthVisualPanel
        variant="login"
        eyebrow="Kokyu"
        headline="Respire. Organize. Evolua."
        body="Um único lugar para tudo."
      />,
    );

    expect(screen.getByText('Kokyu')).toBeInTheDocument();
    expect(screen.getByText('Respire. Organize. Evolua.')).toBeInTheDocument();
    expect(screen.getByText('Um único lugar para tudo.')).toBeInTheDocument();
  });

  it('is hidden from assistive technology as pure decoration', () => {
    const { container } = render(
      <AuthVisualPanel variant="createAccount" eyebrow="Kokyu" headline="H" body="B" />,
    );

    expect(container.querySelector('aside[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('renders the forgotPassword variant without crashing, reducedMotion forced for determinism', () => {
    render(
      <AuthVisualPanel
        variant="forgotPassword"
        eyebrow="Kokyu"
        headline="Encontre novamente o seu ritmo."
        body="Uma pequena pausa é suficiente."
        reducedMotion
      />,
    );

    expect(screen.getByText('Encontre novamente o seu ritmo.')).toBeInTheDocument();
  });
});
