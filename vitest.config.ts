import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/font/google': path.resolve(__dirname, './test/mocks/nextFontMock.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./test/setup.ts'],
    css: true,
    // The default 5000ms is occasionally too tight for DatePicker
    // paste-interaction tests under v8 coverage instrumentation with a
    // full, growing suite running in parallel (CreateAccountForm's
    // birth-date tests in particular) — not a sign anything hangs,
    // just real work under real overhead. Raised again (10000 -> 20000)
    // once the Nutrição feature's test files pushed the full suite's
    // parallel thread contention past what 10000ms reliably covered,
    // and again (20000 -> 30000) once Tempo Livre pushed the suite
    // past ~1000 tests.
    testTimeout: 30000,
    exclude: ['**/node_modules/**', '**/e2e/**', '**/.next/**', '**/storybook-static/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.d.ts',
        'src/app/**',
        'src/design-system/theme/fonts.ts',
        // Wired to Next's App Router request lifecycle (AppRouterCacheProvider);
        // exercised by Playwright against the running app, not meaningful to
        // unit-render in isolation.
        'src/design-system/providers/**',
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
