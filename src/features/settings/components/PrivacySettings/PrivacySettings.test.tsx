import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { PrivacySettings } from './PrivacySettings';

describe('PrivacySettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('both preferences start off', () => {
    render(<PrivacySettings />);
    expect(screen.getByRole('switch', { name: 'Dados de uso' })).not.toBeChecked();
    expect(
      screen.getByRole('switch', { name: 'Usar minha atividade para personalizar sugestões' }),
    ).not.toBeChecked();
  });

  it('toggles "Dados de uso"', async () => {
    const user = userEvent.setup();
    render(<PrivacySettings />);

    const toggle = screen.getByRole('switch', { name: 'Dados de uso' });
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });

  it('toggles "Usar minha atividade para personalizar sugestões"', async () => {
    const user = userEvent.setup();
    render(<PrivacySettings />);

    const toggle = screen.getByRole('switch', {
      name: 'Usar minha atividade para personalizar sugestões',
    });
    await user.click(toggle);
    expect(toggle).toBeChecked();
  });
});
