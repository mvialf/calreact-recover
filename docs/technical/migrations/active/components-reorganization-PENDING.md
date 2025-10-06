# Components Reorganization - 🔄 EN PROGRESO

**Inicio:** Septiembre 2025
**Status:** 15% Complete
**Impacto:** High
**Prioridad:** Alta
**Owner:** Equipo Core

---

## 🎯 Objetivo

Reorganizar 99 componentes desde estructura caótica actual hacia arquitectura **Domain-Driven Design** que agrupe componentes por dominio de negocio.

## 🚨 Problema Actual

### Estructura Desorganizada
- **99 componentes** distribuidos sin estructura clara
- **5 archivos sueltos** en raíz con funcionalidad crítica
- **Búsqueda ineficiente:** 15-20 min para encontrar componentes relacionados
- **Estructura híbrida incompleta:** Carpetas `/domains/` creadas pero **VACÍAS**

### 🔥 Duplicación Crítica Identificada
```
📅 ProjectEvent Components - DUPLICACIÓN CRÍTICA:
├── NewProjectEventForm.tsx (381 líneas)
├── NewProjectEventLeanForm.tsx (425 líneas)
├── NewProjectEventModal.tsx (359 líneas)
└── NewProjectEventModalV2.tsx (412 líneas)

Total: 1,577 líneas para UNA funcionalidad
```

**Impacto:** Mantenimiento exponencial, confusión de desarrolladores, bundle inflado

## 📊 Estado Actual (Updated: 2025-10-06)

### ✅ Completado (15%)
- [x] Estructura `/domains/` creada (directorios base)
- [x] Tipos base definidos para arquitectura DDD
- [x] Plan arquitectural aprobado por equipo
- [x] Análisis completo de 99 componentes actuales
- [x] Mapeo origen → destino documentado

### 🔄 En Progreso (0%)
*Ninguna fase en progreso actualmente*

### ⏳ Pendiente (85%)

#### Fase 1: Projects Domain (30 min)
- [ ] Migrar 7 componentes a `/features/projects/`
- [ ] Crear barrel exports para projects
- [ ] Actualizar imports en páginas relacionadas
- [ ] Validar TypeScript + ESLint

#### Fase 2: Payments Domain (20 min)
- [ ] Migrar 4 componentes a `/features/payments/`
- [ ] Consolidar duplicaciones identificadas
- [ ] Actualizar imports
- [ ] Validar

#### Fase 3: Calendar Domain (20 min)
- [ ] Migrar 7 componentes a `/features/calendar/`
- [ ] Consolidar ProjectEvent components (crítico)
- [ ] Actualizar imports
- [ ] Validar

#### Fase 4: Otros Dominios (20 min)
- [ ] Migrar clients (3 componentes)
- [ ] Migrar after-sales (2 componentes)
- [ ] Migrar visits (2 componentes)
- [ ] Actualizar imports
- [ ] Validar

#### Fase 5: Shared Components (30 min)
- [ ] Reorganizar componentes cross-domain
- [ ] Crear barrel exports consolidados
- [ ] Actualizar imports masivamente

#### Fase 6: Cleanup (15 min)
- [ ] Eliminar carpetas legacy vacías
- [ ] Verificar no hay archivos sueltos
- [ ] Limpiar imports no utilizados

#### Fase 7: Validación Final (30 min)
- [ ] Testing completo (unit + E2E)
- [ ] Build verification
- [ ] Performance analysis
- [ ] Developer experience validation

## 🚧 Blockers Actuales

**NINGUNO** - Migración lista para continuar cuando se asigne tiempo

## 🏗️ Arquitectura Propuesta (DDD)

```
src/components/
├── ui/                  # ✅ Mantener - Shadcn base (57 archivos)
├── features/            # 🆕 Nuevo - Por dominio de negocio
│   ├── projects/
│   │   ├── forms/
│   │   ├── cards/
│   │   ├── tables/
│   │   └── index.ts    # Barrel exports
│   ├── payments/
│   ├── calendar/
│   ├── clients/
│   ├── after-sales/
│   └── visits/
├── shared/              # 🔄 Reorganizar - Cross-domain
│   ├── layouts/
│   ├── navigation/
│   └── data-display/
└── examples/            # ✅ Mantener - Para desarrollo
```

### Principios de Organización
1. **Domain-first:** Agrupar por dominio de negocio
2. **Type-based subdirs:** Dentro de dominio (forms/, cards/, etc)
3. **Barrel exports:** Un index.ts por dominio
4. **Shared mínimo:** Solo componentes usados en 3+ dominios

## 📈 Beneficios Esperados

