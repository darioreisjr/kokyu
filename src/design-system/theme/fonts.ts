import { Inter, Manrope } from 'next/font/google';

/** Body copy, form fields and UI chrome. */
export const kokyuSans = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-kokyu-sans',
  display: 'swap',
});

/** Display headings and the Kokyu wordmark — geometric and bold. */
export const kokyuDisplay = Manrope({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-kokyu-display',
  display: 'swap',
});

export const fontVariables = `${kokyuSans.variable} ${kokyuDisplay.variable}`;
