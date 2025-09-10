# Flujo de Importación de Datos: Proyecto → Evento de Calendario

## 📋 Resumen Ejecutivo

Este documento analiza el flujo completo de importación de datos desde un proyecto (`ProjectType`) hacia un evento de proyecto (`ProjectEventType`) en el sistema de calendario de la aplicación.

**Arquitectura implementada:** Duplicación selectiva de datos con sincronización automática.

**Objetivo:** Proporcionar auto-relleno inteligente al crear eventos de calendario, manteniendo histórico inmutable y performance óptima.

---

## 🏗️ Arquitectura General

### Decisión Arquitectural: Duplicación de Datos

El sistema implementa una **arquitectura de duplicación selectiva** donde los eventos de proyecto son entidades independientes que mantienen una copia de los datos relevantes del proyecto padre.

```
Proyecto (projects)          Evento (projectEvents)
├── id                      ├── id
├── clientName              ├── clientName ← COPIADO
├── windowsCount            ├── windowsCount ← COPIADO
├── squareMeters            ├── squareMeters ← COPIADO
├── phone                   ├── phone ← COPIADO
├── fullAddress             ├── fullAddress ← COPIADO
├── status                  ├── status ← COPIADO
├── description             ├── description ← COPIADO
├── uninstall               ├── uninstall ← COPIADO
├── uninstallTypes          ├── uninstallTypes ← COPIADO
└── uninstallOther          ├── uninstallOther ← COPIADO
                            ├── eventDate ← ESPECÍFICO DEL EVENTO
                            ├── checklist ← ESPECÍFICO DEL EVENTO
                            └── projectId ← REFERENCIA
```

### Ventajas de Esta Arquitectura

✅ **Performance**: Consultas rápidas sin joins  
✅ **Histórico inmutable**: Los eventos mantienen datos del momento de creación  
✅ **Independencia**: Modificaciones del proyecto no afectan eventos pasados  
✅ **Flexibilidad**: Los eventos pueden tener datos específicos diferentes al proyecto  

---

## 🔄 Flujo Detallado Paso a Paso

### Fase 1: Selección de Proyecto (UI Layer)
**Archivo:** `src/components/modals/calendar/NewProjectEventModal.tsx`

```typescript
const handleProjectSelect = async (projectId: string) => {
  // 1. Buscar proyecto seleccionado
  const project = filteredProjects.find(p => p.id === projectId);
  
  // 2. Auto-relleno inmediato de campos del formulario
  const updatedFormData: Partial<NewProjectEventFormValues> = {
    projectId: project.id,
    description: project.description || '',
    phone: project.phone || '',
    fullAddress: project.fullAddress || undefined,
    status: project.status,
    windowsCount: project.windowsCount || 0,
    squareMeters: project.squareMeters || 0,
    uninstall: project.uninstall || false,
    uninstallTypes: project.uninstallTypes,
    uninstallOther: project.uninstallOther || '',
    clientName: project.clientName,
    eventDate: new Date(), // Fecha por defecto es hoy
  };
  
  // 3. Actualizar formulario React Hook Form
  Object.entries(updatedFormData).forEach(([key, value]) => {
    if (value !== undefined) {
      form.setValue(key as keyof NewProjectEventFormValues, value);
    }
  });
};
```

### Fase 2: Validación y Sincronización (Service Layer)
**Archivo:** `src/services/projectEventService.ts`

```typescript
export const createProjectEvent = async (
  eventData: CreateProjectEventData,
  firestore: Firestore = db
): Promise<ProjectEventType> => {
  // 1. Validación de entrada
  validateEventInput(eventData);
  
  // 2. Obtención de datos del proyecto padre
  let projectData = await fetchProjectData(eventData.projectId, firestore);
  
  // 3. Sincronización automática del nombre del cliente si es necesario
  projectData = await ensureClientNameSync(projectData, eventData.projectId, firestore);
  
  // 4. Sanitización y mapeo de datos
  const sanitizedData = sanitizeProjectEventData(eventData, projectData);
  
  // 5. Creación del documento con timestamps automáticos
  const eventDoc = addTimestamps({
    ...sanitizedData,
    id: '', // Se asignará automáticamente
  });
  
  // 6. Persistencia en Firestore
  const docRef = await addDoc(collection(firestore, 'projectEvents'), eventDoc);
  
  return { ...eventDoc, id: docRef.id };
};
```

