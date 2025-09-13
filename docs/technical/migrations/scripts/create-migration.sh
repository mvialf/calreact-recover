#!/bin/bash

# 🚀 Script de Creación de Migraciones - CalReact
# Autor: Sistema de Templates de Migración
# Fecha: 2025

set -e  # Exit on any error

echo "🎯 === CREADOR DE MIGRACIONES CALREACT ==="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para input con validación
prompt_input() {
    local prompt="$1"
    local validation="$2"
    local input=""
    
    while true; do
        echo -n "$prompt: "
        read input
        
        if [[ -n "$input" && "$input" =~ $validation ]]; then
            echo "$input"
            return 0
        else
            echo -e "${RED}❌ Input inválido. Intenta nuevamente.${NC}"
        fi
    done
}

# Función para selección de opciones
select_option() {
    local prompt="$1"
    shift
    local options=("$@")
    
    echo "$prompt"
    for i in "${!options[@]}"; do
        echo "  $((i+1)). ${options[i]}"
    done
    
    while true; do
        echo -n "Selecciona una opción [1-${#options[@]}]: "
        read selection
        
        if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le "${#options[@]}" ]; then
            echo "${options[$((selection-1))]}"
            return 0
        else
            echo -e "${RED}❌ Selección inválida. Intenta nuevamente.${NC}"
        fi
    done
}

# Obtener información básica
echo -e "${BLUE}📋 Información básica de la migración:${NC}"
echo ""

# Nombre de la migración
MIGRATION_NAME=$(prompt_input "Nombre de la migración (ej: google-places-v3)" "^[a-z0-9-]+$")

# Año
CURRENT_YEAR=$(date +%Y)
MIGRATION_YEAR=$(prompt_input "Año de la migración [$CURRENT_YEAR]" "^[0-9]{4}$")
if [[ -z "$MIGRATION_YEAR" ]]; then
    MIGRATION_YEAR=$CURRENT_YEAR
fi

# Tipo de migración
TYPE_OPTIONS=("API" "Dependency" "Architecture" "Performance" "Security" "Hotfix")
MIGRATION_TYPE=$(select_option "Tipo de migración:" "${TYPE_OPTIONS[@]}")

# Prioridad
PRIORITY_OPTIONS=("🔴 ALTA" "🟡 MEDIA" "🟢 BAJA")
MIGRATION_PRIORITY=$(select_option "Prioridad:" "${PRIORITY_OPTIONS[@]}")

# Estimación de tiempo
TIME_OPTIONS=("< 2 horas (MICRO)" "2-8 horas (MINI)" "1-3 días (ESTÁNDAR)" "> 3 días (COMPLETA)")
TIME_ESTIMATE=$(select_option "Estimación de tiempo:" "${TIME_OPTIONS[@]}")

# Determinar template a usar
if [[ "$TIME_ESTIMATE" == *"MICRO"* ]]; then
    TEMPLATE_TYPE="MICRO"
    TEMPLATE_DIR="MICRO-TEMPLATE"
else
    TEMPLATE_TYPE="FULL"
    TEMPLATE_DIR="TEMPLATE-MIGRATION"
fi

echo ""
echo -e "${YELLOW}🔍 Resumen de la migración:${NC}"
echo "  • Nombre: $MIGRATION_NAME-$MIGRATION_YEAR"
echo "  • Tipo: $MIGRATION_TYPE"
echo "  • Prioridad: $MIGRATION_PRIORITY"
echo "  • Tiempo estimado: $TIME_ESTIMATE"
echo "  • Template: $TEMPLATE_TYPE"
echo ""

# Confirmación
echo -n "¿Continuar con la creación? [y/N]: "
read confirmation
if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Creación cancelada.${NC}"
    exit 0
fi

# Crear directorio de migración
MIGRATION_DIR="docs/technical/migrations/pending-migrations/$MIGRATION_NAME-$MIGRATION_YEAR"

echo ""
echo -e "${BLUE}📁 Creando estructura de migración...${NC}"

if [[ -d "$MIGRATION_DIR" ]]; then
    echo -e "${RED}❌ Error: La migración '$MIGRATION_NAME-$MIGRATION_YEAR' ya existe.${NC}"
    exit 1
fi

# Copiar template
mkdir -p "$MIGRATION_DIR"
cp -r "docs/technical/migrations/$TEMPLATE_DIR/"* "$MIGRATION_DIR/"

echo -e "${GREEN}✅ Estructura copiada desde $TEMPLATE_DIR${NC}"

# Personalizar archivos
echo -e "${BLUE}✏️  Personalizando archivos...${NC}"

# Lista de archivos a personalizar
if [[ "$TEMPLATE_TYPE" == "MICRO" ]]; then
    FILES_TO_CUSTOMIZE=("README.md" "IMPLEMENTATION.md")
