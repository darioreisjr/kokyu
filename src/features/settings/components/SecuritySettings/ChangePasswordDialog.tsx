'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { KokyuButton, KokyuPasswordField } from '@/design-system/components';
import { PasswordRequirements, PasswordStrength } from '@/features/auth';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';

import {
  changePasswordDefaultValues,
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '../../schemas/changePasswordSchema';
import { securityService } from '../../services/securityService';

export interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Reuses the exact same password field, strength meter, requirements
 * checklist and policy as account creation — the only thing new here
 * is the "senha atual" field and the (mocked) submit. `securityService`
 * is the one place that mock lives; this component only reacts to
 * its result.
 */
export function ChangePasswordDialog({ open, onClose }: ChangePasswordDialogProps) {
  const { showSuccess, showError } = useSnackbar();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: changePasswordDefaultValues,
    mode: 'onBlur',
  });

  const newPasswordValue = useWatch({ control, name: 'newPassword' }) ?? '';

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => reset(changePasswordDefaultValues));
    }
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const result = await securityService.changePassword(values.currentPassword, values.newPassword);
    if (result.success) {
      showSuccess('Senha alterada.');
      onClose();
    } else {
      showError(result.error ?? 'Não foi possível alterar sua senha agora.');
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="change-password-title"
    >
      <DialogTitle id="change-password-title">Alterar senha</DialogTitle>
      <form onSubmit={onSubmit} noValidate>
        <DialogContent>
          <Stack spacing={2.5}>
            <KokyuPasswordField
              label="Senha atual"
              autoComplete="current-password"
              error={Boolean(errors.currentPassword)}
              helperText={errors.currentPassword?.message}
              {...register('currentPassword')}
            />
            <Stack spacing={1.5}>
              <KokyuPasswordField
                label="Nova senha"
                autoComplete="new-password"
                error={Boolean(errors.newPassword)}
                helperText={errors.newPassword?.message}
                {...register('newPassword')}
              />
              <PasswordStrength password={newPasswordValue} />
              <PasswordRequirements password={newPasswordValue} />
            </Stack>
            <KokyuPasswordField
              label="Confirmar nova senha"
              autoComplete="new-password"
              error={Boolean(errors.confirmNewPassword)}
              helperText={errors.confirmNewPassword?.message}
              {...register('confirmNewPassword')}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <KokyuButton type="button" variant="text" onClick={onClose}>
            Cancelar
          </KokyuButton>
          <KokyuButton type="submit" variant="contained" loading={isSubmitting}>
            Alterar senha
          </KokyuButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
