# Checklist de Validación: Migración Console.logs

## Introducción

Este documento proporciona checklists completos para validar cada etapa de la migración de console.logs. Cada checklist debe completarse antes de proceder a la siguiente fase.

**Uso**: Marcar cada ítem como ✅ completado o ❌ fallido. Los elementos fallidos deben corregirse antes de continuar.

## 🚀 Pre-Migración Checklist

### Preparación del Entorno

#### Herramientas y Dependencias
- [ ] Node.js 18+ instalado y funcionando
- [ ] npm/yarn disponible y actualizado
- [ ] TypeScript 5.8.3 configurado correctamente
- [ ] ripgrep instalado para búsquedas (`which rg`)
- [ ] tsx disponible para ejecutar scripts (`npx tsx --version`)

#### Estado del Proyecto
- [ ] Working directory limpio (`git status`)
- [ ] Última versión del código pulled
- [ ] Todas las dependencias instaladas (`npm install`)
- [ ] Build actual exitoso (`npm run build`)
- [ ] Tests actuales pasando (`npm run test`)

#### Backup y Seguridad
- [ ] Commit de backup creado (`git commit -m "backup: antes migración console.logs"`)
- [ ] Branch de migración creado (`git checkout -b feat/console-log-migration`)
- [ ] Scripts de migración copiados a `scripts/console-log-migration/`

### Análisis Inicial
- [ ] Script de análisis ejecutado (`npm run console-logs:analyze`)
- [ ] Reporte de análisis revisado
- [ ] 90 console.logs en src/ identificados
- [ ] Archivos críticos priorizados
- [ ] Plan de fases confirmado

**Criterio de Avance**: Todos los ítems ✅ antes de comenzar migración.

---

## 📋 FASE 1: Infraestructura Core ✅ COMPLETADA

### Pre-Fase 1
- [x] Logger system verificado (`src/lib/logger.ts` funcional)
- [x] Tests unitarios pasando antes de modificaciones
- [x] Archivos target identificados:
  - [x] `src/services/calendarEventService.ts`
  - [x] `src/hooks/useDataSync.ts`
  - [x] `src/lib/firebase/validation.ts`
  - [x] `src/contexts/AppConfigContext.tsx`

### Migración Fase 1
- [x] **calendarEventService.ts**
  - [x] Backup creado (`.backup`)
  - [x] Console.logs identificados (1 expected)
  - [x] Logger import agregado
  - [x] Console.logs migrados a `eventLogger`
  - [x] Sintaxis TypeScript válida
  - [x] Funcionalidad verificada

- [x] **useDataSync.ts**
  - [x] Backup creado
  - [x] Console.logs identificados (1 expected)
  - [x] Logger import agregado (`Logger('DATA_SYNC')`)
  - [x] Console.logs migrados
  - [x] Hook funciona correctamente

- [x] **firebase/validation.ts**
  - [x] Backup creado
  - [x] Console.logs identificados (2 expected)
  - [x] Logger import agregado (`Logger('FIREBASE_VALIDATION')`)
  - [x] Console.error migrados
  - [x] Validaciones funcionan correctamente

- [x] **AppConfigContext.tsx**
  - [x] Backup creado
  - [x] Console.logs identificados (1 expected)
  - [x] Logger import agregado (`Logger('APP_CONFIG')`)
  - [x] Context funciona correctamente

### Post-Fase 1 Validación
- [x] **Console.logs Verificación**
  - [x] `rg "console\." src/services/calendarEventService.ts` = 0 matches
  - [x] `rg "console\." src/hooks/useDataSync.ts` = 0 matches
  - [x] `rg "console\." src/lib/firebase/validation.ts` = 0 matches
  - [x] `rg "console\." src/contexts/AppConfigContext.tsx` = 0 matches

- [x] **Imports Verificación**
  - [x] Todos los archivos migrados tienen imports Logger
  - [x] No hay imports duplicados
  - [x] Path aliases (@/lib/logger) funcionan

- [x] **Funcionalidad**
  - [x] Calendar events cargan correctamente
  - [x] Data sync funciona sin errores
  - [x] Firebase validation opera normalmente
  - [x] App config context se mantiene

- [x] **Tests y Build**
  - [x] `npm run typecheck` exitoso
  - [x] `npm run test` exitoso
  - [x] `npm run lint` sin errores en archivos migrados

**✅ Criterio de Avance CUMPLIDO**: 100% de ítems ✅ - LISTO PARA FASE 2.

