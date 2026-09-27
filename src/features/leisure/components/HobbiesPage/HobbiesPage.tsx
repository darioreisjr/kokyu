'use client';

import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { friendlyErrorMessage } from '@/lib/api/errors';

import { leisureRoutes } from '../../constants/leisureRoutes';

import { useLeisureItems } from '../../hooks/useLeisureItems';
import type { PlanEntryFormValues } from '../../schemas/planEntrySchema';
import { historyService } from '../../services/historyService';
import { leisurePlanService } from '../../services/leisurePlanService';
import type { LeisureItem } from '../../types/leisureItem.types';
import { toDateKey } from '../../utils/dateHelpers';
import { LeisureItemCard } from '../LeisureItemCard/LeisureItemCard';
import { LogEntryDialog, type LogEntryDraft } from '../LogEntryDialog/LogEntryDialog';
import { PlanEntryDialog } from '../PlanEntryDialog/PlanEntryDialog';

/** `/app/tempo-livre/hobbies` — recurring, prazer-driven activities. Sessions are logged (`LeisureLogEntry`) without ever marking the hobby itself "completed" — a hobby is meant to be practiced again. */
export function HobbiesPage() {
  const router = useRouter();
  const { status, items } = useLeisureItems();
  const { showSuccess, showError } = useSnackbar();

  const [planTarget, setPlanTarget] = useState<LeisureItem | null>(null);
  const [sessionTarget, setSessionTarget] = useState<LeisureItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hobbies = items.filter((item) => item.type === 'hobby');

  async function handlePlan(values: PlanEntryFormValues) {
    if (!planTarget) return;
    try {
      await leisurePlanService.createPlanEntry({ ...values, leisureItemId: planTarget.id });
      showSuccess('Sessão planejada.');
      setPlanTarget(null);
    } catch (error) {
      showError(friendlyErrorMessage(error, 'Não foi possível planejar agora.'));
    }
  }

  async function handleLogSession(draft: LogEntryDraft) {
    if (!sessionTarget) return;
    setIsSubmitting(true);
    try {
      await historyService.createLogEntry({
        leisureItemId: sessionTarget.id,
        activityType: 'hobby',
        title: sessionTarget.title,
        completedAt: draft.completedAt.toISOString(),
        duration: draft.duration,
        rating: draft.rating ?? undefined,
        notes: draft.notes || undefined,
      });
      showSuccess('Sessão registrada.');
      setSessionTarget(null);
    } catch (error) {
      showError(friendlyErrorMessage(error, 'Não foi possível registrar a sessão agora.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack spacing={4}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
      >
        <Stack spacing={0.5}>
          <Typography variant="displaySmall" component="h1">
            Hobbies
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Atividades que você pratica só por prazer.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          onClick={() => router.push(leisureRoutes.hobbyNew)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Adicionar
        </KokyuButton>
      </Stack>

      {status === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {Array.from({ length: 2 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={200} />
          ))}
        </Box>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar seus hobbies agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' && hobbies.length === 0 ? (
        <EmptyState
          icon={FavoriteBorderRoundedIcon}
          title="Adicione algo que você gosta de fazer no seu tempo livre."
          action={
            <KokyuButton variant="contained" onClick={() => router.push(leisureRoutes.hobbyNew)}>
              Adicionar
            </KokyuButton>
          }
        />
      ) : null}

      {status === 'ready' && hobbies.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {hobbies.map((item) => (
            <Stack key={item.id} spacing={1}>
              <LeisureItemCard item={item} />
              <Stack direction="row" spacing={1}>
                <KokyuButton
                  variant="outlined"
                  size="small"
                  onClick={() => setPlanTarget(item)}
                  sx={{ flex: 1 }}
                >
                  Planejar sessão
                </KokyuButton>
                <KokyuButton
                  variant="outlined"
                  size="small"
                  onClick={() => setSessionTarget(item)}
                  sx={{ flex: 1 }}
                >
                  Registrar sessão
                </KokyuButton>
              </Stack>
            </Stack>
          ))}
        </Box>
      ) : null}

      <PlanEntryDialog
        open={Boolean(planTarget)}
        defaultValues={
          planTarget ? { title: planTarget.title, date: toDateKey(new Date()) } : undefined
        }
        onClose={() => setPlanTarget(null)}
        onSave={handlePlan}
      />

      <LogEntryDialog
        open={Boolean(sessionTarget)}
        itemTitle={sessionTarget?.title ?? ''}
        onClose={() => setSessionTarget(null)}
        onSave={handleLogSession}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
