# 🚀 Data Table Migration - Próximos Pasos

**Fecha:** Septiembre 2025
**Estado:** Fase 1 completada - Roadmap para Fases 2 y 3
**Prioridad:** Alta (eliminar código duplicado restante)

---

## 📋 Roadmap de Migración

### 🎯 **Fase 2: Migración de Páginas Principales (Próxima)**

#### 1️⃣ **Payments Page** - Prioridad: Alta
**Archivo:** `/src/app/payments/page.tsx`
**Tiempo estimado:** 2-3 horas
**Complejidad:** Media

**Estado actual:**
- 📊 Tabla manual con lógica duplicada
- 🔍 Filtros por método de pago
- ✏️ EditPaymentDialog integrado
- 📅 Filtros por rango de fechas

**Pasos específicos:**
1. **Crear columnas:** `src/app/payments/columns.tsx`
```typescript
export const createPaymentsColumns = ({
  onEdit,
  onDelete,
}: PaymentsColumnsProps): ColumnDef<EnrichedPayment>[] => [
  // Campos clave: amount, paymentDate, paymentMethod, projectNumber, clientName
  // Acciones: Edit, Delete
]
```

2. **Migrar página:** Reemplazar tabla manual con DataTable
3. **Filtros específicos:**
```typescript
const paymentMethodOptions = PAYMENT_METHODS.map(method => ({
  label: method.label,
  value: method.value
}))

const filterableColumns = [
  { id: "paymentMethod", title: "Método de Pago", options: paymentMethodOptions }
]
```

4. **Integrar EditPaymentDialog** manteniendo props actuales
5. **Testing:** Validar funcionalidad completa

---

#### 2️⃣ **Payments Installment Page** - Prioridad: Alta
**Archivo:** `/src/app/payments/installment/page.tsx`
**Tiempo estimado:** 3-4 horas
**Complejidad:** Media-Alta

**Funcionalidades específicas:**
- 📊 Cuotas generadas automáticamente
- ✅ Estados de pago (isPaid)
- 📈 Resúmenes por mes
- 🎯 Filtros por estado de pago

**Consideraciones especiales:**
- Datos calculados en tiempo real
- Integración con reportes mensuales
- UI específica para cuotas pendientes

---

#### 3️⃣ **Clients Page** - Prioridad: Media
**Archivo:** `/src/app/clients/page.tsx`
**Tiempo estimado:** 1-2 horas
**Complejidad:** Baja

**Estado actual:**
- ✅ Ya usa primitivos de `@/components/ui/table`
- 🔧 Solo necesita upgrade a DataTable completo
- 📝 ClientModal ya integrado

**Migración rápida:**
- Funcionalidad básica (nombre, email, teléfono, acciones)
- Sin filtros complejos necesarios
- Ideal para familiarizarse con el patrón

---

### 🌟 **Fase 3: Páginas Secundarias**

#### 4️⃣ **AfterSales Page** - Prioridad: Media
**Archivo:** `/src/app/aftersales/page.tsx`
**Tiempo estimado:** 2-3 horas
**Complejidad:** Media

#### 5️⃣ **Visits Page** - Prioridad: Media
**Archivo:** `/src/app/visits/page.tsx`
**Tiempo estimado:** 2-3 horas
**Complejidad:** Media

---

## 🛠️ Guía Paso a Paso para Migración

### Template de Migración

#### 1. **Crear archivo de columnas**
```typescript
// src/app/[page]/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
// ... otros imports específicos

interface [Page]ColumnsProps {
  onEdit: (item: [Type]) => void
  onDelete: (item: [Type]) => void
  // ... otras acciones específicas
}

export const create[Page]Columns = ({
  onEdit,
  onDelete,
}: [Page]ColumnsProps): ColumnDef<[Type]>[] => [
  // Row selection (si se necesita)
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },

  // Columnas de datos con sorting
  {
    accessorKey: "[fieldName]",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="[Display Name]" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("[fieldName]") as [Type]
      return <div className="font-medium">{value}</div>
    },
  },

  // Columna de acciones
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onEdit(row.original)}>
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(row.original)}>
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
```

