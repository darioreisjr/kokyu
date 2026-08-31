'use client';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { themePalette } from '@/design-system/theme/useThemePalette';
import type { ScheduleInboxItem } from '@/shared/scheduling/types';
import { useScheduleInbox } from '../../hooks/useScheduleInbox';

export interface InboxViewProps {
  onScheduleItem?: (item: ScheduleInboxItem) => void;
}

export function InboxView({ onScheduleItem }: InboxViewProps) {
  const { items, isLoading, addItem, deleteItem, convertItem } = useScheduleInbox();

  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeItem, setActiveItem] = useState<ScheduleInboxItem | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await addItem({ title, note });
      setTitle('');
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, item: ScheduleInboxItem) => {
    setAnchorEl(event.currentTarget);
    setActiveItem(item);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveItem(null);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        Caixa de Entrada
      </Typography>
      <Typography
        variant="body2"
        sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, mb: 3 })}
      >
        Captura rápida de ideias, tarefas e lembretes para você organizar quando quiser.
      </Typography>

      {/* Quick capture form */}
      <Box
        component="form"
        onSubmit={handleAdd}
        sx={(theme) => ({
          p: 2.5,
          borderRadius: 2,
          backgroundColor: themePalette(theme).kokyu.surface.primary,
          border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
          mb: 4,
        })}
      >
        <Stack spacing={2}>
          <TextField
            label="Título da captura rápida"
            placeholder="O que está na sua cabeça? (ex: Ligar para o médico, Ler artigo...)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            size="small"
            required
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { 'aria-label': 'Título da captura rápida' },
            }}
          />

          <TextField
            label="Nota opcional"
            placeholder="Nota ou contexto opcional..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            size="small"
            multiline
            rows={2}
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: { 'aria-label': 'Nota opcional' },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || !title.trim()}
              startIcon={<AddRoundedIcon />}
              sx={{ textTransform: 'none', px: 3 }}
            >
              Capturar
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* Inbox Items List */}
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        Itens Capturados ({items.filter((i) => !i.processed).length})
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : items.length === 0 ? (
        <Typography
          variant="body2"
          sx={(theme) => ({
            color: themePalette(theme).kokyu.text.secondary,
            textAlign: 'center',
            py: 6,
          })}
        >
          Sua caixa de entrada está vazia. Capture itens rapidamente acima!
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={(theme) => ({
                p: 2,
                borderRadius: 2,
                backgroundColor: themePalette(theme).kokyu.surface.primary,
                border: `1px solid ${themePalette(theme).kokyu.border.subtle}`,
                opacity: item.processed ? 0.6 : 1,
              })}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      textDecoration: item.processed ? 'line-through' : 'none',
                    }}
                  >
                    {item.title}
                  </Typography>
                  {item.note && (
                    <Typography
                      variant="caption"
                      sx={(theme) => ({ color: themePalette(theme).kokyu.text.secondary, mt: 0.5, display: 'block' })}
                    >
                      {item.note}
                    </Typography>
                  )}
                </Box>

                <IconButton
                  size="small"
                  aria-label={`Opções para ${item.title}`}
                  onClick={(e) => handleOpenMenu(e, item)}
                >
                  <MoreVertRoundedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem
          onClick={async () => {
            if (activeItem) await convertItem(activeItem.id, 'mission');
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <AssignmentRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Criar missão</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={async () => {
            if (activeItem) await convertItem(activeItem.id, 'habit');
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <AutorenewRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Criar hábito</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={async () => {
            if (activeItem) await convertItem(activeItem.id, 'leisure');
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <MovieRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Guardar no Tempo Livre</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (activeItem) onScheduleItem?.(activeItem);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <ScheduleRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Agendar</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={async () => {
            if (activeItem) await deleteItem(activeItem.id);
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteOutlineRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
