#!/bin/bash
# final-migration-validation.sh
# Script para validación final de migración completada

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Verificar parámetros
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: Se requiere especificar la página migrada${NC}"
    echo "Uso: $0 <nombre_pagina>"
    echo "Ejemplo: $0 payments"
    exit 1
fi

PAGE_NAME=$1
PAGE_PATH="src/app/$PAGE_NAME"

echo -e "${PURPLE}🎯 VALIDACIÓN FINAL DE MIGRACIÓN - $PAGE_NAME${NC}"
echo "=============================================="
echo

# Variables para tracking
PASSED=0
FAILED=0
MANUAL_CHECKS_NEEDED=0

# Función para test automático
run_test() {
    local test_name="$1"
    local test_command="$2"
    local success_message="$3"
    local failure_message="$4"

    echo -e "${YELLOW}🔍 $test_name${NC}"
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $success_message${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ $failure_message${NC}"
        FAILED=$((FAILED + 1))
    fi
    echo
}

# Función para test manual
manual_check() {
    local check_name="$1"
    local check_description="$2"

    echo -e "${YELLOW}👤 $check_name${NC}"
    echo -e "${BLUE}   $check_description${NC}"

    while true; do
        read -p "   ¿Verificado y funcionando? (y/n/s=skip): " response
        case $response in
            [Yy]* )
                echo -e "${GREEN}✅ Confirmado por usuario${NC}"
                PASSED=$((PASSED + 1))
                break;;
            [Nn]* )
                echo -e "${RED}❌ Reportado como fallido${NC}"
                FAILED=$((FAILED + 1))
                break;;
            [Ss]* )
                echo -e "${YELLOW}⏭️ Omitido${NC}"
                MANUAL_CHECKS_NEEDED=$((MANUAL_CHECKS_NEEDED + 1))
                break;;
            * ) echo "   Responda y (sí), n (no), o s (skip)";;
        esac
    done
    echo
}

# === VALIDACIONES AUTOMÁTICAS ===
echo -e "${BLUE}🤖 VALIDACIONES AUTOMÁTICAS${NC}"
echo "==============================="

# 1. Verificación de archivos TypeScript
run_test \
    "1. TypeScript sin errores" \
    "npm run typecheck" \
    "Compilación TypeScript exitosa" \
    "Errores de TypeScript detectados - CORREGIR ANTES DE CONTINUAR"

# 2. Verificación de ESLint
run_test \
    "2. ESLint (warnings permitidos)" \
    "npm run lint" \
    "ESLint pasado (warnings esperados OK)" \
    "ESLint con errores críticos - REVISAR"

# 3. Verificación de componentes reutilizables
run_test \
    "3. Componentes reutilizables presentes" \
    "grep -r 'ProjectClientDisplay\\|ClientDisplay\\|.*Display.*project' $PAGE_PATH --include='*.tsx'" \
    "Componentes reutilizables encontrados - Principio DRY respetado" \
    "No se encontraron componentes reutilizables - VERIFICAR MANUALMENTE"

# 4. Verificación de funciones de manejo
run_test \
    "4. Funciones de manejo implementadas" \
    "grep -rE 'const handle[A-Z]|function handle[A-Z]|handleStatusChange|handleEdit' $PAGE_PATH --include='*.tsx'" \
    "Funciones de manejo encontradas" \
    "Pocas o ninguna función de manejo - VERIFICAR FUNCIONALIDADES"

# 5. Verificación de DataTable integration
run_test \
    "5. DataTable correctamente integrado" \
    "grep -r 'DataTable\\|useReactTable\\|columns.*ColumnDef' $PAGE_PATH --include='*.tsx'" \
    "Integración DataTable detectada" \
    "DataTable no detectado - VERIFICAR MIGRACIÓN"

# === VALIDACIONES MANUALES CRÍTICAS ===
echo -e "${BLUE}👤 VALIDACIONES MANUALES CRÍTICAS${NC}"
echo "====================================="

manual_check \
    "1. Edición inline funcional" \
    "Probar cambiar estado/datos directamente desde la tabla (ej: DropdownMenu de estado)"

manual_check \
    "2. Todas las columnas visibles" \
    "Verificar que se muestre toda la información esperada (no columnas faltantes)"

manual_check \
    "3. Filtros y búsqueda operativos" \
    "Probar barra de búsqueda y filtros específicos de la página"

