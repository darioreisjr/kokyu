'use client';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { replanRemainingDay } from '@/shared/scheduling/engines/replanEngine';
import type { ReplanResult, ScheduleEntry } from '@/shared/scheduling/types';
import { dailyRhythmService } from '../../services/dailyRhythmService';

export interface ReplanDialogProps {
  open: boolean;
  onClose: () => void;
  date: string;
  onReplanApplied?: () => void;
}

export function ReplanDialog({ open, onClose, date, onReplanApplied }: ReplanDialogProps) {
  const [replanResult, setReplanResult] = useState<ReplanResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApplying, setIsApplying] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      const currentTime = format(new Date(), 'HH:mm');

      dailyRhythmService.getDaySchedule(date).then(({ entries }) => {
        const result = replanRemainingDay(date, currentTime, entries);
        setReplanResult(result);
        setIsLoading(false);
      });
    }
  }, [open, date]);

  const handleApply = async () => {
    if (!replanResult) return;
    setIsApplying(true);
    try {
      for (const item of replanResult.preview.items) {
        if (item.startAt) {
          const entryPatch: Partial<ScheduleEntry> = {
            startAt: item.startAt,
            endAt: item.endAt,
          };
          await dailyRhythmService.updateScheduleEntry(item.entryId, entryPatch);
        }
      }
      onReplanApplied?.();
      onClose();
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="replan-dialog-title">
      <DialogTitle
        id="replan-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Reorganizar Resto do Dia
          </Typography>
          <Typography
            variant="caption"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Atrasei ou imprevistos aconteceram? Redistribua as atividades a partir de agora sem bagunçar eventos fixos.
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2.5 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : !replanResult || replanResult.preview.diffs.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Sua agenda já está otimizada a partir deste horário!
            </Typography>
            <Typography
              variant="caption"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, mt: 0.5, display: 'block' })}
            >
              Não há conflitos nem itens pendentes que precisem ser realocados.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Ajustes propostos ({replanResult.preview.diffs.length}):
            </Typography>

            <List disablePadding>
              {replanResult.preview.diffs.map((diff) => (
                <ListItem
                  key={diff.entryId}
                  sx={(theme) => ({
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: themePalette(theme).kokyu.surface.primary,
                    border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                  })}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {diff.title}
                      </Typography>
                    }
                    secondary={
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          alignItems: 'center',
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {diff.previousStartAt || 'Sem horário'}
                        </Typography>
                        <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                        <Typography
                          variant="caption"
                          sx={{ color: 'primary.main', fontWeight: 700 }}
                        >
                          {diff.newStartAt}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          • {diff.reason}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Stack>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button variant="text" onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ReplayRoundedIcon />}
          disabled={
            isApplying ||
            isLoading ||
            !replanResult ||
            replanResult.preview.diffs.length === 0
          }
          onClick={handleApply}
          sx={{ textTransform: 'none', px: 3 }}
        >
          {isApplying ? 'Aplicando...' : 'Aplicar Reorganização'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

