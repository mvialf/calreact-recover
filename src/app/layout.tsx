// src/app/layout.tsx

'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FolderOpen,
  CalendarDays,
  Settings,
  Users,
  Loader2,
  DollarSign,
  LayoutDashboard,
  Wrench,
  Home,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { HeaderNav } from '@/components/ui/headernav';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Script from 'next/script';
import { cn } from '@/lib/utils';
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

const navItems = [
  { 
    href: '/dashboard', 
    icon: LayoutDashboard, 
    label: 'Panel Principal', 
    altPaths: ['/'] 
  },
  { 
    href: '/projects', 
    icon: FolderOpen, 
    label: 'Proyectos' 
  },
  { 
    href: '/calreact', 
    icon: CalendarDays, 
    label: 'Calendario' 
  },
  { 
    href: '/aftersales', 
    icon: Wrench, 
    label: 'Postventas' 
  },
  { 
    href: '/visits', 
    icon: Home, 
    label: 'Visitas' 
  },
  { 
    href: '/payments', 
    icon: DollarSign, 
    label: 'Pagos' 
  },
  { 
    href: '/clients', 
    icon: Users, 
    label: 'Clientes' 
  },
  { 
    href: '/settings', 
    icon: Settings, 
    label: 'Configuración' 
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
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
            console.error(`🚨 Error global capturado (${errorId}):`, error, errorInfo);
            
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
                <SidebarProvider>
                  <HeaderNav />
                  <div className="flex h-screen">
                    <Sidebar>
                  <div className="flex flex-col h-full">
                    <div className="p-4">
                      <Link 
                        href="/" 
                        className="flex items-center gap-2" 
                        title="CalReact Home"
                      >
                        <CalendarDays className="h-7 w-7 text-primary flex-shrink-0" />
                        <h2 className="text-2xl font-bold text-primary">
                          CalReact
                        </h2>
                      </Link>
                    </div>
                    
                    <nav className="flex-1 px-4">
                      <ul className="space-y-2">
                        {navItems.map((item) => {
                          const isActive =
                            pathname === item.href ||
                            (item.href !== '/' && pathname?.startsWith(item.href)) ||
                            (item.altPaths && item.altPaths.includes(pathname));
                          
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className={cn(
                                  'flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                                  isActive && 'bg-accent text-accent-foreground'
                                )}
                              >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
                    
                    <div className="p-4 mt-auto">
                      <p className="text-xs text-muted-foreground">
                        &copy; 2025 CalReact App
                      </p>
                    </div>
                  </div>
                </Sidebar>
                
                <main className="flex-1">
                  <div className="p-4 sm:p-6 lg:p-8 h-full lg:mt-16">
                    {children}
                  </div>
                </main>
                  </div>
                </SidebarProvider>
              <Toaster />
              <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`}
                strategy="beforeInteractive"
              />
              <Script id="google-maps-init">
                {`
                  window.initGoogleMaps = function() {
                    window.googleMapsLoaded = true;
                  };
                `}
              </Script>
              </AppConfigProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}