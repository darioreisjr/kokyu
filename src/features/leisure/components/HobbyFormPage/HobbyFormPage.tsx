'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';
import { friendlyErrorMessage } from '@/lib/api/errors';

import { leisureRoutes } from '../../constants/leisureRoutes';
import type { LeisureItemFormValues } from '../../schemas/leisureItemSchema';
import { leisureItemService } from '../../services/leisureItemService';
import { mapFormValuesToLeisureItemInput } from '../../utils/leisureItemFormMapper';
import { LeisureItemForm } from '../LeisureItemForm/LeisureItemForm';

const FORM_ID = 'hobby-form';

/**
 * `/app/tempo-livre/hobbies/novo` — Hobbies' "Adicionar" as a full page
 * rather than `LeisureItemDialog`'s modal (the other Tempo Livre add/edit
 * flows keep the modal). Same `LeisureItemForm`, type locked to hobby.
 */
export function HobbyFormPage() {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(values: LeisureItemFormValues) {
    setIsSubmitting(true);
    try {
      await leisureItemService.createLeisureItem(mapFormValuesToLeisureItemInput(values));
      showSuccess('Hobby salvo.');
      router.push(leisureRoutes.hobbies);
    } catch (error) {
      // Stays on the page with everything typed, so it can be fixed and resent.
      showError(friendlyErrorMessage(error, 'Não foi possível salvar o hobby agora.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Stack spacing={3}>
      <Typography variant="displaySmall" component="h1">
        Novo hobby
      </Typography>

      {/* `alignSelf` (not `mx: 'auto'`) — see the same note in `PlanEntryFormPage`. */}
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 560, alignSelf: 'center' }}>
        <LeisureItemForm formId={FORM_ID} lockedType="hobby" onSubmit={handleSubmit} />

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <KokyuButton variant="text" onClick={() => router.push(leisureRoutes.hobbies)}>
            Cancelar
          </KokyuButton>
          <KokyuButton type="submit" form={FORM_ID} variant="contained" loading={isSubmitting}>
            Salvar
          </KokyuButton>
        </Stack>
      </Stack>
    </Stack>
  );
}
