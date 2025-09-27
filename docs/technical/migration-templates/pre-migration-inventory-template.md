# 📋 INVENTARIO PRE-MIGRACIÓN: [NOMBRE_PÁGINA]

> **Fecha de análisis:** [FECHA]
> **Página a migrar:** `src/app/[PÁGINA]/`
> **Analista:** [NOMBRE]

**⚠️ IMPORTANTE:** Este inventario debe completarse ANTES de comenzar la migración para evitar pérdida de funcionalidades.

---

## 🔍 1. ANÁLISIS AUTOMÁTICO EJECUTADO

```bash
# Ejecutar antes de completar este inventario
./scripts/migration/analyze-page-functionality.sh src/app/[PÁGINA]/
```

**Resultado del script:**
- [ ] ✅ Script ejecutado exitosamente
- [ ] ⚠️ Alertas detectadas (documentar abajo)
- [ ] ❌ Errores críticos encontrados

---

## ✅ 2. FUNCIONALIDADES CRÍTICAS IDENTIFICADAS

### 2.1 Edición Inline
- [ ] **Edición de estado** - Usuarios pueden cambiar estado directamente en tabla
- [ ] **Edición de campos** - Campos editables directamente (nombres, montos, etc.)
- [ ] **Validación en tiempo real** - Validación inmediata al editar
- [ ] **Estados de loading** - Indicadores visuales durante actualización

**Detalles específicos:**
```
[Describir exactamente QUÉ se puede editar y CÓMO funciona]
```

### 2.2 Filtros y Búsqueda
- [ ] **Búsqueda global** - Barra de búsqueda general
- [ ] **Filtros por estado** - Dropdown/selector de estados
- [ ] **Filtros por fecha** - Rangos o selectores de fecha
- [ ] **Filtros personalizados** - Filtros específicos de la página
- [ ] **Búsqueda en múltiples campos** - Busca en varios campos simultáneamente

**Campos que deben ser buscables:**
```
[Listar todos los campos donde debe funcionar la búsqueda]
```

### 2.3 Acciones por Fila
- [ ] **Editar** - Modal o navegación para editar elemento
- [ ] **Eliminar** - Confirmación y eliminación
- [ ] **Agregar pago** - Funcionalidad de pagos (si aplica)
- [ ] **Ver detalles** - Modal o página de detalles
- [ ] **Cambiar estado** - Workflow de estados
- [ ] **Duplicar/Copiar** - Crear elemento basado en existente

**Acciones específicas encontradas:**
```
[Documentar cada botón/acción y su comportamiento exacto]
```

### 2.4 Ordenamiento y Paginación
- [ ] **Ordenamiento por columnas** - Click en header para ordenar
- [ ] **Ordenamiento múltiple** - Ordenar por múltiples campos
- [ ] **Paginación** - Navegación entre páginas
- [ ] **Cambio de tamaño de página** - Elementos por página seleccionable

---

## 🔌 3. COMPONENTES REUTILIZABLES IDENTIFICADOS

### 3.1 Componentes de Display
- [ ] **`ProjectClientDisplay`** - Muestra info de proyecto + cliente
  - **Ubicación:** `src/components/client-display.tsx`
  - **Props usados:** `project={{ projectNumber, clientName, glosa }}`
  - **Comportamiento:** Dos líneas (número + cliente/glosa)

- [ ] **`StatusBadge`** - Badge de estado con colores
  - **Ubicación:** [UBICACIÓN]
  - **Props usados:** [PROPS]
  - **Comportamiento:** [COMPORTAMIENTO]

- [ ] **Otros componentes Display:**
  ```
  [Listar todos los componentes *Display encontrados]
  ```

### 3.2 Componentes de Formulario
- [ ] **`[Nombre]Form`** - Formularios específicos
- [ ] **`[Nombre]Modal`** - Modales reutilizables
- [ ] **Validaciones personalizadas**

### 3.3 Componentes de Interacción
- [ ] **Botones personalizados**
- [ ] **Dropdowns específicos**
- [ ] **Tooltips/Popovers**

---

