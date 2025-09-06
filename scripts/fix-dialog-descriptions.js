#!/usr/bin/env node

/**
 * Script para identificar y corregir automáticamente diálogos sin DialogDescription
 * Busca archivos que usan DialogContent y verifica si tienen DialogDescription
 */

const fs = require('fs');
const path = require('path');

// Configuración
const SRC_DIR = path.join(__dirname, '..', 'src');
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build'];

// Contadores para el reporte
let filesScanned = 0;
let filesWithDialogs = 0;
let dialogsFound = 0;
let dialogsWithoutDescription = 0;
let filesFixed = 0;

/**
 * Verifica si un directorio debe ser excluido
 */
function shouldExcludeDir(dirName) {
  return EXCLUDE_DIRS.includes(dirName) || dirName.startsWith('.');
}

/**
 * Verifica si un archivo tiene la extensión correcta
 */
function hasValidExtension(filePath) {
  return EXTENSIONS.some(ext => filePath.endsWith(ext));
}

/**
 * Busca archivos recursivamente
 */
function findFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !shouldExcludeDir(item)) {
      findFiles(fullPath, files);
    } else if (stat.isFile() && hasValidExtension(fullPath)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Analiza el contenido de un archivo para encontrar diálogos
 */
function analyzeFileContent(content, filePath) {
  const issues = [];
  
  // Buscar importaciones de DialogContent
  const hasDialogContentImport = /import.*DialogContent.*from/.test(content);
  if (!hasDialogContentImport) {
    return issues; // No usa diálogos
  }
  
  // Buscar usos de DialogContent
  const dialogContentMatches = content.match(/<DialogContent[\s\S]*?<\/DialogContent>/g);
  if (!dialogContentMatches) {
    return issues; // No tiene DialogContent en el JSX
  }
  
  dialogsFound += dialogContentMatches.length;
  
  // Verificar cada DialogContent
  dialogContentMatches.forEach((dialogMatch, index) => {
    const hasDescription = /DialogDescription/.test(dialogMatch);
    
    if (!hasDescription) {
      dialogsWithoutDescription++;
      issues.push({
        type: 'missing-description',
        dialogIndex: index,
        dialogContent: dialogMatch,
        suggestion: 'Agregar DialogDescription para accesibilidad'
      });
    }
  });
  
  return issues;
}

/**
 * Genera una corrección automática para un archivo
 */
function generateFix(content, issues) {
  let fixedContent = content;
  let hasChanges = false;
  
  // Verificar si ya importa DialogDescription
  const hasDescriptionImport = /import.*DialogDescription.*from/.test(content);
  
  // Si no importa DialogDescription, agregarlo
  if (!hasDescriptionImport && issues.length > 0) {
    const importMatch = content.match(/(import\s*{[^}]*DialogContent[^}]*}.*from.*['"][^'"]*['"])/);
    if (importMatch) {
      const originalImport = importMatch[1];
      const newImport = originalImport.replace('DialogContent', 'DialogContent,\n  DialogDescription');
      fixedContent = fixedContent.replace(originalImport, newImport);
      hasChanges = true;
    }
  }
  
  // Agregar DialogDescription a cada DialogContent que no lo tenga
  issues.forEach(issue => {
    if (issue.type === 'missing-description') {
      // Buscar el DialogHeader dentro del DialogContent
      const headerMatch = issue.dialogContent.match(/<DialogHeader[\s\S]*?<\/DialogHeader>/);
      
      if (headerMatch) {
        // Si hay DialogHeader, agregar DialogDescription después del DialogTitle
        const titleMatch = headerMatch[0].match(/<DialogTitle[\s\S]*?<\/DialogTitle>/);
        if (titleMatch) {
          const newDescription = `\n          <DialogDescription className="sr-only">\n            Diálogo de la aplicación\n          </DialogDescription>`;
          const newHeader = headerMatch[0].replace(
            titleMatch[0],
            titleMatch[0] + newDescription
          );
          fixedContent = fixedContent.replace(headerMatch[0], newHeader);
          hasChanges = true;
        }
      } else {
        // Si no hay DialogHeader, agregar DialogDescription al inicio del DialogContent
        const contentStart = issue.dialogContent.match(/<DialogContent[^>]*>/);
        if (contentStart) {
          const newDescription = `\n        <DialogDescription className="sr-only">\n          Diálogo de la aplicación\n        </DialogDescription>`;
          fixedContent = fixedContent.replace(
            contentStart[0],
            contentStart[0] + newDescription
          );
          hasChanges = true;
        }
      }
    }
  });
  
  return { fixedContent, hasChanges };
}

/**
 * Procesa un archivo individual
 */
function processFile(filePath) {
  filesScanned++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = analyzeFileContent(content, filePath);
    
    if (issues.length === 0) {
      return; // No hay problemas
    }
    
    filesWithDialogs++;
    
    console.log(`\n📄 ${path.relative(SRC_DIR, filePath)}`);
    console.log(`   Diálogos encontrados: ${issues.length}`);
    
    issues.forEach((issue, index) => {
      console.log(`   ❌ Diálogo ${index + 1}: ${issue.suggestion}`);
    });
    
    // Generar corrección automática
    const { fixedContent, hasChanges } = generateFix(content, issues);
    
    if (hasChanges) {
      // Crear backup
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);
      
      // Aplicar corrección
      fs.writeFileSync(filePath, fixedContent);
      filesFixed++;
      
      console.log(`   ✅ Archivo corregido (backup: ${path.basename(backupPath)})`);
    }
    
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

/**
 * Función principal
 */
function main() {
  console.log('🔍 Buscando diálogos sin DialogDescription...\n');
  console.log(`📁 Directorio: ${SRC_DIR}`);
  console.log(`📋 Extensiones: ${EXTENSIONS.join(', ')}`);
  console.log(`🚫 Excluir: ${EXCLUDE_DIRS.join(', ')}\n`);
  
  const files = findFiles(SRC_DIR);
  console.log(`📊 Archivos encontrados: ${files.length}\n`);
  
  // Procesar cada archivo
  files.forEach(processFile);
  
  // Reporte final
  console.log('\n' + '='.repeat(60));
  console.log('📊 REPORTE FINAL');
  console.log('='.repeat(60));
  console.log(`📄 Archivos escaneados: ${filesScanned}`);
  console.log(`🔍 Archivos con diálogos: ${filesWithDialogs}`);
  console.log(`💬 Diálogos encontrados: ${dialogsFound}`);
  console.log(`❌ Diálogos sin descripción: ${dialogsWithoutDescription}`);
  console.log(`✅ Archivos corregidos: ${filesFixed}`);
  
  if (filesFixed > 0) {
    console.log('\n🎉 ¡Correcciones aplicadas exitosamente!');
    console.log('💡 Se crearon archivos .backup para cada archivo modificado');
    console.log('🧪 Ejecuta las pruebas para verificar que todo funciona correctamente');
  } else if (dialogsWithoutDescription === 0) {
    console.log('\n✨ ¡Todos los diálogos ya tienen DialogDescription!');
  } else {
    console.log('\n⚠️  Se encontraron problemas pero no se pudieron corregir automáticamente');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, analyzeFileContent, generateFix };
