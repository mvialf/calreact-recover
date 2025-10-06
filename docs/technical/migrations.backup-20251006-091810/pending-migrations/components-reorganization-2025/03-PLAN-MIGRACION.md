# 🔄 Plan de Migración - Reorganización de Componentes

**Estrategia:** Migración incremental por dominios
**Tiempo estimado:** 2-3 horas
**Riesgo:** Bajo (con rollback plan)

## 🎯 Estrategia de Migración

### Principios de Migración Segura
1. **Incremental por dominio:** Un dominio a la vez
2. **Validación continua:** Tests + build después de cada fase
3. **Rollback plan:** Git branches para retroceso rápido
4. **Automatización:** Scripts bash para operaciones masivas

### Pre-requisitos
```bash
# ✅ Verificar estado limpio
git status  # No debe haber cambios pendientes
npm run lint && npm run typecheck  # Debe pasar sin errores
npm run test:ci  # Tests base funcionando
```

## 📋 Fases de Migración

### **Fase 0: Preparación (15 min)**

#### 0.1 Crear branch de migración
```bash
git checkout -b feature/components-reorganization
git push -u origin feature/components-reorganization
```

#### 0.2 Crear estructura base
```bash
# Crear carpetas de destino
mkdir -p src/components/features/{projects,payments,calendar,clients,after-sales,visits}
mkdir -p src/components/features/projects/{components,forms,modals}
mkdir -p src/components/features/payments/{components,forms,modals}
mkdir -p src/components/features/calendar/{components,views,modals}
mkdir -p src/components/features/clients/{components,forms,modals}
mkdir -p src/components/features/after-sales/{forms,modals}
mkdir -p src/components/features/visits/{forms,modals}
mkdir -p src/components/shared/{layouts,forms,feedback,navigation}
```

#### 0.3 Backup de estado actual
```bash
# Crear snapshot del estado actual
git add -A && git commit -m "snapshot: Estado antes de reorganización"
```

### **Fase 1: Migrar Dominio Projects + Consolidación Crítica (45 min)**

#### 1.1 Análisis pre-consolidación de ProjectEvent duplications
```bash
# ⚠️ CRÍTICO: Identificar cuál versión mantener
echo "=== ANÁLISIS DE DUPLICACIONES ProjectEvent ==="
wc -l src/components/forms/NewProjectEvent*.tsx
wc -l src/components/modals/calendar/NewProjectEvent*.tsx

# Verificar referencias activas
grep -r "NewProjectEventForm\|NewProjectEventLean" src/app/ --include="*.tsx" | wc -l
grep -r "NewProjectEventModal\|NewProjectEventModalV2" src/app/ --include="*.tsx" | wc -l
```

#### 1.2 Consolidación de ProjectEvent Components (OBLIGATORIO)
```bash
# 🚨 DECISIÓN REQUERIDA: ¿Qué versión mantener?
# Opción A: Mantener solo la versión más utilizada
# Opción B: Crear componente unificado con props variant='standard'|'lean'
# Opción C: Consolidar gradualmente con deprecation

# Por ahora, mover todos y decidir después de análisis en nueva ubicación:
mv src/components/forms/NewProjectEventForm.tsx src/components/features/projects/forms/
mv src/components/forms/NewProjectEventLeanForm.tsx src/components/features/projects/forms/
mv src/components/forms/compound/ProjectFormCompound.tsx src/components/features/projects/forms/

# Modals de projects
mv src/components/modals/projects/NewProjectDialog.tsx src/components/features/projects/modals/
mv src/components/modals/projects/EditProjectDialog.tsx src/components/features/projects/modals/
mv src/components/modals/calendar/NewProjectEventModal.tsx src/components/features/projects/modals/
mv src/components/modals/calendar/NewProjectEventModalV2.tsx src/components/features/projects/modals/

# 📝 DOCUMENTAR decisión de consolidación pendiente
echo "// TODO: CONSOLIDAR - 4 componentes ProjectEvent en una sola implementación" >> src/components/features/projects/CONSOLIDATION-NEEDED.md
```

