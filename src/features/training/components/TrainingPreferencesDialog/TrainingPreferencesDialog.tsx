'use client';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { KokyuButton, KokyuTextField } from '@/design-system/components';

import { useTrainingLocations } from '../../hooks/useTrainingLocations';
import { useTrainingPreferences } from '../../hooks/useTrainingPreferences';
import type { E1RMFormula, TrainingLevel, TrainingObjective, WeightUnit } from '../../types';

export interface TrainingPreferencesDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Autosaves on every change, same convention as Configurações's own `SettingsSection`. No confirm/cancel step. */
export function TrainingPreferencesDialog({ open, onClose }: TrainingPreferencesDialogProps) {
  const { preferences, updatePreferences } = useTrainingPreferences();
  const { locations } = useTrainingLocations();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="training-preferences-title"
    >
      <DialogTitle id="training-preferences-title">Preferências de treino</DialogTitle>
      <DialogContent>
        {!preferences ? (
          <Skeleton variant="rounded" height={300} />
        ) : (
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Stack spacing={1.5}>
              <Typography variant="labelLarge">Perfil</Typography>
              <FormControl size="small" fullWidth>
                <InputLabel id="pref-level-label">Nível</InputLabel>
                <Select
                  labelId="pref-level-label"
                  label="Nível"
                  value={preferences.level ?? ''}
                  onChange={(event) =>
                    updatePreferences({ level: event.target.value as TrainingLevel })
                  }
                >
                  <MenuItem value="beginner">Iniciante</MenuItem>
                  <MenuItem value="intermediate">Intermediário</MenuItem>
                  <MenuItem value="advanced">Avançado</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel id="pref-objective-label">Objetivo principal</InputLabel>
                <Select
                  labelId="pref-objective-label"
                  label="Objetivo principal"
                  value={preferences.primaryObjective ?? ''}
                  onChange={(event) =>
                    updatePreferences({ primaryObjective: event.target.value as TrainingObjective })
                  }
                >
                  <MenuItem value="strength">Força</MenuItem>
                  <MenuItem value="hypertrophy">Hipertrofia</MenuItem>
                  <MenuItem value="conditioning">Condicionamento</MenuItem>
                  <MenuItem value="muscularEndurance">Resistência muscular</MenuItem>
                  <MenuItem value="general">Geral</MenuItem>
                  <MenuItem value="custom">Personalizado</MenuItem>
                </Select>
              </FormControl>
              <KokyuTextField
                label="Treinos por semana"
                type="number"
                size="small"
                value={preferences.sessionsPerWeek ?? ''}
                onChange={(event) =>
                  updatePreferences({ sessionsPerWeek: Number(event.target.value) })
                }
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="labelLarge">Execução</Typography>
              <FormControl size="small" fullWidth>
                <InputLabel id="pref-unit-label">Unidade de peso</InputLabel>
                <Select
                  labelId="pref-unit-label"
                  label="Unidade de peso"
                  value={preferences.weightUnit}
                  onChange={(event) =>
                    updatePreferences({ weightUnit: event.target.value as WeightUnit })
                  }
                >
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="lb">lb</MenuItem>
                </Select>
              </FormControl>
              <KokyuTextField
                label="Descanso padrão (s)"
                type="number"
                size="small"
                value={preferences.defaultRestSeconds}
                onChange={(event) =>
                  updatePreferences({ defaultRestSeconds: Number(event.target.value) })
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.showRpeRir}
                    onChange={(event) => updatePreferences({ showRpeRir: event.target.checked })}
                  />
                }
                label="Mostrar RPE/RIR"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.showPreviousValues}
                    onChange={(event) =>
                      updatePreferences({ showPreviousValues: event.target.checked })
                    }
                  />
                }
                label="Mostrar valores anteriores"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.autoStartRestTimer}
                    onChange={(event) =>
                      updatePreferences({ autoStartRestTimer: event.target.checked })
                    }
                  />
                }
                label="Iniciar descanso automaticamente"
              />
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="labelLarge">Equipamento</Typography>
              <KokyuTextField
                label="Peso da barra (kg)"
                type="number"
                size="small"
                value={preferences.defaultBarWeightKg}
                onChange={(event) =>
                  updatePreferences({ defaultBarWeightKg: Number(event.target.value) })
                }
              />
              <KokyuTextField
                label="Anilhas disponíveis (kg, separadas por vírgula)"
                size="small"
                defaultValue={preferences.availablePlatesKg.join(', ')}
                onBlur={(event) =>
                  updatePreferences({
                    availablePlatesKg: event.target.value
                      .split(',')
                      .map((value) => Number(value.trim()))
                      .filter((value) => !Number.isNaN(value) && value > 0),
                  })
                }
              />
              <FormControl size="small" fullWidth>
                <InputLabel id="pref-location-label">Local padrão</InputLabel>
                <Select
                  labelId="pref-location-label"
                  label="Local padrão"
                  value={preferences.defaultLocationId ?? ''}
                  onChange={(event) =>
                    updatePreferences({ defaultLocationId: event.target.value || undefined })
                  }
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {locations.map((location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack spacing={1.5}>
              <Typography variant="labelLarge">Cálculos</Typography>
              <FormControl size="small" fullWidth>
                <InputLabel id="pref-e1rm-label">Fórmula de 1RM estimado</InputLabel>
                <Select
                  labelId="pref-e1rm-label"
                  label="Fórmula de 1RM estimado"
                  value={preferences.e1rmFormula}
                  onChange={(event) =>
                    updatePreferences({ e1rmFormula: event.target.value as E1RMFormula })
                  }
                >
                  <MenuItem value="epley">Epley</MenuItem>
                  <MenuItem value="brzycki">Brzycki</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <KokyuButton variant="contained" onClick={onClose}>
          Fechar
        </KokyuButton>
      </DialogActions>
    </Dialog>
  );
}
