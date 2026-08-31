'use client';

import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ScheduleConflict } from '@/shared/scheduling/types';

export interface ConflictBannerProps {
  conflicts: ScheduleConflict[];
  onResolve?: (conflictId: string, resolution: any) => void;
}

export function ConflictBanner({ conflicts, onResolve }: ConflictBannerProps) {
  if (conflicts.length === 0) return null;

  return (
    <Stack spacing={1.5} sx={{ mb: 3 }}>
      {conflicts.map((conflict) => {
        const isError = conflict.severity === 'error';

        return (
          <Alert
            key={conflict.id}
            severity={isError ? 'error' : 'warning'}
            icon={isError ? <ErrorOutlineRoundedIcon /> : <WarningAmberRoundedIcon />}
            sx={{ borderRadius: 2 }}
          >
            <AlertTitle sx={{ fontWeight: 700 }}>
              {isError ? 'Conflito Crítico na Agenda' : 'Aviso de Agendamento'}
            </AlertTitle>

            <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
              {conflict.message}
            </Typography>

            {conflict.suggestedResolutions && conflict.suggestedResolutions.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  flexWrap: 'wrap',
                  gap: 1,
                  mt: 1,
                }}
              >
                {conflict.suggestedResolutions.map((res, idx) => (
                  <Button
                    key={idx}
                    size="small"
                    variant={res.action === 'ignore' ? 'text' : 'outlined'}
                    color={isError ? 'error' : 'warning'}
                    onClick={() => onResolve?.(conflict.id, res)}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}
                  >
                    {res.label}
                  </Button>
                ))}
              </Stack>
            )}
          </Alert>
        );
      })}
    </Stack>
  );
}

