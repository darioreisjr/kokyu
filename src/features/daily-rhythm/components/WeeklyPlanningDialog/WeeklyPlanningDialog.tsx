'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { themePalette } from '@/design-system/theme/useThemePalette';

export interface WeeklyPlanningDialogProps {
  open: boolean;
  onClose: () => void;
  onPlanningComplete?: () => void;
}

export function WeeklyPlanningDialog({
  open,
  onClose,
  onPlanningComplete,
}: WeeklyPlanningDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="weekly-planning-title">
      <DialogTitle
        id="weekly-planning-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Planejar Semana
          </Typography>
          <Typography
            variant="caption"
            sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary })}
          >
            Alinhe seus compromissos, treinos, hábitos e metas para os próximos 7 dias.
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Visão Geral da Semana
        </Typography>
        <Typography
          variant="caption"
          sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, mb: 2, display: 'block' })}
        >
          Seus compromissos de Treinamento, Hábitos e Nutrição já estão sincronizados automaticamente.
        </Typography>
        <Typography variant="body2">
          A distribuição de carga está equilibrada em toda a semana!
        </Typography>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button variant="text" onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            onPlanningComplete?.();
            onClose();
          }}
          sx={{ textTransform: 'none' }}
        >
          Concluir Planejamento
        </Button>
      </DialogActions>
    </Dialog>
  );
}

