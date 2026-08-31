'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { FreeTimeSlot, ScheduleCandidate } from '@/shared/scheduling/types';
import { formatDurationDisplay } from '@/shared/scheduling/utils/timeHelpers';
import { getCandidatesForAvailableTime } from '../../adapters/candidateProviders';

export interface SlotSuggestionDialogProps {
  open: boolean;
  onClose: () => void;
  slot: FreeTimeSlot | null;
  onSelectCandidate: (candidate: ScheduleCandidate, slot: FreeTimeSlot) => Promise<void>;
}

export function SlotSuggestionDialog({
  open,
  onClose,
  slot,
  onSelectCandidate,
}: SlotSuggestionDialogProps) {
  const [candidates, setCandidates] = useState<ScheduleCandidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  useEffect(() => {
    if (open && slot) {
      setIsLoading(true);
      getCandidatesForAvailableTime(slot.duration, slot.date)
        .then((items) => setCandidates(items))
        .finally(() => setIsLoading(false));
    }
  }, [open, slot?.date, slot?.duration]);

  if (!slot) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="slot-suggestion-title"
    >
      <DialogTitle
        id="slot-suggestion-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Preencher tempo livre
          </Typography>
          <Typography
            variant="caption"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            {slot.startAt} às {slot.endAt} ({formatDurationDisplay(slot.duration)})
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2, pb: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : candidates.length === 0 ? (
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: themePalette(theme).kokyu.text.secondary,
              textAlign: 'center',
              py: 4,
            })}
          >
            Nenhuma atividade compatível com {formatDurationDisplay(slot.duration)} encontrada.
          </Typography>
        ) : (
          <List disablePadding>
            {candidates.map((candidate) => (
              <ListItem
                key={candidate.id}
                sx={(theme) => ({
                  mb: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                  backgroundColor: themePalette(theme).kokyu.surface.primary,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                })}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {candidate.title}
                      </Typography>
                      <Chip
                        label={candidate.category || candidate.sourceType}
                        size="small"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </Stack>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, mt: 0.5 })}
                    >
                      Duração estimada: {formatDurationDisplay(candidate.durationMinutes)}
                      {candidate.subtitle ? ` • ${candidate.subtitle}` : ''}
                    </Typography>
                  }
                />

                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  disabled={isApplying}
                  onClick={async () => {
                    setIsApplying(true);
                    try {
                      await onSelectCandidate(candidate, slot);
                      onClose();
                    } finally {
                      setIsApplying(false);
                    }
                  }}
                  sx={{ textTransform: 'none', ml: 2 }}
                >
                  Encaixar aqui
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}

