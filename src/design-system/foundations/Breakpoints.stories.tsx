import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { breakpoints } from '../tokens/primitives/breakpoints';
import { container } from '../tokens/primitives/containers';

const meta = {
  title: 'Kokyu Foundations/Breakpoints',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Stack spacing={4} sx={{ padding: 3, maxWidth: 640 }}>
      <Stack spacing={1}>
        <Typography variant="h1">Breakpoints</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Kokyu is mobile-first: styles apply from the smallest breakpoint up. Use the viewport
          toolbar above to preview any component at Mobile Small, Mobile, Mobile Large, Tablet,
          Laptop or Desktop.
        </Typography>
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Token</TableCell>
            <TableCell>Min width</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(Object.entries(breakpoints) as [string, number][]).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell>{key}</TableCell>
              <TableCell>{value}px</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Stack spacing={1}>
        <Typography variant="h2">Containers</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Token</TableCell>
              <TableCell>Max width</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(Object.entries(container) as [string, string][]).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell>container.{key}</TableCell>
                <TableCell>{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
    </Stack>
  ),
};
