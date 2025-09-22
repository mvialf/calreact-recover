#!/bin/bash

# Script para verificar el uso de código deprecated del sistema FormModal
# Ejecutar periódicamente para monitorear si se está usando código deprecated

echo "🔍 Verificando uso de código deprecated del sistema FormModal..."
echo "=================================================="

# Buscar nuevas referencias al sistema deprecated (excluyendo archivos del propio sistema)
DEPRECATED_USAGE=$(rg "import.*FormModal|useModalState|ConfirmationModal|InfoModal|useModalManager" src/ \
  --glob "!src/components/ui/modal/**" \
  --glob "!src/components/ui/index.ts" \
  --glob "!src/components/modals/projects/NewProjectDialogV2.tsx" \
  --glob "!src/hooks/useModalManager.ts" \
  --count-matches 2>/dev/null || echo "0")

if [ "$DEPRECATED_USAGE" = "0" ] || [ -z "$DEPRECATED_USAGE" ]; then
    echo "✅ No se encontraron nuevas referencias al sistema deprecated"
    echo "✅ El código está listo para evaluación de eliminación"
else
    echo "⚠️  Se encontraron $DEPRECATED_USAGE referencias al sistema deprecated:"
    echo ""
    rg "import.*FormModal|useModalState|ConfirmationModal|InfoModal|useModalManager" src/ \
      --glob "!src/components/ui/modal/**" \
      --glob "!src/components/ui/index.ts" \
      --glob "!src/components/modals/projects/NewProjectDialogV2.tsx" \
      --glob "!src/hooks/useModalManager.ts" \
      --line-number --heading
fi

echo ""
echo "📊 Estadísticas del sistema deprecated:"
echo "========================================="

# Contar archivos del sistema FormModal
MODAL_FILES=$(find src/components/ui/modal/ -name "*.tsx" -o -name "*.ts" | wc -l)
echo "📁 Archivos en src/components/ui/modal/: $MODAL_FILES"

# Tamaño del directorio
MODAL_SIZE=$(du -sh src/components/ui/modal/ 2>/dev/null | cut -f1)
echo "💾 Tamaño del directorio modal: $MODAL_SIZE"

# Hook huérfano
if [ -f "src/hooks/useModalManager.ts" ]; then
    HOOK_SIZE=$(du -sh src/hooks/useModalManager.ts 2>/dev/null | cut -f1)
    echo "🪝 Hook useModalManager.ts: $HOOK_SIZE"
fi

# Componente V2 huérfano
if [ -f "src/components/modals/projects/NewProjectDialogV2.tsx" ]; then
    V2_SIZE=$(du -sh src/components/modals/projects/NewProjectDialogV2.tsx 2>/dev/null | cut -f1)
    echo "🔧 NewProjectDialogV2.tsx: $V2_SIZE"
fi

echo ""
echo "📅 Próxima revisión programada: Q2 2026 (Marzo 2026)"
echo "📋 Ver detalles en: MAINTENANCE_TODO.md"