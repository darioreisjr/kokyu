/** Sizing for the profile avatar across breakpoints — desktop reads larger and more prominent. */
export const profileTokens = {
  avatar: {
    size: {
      /** Compact chrome — `MobileTopBar`, `Sidebar`'s identity row. */
      xs: '32px',
      sm: '64px',
      md: '96px',
      lg: '128px',
    },
  },
} as const;
