import { describe, expect, it } from 'vitest';

import { detectDeviceLabel } from './deviceInfo';

describe('detectDeviceLabel', () => {
  it('detects Chrome on Windows', () => {
    expect(
      detectDeviceLabel(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      ),
    ).toBe('Chrome em Windows');
  });

  it('detects Firefox on macOS', () => {
    expect(
      detectDeviceLabel(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
      ),
    ).toBe('Firefox em macOS');
  });

  it('detects Safari on iOS', () => {
    expect(
      detectDeviceLabel(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      ),
    ).toBe('Safari em iOS');
  });

  it('detects Chrome on Android', () => {
    expect(
      detectDeviceLabel(
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36',
      ),
    ).toBe('Chrome em Android');
  });

  it('falls back to an honest "unknown" label instead of guessing', () => {
    expect(detectDeviceLabel('some-unrecognized-agent-string')).toBe(
      'Navegador desconhecido em sistema desconhecido',
    );
  });
});
