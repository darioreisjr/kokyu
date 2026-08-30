import { z } from 'zod';

export const milestoneSchema = z.object({
  title: z.string().min(1, 'Informe um título'),
  description: z.string().optional(),
  targetDate: z.string().optional(),
});

export type MilestoneFormValues = z.infer<typeof milestoneSchema>;

export const milestoneFormDefaultValues: MilestoneFormValues = {
  title: '',
  description: '',
  targetDate: '',
};
