import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { KokyuAuthCard } from './KokyuAuthCard';

const meta = {
  title: 'Kokyu Components/KokyuAuthCard',
  component: KokyuAuthCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    title: 'Bem-vindo de volta',
    description: 'Respire fundo e continue de onde parou.',
  },
} satisfies Meta<typeof KokyuAuthCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Typography variant="body2">Conteúdo do formulário aqui.</Typography>,
  },
};

export const WithFooter: Story = {
  args: {
    children: <Typography variant="body2">Conteúdo do formulário aqui.</Typography>,
    footer: (
      <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Ainda não tem uma conta?
        </Typography>
        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Criar conta
        </Typography>
      </Stack>
    ),
  },
};
