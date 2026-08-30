'use client';

import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import InboxRoundedIcon from '@mui/icons-material/InboxRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { EmptyState, KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { themePalette } from '@/design-system/theme/useThemePalette';
import { cardTokens } from '@/design-system/tokens/component';

import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useLeisureItems } from '../../hooks/useLeisureItems';
import type { LeisureItemFormValues } from '../../schemas/leisureItemSchema';
import type { PlanEntryFormValues } from '../../schemas/planEntrySchema';
import type { QuickCaptureFormValues } from '../../schemas/quickCaptureSchema';
import { leisureItemService } from '../../services/leisureItemService';
import { leisurePlanService } from '../../services/leisurePlanService';
import type { LeisureItem } from '../../types/leisureItem.types';
import { toDateKey } from '../../utils/dateHelpers';
import { mapFormValuesToLeisureItemInput } from '../../utils/leisureItemFormMapper';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import { LeisureItemDialog } from '../LeisureItemDialog/LeisureItemDialog';
import { PlanEntryDialog } from '../PlanEntryDialog/PlanEntryDialog';
import { QuickCaptureDialog } from '../QuickCaptureDialog/QuickCaptureDialog';

function LaterItemRow({
  item,
  onOrganize,
  onPlan,
  onStart,
  onArchive,
  onRemove,
}: {
  item: LeisureItem;
  onOrganize: () => void;
  onPlan: () => void;
  onStart: () => void;
  onArchive: () => void;
  onRemove: () => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <Paper
      elevation={0}
      sx={(theme) => ({
        borderRadius: cardTokens.radius,
        border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
        padding: 2,
      })}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="labelLarge" component="p" noWrap>
            {item.title}
          </Typography>
          {item.recommendedBy ? (
            <Typography
              variant="body2"
              sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
            >
              Recomendado por {item.recommendedBy}
            </Typography>
          ) : null}
        </Stack>
        <Stack direction="row" spacing={1}>
          <KokyuButton variant="outlined" size="small" onClick={onOrganize}>
            Organizar
          </KokyuButton>
          <IconButton
            aria-label="Mais ações"
            size="small"
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onPlan();
              }}
            >
              Planejar
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onStart();
              }}
            >
              <PlayArrowRoundedIcon fontSize="small" sx={{ marginRight: 1 }} /> Iniciar
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onArchive();
              }}
            >
              <ArchiveOutlinedIcon fontSize="small" sx={{ marginRight: 1 }} /> Arquivar
            </MenuItem>
            <MenuItem
              onClick={() => {
                setMenuAnchor(null);
                onRemove();
              }}
            >
              <DeleteOutlineRoundedIcon fontSize="small" sx={{ marginRight: 1 }} /> Excluir
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </Paper>
  );
}

/**
 * `/app/tempo-livre/para-depois` — a fast inbox for "salvar agora,
 * organizar depois." Every item here has `type: 'unsorted'`
 * ("Ainda não sei") until "Organizar" reclassifies it into a real
 * type — never a second, parallel storage for unsorted items.
 */
