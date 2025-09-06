'use client';

import { cn } from '@/lib/utils';
import type { ProjectType } from '@/types/project';

/**
 * Props para el componente ClientDisplay
 */
interface ClientDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Nombre del cliente a mostrar */
  clientName?: string;
  /** Información adicional o glosa del cliente */
  glosa?: string;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente para mostrar el nombre del cliente junto con información adicional
 * de manera consistente en toda la aplicación.
 * 
 * @description
 * Este componente maneja la visualización de información de clientes con la siguiente lógica:
 * - Prioriza el `clientName` si está disponible
 * - Usa `glosa` como fallback si no hay `clientName`
 * - Muestra "Cliente no especificado" si no hay ninguno de los dos
 * - Muestra la glosa como información adicional solo si es diferente al texto principal
 * 
 * @example
 * ```tsx
 * // Caso básico con nombre de cliente
 * <ClientDisplay clientName="Juan Pérez" />
 * 
 * // Con glosa adicional
 * <ClientDisplay 
 *   clientName="Juan Pérez" 
 *   glosa="Empresa ABC"
 *   className="text-lg"
 * />
 * 
 * // Solo con glosa (se usa como texto principal)
 * <ClientDisplay glosa="Cliente VIP" />
 * 
 * // Sin información (muestra fallback)
 * <ClientDisplay />
 * ```
 * 
 * @param props - Props del componente ClientDisplay
 * @returns JSX.Element renderizado
 */
export function ClientDisplay({ 
  clientName, 
  glosa, 
  className,
  ...props 
}: ClientDisplayProps) {
  // Si no hay nombre de cliente pero hay glosa, usamos la glosa como texto principal
  const displayText = clientName?.trim() || glosa?.trim() || 'Cliente no especificado';
  // Mostrar la glosa solo si es diferente al texto principal
  const showGlosa = glosa?.trim() && glosa.trim() !== displayText;

  return (
    <div 
      className={cn('text-sm text-foreground', className)}
      title={showGlosa ? `${displayText} - ${glosa}` : displayText}
      {...props}
    >
      {displayText}
      {showGlosa && (
        <span className="text-muted-foreground"> - {glosa}</span>
      )}
    </div>
  );
}

/**
 * Versión del componente que acepta un objeto ProjectType
 */
interface ProjectClientDisplayProps extends Omit<ClientDisplayProps, 'clientName' | 'glosa'> {
  project: {
    projectNumber?: string;
    clientName?: string | null;
    glosa?: string | null;
  };
}

/**
 * Componente para mostrar la información de un proyecto de manera consistente
 * Muestra el número de proyecto, nombre del cliente y glosa (si existe) en un formato de dos líneas
 */
export function ProjectClientDisplay({ project, ...props }: ProjectClientDisplayProps) {
  // Si no hay nombre de cliente, usamos 'Cliente no especificado'
  const displayClientName = project.clientName?.trim() || 'Cliente no especificado';
  // Mostrar la glosa solo si existe y es diferente al nombre del cliente
  const showGlosa = project.glosa?.trim() && project.glosa.trim() !== displayClientName;
  
  return (
    <div className="space-y-1" {...props}>
      {project.projectNumber && (
        <div className="text-sm font-medium">{project.projectNumber}</div>
      )}
      <div className="text-sm">
        {displayClientName}
        {showGlosa && (
          <span> - {project.glosa?.trim()}</span>
        )}
      </div>
    </div>
  );
}
