import { describe, expect, it } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { KokyuAuthCard } from './KokyuAuthCard';

describe('KokyuAuthCard', () => {
  it('renders the title as the page heading', () => {
    render(
      <KokyuAuthCard title="Bem-vindo de volta">
        <div>form</div>
      </KokyuAuthCard>,
    );

    expect(screen.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeInTheDocument();
  });

  it('renders an optional description', () => {
    render(
      <KokyuAuthCard title="Bem-vindo de volta" description="Respire fundo.">
        <div>form</div>
      </KokyuAuthCard>,
    );

    expect(screen.getByText('Respire fundo.')).toBeInTheDocument();
  });

  it('renders children and an optional footer', () => {
    render(
      <KokyuAuthCard title="Bem-vindo de volta" footer={<span>Rodapé</span>}>
        <div>Conteúdo do formulário</div>
      </KokyuAuthCard>,
    );

    expect(screen.getByText('Conteúdo do formulário')).toBeInTheDocument();
    expect(screen.getByText('Rodapé')).toBeInTheDocument();
  });
});
