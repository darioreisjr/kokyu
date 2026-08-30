'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import type { GoalKeyResult } from '../../types';
import { GoalProgressBar } from '../GoalProgressBar/GoalProgressBar';

export interface GoalKeyResultsListProps {
  keyResults: GoalKeyResult[];
  onUpdateCurrent: (keyResultId: string, current: number) => void;
}

function KeyResultRow({
  keyResult,
  onUpdateCurrent,
}: {
  keyResult: GoalKeyResult;
  onUpdateCurrent: (current: number) => void;
}) {
  const [draft, setDraft] = useState(String(keyResult.current));
  const percent =
    keyResult.type === 'binary'
      ? keyResult.status === 'completed'
        ? 100
        : 0
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(
              ((keyResult.current - keyResult.baseline) /
                (keyResult.target - keyResult.baseline || 1)) *
                100,
            ),
          ),
        );

  return (
    <Stack
      spacing={1}
      sx={(theme) => ({
        padding: 1.5,
        borderRadius: 1.5,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
      })}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body2">{keyResult.title}</Typography>
        {typeof keyResult.weight === 'number' ? (
          <Typography
            variant="labelSmall"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Peso: {keyResult.weight}%
          </Typography>
        ) : null}
      </Stack>
      <GoalProgressBar
        current={keyResult.current}
        target={keyResult.target}
        percent={percent}
        unit={keyResult.unit}
      />
      {keyResult.type === 'numeric' ? (
        <Stack direction="row" spacing={1}>
          <KokyuTextField
            label="Valor atual"
            type="number"
            size="small"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            sx={{ flex: 1 }}
          />
          <KokyuButton
            variant="outlined"
            size="small"
            onClick={() => {
              const numericValue = Number(draft);
              if (!Number.isNaN(numericValue)) onUpdateCurrent(numericValue);
            }}
          >
            Atualizar
          </KokyuButton>
        </Stack>
      ) : null}
    </Stack>
  );
}

/** Quando há resultados-chave, o progresso oficial da meta vem exclusivamente deles — nunca combinado com um percentual manual paralelo (ver `keyResultProgressStrategy`). */
export function GoalKeyResultsList({ keyResults, onUpdateCurrent }: GoalKeyResultsListProps) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="labelLarge">Resultados</Typography>
      <Stack spacing={1}>
        {keyResults.map((keyResult) => (
          <KeyResultRow
            key={keyResult.id}
            keyResult={keyResult}
            onUpdateCurrent={(current) => onUpdateCurrent(keyResult.id, current)}
          />
        ))}
      </Stack>
    </Stack>
  );
}
