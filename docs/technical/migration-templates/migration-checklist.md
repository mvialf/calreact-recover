# 📋 CHECKLIST MAESTRO DE MIGRACIÓN @tanstack/react-table

> **Versión:** 2.0 (Post-correcciones projects)
> **Metodología:** Funcionalidad-First Anti-Errores
> **Páginas objetivo:** payments, aftersales, visits, clients, installments

---

## 🎯 METODOLOGÍA FUNCIONALIDAD-FIRST

**⚠️ PRINCIPIO FUNDAMENTAL:**
> "Mapear FUNCIONALIDADES antes que DATOS"
> "Preservar COMPORTAMIENTO antes que ESTRUCTURA"

**❌ Enfoque INCORRECTO (Datos-First):**
```typescript
// Ver campos en tipos → crear columnas → esperar que funcione
const columns = dataFields.map(field => ({ accessorKey: field }))
```

**✅ Enfoque CORRECTO (Funcionalidad-First):**
```typescript
// 1. Inventario funcionalidades → 2. Mapear comportamientos → 3. Implementar
const columns = [
  {
    // Funcionalidad: Mostrar info proyecto completa
    accessorKey: "projectNumber",
    header: "Proyecto",
    cell: ({ row }) => <ProjectClientDisplay project={row.original} /> // Reusar componente
  },
  {
    // Funcionalidad: Edición inline de estado
    accessorKey: "status",
    cell: ({ row, table }) => (
      <DropdownMenu> {/* Preservar interactividad */}
        {/* ... */}
      </DropdownMenu>
    )
  }
]
```

---

## 📋 FASE 1: PRE-MIGRACIÓN (OBLIGATORIO)

### 1.1 Análisis Automático
- [ ] **Ejecutar script de análisis:**
  ```bash
  chmod +x ./scripts/migration/analyze-page-functionality.sh
  ./scripts/migration/analyze-page-functionality.sh src/app/[PÁGINA]/
  ```
- [ ] **Revisar output del script** - ¿Alertas críticas?
- [ ] **Capturar métricas baseline:**
  - Elementos interactivos: `[NÚMERO]`
  - Funciones de manejo: `[NÚMERO]`
  - Componentes reutilizables: `[NÚMERO]`

### 1.2 Inventario Manual Detallado
- [ ] **Copiar y completar template:**
  ```bash
  cp docs/technical/migration-templates/pre-migration-inventory-template.md \
     docs/technical/pre-migration-inventory-[PÁGINA].md
  ```
- [ ] **Documentar TODAS las funcionalidades críticas**
- [ ] **Identificar componentes reutilizables (ej: ProjectClientDisplay)**
- [ ] **Mapear comportamientos UX específicos**
- [ ] **Definir criterios de aceptación objetivos**

### 1.3 Backup y Preparación
- [ ] **Crear backup del archivo original:**
  ```bash
  cp src/app/[PÁGINA]/page.tsx src/app/[PÁGINA]/page.tsx.backup
  ```
- [ ] **Crear rama específica:**
  ```bash
  git checkout -b feature/data-table-migration-[PÁGINA]
  ```
- [ ] **Instalar dependencias si faltan:**
  ```bash
  npm install @tanstack/react-table
  ```

---

## 🔧 FASE 2: DURANTE LA MIGRACIÓN (CON GATES)

### 2.1 Gate 1: Estructura Básica
- [ ] **Crear archivo `columns.tsx`:**
  ```bash
  touch src/app/[PÁGINA]/columns.tsx
  ```
- [ ] **Implementar estructura base con componentes reutilizables**
- [ ] **VALIDACIÓN GATE 1:**
  ```bash
  ./scripts/migration/validate-migration-step.sh \
    src/app/[PÁGINA]/page.tsx.backup \
    src/app/[PÁGINA]/page.tsx
  ```
- [ ] **✅ Gate 1 DEBE pasar antes de continuar**

### 2.2 Gate 2: Funcionalidades Interactivas
- [ ] **Implementar edición inline** (ej: DropdownMenu para estado)
- [ ] **Implementar funciones de manejo** (handleStatusChange, etc.)
- [ ] **Conectar mutaciones y estado** (useMutation, toast, etc.)
- [ ] **VALIDACIÓN GATE 2:**
  ```bash
  ./scripts/migration/validate-migration-step.sh \
    src/app/[PÁGINA]/page.tsx.backup \
    src/app/[PÁGINA]/page.tsx
  ```
- [ ] **✅ Gate 2 DEBE pasar antes de continuar**

### 2.3 Gate 3: DataTable Integration
- [ ] **Agregar prop `meta` al DataTable** (si no existe)
- [ ] **Pasar funciones por meta:**
  ```typescript
  <DataTable
    columns={columns}
    data={data}
    meta={{
      handleStatusChange,
      updateStatusMutation,
      // otras funciones críticas
    }}
  />
  ```
- [ ] **VALIDACIÓN GATE 3:**
  ```bash
  npm run typecheck && npm run lint
  ```
- [ ] **✅ TypeScript y ESLint DEBEN pasar**

### 2.4 Validación Continua (Después de cada cambio mayor)
```bash
# Ejecutar después de cada modificación significativa
npm run typecheck && npm run lint && \
./scripts/migration/validate-migration-step.sh \
  src/app/[PÁGINA]/page.tsx.backup \
  src/app/[PÁGINA]/page.tsx
```

---

