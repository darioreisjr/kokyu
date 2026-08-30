import { z } from 'zod';

const perceivedStatusValues = ['onTrack', 'attention', 'atRisk'] as const;

/** Backs both the quick and the full check-in — every field beyond `perceivedStatus` is optional, never a mandatory gate. */
export const checkInSchema = z.object({
  perceivedStatus: z.enum(perceivedStatusValues, { message: 'Selecione como está a meta' }),
  confidence: z.number().min(1).max(5).optional(),
  whatMovedForward: z.string().optional(),
  whatIsBlocking: z.string().optional(),
  nextStep: z.string().optional(),
  note: z.string().optional(),
});

export type CheckInFormValues = z.infer<typeof checkInSchema>;

export const checkInFormDefaultValues: CheckInFormValues = {
  perceivedStatus: 'onTrack',
  whatMovedForward: '',
  whatIsBlocking: '',
  nextStep: '',
  note: '',
};
