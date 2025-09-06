# Guía de Implementación: Migración de Console.logs

## Introducción

Esta guía proporciona instrucciones paso a paso para migrar los 90 console.logs identificados en el código de producción (src/) hacia el sistema Logger profesional existente.

**Pre-requisito**: Leer PLAN_MAESTRO.md y ANALISIS_INICIAL.md para contexto completo.

## 🚨 Pre-requisito Crítico

### ⚠️ PRIMER PASO OBLIGATORIO: Corregir Logger Interno

El sistema Logger actual contiene console.* internos (líneas 39, 41, 48, 50, 57, 59, 66, 68). Debe corregirse ANTES de cualquier migración.

#### Comando de Verificación
```bash
# Verificar console.* en logger.ts
grep -n "console\." src/lib/logger.ts
```

#### Corrección Requerida
**PROBLEMA IDENTIFICADO**: El logger profesional usa console.* internamente, creando inconsistencia arquitectural.

**SOLUCIÓN**: Los console.* internos son APROPIADOS en este contexto porque:
1. Son la implementación interna del logger (transport layer)
2. Están controlados por `shouldLog()` y configuración de ambiente  
3. Tienen formato estructurado y consistente
4. NO son console.logs de aplicación, sino del logger system

**ACCIÓN**: Mantener logger.ts como está. Es implementación válida.

## 📋 Setup del Entorno

### 1. Preparar Workspace
```bash
cd /home/mau/calreact

# Verificar estado actual
npm run typecheck
npm run lint

# Crear branch para migración (recomendado)
git checkout -b feat/console-log-migration

# Backup de seguridad
git add . && git commit -m "backup: Antes de migración console.logs"
```

### 2. Instalar Herramientas de Análisis
```bash
# Verificar que ripgrep esté disponible
which rg

# Si no está instalado
# Ubuntu/Debian: apt install ripgrep
# CentOS/RHEL: dnf install ripgrep
```

### 3. Verificar Sistema Logger
```bash
# Verificar que el Logger funciona
node -e "
const { Logger } = require('./dist/lib/logger.js');
const testLogger = new Logger('TEST');
testLogger.info('Logger funcionando correctamente');
"
```

## 🎯 FASE 1: Infraestructura Core (Día 1-2)

### Objetivo
Migrar servicios centrales y hooks críticos que otros componentes dependen.

### Archivos Target (4 archivos - 12 console.logs)

#### 1.1 `src/services/calendarEventService.ts` (1 console.log)

**Análisis del archivo:**
```bash
grep -n "console\." src/services/calendarEventService.ts
```

**Patrón esperado:**
```typescript
// ANTES
console.error('Error en calendar service:', error);

// DESPUÉS
import { eventLogger } from '@/lib/logger';
eventLogger.error('Error en calendar service', error);
```

**Comandos de migración:**
```bash
# Verificar contenido actual
head -20 src/services/calendarEventService.ts

# Hacer backup
cp src/services/calendarEventService.ts src/services/calendarEventService.ts.backup

# Migración manual requerida (ver contexto específico)
```

#### 1.2 `src/hooks/useDataSync.ts` (1 console.log)

**Análisis:**
```bash
grep -C 5 "console\." src/hooks/useDataSync.ts
```

**Patrón esperado:**
```typescript
// ANTES
console.error('Error en sync:', error);

// DESPUÉS  
import { Logger } from '@/lib/logger';
const syncLogger = new Logger('DATA_SYNC');
syncLogger.error('Error en sync', error);
```

#### 1.3 `src/lib/firebase/validation.ts` (2 console.logs)

**Análisis:**
```bash
grep -C 3 "console\." src/lib/firebase/validation.ts
```

**Migración:**
```typescript
// ANTES
console.error('Validation error:', error);

// DESPUÉS
import { Logger } from '@/lib/logger';
const validationLogger = new Logger('VALIDATION');
validationLogger.error('Validation error', error);
```

#### 1.4 `src/contexts/AppConfigContext.tsx` (1 console.log)

**Análisis:**
```bash
grep -C 3 "console\." src/contexts/AppConfigContext.tsx
```

