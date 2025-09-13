# 💻 Implementación Rápida - [NOMBRE-MIGRACIÓN]

## 🎯 Cambios Requeridos

### **Cambio 1: [Descripción del cambio principal]**

**Archivo:** `[ruta/al/archivo]`

```[lenguaje]
// ❌ CÓDIGO ACTUAL - Líneas [X-Y]
[código actual que será modificado]

// ✅ NUEVO CÓDIGO - Reemplazar con:
[código nuevo]
```

**Razón:** [Por qué este cambio específico]

### **Cambio 2: [Descripción si hay segundo cambio]**
[Mismo formato que arriba]

## ⚡ Pasos de Implementación

### **Setup:**
```bash
git checkout -b feature/[nombre-migration]
```

### **Implementar:**
1. **Modificar** `[archivo1]`:
   - [Cambio específico línea X]
   - [Cambio específico línea Y]

2. **Modificar** `[archivo2]` (si aplica):
   - [Cambio específico]

### **Validar:**
```bash
# Compilación
npm run typecheck
npm run lint
npm run build

# Funcionalidad
npm run dev
# → [Instrucciones específicas de qué probar]
```

## 🧪 Testing Manual

### **Escenario 1: [Descripción del test]**
- **Input:** [Descripción específica]
- **Expected:** [Resultado esperado]
- **Validar:** [Cómo verificar]

### **Escenario 2: [Descripción del test]** (si aplica)
[Mismo formato]

## ✅ Checklist Final

- [ ] **Archivos modificados:** [Lista de archivos]
- [ ] **Compilación:** `npm run typecheck && npm run lint` ✅
- [ ] **Build:** `npm run build` ✅  
- [ ] **Funcionalidad:** [Funcionalidad específica] operativa
- [ ] **Performance:** Sin degradación notable

## 🔄 Rollback (si necesario)

```bash
# Revertir cambios específicos
git checkout HEAD~1 -- [archivo1]
git checkout HEAD~1 -- [archivo2]

# Verificar
npm run dev
```

## 📊 Completion

### **Al completar:**
```bash
# Commit
git add -A
git commit -m "feat: [descripción concisa del cambio]"

# Merge (si todo OK)
git checkout main
git merge feature/[nombre-migration]
```

### **Métricas logradas:**
- **[Métrica 1]:** [valor inicial] → [valor final]
- **[Métrica 2]:** [valor inicial] → [valor final]

---

> **⏳ Target completion:** < 2 horas  
> **📅 Completado:** [fecha cuando termine]