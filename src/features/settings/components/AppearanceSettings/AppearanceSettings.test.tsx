import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { AppearanceSettings } from './AppearanceSettings';

describe('AppearanceSettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('shows the autosave note', () => {
    render(<AppearanceSettings />);
    expect(screen.getByText('Alterações salvas automaticamente')).toBeInTheDocument();
  });

  it('switches theme light → dark → back to system', async () => {
    const user = userEvent.setup();
    render(<AppearanceSettings />);

    expect(screen.getByRole('radio', { name: /Sistema/ })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Escuro' }));
    expect(screen.getByRole('radio', { name: 'Escuro' })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Sistema/ })).not.toBeChecked();

    await user.click(screen.getByRole('radio', { name: 'Claro' }));
    expect(screen.getByRole('radio', { name: 'Claro' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: /Sistema/ }));
    expect(screen.getByRole('radio', { name: /Sistema/ })).toBeChecked();
  });

  it('changes "Estilo de respiração" (accent)', async () => {
    const user = userEvent.setup();
    render(<AppearanceSettings />);

    expect(screen.getByRole('radio', { name: 'Hinokami' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Mizu' }));
    expect(screen.getByRole('radio', { name: 'Mizu' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Hinokami' })).not.toBeChecked();
  });

  it('toggles "Contraste" between Normal and Alto contraste', async () => {
    const user = userEvent.setup();
    render(<AppearanceSettings />);

    expect(screen.getByRole('radio', { name: 'Normal' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Alto contraste' }));
    expect(screen.getByRole('radio', { name: 'Alto contraste' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Normal' })).not.toBeChecked();
  });

  it('changes "Densidade"', async () => {
    const user = userEvent.setup();
    render(<AppearanceSettings />);

    expect(screen.getByRole('radio', { name: /Confortável/ })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: /Compacta/ }));
    expect(screen.getByRole('radio', { name: /Compacta/ })).toBeChecked();
  });

  it('changes "Tamanho do texto"', async () => {
    const user = userEvent.setup();
    render(<AppearanceSettings />);

    expect(screen.getByRole('radio', { name: 'Padrão' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Grande' }));
    expect(screen.getByRole('radio', { name: 'Grande' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Padrão' })).not.toBeChecked();
  });
});
