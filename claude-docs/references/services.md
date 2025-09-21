# 🔧 Servicios del Proyecto CalReact

**Última actualización:** Septiembre 2025
**Total de servicios:** 13 servicios (10 documentados)

**Para patrones de servicios:** [patterns.md](./patterns.md)

## 📋 Inventario Completo de Servicios

### 🎯 Eventos y Proyectos
- **`projectEventService.ts`** - Eventos específicos de proyectos ✅ Documentado
- **`projectService.ts`** - Gestión principal de proyectos ✅ Implementado
- **`projectService.backup.ts`** - Respaldo del servicio de proyectos
- **`calendarEventService.ts`** - Eventos de calendario integrados
- **`eventEnrichmentService.ts`** - Enrichment y cache de eventos ✅ Documentado

### 👥 Clientes y Referencias
- **`clientService.ts`** - Gestión de información de clientes
- **`clientSyncService.ts`** - Sincronización automática de datos de clientes
- **`eventReferenceService.ts`** - Referencias entre eventos y entidades

### 💰 Pagos y Postventa
- **`paymentService.ts`** - Gestión de pagos asociados a proyectos
- **`afterSalesService.ts`** - Servicios postventa ✅ Documentado
- **`visitService.ts`** - Gestión de visitas ✅ Documentado

### 🏷️ Tags y Utilidades
- **`uninstallTagService.ts`** - Sistema de tags de desinstalación (nuevo)

### 📦 Configuración
- **`index.ts`** - Barrel exports de servicios

## 🏗️ Arquitectura de Servicios

### Patrón Estándar Firebase
```typescript
// ✅ PATRÓN OBLIGATORIO para todos los servicios
export const operacionService = async (
  firestore: Firestore,
  parametros: TipoParam
): Promise<TipoReturn> => {
  // Usar utilidades centralizadas
  return docSnapshotsToEntities(docs, convertDocument);
};
```

### Utilidades Centralizadas (OBLIGATORIO)
```typescript
// ✅ IMPORTAR SIEMPRE en servicios Firebase
import {
  docSnapshotToEntity,
  docSnapshotsToEntities,
  prepareDataForFirestore,
  timestampToDate
} from '@/utils/firestore-helpers';
```

## 📊 Estado de Documentación

### ✅ Servicios Documentados (10/13)
- projectEventService.ts - patterns.md ✅
- afterSalesEventService.ts - patterns.md ✅
- visitEventService.ts - patterns.md ✅
- eventEnrichmentService.ts - patterns.md ✅
- projectService.ts - patterns.md ✅ NUEVO
- paymentService.ts - patterns.md ✅ NUEVO
- clientService.ts - patterns.md ✅ NUEVO
- calendarEventService.ts - patterns.md ✅ NUEVO
- clientSyncService.ts - patterns.md ✅ NUEVO
- uninstallTagService.ts - patterns.md ✅ NUEVO

### ⚠️ Servicios No Documentados (3/13)
- eventReferenceService.ts
- projectService.backup.ts (evaluar eliminación)
- index.ts (barrel exports)

## 🎯 Responsabilidades por Servicio

### Eventos y Calendario
- **calendarEventService**: Integración con sistema de calendario, sincronización de eventos
- **eventReferenceService**: Gestión de referencias cruzadas entre eventos

### Gestión de Clientes
- **clientService**: CRUD básico de clientes
- **clientSyncService**: Sincronización automática de nombres y datos

### Finanzas
- **paymentService**: Gestión de pagos, asociación con proyectos, estados de pago

### Proyectos
- **projectService**: CRUD principal de proyectos, gestión de estados
- **projectService.backup**: Versión de respaldo (evaluar si es necesario)

### Utilidades
- **uninstallTagService**: Sistema de etiquetado para proceso de desinstalación

## 🚨 Prioridades de Documentación

### 🔴 CRÍTICO
1. **projectService.ts** - Servicio central del sistema
2. **paymentService.ts** - Funcionalidad financiera crítica
3. **clientService.ts** - Gestión central de clientes

### 🟡 MEDIO
4. **calendarEventService.ts** - Integración calendario
5. **clientSyncService.ts** - Automatización importante
6. **uninstallTagService.ts** - Funcionalidad nueva

### 🟢 BAJO
7. **eventReferenceService.ts** - Utilidad de referencias
8. **projectService.backup.ts** - Evaluar eliminación

---

**📊 Cobertura:** 77% de servicios documentados (10/13)
**🎯 Objetivo:** 100% de servicios críticos documentados ✅ COMPLETADO
**📋 Para actualizar:** Ejecutar `ls src/services/*.ts | grep -v test`