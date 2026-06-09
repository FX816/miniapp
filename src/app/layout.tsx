import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from 'sonner';
import { TelegramProvider } from '@/providers/telegram-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { BottomNav } from '@/components/layout/bottom-nav';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'cyrillic'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TG Market — Маркетплейс в Telegram',
  description: 'Премиальный маркетплейс в Telegram Mini App',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <TelegramProvider>
            <main className="mx-auto min-h-screen max-w-lg pb-20">
              {children}
            </main>
            <BottomNav />
            <Toaster position="top-center" richColors closeButton />
          </TelegramProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