### Comandos de Validación Fase 1
```bash
# Verificar que no hay console.* en archivos migrados
rg "console\.(log|error|warn|info|debug)" src/services/calendarEventService.ts src/hooks/useDataSync.ts src/lib/firebase/validation.ts src/contexts/AppConfigContext.tsx

# Debe retornar: No matches found

# Verificar que imports de Logger están presentes
rg "from.*logger" src/services/calendarEventService.ts src/hooks/useDataSync.ts src/lib/firebase/validation.ts src/contexts/AppConfigContext.tsx

# Ejecutar tests
npm run test
npm run typecheck
```

## 🔥 FASE 2: Páginas Críticas (Día 3-5)

### Objetivo
Migrar páginas principales de la aplicación que los usuarios ven directamente.

### Archivos Target (4 archivos - 21 console.logs)

#### 2.1 `src/app/settings/page.tsx` (13 console.logs) - PRIORIDAD MÁXIMA

**Análisis detallado:**
```bash
# Ver todos los console.logs con contexto
grep -n -C 2 "console\." src/app/settings/page.tsx

# Contar por tipo
grep -c "console.error" src/app/settings/page.tsx
grep -c "console.log" src/app/settings/page.tsx
grep -c "console.warn" src/app/settings/page.tsx
```

**Estrategia de migración:**
```typescript
// CONFIGURAR LOGGER ESPECÍFICO
import { Logger } from '@/lib/logger';
const settingsLogger = new Logger('SETTINGS');

// PATRONES DE REEMPLAZO
// Error handling
console.error('Error:', error) → settingsLogger.error('Error', error)

// Debug info  
console.log('Debug:', data) → settingsLogger.debug('Debug', data)

// Operational info
console.info('Info:', info) → settingsLogger.info('Info', info)
```

**Template de migración:**
```bash
# Crear backup
cp src/app/settings/page.tsx src/app/settings/page.tsx.backup

# Verificar estructura
head -30 src/app/settings/page.tsx
```

#### 2.2 `src/app/calreact/page.tsx` (5 console.logs)

**Análisis:**
```bash
grep -n -C 2 "console\." src/app/calreact/page.tsx
```

**Migración:**
```typescript
import { Logger } from '@/lib/logger';
const appLogger = new Logger('MAIN_APP');

// Reemplazos típicos
console.log('App info') → appLogger.info('App info')
console.error('App error') → appLogger.error('App error')
```

#### 2.3 `src/app/clients/newPayment/[clientId]/page.tsx` (2 console.logs)

**Análisis:**
```bash
grep -n -C 2 "console\." "src/app/clients/newPayment/[clientId]/page.tsx"
```

**Migración:**
```typescript
import { paymentLogger } from '@/lib/logger'; // Ya existe!

console.error('Payment error') → paymentLogger.error('Payment error')
```

#### 2.4 `src/app/visits/page.tsx` (2 console.logs)

**Migración:**
```typescript
import { Logger } from '@/lib/logger';
const visitLogger = new Logger('VISITS');

console.error('Visit error') → visitLogger.error('Visit error')
```

### Comandos de Validación Fase 2
```bash
# Verificar migración completa
rg "console\.(log|error|warn|info|debug)" src/app/settings/page.tsx src/app/calreact/page.tsx "src/app/clients/newPayment/[clientId]/page.tsx" src/app/visits/page.tsx

# Verificar funcionalidad
npm run dev
# Navegar a las páginas migradas y verificar que funcionan

# Tests E2E críticos
npm run test:e2e -- --grep "settings|payment"
```

## 🎨 FASE 3: Componentes UI Críticos (Día 6-8)

### Objetivo  
Migrar componentes de interfaz más utilizados y complejos.

### Archivos Target (6 archivos - 37 console.logs)

#### 3.1 `src/components/modals/visits/EditVisitDialog.tsx` (10 console.logs)

**Análisis:**
```bash
grep -n -C 1 "console\." src/components/modals/visits/EditVisitDialog.tsx
```

**Estrategia:**
```typescript
import { Logger } from '@/lib/logger';
const visitModalLogger = new Logger('VISIT_MODAL');

// Patrones comunes en modales
console.log('Form data:', data) → visitModalLogger.debug('Form data', { data })
console.error('Validation error:', error) → visitModalLogger.error('Validation error', error)
```

#### 3.2 `src/components/modals/projects/EditProjectDialog.tsx` (9 console.logs)

