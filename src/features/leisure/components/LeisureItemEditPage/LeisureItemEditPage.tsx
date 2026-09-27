'use client';

import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { friendlyErrorMessage } from '@/lib/api/errors';

import { leisureRoutes } from '../../constants/leisureRoutes';
import { useConfirmAction } from '../../hooks/useConfirmAction';
import { useLeisureItem } from '../../hooks/useLeisureItem';
import type { LeisureItemFormValues } from '../../schemas/leisureItemSchema';
import { leisureItemService } from '../../services/leisureItemService';
import type { LeisureItem } from '../../types/leisureItem.types';
import {
  mapFormValuesToLeisureItemPatch,
  mapLeisureItemToFormValues,
} from '../../utils/leisureItemFormMapper';
import { ConfirmActionDialog } from '../ConfirmActionDialog/ConfirmActionDialog';
import { LeisureItemForm } from '../LeisureItemForm/LeisureItemForm';

const FORM_ID = 'leisure-item-edit-form';

export interface LeisureItemEditPageProps {
  itemId: string;
}

/** `/app/tempo-livre/item/[id]/editar` — loads the item, then `LeisureItemEditForm`. */
export function LeisureItemEditPage({ itemId }: LeisureItemEditPageProps) {
  const { status, item } = useLeisureItem(itemId);

  if (status === 'loading') {
    return (
      <Stack spacing={3} sx={{ maxWidth: 560 }}>
        <Skeleton variant="text" width={220} height={40} />
        <Skeleton variant="rounded" height={420} />
      </Stack>
    );
  }
  if (status === 'not-found') {
    return <Alert severity="info">Este item não foi encontrado.</Alert>;
  }
  if (status === 'error' || !item) {
    return (
      <Alert severity="error">Não foi possível carregar este item agora. Tente novamente.</Alert>
    );
  }
  return <LeisureItemEditForm item={item} />;
}

/**
 * Editing an item as a full page rather than `LeisureItemDialog`'s modal,
 * like Notas and Planejamento. Arquivar/Excluir live here (not on the
 * detail page), both behind a confirmation.
 */
function LeisureItemEditForm({ item }: { item: LeisureItem }) {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const confirmAction = useConfirmAction();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<'archive' | 'delete' | null>(null);
  const isBusy = isSubmitting || pendingAction !== null;
  const detailHref = leisureRoutes.item(item.id);

  async function handleSubmit(values: LeisureItemFormValues) {
    setIsSubmitting(true);
    try {
      await leisureItemService.updateLeisureItem(
        item.id,
        mapFormValuesToLeisureItemPatch(values, item),
      );
      showSuccess('Item atualizado.');
      router.push(detailHref);
    } catch (error) {
      // Stays on the page with everything typed, so it can be fixed and resent.
      showError(friendlyErrorMessage(error, 'Não foi possível salvar as alterações agora.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function runAction(action: 'archive' | 'delete') {
    setPendingAction(action);
    try {
      if (action === 'archive') {
        await leisureItemService.archiveLeisureItem(item.id);
        showSuccess('Item arquivado.');
        router.push(detailHref);
      } else {
        await leisureItemService.deleteLeisureItem(item.id);
        showSuccess('Item excluído.');
        router.push(leisureRoutes.library);
      }
    } catch (error) {
      showError(
        friendlyErrorMessage(
          error,
          action === 'archive'
            ? 'Não foi possível arquivar agora.'
            : 'Não foi possível excluir agora.',
        ),
      );
    } finally {
      setPendingAction(null);
    }
  }

  function handleArchive() {
    confirmAction.request({
      title: 'Arquivar item?',
      description: `"${item.title}" será arquivado.`,
      confirmLabel: 'Arquivar',
      onConfirm: () => runAction('archive'),
    });
  }

  function handleDelete() {
    confirmAction.request({
      title: 'Excluir item?',
      description: `"${item.title}" será removido permanentemente.`,
      confirmLabel: 'Excluir',
      onConfirm: () => runAction('delete'),
    });
  }

  return (
    <Stack spacing={3}>
      <Typography variant="displaySmall" component="h1">
        Editar item
      </Typography>

      {/* `alignSelf` (not `mx: 'auto'`) — see the same note in `PlanEntryFormPage`. */}
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <LeisureItemForm
          formId={FORM_ID}
          defaultValues={mapLeisureItemToFormValues(item)}
          onSubmit={handleSubmit}
        />

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 1 }}
        >
          <Stack direction="row" spacing={1}>
            {item.status !== 'archived' ? (
              <KokyuButton
                variant="text"
                loading={pendingAction === 'archive'}
                disabled={isBusy}
                onClick={handleArchive}
              >
                Arquivar
              </KokyuButton>
            ) : null}
            <KokyuButton
              variant="text"
              color="error"
              loading={pendingAction === 'delete'}
              disabled={isBusy}
              onClick={handleDelete}
            >
              Excluir
            </KokyuButton>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <KokyuButton variant="text" onClick={() => router.push(detailHref)}>
              Cancelar
            </KokyuButton>
            <KokyuButton
              type="submit"
              form={FORM_ID}
              variant="contained"
              loading={isSubmitting}
              disabled={isBusy}
            >
              Salvar
            </KokyuButton>
          </Stack>
        </Stack>
      </Stack>

      <ConfirmActionDialog
        request={confirmAction.pending}
        onConfirm={confirmAction.confirm}
        onCancel={confirmAction.cancel}
      />
    </Stack>
  );
}
