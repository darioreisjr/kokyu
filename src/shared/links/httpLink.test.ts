import { describe, expect, it } from 'vitest';

import { extractPastedUrl, isHttpUrl, optionalHttpLinkSchema } from './httpLink';

describe('extractPastedUrl', () => {
  it('pulls the URL out of a Markdown link', () => {
    expect(extractPastedUrl('[Astrobin](https://www.astrobin.com)')).toBe(
      'https://www.astrobin.com',
    );
  });

  it('pulls the URL out of a partially copied Markdown link (the reported bug)', () => {
    expect(extractPastedUrl('https://www.astrobin.com](https://www.astrobin.com)')).toBe(
      'https://www.astrobin.com',
    );
  });

  it('unwraps an angle-bracketed URL and trims whitespace', () => {
    expect(extractPastedUrl('  <https://nextjs.org/docs>  ')).toBe('https://nextjs.org/docs');
    expect(extractPastedUrl('  https://nextjs.org/docs  ')).toBe('https://nextjs.org/docs');
  });

  it('leaves anything else as-is for the validator to judge', () => {
    expect(extractPastedUrl('astrobin.com')).toBe('astrobin.com');
    expect(extractPastedUrl('[sem link](texto)')).toBe('[sem link](texto)');
  });
});

describe('isHttpUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isHttpUrl('https://www.astrobin.com')).toBe(true);
    expect(isHttpUrl('http://example.com/a?b=1#c')).toBe(true);
  });

  it('rejects other protocols, bare domains, garbage and over-long URLs', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('ftp://example.com')).toBe(false);
    expect(isHttpUrl('astrobin.com')).toBe(false);
    expect(isHttpUrl('https://www.astrobin.com](http')).toBe(false);
    expect(isHttpUrl(`https://example.com/${'a'.repeat(2048)}`)).toBe(false);
  });
});

describe('optionalHttpLinkSchema', () => {
  it('allows an empty value', () => {
    expect(optionalHttpLinkSchema.parse('')).toBe('');
  });

  it('outputs the cleaned URL for a pasted Markdown link', () => {
    expect(
      optionalHttpLinkSchema.parse('https://www.astrobin.com](https://www.astrobin.com)'),
    ).toBe('https://www.astrobin.com');
  });

  it('fails with a pt-BR message for an invalid link', () => {
    const result = optionalHttpLinkSchema.safeParse('https://www.astrobin.com](http');
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Informe um link válido, começando com https://');
  });
});
