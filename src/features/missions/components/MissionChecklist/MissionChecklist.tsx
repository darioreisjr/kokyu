'use client';

import { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { KokyuTextField } from '@/design-system/components';
import { calculateChecklistProgress } from '../../services/engines/missionProgressService';
import type { MissionChecklistItem } from '../../types';

export interface MissionChecklistProps {
  items: MissionChecklistItem[];
  onAddItem?: (text: string) => void;
  onToggleItem?: (id: string, completed: boolean) => void;
  onDeleteItem?: (id: string) => void;
}

/** A checklist item is just a step, never a full Mission — see `docs/missions.md#submissão-x-checklist`. */
export function MissionChecklist({ items, onAddItem, onToggleItem, onDeleteItem }: MissionChecklistProps) {
  const [newItemText, setNewItemText] = useState('');
  const progress = calculateChecklistProgress(items);

  function handleAdd() {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    onAddItem?.(trimmed);
    setNewItemText('');
  }

  return (
    <Stack spacing={1.5}>
      {items.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {progress.completed} de {progress.total} concluídos
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress.percent}
            aria-label={`Progresso do checklist: ${progress.percent}%`}
            sx={{ height: 6, borderRadius: 1 }}
          />
        </Stack>
      )}

      <Stack spacing={0.5}>
        {items.map((item) => (
          <Stack key={item.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Checkbox
              size="small"
              checked={item.completed}
              onChange={(event) => onToggleItem?.(item.id, event.target.checked)}
              slotProps={{ input: { 'aria-label': `Marcar "${item.text}" como ${item.completed ? 'não concluído' : 'concluído'}` } }}
            />
            <Typography
              variant="body2"
              sx={{ flex: 1, textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? 'text.secondary' : 'text.primary' }}
            >
              {item.text}
            </Typography>
            <IconButton size="small" onClick={() => onDeleteItem?.(item.id)} aria-label={`Remover item "${item.text}"`}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <KokyuTextField
        size="small"
        placeholder="Adicionar item…"
        value={newItemText}
        onChange={(event) => setNewItemText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            handleAdd();
          }
        }}
        aria-label="Novo item do checklist"
      />
    </Stack>
  );
}
