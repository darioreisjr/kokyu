import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import { mockIngredients } from '../../mocks/ingredients.mock';
import { recipeFormDefaultValues } from '../../schemas/recipeSchema';
import { RecipeForm } from './RecipeForm';

const meta = {
  title: 'Kokyu Nutrição/RecipeForm',
  component: RecipeForm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box sx={{ width: 640 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    ingredients: mockIngredients,
    submitLabel: 'Salvar receita',
    onSubmit: fn(),
  },
} satisfies Meta<typeof RecipeForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultValues: {
      ...recipeFormDefaultValues,
      name: 'Frango grelhado com arroz e feijão',
      ingredients: [{ ingredientName: 'Peito de frango', quantity: 600, unit: 'g' }],
      steps: [{ text: 'Tempere o frango com sal.' }],
    },
  },
};

export const ValidationErrors: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Salvar receita/ }));
  },
};
