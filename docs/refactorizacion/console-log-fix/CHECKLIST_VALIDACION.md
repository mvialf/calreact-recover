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

## 📋 FASE 1: Infraestructura Core

### Pre-Fase 1
- [ ] Logger system verificado (`src/lib/logger.ts` funcional)
- [ ] Tests unitarios pasando antes de modificaciones
- [ ] Archivos target identificados:
  - [ ] `src/services/calendarEventService.ts`
  - [ ] `src/hooks/useDataSync.ts`
  - [ ] `src/lib/firebase/validation.ts`
  - [ ] `src/contexts/AppConfigContext.tsx`

### Migración Fase 1
- [ ] **calendarEventService.ts**
  - [ ] Backup creado (`.backup`)
  - [ ] Console.logs identificados (1 expected)
  - [ ] Logger import agregado
  - [ ] Console.logs migrados a `eventLogger`
  - [ ] Sintaxis TypeScript válida
  - [ ] Funcionalidad verificada

- [ ] **useDataSync.ts**
  - [ ] Backup creado
  - [ ] Console.logs identificados (1 expected)
  - [ ] Logger import agregado (`Logger('DATA_SYNC')`)
  - [ ] Console.logs migrados
  - [ ] Hook funciona correctamente

- [ ] **firebase/validation.ts**
  - [ ] Backup creado
  - [ ] Console.logs identificados (2 expected)
  - [ ] Logger import agregado (`Logger('VALIDATION')`)
  - [ ] Console.error migrados
  - [ ] Validaciones funcionan correctamente

- [ ] **AppConfigContext.tsx**
  - [ ] Backup creado
  - [ ] Console.logs identificados (1 expected)
  - [ ] Logger import agregado (`Logger('APP_CONFIG')`)
  - [ ] Context funciona correctamente

### Post-Fase 1 Validación
- [ ] **Console.logs Verificación**
  - [ ] `rg "console\." src/services/calendarEventService.ts` = 0 matches
  - [ ] `rg "console\." src/hooks/useDataSync.ts` = 0 matches
  - [ ] `rg "console\." src/lib/firebase/validation.ts` = 0 matches
  - [ ] `rg "console\." src/contexts/AppConfigContext.tsx` = 0 matches

- [ ] **Imports Verificación**
  - [ ] Todos los archivos migrados tienen imports Logger
  - [ ] No hay imports duplicados
  - [ ] Path aliases (@/lib/logger) funcionan

- [ ] **Funcionalidad**
  - [ ] Calendar events cargan correctamente
  - [ ] Data sync funciona sin errores
  - [ ] Firebase validation opera normalmente
  - [ ] App config context se mantiene

- [ ] **Tests y Build**
  - [ ] `npm run typecheck` exitoso
  - [ ] `npm run test` exitoso
  - [ ] `npm run lint` sin errores en archivos migrados

**Criterio de Avance**: 100% de ítems ✅ antes de Fase 2.

---

## 🔥 FASE 2: Páginas Críticas

### Pre-Fase 2
- [ ] Fase 1 completamente validada
- [ ] Páginas target identificadas:
  - [ ] `src/app/settings/page.tsx` (13 logs - CRÍTICO)
  - [ ] `src/app/calreact/page.tsx` (5 logs)
  - [ ] `src/app/clients/newPayment/[clientId]/page.tsx` (2 logs)
  - [ ] `src/app/visits/page.tsx` (2 logs)

### Migración Fase 2

#### settings/page.tsx (PRIORIDAD MÁXIMA)
- [ ] **Pre-migración**
  - [ ] Backup creado
  - [ ] 13 console.logs confirmados
  - [ ] Página funcional antes de migración
  - [ ] Tests relacionados identificados

- [ ] **Migración**
  - [ ] Logger import agregado (`Logger('SETTINGS')`)
  - [ ] Console.error → settingsLogger.error
  - [ ] Console.log → settingsLogger.debug
  - [ ] Console.warn → settingsLogger.warn
  - [ ] Console.info → settingsLogger.info
  - [ ] Todos los 13 logs migrados

