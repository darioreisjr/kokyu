'use client';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { themePalette } from '@/design-system/theme/useThemePalette';
import type { Mission } from '../../types';
import { MissionCard } from '../MissionCard/MissionCard';

export interface MissionEisenhowerProps {
  missions: Mission[];
  getProjectName: (id: string) => string;
}

interface Quadrant {
  key: string;
  title: string;
  filter: (mission: Mission) => boolean;
}

const QUADRANTS: Quadrant[] = [
  {
    key: 'urgent-important',
    title: 'Importante e urgente',
    filter: (m) => m.importance === 'high' && (m.priority === 'high' || m.priority === 'critical'),
  },
  {
    key: 'important-not-urgent',
    title: 'Importante, não urgente',
    filter: (m) => m.importance === 'high' && m.priority !== 'high' && m.priority !== 'critical',
  },
  {
    key: 'urgent-not-important',
    title: 'Urgente, não importante',
    filter: (m) => m.importance !== 'high' && (m.priority === 'high' || m.priority === 'critical'),
  },
  {
    key: 'neither',
    title: 'Nem urgente nem importante',
    filter: (m) => m.importance !== 'high' && m.priority !== 'high' && m.priority !== 'critical',
  },
];

/**
 * A mission with no `importance` still classifies fine (spec "NÃO FORÇAR EISENHOWER") — it just
 * lands on the urgency-only quadrants. Desktop renders 2x2 via `Grid`; mobile stacks vertically
 * because each quadrant is already `size={{ xs: 12 }}`.
 */
export function MissionEisenhower({ missions, getProjectName }: MissionEisenhowerProps) {
  const classifiable = missions.filter((m) => m.status !== 'completed' && m.status !== 'cancelled' && m.status !== 'archived');

  return (
    <Grid container spacing={2}>
      {QUADRANTS.map((quadrant) => {
        const items = classifiable.filter(quadrant.filter);
        return (
          <Grid key={quadrant.key} size={{ xs: 12, md: 6 }}>
            <Stack
              component="section"
              aria-labelledby={`eisenhower-${quadrant.key}`}
              spacing={1.5}
              sx={(theme) => ({
                p: 2,
                borderRadius: 3,
                border: `1px solid ${themePalette(theme).kokyu.border.default}`,
                minHeight: 160,
              })}
            >
              <Typography id={`eisenhower-${quadrant.key}`} component="h3" variant="subtitle1" sx={{ fontWeight: 600 }}>
                {quadrant.title}
              </Typography>
              {items.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nada por aqui.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {items.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      projectName={mission.projectId ? getProjectName(mission.projectId) : undefined}
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </Grid>
        );
      })}
    </Grid>
  );
}
