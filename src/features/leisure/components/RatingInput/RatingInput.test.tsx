import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { RatingInput } from './RatingInput';

describe('RatingInput', () => {
  it('exposes an accessible name per star', () => {
    render(<RatingInput value={0} onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: '4 de 5 estrelas' })).toBeInTheDocument();
  });

  it('reflects the current value', () => {
    render(<RatingInput value={4} onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: '4 de 5 estrelas' })).toBeChecked();
  });

  it('calls onChange with the value of the picked radio', () => {
    const onChange = vi.fn();
    render(<RatingInput value={0} onChange={onChange} />);

    const star = screen.getByRole('radio', { name: '3 de 5 estrelas' });
    fireEvent.click(star);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('is not interactive when readOnly', () => {
    render(<RatingInput value={3} readOnly />);
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });
});
