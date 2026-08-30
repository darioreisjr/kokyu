import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { BookItem, MovieItem } from '../../types/leisureItem.types';
import { LeisureItemCard } from './LeisureItemCard';

const movie: MovieItem = {
  id: 'movie-1',
  type: 'movie',
  title: 'Interestelar',
  status: 'backlog',
  tags: [],
  favorite: true,
  durationType: 'fixed',
  estimatedDuration: 169,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  movie: {},
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
  book: { currentPage: 155, pages: 310 },
};

describe('LeisureItemCard', () => {
  it('links to the item detail route', () => {
    render(<LeisureItemCard item={movie} />);
    expect(screen.getByRole('link', { name: /Interestelar/ })).toHaveAttribute(
      'href',
      '/app/tempo-livre/item/movie-1',
    );
  });

  it('shows type, duration and status', () => {
    render(<LeisureItemCard item={movie} />);
    expect(screen.getByText('Filme · 2h49')).toBeInTheDocument();
    expect(screen.getByText('Para assistir')).toBeInTheDocument();
  });

  it('marks a favorite item', () => {
    render(<LeisureItemCard item={movie} />);
    expect(screen.getByLabelText('Favorito')).toBeInTheDocument();
  });

  it('does not show a favorite marker for a non-favorite item', () => {
    render(<LeisureItemCard item={book} />);
    expect(screen.queryByLabelText('Favorito')).not.toBeInTheDocument();
  });

  it('shows progress for an item that has it', () => {
    render(<LeisureItemCard item={book} />);
    expect(screen.getByText('155 / 310 (50%)')).toBeInTheDocument();
  });

  it('omits progress for an item with no progress concept', () => {
    render(<LeisureItemCard item={movie} />);
    expect(screen.queryByText(/%\)/)).not.toBeInTheDocument();
  });
});
