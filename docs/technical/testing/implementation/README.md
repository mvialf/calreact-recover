# 🔧 Plan de Corrección de Tests - Índice Maestro

**Proyecto:** Calreact (Cobralon-FB)  
**Fecha de creación:** 8 de septiembre de 2025  
**Estado:** 🔄 En planificación

---

## 📊 Resumen Ejecutivo

### 🎯 **Contexto**
Durante la limpieza de dependencias (completada exitosamente), se identificaron errores preexistentes en la suite de tests que requieren corrección para mantener un CI/CD confiable.

### 🔍 **Problema Identificado**
- **Tests fallando**: ~40 de 137 tests (70% tasa de éxito)
- **Build de producción**: ✅ Funcionando perfectamente
- **Aplicación en desarrollo**: ✅ Sin problemas
- **Causa**: Problemas de configuración de mocks y compatibilidad Firebase 11.x

### 📈 **Objetivo**
Alcanzar **95%+ tests pasando** mediante estrategia híbrida de testing optimizada.

---

## 🚨 Estado Actual de Tests

### ❌ **Errores Críticos Identificados**

| Error | Archivos Afectados | Impacto | Prioridad |
|-------|-------------------|---------|-----------|
| `instanceof Timestamp not callable` | afterSalesService.test.ts<br>visitService.test.ts | 🔴 Alto | 🔥 Crítica |
| Timeouts en PlacesServiceAdapter | PlacesServiceAdapter.test.ts | 🟡 Medio | ⚡ Alta |
| Firebase Emulator offline | projectService.test.ts | 🟡 Medio | ⚡ Alta |

### 📊 **Métricas Actuales**
```
Test Results: 41 failed, 96 passed, 137 total
Success Rate: 70% (objetivo: 95%+)
Main Issues: Firebase mocks + API timeouts
```

---

## 📚 Documentación del Plan

### 🧠 **Análisis Técnico**
- **[ANALISIS-ERRORES.md](./ANALISIS-ERRORES.md)** - Análisis profundo de cada error con causas raíz

### 🏗️ **Nueva Arquitectura**  
- **[ESTRATEGIA-TESTING.md](./ESTRATEGIA-TESTING.md)** - Estrategia híbrida recomendada por mentor técnico

### 🚀 **Implementación**
- **[IMPLEMENTACION.md](./IMPLEMENTACION.md)** - Plan de ejecución por fases con timelines

### 🛠️ **Recursos Técnicos**
- **[mocks/](./mocks/)** - Templates de mocks funcionales para Firebase 11.x
- **[ejemplos/](./ejemplos/)** - Ejemplos prácticos de tests correctos

---

## 🎯 Estrategia Recomendada

### 🏆 **Estrategia Híbrida Optimizada**
Basada en análisis del mentor técnico, combinando lo mejor de ambos mundos:

| Tipo de Test | Herramienta | Casos de Uso |
|--------------|-------------|--------------|
| **Tests Unitarios** | Mocks Centralizados | Lógica de negocio, validaciones |
| **Tests de Integración** | Firebase Emulator | Servicios críticos de Firebase |
| **Tests E2E** | Playwright | Flujos completos de usuario |

### ✅ **Beneficios Esperados**
- **Performance**: Tests unitarios ~10x más rápidos
- **Confiabilidad**: Emulator para casos críticos
- **Mantenibilidad**: Código centralizado y documentado
- **CI/CD**: Pipeline estable sin fallos aleatorios

---

## 📅 Roadmap de Implementación

### 🔥 **Fase 1: Corrección Inmediata (1-2 días)**
- [ ] Corregir mocks de Firebase Timestamp
- [ ] Optimizar mocks de Google Maps API
- [ ] Verificar tests críticos pasando

### ⚙️ **Fase 2: Estandarización (3-5 días)**  
- [ ] Implementar sistema centralizado de mocks
- [ ] Configurar Firebase Testing SDK
- [ ] Migrar tests a patrón híbrido

### 🚀 **Fase 3: Optimización (1 semana)**
- [ ] Métricas de performance y cobertura
- [ ] Configuración CI/CD optimizada
- [ ] Documentación para el equipo

---

## ⚡ Comandos Rápidos

### Verificar Estado Actual
```bash
# Ejecutar tests y ver resumen
npm run test:ci

# Ejecutar solo tests críticos afectados
npm test -- afterSalesService.test.ts visitService.test.ts

# Verificar que build sigue funcionando
npm run build
```

### Después de Implementar Correcciones
```bash
# Tests unitarios (deberían ser rápidos <30s)
npm run test:unit

# Tests con emulator (requiere setup previo)
npm run test:integration

# Suite completa
npm run test:all
```

---

## 🎓 Context Adicional

### ✅ **Lo que Funciona (NO tocar)**
- Build de producción (exitoso tras limpieza dependencias)
- Aplicación en desarrollo (puerto 3002 funcionando)
- Lógica de negocio (sin errores reales de código)
- Sistema de logging personalizado (12 loggers especializados)

### 🔧 **Lo que Requiere Atención**
- **Solo la configuración de tests** (mocks y setup)
- **No hay bugs en código de producción**
- **Firebase 11.x compatibility** en testing

### 📋 **Contexto de Proyecto**
- Firebase 11.9.1 en producción (funcionando)
- React Context API para estado (zustand eliminado)
- Logger personalizado (winston eliminado)
- Nueva Google Places API (librerías legacy eliminadas)

---

## 🤝 Próximos Pasos

1. **Revisar documentación detallada** en los archivos enlazados
2. **Evaluar si proceder** con Fase 1 de correcciones
3. **Considerar timing** respecto a otras prioridades del proyecto
4. **Asignar recursos** según urgencia de tests estables

---

**Última actualización:** 8 de septiembre de 2025  
**Actualizado por:** Mentor Técnico AI + Claude Code  
**Próxima revisión:** Tras completar Fase 1