'use client';

import MuiAvatar, { type AvatarProps as MuiAvatarProps } from '@mui/material/Avatar';

import { profileTokens } from '../../tokens/component/profile';
import { fontWeight } from '../../tokens/primitives/typography';

export type KokyuAvatarSize = keyof typeof profileTokens.avatar.size;

export interface KokyuAvatarProps extends Omit<MuiAvatarProps, 'src' | 'children'> {
  /** `null`/`undefined` falls back to `initials`. */
  src?: string | null;
  /** Only applied when `src` is set — a text fallback isn't pretending to be an image. */
  alt?: string;
  initials?: string;
  /** @default 'md' */
  size?: KokyuAvatarSize;
}

/**
 * The one Avatar the app renders — image when available, initials
 * fallback otherwise, sized from `profileTokens.avatar.size` instead
 * of ad-hoc dimensions per usage. Not `ProfileAvatar`: this component
 * has no upload/crop/remove behavior, just consistent rendering: the
 * fallback tint reads from the theme's `secondary` slot (Fuji, via
 * `createKokyuPalette`), never a hardcoded color.
 */
export function KokyuAvatar({ src, alt, initials, size = 'md', sx, ...props }: KokyuAvatarProps) {
  const dimension = profileTokens.avatar.size[size];

  return (
    <MuiAvatar
      src={src ?? undefined}
      alt={src ? alt : undefined}
      sx={[
        (theme) => ({
          width: dimension,
          height: dimension,
          fontSize: `calc(${dimension} / 2.5)`,
          fontWeight: fontWeight.semibold,
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {!src ? initials : null}
    </MuiAvatar>
  );
}