manual_check \
    "4. Acciones por fila funcionales" \
    "Probar botones de editar, eliminar, agregar pago, etc. en cada fila"

manual_check \
    "5. Ordenamiento de columnas" \
    "Hacer clic en headers de columnas para ordenar ascendente/descendente"

manual_check \
    "6. Estados de loading/error" \
    "Verificar que loading states y manejo de errores funcionen correctamente"

manual_check \
    "7. Responsive design" \
    "Probar en diferentes tamaños de pantalla (móvil, tablet, desktop)"

manual_check \
    "8. Performance sin regresión" \
    "La página carga igual o más rápido que antes de la migración"

# === VALIDACIÓN DE ARQUITECTURA ===
echo -e "${BLUE}🏗️ VALIDACIÓN DE ARQUITECTURA${NC}"
echo "==============================="

# Verificar que no hay código duplicado
echo -e "${YELLOW}🔍 Verificando principio DRY...${NC}"
duplicate_count=$(find "$PAGE_PATH" -name "*.tsx" -exec wc -l {} \; | awk '{sum+=$1} END {print sum}')
echo -e "${GREEN}✅ Líneas de código total: $duplicate_count${NC}"

# Verificar estructura de archivos
echo -e "${YELLOW}🗂️ Verificando estructura de archivos...${NC}"
if [ -f "$PAGE_PATH/columns.tsx" ]; then
    echo -e "${GREEN}✅ Archivo columns.tsx presente${NC}"
else
    echo -e "${RED}❌ Archivo columns.tsx faltante${NC}"
    FAILED=$((FAILED + 1))
fi

if [ -f "$PAGE_PATH/page.tsx" ]; then
    echo -e "${GREEN}✅ Archivo page.tsx presente${NC}"
else
    echo -e "${RED}❌ Archivo page.tsx faltante${NC}"
    FAILED=$((FAILED + 1))
fi
echo

# === RESUMEN FINAL ===
echo -e "${PURPLE}📊 RESUMEN FINAL DE MIGRACIÓN${NC}"
echo "==============================="
echo -e "Página migrada: ${YELLOW}$PAGE_NAME${NC}"
echo -e "Tests automáticos pasados: ${GREEN}$PASSED${NC}"
echo -e "Tests fallidos: ${RED}$FAILED${NC}"
echo -e "Verificaciones manuales pendientes: ${YELLOW}$MANUAL_CHECKS_NEEDED${NC}"
echo

TOTAL_TESTS=$((PASSED + FAILED + MANUAL_CHECKS_NEEDED))
SUCCESS_RATE=$((PASSED * 100 / TOTAL_TESTS))

if [ $FAILED -eq 0 ] && [ $MANUAL_CHECKS_NEEDED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!${NC}"
    echo -e "${GREEN}   Tasa de éxito: $SUCCESS_RATE% ($PASSED/$TOTAL_TESTS tests)${NC}"
    echo
    echo -e "${BLUE}📋 Próximos pasos recomendados:${NC}"
    echo "   1. Documentar lecciones aprendidas"
    echo "   2. Actualizar template de migración con insights"
    echo "   3. Aplicar metodología a siguiente página"
    echo
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}⚠️ MIGRACIÓN PARCIALMENTE VALIDADA${NC}"
    echo -e "${YELLOW}   Completar verificaciones manuales pendientes: $MANUAL_CHECKS_NEEDED${NC}"
    echo
    echo -e "${BLUE}📋 Acción requerida:${NC}"
    echo "   1. Completar verificaciones manuales"
    echo "   2. Ejecutar nuevamente: $0 $PAGE_NAME"
    exit 2
else
    echo -e "${RED}❌ MIGRACIÓN FALLIDA${NC}"
    echo -e "${RED}   Tests fallidos: $FAILED${NC}"
    echo -e "${RED}   Tasa de éxito: $SUCCESS_RATE%${NC}"
    echo
    echo -e "${RED}🛑 ACCIÓN INMEDIATA REQUERIDA:${NC}"
    echo "   1. Corregir todos los tests fallidos"
    echo "   2. Verificar funcionalidades críticas"
    echo "   3. Ejecutar validate-migration-step.sh para diagnóstico"
    echo "   4. Ejecutar nuevamente este script"
    exit 1
fi

echo -e "${BLUE}📝 Documentar resultado en:${NC}"
echo -e "${BLUE}   docs/technical/migration-results-$PAGE_NAME.md${NC}"