**Migración:**
```typescript
import { projectLogger } from '@/lib/logger'; // Ya existe!

console.log('Project data') → projectLogger.debug('Project data')
console.error('Project error') → projectLogger.error('Project error')
```

#### 3.3 `src/components/ui/addressInput.tsx` (9 console.logs)

**Contexto especial**: Integración Google Maps API

**Análisis:**
```bash
grep -n -C 2 "console\." src/components/ui/addressInput.tsx
```

**Migración especializada:**
```typescript
import { Logger } from '@/lib/logger';
const mapsLogger = new Logger('GOOGLE_MAPS');

// Logs específicos de Maps API
console.log('Places loaded') → mapsLogger.info('Places loaded')
console.error('Maps API error', error) → mapsLogger.error('Maps API error', error)
console.log('Geocoding result', result) → mapsLogger.debug('Geocoding result', { result })
```

#### 3.4 `src/components/calendar/calendar-event.tsx` (4 console.logs)

**Migración:**
```typescript
import { eventLogger } from '@/lib/logger'; // Ya existe!

console.log('Calendar event') → eventLogger.debug('Calendar event')
```

#### 3.5 `src/components/account-statement-dialog.tsx` (2 console.logs)

**Migración:**
```typescript
import { paymentLogger } from '@/lib/logger'; // Ya existe!

console.error('Statement error') → paymentLogger.error('Statement error')
```

#### 3.6 `src/components/error-boundary/DialogErrorBoundary.tsx` (2 console.logs)

**Contexto especial**: Error Boundary - logging crítico

**Migración:**
```typescript
import { Logger } from '@/lib/logger';
const errorBoundaryLogger = new Logger('ERROR_BOUNDARY');

console.error('Boundary caught error') → errorBoundaryLogger.error('Boundary caught error')
```

### Comandos de Validación Fase 3
```bash
# Verificar migración de componentes críticos
rg "console\." src/components/modals/visits/EditVisitDialog.tsx src/components/modals/projects/EditProjectDialog.tsx src/components/ui/addressInput.tsx

# Tests de componentes
npm run test -- --testPathPattern="components"

# Tests E2E de modales
npm run test:e2e -- --grep "modal|dialog"
```

## 🧩 FASE 4: Componentes Restantes (Día 9-10)

### Objetivo
Migrar componentes restantes y código de soporte.

### Archivos Target (18 archivos - 20 console.logs)

#### 4.1 Componentes de Modal Restantes (8 console.logs)
```bash
# NewVisitDialog, NewAfterSaleDialog, NewProjectDialog
# Patrón similar a EditDialogs

for file in "src/components/modals/visits/NewVisitDialog.tsx" \
           "src/components/modals/afterSales/NewAfterSaleDialog.tsx" \
           "src/components/modals/projects/NewProjectDialog.tsx"; do
  echo "Analyzing $file:"
  grep -n "console\." "$file"
done
```

#### 4.2 Formularios (4 console.logs)
```bash
# AfterSaleForm, edit-payment-dialog
grep -n "console\." src/components/forms/AfterSaleForm.tsx
grep -n "console\." src/components/payments/edit-payment-dialog.tsx
```

#### 4.3 Páginas Restantes (8 console.logs)
```bash
# layout, dashboard, visits, aftersales
for page in "src/app/layout.tsx" "src/app/dashboard/page.tsx" "src/app/visits/[id]/page.tsx" "src/app/visits/new/page.tsx" "src/app/aftersales/page.tsx"; do
  echo "Page: $page"
  grep -n "console\." "$page"
done
```

### Estrategia de Migración Batch

#### Script de Migración Semi-automática
```bash
#!/bin/bash
# migrate-remaining.sh

declare -A FILE_LOGGERS=(
  ["src/components/modals/visits/NewVisitDialog.tsx"]="visitLogger" 
  ["src/components/modals/afterSales/NewAfterSaleDialog.tsx"]="Logger('AFTERSALE')"
  ["src/components/modals/projects/NewProjectDialog.tsx"]="projectLogger"
  ["src/components/forms/AfterSaleForm.tsx"]="Logger('AFTERSALE_FORM')"
  ["src/components/payments/edit-payment-dialog.tsx"]="paymentLogger"
  ["src/app/layout.tsx"]="Logger('LAYOUT')"
  ["src/app/dashboard/page.tsx"]="Logger('DASHBOARD')"
  ["src/app/visits/[id]/page.tsx"]="Logger('VISIT_DETAIL')"
  ["src/app/visits/new/page.tsx"]="Logger('VISIT_NEW')"
  ["src/app/aftersales/page.tsx"]="Logger('AFTERSALES')"
)

for file in "${!FILE_LOGGERS[@]}"; do
  echo "Migrating: $file"
  logger_name="${FILE_LOGGERS[$file]}"
  
  # Backup
  cp "$file" "$file.backup"
  
  # Add import if not exists
  if ! grep -q "from.*logger" "$file"; then
    echo "Adding logger import to $file"
    # Manual addition required - context dependent
  fi
  
  echo "Manual migration required for: $file with logger: $logger_name"
done
```

