'use client';

import Autocomplete from '@mui/material/Autocomplete';
import { type FocusEvent, useState } from 'react';

import { KokyuTextField } from '../KokyuTextField/KokyuTextField';
import { addTags } from './normalizeTags';

export interface KokyuTagsFieldProps {
  value: string[];
  onChange: (tags: string[]) => void;
  /** Offered in the dropdown — already-selected tags are left out. */
  suggestions?: string[];
  label?: string;
  placeholder?: string;
  /** Fired after any pending text has been committed on blur (e.g. react-hook-form's `field.onBlur`). */
  onBlur?: () => void;
}

const defaultHelperText = 'Pressione Enter ou vírgula para adicionar.';

/**
 * Free-text tags that never silently drop what was typed: Enter, a comma
 * (typed or pasted) or leaving the field all turn the pending text into
 * tags. Every tag is normalized to the same canonical lower-case form the
 * API stores, so "Praia" and "praia" are always the same tag.
 */
export function KokyuTagsField({
  value,
  onChange,
  suggestions = [],
  label = 'Tags (opcional)',
  placeholder,
  onBlur,
}: KokyuTagsFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function commit(rawTags: string[], remainder = ''): void {
    const result = addTags(value, rawTags);
    if (result.tags.length !== value.length) onChange(result.tags);
    setError(result.error);
    setInputValue(result.error ? result.rejected : remainder);
  }

  function handleInputChange(nextInput: string, reason: string) {
    if (reason === 'reset') {
      setInputValue('');
      return;
    }
    if (nextInput.includes(',')) {
      const parts = nextInput.split(',');
      const remainder = parts.pop() ?? '';
      commit(parts, remainder.trimStart());
      return;
    }
    setError(null);
    setInputValue(nextInput);
  }

  function handleValueChange(nextValue: string[], reason: string) {
    if (reason === 'createOption' || reason === 'selectOption') {
      // MUI resets the input right before this; if the new tag is rejected,
      // `commit` puts the typed text back so it isn't lost.
      commit([nextValue[nextValue.length - 1] ?? '']);
      return;
    }
    setError(null);
    onChange(nextValue);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLInputElement && inputValue.trim()) {
      commit([inputValue]);
    }
    onBlur?.();
  }

  return (
    <Autocomplete
      multiple
      freeSolo
      options={suggestions.filter((tag) => !value.includes(tag))}
      value={value}
      inputValue={inputValue}
      onInputChange={(_event, nextInput, reason) => handleInputChange(nextInput, reason)}
      onChange={(_event, nextValue, reason) => handleValueChange(nextValue as string[], reason)}
      onBlur={handleBlur}
      renderInput={(params) => (
        <KokyuTextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={Boolean(error)}
          helperText={error ?? defaultHelperText}
        />
      )}
    />
  );
}
