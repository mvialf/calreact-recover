#!/bin/bash
# validate-migration-step.sh
# Script para validación continua durante migración

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar parámetros
if [ $# -lt 2 ]; then
    echo -e "${RED}❌ Error: Se requieren al menos 2 parámetros${NC}"
    echo "Uso: $0 <archivo_original> <archivo_nuevo> [--strict]"
    echo "Ejemplo: $0 src/app/projects/page.tsx.backup src/app/projects/page.tsx"
    exit 1
fi

ORIGINAL_FILE=$1
NEW_FILE=$2
STRICT_MODE=false

# Verificar si se especificó modo estricto
if [ "$3" = "--strict" ]; then
    STRICT_MODE=true
fi

# Verificar que los archivos existen
if [ ! -f "$ORIGINAL_FILE" ]; then
    echo -e "${RED}❌ Error: Archivo original no encontrado: $ORIGINAL_FILE${NC}"
    exit 1
fi

if [ ! -f "$NEW_FILE" ]; then
    echo -e "${RED}❌ Error: Archivo nuevo no encontrado: $NEW_FILE${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 VALIDACIÓN DE EQUIVALENCIA FUNCIONAL${NC}"
echo "======================================="
echo -e "Original: ${YELLOW}$ORIGINAL_FILE${NC}"
echo -e "Nuevo:    ${YELLOW}$NEW_FILE${NC}"
echo -e "Modo:     ${YELLOW}$([ "$STRICT_MODE" = true ] && echo "ESTRICTO" || echo "NORMAL")${NC}"
echo

# Variables para tracking de errores
ERRORS=0
WARNINGS=0

# 1. Comparar funcionalidades interactivas
echo -e "${YELLOW}📊 1. Validando funcionalidades interactivas:${NC}"
original_interactions=$(grep -c "onClick\|DropdownMenu\|Button.*onClick\|onChange\|onSubmit" "$ORIGINAL_FILE" 2>/dev/null || echo "0")
new_interactions=$(grep -c "onClick\|DropdownMenu\|Button.*onClick\|onChange\|onSubmit" "$NEW_FILE" 2>/dev/null || echo "0")

if [ "$original_interactions" -gt "$new_interactions" ]; then
    echo -e "${RED}❌ CRÍTICO: Pérdida de interacciones ($original_interactions → $new_interactions)${NC}"
    echo -e "${RED}   Revisar si se perdieron DropdownMenus, Buttons u otros elementos interactivos${NC}"
    ERRORS=$((ERRORS + 1))
elif [ "$original_interactions" -lt "$new_interactions" ]; then
    echo -e "${GREEN}✅ Interacciones aumentadas: $original_interactions → $new_interactions${NC}"
else
    echo -e "${GREEN}✅ Interacciones preservadas: $original_interactions = $new_interactions${NC}"
fi

# 2. Comparar funciones de manejo
echo -e "${YELLOW}📋 2. Validando funciones de manejo:${NC}"
original_handlers=$(grep -cE "const handle[A-Z]|function handle[A-Z]|handleStatusChange|handleEdit|handleDelete" "$ORIGINAL_FILE" 2>/dev/null || echo "0")
new_handlers=$(grep -cE "const handle[A-Z]|function handle[A-Z]|handleStatusChange|handleEdit|handleDelete" "$NEW_FILE" 2>/dev/null || echo "0")

if [ "$original_handlers" -gt "$new_handlers" ]; then
    echo -e "${RED}❌ CRÍTICO: Pérdida de funciones de manejo ($original_handlers → $new_handlers)${NC}"
    echo -e "${RED}   Verificar que todas las funciones handle* estén presentes${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Funciones de manejo: $original_handlers → $new_handlers${NC}"
fi

# 3. Comparar definiciones de columnas/campos
echo -e "${YELLOW}🏷️ 3. Validando estructura de columnas:${NC}"
original_columns=$(grep -c "key:\|accessorKey:\|header:" "$ORIGINAL_FILE" 2>/dev/null || echo "0")
new_columns=$(grep -c "key:\|accessorKey:\|header:" "$NEW_FILE" 2>/dev/null || echo "0")

if [ "$STRICT_MODE" = true ] && [ "$original_columns" -ne "$new_columns" ]; then
    echo -e "${RED}❌ ESTRICTO: Diferencia en columnas ($original_columns vs $new_columns)${NC}"
    ERRORS=$((ERRORS + 1))
elif [ "$original_columns" -gt "$((new_columns * 2))" ]; then
    echo -e "${RED}❌ CRÍTICO: Pérdida significativa de columnas ($original_columns → $new_columns)${NC}"
    ERRORS=$((ERRORS + 1))
elif [ "$original_columns" -gt "$new_columns" ]; then
    echo -e "${YELLOW}⚠️ Advertencia: Menos columnas ($original_columns → $new_columns)${NC}"
    echo -e "${YELLOW}   Verificar que no se hayan perdido campos importantes${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ Estructura de columnas: $original_columns → $new_columns${NC}"
fi

# 4. Verificar uso de componentes reutilizables
echo -e "${YELLOW}🔌 4. Validando componentes reutilizables:${NC}"
original_components=$(grep -c "ProjectClientDisplay\|ClientDisplay\|StatusBadge\|.*Display.*project" "$ORIGINAL_FILE" 2>/dev/null || echo "0")
new_components=$(grep -c "ProjectClientDisplay\|ClientDisplay\|StatusBadge\|.*Display.*project" "$NEW_FILE" 2>/dev/null || echo "0")

if [ "$original_components" -gt 0 ] && [ "$new_components" -eq 0 ]; then
    echo -e "${RED}❌ CRÍTICO: Pérdida de componentes reutilizables${NC}"
    echo -e "${RED}   ¡Se violó el principio DRY! Restaurar componentes como ProjectClientDisplay${NC}"
    ERRORS=$((ERRORS + 1))
elif [ "$original_components" -gt 0 ] && [ "$new_components" -gt 0 ]; then
    echo -e "${GREEN}✅ Componentes reutilizables preservados${NC}"
else
    echo -e "${YELLOW}⚠️ Ningún componente reutilizable detectado en original${NC}"
fi

# 5. Verificar imports críticos
echo -e "${YELLOW}📦 5. Validando imports críticos:${NC}"
critical_imports=("useMutation" "toast" "updateProject" "PROJECT_STATUS_OPTIONS")
missing_imports=()

for import in "${critical_imports[@]}"; do
    if grep -q "$import" "$ORIGINAL_FILE" 2>/dev/null && ! grep -q "$import" "$NEW_FILE" 2>/dev/null; then
        missing_imports+=("$import")
    fi
done

if [ ${#missing_imports[@]} -gt 0 ]; then
    echo -e "${RED}❌ CRÍTICO: Imports faltantes: ${missing_imports[*]}${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ Imports críticos preservados${NC}"
fi

# 6. Verificar TypeScript y ESLint
echo -e "${YELLOW}🔍 6. Ejecutando verificaciones de calidad:${NC}"
echo "Verificando TypeScript..."
if npm run typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript: Sin errores${NC}"
else
    echo -e "${RED}❌ TypeScript: Errores detectados${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo "Verificando ESLint..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ ESLint: Solo warnings esperados${NC}"
else
    echo -e "${YELLOW}⚠️ ESLint: Revisar warnings${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Resumen final
echo
echo -e "${BLUE}📊 RESUMEN DE VALIDACIÓN:${NC}"
echo "=========================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ VALIDACIÓN EXITOSA${NC}"
    echo -e "• Errores críticos: ${GREEN}0${NC}"
    echo -e "• Advertencias: ${YELLOW}$WARNINGS${NC}"
    echo
    echo -e "${GREEN}🚀 PUEDES CONTINUAR con la migración${NC}"
    exit 0
else
    echo -e "${RED}❌ VALIDACIÓN FALLIDA${NC}"
    echo -e "• Errores críticos: ${RED}$ERRORS${NC}"
    echo -e "• Advertencias: ${YELLOW}$WARNINGS${NC}"
    echo
    echo -e "${RED}🛑 DETENER migración y corregir errores antes de continuar${NC}"
    echo
    echo -e "${BLUE}🔧 Próximos pasos para corregir:${NC}"
    [ $ERRORS -gt 0 ] && echo "   1. Revisar y restaurar funcionalidades perdidas"
    [ $WARNINGS -gt 0 ] && echo "   2. Verificar advertencias no críticas"
    echo "   3. Ejecutar nuevamente: $0 $ORIGINAL_FILE $NEW_FILE"
    exit 1
fi