import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

/** Mirrors `TodayPage`'s real layout (date row, summary row, 6 meal cards) so the loading state doesn't jump when data arrives. */
export function TodayPageSkeleton() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Skeleton variant="text" width={220} height={28} />
        <Skeleton variant="text" width={260} height={36} />
      </Stack>
      <Stack direction="row" spacing={4}>
        <Skeleton variant="text" width={140} height={44} />
        <Skeleton variant="text" width={140} height={44} />
        <Skeleton variant="text" width={140} height={44} />
      </Stack>
      <Stack spacing={2}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} variant="rounded" height={76} />
        ))}
      </Stack>
    </Stack>
  );
}
