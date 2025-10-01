// src/app/layout.tsx

'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { utilityLogger } from '@/lib/logger';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppConfigProvider } from '@/contexts/AppConfigContext';
import { GlobalErrorBoundary } from '@/components/error-boundary/GlobalErrorBoundary';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/*
// Metadata should be defined in a server component or RSC payload
export const metadata: Metadata = {
  title: 'CalReact - Calendario Avanzado',
  description: 'Una aplicación de calendario moderna inspirada en Bryntum, construida con Next.js y TypeScript.',
};
*/


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <div className="flex flex-col h-screen items-center justify-center bg-background text-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Cargando aplicación...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <GlobalErrorBoundary
          onError={(error, errorInfo, errorId) => {
            utilityLogger.error(`Error global capturado (${errorId})`, { error, errorInfo });
            
            // Aquí podrías enviar el error a un servicio de logging como Sentry
            // if (process.env.NODE_ENV === 'production') {
            //   Sentry.captureException(error, { extra: { errorInfo, errorId } });
            // }
          }}
        >
          <QueryClientProvider client={queryClient}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <AppConfigProvider>
                {children}
                <Toaster />
              </AppConfigProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}