#!/usr/bin/env node

/**
 * Script de verificación de salud de diálogos
 * Verifica que todos los diálogos cumplan con las mejores prácticas de accesibilidad
 */

const fs = require('fs');
const path = require('path');

// Configuración
const SRC_DIR = path.join(__dirname, '..', 'src');
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'build', '__tests__', 'test-utils'];

// Contadores para el reporte
let totalFiles = 0;
let filesWithDialogs = 0;
let totalDialogs = 0;
let healthyDialogs = 0;
let issues = [];

/**
 * Reglas de verificación para diálogos
 */
const DIALOG_RULES = {
  hasDescription: {
    name: 'Tiene DialogDescription',
    check: (content) => /DialogDescription/.test(content),
    severity: 'error',
    message: 'Falta DialogDescription para accesibilidad'
  },
  hasTitle: {
    name: 'Tiene DialogTitle',
    check: (content) => /DialogTitle/.test(content),
    severity: 'error',
    message: 'Falta DialogTitle para accesibilidad'
  },
  hasProperStructure: {
    name: 'Estructura correcta',
    check: (content) => {
      const hasHeader = /DialogHeader/.test(content);
      const hasContent = /DialogContent/.test(content);
      return hasHeader && hasContent;
    },
    severity: 'warning',
    message: 'Estructura de diálogo incompleta (falta DialogHeader)'
  },
  hasCloseButton: {
    name: 'Tiene botón de cerrar',
    check: (content) => {
      return /DialogClose/.test(content) || 
             /onOpenChange/.test(content) || 
             /onClose/.test(content) ||
             /setIsOpen\(false\)/.test(content);
    },
    severity: 'warning',
    message: 'No se encontró mecanismo de cierre del diálogo'
  },
  usesErrorBoundary: {
    name: 'Usa Error Boundary',
    check: (content) => {
      return /ErrorBoundary/.test(content) || 
             /DialogErrorBoundary/.test(content) ||
             /GlobalErrorBoundary/.test(content);
    },
    severity: 'info',
    message: 'Considerar agregar Error Boundary para manejo de errores'
  }
};

/**
 * Busca archivos recursivamente
 */
function findFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !EXCLUDE_DIRS.includes(item) && !item.startsWith('.')) {
      findFiles(fullPath, files);
    } else if (stat.isFile() && EXTENSIONS.some(ext => fullPath.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Analiza un diálogo individual
 */
function analyzeDialog(dialogContent, filePath, dialogIndex) {
  const dialogIssues = [];
  let score = 0;
  const maxScore = Object.keys(DIALOG_RULES).length;
  
  // Verificar cada regla
  Object.entries(DIALOG_RULES).forEach(([ruleKey, rule]) => {
    const passes = rule.check(dialogContent);
    
    if (passes) {
      score++;
    } else {
      dialogIssues.push({
        file: filePath,
        dialogIndex,
        rule: ruleKey,
        severity: rule.severity,
        message: rule.message,
        ruleName: rule.name
      });
    }
  });
  
  return {
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    issues: dialogIssues,
    isHealthy: score === maxScore
  };
}

/**
 * Procesa un archivo individual
 */
function processFile(filePath) {
  totalFiles++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar importaciones de DialogContent
    const hasDialogImport = /import.*Dialog.*from/.test(content);
    if (!hasDialogImport) {
      return; // No usa diálogos
    }
    
    // Buscar usos de DialogContent
    const dialogMatches = content.match(/<DialogContent[\s\S]*?<\/DialogContent>/g);
    if (!dialogMatches) {
      return; // No tiene DialogContent en el JSX
    }
    
    filesWithDialogs++;
    totalDialogs += dialogMatches.length;
    
    const relativePath = path.relative(SRC_DIR, filePath);
    
    // Analizar cada diálogo
    dialogMatches.forEach((dialogContent, index) => {
      const analysis = analyzeDialog(dialogContent, relativePath, index);
      
      if (analysis.isHealthy) {
        healthyDialogs++;
      }
      
      // Agregar issues al reporte global
      issues.push(...analysis.issues);
      
      // Log del análisis
      const statusIcon = analysis.isHealthy ? '✅' : '⚠️';
      console.log(`${statusIcon} ${relativePath} - Diálogo ${index + 1}: ${analysis.percentage}% (${analysis.score}/${analysis.maxScore})`);
      
      if (analysis.issues.length > 0) {
        analysis.issues.forEach(issue => {
          const severityIcon = {
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
          }[issue.severity];
          console.log(`   ${severityIcon} ${issue.message}`);
        });
      }
    });
    
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

/**
 * Genera reporte de resumen
 */
function generateSummaryReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 REPORTE DE SALUD DE DIÁLOGOS');
  console.log('='.repeat(80));
  
  // Estadísticas generales
  console.log('\n📈 ESTADÍSTICAS GENERALES:');
  console.log(`📄 Archivos escaneados: ${totalFiles}`);
  console.log(`🔍 Archivos con diálogos: ${filesWithDialogs}`);
  console.log(`💬 Total de diálogos: ${totalDialogs}`);
  console.log(`✅ Diálogos saludables: ${healthyDialogs}`);
  console.log(`⚠️  Diálogos con problemas: ${totalDialogs - healthyDialogs}`);
  
  if (totalDialogs > 0) {
    const healthPercentage = Math.round((healthyDialogs / totalDialogs) * 100);
    console.log(`🎯 Porcentaje de salud: ${healthPercentage}%`);
  }
  
  // Resumen por severidad
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;
  
  console.log('\n🚨 PROBLEMAS POR SEVERIDAD:');
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`⚠️  Advertencias: ${warningCount}`);
  console.log(`ℹ️  Información: ${infoCount}`);
  
  // Top problemas
  const problemCounts = {};
  issues.forEach(issue => {
    const key = issue.ruleName;
    problemCounts[key] = (problemCounts[key] || 0) + 1;
  });
  
  const sortedProblems = Object.entries(problemCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  if (sortedProblems.length > 0) {
    console.log('\n🔝 TOP PROBLEMAS:');
    sortedProblems.forEach(([problem, count], index) => {
      console.log(`${index + 1}. ${problem}: ${count} ocurrencias`);
    });
  }
  
  // Recomendaciones
  console.log('\n💡 RECOMENDACIONES:');
  
  if (errorCount > 0) {
    console.log('❌ Corregir errores de accesibilidad (DialogDescription y DialogTitle)');
  }
  
  if (warningCount > 0) {
    console.log('⚠️  Revisar estructura y mecanismos de cierre de diálogos');
  }
  
  if (infoCount > 0) {
    console.log('ℹ️  Considerar agregar Error Boundaries para mejor manejo de errores');
  }
  
  if (healthyDialogs === totalDialogs) {
    console.log('🎉 ¡Todos los diálogos están saludables!');
  } else {
    console.log('🔧 Ejecutar script de corrección: node scripts/fix-dialog-descriptions.js');
  }
  
  // Estado general
  console.log('\n' + '='.repeat(80));
  if (errorCount === 0 && warningCount === 0) {
    console.log('🎉 ESTADO: EXCELENTE - Todos los diálogos cumplen las mejores prácticas');
  } else if (errorCount === 0) {
    console.log('👍 ESTADO: BUENO - Solo advertencias menores');
  } else if (errorCount < 5) {
    console.log('⚠️  ESTADO: NECESITA ATENCIÓN - Pocos errores críticos');
  } else {
    console.log('🚨 ESTADO: CRÍTICO - Muchos errores de accesibilidad');
  }
  console.log('='.repeat(80));
}

/**
 * Función principal
 */
function main() {
  console.log('🔍 Verificando salud de diálogos...\n');
  console.log(`📁 Directorio: ${SRC_DIR}`);
  console.log(`📋 Extensiones: ${EXTENSIONS.join(', ')}`);
  console.log(`🚫 Excluir: ${EXCLUDE_DIRS.join(', ')}\n`);
  
  const files = findFiles(SRC_DIR);
  console.log(`📊 Archivos encontrados: ${files.length}\n`);
  
  // Procesar cada archivo
  files.forEach(processFile);
  
  // Generar reporte final
  generateSummaryReport();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, analyzeDialog, DIALOG_RULES };
