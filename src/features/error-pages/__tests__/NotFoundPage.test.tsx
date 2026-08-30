import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { NotFoundPage } from '../components/NotFoundPage/NotFoundPage';
import { notFoundText } from '../constants/notFoundText';

describe('NotFoundPage', () => {
  it('renders the 404 code as the primary heading', () => {
    render(<NotFoundPage />);
    expect(screen.getByRole('heading', { level: 1, name: notFoundText.code })).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<NotFoundPage />);
    expect(screen.getByRole('heading', { level: 2, name: notFoundText.title })).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<NotFoundPage />);
    expect(screen.getByText(notFoundText.description)).toBeInTheDocument();
  });

  it('renders the secondary hint', () => {
    render(<NotFoundPage />);
    expect(screen.getByText(notFoundText.hint)).toBeInTheDocument();
  });

  it('renders a CTA linking back to the home route', () => {
    render(<NotFoundPage />);
    const cta = screen.getByRole('link', { name: notFoundText.cta });
    expect(cta).toHaveAttribute('href', '/');
  });

  it('marks every decorative scene SVG as hidden from assistive technology', () => {
    const { container } = render(<NotFoundPage />);
    const hiddenSvgs = container.querySelectorAll('svg[aria-hidden="true"]');
    // BreathingOrb + NichirinSlash + ParticleField.
    expect(hiddenSvgs.length).toBe(3);
  });
});
