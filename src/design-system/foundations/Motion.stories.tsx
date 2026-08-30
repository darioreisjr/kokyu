import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { duration, easing } from '../tokens/primitives/motion';

const meta = {
  title: 'Kokyu Foundations/Motion',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Stack spacing={4} sx={{ padding: 3, maxWidth: 640 }}>
      <Stack spacing={1}>
        <Typography variant="h1">Motion</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Hover each bar to preview its duration and easing. Every animation in Kokyu respects{' '}
          <code>prefers-reduced-motion</code> — try enabling it in your OS to see these settle
          instantly instead.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h3">Duration</Typography>
        {(Object.entries(duration) as [string, string][]).map(([key, value]) => (
          <Stack key={key} spacing={0.5}>
            <Typography variant="labelMedium">
              duration.{key} — {value}
            </Typography>
            <Box
              sx={{
                height: 12,
                width: 0,
                borderRadius: 'full',
                backgroundColor: 'primary.main',
                transitionProperty: 'width',
                transitionDuration: value,
                transitionTimingFunction: easing.standard,
                '&:hover': { width: '100%' },
              }}
            />
          </Stack>
        ))}
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h3">Easing</Typography>
        {(Object.entries(easing) as [string, string][]).map(([key, value]) => (
          <Stack key={key} spacing={0.5}>
            <Typography variant="labelMedium">easing.{key}</Typography>
            <Box
              sx={{
                height: 12,
                width: 0,
                borderRadius: 'full',
                backgroundColor: 'secondary.main',
                transitionProperty: 'width',
                transitionDuration: duration.slow,
                transitionTimingFunction: value,
                '&:hover': { width: '100%' },
              }}
            />
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
};
