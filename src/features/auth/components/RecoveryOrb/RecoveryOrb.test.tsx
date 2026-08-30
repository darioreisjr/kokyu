import { describe, expect, it } from 'vitest';

import { hinokami } from '@/design-system/tokens/primitives/colors';

import { render } from '../../../../../test/test-utils';
import { RecoveryOrb } from './RecoveryOrb';

describe('RecoveryOrb', () => {
  it('renders the decorative orb using the given color family', () => {
    const { container } = render(<RecoveryOrb color={hinokami} />);
    const orb = container.firstChild as HTMLElement;

    expect(orb).toBeInTheDocument();
    // jsdom normalizes the hex literal to rgb() — check the gradient shape instead of the exact color string.
    expect(orb.style.background).toContain('radial-gradient');
    expect(orb.style.background).toContain('color-mix');
  });

  it('does not crash when reducedMotion is forced on', () => {
    const { container } = render(<RecoveryOrb color={hinokami} reducedMotion />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
