import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import type { LeisureItem, MovieItem, PodcastItem, VideoItem } from '../../types/leisureItem.types';
import { TimeAvailabilitySuggester } from './TimeAvailabilitySuggester';

function base(overrides: Partial<LeisureItem> & Pick<LeisureItem, 'id' | 'title' | 'type'>) {
  return {
    status: 'backlog' as const,
    tags: [],
    favorite: false,
    durationType: 'fixed' as const,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

const podcast: PodcastItem = base({
  id: 'podcast-1',
  title: 'Café com Tecnologia',
  type: 'podcast',
  estimatedDuration: 20,
  podcast: {},
}) as PodcastItem;
const video: VideoItem = base({
  id: 'video-1',
  title: 'Tutorial rápido',
  type: 'video',
  estimatedDuration: 15,
  video: {},
}) as VideoItem;
const movie: MovieItem = base({
  id: 'movie-1',
  title: 'Filme longo',
  type: 'movie',
  estimatedDuration: 120,
  movie: {},
}) as MovieItem;

describe('TimeAvailabilitySuggester', () => {
  it('shows no results before a duration is picked', () => {
    render(<TimeAvailabilitySuggester items={[podcast, video, movie]} onStart={vi.fn()} />);
    expect(screen.queryByText('Café com Tecnologia')).not.toBeInTheDocument();
  });

  it('with 30 minutes, suggests the podcast and video but not the 2h movie', async () => {
    const user = userEvent.setup();
    render(<TimeAvailabilitySuggester items={[podcast, video, movie]} onStart={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: '30 min' }));

    expect(screen.getByText('Café com Tecnologia')).toBeInTheDocument();
    expect(screen.getByText('Tutorial rápido')).toBeInTheDocument();
    expect(screen.queryByText('Filme longo')).not.toBeInTheDocument();
  });

  it('accepts a custom duration', async () => {
    const user = userEvent.setup();
    render(<TimeAvailabilitySuggester items={[movie]} onStart={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Personalizado' }));
    await user.type(screen.getByLabelText('Minutos disponíveis'), '150');

    expect(screen.getByText('Filme longo')).toBeInTheDocument();
  });

  it('shows an empty message when nothing fits', async () => {
    const user = userEvent.setup();
    render(<TimeAvailabilitySuggester items={[movie]} onStart={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: '15 min' }));

    expect(screen.getByText('Nada salvo cabe nesse tempo agora.')).toBeInTheDocument();
  });

  it('calls onStart with the chosen item', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<TimeAvailabilitySuggester items={[podcast]} onStart={onStart} />);

    await user.click(screen.getByRole('button', { name: '30 min' }));
    await user.click(screen.getByRole('button', { name: 'Começar' }));

    expect(onStart).toHaveBeenCalledWith(podcast);
  });
});