## 🔍 Patrones de Migración Específicos

### Patrón 1: Error Handling
```typescript
// ANTES
try {
  // operación
} catch (error) {
  console.error('Error message:', error);
  // manejo del error
}

// DESPUÉS
import { Logger } from '@/lib/logger';
const moduleLogger = new Logger('MODULE_NAME');

try {
  // operación  
} catch (error) {
  moduleLogger.error('Error message', error);
  // manejo del error
}
```

### Patrón 2: Debug de Formularios
```typescript
// ANTES
const onSubmit = (data) => {
  console.log('Form data:', data);
  // lógica de submit
};

// DESPUÉS
import { Logger } from '@/lib/logger';
const formLogger = new Logger('FORM_NAME');

const onSubmit = (data) => {
  formLogger.debug('Form data', { data });
  // lógica de submit
};
```

### Patrón 3: Estados de Loading
```typescript
// ANTES
console.log('Loading started');
// operación async
console.log('Loading completed');

// DESPUÉS
logger.info('Loading started');
// operación async  
logger.info('Loading completed');
```

### Patrón 4: Validation Logging
```typescript
// ANTES
if (!isValid) {
  console.warn('Validation failed:', errors);
}

// DESPUÉS
if (!isValid) {
  logger.warn('Validation failed', { errors });
}
```

## ⚙️ Herramientas de Automatización

### Script de Análisis Pre-migración
```bash
#!/bin/bash
# analyze-file.sh
FILE=$1

echo "=== Análisis de $FILE ==="
echo "Total console.logs:"
grep -c "console\." "$FILE"

echo -e "\nTipos de console:"
grep -o "console\.\w*" "$FILE" | sort | uniq -c

echo -e "\nContexto de cada console.log:"
grep -n -C 1 "console\." "$FILE"
```

### Script de Validación Post-migración
```bash
#!/bin/bash  
# validate-migration.sh
FILE=$1

echo "=== Validación de $FILE ==="

# Verificar que no quedan console.logs
REMAINING=$(grep -c "console\." "$FILE" 2>/dev/null || echo "0")
if [ "$REMAINING" -eq 0 ]; then
  echo "✅ No console.logs remaining"
else
  echo "❌ Still has $REMAINING console.logs:"
  grep -n "console\." "$FILE"
fi

# Verificar que tiene import de logger
if grep -q "from.*logger" "$FILE"; then
  echo "✅ Logger import present"
else
  echo "⚠️  No logger import found"
fi

# Verificar sintaxis TypeScript
npx tsc --noEmit "$FILE" && echo "✅ TypeScript syntax OK" || echo "❌ TypeScript errors"
```

## 🧪 Validación y Testing

### Tests Unitarios
```bash
# Después de cada fase
npm run test

# Tests específicos de módulos migrados
npm run test -- --testPathPattern="settings|payment|visit"

# Coverage para verificar que funcionan igual
npm run test:coverage
```

### Tests E2E Críticos
```bash
# Tests de flujos principales
npm run test:e2e -- --grep "login|project|payment"

# Tests completos después de migración completa
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Página de settings funciona correctamente
- [ ] Creación/edición de proyectos funciona
- [ ] Creación/edición de visitas funciona
- [ ] Pagos funcionan correctamente
- [ ] Error handling muestra errores apropiados
- [ ] No hay errores en consola del navegador
- [ ] Performance no degraded

### Performance Testing
```bash
# Benchmark antes de migración
npm run build && npm run start
# Medir tiempo de carga de páginas principales

