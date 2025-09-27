#!/bin/bash
# analyze-page-functionality.sh
# Script para análisis pre-migración de funcionalidades de página

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar parámetros
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: Se requiere la ruta de la página a analizar${NC}"
    echo "Uso: $0 src/app/[page]/"
    exit 1
fi

PAGE_PATH=$1

# Verificar que el directorio existe
if [ ! -d "$PAGE_PATH" ]; then
    echo -e "${RED}❌ Error: Directorio no encontrado: $PAGE_PATH${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 ANÁLISIS DE FUNCIONALIDADES - $PAGE_PATH${NC}"
echo "================================================="
echo

# 1. Componentes interactivos
echo -e "${YELLOW}📊 1. Componentes interactivos encontrados:${NC}"
interactive_count=0
if grep -r "onClick\|onChange\|onSubmit\|DropdownMenu\|Dialog\|Button" "$PAGE_PATH" --include="*.tsx" -n > /dev/null 2>&1; then
    grep -r "onClick\|onChange\|onSubmit\|DropdownMenu\|Dialog\|Button" "$PAGE_PATH" --include="*.tsx" -n | head -10
    interactive_count=$(grep -r "onClick\|onChange\|onSubmit\|DropdownMenu\|Dialog\|Button" "$PAGE_PATH" --include="*.tsx" | wc -l)
    echo -e "${GREEN}✅ Total de elementos interactivos: $interactive_count${NC}"
else
    echo -e "${RED}❌ No se encontraron elementos interactivos${NC}"
fi
echo

# 2. Hooks y estado
echo -e "${YELLOW}🎛️ 2. Hooks y estado encontrados:${NC}"
hooks_count=0
if grep -r "useState\|useMutation\|useQuery\|useEffect" "$PAGE_PATH" --include="*.tsx" -n > /dev/null 2>&1; then
    grep -r "useState\|useMutation\|useQuery\|useEffect" "$PAGE_PATH" --include="*.tsx" -n | head -10
    hooks_count=$(grep -r "useState\|useMutation\|useQuery\|useEffect" "$PAGE_PATH" --include="*.tsx" | wc -l)
    echo -e "${GREEN}✅ Total de hooks encontrados: $hooks_count${NC}"
else
    echo -e "${RED}❌ No se encontraron hooks${NC}"
fi
echo

# 3. Funciones de manejo
echo -e "${YELLOW}📋 3. Funciones de manejo encontradas:${NC}"
handlers_count=0
if grep -rE "const handle[A-Z]|function handle[A-Z]" "$PAGE_PATH" --include="*.tsx" -n > /dev/null 2>&1; then
    grep -rE "const handle[A-Z]|function handle[A-Z]" "$PAGE_PATH" --include="*.tsx" -n
    handlers_count=$(grep -rE "const handle[A-Z]|function handle[A-Z]" "$PAGE_PATH" --include="*.tsx" | wc -l)
    echo -e "${GREEN}✅ Total de funciones de manejo: $handlers_count${NC}"
else
    echo -e "${RED}❌ No se encontraron funciones de manejo${NC}"
fi
echo

# 4. Columnas/campos
echo -e "${YELLOW}🏷️ 4. Columnas/campos identificados:${NC}"
columns_count=0
if grep -r "key:\|accessorKey:\|header:" "$PAGE_PATH" --include="*.tsx" -n > /dev/null 2>&1; then
    grep -r "key:\|accessorKey:\|header:" "$PAGE_PATH" --include="*.tsx" -n
    columns_count=$(grep -r "key:\|accessorKey:\|header:" "$PAGE_PATH" --include="*.tsx" | wc -l)
    echo -e "${GREEN}✅ Total de definiciones de columnas: $columns_count${NC}"
else
    echo -e "${RED}❌ No se encontraron definiciones de columnas${NC}"
fi
echo

# 5. Componentes reutilizables
echo -e "${YELLOW}🔌 5. Componentes reutilizables usados:${NC}"
reusable_count=0
if grep -r "import.*Display\|import.*Form\|import.*Modal" "$PAGE_PATH" --include="*.tsx" -n > /dev/null 2>&1; then
    grep -r "import.*Display\|import.*Form\|import.*Modal" "$PAGE_PATH" --include="*.tsx" -n
    reusable_count=$(grep -r "import.*Display\|import.*Form\|import.*Modal" "$PAGE_PATH" --include="*.tsx" | wc -l)
    echo -e "${GREEN}✅ Total de componentes reutilizables: $reusable_count${NC}"
else
    echo -e "${RED}❌ No se encontraron componentes reutilizables específicos${NC}"
fi
echo

# 6. Patrones de TanStack Table existentes
echo -e "${YELLOW}🔍 6. Patrones de tabla existentes:${NC}"
if grep -r "TableColumn\|createColumns\|columns:" "$PAGE_PATH" --include="*.tsx" -n > /dev/null 2>&1; then
    grep -r "TableColumn\|createColumns\|columns:" "$PAGE_PATH" --include="*.tsx" -n
    echo -e "${GREEN}✅ Encontrados patrones de tabla personalizados${NC}"
else
    echo -e "${YELLOW}⚠️ No se encontraron patrones de tabla específicos${NC}"
fi
echo

# Resumen del análisis
echo -e "${BLUE}📊 RESUMEN DE ANÁLISIS:${NC}"
echo "=========================="
echo -e "• Elementos interactivos: ${GREEN}$interactive_count${NC}"
echo -e "• Hooks de React: ${GREEN}$hooks_count${NC}"
echo -e "• Funciones de manejo: ${GREEN}$handlers_count${NC}"
echo -e "• Definiciones de columnas: ${GREEN}$columns_count${NC}"
echo -e "• Componentes reutilizables: ${GREEN}$reusable_count${NC}"
echo

# Alertas críticas
total_functionality=$((interactive_count + hooks_count + handlers_count))
if [ $total_functionality -eq 0 ]; then
    echo -e "${RED}🚨 ALERTA CRÍTICA: No se detectaron funcionalidades interactivas${NC}"
    echo -e "${RED}   Esta página podría ser solo de visualización${NC}"
elif [ $total_functionality -lt 5 ]; then
    echo -e "${YELLOW}⚠️ ALERTA: Pocas funcionalidades detectadas ($total_functionality)${NC}"
    echo -e "${YELLOW}   Verificar manualmente si existen funcionalidades adicionales${NC}"
else
    echo -e "${GREEN}✅ BUENA SEÑAL: Página con funcionalidades ricas ($total_functionality elementos)${NC}"
    echo -e "${GREEN}   Requiere migración cuidadosa para preservar todo${NC}"
fi

echo
echo -e "${BLUE}📋 Próximo paso: Completar inventario manual en:${NC}"
echo -e "${BLUE}   docs/technical/migration-templates/pre-migration-inventory-[page].md${NC}"
echo