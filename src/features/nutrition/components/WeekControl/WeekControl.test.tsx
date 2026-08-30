import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { getWeekStart } from '../../utils/dateHelpers';
import { WeekControl } from './WeekControl';

describe('WeekControl', () => {
  it('shows the week range heading', () => {
    render(<WeekControl weekStart={new Date(2026, 7, 24)} weekStartsOn={1} onChange={vi.fn()} />);
    expect(screen.getByRole('heading', { name: '24 - 30 de agosto' })).toBeInTheDocument();
  });

  it('moves to the previous/next week', () => {
    const onChange = vi.fn();
    render(<WeekControl weekStart={new Date(2026, 7, 24)} weekStartsOn={1} onChange={onChange} />);

    screen.getByRole('button', { name: 'Próxima semana' }).click();
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 7, 31));

    screen.getByRole('button', { name: 'Semana anterior' }).click();
    expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 7, 17));
  });

  it('jumps back to the current week', () => {
    const onChange = vi.fn();
    render(<WeekControl weekStart={new Date(2020, 0, 1)} weekStartsOn={1} onChange={onChange} />);
    screen.getByRole('button', { name: 'Hoje' }).click();
    expect(onChange).toHaveBeenCalledWith(getWeekStart(new Date(), 1));
  });
});
