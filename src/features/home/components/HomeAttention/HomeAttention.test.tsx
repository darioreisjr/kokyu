import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '../../../../../test/test-utils';
import type { HomeAttentionItem } from '@/shared/home/types';
import { HomeAttention } from './HomeAttention';

const conflictItem: HomeAttentionItem = {
  id: 'attention-1',
  sourceType: 'dailyRhythm',
  severity: 'important',
  title: 'Conflito na agenda',
  description: 'Dois compromissos se sobrepõem.',
  actionLabel: 'Ver agenda',
  actionHref: '/app/ritmo-diario',
  createdAt: '2026-09-04T10:00:00Z',
};

describe('HomeAttention', () => {
  it('renders nothing when there are no items', () => {
    const { container } = render(<HomeAttention items={[]} onOpen={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the section heading and each item title/description', () => {
    render(<HomeAttention items={[conflictItem]} onOpen={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Precisa de atenção' })).toBeInTheDocument();
    expect(screen.getByText('Conflito na agenda')).toBeInTheDocument();
    expect(screen.getByText('Dois compromissos se sobrepõem.')).toBeInTheDocument();
  });

  it('calls onOpen with the item action href when its action is clicked', () => {
    const onOpen = vi.fn();
    render(<HomeAttention items={[conflictItem]} onOpen={onOpen} />);

    fireEvent.click(screen.getByText('Ver agenda'));
    expect(onOpen).toHaveBeenCalledWith('/app/ritmo-diario');
  });
});