### Cuantificables
- **Tiempo de búsqueda:** ↓ 70% (15-20 min → 3-5 min)
- **Consolidación ProjectEvent:** ↓ 75% líneas (1,577 → ~400 líneas)
- **Bundle size:** ↓ 1,177 líneas duplicadas eliminadas
- **Mantenimiento:** ↓ 4x esfuerzo (1 componente vs 4 duplicados)
- **Onboarding devs:** ↓ 50% tiempo de comprensión
- **Duplicación accidental:** ↓ 90% (estructura previene)
- **Productividad:** ↑ 40% por navegación eficiente

### Cualitativos
- ✅ Navegación intuitiva: Todo de un dominio en un lugar
- ✅ Imports limpios: Barrel exports consolidados
- ✅ Escalabilidad: Fácil agregar nuevos dominios
- ✅ Mantenimiento: Cambios localizados por dominio
- ✅ Alineación: Consistente con arquitectura de servicios

## 📅 Timeline Estimado

### Timing Óptimo
- **Duración total:** 2-3 horas (1 sesión o 2 sesiones)
- **Mejor momento:** Después de features críticas completadas
- **Prerequisitos:** Código estable, tests pasando 100%

### Breakdown por Fase
| Fase | Duración | Componentes | Criticidad |
|------|----------|-------------|------------|
| 1. Projects | 30 min | 7 | Media |
| 2. Payments | 20 min | 4 | Media |
| 3. Calendar | 20 min | 7 | **Alta** |
| 4. Otros | 20 min | 7 | Baja |
| 5. Shared | 30 min | ~20 | Media |
| 6. Cleanup | 15 min | - | Baja |
| 7. Validación | 30 min | Todos | **Alta** |

**Total:** 165 min (2h 45min)

## 🔧 Comandos Clave

### Inicio de Migración
```bash
# Crear branch
git checkout -b feature/components-reorganization

# Crear estructura base
mkdir -p src/components/features/{projects,payments,calendar,clients,after-sales,visits}
mkdir -p src/components/shared/{layouts,navigation,data-display}

# Snapshot estado actual
git add . && git commit -m "chore: Snapshot before components reorganization"
```

### Validación Continua (Después de cada fase)
```bash
npm run typecheck && npm run lint
npm run build
npm test
```

### Rollback Seguro
```bash
# Si algo falla durante migración
git reset --hard HEAD~1  # Volver al snapshot
git checkout DEV         # Volver a branch principal
git branch -D feature/components-reorganization
```

## ⚠️ Consideraciones Importantes

### Componentes NO se Mueven
- ✅ `ui/` - 57 archivos Shadcn base (ya bien organizados)
- ✅ `examples/` - Para desarrollo y testing

### Riesgos Mitigados
- 🛡️ **Breaking changes:** Rollback plan probado
- 🛡️ **Imports rotos:** Scripts automatizados actualización
- 🛡️ **Performance:** Bundle analysis en validación
- 🛡️ **Testing:** Validación continua cada fase

### Dependencies
- 🔗 Requiere actualización imports en toda la app (~200+ archivos)
- 🔗 Compatible con estructura actual de testing
- 🔗 No afecta configuración build ni CI/CD

## 🎯 Criterios de Éxito

### Técnicos
- [ ] 0 errores TypeScript
- [ ] 0 warnings ESLint críticos
- [ ] Build exitoso y performante
- [ ] Tests al 100% passing
- [ ] No imports rotos

### Funcionales
- [ ] Todas las páginas cargan correctamente
- [ ] Funcionalidad completa preservada
- [ ] Developer experience mejorada
- [ ] Navegación de código más eficiente

### Arquitecturales
- [ ] Estructura Domain-Driven implementada
- [ ] Barrel exports funcionando en todos los dominios
- [ ] No duplicaciones de archivos
- [ ] Convenciones claras establecidas y documentadas

## 📚 Documentación Detallada

Para información técnica completa sobre esta migración:

### Análisis
- **Inventario completo:** Ver backup `pending-migrations/components-reorganization-2025/01-ANALISIS-ESTADO-ACTUAL.md`
- **Duplicaciones identificadas:** Ver análisis en documento de análisis

### Arquitectura
- **Propuesta DDD detallada:** Ver backup `02-ARQUITECTURA-PROPUESTA.md`
- **Comparación alternativas:** Ver sección de comparativas

### Ejecución
- **Plan fase por fase:** Ver backup `03-PLAN-MIGRACION.md`
- **Mapeo componentes:** Ver backup `04-MAPEO-COMPONENTES.md`
- **Checklist validación:** Ver backup `05-CHECKLIST-VALIDACION.md`

**Nota:** Documentación completa archivada en backup para referencia técnica detallada.

---

**Próxima acción:** Asignar tiempo para Fase 1 (Projects Domain - 30 min)
**Última actualización:** 2025-10-06
**Contact:** Equipo Core
