#!/usr/bin/env node

/**
 * Script para agregar DialogDescription a todos los diálogos que no lo tienen
 * para resolver los warnings de accesibilidad
 */

const fs = require('fs');
const path = require('path');

// Lista de archivos que necesitan corrección
const filesToFix = [
  'src/components/payments/edit-payment-dialog.tsx',
  'src/app/settings/page.tsx',
];

// Función para leer archivo
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error leyendo ${filePath}:`, error.message);
    return null;
  }
}

// Función para escribir archivo
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Archivo actualizado: ${filePath}`);
  } catch (error) {
    console.error(`Error escribiendo ${filePath}:`, error.message);
  }
}

// Función para agregar DialogDescription a las importaciones
function addDialogDescriptionImport(content) {
  // Buscar la línea de importación de Dialog
  const dialogImportRegex = /import\s*{\s*([^}]*)\s*}\s*from\s*["']@\/components\/ui\/dialog["'];?/;
  const match = content.match(dialogImportRegex);
  
  if (match) {
    const imports = match[1];
    if (!imports.includes('DialogDescription')) {
      const newImports = imports.trim() + ',\n  DialogDescription';
      const newImportLine = `import {\n  ${newImports}\n} from "@/components/ui/dialog";`;
      return content.replace(dialogImportRegex, newImportLine);
    }
  }
  
  return content;
}

// Función para agregar DialogDescription después de DialogTitle
function addDialogDescriptionAfterTitle(content) {
  // Buscar patrones de DialogTitle sin DialogDescription
  const titleWithoutDescriptionRegex = /(<DialogTitle[^>]*>[\s\S]*?<\/DialogTitle>)\s*(?![\s\S]*?<DialogDescription)/g;
  
  return content.replace(titleWithoutDescriptionRegex, (match, titleTag) => {
    return `${titleTag}
          <DialogDescription className="sr-only">
            Formulario de diálogo
          </DialogDescription>`;
  });
}

// Función principal para procesar un archivo
function processFile(filePath) {
  console.log(`🔧 Procesando: ${filePath}`);
  
  const content = readFile(filePath);
  if (!content) return;
  
  let updatedContent = content;
  
  // 1. Agregar DialogDescription a las importaciones
  updatedContent = addDialogDescriptionImport(updatedContent);
  
  // 2. Agregar DialogDescription después de DialogTitle
  updatedContent = addDialogDescriptionAfterTitle(updatedContent);
  
  // Solo escribir si hay cambios
  if (updatedContent !== content) {
    writeFile(filePath, updatedContent);
  } else {
    console.log(`ℹ️  No se necesitan cambios en: ${filePath}`);
  }
}

// Ejecutar el script
console.log('🚀 Iniciando corrección de DialogDescription...\n');

filesToFix.forEach(processFile);

console.log('\n✨ Corrección completada!');
