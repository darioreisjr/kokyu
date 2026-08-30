import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { KokyuLogo } from './KokyuLogo';

describe('KokyuLogo', () => {
  it('renders the KOKYU wordmark by default', () => {
    render(<KokyuLogo />);
    expect(screen.getByText('KOKYU')).toBeInTheDocument();
  });

  it('omits the wordmark when markOnly is set', () => {
    render(<KokyuLogo markOnly />);
    expect(screen.queryByText('KOKYU')).not.toBeInTheDocument();
  });
});