export function LaterPage() {
  const { status, items, reload } = useLeisureItems();
  const { showSuccess } = useSnackbar();
  const confirmAction = useConfirmAction();

  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [organizeTarget, setOrganizeTarget] = useState<LeisureItem | null>(null);
  const [planTarget, setPlanTarget] = useState<LeisureItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const laterItems = items.filter((item) => item.type === 'unsorted');

  async function handleQuickCapture(values: QuickCaptureFormValues) {
    setIsSubmitting(true);
    try {
      const type = (values.type || 'unsorted') as LeisureItem['type'];
      await leisureItemService.createLeisureItem({
        title: values.title,
        type,
        status: 'backlog',
        tags: [],
        favorite: false,
        durationType: 'unknown',
        sourceUrl: values.sourceUrl || undefined,
        description: values.notes || undefined,
        [type]: {},
      } as unknown as Parameters<typeof leisureItemService.createLeisureItem>[0]);
      showSuccess('Adicionado para depois.');
      setQuickCaptureOpen(false);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleOrganize(values: LeisureItemFormValues) {
    if (!organizeTarget) return;
    setIsSubmitting(true);
    try {
      const input = mapFormValuesToLeisureItemInput(values);
      await leisureItemService.reclassifyLeisureItem(
        organizeTarget.id,
        input.type,
        (input as unknown as Record<string, unknown>)[input.type] as Record<string, unknown>,
      );
      await leisureItemService.updateLeisureItem(organizeTarget.id, {
        status: input.status,
        tags: input.tags,
        priority: input.priority,
        durationType: input.durationType,
        estimatedDuration: input.estimatedDuration,
        minimumUsefulDuration: input.minimumUsefulDuration,
        description: input.description,
      });
      showSuccess('Item organizado.');
      setOrganizeTarget(null);
      reload();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStart(item: LeisureItem) {
    await leisureItemService.updateLeisureItem(item.id, { status: 'inProgress' } as Parameters<
      typeof leisureItemService.updateLeisureItem
    >[1]);
    showSuccess('Atividade iniciada.');
    reload();
  }

  async function handleArchive(item: LeisureItem) {
    await leisureItemService.archiveLeisureItem(item.id);
    showSuccess('Item arquivado.');
    reload();
  }

  function handleRemove(item: LeisureItem) {
    confirmAction.request({
      title: 'Excluir item?',
      description: `"${item.title}" será removido permanentemente.`,
      confirmLabel: 'Excluir',
      onConfirm: () => {
        leisureItemService.deleteLeisureItem(item.id).then(() => {
          showSuccess('Item excluído.');
          reload();
        });
      },
    });
  }

  async function handlePlan(values: PlanEntryFormValues) {
    if (!planTarget) return;
    await leisurePlanService.createPlanEntry({ ...values, leisureItemId: planTarget.id });
    showSuccess('Atividade planejada.');
    setPlanTarget(null);
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
            Para depois
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Salve agora, organize quando quiser.
          </Typography>
        </Stack>
        <KokyuButton
          variant="contained"
          onClick={() => setQuickCaptureOpen(true)}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Guardar para depois
        </KokyuButton>
      </Stack>

      {status === 'loading' ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={72} />
          ))}
        </Stack>
      ) : null}
      {status === 'error' ? (
        <Alert severity="error">Não foi possível carregar sua lista agora. Tente novamente.</Alert>
      ) : null}

      {status === 'ready' && laterItems.length === 0 ? (
        <EmptyState
          icon={InboxRoundedIcon}
          title="Sua lista está vazia."
          action={
            <KokyuButton variant="contained" onClick={() => setQuickCaptureOpen(true)}>
              Guardar alguma coisa
            </KokyuButton>
          }
        />
      ) : null}

      {status === 'ready' && laterItems.length > 0 ? (
        <Stack spacing={1.5}>
          {laterItems.map((item) => (
            <LaterItemRow
              key={item.id}
              item={item}
              onOrganize={() => setOrganizeTarget(item)}
              onPlan={() => setPlanTarget(item)}
              onStart={() => handleStart(item)}
              onArchive={() => handleArchive(item)}
              onRemove={() => handleRemove(item)}
            />
          ))}
        </Stack>
      ) : null}

      <QuickCaptureDialog
        open={quickCaptureOpen}
        onClose={() => setQuickCaptureOpen(false)}
        onSave={handleQuickCapture}
        isSubmitting={isSubmitting}
      />

      <LeisureItemDialog
        open={Boolean(organizeTarget)}
        defaultValues={
          organizeTarget
            ? {
                title: organizeTarget.title,
                description: organizeTarget.description,
                sourceUrl: organizeTarget.sourceUrl,
              }
            : undefined
        }
        onClose={() => setOrganizeTarget(null)}
        onSave={handleOrganize}
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

      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