#### 2. **Refactorizar página principal**
```typescript
// src/app/[page]/page.tsx
import { DataTable } from '@/components/data-table'
import { create[Page]Columns } from './columns'

const [Page]Page: React.FC = () => {
  // Estados existentes (mantener los necesarios)
  const [selectedItems, setSelectedItems] = useState<[Type][]>([])

  // Handlers para acciones (adaptar existentes)
  const handleEdit = (item: [Type]) => { /* lógica existente */ }
  const handleDelete = (item: [Type]) => { /* lógica existente */ }

  // Columnas memoizadas
  const columns = React.useMemo(() => create[Page]Columns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  }), [])

  // Filtros (adaptar según necesidad)
  const filterOptions = [
    {
      id: "[filterField]",
      title: "[Filter Title]",
      options: [/* opciones específicas */]
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header existente */}

      <DataTable
        columns={columns}
        data={[filteredData]}
        searchKey="[primarySearchField]"
        searchPlaceholder="Buscar..."
        filterableColumns={filterOptions}
        onRowSelectionChange={setSelectedItems}
        enableRowSelection={[true/false]}
      />

      {/* Modales existentes (mantener) */}
    </div>
  )
}
```

#### 3. **Checklist de migración**
- [ ] Crear archivo `columns.tsx`
- [ ] Identificar campos para columnas
- [ ] Definir acciones necesarias (edit, delete, etc.)
- [ ] Migrar lógica de filtros
- [ ] Adaptar búsqueda global
- [ ] Integrar modales existentes
- [ ] Verificar tipos TypeScript
- [ ] Ejecutar `npm run lint && npm run typecheck`
- [ ] Testing manual completo

---

## ⚡ Features Avanzadas por Implementar

### 🎯 **Prioridad Alta - Funcionalidades Básicas**

#### 1. **Export to CSV**
```typescript
// Agregar a DataTable o como componente separado
const exportToCsv = (data: any[], filename: string) => {
  const csv = /* lógica de conversión */
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}

// En toolbar:
<Button onClick={() => exportToCsv(filteredData, 'data.csv')}>
  <Download className="w-4 h-4 mr-2" />
  Exportar CSV
</Button>
```

#### 2. **Bulk Actions**
```typescript
// En página principal:
const handleBulkDelete = () => {
  if (selectedItems.length === 0) return
  // Lógica para eliminar múltiples items
}

// En UI:
{selectedItems.length > 0 && (
  <div className="flex items-center space-x-2">
    <span>{selectedItems.length} seleccionados</span>
    <Button variant="destructive" onClick={handleBulkDelete}>
      Eliminar seleccionados
    </Button>
  </div>
)}
```

#### 3. **Column Presets**
```typescript
// Guardar configuraciones de columnas en localStorage
const saveColumnPreset = (name: string, visibilityState: VisibilityState) => {
  localStorage.setItem(`table-preset-${name}`, JSON.stringify(visibilityState))
}

const loadColumnPreset = (name: string) => {
  const saved = localStorage.getItem(`table-preset-${name}`)
  return saved ? JSON.parse(saved) : {}
}
```

### 🚀 **Prioridad Media - Performance**

#### 1. **Virtual Scrolling** (para datasets >1000 filas)
```typescript
// Configuración en DataTable
import { useVirtualizer } from '@tanstack/react-virtual'

// Implementar cuando sea necesario para performance
const virtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => scrollElementRef.current,
  estimateSize: () => 35, // altura estimada de fila
})
```

#### 2. **Server-side Operations**
```typescript
// API endpoints necesarios:
interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  pageCount: number
  currentPage: number
}

// GET /api/projects?page=1&limit=20&sort=createdAt&order=desc&filter[status]=active
// Integración con TanStack Query existente
```

### 🌟 **Prioridad Baja - UX Enhancements**

#### 1. **Advanced Filters Panel**
- Filtros por rango de fechas
- Filtros numéricos (mayor que, menor que)
- Filtros de texto avanzados (contiene, empieza con)

#### 2. **Table Presets**
- Guardar configuraciones completas (columnas + filtros + sorting)
- Presets por usuario
- Presets compartidos

#### 3. **Real-time Updates**
- WebSocket integration para updates automáticos
- Optimistic updates con TanStack Query

---

## 🧪 Testing Strategy

### Unit Testing
```typescript
// src/components/data-table/__tests__/data-table.test.tsx
import { render, screen } from '@testing-library/react'
import { DataTable } from '../data-table'

describe('DataTable', () => {
  it('renders data correctly', () => {
    // Test básico de renderizado
  })

  it('handles sorting', () => {
    // Test de ordenamiento
  })

  it('handles filtering', () => {
    // Test de filtros
  })
})
```

