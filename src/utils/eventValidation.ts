// src/utils/eventValidation.ts
import type { ProjectEventType } from '@/types/project';
import type { ProjectType } from '@/types/project';

/**
 * Valida los datos requeridos para crear un evento de proyecto
 * @param eventData - Datos del evento a validar
 * @returns Resultado de validación con errores específicos
 */
export const validateProjectEventData = (
  eventData: Partial<ProjectEventType>
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validaciones obligatorias
  if (!eventData.projectId) {
    errors.push('ID del proyecto es requerido');
  }

  if (!eventData.eventDate) {
    errors.push('Fecha del evento es requerida');
  } else if (eventData.eventDate < new Date()) {
    warnings.push('La fecha del evento está en el pasado');
  }

  if (!eventData.status) {
    errors.push('Estado del evento es requerido');
  }

  // Validaciones de datos numéricos
  if (eventData.windowsCount !== undefined) {
    if (isNaN(eventData.windowsCount) || !isFinite(eventData.windowsCount)) {
      errors.push('Número de ventanas debe ser un valor numérico válido');
    } else if (eventData.windowsCount < 0) {
      errors.push('Número de ventanas no puede ser negativo');
    }
  }

  if (eventData.squareMeters !== undefined) {
    if (isNaN(eventData.squareMeters) || !isFinite(eventData.squareMeters)) {
      errors.push('Metros cuadrados debe ser un valor numérico válido');
    } else if (eventData.squareMeters < 0) {
      errors.push('Metros cuadrados no puede ser negativo');
    }
  }

  // Validaciones de desinstalación
  if (eventData.uninstall && (!eventData.uninstallTypes || eventData.uninstallTypes.length === 0)) {
    warnings.push('Se marcó desinstalación pero no se especificaron tipos');
  }

  // Validación de información de cliente
  if (!eventData.clientName) {
    warnings.push('Nombre del cliente no especificado - será obtenido del proyecto');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Valida que un proyecto sea apto para crear eventos
 * @param project - Datos del proyecto
 * @returns Resultado de validación
 */
export const validateProjectForEvents = (project: ProjectType): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // El proyecto debe existir
  if (!project.id) {
    errors.push('ID del proyecto no válido');
  }

  // Debe tener información de cliente
  if (!project.clientId && !project.clientName) {
    errors.push('El proyecto debe tener información de cliente');
  }

  if (project.clientId && !project.clientName) {
    warnings.push('El proyecto tiene clientId pero no clientName - será sincronizado automáticamente');
  }

  // Estados que podrían requerir atención
  if (project.status === 'completado') {
    warnings.push('El proyecto está marcado como completado');
  }

  if (project.isPaid === true) {
    warnings.push('El proyecto está marcado como pagado');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Sanitiza y normaliza los datos de un evento de proyecto antes de guardar
 * @param eventData - Datos del evento
 * @param projectData - Datos del proyecto relacionado
 * @returns Datos sanitizados y normalizados
 */
export const sanitizeProjectEventData = (
  eventData: Partial<ProjectEventType>,
  projectData: ProjectType
): Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'> => {
  // Garantizar valores numéricos seguros
  const windowsCount = eventData.windowsCount !== undefined 
    ? Math.max(0, Math.floor(Number(eventData.windowsCount) || 0))
    : projectData.windowsCount || 0;

  const squareMeters = eventData.squareMeters !== undefined
    ? Math.max(0, Number(eventData.squareMeters) || 0)
    : projectData.squareMeters || 0;

  // Sincronizar información del cliente
  const clientName = eventData.clientName || projectData.clientName || 'Cliente pendiente';

  // Normalizar fecha
  const eventDate = eventData.eventDate instanceof Date 
    ? eventData.eventDate 
    : new Date(eventData.eventDate || Date.now());

  // Normalizar tipos de desinstalación
  const uninstallTypes = Array.isArray(eventData.uninstallTypes) 
    ? eventData.uninstallTypes.filter(type => type && type.trim())
    : (projectData.uninstallTypes || []);

  return {
    projectId: projectData.id,
    eventDate,
    description: eventData.description || projectData.description || '',
    phone: eventData.phone || projectData.phone || '',
    fullAddress: eventData.fullAddress || projectData.fullAddress || undefined,
    status: eventData.status || projectData.status,
    windowsCount,
    squareMeters,
    uninstall: Boolean(eventData.uninstall ?? projectData.uninstall),
    uninstallTypes,
    uninstallOther: eventData.uninstallOther || projectData.uninstallOther || '',
    clientName,
    checklist: eventData.checklist || []
  };
};

/**
 * Genera un nombre descriptivo para el evento basado en los datos del proyecto
 * @param projectData - Datos del proyecto
 * @param eventData - Datos específicos del evento
 * @returns Nombre descriptivo del evento
 */
export const generateEventDisplayName = (
  projectData: ProjectType,
  eventData?: Partial<ProjectEventType>
): string => {
  const parts: string[] = [];

  // Agregar número de proyecto si existe
  if (projectData.projectNumber) {
    parts.push(`Proyecto ${projectData.projectNumber}`);
  }

  // Agregar nombre del cliente
  const clientName = eventData?.clientName || projectData.clientName;
  if (clientName && clientName !== 'Cliente pendiente') {
    parts.push(clientName);
  }

  // Agregar estado si es relevante
  const status = eventData?.status || projectData.status;
  if (status && status !== 'ingresado') {
    parts.push(`(${status})`);
  }

  return parts.length > 0 ? parts.join(' - ') : 'Evento de proyecto';
};

/**
 * Compara dos objetos de evento de proyecto para detectar cambios significativos
 * @param current - Datos actuales
 * @param updated - Datos actualizados
 * @returns Lista de campos que han cambiado
 */
export const detectEventChanges = (
  current: ProjectEventType,
  updated: Partial<ProjectEventType>
): string[] => {
  const changes: string[] = [];

  // Campos importantes a comparar
  const fieldsToCheck: Array<keyof ProjectEventType> = [
    'eventDate', 'status', 'windowsCount', 'squareMeters', 
    'uninstall', 'phone', 'description', 'clientName'
  ];

  fieldsToCheck.forEach(field => {
    const currentValue = current[field];
    const updatedValue = updated[field];

    if (updatedValue !== undefined && currentValue !== updatedValue) {
      // Manejo especial para fechas
      if (field === 'eventDate' && currentValue instanceof Date && updatedValue instanceof Date) {
        if (currentValue.getTime() !== updatedValue.getTime()) {
          changes.push(field);
        }
      } 
      // Manejo especial para arrays
      else if (Array.isArray(currentValue) && Array.isArray(updatedValue)) {
        if (JSON.stringify(currentValue) !== JSON.stringify(updatedValue)) {
          changes.push(field);
        }
      }
      // Comparación directa para otros tipos
      else if (currentValue !== updatedValue) {
        changes.push(field);
      }
    }
  });

  return changes;
};