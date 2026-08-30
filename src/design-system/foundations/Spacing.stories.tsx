import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { spacing } from '../tokens/primitives/spacing';

const meta = {
  title: 'Kokyu Foundations/Spacing',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Stack spacing={3} sx={{ padding: 3, maxWidth: 640 }}>
      <Typography variant="h1">Spacing scale</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Base unit of 4px. Every gap, padding and margin in Kokyu resolves to one of these tokens.
      </Typography>
      <Stack spacing={1.5}>
        {(Object.entries(spacing) as [string, string][]).map(([key, value]) => (
          <Stack key={key} direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="labelMedium" sx={{ width: 64 }}>
              {key}
            </Typography>
            <Box
              sx={{
                height: 16,
                width: value,
                backgroundColor: 'primary.main',
                borderRadius: 1,
              }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
};