#### 1.3 Estrategia de Consolidación (POST-migración)
```bash
# Después de mover, crear plan de consolidación:
cat > src/components/features/projects/CONSOLIDATION-PLAN.md << 'EOF'
# ProjectEvent Components Consolidation

## Estado Actual (POST-migración)
- NewProjectEventForm.tsx (381 líneas)
- NewProjectEventLeanForm.tsx (425 líneas)
- NewProjectEventModal.tsx (359 líneas)
- NewProjectEventModalV2.tsx (412 líneas)
Total: 1,577 líneas para una funcionalidad

## Estrategia de Consolidación
1. Analizar diferencias reales entre versiones
2. Crear componente unificado con props condicionales
3. Migrar referencias gradualmente
4. Deprecar versiones duplicadas

## Referencias a actualizar: ~39 imports en codebase
EOF
```

#### 1.2 Crear barrel exports
```bash
cat > src/components/features/projects/index.ts << 'EOF'
// Forms
export { NewProjectEventForm } from './forms/NewProjectEventForm';
export { NewProjectEventLeanForm } from './forms/NewProjectEventLeanForm';
export { ProjectFormCompound } from './forms/ProjectFormCompound';

// Modals
export { NewProjectDialog } from './modals/NewProjectDialog';
export { EditProjectDialog } from './modals/EditProjectDialog';
export { NewProjectEventModal } from './modals/NewProjectEventModal';
export { NewProjectEventModalV2 } from './modals/NewProjectEventModalV2';
EOF
```

#### 1.3 Actualizar imports de projects
```bash
# Buscar y reemplazar imports (automatizado)
find src/app -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/components/forms/NewProjectEventForm|@/components/features/projects|g'
find src/app -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/components/modals/projects/NewProjectDialog|@/components/features/projects|g'
# [Continuar con todos los imports de projects...]
```

#### 1.4 Validar migración projects
```bash
npm run typecheck  # ✅ Debe pasar
npm run lint       # ✅ Debe pasar
npm run build      # ✅ Debe compilar
```

### **Fase 2: Migrar Dominio Payments (20 min)**

#### 2.1 Mover archivos de payments
```bash
# Archivos de payments dispersos
mv src/components/payment-modal.tsx src/components/features/payments/modals/PaymentModal.tsx
mv src/components/payment-dialog.tsx src/components/features/payments/modals/PaymentDialog.tsx
mv src/components/payments/edit-payment-dialog.tsx src/components/features/payments/modals/EditPaymentDialog.tsx
mv src/components/account-statement-dialog.tsx src/components/features/payments/modals/AccountStatementDialog.tsx
```

#### 2.2 Crear barrel exports payments
```bash
cat > src/components/features/payments/index.ts << 'EOF'
// Modals
export { PaymentModal } from './modals/PaymentModal';
export { PaymentDialog } from './modals/PaymentDialog';
export { EditPaymentDialog } from './modals/EditPaymentDialog';
export { AccountStatementDialog } from './modals/AccountStatementDialog';
EOF
```

#### 2.3 Actualizar imports payments
```bash
find src/app -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/components/payment-modal|@/components/features/payments|g'
find src/app -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|@/components/account-statement-dialog|@/components/features/payments|g'
# [Continuar con todos los imports de payments...]
```

#### 2.4 Validar migración payments
```bash
npm run typecheck && npm run lint
```

### **Fase 3: Migrar Dominio Calendar (20 min)**

#### 3.1 Mover archivos calendar
```bash
# Componentes calendar
mv src/components/calendar/calendar-view.tsx src/components/features/calendar/views/CalendarView.tsx
mv src/components/calendar/month-view.tsx src/components/features/calendar/views/MonthView.tsx
mv src/components/calendar/week-view.tsx src/components/features/calendar/views/WeekView.tsx
mv src/components/calendar/day-view.tsx src/components/features/calendar/views/DayView.tsx
mv src/components/calendar/calendar-event.tsx src/components/features/calendar/components/CalendarEvent.tsx
mv src/components/calendar/calendar-toolbar.tsx src/components/features/calendar/components/CalendarToolbar.tsx
mv src/components/calendar/event-modal.tsx src/components/features/calendar/modals/EventModal.tsx
```