- [ ] **Post-migración**
  - [ ] `rg "console\." src/app/settings/page.tsx` = 0 matches
  - [ ] Página carga correctamente
  - [ ] Todas las funcionalidades operan
  - [ ] Error handling mantiene comportamiento
  - [ ] No errores en consola del navegador

#### calreact/page.tsx
- [ ] **Migración**
  - [ ] Backup creado
  - [ ] 5 console.logs migrados
  - [ ] Logger import agregado (`Logger('MAIN_APP')`)
  - [ ] Sin console.logs restantes

- [ ] **Validación**
  - [ ] Página principal carga
  - [ ] Navegación funciona
  - [ ] Error handling operativo

#### clients/newPayment/[clientId]/page.tsx
- [ ] **Migración**
  - [ ] Backup creado
  - [ ] 2 console.logs migrados
  - [ ] paymentLogger usado (ya existe)
  - [ ] Sin console.logs restantes

- [ ] **Validación**
  - [ ] Página de nuevos pagos funciona
  - [ ] Formulario de pago operativo
  - [ ] Navegación paramétrica correcta

#### visits/page.tsx
- [ ] **Migración**
  - [ ] Backup creado
  - [ ] 2 console.logs migrados
  - [ ] Logger import agregado (`Logger('VISITS')`)
  - [ ] Sin console.logs restantes

- [ ] **Validación**
  - [ ] Lista de visitas carga
  - [ ] Funcionalidades de visitas operan
  - [ ] Navegación funciona

### Post-Fase 2 Validación Global
- [ ] **Console.logs Verificación**
  - [ ] 22 console.logs migrados en total (Fase 2)
  - [ ] Todas las páginas sin console.logs restantes

- [ ] **Funcionalidad End-to-End**
  - [ ] Usuario puede navegar a settings
  - [ ] Usuario puede crear nuevo pago
  - [ ] Usuario puede ver lista de visitas
  - [ ] Página principal carga correctamente

- [ ] **Performance y UX**
  - [ ] Tiempo de carga similar pre/post migración
  - [ ] No errores JavaScript en DevTools
  - [ ] Logger no impacta performance perceptible

**Criterio de Avance**: 100% funcionalidad mantenida + 0 console.logs.

---

## 🎨 FASE 3: Componentes UI Críticos

### Pre-Fase 3
- [ ] Fases 1 y 2 completamente validadas
- [ ] Componentes target identificados:
  - [ ] `EditVisitDialog.tsx` (10 logs)
  - [ ] `EditProjectDialog.tsx` (9 logs)
  - [ ] `addressInput.tsx` (9 logs)
  - [ ] `calendar-event.tsx` (4 logs)
  - [ ] `account-statement-dialog.tsx` (2 logs)
  - [ ] `DialogErrorBoundary.tsx` (2 logs)

### Migración por Componente

#### EditVisitDialog.tsx (CRÍTICO)
- [ ] **Pre-migración**
  - [ ] Backup creado
  - [ ] 10 console.logs confirmados
  - [ ] Modal funcional antes de migración
  - [ ] Form validation operativa

- [ ] **Migración**
  - [ ] Logger import agregado (`Logger('VISIT_MODAL')`)
  - [ ] Form debug logs → visitModalLogger.debug
  - [ ] Error handling → visitModalLogger.error
  - [ ] Validation logs → visitModalLogger.warn
  - [ ] Todos los 10 logs migrados

- [ ] **Validación**
  - [ ] Modal abre correctamente
  - [ ] Form submission funciona
  - [ ] Validation errors aparecen
  - [ ] Modal cierra correctamente
  - [ ] No errores en consola

#### EditProjectDialog.tsx
- [ ] **Migración**
  - [ ] 9 console.logs migrados
  - [ ] projectLogger usado (ya existe)
  - [ ] Sin console.logs restantes

- [ ] **Validación**
  - [ ] Modal de edición de proyecto funciona
  - [ ] Form data persiste correctamente
  - [ ] Validaciones operativas

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

---

**Preparado por**: Claude Code Mentor Técnico  
**Uso**: Marcar cada checkbox durante migración  
**Validación**: 100% ✅ requerido para completion  
**Timeline**: 2 semanas con validación exhaustiva