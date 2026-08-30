import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { profileTokens } from '@/design-system/tokens/component/profile';
import { inputTokens } from '@/design-system/tokens/component';

const fieldRowSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
  gap: 2.5,
} as const;

/**
 * Mirrors the real layout's shape (avatar, name, paired fields) so the
 * page never jumps between loading and loaded — same avatar size token
 * (`profileTokens.avatar.size.lg`) and input height token
 * (`inputTokens.height`) the real fields use, not independent guesses.
 */
export function ProfilePageSkeleton() {
  return (
    <Box
      data-testid="profile-skeleton"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: 'minmax(260px, 320px) 1fr' },
        gap: { xs: 5, lg: 6 },
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <Skeleton
          variant="circular"
          width={profileTokens.avatar.size.lg}
          height={profileTokens.avatar.size.lg}
        />
        <Skeleton variant="text" width={160} sx={{ fontSize: '1.5rem' }} />
        <Skeleton variant="text" width={110} />
      </Stack>

      <Stack spacing={3}>
        <Skeleton variant="text" width={140} sx={{ fontSize: '1.5rem' }} />
        <Box sx={fieldRowSx}>
          <Skeleton variant="rounded" height={inputTokens.height} />
          <Skeleton variant="rounded" height={inputTokens.height} />
        </Box>
        <Skeleton variant="rounded" height={inputTokens.height} />
        <Skeleton variant="rounded" height={88} />

        <Skeleton variant="text" width={220} sx={{ fontSize: '1.5rem' }} />
        <Box sx={fieldRowSx}>
          <Skeleton variant="rounded" height={inputTokens.height} />
          <Skeleton variant="rounded" height={inputTokens.height} />
        </Box>
      </Stack>
    </Box>
  );
}
