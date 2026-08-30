import Stack from '@mui/material/Stack';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { typeScale } from '../tokens/primitives/typography';

const sample = 'Kokyu — respiração, disciplina e equilíbrio.';

const variantOrder: TypographyProps['variant'][] = [
  'displayLarge',
  'displayMedium',
  'displaySmall',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'body1',
  'body2',
  'labelLarge',
  'labelMedium',
  'labelSmall',
  'caption',
];

const tokenByVariant: Partial<Record<string, keyof typeof typeScale>> = {
  displayLarge: 'displayLarge',
  displayMedium: 'displayMedium',
  displaySmall: 'displaySmall',
  h1: 'heading1',
  h2: 'heading2',
  h3: 'heading3',
  h4: 'heading4',
  h5: 'heading5',
  h6: 'heading6',
  subtitle1: 'bodyLarge',
  body1: 'bodyMedium',
  body2: 'bodySmall',
  labelLarge: 'labelLarge',
  labelMedium: 'labelMedium',
  labelSmall: 'labelSmall',
  caption: 'caption',
};

const meta = {
  title: 'Kokyu Foundations/Typography',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Stack spacing={3} sx={{ padding: 3, maxWidth: 760 }}>
      <Typography variant="h1">Type scale</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Every size uses <code>clamp()</code> and scales fluidly between mobile and desktop — resize
        this panel to see it respond.
      </Typography>
      {variantOrder.map((variant) => {
        if (!variant) return null;
        const tokenKey = tokenByVariant[variant];
        const token = tokenKey ? typeScale[tokenKey] : undefined;
        return (
          <Stack
            key={variant}
            spacing={0.5}
            sx={{ borderBottom: '1px solid', borderColor: 'divider', paddingBottom: 2 }}
          >
            <Typography variant={variant}>{sample}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {variant}
              {token
                ? ` — ${token.fontSize}, weight ${token.fontWeight}, line-height ${token.lineHeight}`
                : ''}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  ),
};
