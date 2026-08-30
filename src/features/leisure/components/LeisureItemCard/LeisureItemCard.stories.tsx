import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type {
  BookItem,
  GameItem,
  HobbyItem,
  MovieItem,
  PlaceItem,
} from '../../types/leisureItem.types';
import { LeisureItemCard } from './LeisureItemCard';

const movie: MovieItem = {
  id: 'movie-1',
  type: 'movie',
  title: 'Interestelar',
  status: 'backlog',
  tags: [],
  favorite: false,
  durationType: 'fixed',
  estimatedDuration: 169,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  movie: { runtime: 169, releaseYear: 2014 },
};

const book: BookItem = {
  id: 'book-1',
  type: 'book',
  title: 'O Hobbit',
  status: 'inProgress',
  tags: [],
  favorite: false,
  durationType: 'flexible',
  minimumUsefulDuration: 15,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  book: { author: 'J.R.R. Tolkien', pages: 310, currentPage: 190 },
};

const game: GameItem = {
  id: 'game-1',
  type: 'game',
  title: 'Aventura Encantada',
  status: 'backlog',
  tags: [],
  favorite: false,
  durationType: 'flexible',
  minimumUsefulDuration: 20,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  game: { platform: 'Console' },
};

const place: PlaceItem = {
  id: 'place-1',
  type: 'place',
  title: 'MASP',
  status: 'backlog',
  tags: [],
  favorite: false,
  durationType: 'fixed',
  estimatedDuration: 120,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  place: { category: 'museu', city: 'São Paulo' },
};

const hobby: HobbyItem = {
  id: 'hobby-1',
  type: 'hobby',
  title: 'Violão',
  status: 'inProgress',
  tags: [],
  favorite: false,
  durationType: 'flexible',
  minimumUsefulDuration: 30,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  hobby: {},
};

const meta = {
  title: 'Kokyu Tempo Livre/LeisureItemCard',
  component: LeisureItemCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box sx={{ width: 280 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof LeisureItemCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Movie: Story = { args: { item: movie } };
export const Book: Story = { args: { item: book } };
export const Game: Story = { args: { item: game } };
export const Place: Story = { args: { item: place } };
export const Hobby: Story = { args: { item: hobby } };
export const InProgress: Story = { args: { item: { ...movie, status: 'inProgress' } } };
export const Completed: Story = { args: { item: { ...movie, status: 'completed' } } };
export const Favorite: Story = { args: { item: { ...movie, favorite: true } } };
