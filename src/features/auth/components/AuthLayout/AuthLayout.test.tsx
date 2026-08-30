import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { AuthLayout } from './AuthLayout';

describe('AuthLayout', () => {
  it('renders both the visual and form slots', () => {
    render(<AuthLayout visual={<div>Visual side</div>} form={<div>Form side</div>} />);

    expect(screen.getByText('Visual side')).toBeInTheDocument();
    expect(screen.getByText('Form side')).toBeInTheDocument();
  });

  it('keeps the visual slot before the form slot in the DOM regardless of `reversed`', () => {
    // `reversed` only flips the CSS direction (`row-reverse`), so both
    // `AuthVisualPanel` and `AuthFormPanel` stay identical between the
    // two screens — nothing about their own markup needs to change.
    const { container } = render(
      <AuthLayout reversed visual={<div>Visual side</div>} form={<div>Form side</div>} />,
    );

    const text = container.textContent ?? '';
    expect(text.indexOf('Visual side')).toBeLessThan(text.indexOf('Form side'));
  });
});
