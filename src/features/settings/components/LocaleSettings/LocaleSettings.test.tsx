import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { LocaleSettings } from './LocaleSettings';

describe('LocaleSettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('changes "Formato de data"', async () => {
    const user = userEvent.setup();
    render(<LocaleSettings />);

    const select = screen.getByLabelText('Formato de data');
    expect(select).toHaveTextContent('DD/MM/AAAA');

    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'AAAA-MM-DD' }));

    expect(screen.getByLabelText('Formato de data')).toHaveTextContent('AAAA-MM-DD');
  });

  it('changes "Formato de horário"', async () => {
    const user = userEvent.setup();
    render(<LocaleSettings />);

    const select = screen.getByLabelText('Formato de horário');
    expect(select).toHaveTextContent('24 horas');

    await user.click(select);
    await user.click(screen.getByRole('option', { name: '12 horas (AM/PM)' }));

    expect(screen.getByLabelText('Formato de horário')).toHaveTextContent('12 horas (AM/PM)');
  });

  it('changes "A semana começa em"', async () => {
    const user = userEvent.setup();
    render(<LocaleSettings />);

    const select = screen.getByLabelText('A semana começa em');
    expect(select).toHaveTextContent('Segunda-feira');

    await user.click(select);
    await user.click(screen.getByRole('option', { name: 'Domingo' }));

    expect(screen.getByLabelText('A semana começa em')).toHaveTextContent('Domingo');
  });

  it('switches "Fuso horário" to manual and reveals the zone picker', async () => {
    const user = userEvent.setup();
    render(<LocaleSettings />);

    expect(screen.queryByLabelText('Selecionar fuso horário')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Fuso horário'));
    await user.click(screen.getByRole('option', { name: 'Manual' }));

    expect(screen.getByLabelText('Selecionar fuso horário')).toBeInTheDocument();
  });

  it('keeps "Idioma" and "Região" disabled, with a single option each', () => {
    render(<LocaleSettings />);

    expect(screen.getByLabelText('Idioma')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByLabelText('Região')).toHaveAttribute('aria-disabled', 'true');
  });
});
