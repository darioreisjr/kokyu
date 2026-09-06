import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render } from '../../../../../test/test-utils';

// The real Script component loads Cloudflare's script asynchronously and
// calls `onReady` once it has (after mount). This stand-in mirrors that
// timing with an effect instead of a real network request — calling
// `onReady` synchronously during render would update a sibling
// component's state mid-render, which React disallows. Named (not an
// inline arrow in the mock factory) so ESLint's react-hooks rule
// recognizes it as a component allowed to call `useEffect`.
function MockScript({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return null;
}

vi.mock('next/script', () => ({
  default: MockScript,
}));

describe('Turnstile', () => {
  it('renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is not configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', '');
    vi.resetModules();
    const { Turnstile } = await import('./Turnstile');

    const { container } = render(<Turnstile onVerify={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
    vi.unstubAllEnvs();
  });

  it('renders the widget container and forwards a verified token once configured', async () => {
    vi.stubEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'test-site-key');
    vi.resetModules();
    const { Turnstile } = await import('./Turnstile');

    const renderWidget = vi.fn((_container: HTMLElement, options: { callback: (t: string) => void }) => {
      options.callback('captcha-token-123');
      return 'widget-1';
    });
    window.turnstile = { render: renderWidget, remove: vi.fn() };

    const onVerify = vi.fn();
    const { container } = render(<Turnstile onVerify={onVerify} />);

    expect(renderWidget).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: 'test-site-key' }),
    );
    expect(onVerify).toHaveBeenCalledWith('captcha-token-123');
    expect(container.firstChild).not.toBeNull();

    delete window.turnstile;
    vi.unstubAllEnvs();
  });
});
