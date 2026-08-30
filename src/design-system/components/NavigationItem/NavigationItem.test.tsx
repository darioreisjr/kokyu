import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { NavigationItem } from './NavigationItem';

describe('NavigationItem', () => {
  it('renders as a link to its href', () => {
    render(<NavigationItem icon={HomeRoundedIcon} label="Respiração" href="/app" />);

    expect(screen.getByRole('link', { name: 'Respiração' })).toHaveAttribute('href', '/app');
  });

  it('marks the active item with aria-current="page"', () => {
    render(<NavigationItem icon={HomeRoundedIcon} label="Respiração" href="/app" active />);

    expect(screen.getByRole('link', { name: 'Respiração' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('does not mark an inactive item as current', () => {
    render(<NavigationItem icon={HomeRoundedIcon} label="Respiração" href="/app" />);

    expect(screen.getByRole('link', { name: 'Respiração' })).not.toHaveAttribute('aria-current');
  });

  it('renders as a button (not a link) when given onClick instead of href', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<NavigationItem icon={HomeRoundedIcon} label="Sair" onClick={onClick} />);

    const button = screen.getByRole('button', { name: 'Sair' });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('fires onClick as a side-effect of a link click too', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <NavigationItem
        icon={HomeRoundedIcon}
        label="Missões"
        href="/app/missoes"
        onClick={onClick}
      />,
    );

    await user.click(screen.getByRole('link', { name: 'Missões' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows the visible label when expanded', () => {
    render(<NavigationItem icon={HomeRoundedIcon} label="Respiração" href="/app" />);
    expect(screen.getByText('Respiração')).toBeInTheDocument();
  });

  it('hides the visible label when collapsed, keeping it as the accessible name', () => {
    render(<NavigationItem icon={HomeRoundedIcon} label="Respiração" href="/app" collapsed />);

    expect(screen.queryByText('Respiração')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Respiração' })).toBeInTheDocument();
  });

  it('exposes the label via a Tooltip when collapsed', async () => {
    const user = userEvent.setup();
    render(<NavigationItem icon={HomeRoundedIcon} label="Respiração" href="/app" collapsed />);

    await user.hover(screen.getByRole('link', { name: 'Respiração' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Respiração');
  });
});
