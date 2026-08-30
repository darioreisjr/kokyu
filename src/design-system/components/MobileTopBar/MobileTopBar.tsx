import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import { navigationTokens } from '../../tokens/component/navigation';
import { darkColorTokens } from '../../tokens/semantic/colors';
import { KokyuLogo } from '../KokyuLogo/KokyuLogo';

export interface MobileTopBarProps {
  /** Current page's name, shown next to the mark. */
  title?: string;
  onMenuClick: () => void;
}

/**
 * Mobile-only chrome — replaces `Sidebar` below the `md` breakpoint.
 * Fixed to the dark brand surface like `Sidebar`, for the same reason
 * (`darkColorTokens`, not a theme callback).
 */
export function MobileTopBar({ title, onMenuClick }: MobileTopBarProps) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: darkColorTokens.background.default,
        borderBottom: `1px solid ${darkColorTokens.border.subtle}`,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <Toolbar sx={{ minHeight: navigationTokens.topBar.height, gap: 1.5 }}>
        <IconButton
          onClick={onMenuClick}
          aria-label="Abrir menu"
          edge="start"
          sx={{
            color: darkColorTokens.icon.primary,
            '&:focus-visible': {
              outline: `2px solid ${darkColorTokens.border.focus}`,
              outlineOffset: '2px',
            },
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
        <KokyuLogo size="sm" markOnly />
        {title ? (
          <Typography
            variant="labelLarge"
            component="p"
            noWrap
            sx={{ color: darkColorTokens.text.primary }}
          >
            {title}
          </Typography>
        ) : null}
      </Toolbar>
    </AppBar>
  );
}
