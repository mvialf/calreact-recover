---
description: "Muestra estado y cambios en documentación claude-docs/"
allowed-tools: ["bash"]
---

Información rápida sobre cambios en la documentación.

**Salida:**
- Archivos modificados/nuevos/eliminados
- Estadísticas de líneas cambiadas
- Últimos commits en documentación

Ejecuta: `git status claude-docs/ --porcelain && echo "--- Cambios Estadísticas ---" && git diff --stat claude-docs/ && echo "--- Últimos Commits ---" && git log --oneline claude-docs/ -3`