'use client';

import { useMemo, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import NextLink from 'next/link';

import { EmptyState, KokyuButton } from '@/design-system/components';
import {
  defaultHabitFilterState,
  type HabitFilterState,
} from '../../constants/habitFilters';
import { habitRoutes } from '../../constants/habitRoutes';
import { useHabits } from '../../hooks/useHabits';
import { deriveHabitOccurrence } from '../../services/engines/habitOccurrenceService';
import { isHabitScheduledOnDate } from '../../services/engines/habitScheduleEngine';
import { HabitCard } from '../HabitCard/HabitCard';
import { HabitFiltersBar } from '../HabitFiltersBar/HabitFiltersBar';
import { HabitRow } from '../HabitRow/HabitRow';

export function AllHabitsPage() {
  const { habits, isLoading } = useHabits();
  const [filters, setFilters] = useState<HabitFilterState>(defaultHabitFilterState);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const today = new Date().toISOString().split('T')[0]!;

  const filteredHabits = useMemo(() => {
    let result = habits.filter((h) => h.status !== 'archived');

    // Search query
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          (h.description && h.description.toLowerCase().includes(q)) ||
          h.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    // Area filter
    if (filters.area !== 'all') {
      result = result.filter((h) => h.area === filters.area);
    }

    // Quick filter
    if (filters.quickFilter === 'today') {
      result = result.filter((h) => isHabitScheduledOnDate(h, today));
    } else if (filters.quickFilter === 'morning') {
      result = result.filter((h) => h.timeOfDay === 'morning');
    } else if (filters.quickFilter === 'automatic') {
      result = result.filter((h) => h.source !== 'manual');
    } else if (filters.quickFilter === 'paused') {
      result = result.filter((h) => h.status === 'paused');
    } else if (filters.quickFilter === 'reduce') {
      result = result.filter((h) => h.direction === 'reduce');
    }

    // Sorting
    if (filters.sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'recent') {
      result = [...result].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return result;
  }, [habits, filters, today]);

  const handleFilterChange = (patch: Partial<HabitFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Todos os Hábitos
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie, filtre e visualize todos os seus hábitos ativos, pausados e automáticos.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Tooltip title="Visualização em cards">
              <IconButton
                onClick={() => setViewMode('cards')}
                color={viewMode === 'cards' ? 'primary' : 'default'}
                aria-label="Modo cards"
              >
                <GridViewRoundedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Visualização em lista">
              <IconButton
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
                aria-label="Modo lista"
              >
                <ViewListRoundedIcon />
              </IconButton>
            </Tooltip>

            <KokyuButton
              component={NextLink}
              href={habitRoutes.new}
              variant="contained"
              startIcon={<AddRoundedIcon />}
            >
              Novo hábito
            </KokyuButton>
          </Stack>
        </Stack>

        {/* Filters */}
        <HabitFiltersBar filters={filters} onChange={handleFilterChange} />

        {/* List / Cards */}
        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Stack>
        ) : filteredHabits.length === 0 ? (
          <EmptyState
            icon={AutorenewRoundedIcon}
            title="Nenhum hábito encontrado"
            description="Você ainda não criou hábitos com os filtros selecionados."
            action={
              <KokyuButton
                component={NextLink}
                href={habitRoutes.new}
                variant="contained"
              >
                Criar primeiro hábito
              </KokyuButton>
            }
          />
        ) : viewMode === 'cards' ? (
          <Grid container spacing={2}>
            {filteredHabits.map((habit) => {
              const occ = deriveHabitOccurrence(habit, today, [], today);
              return (
                <Grid key={habit.id} size={{ xs: 12, md: 6, lg: 4 }}>
                  <HabitCard occurrence={occ} />
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Stack spacing={1.5}>
            {filteredHabits.map((habit) => {
              const occ = deriveHabitOccurrence(habit, today, [], today);
              return <HabitRow key={habit.id} occurrence={occ} />;
            })}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
