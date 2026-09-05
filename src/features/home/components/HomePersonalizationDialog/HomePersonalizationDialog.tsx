'use client';

import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SettingsToggle } from '@/features/settings';
import {
  HOME_ESSENTIAL_SECTIONS,
  HOME_SECTION_LABELS,
  type HomeSectionId,
} from '@/shared/home/types';

export interface HomePersonalizationValue {
  sectionOrder: HomeSectionId[];
  hiddenSections: HomeSectionId[];
  compactMode: boolean;
  showGreeting: boolean;
  showCapacity: boolean;
  showInsights: boolean;
}

export interface HomePersonalizationDialogProps {
  open: boolean;
  onClose: () => void;
  value: HomePersonalizationValue;
  onChange: (patch: Partial<HomePersonalizationValue>) => void;
}

/**
 * "Personalizar Respiração" — show/hide and reorder sections, persisted
 * immediately through `preferences.home` (same autosave convention every
 * Settings control already uses, no separate "Salvar" step — reuses
 * `SettingsToggle` for the same reason). "Agora"/"Próximo" stay pinned
 * and can't be hidden — see spec's "NÃO PERMITIR REMOVER AGORA".
 */
export function HomePersonalizationDialog({ open, onClose, value, onChange }: HomePersonalizationDialogProps) {
  const reorderableSections = value.sectionOrder.filter(
    (id) => !HOME_ESSENTIAL_SECTIONS.includes(id),
  );

  function moveSection(id: HomeSectionId, direction: -1 | 1) {
    const index = reorderableSections.indexOf(id);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= reorderableSections.length) return;

    const reordered = [...reorderableSections];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex]!, reordered[index]!];
    onChange({ sectionOrder: [...HOME_ESSENTIAL_SECTIONS, ...reordered] });
  }

  function toggleHidden(id: HomeSectionId) {
    const isHidden = value.hiddenSections.includes(id);
    onChange({
      hiddenSections: isHidden
        ? value.hiddenSections.filter((section) => section !== id)
        : [...value.hiddenSections, id],
    });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="home-personalization-title">
      <DialogTitle
        id="home-personalization-title"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        Personalizar Respiração
        <IconButton size="small" onClick={onClose} aria-label="Fechar">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="labelMedium" component="p" sx={{ mb: 1 }}>
          Seções
        </Typography>
        <List disablePadding>
          {reorderableSections.map((id, index) => (
            <ListItem
              key={id}
              disableGutters
              secondaryAction={
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <IconButton
                    size="small"
                    aria-label={`Mover ${HOME_SECTION_LABELS[id]} para cima`}
                    disabled={index === 0}
                    onClick={() => moveSection(id, -1)}
                  >
                    <ArrowUpwardRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label={`Mover ${HOME_SECTION_LABELS[id]} para baixo`}
                    disabled={index === reorderableSections.length - 1}
                    onClick={() => moveSection(id, 1)}
                  >
                    <ArrowDownwardRoundedIcon fontSize="small" />
                  </IconButton>
                  <SettingsToggle
                    size="small"
                    label={`Mostrar seção ${HOME_SECTION_LABELS[id]}`}
                    checked={!value.hiddenSections.includes(id)}
                    onChange={() => toggleHidden(id)}
                  />
                </Stack>
              }
            >
              <ListItemText primary={HOME_SECTION_LABELS[id]} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.5}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <ListItemText primary="Modo compacto" />
            <SettingsToggle
              label="Modo compacto"
              checked={value.compactMode}
              onChange={(checked) => onChange({ compactMode: checked })}
            />
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <ListItemText primary="Mostrar saudação" />
            <SettingsToggle
              label="Mostrar saudação"
              checked={value.showGreeting}
              onChange={(checked) => onChange({ showGreeting: checked })}
            />
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <ListItemText primary="Mostrar capacidade do dia" />
            <SettingsToggle
              label="Mostrar capacidade do dia"
              checked={value.showCapacity}
              onChange={(checked) => onChange({ showCapacity: checked })}
            />
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <ListItemText primary="Mostrar insights" />
            <SettingsToggle
              label="Mostrar insights"
              checked={value.showInsights}
              onChange={(checked) => onChange({ showInsights: checked })}
            />
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
