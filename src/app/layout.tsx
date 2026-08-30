import type { Metadata, Viewport } from 'next';

import { fontVariables } from '@/design-system/theme/fonts';

import { Providers } from './providers';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Kokyu',
    template: '%s · Kokyu',
  },
  description: 'Kokyu — respiração, disciplina e equilíbrio para organizar sua vida cotidiana.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'dark light',
  themeColor: '#0D0F16',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR" className={fontVariables} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