### Integration Testing
```typescript
// src/app/projects/__tests__/projects-page.test.tsx
describe('Projects Page', () => {
  it('displays projects in table', () => {
    // Test de integración completa
  })
})
```

### E2E Testing
```typescript
// e2e/data-table-workflows.spec.ts
test('complete table workflow', async ({ page }) => {
  // Test E2E de flujos completos
})
```

---

## 🚨 Consideraciones y Troubleshooting

### Problemas Comunes

#### 1. **Tipos TypeScript**
```typescript
// Error común: Property does not exist on type
// Solución: Verificar que los accessorKey coincidan con las propiedades del tipo

interface ProjectType {
  projectNumber: string  // ✅ Correcto
  name: string          // ❌ No existe
}

// En columnas:
accessorKey: "projectNumber"  // ✅ Correcto
accessorKey: "name"          // ❌ Error TypeScript
```

#### 2. **Performance con Datasets Grandes**
```typescript
// Problema: Lag en rendering con >500 filas
// Solución: Implementar paginación más agresiva
const table = useReactTable({
  // ...
  initialState: {
    pagination: {
      pageSize: 25  // Reducir de 50 a 25
    }
  }
})
```

#### 3. **Filtros No Funcionan**
```typescript
// Problema: Filtros customizados no se aplican
// Solución: Verificar filterFn en definición de columna

{
  accessorKey: "status",
  filterFn: (row, id, value) => {
    // Debe retornar boolean
    return value.includes(row.getValue(id))
  },
}
```

### Best Practices

#### 1. **Memoización de Columnas**
```typescript
// ✅ Siempre memoizar columnas para evitar re-renders
const columns = React.useMemo(() => createColumns({ ... }), [])

// ❌ No crear columnas en cada render
const columns = createColumns({ ... })  // Re-render costoso
```

#### 2. **Manejo de Estados**
```typescript
// ✅ Estados específicos para cada modal/acción
const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)
const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

// ❌ Estado genérico confuso
const [selectedProject, setSelectedProject] = useState<Project | null>(null)
const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null)
```

#### 3. **Optimización de Filtros**
```typescript
// ✅ Filtros memoizados para opciones estáticas
const statusOptions = useMemo(() =>
  PROJECT_STATUS_OPTIONS.map(opt => ({ label: opt.label, value: opt.value }))
, [])

// ❌ Recalcular opciones en cada render
const statusOptions = PROJECT_STATUS_OPTIONS.map(/* ... */)
```

---

## 📊 Métricas de Éxito

### Objetivos por Fase

#### Fase 2 (Próximas 3 páginas)
- **Código eliminado:** ~800 líneas adicionales
- **Páginas migradas:** 4/5 páginas principales
- **Consistency:** UI unificada en 80% de tablas
- **Performance:** Tiempo de carga <200ms para datasets actuales

#### Fase 3 (Páginas restantes)
- **Código eliminado:** Total ~1,200 líneas
- **Cobertura:** 100% tablas migradas
- **Features:** Export CSV, bulk actions implementadas
- **Escalabilidad:** Ready para 10K+ registros

### Métricas de Calidad
- **TypeScript errors:** 0 (mantener)
- **ESLint errors:** 0 (mantener)
- **Test coverage:** >80% en componentes data-table
- **Performance budget:** <500ms tiempo de respuesta total
- **User satisfaction:** Feedback positivo en features nuevas

---

## 📚 Recursos de Desarrollo

### Referencias Rápidas
- **Página ejemplo:** `/src/app/projects/` - Implementación completa
- **Documentación técnica:** `/docs/technical/data-table-migration.md`
- **TanStack Table:** [Docs oficiales](https://tanstack.com/table/v8)
- **Shadcn Examples:** [Data Table examples](https://ui.shadcn.com/examples/tasks)

### Comandos Esenciales
```bash
# Desarrollo activo
npm run dev

# Validación obligatoria tras cada cambio
npm run lint && npm run typecheck

# Testing completo
npm run test:ci && npm run build
```

### Snippets Útiles
Crear archivo `.vscode/data-table.code-snippets` con templates rápidos para migración.

---

**🎯 Objetivo inmediato:** Migrar `/app/payments/page.tsx` usando este roadmap
**⏱️ Tiempo estimado total restante:** 8-12 horas para completar todas las páginas
**📈 ROI esperado:** 70% reducción en código duplicado + escalabilidad automática

**📊 Generado:** Septiembre 2025
**🔄 Actualizar:** Tras cada migración completada