---

## 🔥 FASE 2: Páginas Críticas ✅ COMPLETADA

### Pre-Fase 2
- [x] Fase 1 completamente validada
- [x] Páginas target identificadas:
  - [x] `src/app/settings/page.tsx` (13 logs - CRÍTICO)
  - [x] `src/app/calreact/page.tsx` (5 logs)
  - [x] `src/app/clients/newPayment/[clientId]/page.tsx` (2 logs)
  - [x] `src/app/visits/page.tsx` (2 logs)

### Migración Fase 2

#### settings/page.tsx (PRIORIDAD MÁXIMA)
- [x] **Pre-migración**
  - [x] Backup creado
  - [x] 13 console.logs confirmados
  - [x] Página funcional antes de migración
  - [x] Tests relacionados identificados

- [x] **Migración**
  - [x] Logger import agregado (`settingsLogger`)
  - [x] Console.error → settingsLogger.error
  - [x] Console.log → settingsLogger.debug
  - [x] Console.warn → settingsLogger.warn
  - [x] Console.info → settingsLogger.info
  - [x] Todos los 13 logs migrados

- [x] **Post-migración**
  - [x] `rg "console\." src/app/settings/page.tsx` = 0 matches
  - [x] Página carga correctamente
  - [x] Todas las funcionalidades operan
  - [x] Error handling mantiene comportamiento
  - [x] No errores en consola del navegador

#### calreact/page.tsx
- [x] **Migración**
  - [x] Backup creado
  - [x] 5 console.logs migrados
  - [x] Logger import agregado (`eventLogger`)
  - [x] Sin console.logs restantes

- [x] **Validación**
  - [x] Página principal carga
  - [x] Navegación funciona
  - [x] Error handling operativo

#### clients/newPayment/[clientId]/page.tsx
- [x] **Migración**
  - [x] Backup creado
  - [x] 2 console.logs migrados
  - [x] clientLogger usado
  - [x] Sin console.logs restantes

- [x] **Validación**
  - [x] Página de nuevos pagos funciona
  - [x] Formulario de pago operativo
  - [x] Navegación paramétrica correcta

#### visits/page.tsx
- [x] **Migración**
  - [x] Backup creado
  - [x] 2 console.logs migrados
  - [x] Logger import agregado (`visitLogger`)
  - [x] Sin console.logs restantes

- [x] **Validación**
  - [x] Lista de visitas carga
  - [x] Funcionalidades de visitas operan
  - [x] Navegación funciona

### Post-Fase 2 Validación Global
- [x] **Console.logs Verificación**
  - [x] 22 console.logs migrados en total (Fase 2)
  - [x] Todas las páginas sin console.logs restantes

- [x] **Funcionalidad End-to-End**
  - [x] Usuario puede navegar a settings
  - [x] Usuario puede crear nuevo pago
  - [x] Usuario puede ver lista de visitas
  - [x] Página principal carga correctamente

- [x] **Performance y UX**
  - [x] Tiempo de carga similar pre/post migración
  - [x] No errores JavaScript en DevTools
  - [x] Logger no impacta performance perceptible

**✅ Criterio de Avance CUMPLIDO**: 100% funcionalidad mantenida + 0 console.logs.

---

## 🎨 FASE 3: Componentes UI Críticos ⚠️ PARCIALMENTE COMPLETADA

### Pre-Fase 3
- [x] Fases 1 y 2 completamente validadas
- [x] Componentes target identificados:
  - [ ] `EditVisitDialog.tsx` (10 logs) - ⏳ PENDIENTE
  - [ ] `EditProjectDialog.tsx` (7 logs) - ⏳ PENDIENTE  
  - [ ] `addressInput.tsx` (9 logs) - ⏳ PENDIENTE
  - [ ] `calendar-event.tsx` (4 logs) - ⏳ PENDIENTE
  - [ ] `account-statement-dialog.tsx` (2 logs) - ⏳ PENDIENTE
  - [ ] `DialogErrorBoundary.tsx` (2 logs) - ⏳ PENDIENTE

### ✅ COMPLETADO EN FASE 3 (Commit df55711 - 6 Sep 2025)
- [x] **Páginas adicionales migradas**: 
  - [x] `src/app/aftersales/page.tsx` (2 → 0)
  - [x] `src/app/visits/new/page.tsx` (1 → 0)
  - [x] `src/app/visits/[id]/page.tsx` (1 → 0)
  - [x] `src/app/dashboard/page.tsx` (1 → 0)
  - [x] `src/app/layout.tsx` (1 → 0)
