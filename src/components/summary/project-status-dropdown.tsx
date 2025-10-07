'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';
import { getStatusBadgeVariant } from '@/utils/badge-helpers';

/**
 * Props para el componente ProjectStatusDropdown
 */
interface ProjectStatusDropdownProps {
  /** ID del proyecto */
  projectId: string;
  /** Estado actual del proyecto */
  currentStatus: string;
  /** Función callback para cambiar el estado */
  onStatusChange?: (projectId: string, newStatus: string) => void;
  /** Indica si hay una operación pendiente */
  isPending?: boolean;
  /** Modo solo lectura - solo muestra el badge sin dropdown */
  readOnly?: boolean;
}

/**
 * Componente dropdown para cambiar el estado de un proyecto
 * de manera consistente en toda la aplicación.
 *
 * @description
 * Este componente maneja la visualización y cambio de estado de proyectos con la siguiente lógica:
 * - Muestra el estado actual como badge con colores según getStatusBadgeVariant
 * - En modo interactivo, permite cambiar el estado mediante dropdown
 * - En modo readOnly, solo muestra el badge actual sin interacción
 * - Deshabilita interacciones mientras hay operaciones pendientes
 * - Marca visualmente el estado actual en el menú
 *
 * @example
 * ```tsx
 * // Modo interactivo (en tabla)
 * <ProjectStatusDropdown
 *   projectId={project.id}
 *   currentStatus={project.status}
 *   onStatusChange={handleStatusChange}
 *   isPending={mutation.isPending}
 * />
 *
 * // Modo solo lectura (en cards o vistas de solo lectura)
 * <ProjectStatusDropdown
 *   projectId={project.id}
 *   currentStatus={project.status}
 *   readOnly
 * />
 * ```
 *
 * @param props - Props del componente ProjectStatusDropdown
 * @returns JSX.Element renderizado
 */
export const ProjectStatusDropdown: React.FC<ProjectStatusDropdownProps> = ({
  projectId,
  currentStatus,
  onStatusChange,
  isPending = false,
  readOnly = false,
}) => {
  const statusOption = PROJECT_STATUS_OPTIONS.find(opt => opt.value === currentStatus);
  const variant = getStatusBadgeVariant(currentStatus);

  // Modo solo lectura - solo muestra el badge
  if (readOnly || !onStatusChange) {
    return (
      <Badge variant={variant} className="flex justify-center">
        {statusOption?.label || currentStatus}
      </Badge>
    );
  }

  // Modo interactivo - muestra dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="p-0 h-auto font-normal hover:bg-transparent"
          disabled={isPending}
        >
          <Badge variant={variant} className="cursor-pointer">
            {isPending
              ? "Actualizando..."
              : (statusOption?.label || currentStatus)
            }
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {PROJECT_STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              if (option.value !== currentStatus && !isPending) {
                onStatusChange(projectId, option.value);
              }
            }}
            className="flex items-center justify-between"
          >
            <span className={option.value === currentStatus ? "text-primary font-medium" : ""}>
              {option.label}
            </span>
            {option.value === currentStatus && (
              <Check className="h-4 w-4 ml-2 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
