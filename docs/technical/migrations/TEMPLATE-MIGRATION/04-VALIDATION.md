# ✅ Validación de Migración

## 🎯 Criterios de Éxito

Verificación binaria para confirmar migración exitosa de [NOMBRE] sin degradación de funcionalidad.

## 🔧 Validación Técnica

### 🔧 **Preparación del Entorno**

- [ ] **1.1** Backup completo del código actual
  ```bash
  git checkout -b backup-pre-[nombre-migration]
  git add -A && git commit -m "🔄 Backup antes migración [nombre]"
  ```

- [ ] **1.2** Crear rama de desarrollo para la migración
  ```bash
  git checkout -b feature/[nombre-migration]
  ```

- [ ] **1.3** Documentar estado actual del sistema
  - [ ] Ejecutar tests actuales: `npm test`
  - [ ] Capturar screenshots de funcionalidad actual (si UI)
  - [ ] Registrar warnings/errores actuales en consola

### 📊 **Validación Funcional Baseline**

- [ ] **1.4** Verificar [funcionalidad crítica 1]
  - [ ] [Criterio específico 1]
  - [ ] [Criterio específico 2]
  - [ ] [Criterio específico 3]

- [ ] **1.5** Verificar [funcionalidad crítica 2]
  - [ ] [Criterio específico 1]
  - [ ] [Criterio específico 2]

- [ ] **1.6** Verificar [funcionalidad crítica 3]
  - [ ] [Criterio específico 1]
  - [ ] [Criterio específico 2]

### 📈 **Métricas Baseline**

- [ ] **1.7** Registrar métricas baseline
  - [ ] **[Métrica 1]:** ___[unidad] (objetivo: [valor objetivo])
  - [ ] **[Métrica 2]:** ___[unidad] (objetivo: [valor objetivo])
  - [ ] **[Métrica 3]:** ___[unidad] (objetivo: [valor objetivo])

- [ ] **1.8** Comandos de verificación baseline
  ```bash
  # Tiempo de build actual
  time npm run build
  
  # Tamaño de bundle actual
  npm run build && du -sh .next/
  
  # [Comando específico para métrica del proyecto]
  ```

---

## 🔄 FASE 2: Durante Migración

### 💻 **Cambios de Código**

- [ ] **2.1** [Cambio crítico 1] implementado
  - [ ] Archivo `[ruta]` modificado correctamente
  - [ ] [Verificación específica de este cambio]

- [ ] **2.2** [Cambio crítico 2] implementado
  - [ ] Archivo `[ruta]` modificado correctamente
  - [ ] [Verificación específica de este cambio]

- [ ] **2.3** [Cambio crítico 3] implementado
  - [ ] Archivo `[ruta]` modificado correctamente
  - [ ] [Verificación específica de este cambio]

### 🧪 **Validación Continua**

- [ ] **2.4** Compilación sin errores
  ```bash
  npm run typecheck
  npm run lint
  npm run build
  ```

- [ ] **2.5** Testing durante desarrollo
  - [ ] Prueba manual en `localhost:[puerto]`
  - [ ] [Funcionalidad específica] responde correctamente
  - [ ] No errores críticos en consola

- [ ] **2.6** Performance no degradada
  - [ ] Tiempo de build ≤ baseline + 10%
  - [ ] Tiempo de carga ≤ baseline + 10%

---

## ✅ FASE 3: Post-Migración

### 🔍 **Validación Técnica**

- [ ] **3.1** Zero errores críticos
  ```bash
  # Ejecutar y verificar 0 errores
  npm run typecheck  # 0 errores TypeScript
  npm run lint       # 0 errores críticos ESLint
  npm run build      # Build exitoso
  ```

- [ ] **3.2** [Warnings específicos eliminados]
  ```bash
  npm run dev
  # Navegar a aplicación y verificar consola limpia de:
  # - [Warning específico 1]
  # - [Warning específico 2]
  ```

### 🧪 **Tests Funcionales Completos**

- [ ] **3.3** Suite de tests pasando
  ```bash
  npm test
  ```
  
- [ ] **3.4** [Funcionalidad crítica 1] validada
  - [ ] [Test específico 1] ✅
  - [ ] [Test específico 2] ✅
  - [ ] [Test específico 3] ✅

- [ ] **3.5** [Funcionalidad crítica 2] validada
  - [ ] [Test específico 1] ✅
  - [ ] [Test específico 2] ✅

- [ ] **3.6** [Funcionalidad crítica 3] validada
  - [ ] [Test específico 1] ✅
  - [ ] [Test específico 2] ✅

### 📊 **Métricas de Performance**

- [ ] **3.7** Performance ≥ estado anterior
  - [ ] **[Métrica 1]:** [valor actual] vs [baseline] = [%cambio]
  - [ ] **[Métrica 2]:** [valor actual] vs [baseline] = [%cambio]
  - [ ] **[Métrica 3]:** [valor actual] vs [baseline] = [%cambio]

### 🔧 **Integración y Compatibilidad**

- [ ] **3.8** Integración con componentes existentes
  - [ ] [Componente relacionado 1] funciona correctamente
  - [ ] [Componente relacionado 2] funciona correctamente
  - [ ] [API/servicio integrado] responde como esperado

