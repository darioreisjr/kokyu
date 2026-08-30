import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { GeneralSettings } from './GeneralSettings';

describe('GeneralSettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('changes "Página inicial"', async () => {
    const user = userEvent.setup();
    render(<GeneralSettings />);

    const select = screen.getByLabelText('Página inicial');
    expect(select).toHaveTextContent('Respiração');

    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'Missões' }));

    expect(screen.getByLabelText('Página inicial')).toHaveTextContent('Missões');
  });

  it('disables "Página inicial" and shows a note once "Continuar de onde parei" is on', async () => {
    const user = userEvent.setup();
    render(<GeneralSettings />);

    await user.click(screen.getByRole('switch', { name: 'Continuar de onde parei' }));

    expect(screen.getByLabelText('Página inicial')).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByText('Ignorada enquanto "Continuar de onde parei" estiver ativo.'),
    ).toBeInTheDocument();
  });

  it('"Confirmar ações importantes" starts on', () => {
    render(<GeneralSettings />);
    expect(screen.getByRole('switch', { name: 'Confirmar ações importantes' })).toBeChecked();
  });
});
