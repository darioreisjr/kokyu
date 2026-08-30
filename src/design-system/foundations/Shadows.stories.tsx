import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { semanticShadow, shadow } from '../tokens/primitives/shadows';

const meta = {
  title: 'Kokyu Foundations/Shadows',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Stack spacing={5} sx={{ padding: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h1">Elevation scale</Typography>
        <Stack direction="row" useFlexGap sx={{ gap: 4, flexWrap: 'wrap' }}>
          {(Object.entries(shadow) as [string, string][])
            .filter(([key]) => key !== 'none')
            .map(([key, value]) => (
              <Stack key={key} spacing={1.5} sx={{ alignItems: 'center', width: 120 }}>
                <Box
                  sx={{
                    height: 72,
                    width: 96,
                    borderRadius: 3,
                    backgroundColor: 'background.paper',
                    boxShadow: value,
                  }}
                />
                <Typography variant="labelMedium">{key}</Typography>
              </Stack>
            ))}
        </Stack>
      </Stack>

      <Stack spacing={3}>
        <Typography variant="h2">Semantic shadows</Typography>
        <Stack direction="row" useFlexGap sx={{ gap: 4, flexWrap: 'wrap' }}>
          {(Object.entries(semanticShadow) as [string, string][]).map(([key, value]) => (
            <Stack key={key} spacing={1.5} sx={{ alignItems: 'center', width: 120 }}>
              <Box
                sx={{
                  height: 72,
                  width: 96,
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  boxShadow: value,
                }}
              />
              <Typography variant="labelMedium">shadow.{key}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  ),
};
