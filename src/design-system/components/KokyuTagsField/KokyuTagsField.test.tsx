import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../../test/test-utils';
import { KokyuTagsField } from './KokyuTagsField';

function Harness({
  initial = [],
  suggestions,
  onChangeSpy,
}: {
  initial?: string[];
  suggestions?: string[];
  onChangeSpy?: (tags: string[]) => void;
}) {
  const [tags, setTags] = useState<string[]>(initial);
  return (
    <>
      <KokyuTagsField
        value={tags}
        onChange={(next) => {
          setTags(next);
          onChangeSpy?.(next);
        }}
        suggestions={suggestions}
      />
      <button type="button">outro campo</button>
      <output data-testid="tags">{JSON.stringify(tags)}</output>
    </>
  );
}

const tagsOf = () => JSON.parse(screen.getByTestId('tags').textContent ?? '[]') as string[];

describe('KokyuTagsField', () => {
  it('adds a tag on Enter, lower-cased', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('Tags (opcional)'), 'Trabalho{Enter}');

    expect(tagsOf()).toEqual(['trabalho']);
    expect(screen.getByLabelText('Tags (opcional)')).toHaveValue('');
  });

  it('keeps typed text as a tag when the field loses focus without Enter (the original bug)', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.type(screen.getByLabelText('Tags (opcional)'), 'Fim de Semana');
    await user.click(screen.getByRole('button', { name: 'outro campo' }));

    expect(tagsOf()).toEqual(['fim de semana']);
  });

  it('splits on commas, typed or pasted', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText('Tags (opcional)');

    await user.type(input, 'Praia, Sol,');
    expect(tagsOf()).toEqual(['praia', 'sol']);

    await user.click(input);
    await user.paste('Mar, AREIA, mar, ');
    expect(tagsOf()).toEqual(['praia', 'sol', 'mar', 'areia']);
  });

  it('does not add duplicates that differ only in case or spacing', async () => {
    const user = userEvent.setup();
    const onChangeSpy = vi.fn();
    render(<Harness initial={['praia']} onChangeSpy={onChangeSpy} />);

    await user.type(screen.getByLabelText('Tags (opcional)'), '  PRAIA {Enter}');

    expect(tagsOf()).toEqual(['praia']);
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it('removes a tag through its chip', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['praia', 'sol']} />);

    const chip = screen.getByRole('button', { name: 'praia' });
    await user.click(chip.querySelector('svg') as SVGElement);

    expect(tagsOf()).toEqual(['sol']);
  });

  it('rejects a tag over 40 characters with a message, keeping the text in the input', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const long = 'a'.repeat(41);

    await user.type(screen.getByLabelText('Tags (opcional)'), `${long}{Enter}`);

    expect(tagsOf()).toEqual([]);
    expect(screen.getByText('Cada tag pode ter até 40 caracteres.')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags (opcional)')).toHaveValue(long);
  });

  it('shows a hint about Enter and comma', () => {
    render(<Harness />);
    expect(screen.getByText('Pressione Enter ou vírgula para adicionar.')).toBeInTheDocument();
  });

  it('offers suggestions that are not selected yet and adds one when picked', async () => {
    const user = userEvent.setup();
    render(<Harness initial={['praia']} suggestions={['praia', 'trabalho', 'estudos']} />);

    await user.click(screen.getByLabelText('Tags (opcional)'));
    expect(screen.queryByRole('option', { name: 'praia' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('option', { name: 'trabalho' }));

    expect(tagsOf()).toEqual(['praia', 'trabalho']);
  });
});
