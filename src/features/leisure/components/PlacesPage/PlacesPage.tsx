'use client';

import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';

import { useLeisureItems } from '../../hooks/useLeisureItems';
import type { LeisureItemFormValues } from '../../schemas/leisureItemSchema';
import type { PlanEntryFormValues } from '../../schemas/planEntrySchema';
import { historyService } from '../../services/historyService';
import { leisureItemService } from '../../services/leisureItemService';
import { leisurePlanService } from '../../services/leisurePlanService';
import type { LeisureItem, LeisureItemStatus } from '../../types/leisureItem.types';
import { toDateKey } from '../../utils/dateHelpers';
import { mapFormValuesToLeisureItemInput } from '../../utils/leisureItemFormMapper';
import { LeisureItemCard } from '../LeisureItemCard/LeisureItemCard';
import { LeisureItemDialog } from '../LeisureItemDialog/LeisureItemDialog';
import { LogEntryDialog, type LogEntryDraft } from '../LogEntryDialog/LogEntryDialog';
import { PlanEntryDialog } from '../PlanEntryDialog/PlanEntryDialog';

type FilterValue = 'todos' | LeisureItemStatus;

const filterOptions: { id: FilterValue; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'backlog', label: 'Quero conhecer' },
  { id: 'planned', label: 'Planejado' },
  { id: 'completed', label: 'Visitado' },
];

/** `/app/tempo-livre/lugares` — restaurantes, cafés, parques, eventos, viagens curtas: everywhere the user wants to go, sharing the same `LeisureItem`/plan/log architecture as the rest of the feature. */
export function PlacesPage() {
  const { status, items, reload } = useLeisureItems();
  const { showSuccess } = useSnackbar();

  const [filter, setFilter] = useState<FilterValue>('todos');
  const [addOpen, setAddOpen] = useState(false);
  const [planTarget, setPlanTarget] = useState<LeisureItem | null>(null);
  const [visitTarget, setVisitTarget] = useState<LeisureItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const places = items.filter((item) => item.type === 'place' || item.type === 'event');
  const filteredPlaces =
    filter === 'todos' ? places : places.filter((item) => item.status === filter);

  async function handleAdd(values: LeisureItemFormValues) {
    setIsSubmitting(true);
    try {
      await leisureItemService.createLeisureItem(mapFormValuesToLeisureItemInput(values));
      showSuccess('Item salvo.');
      setAddOpen(false);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePlan(values: PlanEntryFormValues) {
    if (!planTarget) return;
    await leisurePlanService.createPlanEntry({ ...values, leisureItemId: planTarget.id });
    showSuccess('Atividade planejada.');
    setPlanTarget(null);
  }

  async function handleVisit(draft: LogEntryDraft) {
    if (!visitTarget) return;
    setIsSubmitting(true);
    try {
      await historyService.createLogEntry({
        leisureItemId: visitTarget.id,
        activityType: visitTarget.type,
        title: visitTarget.title,
        completedAt: draft.completedAt.toISOString(),
        duration: draft.duration,
        rating: draft.rating ?? undefined,
        notes: draft.notes || undefined,
      });
      await leisureItemService.updateLeisureItem(visitTarget.id, {
        status: 'completed',
      } as Parameters<typeof leisureItemService.updateLeisureItem>[1]);
      showSuccess('Visita registrada.');
      setVisitTarget(null);
      reload();
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
            Lugares & Passeios
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Guarde lugares e experiências que você quer viver.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          onClick={() => setAddOpen(true)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Adicionar
        </KokyuButton>
      </Stack>

      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_event, next: FilterValue | null) => next && setFilter(next)}
        aria-label="Filtrar lugares"
        size="small"
        sx={{
          flexWrap: 'wrap',
          gap: 1,
          '& .MuiToggleButtonGroup-grouped': {
            border: '1px solid',
            borderRadius: '8px !important',
          },
        }}
      >
        {filterOptions.map((option) => (
          <ToggleButton key={option.id} value={option.id} sx={{ textTransform: 'none' }}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {status === 'loading' ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={200} />
          ))}
        </Box>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">
          Não foi possível carregar seus lugares agora. Tente novamente.
        </Alert>
      ) : null}

      {status === 'ready' && places.length === 0 ? (
        <EmptyState
          icon={PlaceRoundedIcon}
          title="Salve lugares que você quer conhecer."
          action={
            <KokyuButton variant="contained" onClick={() => setAddOpen(true)}>
              Adicionar
            </KokyuButton>
          }
        />
      ) : null}

      {status === 'ready' && places.length > 0 ? (
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
          {filteredPlaces.map((item) => (
            <Stack key={item.id} spacing={1}>
              <LeisureItemCard item={item} />
              <Stack direction="row" spacing={1}>
                <KokyuButton
                  variant="outlined"
                  size="small"
                  onClick={() => setPlanTarget(item)}
                  sx={{ flex: 1 }}
                >
                  Planejar
                </KokyuButton>
                {item.status !== 'completed' ? (
                  <KokyuButton
                    variant="outlined"
                    size="small"
                    onClick={() => setVisitTarget(item)}
                    sx={{ flex: 1 }}
                  >
                    Marcar visitado
                  </KokyuButton>
                ) : null}
              </Stack>
            </Stack>
          ))}
        </Box>
      ) : null}

      <LeisureItemDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
        isSubmitting={isSubmitting}
      />

      <PlanEntryDialog
        open={Boolean(planTarget)}
        defaultValues={
          planTarget ? { title: planTarget.title, date: toDateKey(new Date()) } : undefined
        }
        onClose={() => setPlanTarget(null)}
        onSave={handlePlan}
      />

      <LogEntryDialog
        open={Boolean(visitTarget)}
        itemTitle={visitTarget?.title ?? ''}
        onClose={() => setVisitTarget(null)}
        onSave={handleVisit}
        isSubmitting={isSubmitting}
      />
    </Stack>
  );
}