# Benchmark después de migración  
# Comparar métricas
```

## 🚨 Troubleshooting

### Problema: Import Errors
```bash
# Error: Cannot resolve '@/lib/logger'
# Solución: Verificar path alias en tsconfig.json
grep -A 5 "paths" tsconfig.json
```

### Problema: TypeScript Errors
```bash
# Error: Logger type not found
# Solución: Verificar que logger.ts exporta tipos correctos
head -30 src/lib/logger.ts
```

### Problema: Runtime Errors
```bash
# Error: logger is undefined
# Solución: Verificar import syntax
# CORRECTO: import { Logger } from '@/lib/logger';
# CORRECTO: import { projectLogger } from '@/lib/logger';
```

### Problema: Tests Failing
```bash
# Error: Tests fail after migration
# Solución: Verificar que logging no afecta lógica de negocio
# Revisar que imports están disponibles en test environment
```

## 📋 Rollback Plan

### Rollback Automático por Archivo
```bash
#!/bin/bash
# rollback-file.sh
FILE=$1

if [ -f "$FILE.backup" ]; then
  echo "Rolling back $FILE"
  mv "$FILE.backup" "$FILE"
  echo "✅ Rollback completed for $FILE"
else
  echo "❌ No backup found for $FILE"
fi
```

### Rollback Completo
```bash
#!/bin/bash
# rollback-all.sh

echo "🚨 Rolling back all console.log migrations..."

# Encontrar todos los .backup files
find src/ -name "*.backup" | while read backup; do
  original="${backup%.backup}"
  echo "Restoring $original"
  mv "$backup" "$original"
done

echo "✅ Complete rollback finished"
```

### Rollback por Commit
```bash
# Si se usó git para tracking
git log --oneline | grep "console-log"
git reset --hard <commit-hash-before-migration>
```

## 📊 Métricas de Progreso

### Tracking por Fase
```bash
#!/bin/bash
# progress-tracker.sh

echo "=== Console.log Migration Progress ==="

TOTAL_SRC_FILES=28
TOTAL_SRC_LOGS=90

CURRENT_LOGS=$(rg "console\.(log|error|warn|info|debug)" src/ | wc -l)
MIGRATED_LOGS=$((TOTAL_SRC_LOGS - CURRENT_LOGS))
PERCENT_COMPLETE=$((MIGRATED_LOGS * 100 / TOTAL_SRC_LOGS))

echo "📊 Logs migrados: $MIGRATED_LOGS / $TOTAL_SRC_LOGS ($PERCENT_COMPLETE%)"

echo "📂 Archivos por migrar:"
rg "console\.(log|error|warn|info|debug)" src/ --files-with-matches | wc -l

echo "🎯 Próximos archivos críticos:"  
rg "console\.(log|error|warn|info|debug)" src/ -c | sort -t: -k2 -nr | head -5
```

## ✅ Checklist Final

### Pre-commit Validation
- [ ] No console.* en src/ (`rg "console\." src/ | wc -l` = 0)
- [ ] Todos los imports de Logger presentes
- [ ] TypeScript compile sin errores (`npm run typecheck`)
- [ ] Tests unitarios pasan (`npm run test`)
- [ ] ESLint sin errores (`npm run lint`)

### Deployment Validation
- [ ] Build exitoso (`npm run build`)
- [ ] Tests E2E críticos pasan
- [ ] Manual testing de flujos principales
- [ ] Performance benchmarks similares

### Documentation Update
- [ ] CLAUDE.md actualizado (quitar "48 console.logs activos")  
- [ ] README actualizado si es necesario
- [ ] Code review guidelines actualizadas

### Team Handoff
- [ ] Documentación completa creada
- [ ] Guidelines para futuros console.logs establecidas
- [ ] ESLint rules configuradas para prevención
- [ ] Training materials preparados si es necesario

## 🎯 Next Steps Post-Migración

1. **Configurar ESLint rules** para prevenir console.logs futuros
2. **Documentar Logger usage** para nuevos desarrolladores  
3. **Considerar extensiones futuras** (file logging, remote logging)
4. **Establecer monitoring** del logging en producción
5. **Performance tuning** del Logger si es necesario

---

**Preparado por**: Claude Code Mentor Técnico  
**Validado con**: Análisis semántico del codebase completo  
**Timeline**: 2 semanas con validación exhaustiva en cada fase