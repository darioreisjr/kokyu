import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { NavigationSettings } from './NavigationSettings';

describe('NavigationSettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('changes "Menu lateral" between Expandido and Recolhido', async () => {
    const user = userEvent.setup();
    render(<NavigationSettings />);

    const select = screen.getByLabelText('Menu lateral');
    expect(select).toHaveTextContent('Expandido');

    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'Recolhido' }));

    expect(screen.getByLabelText('Menu lateral')).toHaveTextContent('Recolhido');
  });

  it('toggles "Lembrar estado do menu"', async () => {
    const user = userEvent.setup();
    render(<NavigationSettings />);

    const toggle = screen.getByRole('switch', { name: 'Lembrar estado do menu' });
    expect(toggle).toBeChecked();

    await user.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('toggles "Transições entre páginas"', async () => {
    const user = userEvent.setup();
    render(<NavigationSettings />);

    const toggle = screen.getByRole('switch', { name: 'Transições entre páginas' });
    expect(toggle).toBeChecked();

    await user.click(toggle);
    expect(toggle).not.toBeChecked();
  });
});