### Fase 3: Mapeo y Transformación (Utils Layer)
**Archivo:** `src/utils/eventValidation.ts`

```typescript
export const sanitizeProjectEventData = (
  eventData: CreateProjectEventData,
  projectData: ProjectType
): Omit<ProjectEventType, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    // === IDENTIFICADORES Y RELACIONES ===
    projectId: projectData.id,
    
    // === INFORMACIÓN DEL CLIENTE (con sincronización) ===
    clientName: eventData.clientName || projectData.clientName || 'Cliente pendiente',
    
    // === DATOS TÉCNICOS (con validación numérica) ===
    windowsCount: eventData.windowsCount !== undefined 
      ? Math.max(0, Math.floor(Number(eventData.windowsCount) || 0))
      : projectData.windowsCount || 0,
      
    squareMeters: eventData.squareMeters !== undefined
      ? Math.max(0, Number(eventData.squareMeters) || 0)
      : projectData.squareMeters || 0,
    
    // === INFORMACIÓN DE CONTACTO Y UBICACIÓN ===
    phone: eventData.phone || projectData.phone || '',
    fullAddress: eventData.fullAddress || projectData.fullAddress || undefined,
    
    // === ESTADO Y CONFIGURACIÓN ===
    status: eventData.status || projectData.status,
    description: eventData.description || projectData.description || '',
    
    // === CONFIGURACIÓN DE DESINSTALACIÓN ===
    uninstall: Boolean(eventData.uninstall ?? projectData.uninstall),
    uninstallTypes: Array.isArray(eventData.uninstallTypes) 
      ? eventData.uninstallTypes.filter(type => type && type.trim())
      : (projectData.uninstallTypes || []),
    uninstallOther: eventData.uninstallOther || projectData.uninstallOther || '',
    
    // === METADATA ESPECÍFICA DEL EVENTO ===
    eventDate: eventData.eventDate instanceof Date 
      ? eventData.eventDate 
      : new Date(eventData.eventDate || Date.now()),
    checklist: eventData.checklist || []
  };
};
```

---

## 📊 Mapeo Completo de Campos

| **Campo Evento** | **Fuente Principal** | **Fallback 1** | **Fallback 2** | **Transformación** |
|------------------|---------------------|----------------|-----------------|-------------------|
| `projectId` | `projectData.id` | - | - | Directo |
| `clientName` | `eventData.clientName` | `projectData.clientName` | `'Cliente pendiente'` | String |
| `windowsCount` | `eventData.windowsCount` | `projectData.windowsCount` | `0` | `Math.max(0, Math.floor(Number \|\| 0))` |
| `squareMeters` | `eventData.squareMeters` | `projectData.squareMeters` | `0` | `Math.max(0, Number \|\| 0)` |
| `phone` | `eventData.phone` | `projectData.phone` | `''` | String directo |
| `fullAddress` | `eventData.fullAddress` | `projectData.fullAddress` | `undefined` | Objeto completo |
| `status` | `eventData.status` | `projectData.status` | - | ProjectStatus enum |
| `description` | `eventData.description` | `projectData.description` | `''` | String directo |
| `uninstall` | `eventData.uninstall` | `projectData.uninstall` | `false` | `Boolean()` |
| `uninstallTypes` | `eventData.uninstallTypes` | `projectData.uninstallTypes` | `[]` | Array filtrado |
| `uninstallOther` | `eventData.uninstallOther` | `projectData.uninstallOther` | `''` | String directo |
| `eventDate` | `eventData.eventDate` | `new Date()` | - | Date normalization |
| `checklist` | `eventData.checklist` | `[]` | - | Array directo |

---

## 🔧 Validaciones y Transformaciones

### Validaciones de Negocio
- ✅ **Proyecto padre debe existir** (verificación en `fetchProjectData`)
- ✅ **Datos numéricos no negativos** (aplicación de `Math.max(0, ...)`)
- ✅ **Fecha de evento requerida** (fallback a fecha actual)
- ✅ **Estado de proyecto válido** (enum ProjectStatus)

### Transformaciones de Datos

