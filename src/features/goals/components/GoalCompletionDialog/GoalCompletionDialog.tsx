'use client';

import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

import { KokyuButton, KokyuTextField } from '@/design-system/components';
import { useEffectiveReducedMotion } from '@/design-system/providers/MotionPreferenceProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

export interface GoalCompletionValues {
  whatWorked?: string;
  whatLearned?: string;
  whatWouldChangeNextTime?: string;
  ratingOutOfFive?: number;
}

export interface GoalCompletionDialogProps {
  open: boolean;
  goalTitle?: string;
  onClose: () => void;
  onComplete: (reflection?: GoalCompletionValues) => void;
  isSubmitting?: boolean;
}

/**
 * Celebração discreta via Motion (respeita `prefers-reduced-motion`) — nada de confetti externo.
 * A reflexão inteira é opcional, incluindo pular direto para "Concluir sem reflexão" (ver a spec:
 * "não obrigar").
 */
export function GoalCompletionDialog({
  open,
  goalTitle,
  onClose,
  onComplete,
  isSubmitting = false,
}: GoalCompletionDialogProps) {
  const shouldReduceMotion = useEffectiveReducedMotion();
  const [whatWorked, setWhatWorked] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [whatWouldChangeNextTime, setWhatWouldChangeNextTime] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setWhatWorked('');
        setWhatLearned('');
        setWhatWouldChangeNextTime('');
        setRating(null);
      });
    }
  }, [open]);

  function buildReflection(): GoalCompletionValues | undefined {
    if (!whatWorked && !whatLearned && !whatWouldChangeNextTime && !rating) return undefined;
    return {
      whatWorked: whatWorked || undefined,
      whatLearned: whatLearned || undefined,
      whatWouldChangeNextTime: whatWouldChangeNextTime || undefined,
      ratingOutOfFive: rating ?? undefined,
    };
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="goal-completion-title"
    >
      <DialogTitle id="goal-completion-title">
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.01 }
                : { type: 'spring', stiffness: 260, damping: 18 }
            }
          >
            <EmojiEventsRoundedIcon
              aria-hidden="true"
              sx={(theme) => ({ color: themePalette(theme).kokyu.feedback.success })}
            />
          </motion.div>
          <Typography variant="labelLarge">Meta concluída</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ paddingTop: 1 }}>
          {goalTitle ? <Typography variant="body2">{goalTitle}</Typography> : null}
          <KokyuTextField
            label="O que funcionou? (opcional)"
            multiline
            minRows={2}
            value={whatWorked}
            onChange={(event) => setWhatWorked(event.target.value)}
          />
          <KokyuTextField
            label="O que você aprendeu? (opcional)"
            multiline
            minRows={2}
            value={whatLearned}
            onChange={(event) => setWhatLearned(event.target.value)}
          />
          <KokyuTextField
            label="Algo que faria diferente? (opcional)"
            multiline
            minRows={2}
            value={whatWouldChangeNextTime}
            onChange={(event) => setWhatWouldChangeNextTime(event.target.value)}
          />
          <Stack spacing={0.5}>
            <Typography variant="labelMedium" id="goal-completion-rating-label">
              Como foi alcançar esta meta? (opcional)
            </Typography>
            <Rating
              value={rating}
              onChange={(_event, value) => setRating(value)}
              aria-labelledby="goal-completion-rating-label"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="text" onClick={() => onComplete(undefined)} disabled={isSubmitting}>
          Concluir sem reflexão
        </KokyuButton>
        <KokyuButton
          variant="contained"
          onClick={() => onComplete(buildReflection())}
          loading={isSubmitting}
        >
          Concluir meta
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
