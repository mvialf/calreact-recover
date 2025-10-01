"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/ui/sidebar';
import { NAV_ITEMS, type NavItem } from '@/constants/navigation';

/**
 * AppSidebar - Componente de navegación lateral de la aplicación
 *
 * Responsabilidades:
 * - Renderizar logo de la aplicación
 * - Mostrar items de navegación con estado activo
 * - Footer con información de copyright
 *
 * Beneficios de extracción:
 * - Testeable de forma aislada
 * - Reutilizable en diferentes layouts si se necesita
 * - Más fácil de mantener (70 líneas vs inline en layout)
 */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
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

        {/* Navigation Section */}
        <nav className="flex-1 px-4 pt-4">
          <ul className="space-y-2">
            {NAV_ITEMS.map((item: NavItem) => {
              // Calcular si la ruta está activa
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname?.startsWith(item.href)) ||
                (item.altPaths && pathname && item.altPaths.includes(pathname));

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

        {/* Footer Section */}
        <div className="p-4 mt-auto">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 CalReact App
          </p>
        </div>
      </div>
    </Sidebar>
  );
}