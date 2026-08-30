import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { DateSelector } from './DateSelector';

describe('DateSelector', () => {
  it('shows the formatted heading for the given date', () => {
    render(<DateSelector date={new Date(2026, 7, 29)} onChange={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Sábado, 29 de agosto' })).toBeInTheDocument();
  });

  it('moves one day back/forward', () => {
    const onChange = vi.fn();
    render(<DateSelector date={new Date(2026, 7, 29)} onChange={onChange} />);

    screen.getByRole('button', { name: 'Próximo dia' }).click();
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 7, 30));

    screen.getByRole('button', { name: 'Dia anterior' }).click();
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 7, 28));
  });

  it('jumps to today', () => {
    const onChange = vi.fn();
    render(<DateSelector date={new Date(2000, 0, 1)} onChange={onChange} />);
    screen.getByRole('button', { name: 'Hoje' }).click();
    expect(onChange).toHaveBeenCalled();
    const calledWith = onChange.mock.calls[0]![0] as Date;
    expect(calledWith.getFullYear()).toBe(new Date().getFullYear());
  });
});