## 🎛️ 4. ESTADO Y LÓGICA DE NEGOCIO

### 4.1 Hooks Utilizados
- [ ] **`useState`** para: [DESCRIBIR USOS]
- [ ] **`useMutation`** para: [DESCRIBIR MUTACIONES]
- [ ] **`useQuery`** para: [DESCRIBIR CONSULTAS]
- [ ] **`useEffect`** para: [DESCRIBIR EFECTOS]
- [ ] **Hooks personalizados:** [LISTAR]

### 4.2 Funciones de Manejo Críticas
- [ ] **`handleStatusChange`** - Cambio de estado inline
- [ ] **`handleEdit`** - Edición de elementos
- [ ] **`handleDelete`** - Eliminación con confirmación
- [ ] **`handleAddPayment`** - Agregar pagos (si aplica)
- [ ] **Otras funciones handle*:** [LISTAR]

---

## 📊 5. ESTRUCTURA DE DATOS ACTUAL

### 5.1 Columnas Existentes
| Columna | Tipo | Ordenable | Filtrable | Editable | Componente Usado |
|---------|------|-----------|-----------|----------|------------------|
| [NOMBRE] | [TIPO] | ✅/❌ | ✅/❌ | ✅/❌ | [COMPONENTE] |
| | | | | | |

### 5.2 Tipos TypeScript Relevantes
```typescript
// Copiar interfaces/tipos principales usados
interface [TipoExistente] {
  // ...
}
```

---

## 🎯 6. COMPORTAMIENTOS UX ESPECÍFICOS

### 6.1 Estados de Loading
- [ ] **Skeleton loading** - Placeholders durante carga
- [ ] **Spinners específicos** - Indicadores por acción
- [ ] **Estados de botones** - Disabled durante operaciones
- [ ] **Feedback de operaciones** - Toasts, alertas, confirmaciones

### 6.2 Validaciones y Errores
- [ ] **Validación en tiempo real**
- [ ] **Mensajes de error específicos**
- [ ] **Estados de error recuperables**
- [ ] **Timeouts y reintentos**

### 6.3 Navegación y Flujos
- [ ] **Links internos** - Navegación a otras páginas
- [ ] **Breadcrumbs** - Navegación jerárquica
- [ ] **Estados de URL** - Query params, filtros persistentes
- [ ] **Historial de navegación**

---

## 🚨 7. RIESGOS IDENTIFICADOS

### 7.1 Funcionalidades Complejas
```
[Documentar funcionalidades que requieren atención especial]
```

### 7.2 Dependencias Críticas
```
[Listar imports/servicios críticos que no pueden perderse]
```

### 7.3 Patrones No Estándar
```
[Documentar código personalizado que no sigue patrones normales]
```

---

## ✅ 8. CRITERIOS DE ACEPTACIÓN ESPECÍFICOS

Para considerar la migración exitosa, TODOS estos criterios deben cumplirse:

### 8.1 Funcionalidades Críticas
- [ ] **Edición inline funciona idénticamente**
- [ ] **Todas las acciones por fila operativas**
- [ ] **Filtros y búsqueda sin regresión**
- [ ] **Ordenamiento preservado**

### 8.2 Componentes y Arquitectura
- [ ] **Componentes reutilizables integrados**
- [ ] **No duplicación de código**
- [ ] **Tipos TypeScript correctos**
- [ ] **Performance sin regresión**

### 8.3 Calidad de Código
- [ ] **TypeScript sin errores**
- [ ] **ESLint solo warnings esperados**
- [ ] **Tests de regresión pasan**
- [ ] **Documentación actualizada**

---

## 📝 9. NOTAS ADICIONALES

```
[Documentar cualquier observación adicional, casos edge, o consideraciones especiales]
```

---

## ✍️ 10. FIRMAS Y APROBACIÓN

**Inventario completado por:** [NOMBRE]
**Fecha:** [FECHA]
**Revisado por:** [NOMBRE]
**Aprobado para migración:** ✅ / ❌

---

**📋 Próximo paso:** Usar este inventario durante la migración para verificar que TODAS las funcionalidades se preserven.