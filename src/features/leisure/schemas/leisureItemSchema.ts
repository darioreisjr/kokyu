import { z } from 'zod';

const leisureItemTypeValues = [
  'movie',
  'tvShow',
  'book',
  'audiobook',
  'game',
  'podcast',
  'music',
  'video',
  'article',
  'website',
  'place',
  'event',
  'activity',
  'hobby',
  'custom',
] as const;

const durationTypeValues = ['fixed', 'flexible', 'unknown'] as const;
const priorityValues = ['low', 'medium', 'high'] as const;

/**
 * One flat schema for every type, rather than a Zod discriminated
 * union per type — `LeisureItemForm` only renders the fields relevant
 * to the chosen `type`, and only those are ever read back out at
 * submit time. Keeps the form itself simple while the stored
 * `LeisureItem` stays a proper discriminated union (built by the page
 * component, not by this schema).
 */
export const leisureItemSchema = z.object({
  title: z.string().min(1, 'Informe um título'),
  type: z.enum(leisureItemTypeValues, { message: 'Selecione um tipo' }),
  description: z.string().optional(),
  status: z.string().min(1, 'Selecione um status'),
  tags: z.array(z.string()),
  priority: z.enum(priorityValues).optional(),
  durationType: z.enum(durationTypeValues),
  estimatedDuration: z.number().min(0).optional(),
  minimumUsefulDuration: z.number().min(0).optional(),
  sourceUrl: z.string().optional(),
  recommendedBy: z.string().optional(),
  // Type-specific, all optional — only the ones for the chosen `type` are shown/used.
  author: z.string().optional(),
  pages: z.number().min(0).optional(),
  platform: z.string().optional(),
  category: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export type LeisureItemFormValues = z.infer<typeof leisureItemSchema>;

export const leisureItemFormDefaultValues: LeisureItemFormValues = {
  title: '',
  type: 'movie',
  description: '',
  status: 'backlog',
  tags: [],
  durationType: 'unknown',
  sourceUrl: '',
  recommendedBy: '',
  author: '',
  platform: '',
  category: '',
  address: '',
  city: '',
};