else
    FILES_TO_CUSTOMIZE=("00-README.md" "01-ANALYSIS.md" "02-PLAN.md" "03-IMPLEMENTATION.md" "04-VALIDATION.md" "05-ROLLBACK.md" "06-COMPLETION.md")
fi

for file in "${FILES_TO_CUSTOMIZE[@]}"; do
    if [[ -f "$MIGRATION_DIR/$file" ]]; then
        # Reemplazos básicos
        sed -i "s/\[NOMBRE-MIGRACIÓN\]/$MIGRATION_NAME/g" "$MIGRATION_DIR/$file"
        sed -i "s/\[NOMBRE\]/$MIGRATION_NAME/g" "$MIGRATION_DIR/$file"
        sed -i "s/\[AÑO\]/$MIGRATION_YEAR/g" "$MIGRATION_DIR/$file"
        sed -i "s/\[YYYY-MM-DD\]/$(date +%Y-%m-%d)/g" "$MIGRATION_DIR/$file"
        sed -i "s/\[YYYY-MM\]/$(date +%Y-%m)/g" "$MIGRATION_DIR/$file"
        sed -i "s/\[YYYY\]/$MIGRATION_YEAR/g" "$MIGRATION_DIR/$file"
        
        # Reemplazos específicos
        case "$MIGRATION_TYPE" in
            "API")
                sed -i "s/\[Tipo\]/API/g" "$MIGRATION_DIR/$file"
                ;;
            "Dependency")
                sed -i "s/\[Tipo\]/Dependency/g" "$MIGRATION_DIR/$file"
                ;;
            "Architecture")
                sed -i "s/\[Tipo\]/Architecture/g" "$MIGRATION_DIR/$file"
                ;;
            *)
                sed -i "s/\[Tipo\]/$MIGRATION_TYPE/g" "$MIGRATION_DIR/$file"
                ;;
        esac
        
        echo -e "${GREEN}  ✅ $file personalizado${NC}"
    fi
done

# Crear branch de Git
echo ""
echo -e "${BLUE}🌿 Creando branch de Git...${NC}"

BRANCH_NAME="feature/$MIGRATION_NAME-$MIGRATION_YEAR"

# Verificar si branch ya existe
if git rev-parse --verify "$BRANCH_NAME" >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Branch '$BRANCH_NAME' ya existe. Saltando creación de branch.${NC}"
else
    git checkout -b "$BRANCH_NAME"
    echo -e "${GREEN}✅ Branch '$BRANCH_NAME' creado y checked out${NC}"
fi

# Commit inicial
echo -e "${BLUE}💾 Creando commit inicial...${NC}"

git add "$MIGRATION_DIR"
git commit -m "docs: Add $MIGRATION_NAME-$MIGRATION_YEAR migration template

- Type: $MIGRATION_TYPE
- Priority: $MIGRATION_PRIORITY  
- Estimate: $TIME_ESTIMATE
- Template: $TEMPLATE_TYPE

🎯 Generated with migration creation script"

echo -e "${GREEN}✅ Commit inicial creado${NC}"

echo ""
echo -e "${GREEN}🎉 === MIGRACIÓN CREADA EXITOSAMENTE ===${NC}"
echo ""
echo -e "${BLUE}📂 Ubicación:${NC} $MIGRATION_DIR"
echo -e "${BLUE}🌿 Branch:${NC} $BRANCH_NAME"
echo ""
echo -e "${YELLOW}📋 Próximos pasos:${NC}"

if [[ "$TEMPLATE_TYPE" == "MICRO" ]]; then
    echo "  1. Editar README.md para definir el problema específico"
    echo "  2. Completar IMPLEMENTATION.md con los cambios necesarios"
    echo "  3. Implementar los cambios"
    echo "  4. Validar y completar"
else
    echo "  1. Completar 01-ANALYSIS.md con el análisis del estado actual"
    echo "  2. Desarrollar 02-PLAN.md con el plan detallado"
    echo "  3. Seguir el proceso secuencial 03-IMPLEMENTATION.md"
    echo "  4. Validar con 04-VALIDATION.md"
    echo "  5. Preparar rollback con 05-ROLLBACK.md"
    echo "  6. Completar con 06-COMPLETION.md al finalizar"
fi

echo ""
echo -e "${BLUE}🚀 Para empezar:${NC}"
echo "  cd $MIGRATION_DIR"
if [[ "$TEMPLATE_TYPE" == "MICRO" ]]; then
    echo "  \$EDITOR README.md"
else
    echo "  \$EDITOR 00-README.md"
fi

echo ""
echo -e "${GREEN}¡Buena suerte con tu migración! 🚀${NC}"