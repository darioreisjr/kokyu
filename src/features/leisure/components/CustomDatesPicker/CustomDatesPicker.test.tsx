import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '../../../../../test/test-utils';
import { CustomDatesPicker } from './CustomDatesPicker';

const today = new Date();
const todayKey = today.toISOString().slice(0, 10);
const todayLabel = String(today.getDate());

describe('CustomDatesPicker', () => {
  it('toggles a date into the selection when its calendar cell is clicked', () => {
    const onChange = vi.fn();
    render(<CustomDatesPicker value={[]} onChange={onChange} />);

    fireEvent.click(screen.getByRole('gridcell', { name: todayLabel }));

    expect(onChange).toHaveBeenCalledWith([todayKey]);
  });

  it('toggles an already-selected date back out of the selection', () => {
    const onChange = vi.fn();
    render(<CustomDatesPicker value={[todayKey]} onChange={onChange} />);

    fireEvent.click(screen.getByRole('gridcell', { name: todayLabel }));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('renders no chips when nothing is selected', () => {
    render(<CustomDatesPicker value={[]} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /de/ })).not.toBeInTheDocument();
  });

  it('renders a removable chip per selected date', () => {
    render(<CustomDatesPicker value={['2026-06-20', '2026-06-05']} onChange={vi.fn()} />);

    expect(screen.getByText('20 de jun')).toBeInTheDocument();
    expect(screen.getByText('5 de jun')).toBeInTheDocument();
  });

  it('removes a date when its chip is deleted', () => {
    const onChange = vi.fn();
    render(<CustomDatesPicker value={['2026-06-05', '2026-06-20']} onChange={onChange} />);

    const chip = screen.getByText('5 de jun').closest('.MuiChip-root') as HTMLElement;
    fireEvent.click(chip.querySelector('svg') as SVGElement);

    expect(onChange).toHaveBeenCalledWith(['2026-06-20']);
  });
});