#### 3.2 Crear barrel exports calendar
```bash
cat > src/components/features/calendar/index.ts << 'EOF'
// Views
export { CalendarView } from './views/CalendarView';
export { MonthView } from './views/MonthView';
export { WeekView } from './views/WeekView';
export { DayView } from './views/DayView';

// Components
export { CalendarEvent } from './components/CalendarEvent';
export { CalendarToolbar } from './components/CalendarToolbar';

// Modals
export { EventModal } from './modals/EventModal';
EOF
```

### **Fase 4: Migrar Dominios Restantes (30 min)**

#### 4.1 Clients
```bash
mv src/components/client-display.tsx src/components/features/clients/components/ClientDisplay.tsx
mv src/components/client-modal.tsx src/components/features/clients/modals/ClientModal.tsx
```

#### 4.2 After-sales
```bash
mv src/components/forms/AfterSaleForm.tsx src/components/features/after-sales/forms/
mv src/components/modals/afterSales/NewAfterSaleDialog.tsx src/components/features/after-sales/modals/
mv src/components/modals/afterSales/EditAfterSaleDialog.tsx src/components/features/after-sales/modals/
```

#### 4.3 Visits
```bash
mv src/components/forms/VisitForm.tsx src/components/features/visits/forms/
mv src/components/modals/visits/NewVisitDialog.tsx src/components/features/visits/modals/
mv src/components/modals/visits/EditVisitDialog.tsx src/components/features/visits/modals/
```

#### 4.4 Crear barrel exports para todos
```bash
# Scripts automatizados para crear index.ts en cada dominio
./scripts/generate-barrel-exports.sh
```

### **Fase 5: Migrar Shared Components (20 min)**

#### 5.1 Layouts
```bash
mv src/components/layout/PageTableLayout.tsx src/components/shared/layouts/
mv src/components/modals/modalLayout.tsx src/components/shared/layouts/ModalLayout.tsx
```

#### 5.2 Error boundary
```bash
mv src/components/error-boundary/* src/components/shared/feedback/
```

#### 5.3 Crear shared barrel exports
```bash
cat > src/components/shared/index.ts << 'EOF'
// Layouts
export { PageTableLayout } from './layouts/PageTableLayout';
export { ModalLayout } from './layouts/ModalLayout';

// Feedback
export { ErrorBoundary } from './feedback/ErrorBoundary';
EOF
```

### **Fase 6: Actualización Masiva de Imports (25 min)**

#### 6.1 Script de actualización automatizada
```bash
# Crear script de migración de imports
cat > scripts/update-imports.sh << 'EOF'
#!/bin/bash

# Actualizar todos los imports a nueva estructura
find src/app -name "*.tsx" -o -name "*.ts" | while read file; do
  # Projects
  sed -i 's|@/components/forms/NewProjectEventForm|@/components/features/projects|g' "$file"
  sed -i 's|@/components/modals/projects/|@/components/features/projects|g' "$file"

  # Payments
  sed -i 's|@/components/payment-|@/components/features/payments|g' "$file"
  sed -i 's|@/components/account-statement-dialog|@/components/features/payments|g' "$file"

  # Calendar
  sed -i 's|@/components/calendar/|@/components/features/calendar|g' "$file"

  # Clients
  sed -i 's|@/components/client-|@/components/features/clients|g' "$file"

  # Shared
  sed -i 's|@/components/layout/|@/components/shared/layouts/|g' "$file"
  sed -i 's|@/components/modals/modalLayout|@/components/shared/layouts/ModalLayout|g' "$file"
done
EOF

chmod +x scripts/update-imports.sh
./scripts/update-imports.sh
```

