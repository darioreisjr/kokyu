import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { KokyuTrendChart } from './KokyuTrendChart';

describe('KokyuTrendChart', () => {
  it('renders a textual caption describing the trend from the first to the last point', () => {
    render(
      <KokyuTrendChart
        ariaLabel="1RM estimado"
        points={[
          { label: 'jan', value: 80 },
          { label: 'fev', value: 92 },
        ]}
        valueFormatter={(value) => `${value}kg`}
      />,
    );
    expect(screen.getByText('1RM estimado: de 80kg em jan para 92kg em fev.')).toBeInTheDocument();
  });

  it('hides the SVG from assistive technology since the caption already carries the information', () => {
    const { container } = render(
      <KokyuTrendChart ariaLabel="Volume" points={[{ label: 'seg', value: 100 }]} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('shows a fallback message when there are no points', () => {
    render(<KokyuTrendChart ariaLabel="Volume" points={[]} />);
    expect(screen.getByText('Sem dados suficientes ainda.')).toBeInTheDocument();
  });
});
