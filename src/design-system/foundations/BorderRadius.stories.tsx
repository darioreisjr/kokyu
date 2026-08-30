import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { borderRadius } from '../tokens/primitives/borders';

const meta = {
  title: 'Kokyu Foundations/Border Radius',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Stack spacing={3} sx={{ padding: 3 }}>
      <Typography variant="h1">Border radius scale</Typography>
      <Stack direction="row" useFlexGap sx={{ gap: 3, flexWrap: 'wrap' }}>
        {(Object.entries(borderRadius) as [string, string][]).map(([key, value]) => (
          <Stack key={key} spacing={1} sx={{ alignItems: 'center', width: 120 }}>
            <Box
              sx={{
                height: 88,
                width: 88,
                backgroundColor: 'primary.main',
                borderRadius: value,
              }}
            />
            <Typography variant="labelMedium">{key}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
};