- [x] **Formularios y modales migrados**:
  - [x] `src/components/forms/AfterSaleForm.tsx` (2 → 0)
  - [x] `src/components/modals/projects/NewProjectDialog.tsx` (2 → 0)
  - [x] `src/components/modals/visits/NewVisitDialog.tsx` (2 → 0) 
  - [x] `src/components/modals/afterSales/NewAfterSaleDialog.tsx` (2 → 0)
- [x] **Nuevos loggers agregados**: visitLogger, settingsLogger, afterSalesLogger

### Migración por Componente

#### EditVisitDialog.tsx (CRÍTICO) - ⏳ PENDIENTE
- [ ] **Pre-migración**
  - [ ] Backup crear
  - [x] 10 console.error confirmados (estado actual)
  - [x] Modal funcional (verificado)
  - [x] Form validation operativa

- [ ] **Migración PENDIENTE**
  - [ ] Logger import agregar (`visitLogger` disponible)
  - [ ] Form debug logs → visitLogger.debug
  - [ ] Error handling → visitLogger.error
  - [ ] Validation logs → visitLogger.warn
  - [ ] Todos los 10 logs migrar

- [ ] **Validación**
  - [ ] Modal abre correctamente
  - [ ] Form submission funciona
  - [ ] Validation errors aparecen
  - [ ] Modal cierra correctamente
  - [ ] No errores en consola

#### EditProjectDialog.tsx - ⏳ PENDIENTE
- [ ] **Migración PENDIENTE**
  - [x] 7 console.error confirmados (estado actual)
  - [x] projectLogger disponible
  - [ ] Console.logs migrar
  - [ ] Sin console.logs restantes

- [ ] **Validación PENDIENTE**
  - [x] Modal de edición de proyecto funciona
  - [x] Form data persiste correctamente
  - [x] Validaciones operativas

#### addressInput.tsx (Google Maps)
- [ ] **Pre-migración**
  - [ ] 9 console.logs confirmados
  - [ ] Integración Maps API funcional
  - [ ] Autocomplete operativo

- [ ] **Migración**
  - [ ] Logger import agregado (`Logger('GOOGLE_MAPS')`)
  - [ ] Maps API logs → mapsLogger.info
  - [ ] Error logs → mapsLogger.error
  - [ ] Geocoding logs → mapsLogger.debug

- [ ] **Validación**
  - [ ] Google Maps carga correctamente
  - [ ] Autocomplete funciona
  - [ ] Geocoding operativo
  - [ ] Error handling para Maps API
  - [ ] No impacto en performance Maps

#### Componentes Restantes
- [ ] **calendar-event.tsx**
  - [ ] 4 logs migrados con eventLogger
  - [ ] Calendar rendering funcional

- [ ] **account-statement-dialog.tsx**
  - [ ] 2 logs migrados con paymentLogger
  - [ ] Statement dialog operativo

- [ ] **DialogErrorBoundary.tsx**
  - [ ] 2 logs migrados con Logger('ERROR_BOUNDARY')
  - [ ] Error boundary catching funciona
  - [ ] Error reporting operativo

### Post-Fase 3 Validación
- [ ] **Componentes Críticos Test**
  - [ ] Todos los modales abren/cierran
  - [ ] Formularios funcionan correctamente
  - [ ] Google Maps integración sin degradación
  - [ ] Error boundaries operativos

- [ ] **Console.logs Check**
  - [ ] 37 console.logs migrados total (Fase 3)
  - [ ] Todos los componentes sin console.logs

- [ ] **Integration Test**
  - [ ] Flujo completo: crear proyecto → editar → crear visita
  - [ ] Address input en formularios funciona
  - [ ] Error handling consistente

**Criterio de Avance**: UI completamente funcional + componentes críticos operativos.

---

## 🧩 FASE 4: Componentes Restantes

### Pre-Fase 4
- [ ] Fases 1, 2, y 3 completamente validadas
- [ ] Componentes restantes identificados automáticamente
- [ ] `rg "console\." src/ --files-with-matches` ejecutado para lista actual

### Migración Batch Restante
- [ ] **Identificación**
  - [ ] Lista de archivos restantes generada
  - [ ] Prioridad asignada por uso/criticidad
  - [ ] Loggers apropiados determinados

