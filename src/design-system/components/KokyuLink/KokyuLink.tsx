import MuiLink, { type LinkProps as MuiLinkProps } from '@mui/material/Link';
import NextLink from 'next/link';

export interface KokyuLinkProps extends Omit<MuiLinkProps, 'href' | 'component'> {
  href: string;
  /**
   * Passed through to `next/link`. Defaults to `true` (Next's own
   * default); set `false` for a route that doesn't exist yet, so the
   * browser doesn't prefetch it and log a 404.
   */
  prefetch?: boolean;
}

/** Styled `next/link` — use for every in-app or external navigational link. */
export function KokyuLink({ href, prefetch, ...props }: KokyuLinkProps) {
  return <MuiLink component={NextLink} href={href} prefetch={prefetch} {...props} />;
}
