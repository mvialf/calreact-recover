# 🗺️ Mapeo Completo de Componentes

**Total componentes a migrar:** 99 archivos
**Componentes que NO se mueven:** 57 (ui/) + 2 (examples/)

## 📊 Resumen por Destino

| Destino | Cantidad | Descripción |
|---------|----------|-------------|
| `features/projects/` | 13 | Formularios, modals y componentes de proyecto |
| `features/payments/` | 8 | Sistema de pagos y facturación |
| `features/calendar/` | 10 | Vistas y eventos de calendario |
| `features/clients/` | 4 | Gestión de clientes |
| `features/after-sales/` | 5 | Servicios postventa |
| `features/visits/` | 4 | Gestión de visitas |
| `shared/layouts/` | 3 | Layouts compartidos |
| `shared/feedback/` | 2 | Error handling y feedback |
| **NO MOVER** | 59 | ui/ (57) + examples/ (2) |
| **Total** | **99** | |

## 🔄 Mapeo Detallado por Dominio

### **🏢 Projects Domain (13 componentes)**

#### Formularios → `features/projects/forms/`
```bash
# ORIGEN → DESTINO
src/components/forms/NewProjectEventForm.tsx
  → src/components/features/projects/forms/NewProjectEventForm.tsx

src/components/forms/NewProjectEventLeanForm.tsx
  → src/components/features/projects/forms/NewProjectEventLeanForm.tsx

src/components/forms/compound/ProjectFormCompound.tsx
  → src/components/features/projects/forms/ProjectFormCompound.tsx
```

#### Modals → `features/projects/modals/`
```bash
# ORIGEN → DESTINO
src/components/modals/projects/NewProjectDialog.tsx
  → src/components/features/projects/modals/NewProjectDialog.tsx

src/components/modals/projects/EditProjectDialog.tsx
  → src/components/features/projects/modals/EditProjectDialog.tsx

src/components/modals/calendar/NewProjectEventModal.tsx
  → src/components/features/projects/modals/NewProjectEventModal.tsx

src/components/modals/calendar/NewProjectEventModalV2.tsx
  → src/components/features/projects/modals/NewProjectEventModalV2.tsx
```

#### Imports actualizados:
```typescript
// ANTES:
import { NewProjectEventForm } from '@/components/forms/NewProjectEventForm';
import { NewProjectDialog } from '@/components/modals/projects/NewProjectDialog';

// DESPUÉS:
import {
  NewProjectEventForm,
  NewProjectDialog
} from '@/components/features/projects';
```

### **💰 Payments Domain (8 componentes)**

#### Consolidación de archivos dispersos → `features/payments/modals/`
```bash
# ORIGEN (disperso) → DESTINO (consolidado)
src/components/payment-modal.tsx
  → src/components/features/payments/modals/PaymentModal.tsx

src/components/payment-dialog.tsx
  → src/components/features/payments/modals/PaymentDialog.tsx

src/components/payments/edit-payment-dialog.tsx
  → src/components/features/payments/modals/EditPaymentDialog.tsx

src/components/account-statement-dialog.tsx
  → src/components/features/payments/modals/AccountStatementDialog.tsx
```

#### Beneficio principal:
```bash
# ANTES: Búsqueda en 3 ubicaciones
/[raíz]/payment-modal.tsx
/[raíz]/payment-dialog.tsx
/payments/edit-payment-dialog.tsx
/[raíz]/account-statement-dialog.tsx

# DESPUÉS: Todo en un lugar
/features/payments/modals/
```

### **📅 Calendar Domain (10 componentes)**

#### Views → `features/calendar/views/`
```bash
# ORIGEN → DESTINO
src/components/calendar/calendar-view.tsx
  → src/components/features/calendar/views/CalendarView.tsx

src/components/calendar/month-view.tsx
  → src/components/features/calendar/views/MonthView.tsx

src/components/calendar/week-view.tsx
  → src/components/features/calendar/views/WeekView.tsx

src/components/calendar/day-view.tsx
  → src/components/features/calendar/views/DayView.tsx
```

