import { act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test/test-utils';
import { ApiError } from './errors';
import { UnhandledApiErrorListener } from './UnhandledApiErrorListener';

function dispatchRejection(reason: unknown): PromiseRejectionEvent {
  // jsdom has no PromiseRejectionEvent constructor; the listener only reads `reason`.
  const event = new Event('unhandledrejection', { cancelable: true }) as PromiseRejectionEvent;
  Object.defineProperty(event, 'reason', { value: reason });
  act(() => {
    window.dispatchEvent(event);
  });
  return event;
}

describe('UnhandledApiErrorListener', () => {
  it('shows a pt-BR message for an API error nobody handled', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<UnhandledApiErrorListener />);

    const event = dispatchRejection(
      new ApiError(400, { status: 400, code: 'VALIDATION_ERROR', detail: 'x: Invalid' }, 'x'),
    );

    expect(
      await screen.findByText('Alguns dados são inválidos. Revise e tente novamente.'),
    ).toBeInTheDocument();
    expect(event.defaultPrevented).toBe(true);
  });

  it('leaves non-API errors alone so programming errors stay visible', () => {
    render(<UnhandledApiErrorListener />);

    const event = dispatchRejection(new TypeError('x is undefined'));

    expect(event.defaultPrevented).toBe(false);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
