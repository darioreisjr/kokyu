import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { SettingsNavigation, type SettingsCategoryConfig } from './SettingsNavigation';

const categories: SettingsCategoryConfig[] = [
  { id: 'geral', label: 'Geral', icon: TuneRoundedIcon },
  { id: 'aparencia', label: 'Aparência', icon: PaletteRoundedIcon },
];

describe('SettingsNavigation', () => {
  it('renders every category and marks the active one', () => {
    render(
      <SettingsNavigation
        categories={categories}
        activeCategory="aparencia"
        onSelectCategory={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('navigation', { name: 'Categorias de configurações' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Geral')).toBeInTheDocument();
    const active = screen.getByText('Aparência').closest('[aria-current]');
    expect(active).toHaveAttribute('aria-current', 'page');
  });

  it('calls onSelectCategory with the clicked category id', async () => {
    const user = userEvent.setup();
    const onSelectCategory = vi.fn();
    render(
      <SettingsNavigation
        categories={categories}
        activeCategory="aparencia"
        onSelectCategory={onSelectCategory}
      />,
    );

    await user.click(screen.getByText('Geral'));
    expect(onSelectCategory).toHaveBeenCalledWith('geral');
  });
});