- [ ] **3.9** Backwards compatibility (si aplica)
  - [ ] [Funcionalidad legacy 1] sigue funcionando
  - [ ] [Funcionalidad legacy 2] sigue funcionando

### 📝 **Documentación y Limpieza**

- [ ] **3.10** Documentación actualizada
  - [ ] Comentarios de código actualizados
  - [ ] README actualizado (si aplica)
  - [ ] [Documentación específica] actualizada

- [ ] **3.11** Cleanup de código
  - [ ] Código deprecated removido
  - [ ] Console.logs temporales removidos
  - [ ] TODOs resueltos o documentados

---

## 🚀 FASE 4: Validación en Producción

### 📈 **Monitoreo Post-Deploy**

- [ ] **4.1** Métricas de errores (primeras 24h)
  - [ ] 0 errores críticos nuevos
  - [ ] [Métrica de error específica] < [threshold]
  - [ ] No degradación en métricas core

- [ ] **4.2** Performance en producción
  - [ ] **[Métrica 1] en prod:** ___[valor] (objetivo: [objetivo])
  - [ ] **[Métrica 2] en prod:** ___[valor] (objetivo: [objetivo])
  - [ ] 95th percentile response time < [threshold]

### 🔍 **Validación de Usuario**

- [ ] **4.3** Testing con datos reales
  - [ ] [Escenario real 1] funciona correctamente
  - [ ] [Escenario real 2] funciona correctamente
  - [ ] [Escenario real 3] funciona correctamente

- [ ] **4.4** Feedback de usuarios (si aplica)
  - [ ] [X usuarios] han probado sin reportar issues
  - [ ] No reportes de funcionalidad rota
  - [ ] UX equivalente o mejor a versión anterior

### 🔄 **Rollback Plan Validado**

- [ ] **4.5** Plan de contingencia verificado
  - [ ] Procedimiento de rollback documentado
  - [ ] Tiempo de rollback < [X minutos]
  - [ ] Backup funcional verificado

---

## 🎯 Criterios de Aceptación Final

### ✅ **APROBACIÓN COMPLETA requiere:**

1. **🔴 CRÍTICO - [Criterio específico 1]**
   - [Descripción específica]
   - Verificación: [comando o método específico]

2. **🔴 CRÍTICO - [Criterio específico 2]**  
   - [Descripción específica]
   - Verificación: [comando o método específico]

3. **🟡 IMPORTANTE - [Criterio específico 3]**
   - [Descripción específica]
   - Verificación: [comando o método específico]

4. **🟢 OPCIONAL - [Criterio específico 4]**
   - [Descripción específica]
   - Verificación: [comando o método específico]

## 📋 Comandos de Validación

### **Testing Rápido (5 minutos)**
```bash
# 1. Build y linting
npm run typecheck && npm run lint && npm run build

# 2. [Comando específico del proyecto]
[comando específico]

# 3. Verificación manual
npm run dev
# → Navegar a [URL específica]
# → Verificar [funcionalidad específica]
# → Confirmar [comportamiento esperado]
```

### **Validación Completa (30 minutos)**
```bash
# 1. Suite completa de tests
npm test

# 2. [Comando específico del proyecto para testing exhaustivo]
[comando específico]

# 3. Verificación performance
[comando para medir performance]
```

## 🚨 Red Flags - Detener Migración Si:

### **❌ Condiciones de STOP inmediato:**
- [ ] ❌ [Condición crítica específica 1]
- [ ] ❌ [Condición crítica específica 2]  
- [ ] ❌ [Condición crítica específica 3]
- [ ] ❌ Performance degrada > [X]% vs baseline
- [ ] ❌ Errores críticos en build
- [ ] ❌ [Funcionalidad core] no operativa

### **⚠️ Condiciones de REVISIÓN:**
- [ ] ⚠️ Performance degrada > [X]% pero < [Y]%
- [ ] ⚠️ [Warning específico] aparece en consola
- [ ] ⚠️ Tests fallan pero no funcionalidad core

## 🎉 Criterios de Éxito Final

### ✅ **MIGRACIÓN EXITOSA cuando:**

- [x] **[Criterio específico 1]** completado
- [x] **[Criterio específico 2]** completado  
- [x] **[Criterio específico 3]** completado
- [x] **Performance** ≥ baseline
- [x] **Tests** pasando
- [x] **Documentación** completada

### 📊 **Métricas de Éxito:**
- **[Métrica 1]:** [baseline] → [achieved] ([%] mejora)
- **[Métrica 2]:** [baseline] → [achieved] ([%] mejora)
- **[Métrica 3]:** [baseline] → [achieved] ([%] mejora)

---

> **📝 Instrucciones:** Marcar cada checkbox ☑️ al completar. Documentar cualquier desviación o problema encontrado. En caso de red flags, ejecutar rollback plan inmediatamente.

> **🔄 Completion:** Al terminar esta validación, proceder a completar `06-COMPLETION.md` con métricas finales y lessons learned.

---

**📊 Validación por:** [Nombre]  
**🕰️ Tiempo invertido en validación:** [X horas]  
**📅 Fecha de validación completa:** [Fecha cuando todos los checks pasen]