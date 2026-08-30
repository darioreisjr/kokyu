import type { Components, Theme } from '@mui/material/styles';

import { borderRadius } from '../tokens/primitives/borders';
import { duration, easing } from '../tokens/primitives/motion';
import { opacity } from '../tokens/primitives/opacity';
import { buttonTokens, cardTokens, inputTokens } from '../tokens/component';
import { themePalette } from './useThemePalette';

const focusTransition = `box-shadow ${duration.fast} ${easing.standard}, border-color ${duration.fast} ${easing.standard}`;

export const kokyuComponents: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      body: {
        minHeight: '100dvh',
      },
      // Settings → Acessibilidade → "Sublinhar links"/"Foco reforçado".
      // Both are gated by a `data-*` attribute `PreferencesProvider`
      // sets on <html> (same mechanism as "Tamanho do texto"), and
      // both need `!important`: they're meant to override every
      // component-level focus/underline rule above — including ones
      // more specific than a bare element selector — not lose to them.
      'html[data-kokyu-underline-links="true"] a': {
        textDecoration: 'underline !important',
      },
      'html[data-kokyu-enhanced-focus="true"] *:focus-visible': {
        outline: `3px solid ${themePalette(theme).kokyu.border.focus} !important`,
        outlineOffset: '3px !important',
      },
    }),
  },
  MuiBackdrop: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: `color-mix(in srgb, ${themePalette(theme).kokyu.background.default} ${opacity.overlay * 100}%, transparent)`,
      }),
    },
  },
  MuiTypography: {
    defaultProps: {
      variantMapping: {
        displayLarge: 'h1',
        displayMedium: 'h1',
        displaySmall: 'h2',
        labelLarge: 'span',
        labelMedium: 'span',
        labelSmall: 'span',
      },
    },
  },
  MuiButtonBase: {
    defaultProps: {
      disableRipple: false,
    },
  },
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        height: buttonTokens.height.md,
        borderRadius: buttonTokens.radius,
        fontWeight: buttonTokens.fontWeight,
        paddingInline: buttonTokens.paddingX.md,
        textTransform: 'none',
        transition: `background-color ${duration.fast} ${easing.standard}, box-shadow ${duration.fast} ${easing.standard}, transform ${duration.fast} ${easing.standard}, border-color ${duration.fast} ${easing.standard}`,
        '&:active': {
          transform: 'scale(0.98)',
        },
        '&:focus-visible': {
          outline: `2px solid ${themePalette(theme).kokyu.border.focus}`,
          outlineOffset: '2px',
        },
      }),
      sizeSmall: {
        height: buttonTokens.height.sm,
        paddingInline: buttonTokens.paddingX.sm,
      },
      sizeLarge: {
        height: buttonTokens.height.lg,
        paddingInline: buttonTokens.paddingX.lg,
      },
      contained: ({ theme }) => ({
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
          backgroundColor: themePalette(theme).primary.light,
        },
        '&:active': {
          backgroundColor: themePalette(theme).primary.dark,
        },
        '&.Mui-disabled': {
          backgroundColor: themePalette(theme).kokyu.action.disabledBackground,
          color: themePalette(theme).kokyu.action.disabled,
        },
      }),
      outlined: ({ theme }) => ({
        borderColor: themePalette(theme).kokyu.border.default,
        '&:hover': {
          borderColor: themePalette(theme).kokyu.border.strong,
          backgroundColor: themePalette(theme).kokyu.background.subtle,
        },
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        // `minHeight`, not `height` — a fixed height is exactly what a
        // single-line field wants (and behaves identically to one,
        // since single-line content never exceeds it), but it breaks
        // `multiline` fields: the root gets clipped to 52px while a
        // multi-row textarea grows taller inside it regardless, and
        // the floating label (positioned relative to the root) ends
        // up overlapping the now-taller content instead of clearing it.
        minHeight: inputTokens.height,
        borderRadius: inputTokens.radius,
        backgroundColor: themePalette(theme).kokyu.background.subtle,
        transition: focusTransition,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: themePalette(theme).kokyu.border.default,
          borderWidth: inputTokens.border,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: themePalette(theme).kokyu.border.strong,
        },
        '&.Mui-focused': {
          boxShadow: `0 0 0 ${inputTokens.focusRingWidth} color-mix(in srgb, ${themePalette(theme).kokyu.border.focus} 35%, transparent)`,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: themePalette(theme).kokyu.border.focus,
          borderWidth: inputTokens.border,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: themePalette(theme).kokyu.feedback.error,
        },
      }),
      input: {
        paddingBlock: '14px',
      },
    },
  },
  MuiFormHelperText: {
    styleOverrides: {
      root: {
        marginInline: 0,
        marginTop: '6px',
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: themePalette(theme).kokyu.border.strong,
        '&:hover': {
          backgroundColor: 'transparent',
          color: themePalette(theme).kokyu.text.primary,
        },
        '&.Mui-checked': {
          color: themePalette(theme).primary.main,
        },
        '&:focus-visible': {
          outline: `2px solid ${themePalette(theme).kokyu.border.focus}`,
          outlineOffset: '2px',
          borderRadius: borderRadius.xs,
        },
      }),
    },
  },
  MuiLink: {
    defaultProps: {
      underline: 'hover',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        color: themePalette(theme).primary.main,
        fontWeight: 600,
        '&:focus-visible': {
          outline: `2px solid ${themePalette(theme).kokyu.border.focus}`,
          outlineOffset: '2px',
        },
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: cardTokens.radius,
        padding: cardTokens.padding,
        boxShadow: cardTokens.shadow,
        backgroundColor: themePalette(theme).kokyu.surface.primary,
      }),
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: themePalette(theme).kokyu.border.subtle,
      }),
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        transition: `background-color ${duration.fast} ${easing.standard}, color ${duration.fast} ${easing.standard}`,
        '&:focus-visible': {
          outline: `2px solid ${themePalette(theme).kokyu.border.focus}`,
          outlineOffset: '2px',
        },
      }),
    },
  },
};
