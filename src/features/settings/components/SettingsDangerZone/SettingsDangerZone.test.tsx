import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../../test/test-utils';
import { SettingsDangerZone } from './SettingsDangerZone';

describe('SettingsDangerZone', () => {
  it('renders a title, description and its children — never signaling danger by color alone', () => {
    render(
      <SettingsDangerZone description="Ações que não podem ser desfeitas.">
        <div>Excluir conta</div>
      </SettingsDangerZone>,
    );

    const section = screen.getByRole('region', { name: 'Zona de perigo' });
    expect(section).toBeInTheDocument();
    expect(screen.getByText('Ações que não podem ser desfeitas.')).toBeInTheDocument();
    expect(screen.getByText('Excluir conta')).toBeInTheDocument();
  });

  it('accepts a custom title', () => {
    render(<SettingsDangerZone title="Ações irreversíveis">conteúdo</SettingsDangerZone>);
    expect(screen.getByRole('region', { name: 'Ações irreversíveis' })).toBeInTheDocument();
  });
});