#### 1. Sanitización Numérica
```typescript
// Para enteros (ventanas)
windowsCount: Math.max(0, Math.floor(Number(value) || 0))

// Para decimales (metros cuadrados)
squareMeters: Math.max(0, Number(value) || 0)
```

#### 2. Normalización de Arrays
```typescript
// Filtrar valores vacíos en tipos de desinstalación
uninstallTypes: array.filter(type => type && type.trim())
```

#### 3. Conversión de Fechas
```typescript
// Normalización segura a objeto Date
eventDate: eventData.eventDate instanceof Date 
  ? eventData.eventDate 
  : new Date(eventData.eventDate || Date.now())
```

#### 4. Sincronización Automática de Cliente
```typescript
// Si el proyecto no tiene nombre de cliente actualizado, sincronizar
projectData = await ensureClientNameSync(projectData, projectId, firestore);
```

---

## 🚀 Consideraciones Técnicas

### Patrón de Fallbacks en Cascada
El sistema implementa un patrón robusto de fallbacks:

1. **Datos del formulario** (modificaciones específicas del evento)
2. **Datos del proyecto** (valores del proyecto padre)
3. **Valores por defecto** (fallback seguro)

### Inmutabilidad del Histórico
Los eventos mantienen una "fotografía" de los datos del proyecto en el momento de creación, permitiendo:
- Análisis histórico preciso
- Independencia de cambios futuros del proyecto
- Trazabilidad completa de la información

### Performance y Escalabilidad
- **Sin joins complejos**: Todas las consultas son directas a la colección `projectEvents`
- **Índices optimizados**: Sobre `projectId`, `eventDate`, `status`
- **Cache en UI**: Los proyectos se mantienen en memoria durante la sesión

---

## 🔍 Análisis de Alternativas Arquitecturales

### Alternativa 1: Referencias Puras (No implementada)
```typescript
// Hipotético: Solo almacenar referencia
{
  projectId: "proj123",
  eventDate: Date,
  checklist: [],
  // Datos del proyecto obtenidos dinámicamente
}
```
**Pros:** Menor duplicación, consistencia automática  
**Contras:** Performance degradada, pérdida de histórico

### Alternativa 2: Híbrido con Versionado (No implementada)
```typescript
// Hipotético: Versionado de snapshots
{
  projectId: "proj123",
  projectSnapshot: { version: 1, data: {...} },
  eventDate: Date,
  checklist: []
}
```
**Pros:** Balance performance/consistencia  
**Contras:** Mayor complejidad, overhead de versiones

### **Conclusión: Arquitectura Actual Óptima**
Para el contexto de esta aplicación (calendar events + Firebase), la duplicación selectiva es la opción más adecuada por:
- Performance crítica para cargas de calendario
- Inmutabilidad histórica requerida
- Simplicidad operacional con Firebase

---

## 📈 Oportunidades de Mejora

### Mejoras Incrementales
1. **Cache de Proyectos**: Evitar múltiples fetch del mismo proyecto
2. **Validación Mejorada**: Rangos de fecha más estrictos
3. **Sync Inteligente**: Detectar automáticamente cuando sincronizar

### Mejoras Arquitecturales (Futuro)
1. **Event Sourcing**: Para histórico completo de cambios
2. **CQRS Pattern**: Separar comandos de queries
3. **Composite Events**: Agrupar eventos relacionados

---

## 🎯 Casos de Uso del Sistema

### Flujo Principal: Crear Evento desde Proyecto
1. Usuario abre modal "Nuevo Evento"
2. Selecciona proyecto del autocomplete
3. **Auto-relleno automático** de 11 campos
4. Usuario ajusta fecha y detalles específicos del evento
5. Sistema valida, sanitiza y guarda evento

### Flujo de Modificación: Editar Evento Existente
1. Los datos importados pueden modificarse independientemente
2. No afecta al proyecto padre
3. Mantiene trazabilidad del origen

### Flujo de Consulta: Vista de Calendario
1. Carga rápida de eventos (sin joins)
2. Toda la información disponible inmediatamente
3. Filtrado eficiente por fecha, proyecto, estado

---

**Fecha de creación:** Septiembre 2025  
**Última actualización:** Septiembre 2025  
**Estado:** Documentación completa del flujo actual