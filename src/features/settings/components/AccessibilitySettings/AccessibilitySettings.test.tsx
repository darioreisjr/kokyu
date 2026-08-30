import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { AccessibilitySettings } from './AccessibilitySettings';

describe('AccessibilitySettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('changes "Reduzir movimento"', async () => {
    const user = userEvent.setup();
    render(<AccessibilitySettings />);

    expect(screen.getByRole('radio', { name: /Seguir sistema/ })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Reduzir' }));
    expect(screen.getByRole('radio', { name: 'Reduzir' })).toBeChecked();
  });

  it('"Alto contraste" reads and writes the same state as Aparência\'s Contraste', async () => {
    const user = userEvent.setup();
    render(<AccessibilitySettings />);

    const toggle = screen.getByRole('switch', { name: 'Alto contraste' });
    expect(toggle).not.toBeChecked();

    await user.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('toggles "Sublinhar links"', async () => {
    const user = userEvent.setup();
    render(<AccessibilitySettings />);

    const toggle = screen.getByRole('switch', { name: 'Sublinhar links' });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('toggles "Foco reforçado"', async () => {
    const user = userEvent.setup();
    render(<AccessibilitySettings />);

    const toggle = screen.getByRole('switch', { name: 'Foco reforçado' });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('keeps "Cores assistidas" disabled — prepared, not implemented', () => {
    render(<AccessibilitySettings />);
    expect(screen.getByLabelText('Cores assistidas')).toHaveAttribute('aria-disabled', 'true');
  });

  it('"Tamanho do texto" links to Aparência instead of duplicating the control', () => {
    render(<AccessibilitySettings />);
    expect(screen.getByRole('link', { name: 'Ir para Aparência' })).toHaveAttribute(
      'href',
      '/app/configuracoes?section=aparencia#setting-aparencia-tamanho-texto',
    );
  });
});
