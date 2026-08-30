// Theme-callback `sx` can't cross a Server → Client boundary as a
// prop, so this needs to be a Client Component even without state.
'use client';

import Divider, { type DividerProps } from '@mui/material/Divider';

import { themePalette } from '../../theme/useThemePalette';

export type KokyuDividerProps = DividerProps;

/** Divider that can optionally carry a short label, e.g. "ou continue com". */
export function KokyuDivider(props: KokyuDividerProps) {
  return (
    <Divider
      {...props}
      sx={[
        (theme) => ({
          color: themePalette(theme).kokyu.text.secondary,
          fontSize: '0.8125rem',
          '&::before, &::after': {
            borderColor: themePalette(theme).kokyu.border.subtle,
          },
        }),
        ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : []),
      ]}
    />
  );
}
