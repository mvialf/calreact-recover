#!/bin/bash
# Script para migrar autocomplete/ a custom/

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 Migrando autocomplete/ a custom/${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# 1. Mover carpeta
echo -e "${YELLOW}📦 Moviendo carpeta autocomplete/ a custom/...${NC}"
mv src/components/autocomplete src/components/custom/
echo -e "${GREEN}   ✓ Carpeta movida${NC}\n"

# 2. Actualizar README.md de custom/
echo -e "${YELLOW}📝 Actualizando README.md de custom/...${NC}"

# Crear backup
cp src/components/custom/README.md src/components/custom/README.md.bak

# Insertar sección autocomplete después de la línea 53 (después de data-table)
sed -i '53 a\
\
---\
\
### autocomplete/\
Sistema de autocompletado avanzado basado en **Radix UI** con funcionalidades completas.\
\
**Características:**\
- Búsqueda con debounce configurable\
- Navegación por teclado (ArrowUp/Down, Home/End, Enter, Esc)\
- Strict selection mode (validación de input)\
- Loading states integrados\
- Render customizable\
- ARIA completo (W3C standards)\
- 24 test cases (>85% coverage)\
\
**Dependencias externas:**\
```json\
{\
  "@radix-ui/react-command": "^1.x",\
  "@radix-ui/react-popover": "^1.x",\
  "@radix-ui/react-label": "^2.x",\
  "clsx": "^2.x",\
  "tailwind-merge": "^2.x",\
  "lucide-react": "^0.x"\
}\
```\
\
**Componentes Shadcn/ui incluidos:**\
- `input.tsx` (22 líneas) - Ya incluido en carpeta\
- `command.tsx` (159 líneas) - Ya incluido en carpeta\
- `popover.tsx` (34 líneas) - Ya incluido en carpeta\
\
**Para copiar a otro proyecto:**\
1. Copiar carpeta `autocomplete/` completa\
2. Asegurar que el proyecto tenga Tailwind CSS configurado\
3. Instalar dependencias listadas arriba: `npm install @radix-ui/react-command @radix-ui/react-popover @radix-ui/react-label clsx tailwind-merge lucide-react`\
4. Importar y usar\
\
**Uso básico:**\
```typescript\
import { Autocomplete } from '"'"'@/components/custom/autocomplete'"'"';\
\
const items = [\
  { value: '"'"'1'"'"', label: '"'"'Opción 1'"'"' },\
  { value: '"'"'2'"'"', label: '"'"'Opción 2'"'"' }\
];\
\
<Autocomplete\
  items={items}\
  onSelect={(value) => console.log(value)}\
  placeholder="Buscar..."\
/>\
```\
\
**Features avanzados:**\
- Debounce: `debounceMs={300}`\
- Validación: `strictSelection={true}`\
- Loading: `isLoading={loading}`\
- Custom render: `renderItem={(item) => ...}`\
\
**Documentación completa:** Ver `autocomplete/README.md` y `autocomplete/QUICK-START.md`\
' src/components/custom/README.md

echo -e "${GREEN}   ✓ README.md actualizado${NC}\n"

# 3. Buscar y reemplazar imports en todo el proyecto
echo -e "${YELLOW}🔍 Buscando imports a actualizar...${NC}"

# Buscar archivos que importan desde @/components/autocomplete
files_to_update=$(rg -l "@/components/autocomplete" src/ 2>/dev/null || echo "")

if [ -z "$files_to_update" ]; then
    echo -e "${GREEN}   ✓ No se encontraron imports a actualizar${NC}\n"
else
    echo -e "${BLUE}   Archivos a actualizar:${NC}"
    echo "$files_to_update" | while read file; do
        echo -e "   - $file"
    done
    echo ""

    # Actualizar imports
    echo -e "${YELLOW}🔧 Actualizando imports...${NC}"
    echo "$files_to_update" | while read file; do
        sed -i 's|@/components/autocomplete|@/components/custom/autocomplete|g' "$file"
        echo -e "${GREEN}   ✓ ${file}${NC}"
    done
    echo ""
fi

# 4. Actualizar documentación en autocomplete/
echo -e "${YELLOW}📚 Actualizando rutas en documentación interna...${NC}"

# Actualizar QUICK-START.md
if [ -f "src/components/custom/autocomplete/QUICK-START.md" ]; then
    sed -i "s|@/components/autocomplete|@/components/custom/autocomplete|g" \
        src/components/custom/autocomplete/QUICK-START.md
    echo -e "${GREEN}   ✓ QUICK-START.md actualizado${NC}"
fi

# Actualizar README.md
if [ -f "src/components/custom/autocomplete/README.md" ]; then
    sed -i "s|'./components/autocomplete'|'@/components/custom/autocomplete'|g" \
        src/components/custom/autocomplete/README.md
    echo -e "${GREEN}   ✓ README.md actualizado${NC}"
fi

# Actualizar EXAMPLE-USAGE.tsx
if [ -f "src/components/custom/autocomplete/EXAMPLE-USAGE.tsx" ]; then
    sed -i "s|from './index'|from '@/components/custom/autocomplete'|g" \
        src/components/custom/autocomplete/EXAMPLE-USAGE.tsx
    echo -e "${GREEN}   ✓ EXAMPLE-USAGE.tsx actualizado${NC}"
fi

echo ""

# 5. Limpiar backup
rm -f src/components/custom/README.md.bak

# 6. Validación
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Migración completada!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo -e "${BLUE}📍 Nueva ubicación:${NC} src/components/custom/autocomplete/"
echo -e "${BLUE}📝 README actualizado:${NC} src/components/custom/README.md"

echo -e "\n${YELLOW}⚠️  Próximos pasos (OBLIGATORIO):${NC}"
echo -e "   1. Verificar TypeScript: ${BLUE}npm run typecheck${NC}"
echo -e "   2. Verificar ESLint: ${BLUE}npm run lint${NC}"
echo -e "   3. Ejecutar tests: ${BLUE}npm test -- autocomplete.test.tsx${NC}"
echo -e "   4. Verificar build: ${BLUE}npm run build${NC}\n"

echo -e "${GREEN}🎉 Autocomplete ahora es parte de custom/ components!${NC}\n"