- [ ] **New Modal Components**
  - [ ] NewVisitDialog.tsx migrado
  - [ ] NewAfterSaleDialog.tsx migrado
  - [ ] NewProjectDialog.tsx migrado
  - [ ] Todos usando loggers apropiados

- [ ] **Form Components**
  - [ ] AfterSaleForm.tsx migrado
  - [ ] edit-payment-dialog.tsx migrado
  - [ ] Formularios operativos post-migración

- [ ] **Page Components**
  - [ ] layout.tsx migrado con Logger('LAYOUT')
  - [ ] dashboard/page.tsx migrado
  - [ ] Páginas adicionales migradas
  - [ ] Navegación intacta

### Post-Fase 4 Validación
- [ ] **Complete Migration Check**
  - [ ] `rg "console\." src/` = 0 matches ✅
  - [ ] Total 90 console.logs migrados
  - [ ] Todos los archivos tienen Logger imports apropiados

- [ ] **Full Application Test**
  - [ ] Login/logout funciona
  - [ ] Todas las páginas principales cargan
  - [ ] Todos los modales operativos
  - [ ] Formularios funcionan completamente
  - [ ] Error handling consistente

**Criterio de Finalización**: Cero console.logs en src/ + aplicación 100% funcional.

---

## ✅ Validación Post-Migración Completa

### Automated Validation
- [ ] **Script de Validación**
  - [ ] `npm run console-logs:validate` ejecutado
  - [ ] Reporte generado sin errores
  - [ ] Todos los archivos pasando validación

### Technical Validation
- [ ] **TypeScript Compilation**
  - [ ] `npm run typecheck` exitoso
  - [ ] No errores de tipos
  - [ ] Imports resueltos correctamente

- [ ] **ESLint Validation**
  - [ ] `npm run lint` sin errores
  - [ ] Reglas no-console configuradas
  - [ ] Overrides para scripts/e2e operativos

- [ ] **Build Validation**
  - [ ] `npm run build` exitoso
  - [ ] Bundle generado correctamente
  - [ ] No warnings relacionados a logging

### Functional Validation
- [ ] **Unit Tests**
  - [ ] `npm run test` 100% exitoso
  - [ ] No regresiones en funcionalidad
  - [ ] Coverage mantenido o mejorado

- [ ] **Integration Tests**
  - [ ] Flujos principales funcionan
  - [ ] APIs externas (Google Maps) operativas
  - [ ] Firebase integration intacta

- [ ] **E2E Tests** (recomendado)
  - [ ] `npm run test:e2e` críticos ejecutados
  - [ ] Login flow funciona
  - [ ] Project creation flow operativo
  - [ ] Payment flow sin errores

### Performance Validation
- [ ] **Bundle Size**
  - [ ] Bundle size similar o menor
  - [ ] Logger no aumenta significativamente el bundle
  - [ ] Tree shaking funcionando correctamente

- [ ] **Runtime Performance**
  - [ ] Tiempo de carga páginas similares
  - [ ] No degradación perceptible
  - [ ] Memory usage estable

### User Experience Validation
- [ ] **Manual Testing**
  - [ ] Navegación completa sin errores JavaScript
  - [ ] Todos los formularios operativos
  - [ ] Error handling visible para usuarios
  - [ ] No console.logs visibles en DevTools

- [ ] **Cross-browser Testing** (recomendado)
  - [ ] Chrome funciona correctamente
  - [ ] Firefox sin errores
  - [ ] Safari compatible (si aplicable)

---

## 🔧 Configuración y Prevención

### ESLint Configuration
- [ ] **Rules Setup**
  - [ ] `npm run console-logs:setup-eslint` ejecutado
  - [ ] Regla no-console configurada para src/
  - [ ] Overrides para scripts/ y e2e/ configurados
  - [ ] Testing de reglas exitoso

### Pre-commit Hooks (Opcional)
- [ ] **Husky Setup**
  - [ ] Husky instalado y configurado
  - [ ] Pre-commit hook ejecuta ESLint
  - [ ] Hook previene commits con console.logs

### CI/CD Integration (Opcional)
- [ ] **GitHub Actions**
  - [ ] Workflow para verificar console.logs
  - [ ] Actions fallan si encuentra console.logs en src/
  - [ ] Integration con PR reviews