#### Components → `features/calendar/components/`
```bash
# ORIGEN → DESTINO
src/components/calendar/calendar-event.tsx
  → src/components/features/calendar/components/CalendarEvent.tsx

src/components/calendar/calendar-toolbar.tsx
  → src/components/features/calendar/components/CalendarToolbar.tsx
```

#### Modals → `features/calendar/modals/`
```bash
# ORIGEN → DESTINO
src/components/calendar/event-modal.tsx
  → src/components/features/calendar/modals/EventModal.tsx
```

#### Nomenclatura mejorada:
```bash
# ANTES: kebab-case inconsistente
calendar-view.tsx
month-view.tsx

# DESPUÉS: PascalCase consistente
CalendarView.tsx
MonthView.tsx
```

### **👥 Clients Domain (4 componentes)**

#### Archivos raíz → `features/clients/`
```bash
# ORIGEN → DESTINO
src/components/client-display.tsx
  → src/components/features/clients/components/ClientDisplay.tsx

src/components/client-modal.tsx
  → src/components/features/clients/modals/ClientModal.tsx
```

### **🔧 After-sales Domain (5 componentes)**

#### Consolidación from modals → `features/after-sales/`
```bash
# ORIGEN → DESTINO
src/components/forms/AfterSaleForm.tsx
  → src/components/features/after-sales/forms/AfterSaleForm.tsx

src/components/modals/afterSales/NewAfterSaleDialog.tsx
  → src/components/features/after-sales/modals/NewAfterSaleDialog.tsx

src/components/modals/afterSales/EditAfterSaleDialog.tsx
  → src/components/features/after-sales/modals/EditAfterSaleDialog.tsx

src/components/modals/afterSales/index.ts
  → ❌ ELIMINAR (reemplazado por barrel export)
```

### **🚗 Visits Domain (4 componentes)**

#### From forms + modals → `features/visits/`
```bash
# ORIGEN → DESTINO
src/components/forms/VisitForm.tsx
  → src/components/features/visits/forms/VisitForm.tsx

src/components/modals/visits/NewVisitDialog.tsx
  → src/components/features/visits/modals/NewVisitDialog.tsx

src/components/modals/visits/EditVisitDialog.tsx
  → src/components/features/visits/modals/EditVisitDialog.tsx

src/components/modals/visits/index.ts
  → ❌ ELIMINAR (reemplazado por barrel export)
```

## 🔗 Shared Components (5 componentes)

### **📐 Layouts → `shared/layouts/`**
```bash
# ORIGEN → DESTINO
src/components/layout/PageTableLayout.tsx
  → src/components/shared/layouts/PageTableLayout.tsx

src/components/modals/modalLayout.tsx
  → src/components/shared/layouts/ModalLayout.tsx
```

### **⚠️ Feedback → `shared/feedback/`**
```bash
# ORIGEN → DESTINO
src/components/error-boundary/[archivos]
  → src/components/shared/feedback/ErrorBoundary.tsx
```

## ❌ Componentes que NO se mueven

### **✅ UI Base - MANTENER INTACTO**
```bash
src/components/ui/  # 57 archivos Shadcn
├── accordion.tsx
├── button.tsx
├── dialog.tsx
├── input.tsx
└── [53 archivos más...]
# ✅ NO TOCAR - Ya bien organizados
```

### **🔬 Examples - MANTENER**
```bash
src/components/examples/  # 2 archivos
├── ProjectFormCompoundExample.tsx
└── tag-system-demo.tsx
# ✅ MANTENER - Para desarrollo y testing
```

### **📊 Table/Dashboard - EVALUAR**
```bash
src/components/table/      # ⚠️ EVALUAR si migrar a shared/
src/components/dashboard/  # ⚠️ EVALUAR si es dominio específico
src/components/settings/   # ⚠️ EVALUAR destino
```

## 🗂️ Carpetas a ELIMINAR después de migración

