/**
 * ProjectInfo - Muestra información del proyecto en modo lean
 *
 * Este componente renderiza los datos del proyecto en una Card
 * de solo lectura cuando el formulario está en modo 'lean'.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectInfoProps } from './types';

// ✅ OPTIMIZACIÓN: React.memo con comparador personalizado
// Solo re-renderiza si project.id o className cambian
export const ProjectInfo = React.memo<ProjectInfoProps>(
  ({ project, className, onEditProject }) => {
    if (!project) return null;

    // Determinar variante del badge según status
    const getStatusVariant = (status: string) => {
      const statusMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
        'En Progreso': 'default',
        'Completado': 'secondary',
        'Pendiente': 'outline',
        'Cancelado': 'destructive',
      };
      return statusMap[status] || 'default';
    };

    return (
      <Card className={cn('bg-muted/50', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              Información del Proyecto
            </CardTitle>

            {/* Botón "Editar Proyecto" (solo si se proporciona callback) */}
            {onEditProject && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onEditProject}
                aria-label="Editar datos del proyecto"
                className="h-8"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Proyecto
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {/* Cliente */}
          {project.clientName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium">{project.clientName}</span>
            </div>
          )}

          {/* Estado */}
          {project.status && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusVariant(project.status)}>
                {project.status}
              </Badge>
            </div>
          )}

          {/* Descripción */}
          {project.description && (
            <div>
              <span className="text-muted-foreground block mb-1">Descripción:</span>
              <p className="text-sm pl-2 border-l-2 border-muted">
                {project.description}
              </p>
            </div>
          )}

          {/* Teléfono */}
          {project.phone && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Teléfono:</span>
              <span className="font-medium">{project.phone}</span>
            </div>
          )}

          {/* Dirección (si existe) */}
          {project.fullAddress?.textoCompleto && (
            <div>
              <span className="text-muted-foreground block mb-1">Dirección:</span>
              <p className="text-sm pl-2 border-l-2 border-muted">
                {project.fullAddress.textoCompleto}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  },
  // Comparador: solo re-renderiza si project.id, className o onEditProject cambian
  (prevProps, nextProps) => {
    return (
      prevProps.project?.id === nextProps.project?.id &&
      prevProps.className === nextProps.className &&
      prevProps.onEditProject === nextProps.onEditProject
    );
  }
);
