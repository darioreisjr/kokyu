'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { useSnackbar } from '@/design-system/providers/SnackbarProvider';

import { usePreferences } from '../../providers/PreferencesProvider';
import { exportUserData } from '../../services/exportService';
import { SettingsGroup } from '../SettingsGroup/SettingsGroup';
import { SettingsRow } from '../SettingsRow/SettingsRow';
import { SettingsSection } from '../SettingsSection/SettingsSection';

/** Settings → Dados: exporting what's genuinely stored, and reverting it. */
export function DataSettings() {
  const { preferences, resetPreferences } = usePreferences();
  const { showSuccess, showError } = useSnackbar();
  const [isExporting, setIsExporting] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);

  async function handleExport() {
    setIsExporting(true);
    try {
      await exportUserData(preferences);
      showSuccess('Seus dados foram exportados.');
    } catch {
      showError('Não foi possível exportar seus dados agora.');
    } finally {
      setIsExporting(false);
    }
  }

  function handleRestore() {
    resetPreferences();
    setRestoreOpen(false);
    showSuccess('Configurações restauradas.');
  }

  return (
    <SettingsSection
      title="Dados"
      description="Exporte o que o Kokyu guarda sobre você, ou volte ao começo."
    >
      <SettingsGroup>
        <SettingsRow
          anchorId="setting-dados-exportar"
          title="Exportar meus dados"
          description="Baixa um arquivo JSON com seu perfil e suas preferências. Nunca inclui senha ou dados de sessão."
          control={
            <KokyuButton
              variant="outlined"
              size="small"
              loading={isExporting}
              onClick={handleExport}
            >
              Exportar
            </KokyuButton>
          }
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          anchorId="setting-dados-restaurar"
          title="Restaurar configurações"
          description="Volta aparência, navegação e comportamento aos valores padrão do Kokyu."
          control={
            <KokyuButton variant="outlined" size="small" onClick={() => setRestoreOpen(true)}>
              Restaurar
            </KokyuButton>
          }
        />
      </SettingsGroup>

      <Dialog
        open={restoreOpen}
        onClose={() => setRestoreOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="restore-settings-title"
      >
        <DialogTitle id="restore-settings-title">Restaurar configurações?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Aparência, navegação e comportamento voltam aos valores padrão do Kokyu. Seu perfil não
            é afetado.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <KokyuButton type="button" variant="text" onClick={() => setRestoreOpen(false)}>
            Cancelar
          </KokyuButton>
          <KokyuButton type="button" variant="contained" onClick={handleRestore}>
            Restaurar
          </KokyuButton>
        </DialogActions>
      </Dialog>
    </SettingsSection>
  );
}
