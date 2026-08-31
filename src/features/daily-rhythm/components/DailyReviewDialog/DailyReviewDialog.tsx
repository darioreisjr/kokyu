'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { formatDurationDisplay } from '@/shared/scheduling/utils/timeHelpers';
import {
  dailyReviewService,
  type DailyReviewData,
  type DayRhythmPerception,
  type PendingItemResolution,
} from '../../services/dailyReviewService';

export interface DailyReviewDialogProps {
  open: boolean;
  onClose: () => void;
  date: string;
  onReviewSubmitted?: () => void;
}

export function DailyReviewDialog({
  open,
  onClose,
  date,
  onReviewSubmitted,
}: DailyReviewDialogProps) {
  const [data, setData] = useState<DailyReviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [perception, setPerception] = useState<DayRhythmPerception>('balanced');
  const [note, setNote] = useState<string>('');
  const [resolutions, setResolutions] = useState<Record<string, 'tomorrow' | 'inbox' | 'discard'>>({});

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      dailyReviewService
        .getDailyReviewData(date)
        .then((res) => {
          setData(res);
          const initialRes: Record<string, 'tomorrow' | 'inbox' | 'discard'> = {};
          res.pendingItems.forEach((p) => {
            initialRes[p.id] = 'tomorrow';
          });
          setResolutions(initialRes);
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, date]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const resolutionArray: PendingItemResolution[] = Object.entries(resolutions).map(
        ([entryId, action]) => ({
          entryId,
          action,
        }),
      );

      await dailyReviewService.submitDailyReview({
        date,
        perception,
        note,
        resolutions: resolutionArray,
      });

      onReviewSubmitted?.();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="daily-review-title">
      <DialogTitle
        id="daily-review-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Revisão do Dia (Fechamento)
          </Typography>
          <Typography
            variant="caption"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Reflita sobre o ritmo de hoje e decida o destino do que ficou pendente.
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2.5 }}>
        {isLoading || !data ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Stats Summary */}
            <Box
              sx={(theme) => ({
                p: 2,
                borderRadius: 2,
                backgroundColor: themePalette(theme).kokyu.surface.primary,
                border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
              })}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Resumo do Dia
              </Typography>
              <Typography variant="caption" sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, display: 'block' })}>
                {data.completedItems.length} atividades concluídas ({formatDurationDisplay(data.totalActualMinutes)}) •{' '}
                {data.pendingItems.length} pendentes
              </Typography>
            </Box>

            {/* Pending Items Resolution */}
            {data.pendingItems.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  O que fazer com as pendências?
                </Typography>
                <List disablePadding>
                  {data.pendingItems.map((p) => (
                    <ListItem
                      key={p.id}
                      sx={(theme) => ({
                        mb: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: themePalette(theme).kokyu.surface.primary,
                        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      })}
                    >
                      <ListItemText
                        primary={p.title}
                        secondary={`${formatDurationDisplay(p.duration)} • ${p.sourceType}`}
                      />
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel id={`res-label-${p.id}`}>Destino</InputLabel>
                        <Select
                          labelId={`res-label-${p.id}`}
                          label="Destino"
                          value={resolutions[p.id] || 'tomorrow'}
                          onChange={(e) =>
                            setResolutions((prev) => ({
                              ...prev,
                              [p.id]: e.target.value as any,
                            }))
                          }
                        >
                          <MenuItem value="tomorrow">Mover para amanhã</MenuItem>
                          <MenuItem value="inbox">Mover para Inbox</MenuItem>
                          <MenuItem value="discard">Descartar</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Rhythm Perception */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Como foi o ritmo do seu dia?
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                {(
                  [
                    { id: 'light', label: 'Leve' },
                    { id: 'balanced', label: 'Equilibrado' },
                    { id: 'full', label: 'Cheio' },
                    { id: 'unpredictable', label: 'Imprevisível' },
                  ] as const
                ).map((opt) => (
                  <Chip
                    key={opt.id}
                    label={opt.label}
                    clickable
                    color={perception === opt.id ? 'primary' : 'default'}
                    variant={perception === opt.id ? 'filled' : 'outlined'}
                    onClick={() => setPerception(opt.id)}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Daily Note */}
            <TextField
              label="Algo que você quer lembrar sobre hoje?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
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
          disabled={isSubmitting || isLoading}
          onClick={handleSubmit}
          sx={{ textTransform: 'none', px: 3 }}
        >
          {isSubmitting ? 'Salvando...' : 'Salvar Fechamento'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