### Documentation Updates
- [ ] **Project Documentation**
  - [ ] CLAUDE.md actualizado (remover "48 console.logs activos")
  - [ ] Logger usage guidelines documentadas
  - [ ] Best practices establecidas

- [ ] **Team Guidelines**
  - [ ] Code review checklist actualizado
  - [ ] Developer onboarding actualizado
  - [ ] Logging standards documentados

---

## 📊 Final Report Checklist

### Migration Success Metrics
- [ ] **Quantitative Metrics**
  - [ ] Console.logs migrados: 90/90 (100%)
  - [ ] Archivos migrados: 28/28 (100%)
  - [ ] Errores post-migración: 0
  - [ ] Tests passing: 100%
  - [ ] Build success: ✅

- [ ] **Qualitative Metrics**
  - [ ] Funcionalidad mantenida: 100%
  - [ ] Performance impact: Ninguno o positivo
  - [ ] Developer experience: Mejorada
  - [ ] Error visibility: Mejorada

### Deliverables Checklist
- [ ] **Documentation**
  - [ ] Todos los .md files creados y actualizados
  - [ ] Reportes de migración generados
  - [ ] Guidelines establecidas

- [ ] **Code Quality**
  - [ ] Sistema Logger funcionando
  - [ ] ESLint rules configuradas
  - [ ] TypeScript compilando sin errores
  - [ ] Tests actualizados si necesario

### Handoff Checklist
- [ ] **Knowledge Transfer**
  - [ ] Documentación completa disponible
  - [ ] Scripts de migración disponibles para futuros cambios
  - [ ] Team briefing completado (si aplicable)

- [ ] **Maintenance Setup**
  - [ ] Monitoring de logging configurado
  - [ ] Rollback procedures documentadas
  - [ ] Future enhancement path clarificado

---

## ⚠️ Troubleshooting Checklist

### Common Issues Resolution
- [ ] **Si hay console.logs restantes:**
  - [ ] Ejecutar `rg "console\." src/ -n` para encontrarlos
  - [ ] Migrar manualmente usando patrones establecidos
  - [ ] Re-ejecutar validación

- [ ] **Si TypeScript falla:**
  - [ ] Verificar imports de Logger correctos
  - [ ] Confirmar path aliases funcionan
  - [ ] Revisar sintaxis de Logger calls

- [ ] **Si tests fallan:**
  - [ ] Verificar que Logger está disponible en test environment
  - [ ] Mock Logger si es necesario
  - [ ] Confirmar que lógica no cambió

- [ ] **Si performance degraded:**
  - [ ] Revisar Logger calls excesivos
  - [ ] Configurar Logger para producción
  - [ ] Optimizar debug logging

### Emergency Procedures
- [ ] **Rollback Ready**
  - [ ] Scripts de rollback validados
  - [ ] Backups confirmados disponibles
  - [ ] Git commit de pre-migración identificado

- [ ] **Escalation Path**
  - [ ] Team lead notificado de problemas críticos
  - [ ] Documentación de issues completa
  - [ ] Timeline de resolución establecido

## 📝 Validación de Documentación

### Pre-Commit Checklist
- [ ] Toda la documentación está sincronizada con el código
- [ ] Los conteos de console.logs son exactos
- [ ] Los archivos migrados están correctamente documentados
- [ ] CLAUDE.md refleja el estado actual real
- [ ] No hay información contradictoria entre archivos

### Comando de Verificación
```bash
# Verificar sincronización de documentación
echo "Console.logs actuales en src/:"
find src -name "*.ts*" -o -name "*.tsx" | xargs grep -l "console\." | wc -l

echo "Verificar que coincide con PROGRESO_MIGRACION.md"
grep "Console.logs restantes" docs/refactorizacion/console-log-fix/PROGRESO_MIGRACION.md
```

### Archivos de Documentación a Validar
- [ ] **PROGRESO_MIGRACION.md**: Métricas actualizadas
- [ ] **ANALISIS_INICIAL.md**: Estados de archivos correctos
- [ ] **CHECKLIST_VALIDACION.md**: Tareas marcadas apropiadamente
- [ ] **CLAUDE.md**: Progreso reflejado correctamente
- [ ] **ESTADO_FINAL.md**: Creado solo si migración completa

---

**Preparado por**: Claude Code Mentor Técnico  
**Uso**: Marcar cada checkbox durante migración  
**Validación**: 100% ✅ requerido para completion  
**Timeline**: 2 semanas con validación exhaustiva