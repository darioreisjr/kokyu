'use client';

import { useState } from 'react';
import type { MouseEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';

import { themePalette } from '@/design-system/theme/useThemePalette';
import type { Mission, MissionSection } from '../../types';
import { MissionCard } from '../MissionCard/MissionCard';

export interface MissionBoardProps {
  sections: MissionSection[];
  missions: Mission[];
  onMoveToSection: (missionId: string, sectionId: string) => void;
}

/**
 * No drag-and-drop library exists yet in Kokyu (see architecture research) — moving cards always
 * goes through the "Mover para" menu here, which doubles as the required non-drag alternative
 * (spec "DRAG AND DROP: Sempre alternativa por menu."). Horizontal scroll on mobile; `List` stays
 * the other alternative view (spec "MOBILE BOARD").
 */
export function MissionBoard({ sections, missions, onMoveToSection }: MissionBoardProps) {
  const [menuState, setMenuState] = useState<{ anchor: HTMLElement; missionId: string } | null>(null);

  function openMenu(event: MouseEvent<HTMLElement>, missionId: string) {
    setMenuState({ anchor: event.currentTarget, missionId });
  }

  function closeMenu() {
    setMenuState(null);
  }

  function handleMove(sectionId: string) {
    if (menuState) onMoveToSection(menuState.missionId, sectionId);
    closeMenu();
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
      {sections.map((section) => {
        const sectionMissions = missions.filter((mission) => mission.sectionId === section.id);
        return (
          <Stack
            key={section.id}
            spacing={1.5}
            sx={(theme) => ({
              minWidth: 280,
              flexShrink: 0,
              p: 1.5,
              borderRadius: 3,
              backgroundColor: themePalette(theme).kokyu.surface.secondary,
            })}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {section.name} ({sectionMissions.length})
            </Typography>

            <Stack spacing={1}>
              {sectionMissions.map((mission) => (
                <Box key={mission.id} sx={{ position: 'relative' }}>
                  <MissionCard mission={mission} />
                  <IconButton
                    size="small"
                    onClick={(event) => openMenu(event, mission.id)}
                    aria-label={`Mover "${mission.title}" para outra seção`}
                    sx={{ position: 'absolute', top: 4, right: 4 }}
                  >
                    <MoreVertRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Stack>
        );
      })}

      <Menu anchorEl={menuState?.anchor} open={!!menuState} onClose={closeMenu}>
        {sections.map((section) => (
          <MenuItem key={section.id} onClick={() => handleMove(section.id)}>
            Mover para {section.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