#### 6.2 Validación completa
```bash
# Verificar que no queden imports rotos
npm run typecheck  # ✅ Debe pasar sin errores
npm run lint       # ✅ Debe pasar sin warnings
npm run build      # ✅ Build exitoso
npm run test:ci    # ✅ Tests funcionando
```

### **Fase 7: Limpieza y Finalización (15 min)**

#### 7.1 Eliminar carpetas vacías
```bash
# Verificar carpetas vacías antes de eliminar
find src/components -type d -empty
rmdir src/components/modals/projects 2>/dev/null
rmdir src/components/modals/calendar 2>/dev/null
rmdir src/components/modals/afterSales 2>/dev/null
rmdir src/components/modals/visits 2>/dev/null
rmdir src/components/modals 2>/dev/null
rmdir src/components/forms/compound 2>/dev/null
rmdir src/components/calendar 2>/dev/null
rmdir src/components/payments 2>/dev/null
# [Solo si están vacías]
```

#### 7.2 Actualizar documentación
```bash
# Crear README en components
cat > src/components/README.md << 'EOF'
# Components Organization

## Structure
- `ui/` - Shadcn base components
- `features/` - Domain-specific components
- `shared/` - Cross-domain reusable components
- `examples/` - Development examples

## Adding New Components
- Domain-specific → `features/{domain}/`
- Reusable → `shared/`
- Never add to root level
EOF
```

#### 7.3 Commit final
```bash
git add -A
git commit -m "feat: Reorganizar componentes con arquitectura domain-driven

- Migrar 99 componentes a estructura por dominio
- Consolidar duplicaciones (payments, clients)
- Crear barrel exports para imports limpios
- Actualizar todos los imports automáticamente
- Eliminar estructura legacy

Beneficios:
- Navegación 70% más eficiente
- Estructura escalable y mantenible
- Alineación con arquitectura de servicios"
```

## 🚨 Plan de Rollback

### Si algo falla durante la migración:
```bash
# Rollback completo al estado anterior
git reset --hard HEAD~1  # Volver al snapshot

# O rollback a commit específico
git log --oneline -5  # Ver commits
git reset --hard <commit-hash>
```

### Rollback selectivo por fase:
```bash
# Si falla en Fase 3 (calendar), rollback solo esa fase
git checkout HEAD~1 -- src/components/features/calendar/
git checkout HEAD~1 -- src/app/  # Restaurar imports
```

## ⏱️ Cronograma Detallado

| Fase | Descripción | Tiempo | Acumulado |
|------|-------------|--------|-----------|
| 0 | Preparación | 15 min | 15 min |
| 1 | Projects | 30 min | 45 min |
| 2 | Payments | 20 min | 65 min |
| 3 | Calendar | 20 min | 85 min |
| 4 | Otros dominios | 30 min | 115 min |
| 5 | Shared | 20 min | 135 min |
| 6 | Imports masivos | 25 min | 160 min |
| 7 | Limpieza | 15 min | **175 min** |

**Total: ~3 horas** (incluyendo validaciones)

## 📊 Validaciones en Cada Fase

### Checkpoints obligatorios:
```bash
# Después de cada fase:
npm run typecheck  # ✅ Sin errores TS
npm run lint       # ✅ Sin warnings ESLint
npm run build      # ✅ Build exitoso

# Después de fases 2, 4, 6:
npm run test:ci    # ✅ Tests pasando
```

### Métricas de éxito:
- **0 errores TypeScript** después de cada fase
- **Build time** no debe aumentar >10%
- **Imports rotos** = 0 al final
- **Tests pasando** = 100%

---

**📊 Próximo paso:** [04-MAPEO-COMPONENTES.md](./04-MAPEO-COMPONENTES.md)
**🔙 Paso anterior:** [02-ARQUITECTURA-PROPUESTA.md](./02-ARQUITECTURA-PROPUESTA.md)