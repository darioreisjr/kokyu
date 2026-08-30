import { describe, expect, it } from 'vitest';

import InventoryRoundedIcon from '@mui/icons-material/Inventory2Rounded';

import { render, screen } from '../../../../test/test-utils';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="Despensa vazia" />);
    expect(screen.getByText('Despensa vazia')).toBeInTheDocument();
  });

  it('renders the description when given one', () => {
    render(<EmptyState title="Despensa vazia" description="Adicione o que você já tem em casa." />);
    expect(screen.getByText('Adicione o que você já tem em casa.')).toBeInTheDocument();
  });

  it('omits the description when none is given', () => {
    const { container } = render(<EmptyState title="Despensa vazia" />);
    expect(container.querySelector('p.MuiTypography-body2')).not.toBeInTheDocument();
  });

  it('renders the icon when given one', () => {
    render(<EmptyState title="Despensa vazia" icon={InventoryRoundedIcon} />);
    expect(document.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('renders the action node when given one', () => {
    render(
      <EmptyState title="Despensa vazia" action={<button type="button">Adicionar item</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Adicionar item' })).toBeInTheDocument();
  });
});
