'use client';

import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { themePalette } from '@/design-system/theme/useThemePalette';

import type { GoalMilestone } from '../../types';
import { formatShortDate } from '../../utils/dateHelpers';

export interface GoalMilestonesListProps {
  milestones: GoalMilestone[];
  onToggle: (milestoneId: string, completed: boolean) => void;
  onAdd: (title: string) => void;
  onReorder: (orderedMilestoneIds: string[]) => void;
}

/** Marcos representam resultados importantes, não subtarefas — se precisar de ações, isso vira uma Missão vinculada (`GoalContributionsList`), não um item aqui (ver a spec: "marco não é tarefa"). */
export function GoalMilestonesList({
  milestones,
  onToggle,
  onAdd,
  onReorder,
}: GoalMilestonesListProps) {
  const [newTitle, setNewTitle] = useState('');
  const sorted = [...milestones].sort((a, b) => a.order - b.order);

  function moveMilestone(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex]!, reordered[index]!];
    onReorder(reordered.map((milestone) => milestone.id));
  }

  function handleAdd() {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim());
    setNewTitle('');
  }

  return (
    <Stack spacing={1.5}>
      <Typography variant="labelLarge">Marcos</Typography>
      <Stack spacing={1}>
        {sorted.map((milestone, index) => (
          <Stack
            key={milestone.id}
            direction="row"
            spacing={1}
            sx={(theme) => ({
              alignItems: 'center',
              padding: 1,
              borderRadius: 1.5,
              border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
            })}
          >
            <Checkbox
              checked={milestone.completed}
              onChange={(event) => onToggle(milestone.id, event.target.checked)}
              slotProps={{ input: { 'aria-label': `Marcar "${milestone.title}" como concluído` } }}
            />
            <Stack sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ textDecoration: milestone.completed ? 'line-through' : 'none' }}
              >
                {milestone.title}
              </Typography>
              {milestone.targetDate ? (
                <Typography
                  variant="labelSmall"
                  sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
                >
                  {formatShortDate(milestone.targetDate)}
                </Typography>
              ) : null}
            </Stack>
            <IconButton
              size="small"
              aria-label={`Mover "${milestone.title}" para cima`}
              onClick={() => moveMilestone(index, -1)}
              disabled={index === 0}
            >
              <ArrowUpwardRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label={`Mover "${milestone.title}" para baixo`}
              onClick={() => moveMilestone(index, 1)}
              disabled={index === sorted.length - 1}
            >
              <ArrowDownwardRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>
      <Stack direction="row" spacing={1}>
        <KokyuTextField
          label="Novo marco"
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleAdd();
            }
          }}
          sx={{ flex: 1 }}
        />
        <KokyuButton variant="outlined" onClick={handleAdd}>
          Adicionar
        </KokyuButton>
      </Stack>
    </Stack>
  );
}
