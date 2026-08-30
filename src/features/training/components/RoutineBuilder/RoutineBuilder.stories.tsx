import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { routineFormDefaultValues } from '../../schemas/routineSchema';
import { mockRoutinePushA } from '../../mocks/routines.mock';
import { mapRoutineToFormValues } from '../../utils/routineFormMapper';
import { RoutineBuilder } from './RoutineBuilder';

const meta = {
  title: 'Kokyu Treinamento/RoutineBuilder',
  component: RoutineBuilder,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    onSubmit: async () => {},
    submitLabel: 'Criar treino',
  },
} satisfies Meta<typeof RoutineBuilder>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { defaultValues: routineFormDefaultValues },
};

export const Filled: Story = {
  args: { defaultValues: mapRoutineToFormValues(mockRoutinePushA) },
};

/** Push A's own last two exercises (Elevação lateral + Tríceps no pulley) already share a `groupId` — this is a superset in the Builder. */
export const Superset: Story = {
  args: { defaultValues: mapRoutineToFormValues(mockRoutinePushA) },
};

/** RHF only surfaces field errors after a submit attempt — click "Criar treino" with the name and exercise list empty to see them. */
export const ValidationErrors: Story = {
  args: { defaultValues: routineFormDefaultValues },
};
