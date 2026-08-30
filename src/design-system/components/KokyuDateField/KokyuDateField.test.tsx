import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { KokyuDateField } from './KokyuDateField';

describe('KokyuDateField', () => {
  it('renders the label', () => {
    render(<KokyuDateField label="Data de nascimento" value={null} onChange={() => undefined} />);
    expect(screen.getByRole('group', { name: 'Data de nascimento' })).toBeInTheDocument();
  });

  it('shows the helper text it is given', () => {
    render(
      <KokyuDateField
        label="Data de nascimento"
        value={null}
        onChange={() => undefined}
        error
        helperText="Informe uma data de nascimento válida"
      />,
    );
    expect(screen.getByText('Informe uma data de nascimento válida')).toBeInTheDocument();
  });

  it('displays a controlled value in dd/MM/yyyy, regardless of browser locale', () => {
    // The whole reason this wraps MUI X instead of a native
    // `<input type="date">`: that format is guaranteed, not
    // locale-dependent.
    render(
      <KokyuDateField
        label="Data de nascimento"
        value={new Date(2008, 7, 28)}
        onChange={() => undefined}
      />,
    );
    expect(screen.getByDisplayValue('28/08/2008')).toBeInTheDocument();
  });

  it('calls onChange with the pasted date', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<KokyuDateField label="Data de nascimento" value={null} onChange={onChange} />);

    const group = screen.getByRole('group', { name: 'Data de nascimento' });
    await user.click(group.querySelector('[aria-label="Day"]') as HTMLElement);
    await user.paste('28/08/2008');

    const lastCall = onChange.mock.calls.at(-1)?.[0] as Date;
    expect(lastCall.getFullYear()).toBe(2008);
    expect(lastCall.getMonth()).toBe(7);
    expect(lastCall.getDate()).toBe(28);
  });
});
