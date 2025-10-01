"use client"

import React from 'react';
import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Breadcrumb item type
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/**
 * PageHeader Props
 */
export interface PageHeaderProps {
  /** Título principal de la página */
  title: string;
  /** Descripción opcional debajo del título */
  description?: string;
  /** Icono opcional al lado del título */
  icon?: LucideIcon;
  /** Breadcrumbs de navegación */
  breadcrumbs?: BreadcrumbItem[];
  /** Acciones personalizadas (botones, switches, etc.) */
  actions?: React.ReactNode;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
}

/**
 * PageHeader - Componente de header estandarizado para páginas
 *
 * Responsabilidades:
 * - Mostrar título y descripción de página
 * - Renderizar breadcrumbs navegables
 * - Slot para actions (botones, switches, filtros)
 *
 * Beneficios:
 * - Consistencia visual en todas las páginas
 * - Fácil agregar breadcrumbs sin tocar layout
 * - Slot flexible para acciones específicas de cada página
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  breadcrumbs,
  actions,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      isLast && "text-foreground font-medium"
                    )}
                    aria-current={isLast ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Title and Actions */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            {Icon && <Icon className="w-8 h-8 mr-3 text-primary" />}
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {/* Actions slot */}
        {actions && (
          <div className="flex items-center space-x-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}