'use client';

import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import AddTaskRoundedIcon from '@mui/icons-material/AddTaskRounded';

import { KokyuTextField } from '@/design-system/components';

export interface MissionQuickCaptureProps {
  onCapture: (title: string) => Promise<void> | void;
  placeholder?: string;
  autoFocus?: boolean;
  /** Only for previewing a filled/keyboard-ready state (Storybook) — the field is otherwise always uncontrolled. */
  initialTitle?: string;
}

/**
 * Title + Enter, nothing else required (spec "CAPTURA RÁPIDA"/"CAMPOS MÍNIMOS"). Kept generic
 * enough to drop into Respiração, Ritmo Diário, or a future Command Palette (spec "QUICK CAPTURE
 * GLOBAL") — it only needs an `onCapture` callback, no Missions-specific wiring baked in.
 */
export function MissionQuickCapture({
  onCapture,
  placeholder = 'Adicionar uma missão…',
  autoFocus,
  initialTitle = '',
}: MissionQuickCaptureProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onCapture(trimmed);
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <KokyuTextField
      fullWidth
      autoFocus={autoFocus}
      placeholder={placeholder}
      value={title}
      onChange={(event) => setTitle(event.target.value)}
      onKeyDown={handleKeyDown}
      aria-label="Nova missão"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {isSubmitting ? (
                <CircularProgress size={20} />
              ) : (
                <IconButton
                  size="small"
                  onClick={() => void submit()}
                  disabled={!title.trim()}
                  aria-label="Adicionar missão"
                >
                  <AddTaskRoundedIcon fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
