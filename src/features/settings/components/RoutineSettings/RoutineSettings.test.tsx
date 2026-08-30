import { fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { RoutineSettings } from './RoutineSettings';

describe('RoutineSettings', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('changes "Início do dia" and "Fim do dia"', () => {
    render(<RoutineSettings />);

    const startField = screen.getByLabelText('Início do dia');
    expect(startField).toHaveValue('06:00');
    fireEvent.change(startField, { target: { value: '07:30' } });
    expect(screen.getByLabelText('Início do dia')).toHaveValue('07:30');

    const endField = screen.getByLabelText('Fim do dia');
    expect(endField).toHaveValue('23:00');
    fireEvent.change(endField, { target: { value: '22:00' } });
    expect(screen.getByLabelText('Fim do dia')).toHaveValue('22:00');
  });

  it('all 7 days start active in "Dias da semana"', () => {
    render(<RoutineSettings />);

    const group = screen.getByRole('group', { name: 'Dias da semana ativos' });
    for (const day of ['Domingo', 'Segunda-feira', 'Terça-feira', 'Sábado']) {
      expect(within(group).getByRole('button', { name: day })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    }
  });

  it('toggles a day off in "Dias da semana"', async () => {
    const user = userEvent.setup();
    render(<RoutineSettings />);

    const group = screen.getByRole('group', { name: 'Dias da semana ativos' });
    const sunday = within(group).getByRole('button', { name: 'Domingo' });
    expect(sunday).toHaveAttribute('aria-pressed', 'true');

    await user.click(sunday);
    expect(sunday).toHaveAttribute('aria-pressed', 'false');
  });

  it('"Meu fim de semana" defaults to Saturday and Sunday, independent of "Dias da semana"', () => {
    render(<RoutineSettings />);

    const weekend = screen.getByRole('group', { name: 'Dias de fim de semana' });
    expect(within(weekend).getByRole('button', { name: 'Domingo' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(weekend).getByRole('button', { name: 'Sábado' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(weekend).getByRole('button', { name: 'Terça-feira' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('"Resumo da manhã" starts off with its time field disabled, enabling it when turned on', async () => {
    const user = userEvent.setup();
    render(<RoutineSettings />);

    const toggle = screen.getByRole('switch', { name: 'Resumo da manhã' });
    const timeField = screen.getByLabelText('Horário do resumo da manhã');
    expect(toggle).not.toBeChecked();
    expect(timeField).toBeDisabled();

    await user.click(toggle);
    expect(toggle).toBeChecked();
    expect(screen.getByLabelText('Horário do resumo da manhã')).toBeEnabled();
  });

  it('"Revisão noturna" starts off with its time field disabled, enabling it when turned on', async () => {
    const user = userEvent.setup();
    render(<RoutineSettings />);

    const toggle = screen.getByRole('switch', { name: 'Revisão noturna' });
    expect(toggle).not.toBeChecked();
    expect(screen.getByLabelText('Horário da revisão noturna')).toBeDisabled();

    await user.click(toggle);
    expect(screen.getByLabelText('Horário da revisão noturna')).toBeEnabled();
  });
});