## ✅ FASE 3: POST-MIGRACIÓN (VALIDACIÓN FINAL)

### 3.1 Validación Automática Completa
- [ ] **Ejecutar validación final:**
  ```bash
  chmod +x ./scripts/migration/final-migration-validation.sh
  ./scripts/migration/final-migration-validation.sh [PÁGINA]
  ```
- [ ] **✅ TODOS los tests automáticos deben pasar**
- [ ] **Completar TODAS las verificaciones manuales interactivas**

### 3.2 Testing Manual Crítico (OBLIGATORIO)
- [ ] **✅ Edición inline funcional** - Probar cambios de estado directos
- [ ] **✅ Todas las columnas visibles** - Verificar información completa
- [ ] **✅ Filtros operativos** - Probar búsqueda y filtros
- [ ] **✅ Acciones por fila** - Probar todos los botones/menús
- [ ] **✅ Ordenamiento** - Click en headers de columnas
- [ ] **✅ Estados de loading** - Verificar feedback visual
- [ ] **✅ Responsive design** - Probar diferentes pantallas
- [ ] **✅ Performance** - Sin regresión de velocidad

### 3.3 Code Review Anti-Errores
- [ ] **Verificar principio DRY respetado:**
  ```bash
  grep -r "ProjectClientDisplay\|StatusBadge\|.*Display" src/app/[PÁGINA]/ --include="*.tsx"
  ```
- [ ] **No duplicación de funcionalidades:**
  ```bash
  # Buscar patrones duplicados
  grep -r "onClick\|handle[A-Z]" src/app/[PÁGINA]/ --include="*.tsx"
  ```
- [ ] **Imports críticos preservados:**
  ```bash
  grep -r "useMutation\|toast\|PROJECT_STATUS_OPTIONS" src/app/[PÁGINA]/ --include="*.tsx"
  ```

### 3.4 Tests de Regresión (Opcional pero Recomendado)
- [ ] **Crear test básico:**
  ```bash
  touch src/app/[PÁGINA]/__tests__/migration-regression.test.tsx
  ```
- [ ] **Test de funcionalidades críticas preservadas**
- [ ] **Test de componentes reutilizables integrados**

---

## 📊 CRITERIOS DE ACEPTACIÓN FINAL

### 🚀 MIGRACIÓN EXITOSA SI:
- [ ] **✅ TypeScript:** Sin errores (`npm run typecheck`)
- [ ] **✅ ESLint:** Solo warnings no críticos (`npm run lint`)
- [ ] **✅ Funcionalidad:** Comportamiento idéntico al original
- [ ] **✅ UX:** Experiencia de usuario sin regresión
- [ ] **✅ Arquitectura:** Componentes reutilizables integrados
- [ ] **✅ Performance:** Sin degradación de velocidad
- [ ] **✅ Validación final:** Script `final-migration-validation.sh` pasa

### 🛑 MIGRACIÓN FALLIDA SI:
- [ ] **❌** Cualquier funcionalidad crítica perdida
- [ ] **❌** Componentes reutilizables no integrados (violación DRY)
- [ ] **❌** Errores de TypeScript o ESLint críticos
- [ ] **❌** Regresión de UX o performance
- [ ] **❌** Script de validación final falla

---

## 🔄 PROCESO DE CORRECCIÓN DE ERRORES

**SI LA MIGRACIÓN FALLA:**

1. **🔍 DIAGNÓSTICO:**
   ```bash
   ./scripts/migration/validate-migration-step.sh \
     src/app/[PÁGINA]/page.tsx.backup \
     src/app/[PÁGINA]/page.tsx --strict
   ```

2. **🛠️ CORRECCIÓN:**
   - Revisar errores específicos reportados por script
   - Consultar inventario pre-migración para funcionalidades faltantes
   - Aplicar lecciones aprendidas de migración `projects`

3. **✅ RE-VALIDACIÓN:**
   - Ejecutar gates de validación nuevamente
   - Repetir hasta que todos los criterios pasen

---

## 📚 LECCIONES APRENDIDAS (De migración projects)

### ❌ ERRORES QUE NO REPETIR:
1. **Crear columnas separadas** cuando existe componente que las combina
2. **Perder edición inline** - siempre implementar DropdownMenu/interactividad
3. **No reutilizar componentes** - buscar *Display, *Form, etc. existentes
4. **No pasar funciones por meta** - tabla necesita acceso a handlers

### ✅ PATRONES QUE FUNCIONAN:
1. **Una columna con ProjectClientDisplay** vs múltiples columnas separadas
2. **DropdownMenu + meta functions** para edición inline
3. **Reutilización sistemática** de componentes existentes
4. **Validación continua** con scripts automatizados

---

## 🎯 PRÓXIMAS MIGRACIONES

### 📋 Cola de Páginas Pendientes:
1. **payments** ← SIGUIENTE (CASO PILOTO con nueva metodología)
2. **aftersales**
3. **visits**
4. **clients**
5. **installments**

### 📈 Mejora Continua:
- [ ] **Documentar lecciones** de cada migración en este checklist
- [ ] **Mejorar scripts** basado en experiencia real
- [ ] **Actualizar templates** con nuevos patrones encontrados
- [ ] **Crear tests automatizados** de patrones comunes

---

**🔄 VERSIÓN:** Este checklist se actualiza después de cada migración para incorporar lecciones aprendidas y mejorar el proceso sistemáticamente.