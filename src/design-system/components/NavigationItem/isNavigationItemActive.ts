/**
 * Whether `href` should render as the active navigation item for the
 * current `pathname`. Sub-routes stay active for their parent (e.g.
 * `/app/treinamento/novo` keeps "Treinamento" active) via a prefix
 * match — except `/app` itself, which would otherwise prefix-match
 * every other authenticated route and stay active everywhere.
 */
export function isNavigationItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === '/app') return false;
  return pathname.startsWith(`${href}/`);
}