### **📁 Carpetas que quedarán vacías**
```bash
# Verificar y eliminar solo si están vacías:
src/components/modals/projects/     → ❌ ELIMINAR
src/components/modals/calendar/     → ❌ ELIMINAR
src/components/modals/afterSales/   → ❌ ELIMINAR
src/components/modals/visits/       → ❌ ELIMINAR
src/components/modals/              → ❌ ELIMINAR (si queda vacía)
src/components/forms/compound/      → ❌ ELIMINAR
src/components/calendar/            → ❌ ELIMINAR
src/components/payments/            → ❌ ELIMINAR
src/components/layout/              → ❌ ELIMINAR
```

### **⚠️ Carpetas a EVALUAR**
```bash
# Evaluar contenido antes de decidir:
src/components/forms/               # ¿Quedan forms genéricos?
src/components/domains/             # ¿Estructura fantasy?
src/components/shared/              # ¿Archivos legacy?
```

## 📋 Index.ts Files - Barrel Exports

### **Nuevos barrel exports a crear:**
```bash
src/components/features/projects/index.ts     # ✅ CREAR
src/components/features/payments/index.ts     # ✅ CREAR
src/components/features/calendar/index.ts     # ✅ CREAR
src/components/features/clients/index.ts      # ✅ CREAR
src/components/features/after-sales/index.ts  # ✅ CREAR
src/components/features/visits/index.ts       # ✅ CREAR
src/components/shared/index.ts                # ✅ CREAR
```

### **Index.ts files a ELIMINAR:**
```bash
src/components/modals/afterSales/index.ts     # ❌ ELIMINAR
src/components/modals/visits/index.ts         # ❌ ELIMINAR
```

## 🔍 Actualización de Imports

### **Patrones de búsqueda y reemplazo:**

#### Projects:
```bash
# Buscar:
@/components/forms/NewProjectEventForm
@/components/forms/NewProjectEventLeanForm
@/components/forms/compound/ProjectFormCompound
@/components/modals/projects/
@/components/modals/calendar/NewProjectEvent

# Reemplazar por:
@/components/features/projects
```

#### Payments:
```bash
# Buscar:
@/components/payment-modal
@/components/payment-dialog
@/components/payments/edit-payment-dialog
@/components/account-statement-dialog

# Reemplazar por:
@/components/features/payments
```

#### Calendar:
```bash
# Buscar:
@/components/calendar/

# Reemplazar por:
@/components/features/calendar
```

### **Script automatizado de reemplazo:**
```bash
#!/bin/bash
# update-imports.sh

find src/app -name "*.tsx" -o -name "*.ts" | xargs sed -i \
  -e 's|@/components/forms/NewProjectEvent|@/components/features/projects|g' \
  -e 's|@/components/modals/projects/|@/components/features/projects|g' \
  -e 's|@/components/payment-|@/components/features/payments|g' \
  -e 's|@/components/calendar/|@/components/features/calendar|g' \
  -e 's|@/components/client-|@/components/features/clients|g' \
  -e 's|@/components/layout/|@/components/shared/layouts/|g'
```

## 📊 Verificación Post-Migración

### **Componentes que deben existir después:**
```bash
# Total esperado por dominio:
find src/components/features/projects -name "*.tsx" | wc -l  # = 7
find src/components/features/payments -name "*.tsx" | wc -l  # = 4
find src/components/features/calendar -name "*.tsx" | wc -l  # = 7
find src/components/features/clients -name "*.tsx" | wc -l   # = 2
find src/components/features/after-sales -name "*.tsx" | wc -l # = 3
find src/components/features/visits -name "*.tsx" | wc -l    # = 3
find src/components/shared -name "*.tsx" | wc -l            # = 3

# Total migrado: 29 componentes
# Más UI (57) + Examples (2) = 88 componentes finales
```

### **Componentes huérfanos (no deben existir):**
```bash
# Estos NO deben existir después de migración:
src/components/payment-modal.tsx                    # ❌
src/components/client-display.tsx                   # ❌
src/components/forms/NewProjectEventForm.tsx        # ❌
src/components/modals/projects/NewProjectDialog.tsx # ❌
```

---

**📊 Próximo paso:** [05-CHECKLIST-VALIDACION.md](./05-CHECKLIST-VALIDACION.md)
**🔙 Paso anterior:** [03-PLAN-MIGRACION.md](./03-PLAN-MIGRACION.md)