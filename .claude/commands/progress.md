---
allowed-tools: Bash(git status), Bash(git diff), Bash(git add), Bash(git commit), Bash(git log), Bash(grep), Bash(find)
description: Analiza cambios y crea commits agrupados por tareas de trabajo
---

# 🎯 Auto-commit por Tareas

## 📊 Analizando estado del repositorio...

### Archivos con cambios:
!`git status --porcelain`

### Commits recientes para mantener estilo:
!`git log --oneline -3`

## 🤖 Agrupación Inteligente por Tareas

Voy a analizar todos los archivos (modificados, nuevos, eliminados) y agruparlos por tareas de trabajo, detectando:

- **Conceptos compartidos**: Archivos que implementan la misma funcionalidad
- **Relaciones funcionales**: Componente + test, servicio + tipo, hook + implementación
- **Dependencias**: Archivos que se importan entre sí
- **Contexto de trabajo**: Cambios relacionados temporalmente

Procederé a crear commits que representen tareas completas de desarrollo, no estructura de código.

Los commits seguirán las convenciones del proyecto (feat:, fix:, refactor:, test:, docs:, chore:) pero agrupando por trabajo realizado.