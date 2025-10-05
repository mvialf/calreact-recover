'use client';

import { cn } from '@/lib/utils';

/**
 * Props para el componente ProjectSummary
 */
interface ProjectSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Objeto proyecto con información a mostrar */
  project: {
    projectNumber?: string;
    clientName?: string | null;
    glosa?: string | null;
  };
  /** Mostrar el número del proyecto */
  showProjectNumber?: boolean;
  /** Mostrar información del cliente */
  showClientInfo?: boolean;
  /** Variante de layout */
  layout?: 'stacked' | 'inline';
  /** Tamaño de fuente */
  size?: 'sm' | 'base' | 'lg' | 'xl';
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente para mostrar un resumen condensado de información del proyecto
 * de manera consistente en toda la aplicación.
 *
 * @description
 * Este componente maneja la visualización de información de proyecto con la siguiente lógica:
 * - Muestra el número del proyecto si está disponible y habilitado
 * - Prioriza el `clientName` para identificar el proyecto
 * - Usa `glosa` como fallback si no hay `clientName`
 * - Muestra "Cliente no especificado" si no hay información del cliente
 * - Muestra la glosa como información adicional solo si es diferente al texto principal del cliente
 *
 * @example
 * ```tsx
 * // Caso básico completo
 * <ProjectSummary project={project} />
 *
 * // Sin número de proyecto
 * <ProjectSummary project={project} showProjectNumber={false} />
 *
 * // Layout en línea para espacios reducidos
 * <ProjectSummary
 *   project={project}
 *   layout="inline"
 *   className="text-xs"
 * />
 *
 * // Solo información del cliente
 * <ProjectSummary
 *   project={project}
 *   showProjectNumber={false}
 *   showClientInfo={true}
 * />
 * ```
 *
 * @param props - Props del componente ProjectSummary
 * @returns JSX.Element renderizado
 */
export function ProjectSummary({
  project,
  showProjectNumber = true,
  showClientInfo = true,
  layout = 'stacked',
  size = 'sm',
  className,
  ...props
}: ProjectSummaryProps) {
  // Si no hay nombre de cliente, usamos 'Cliente no especificado'
  const displayClientName = project.clientName?.trim() || 'Cliente no especificado';
  // Mostrar la glosa solo si existe y es diferente al nombre del cliente
  const showGlosa = project.glosa?.trim() && project.glosa.trim() !== displayClientName;

  // Mapeo de tamaños de fuente
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (layout === 'inline') {
    // Layout en línea para espacios reducidos
    const projectPart = showProjectNumber && project.projectNumber ? `${project.projectNumber}: ` : '';
    const clientPart = showClientInfo ? displayClientName : '';
    const glosaPart = showGlosa && showClientInfo ? ` - ${project.glosa?.trim()}` : '';

    return (
      <div
        className={cn(sizeClasses[size], 'text-foreground', className)}
        title={`${projectPart}${clientPart}${glosaPart}`.trim()}
        {...props}
      >
        {projectPart}{clientPart}{glosaPart}
      </div>
    );
  }

  // Layout apilado por defecto (mejor para tablas y listas)
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {showProjectNumber && project.projectNumber && (
        <div className={cn(sizeClasses[size], 'font-medium')}>{project.projectNumber}</div>
      )}
      {showClientInfo && (
        <div className={sizeClasses[size]}>
          {displayClientName}
          {showGlosa && (
            <span className="text-muted-foreground"> - {project.glosa?.trim()}</span>
          )}
        </div>
      )}
    </div>
  );
}