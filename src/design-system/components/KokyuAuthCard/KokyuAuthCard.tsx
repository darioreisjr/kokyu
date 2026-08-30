// Theme-callback `sx` (`(theme) => ...`) can't cross a Server → Client
// boundary as a prop, so any component that reads the theme this way
// must render on the client, even without state of its own.
'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { cardTokens } from '../../tokens/component';
import { content } from '../../tokens/primitives/containers';
import { themePalette } from '../../theme/useThemePalette';

export interface KokyuAuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** @default content.loginMaxWidth — create-account passes a wider one for its two-column rows. */
  maxWidth?: string;
}

/**
 * Layout shell for authentication screens: title, description, form,
 * footer. The title carries `id="auth-heading"` — `AuthTransition`
 * focuses it after a route change so focus never lands on an element
 * that just left the screen; `tabIndex={-1}` makes a heading
 * programmatically focusable without adding it to the tab order.
 */
export function KokyuAuthCard({
  title,
  description,
  children,
  footer,
  maxWidth = content.loginMaxWidth,
}: KokyuAuthCardProps) {
  return (
    <Paper
      component="section"
      elevation={0}
      sx={(theme) => ({
        width: '100%',
        maxWidth,
        padding: { xs: 4, sm: cardTokens.padding },
        borderRadius: cardTokens.radius,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
      })}
    >
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography
            id="auth-heading"
            tabIndex={-1}
            variant="h1"
            component="h1"
            sx={(theme) => ({
              borderRadius: 1,
              '&:focus-visible': {
                outline: `2px solid ${themePalette(theme).kokyu.border.focus}`,
                outlineOffset: 4,
              },
            })}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              {description}
            </Typography>
          ) : null}
        </Stack>
        {children}
        {footer}
      </Stack>
    </Paper>
  );
}
