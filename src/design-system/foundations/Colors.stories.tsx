import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { colorPrimitives, type ColorFamily } from '../tokens/primitives/colors';

const familyMeaning: Record<ColorFamily, string> = {
  neutral: 'Texto, ícones e bordas neutras.',
  nichirin: 'Neutralidade, profundidade e superfícies — o fundo da aplicação.',
  hinokami: 'Ação principal, energia e progresso.',
  mizu: 'Calma, informação e concentração.',
  kaminari: 'Atenção e destaque — usado com moderação.',
  fuji: 'Identidade secundária e proteção.',
  tanjiro: 'Sucesso e evolução.',
  nezuko: 'Accent emocional opcional.',
  rengoku: 'Energia e intensidade — distinto do Hinokami.',
};

function ColorRow({ family }: { family: ColorFamily }) {
  const scale = colorPrimitives[family];
  const shades = Object.entries(scale) as [string, string][];

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline' }}>
        <Typography variant="h4" component="h3" sx={{ textTransform: 'capitalize' }}>
          {family}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {familyMeaning[family]}
        </Typography>
      </Stack>
      <Stack direction="row" useFlexGap sx={{ gap: 1, flexWrap: 'wrap' }}>
        {shades.map(([shade, hex]) => (
          <Stack key={shade} spacing={0.5} sx={{ width: 88 }}>
            <Box
              sx={{
                height: 56,
                borderRadius: 2,
                backgroundColor: hex,
                border: '1px solid rgba(128,128,128,0.25)',
              }}
            />
            <Typography variant="labelSmall">{shade}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {hex}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

const meta = {
  title: 'Kokyu Foundations/Colors',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Stack spacing={4} sx={{ padding: 3 }}>
      <Stack spacing={1}>
        <Typography variant="h1">Color primitives</Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 640 }}>
          Raw scales only — components never reference these directly. See <code>color.*</code>{' '}
          semantic tokens instead.
        </Typography>
      </Stack>
      {(Object.keys(colorPrimitives) as ColorFamily[]).map((family) => (
        <ColorRow key={family} family={family} />
      ))}
    </Stack>
  ),
};
