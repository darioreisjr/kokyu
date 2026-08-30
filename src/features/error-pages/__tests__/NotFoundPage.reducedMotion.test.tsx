import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { NotFoundPage } from '../components/NotFoundPage/NotFoundPage';
import { notFoundText } from '../constants/notFoundText';

describe('NotFoundPage — prefers-reduced-motion', () => {
  it('still renders every essential element when reduced motion is preferred', () => {
    render(<NotFoundPage reducedMotion />);

    expect(screen.getByRole('heading', { level: 1, name: notFoundText.code })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: notFoundText.title })).toBeInTheDocument();
    expect(screen.getByText(notFoundText.description)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: notFoundText.cta })).toBeInTheDocument();
  });
});
