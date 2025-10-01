"use client"

import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { PageHeader, type BreadcrumbItem } from './PageHeader';
import { HeaderNav } from '@/components/ui/headernav';
import type { LucideIcon } from 'lucide-react';

/**
 * AppLayout Props Interface
 */
export interface AppLayoutProps {
  /** Contenido principal de la página */
  children: React.ReactNode;
  /** Título de la página */
  pageTitle?: string;
  /** Descripción opcional de la página */
  pageDescription?: string;
  /** Icono opcional para el título */
  pageIcon?: LucideIcon;
  /** Breadcrumbs de navegación */
  breadcrumbs?: BreadcrumbItem[];
  /** Acciones personalizadas en el header (botones, switches, etc.) */
  headerActions?: React.ReactNode;
}

/**
 * AppLayout - Layout principal modular de la aplicación
 *
 * Arquitectura:
 * - HeaderNav (fixed top)
 * - AppSidebar (navegación lateral)
 * - PageHeader (título + breadcrumbs + actions)
 * - Main content (children)
 *
 * Beneficios sobre layout monolítico:
 * - 40 líneas vs 172 en layout original (-77% complejidad)
 * - Componentes testeables independientemente
 * - Fácil agregar features (breadcrumbs, actions) sin tocar layout core
 * - Single Responsibility: solo composición de estructura
 *
 * Uso:
 * ```tsx
 * <AppLayout
 *   pageTitle="Proyectos"
 *   pageDescription="Gestión de proyectos"
 *   breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Proyectos' }]}
 *   headerActions={<Button>Nueva</Button>}
 * >
 *   <YourPageContent />
 * </AppLayout>
 * ```
 */
export function AppLayout({
  children,
  pageTitle,
  pageDescription,
  pageIcon,
  breadcrumbs,
  headerActions
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header - Full width fixed top */}
      <HeaderNav />

      {/* Content area with sidebar */}
      <SidebarProvider>
        <div className="flex flex-1">
          {/* Sidebar Navigation */}
          <AppSidebar />

          {/* Main content */}
          <main className="flex-1 p-6">
            <div>
              {/* Page header with title, breadcrumbs, and actions */}
              {(pageTitle || breadcrumbs) && (
                <PageHeader
                  title={pageTitle || ''}
                  description={pageDescription}
                  icon={pageIcon}
                  breadcrumbs={breadcrumbs}
                  actions={headerActions}
                />
              )}

              {/* Page content */}
              <div className="space-y-6 mt-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}