# Patrones Arquitectónicos del Proyecto

## Arquitectura de Eventos Específicos por Dominio (Enero 2025)

### Filosofía
Cada dominio (proyecto, postventa, visita) maneja sus eventos de forma **independiente**, eliminando dependencias del sistema general de eventos.

### Servicios de Eventos Especializados
- **`projectEventService.ts`** - Eventos específicos de proyecto ✅ **IMPLEMENTADO**
- **`afterSalesEventService.ts`** - Para futuros eventos de postventa
- **`visitEventService.ts`** - Para futuros eventos de visita

### Características de ProjectEvents
- **Sincronización automática** de `clientName` desde colección `clients`
- **Validación robusta** con `eventValidation.ts`
- **Auto-sanitización** de datos numéricos (previene NaN)
- **Checklist integrado** para seguimiento de tareas
- **Arquitectura preparada** para extensión a otros dominios

## Patrón de Capa de Servicios (Optimizado Post-Auditoría)

### Características Principales
- Servicios Firebase aceptan instancia de Firestore como parámetro
- Utilidades Firestore centralizadas en `src/utils/firestore-helpers.ts`
- Configuración Firebase unificada y validada
- Eliminación completa de duplicación de código

### Beneficios
- Configuraciones dinámicas de base de datos por usuario
- Mejor capacidad de prueba mediante mocking
- Soporte para múltiples conexiones de base de datos
- Reutilización de lógica común de transformación de datos

### Ejemplo de Implementación
```typescript
// ✅ CORRECTO - Patrón post-auditoría
export const getProjects = async (
  firestore: Firestore, 
  clientId?: string
): Promise<ProjectType[]> => {
  // Usa utilidades centralizadas para conversiones
  return convertFirestoreDocuments(docs, convertProjectDocument);
};
```

## Gestión de Estado

### Estrategia Multi-Nivel
- **Estado Local**: Datos específicos de componentes usando hooks de React
- **Estado Global**: Datos compartidos usando stores de Zustand
- **Estado del Servidor**: Firebase Firestore con listeners en tiempo real
- **Estado de URL**: Parámetros de ruta y query strings

### Sincronización Automática
- **`clientSyncService.ts`** - Sincronización automática cliente-proyecto
- **Auto-sync** de `clientName` en eventos de proyecto
- **Listeners en tiempo real** para actualizaciones inmediatas

## Manejo de Errores

### Estrategia de Dos Niveles
1. **Errores Inesperados (UI)**: Error Boundaries para errores de JavaScript
2. **Errores Esperados**: Try/catch en servicios y custom hooks, notificación con `useToast()`

### Validación Robusta
- **Prevención de NaN**: Validación numérica en todos los inputs
- **Esquemas Zod**: Validación de datos con valores por defecto
- **Auto-sanitización**: Limpieza automática de datos inválidos

## Patrones de Componentes

### Estructura de Componentes
```typescript
type ComponentProps = {
  // Props tipadas explícitamente
};

export const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Early returns para casos especiales
  if (condición) return <EarlyReturn />;
  
  // Lógica principal
  return <MainComponent />;
};
```

### Organización por Dominio
- Componentes agrupados por funcionalidad de negocio
- Modales organizados por dominio específico
- Formularios especializados por entidad

## Patrones de Eventos Recomendados

### ✅ CORRECTO - Eventos Específicos
```typescript
// Para eventos de proyecto
import { createProjectEvent } from '@/services/projectEventService';

// Para futuros eventos de postventa  
import { createAfterSalesEvent } from '@/services/afterSalesEventService';
```

### ❌ INCORRECTO - Sistema General
```typescript
// NO usar - sistema deprecated
import { EventType } from '@/types/event';
import { createEvent } from '@/services/eventService'; // NO EXISTE
```

## Principios de Extensibilidad

### Para Nuevos Tipos de Eventos
1. Crear servicio específico: `[domain]EventService.ts`
2. Definir tipos en `@/types/[domain].ts`
3. Implementar validaciones en `@/utils/[domain]Validation.ts`
4. Crear componentes especializados
5. Seguir patrón de sincronización automática

### Reutilización de Código
- **Utilidades centralizadas**: `firestore-helpers.ts`
- **Constantes compartidas**: Sistema centralizado en `constants/`
- **Validaciones comunes**: Esquemas Zod reutilizables
- **Componentes base**: UI components de Shadcn/ui