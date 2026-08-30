import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import type { Note } from '../../types/note.types';
import { NoteCard } from './NoteCard';

const textNote: Note = {
  id: 'note-1',
  content: 'Prestar atenção na fotografia e nos planos abertos.',
  type: 'text',
  tags: ['cinema'],
  pinned: false,
  archived: false,
  createdAt: '2026-08-20T10:00:00.000Z',
  updatedAt: '2026-08-20T10:00:00.000Z',
};

const checklistNote: Note = {
  id: 'note-2',
  title: 'Coisas para levar para a praia',
  content: '',
  type: 'checklist',
  checklistItems: [
    { id: 'c-1', text: 'Protetor solar', checked: true },
    { id: 'c-2', text: 'Cadeira', checked: false },
  ],
  tags: ['praia'],
  pinned: false,
  archived: false,
  createdAt: '2026-08-18T10:00:00.000Z',
  updatedAt: '2026-08-18T10:00:00.000Z',
};

const meta = {
  title: 'Kokyu Tempo Livre/NoteCard',
  component: NoteCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box sx={{ width: 320 }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    note: textNote,
    onEdit: fn(),
    onTogglePin: fn(),
    onArchive: fn(),
    onDelete: fn(),
    onToggleChecklistItem: fn(),
  },
} satisfies Meta<typeof NoteCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const Checklist: Story = {
  args: { note: checklistNote },
};

export const Pinned: Story = {
  args: { note: { ...textNote, pinned: true } },
};

export const Archived: Story = {
  args: { note: { ...textNote, archived: true } },
};
