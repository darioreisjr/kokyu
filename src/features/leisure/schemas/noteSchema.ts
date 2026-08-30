import { z } from 'zod';

const noteTypeValues = ['text', 'checklist', 'link', 'idea'] as const;

export const noteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  type: z.enum(noteTypeValues),
  linkUrl: z.string().optional(),
  tags: z.array(z.string()),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

export const noteFormDefaultValues: NoteFormValues = {
  title: '',
  content: '',
  type: 'text',
  linkUrl: '',
  tags: [],
};
