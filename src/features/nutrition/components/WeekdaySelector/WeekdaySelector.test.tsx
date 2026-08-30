import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { getWeekDays, getWeekStart, toDateKey } from '../../utils/dateHelpers';
import { WeekdaySelector } from './WeekdaySelector';

describe('WeekdaySelector', () => {
  const weekDays = getWeekDays(getWeekStart(new Date(2026, 7, 24), 1), 1);

  it('renders one toggle per day of the week', () => {
    render(<WeekdaySelector weekDays={weekDays} selectedDate={weekDays[0]!} onSelect={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(7);
  });

  it('marks the selected day pressed', () => {
    render(<WeekdaySelector weekDays={weekDays} selectedDate={weekDays[2]!} onSelect={vi.fn()} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[2]).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with the matching day when clicked', () => {
    const onSelect = vi.fn();
    render(<WeekdaySelector weekDays={weekDays} selectedDate={weekDays[0]!} onSelect={onSelect} />);
    screen.getAllByRole('button')[3]!.click();
    expect(onSelect).toHaveBeenCalledWith(weekDays[3]);
    expect(toDateKey(onSelect.mock.calls[0]![0])).toBe(toDateKey(weekDays[3]!));
  });
});
