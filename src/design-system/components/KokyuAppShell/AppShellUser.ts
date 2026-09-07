/**
 * Display-ready identity for the shell's chrome (`Sidebar`,
 * `NavigationDrawer`, `MobileTopBar`) — pre-computed by the caller
 * (`AuthenticatedShell`, from `CurrentUserContext`) rather than derived
 * in the design system, which must not depend on `features/profile`'s
 * domain logic (name-splitting, initials).
 */
export interface AppShellUser {
  /** Full display name, e.g. `"Dario Reis"`. */
  name: string;
  /** Avatar fallback when there's no photo, e.g. `"DR"`. */
  initials: string;
  /** `null` renders the initials fallback. */
  avatarUrl: string | null;
}
