import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '../../../../../test/test-utils';
import { HOME_SECTION_IDS } from '@/shared/home/types';
import { HomePersonalizationDialog, type HomePersonalizationValue } from './HomePersonalizationDialog';

const baseValue: HomePersonalizationValue = {
  sectionOrder: [...HOME_SECTION_IDS],
  hiddenSections: [],
  compactMode: false,
  showGreeting: true,
  showCapacity: true,
  showInsights: true,
};

describe('HomePersonalizationDialog', () => {
  it('never offers "Agora"/"Próximo" as hideable — only the remaining sections appear in the list', () => {
    render(
      <HomePersonalizationDialog open onClose={vi.fn()} value={baseValue} onChange={vi.fn()} />,
    );

    expect(screen.queryByText('Agora')).not.toBeInTheDocument();
    expect(screen.queryByText('Próximo')).not.toBeInTheDocument();
    expect(screen.getByText('Áreas de hoje')).toBeInTheDocument();
  });

  it('toggling a section switch reports it in hiddenSections', () => {
    const onChange = vi.fn();
    render(<HomePersonalizationDialog open onClose={vi.fn()} value={baseValue} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Mostrar seção Precisa de atenção' }));
    expect(onChange).toHaveBeenCalledWith({ hiddenSections: ['attention'] });
  });

  it('re-showing a hidden section removes it from hiddenSections', () => {
    const onChange = vi.fn();
    render(
      <HomePersonalizationDialog
        open
        onClose={vi.fn()}
        value={{ ...baseValue, hiddenSections: ['attention'] }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole('switch', { name: 'Mostrar seção Precisa de atenção' }));
    expect(onChange).toHaveBeenCalledWith({ hiddenSections: [] });
  });

  it('moving a section down swaps it with the next one, keeping "Agora"/"Próximo" pinned first', () => {
    const onChange = vi.fn();
    render(<HomePersonalizationDialog open onClose={vi.fn()} value={baseValue} onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'Mover Em foco para baixo' }));
    expect(onChange).toHaveBeenCalledWith({
      sectionOrder: ['now', 'next', 'rhythm', 'focus', 'areas', 'attention', 'freeTime', 'quickActions'],
    });
  });

  it('toggling "Modo compacto" reports the new value', () => {
    const onChange = vi.fn();
    render(<HomePersonalizationDialog open onClose={vi.fn()} value={baseValue} onChange={onChange} />);

    fireEvent.click(screen.getByRole('switch', { name: 'Modo compacto' }));
    expect(onChange).toHaveBeenCalledWith({ compactMode: true });
  });
});
