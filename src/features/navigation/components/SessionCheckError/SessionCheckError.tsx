'use client';

import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { KokyuButton } from '@/design-system/components';
import { authService } from '@/features/auth';

/**
 * Rendered by `app/app/layout.tsx` in place of the authenticated shell
 * when `getCurrentUserServer()` comes back as `status: 'error'` — a
 * real Supabase session exists, but the backend's `/me` check itself
 * failed (network blip, backend down, a misconfigured
 * `NEXT_PUBLIC_API_URL`, ...). Deliberately never `redirect('/login')`
 * for this case (that used to be the bug): `proxy.ts` bounces any
 * *signed-in* visitor straight back off `/login` to `/app`, and `/app`
 * would hit this same failing check again — a genuine infinite
 * redirect loop (`ERR_TOO_MANY_REDIRECTS`), not a hypothetical one.
 * Rendering in place, with no navigation at all, cannot loop.
 *
 * No `CurrentUserContext` is available here (this renders instead of
 * the `CurrentUserProvider` that would normally wrap the shell), so
 * "Sair" calls `authService.signOut()` directly — the one action that
 * actually breaks the loop for good, since it removes the session
 * `proxy.ts`'s bounce-off-`/login` rule keys on.
 */
export function SessionCheckError() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  function handleRetry() {
    router.refresh();
  }

  function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    authService.signOut().finally(() => {
      router.push('/login');
    });
  }

  return (
    <Stack
      spacing={3}
      sx={{
        minHeight: '100dvh',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="displaySmall" component="h1">
        Não foi possível verificar sua sessão
      </Typography>
      <Alert severity="error" sx={{ maxWidth: 480 }}>
        Ocorreu um problema ao conectar com o Kokyu. Isso costuma ser temporário — tente novamente
        em instantes.
      </Alert>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <KokyuButton variant="contained" size="large" onClick={handleRetry}>
          Tentar novamente
        </KokyuButton>
        <KokyuButton
          variant="text"
          size="large"
          onClick={handleSignOut}
          loading={isSigningOut}
          loadingLabel="Saindo"
        >
          Sair
        </KokyuButton>
      </Stack>
    </Stack>
  );
}
