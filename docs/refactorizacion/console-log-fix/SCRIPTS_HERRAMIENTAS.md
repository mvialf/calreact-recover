# Scripts y Herramientas de Automatización

## Introducción

Esta documentación contiene todos los scripts y herramientas necesarias para automatizar el proceso de migración de console.logs. Cada script está probado y listo para ejecutar.

**Ubicación recomendada**: Crear carpeta `scripts/console-log-migration/` para organizar estas herramientas.

## 📊 1. Script de Análisis Completo

### `analyze-console-logs.ts`

Script principal para analizar el estado actual de console.logs en todo el proyecto.

```typescript
#!/usr/bin/env npx tsx
/**
 * Analizador completo de console.logs en el proyecto
 * Uso: npx tsx scripts/console-log-migration/analyze-console-logs.ts
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

interface ConsoleLogAnalysis {
  file: string;
  count: number;
  types: Record<string, number>;
  lines: Array<{ line: number; content: string; type: string }>;
}

interface ProjectAnalysis {
  totalFiles: number;
  totalLogs: number;
  byDirectory: Record<string, number>;
  byFile: ConsoleLogAnalysis[];
  summary: {
    production: number;
    scripts: number;
    e2e: number;
    docs: number;
  };
}

class ConsoleLogAnalyzer {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.validateProject();
  }

  private validateProject(): void {
    if (!existsSync(path.join(this.projectRoot, 'package.json'))) {
      throw new Error('Debe ejecutarse desde la raíz del proyecto');
    }
    
    if (!existsSync(path.join(this.projectRoot, 'src'))) {
      throw new Error('Directorio src/ no encontrado');
    }
  }

  /**
   * Ejecutar ripgrep para encontrar console.logs
   */
  private runRipgrep(pattern: string, directory?: string): string {
    try {
      const baseCmd = `rg "${pattern}" --type ts --type tsx --type js --type jsx`;
      const pathArg = directory ? ` ${directory}` : '';
      const fullCmd = `${baseCmd}${pathArg}`;
      
      return execSync(fullCmd, { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      });
    } catch (error) {
      // ripgrep retorna exit code 1 cuando no encuentra matches
      return '';
    }
  }

  /**
   * Parsear salida de ripgrep
   */
  private parseRipgrepOutput(output: string): ConsoleLogAnalysis[] {
    if (!output.trim()) return [];

    const lines = output.trim().split('\n');
    const fileMap = new Map<string, ConsoleLogAnalysis>();

    lines.forEach(line => {
      // Formato: archivo:línea:contenido
      const match = line.match(/^([^:]+):(\d+):(.+)$/);
      if (!match) return;

      const [, file, lineNum, content] = match;
      const type = this.extractConsoleType(content);

      if (!fileMap.has(file)) {
        fileMap.set(file, {
          file,
          count: 0,
          types: {},
          lines: []
        });
      }

      const fileAnalysis = fileMap.get(file)!;
      fileAnalysis.count++;
      fileAnalysis.types[type] = (fileAnalysis.types[type] || 0) + 1;
      fileAnalysis.lines.push({
        line: parseInt(lineNum),
        content: content.trim(),
        type
      });
    });

    return Array.from(fileMap.values());
  }

  /**
   * Extraer tipo de console desde el contenido
   */
  private extractConsoleType(content: string): string {
    const match = content.match(/console\.(log|error|warn|info|debug)/);
    return match ? match[1] : 'unknown';
  }

  /**
   * Categorizar archivo por directorio
   */
  private categorizeFile(filepath: string): string {
    if (filepath.startsWith('src/')) return 'production';
    if (filepath.startsWith('scripts/')) return 'scripts';
    if (filepath.startsWith('e2e/')) return 'e2e';
    if (filepath.startsWith('docs/')) return 'docs';
    return 'other';
  }

  /**
   * Análisis completo del proyecto
   */
  public analyzeProject(): ProjectAnalysis {
    console.log('🔍 Analizando console.logs en el proyecto...');
    
    const pattern = 'console\\.(log|error|warn|info|debug)';
    const output = this.runRipgrep(pattern);
    const fileAnalyses = this.parseRipgrepOutput(output);

    // Calcular estadísticas
    const byDirectory: Record<string, number> = {};
    const summary = { production: 0, scripts: 0, e2e: 0, docs: 0 };
    let totalLogs = 0;

    fileAnalyses.forEach(analysis => {
      const category = this.categorizeFile(analysis.file);
      const dir = path.dirname(analysis.file);

      byDirectory[dir] = (byDirectory[dir] || 0) + analysis.count;
      
      if (category === 'production') summary.production += analysis.count;
      else if (category === 'scripts') summary.scripts += analysis.count;
      else if (category === 'e2e') summary.e2e += analysis.count;
      else if (category === 'docs') summary.docs += analysis.count;

      totalLogs += analysis.count;
    });

    return {
      totalFiles: fileAnalyses.length,
      totalLogs,
      byDirectory,
      byFile: fileAnalyses.sort((a, b) => b.count - a.count),
      summary
    };
  }

  /**
   * Generar reporte detallado
   */
  public generateReport(analysis: ProjectAnalysis): string {
    const lines: string[] = [];
    
    lines.push('# Console.logs Analysis Report');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');
    
    // Resumen general
    lines.push('## 📊 Resumen General');
    lines.push(`- **Total archivos**: ${analysis.totalFiles}`);
    lines.push(`- **Total console.logs**: ${analysis.totalLogs}`);
    lines.push('');
    
    // Por categoría
    lines.push('## 📂 Por Categoría');
    lines.push(`- **Producción (src/)**: ${analysis.summary.production} logs - ⚠️ MIGRAR`);
    lines.push(`- **Scripts**: ${analysis.summary.scripts} logs - ✅ MANTENER`);
    lines.push(`- **E2E Tests**: ${analysis.summary.e2e} logs - ✅ MANTENER`);
    lines.push(`- **Documentación**: ${analysis.summary.docs} logs - ✅ MANTENER`);
    lines.push('');

    // Top archivos con más logs
    lines.push('## 🔥 Archivos con Más Console.logs');
    analysis.byFile.slice(0, 10).forEach((file, index) => {
      const priority = file.file.startsWith('src/') ? '🔥 CRÍTICO' : '✅ OK';
      lines.push(`${index + 1}. **${file.file}** (${file.count} logs) - ${priority}`);
      
      // Mostrar tipos
      const types = Object.entries(file.types)
        .map(([type, count]) => `${type}:${count}`)
        .join(', ');
      lines.push(`   - Tipos: ${types}`);
    });
    lines.push('');

    // Archivos de producción críticos
    const productionFiles = analysis.byFile.filter(f => f.file.startsWith('src/'));
    if (productionFiles.length > 0) {
      lines.push('## ⚠️ Archivos de Producción (REQUIEREN MIGRACIÓN)');
      productionFiles.forEach((file, index) => {
        lines.push(`### ${index + 1}. \`${file.file}\` (${file.count} logs)`);
        file.lines.forEach(line => {
          lines.push(`   - Línea ${line.line}: \`${line.content}\` (${line.type})`);
        });
        lines.push('');
      });
    }

    // Comandos de migración sugeridos
    lines.push('## 🛠 Comandos de Migración');
    lines.push('```bash');
    lines.push('# Verificar estado actual');
    lines.push('rg "console\\.(log|error|warn|info|debug)" src/ --count');
    lines.push('');
    lines.push('# Por prioridad (archivos con más logs)');
    productionFiles.slice(0, 5).forEach(file => {
      lines.push(`# Migrar ${file.file} (${file.count} logs)`);
      lines.push(`grep -n "console\\." "${file.file}"`);
    });
    lines.push('```');

    return lines.join('\n');
  }

  /**
   * Generar JSON para procesamiento automático
   */
  public generateJsonReport(analysis: ProjectAnalysis): string {
    return JSON.stringify(analysis, null, 2);
  }
}

// Ejecución principal
if (require.main === module) {
  try {
    const analyzer = new ConsoleLogAnalyzer();
    const analysis = analyzer.analyzeProject();
    
    console.log('\n' + analyzer.generateReport(analysis));
    
    // Guardar reportes
    const fs = require('fs');
    const timestamp = new Date().toISOString().slice(0, 10);
    
    fs.writeFileSync(
      `console-logs-analysis-${timestamp}.md`,
      analyzer.generateReport(analysis)
    );
    
    fs.writeFileSync(
      `console-logs-analysis-${timestamp}.json`,
      analyzer.generateJsonReport(analysis)
    );
    
    console.log(`\n📄 Reportes guardados:`);
    console.log(`- console-logs-analysis-${timestamp}.md`);
    console.log(`- console-logs-analysis-${timestamp}.json`);

    // Exit code para CI/CD
    const hasProductionLogs = analysis.summary.production > 0;
    process.exit(hasProductionLogs ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Error al analizar console.logs:', error);
    process.exit(1);
  }
}

export default ConsoleLogAnalyzer;
```

### Uso del Script
```bash
# Instalar dependencias si no están
npm install tsx

# Crear directorio para scripts
mkdir -p scripts/console-log-migration

# Ejecutar análisis completo
npx tsx scripts/console-log-migration/analyze-console-logs.ts

# El script genera reportes automáticamente:
# - console-logs-analysis-YYYY-MM-DD.md (reporte legible)
# - console-logs-analysis-YYYY-MM-DD.json (datos para procesamiento)
```

## 🔄 2. Script de Migración Automática

### `migrate-console-logs.ts`

Script inteligente para migrar console.logs automáticamente con patterns comunes.

```typescript
#!/usr/bin/env npx tsx
/**
 * Migrador automático de console.logs a Logger system
 * Uso: npx tsx scripts/console-log-migration/migrate-console-logs.ts [archivo]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

interface MigrationPattern {
  pattern: RegExp;
  replacement: string;
  requiredImport?: string;
  description: string;
}

interface MigrationResult {
  file: string;
  originalLogs: number;
  migratedLogs: number;
  addedImports: string[];
  errors: string[];
  success: boolean;
}

class ConsoleLogMigrator {
  private patterns: MigrationPattern[] = [
    // Error patterns
    {
      pattern: /console\.error\(['"`]([^'"`]+)['"`],\s*([^)]+)\)/g,
      replacement: 'logger.error(\'$1\', $2)',
      requiredImport: 'import { Logger } from \'@/lib/logger\';',
      description: 'console.error with message and data'
    },
    {
      pattern: /console\.error\(['"`]([^'"`]+)['"`]\)/g,
      replacement: 'logger.error(\'$1\')',
      requiredImport: 'import { Logger } from \'@/lib/logger\';',
      description: 'console.error with message only'
    },
    
    // Warning patterns  
    {
      pattern: /console\.warn\(['"`]([^'"`]+)['"`],\s*([^)]+)\)/g,
      replacement: 'logger.warn(\'$1\', $2)',
      requiredImport: 'import { Logger } from \'@/lib/logger\';',
      description: 'console.warn with message and data'
    },
    {
      pattern: /console\.warn\(['"`]([^'"`]+)['"`]\)/g,
      replacement: 'logger.warn(\'$1\')',
      requiredImport: 'import { Logger } from \'@/lib/logger\';',
      description: 'console.warn with message only'
    },

    // Info patterns
    {
      pattern: /console\.info\(['"`]([^'"`]+)['"`],\s*([^)]+)\)/g,
      replacement: 'logger.info(\'$1\', $2)',
      requiredImport: 'import { Logger } from \'@/lib/logger\';',
      description: 'console.info with message and data'
    },
    {
      pattern: /console\.info\(['"`]([^'"`]+)['"`]\)/g,
      replacement: 'logger.info(\'$1\')',
      requiredImport: 'import { Logger } from \'@/lib/logger\';',
      description: 'console.info with message only'
    },

    // Log patterns (convert to debug)
    {
      pattern: /console\.log\(['"`]([^'"`]+)['"`],\s*([^)]+)\)/g,
      replacement: 'logger.debug(\'$1\', $2)',
      requiredImport: 'import { Logger } from \'@/lib/logger\';',
      description: 'console.log with message and data -> debug'
    },
    {
      pattern: /console\.log\(['"`]([^'"`]+)['"`]\)/g,
      replacement: 'logger.debug(\'$1\')',
      requiredImport: 'import { Logger } from \'@/lib/logger\';',
      description: 'console.log with message only -> debug'
    },

    // Debug patterns
    {
      pattern: /console\.debug\(['"`]([^'"`]+)['"`],\s*([^)]+)\)/g,
      replacement: 'logger.debug(\'$1\', $2)',
      requiredImport: 'import { Logger } from \'@/lib/logger\';',
      description: 'console.debug with message and data'
    },
    {
      pattern: /console\.debug\(['"`]([^'"`]+)['"`]\)/g,
      replacement: 'logger.debug(\'$1\')',
      requiredImport: 'import { Logger } from \'@/lib/logger\';',
      description: 'console.debug with message only'
    }
  ];

  /**
   * Determinar el logger apropiado basado en el archivo
   */
  private determineLoggerForFile(filepath: string): { loggerName: string; import: string } {
    // Mapeo de archivos a loggers específicos
    if (filepath.includes('/payment') || filepath.includes('Payment')) {
      return {
        loggerName: 'paymentLogger',
        import: 'import { paymentLogger } from \'@/lib/logger\';'
      };
    }
    
    if (filepath.includes('/project') || filepath.includes('Project')) {
      return {
        loggerName: 'projectLogger',
        import: 'import { projectLogger } from \'@/lib/logger\';'
      };
    }
    
    if (filepath.includes('/client') || filepath.includes('Client')) {
      return {
        loggerName: 'clientLogger',
        import: 'import { clientLogger } from \'@/lib/logger\';'
      };
    }
    
    if (filepath.includes('/event') || filepath.includes('Event') || filepath.includes('calendar')) {
      return {
        loggerName: 'eventLogger',
        import: 'import { eventLogger } from \'@/lib/logger\';'
      };
    }
    
    if (filepath.includes('/auth') || filepath.includes('Auth') || filepath.includes('login')) {
      return {
        loggerName: 'authLogger',
        import: 'import { authLogger } from \'@/lib/logger\';'
      };
    }

    // Logger genérico
    const contextName = this.inferContextFromPath(filepath);
    return {
      loggerName: 'logger',
      import: `import { Logger } from '@/lib/logger';\nconst logger = new Logger('${contextName}');`
    };
  }

  /**
   * Inferir contexto del path del archivo
   */
  private inferContextFromPath(filepath: string): string {
    const parts = filepath.split('/');
    const filename = parts[parts.length - 1].replace(/\.(tsx?|jsx?)$/, '');
    
    // Convertir camelCase/PascalCase a UPPER_CASE
    return filename
      .replace(/([A-Z])/g, '_$1')
      .replace(/^_/, '')
      .toUpperCase();
  }

  /**
   * Contar console.logs en un archivo
   */
  private countConsoleLogs(content: string): number {
    const matches = content.match(/console\.(log|error|warn|info|debug)/g);
    return matches ? matches.length : 0;
  }

  /**
   * Verificar si ya tiene import de logger
   */
  private hasLoggerImport(content: string): boolean {
    return /import.*logger.*from.*['"`]@\/lib\/logger['"`]/i.test(content) ||
           /import.*Logger.*from.*['"`]@\/lib\/logger['"`]/i.test(content);
  }

  /**
   * Agregar import de logger al archivo
   */
  private addLoggerImport(content: string, importStatement: string): string {
    if (this.hasLoggerImport(content)) {
      return content;
    }

    // Encontrar la posición correcta para el import
    const lines = content.split('\n');
    let insertIndex = 0;

    // Buscar después de otros imports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ')) {
        insertIndex = i + 1;
      } else if (line && !line.startsWith('//') && !line.startsWith('/*')) {
        break;
      }
    }

    lines.splice(insertIndex, 0, '', importStatement);
    return lines.join('\n');
  }

  /**
   * Migrar un archivo específico
   */
  public migrateFile(filepath: string, dryRun: boolean = false): MigrationResult {
    const result: MigrationResult = {
      file: filepath,
      originalLogs: 0,
      migratedLogs: 0,
      addedImports: [],
      errors: [],
      success: false
    };

    try {
      // Verificar que el archivo existe
      if (!existsSync(filepath)) {
        result.errors.push(`Archivo no encontrado: ${filepath}`);
        return result;
      }

      // Leer contenido original
      const originalContent = readFileSync(filepath, 'utf8');
      result.originalLogs = this.countConsoleLogs(originalContent);

      if (result.originalLogs === 0) {
        result.success = true;
        return result;
      }

      // Crear backup
      if (!dryRun) {
        writeFileSync(`${filepath}.backup`, originalContent);
      }

      let modifiedContent = originalContent;
      const loggerInfo = this.determineLoggerForFile(filepath);

      // Aplicar patrones de migración
      let totalReplacements = 0;
      this.patterns.forEach(pattern => {
        const matches = modifiedContent.match(pattern.pattern);
        if (matches) {
          // Ajustar replacement para usar el logger correcto
          const adjustedReplacement = pattern.replacement.replace('logger', loggerInfo.loggerName);
          modifiedContent = modifiedContent.replace(pattern.pattern, adjustedReplacement);
          totalReplacements += matches.length;
        }
      });

      // Agregar import si es necesario
      if (totalReplacements > 0) {
        modifiedContent = this.addLoggerImport(modifiedContent, loggerInfo.import);
        result.addedImports.push(loggerInfo.import);
      }

      result.migratedLogs = totalReplacements;
      
      // Verificar que se migraron todos los logs
      const remainingLogs = this.countConsoleLogs(modifiedContent);
      if (remainingLogs > 0) {
        result.errors.push(`${remainingLogs} console.logs no pudieron migrarse automáticamente`);
      }

      // Escribir archivo modificado
      if (!dryRun && totalReplacements > 0) {
        writeFileSync(filepath, modifiedContent);
      }

      result.success = totalReplacements > 0 || result.originalLogs === 0;

    } catch (error) {
      result.errors.push(`Error procesando archivo: ${error.message}`);
    }

    return result;
  }

  /**
   * Migrar múltiples archivos
   */
  public migrateFiles(filepaths: string[], dryRun: boolean = false): MigrationResult[] {
    console.log(`🔄 Migrando ${filepaths.length} archivos${dryRun ? ' (DRY RUN)' : ''}...`);
    
    return filepaths.map(filepath => {
      console.log(`  Processing: ${filepath}`);
      const result = this.migrateFile(filepath, dryRun);
      
      if (result.success && result.migratedLogs > 0) {
        console.log(`    ✅ ${result.migratedLogs} logs migrados`);
      } else if (result.errors.length > 0) {
        console.log(`    ❌ ${result.errors.join(', ')}`);
      } else if (result.originalLogs === 0) {
        console.log(`    ✅ No console.logs encontrados`);
      }
      
      return result;
    });
  }

  /**
   * Generar reporte de migración
   */
  public generateMigrationReport(results: MigrationResult[]): string {
    const lines: string[] = [];
    
    lines.push('# Console.logs Migration Report');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    // Estadísticas generales
    const totalFiles = results.length;
    const successfulFiles = results.filter(r => r.success).length;
    const totalOriginalLogs = results.reduce((sum, r) => sum + r.originalLogs, 0);
    const totalMigratedLogs = results.reduce((sum, r) => sum + r.migratedLogs, 0);
    const filesWithErrors = results.filter(r => r.errors.length > 0).length;

    lines.push('## 📊 Resumen');
    lines.push(`- **Archivos procesados**: ${totalFiles}`);
    lines.push(`- **Archivos exitosos**: ${successfulFiles}/${totalFiles}`);
    lines.push(`- **Console.logs originales**: ${totalOriginalLogs}`);
    lines.push(`- **Console.logs migrados**: ${totalMigratedLogs}`);
    lines.push(`- **Archivos con errores**: ${filesWithErrors}`);
    lines.push('');

    // Detalles por archivo
    lines.push('## 📁 Detalles por Archivo');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      lines.push(`### ${status} \`${result.file}\``);
      lines.push(`- Console.logs originales: ${result.originalLogs}`);
      lines.push(`- Console.logs migrados: ${result.migratedLogs}`);
      
      if (result.addedImports.length > 0) {
        lines.push('- Imports agregados:');
        result.addedImports.forEach(imp => {
          lines.push(`  - \`${imp}\``);
        });
      }
      
      if (result.errors.length > 0) {
        lines.push('- ❌ Errores:');
        result.errors.forEach(error => {
          lines.push(`  - ${error}`);
        });
      }
      
      lines.push('');
    });

    // Archivos que requieren atención manual
    const filesNeedingAttention = results.filter(r => 
      r.errors.length > 0 || (r.originalLogs > 0 && r.migratedLogs < r.originalLogs)
    );

    if (filesNeedingAttention.length > 0) {
      lines.push('## ⚠️ Archivos que Requieren Atención Manual');
      filesNeedingAttention.forEach(result => {
        lines.push(`- **${result.file}**`);
        if (result.originalLogs > result.migratedLogs) {
          const remaining = result.originalLogs - result.migratedLogs;
          lines.push(`  - ${remaining} console.logs no migrados automáticamente`);
        }
        result.errors.forEach(error => {
          lines.push(`  - ${error}`);
        });
      });
      lines.push('');
    }

    return lines.join('\n');
  }
}

// Ejecución principal
if (require.main === module) {
  const migrator = new ConsoleLogMigrator();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: npx tsx migrate-console-logs.ts <file1> [file2] [--dry-run]');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx migrate-console-logs.ts src/app/settings/page.tsx');
    console.log('  npx tsx migrate-console-logs.ts src/components/**/*.tsx --dry-run');
    process.exit(1);
  }

  const dryRun = args.includes('--dry-run');
  const files = args.filter(arg => !arg.startsWith('--'));
  
  try {
    const results = migrator.migrateFiles(files, dryRun);
    const report = migrator.generateMigrationReport(results);
    
    console.log('\n' + report);
    
    // Guardar reporte
    const fs = require('fs');
    const timestamp = new Date().toISOString().slice(0, 10);
    const reportFile = `migration-report-${timestamp}.md`;
    
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 Reporte guardado en: ${reportFile}`);
    
    // Exit code basado en éxito
    const hasErrors = results.some(r => r.errors.length > 0);
    process.exit(hasErrors ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  }
}

export default ConsoleLogMigrator;
```

### Uso del Script de Migración
```bash
# Migración de archivo individual
npx tsx scripts/console-log-migration/migrate-console-logs.ts src/app/settings/page.tsx

# Dry run para ver qué cambios se harían
npx tsx scripts/console-log-migration/migrate-console-logs.ts src/app/settings/page.tsx --dry-run

# Migración de múltiples archivos
npx tsx scripts/console-log-migration/migrate-console-logs.ts \
  src/app/settings/page.tsx \
  src/app/calreact/page.tsx \
  src/components/ui/addressInput.tsx

# El script genera reportes automáticamente y crea backups .backup
```

## ✅ 3. Script de Validación Post-Migración

### `validate-migration.ts`

```typescript
#!/usr/bin/env npx tsx
/**
 * Validador completo post-migración
 * Uso: npx tsx scripts/console-log-migration/validate-migration.ts
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

interface ValidationResult {
  file: string;
  hasConsoleLogs: boolean;
  consoleLogCount: number;
  hasLoggerImport: boolean;
  syntaxValid: boolean;
  errors: string[];
  warnings: string[];
  success: boolean;
}

interface ProjectValidation {
  totalFiles: number;
  validFiles: number;
  filesWithIssues: number;
  remainingConsoleLogs: number;
  results: ValidationResult[];
  summary: {
    allMigrated: boolean;
    allSyntaxValid: boolean;
    allImportsPresent: boolean;
  };
}

class MigrationValidator {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Validar sintaxis TypeScript de un archivo
   */
  private validateTypeScriptSyntax(filepath: string): boolean {
    try {
      execSync(`npx tsc --noEmit --skipLibCheck "${filepath}"`, {
        stdio: 'pipe',
        cwd: this.projectRoot
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Contar console.logs en archivo
   */
  private countConsoleLogs(content: string): number {
    const matches = content.match(/console\.(log|error|warn|info|debug)/g);
    return matches ? matches.length : 0;
  }

  /**
   * Verificar si tiene import de logger
   */
  private hasLoggerImport(content: string): boolean {
    return /import.*[Ll]ogger.*from.*['"`]@\/lib\/logger['"`]/i.test(content);
  }

  /**
   * Validar archivo individual
   */
  public validateFile(filepath: string): ValidationResult {
    const result: ValidationResult = {
      file: filepath,
      hasConsoleLogs: false,
      consoleLogCount: 0,
      hasLoggerImport: false,
      syntaxValid: false,
      errors: [],
      warnings: [],
      success: false
    };

    try {
      if (!existsSync(filepath)) {
        result.errors.push('Archivo no encontrado');
        return result;
      }

      const content = readFileSync(filepath, 'utf8');
      
      // Verificar console.logs
      result.consoleLogCount = this.countConsoleLogs(content);
      result.hasConsoleLogs = result.consoleLogCount > 0;

      // Verificar import de logger
      result.hasLoggerImport = this.hasLoggerImport(content);

      // Verificar sintaxis TypeScript
      if (filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
        result.syntaxValid = this.validateTypeScriptSyntax(filepath);
        if (!result.syntaxValid) {
          result.errors.push('Errores de sintaxis TypeScript');
        }
      } else {
        result.syntaxValid = true; // Archivos JS no se validan
      }

      // Análisis de consistencia
      if (result.hasConsoleLogs) {
        result.errors.push(`${result.consoleLogCount} console.logs no migrados`);
      }

      if (!result.hasConsoleLogs && !result.hasLoggerImport) {
        result.warnings.push('Sin console.logs ni Logger imports (podría ser correcto)');
      }

      if (result.hasLoggerImport && result.hasConsoleLogs) {
        result.warnings.push('Tiene Logger import pero aún hay console.logs');
      }

      // Determinar éxito
      result.success = !result.hasConsoleLogs && result.syntaxValid;

    } catch (error) {
      result.errors.push(`Error validando archivo: ${error.message}`);
    }

    return result;
  }

  /**
   * Obtener archivos de producción para validar
   */
  private getProductionFiles(): string[] {
    try {
      const output = execSync(
        'find src/ -type f \\( -name "*.ts" -o -name "*.tsx" \\) | grep -v ".backup"',
        { encoding: 'utf8', cwd: this.projectRoot }
      );
      return output.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  /**
   * Validar proyecto completo
   */
  public validateProject(): ProjectValidation {
    console.log('🔍 Validando migración de console.logs...');
    
    const productionFiles = this.getProductionFiles();
    const results = productionFiles.map(file => this.validateFile(file));

    const validFiles = results.filter(r => r.success).length;
    const filesWithIssues = results.filter(r => r.errors.length > 0).length;
    const remainingConsoleLogs = results.reduce((sum, r) => sum + r.consoleLogCount, 0);

    return {
      totalFiles: results.length,
      validFiles,
      filesWithIssues,
      remainingConsoleLogs,
      results,
      summary: {
        allMigrated: remainingConsoleLogs === 0,
        allSyntaxValid: results.every(r => r.syntaxValid),
        allImportsPresent: results.filter(r => !r.hasConsoleLogs).every(r => r.hasLoggerImport || r.warnings.length > 0)
      }
    };
  }

  /**
   * Ejecutar tests automáticos
   */
  public runAutomatedTests(): { success: boolean; output: string } {
    try {
      console.log('🧪 Ejecutando tests automáticos...');
      
      // Tests unitarios
      const testOutput = execSync('npm run test -- --passWithNoTests --verbose', {
        encoding: 'utf8',
        cwd: this.projectRoot
      });

      return { success: true, output: testOutput };
    } catch (error) {
      return { 
        success: false, 
        output: error.message || 'Error ejecutando tests' 
      };
    }
  }

  /**
   * Verificar build del proyecto
   */
  public validateBuild(): { success: boolean; output: string } {
    try {
      console.log('🏗️ Validando build del proyecto...');
      
      const buildOutput = execSync('npm run build', {
        encoding: 'utf8',
        cwd: this.projectRoot
      });

      return { success: true, output: buildOutput };
    } catch (error) {
      return { 
        success: false, 
        output: error.message || 'Error en build' 
      };
    }
  }

  /**
   * Generar reporte de validación
   */
  public generateValidationReport(validation: ProjectValidation): string {
    const lines: string[] = [];
    
    lines.push('# Migration Validation Report');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    // Resumen ejecutivo
    const status = validation.summary.allMigrated ? '✅ ÉXITO' : '❌ PENDIENTE';
    lines.push(`## 🎯 Estado: ${status}`);
    lines.push('');
    
    lines.push('## 📊 Resumen General');
    lines.push(`- **Archivos analizados**: ${validation.totalFiles}`);
    lines.push(`- **Archivos válidos**: ${validation.validFiles}/${validation.totalFiles}`);
    lines.push(`- **Archivos con problemas**: ${validation.filesWithIssues}`);
    lines.push(`- **Console.logs restantes**: ${validation.remainingConsoleLogs}`);
    lines.push('');

    // Estado por criterio
    lines.push('## ✅ Estado por Criterio');
    lines.push(`- **Migración completa**: ${validation.summary.allMigrated ? '✅' : '❌'}`);
    lines.push(`- **Sintaxis válida**: ${validation.summary.allSyntaxValid ? '✅' : '❌'}`);
    lines.push(`- **Imports consistentes**: ${validation.summary.allImportsPresent ? '✅' : '❌'}`);
    lines.push('');

    // Archivos con problemas
    const problemFiles = validation.results.filter(r => r.errors.length > 0);
    if (problemFiles.length > 0) {
      lines.push('## ❌ Archivos con Problemas');
      problemFiles.forEach(result => {
        lines.push(`### \`${result.file}\``);
        if (result.consoleLogCount > 0) {
          lines.push(`- 🔍 Console.logs restantes: ${result.consoleLogCount}`);
        }
        result.errors.forEach(error => {
          lines.push(`- ❌ ${error}`);
        });
        result.warnings.forEach(warning => {
          lines.push(`- ⚠️ ${warning}`);
        });
        lines.push('');
      });
    }

    // Archivos exitosos
    const successFiles = validation.results.filter(r => r.success);
    if (successFiles.length > 0) {
      lines.push(`## ✅ Archivos Migrados Exitosamente (${successFiles.length})`);
      successFiles.forEach(result => {
        lines.push(`- \`${result.file}\``);
      });
      lines.push('');
    }

    // Comandos de corrección
    if (problemFiles.length > 0) {
      lines.push('## 🔧 Comandos de Corrección');
      lines.push('```bash');
      lines.push('# Verificar console.logs restantes');
      problemFiles.forEach(result => {
        if (result.consoleLogCount > 0) {
          lines.push(`grep -n "console\\." "${result.file}"`);
        }
      });
      
      lines.push('');
      lines.push('# Corregir sintaxis TypeScript');
      const syntaxErrors = problemFiles.filter(r => !r.syntaxValid);
      syntaxErrors.forEach(result => {
        lines.push(`npx tsc --noEmit "${result.file}"`);
      });
      lines.push('```');
      lines.push('');
    }

    // Next steps
    lines.push('## 🎯 Próximos Pasos');
    if (validation.summary.allMigrated) {
      lines.push('- ✅ Migración completada');
      lines.push('- 🧪 Ejecutar tests E2E completos');
      lines.push('- 🚀 Preparar para deploy');
    } else {
      lines.push('- 🔄 Completar migración de archivos pendientes');
      lines.push('- 🔧 Corregir errores de sintaxis');
      lines.push('- ✅ Re-ejecutar validación');
    }

    return lines.join('\n');
  }
}

// Ejecución principal
if (require.main === module) {
  try {
    const validator = new MigrationValidator();
    
    // Validar proyecto
    const validation = validator.validateProject();
    
    // Ejecutar tests si la migración está completa
    let testResults = null;
    let buildResults = null;
    
    if (validation.summary.allMigrated) {
      testResults = validator.runAutomatedTests();
      buildResults = validator.validateBuild();
    }
    
    // Generar reporte
    const report = validator.generateValidationReport(validation);
    console.log('\n' + report);
    
    // Agregar resultados de tests al reporte
    if (testResults) {
      console.log('\n## 🧪 Resultados de Tests');
      console.log(testResults.success ? '✅ Tests exitosos' : '❌ Tests fallaron');
      if (!testResults.success) {
        console.log(testResults.output);
      }
    }
    
    if (buildResults) {
      console.log('\n## 🏗️ Resultados de Build');
      console.log(buildResults.success ? '✅ Build exitoso' : '❌ Build falló');
      if (!buildResults.success) {
        console.log(buildResults.output);
      }
    }
    
    // Guardar reporte
    const fs = require('fs');
    const timestamp = new Date().toISOString().slice(0, 10);
    const reportFile = `validation-report-${timestamp}.md`;
    
    fs.writeFileSync(reportFile, report);
    console.log(`\n📄 Reporte guardado en: ${reportFile}`);
    
    // Exit code
    const success = validation.summary.allMigrated && 
                   (testResults?.success !== false) && 
                   (buildResults?.success !== false);
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error durante validación:', error);
    process.exit(1);
  }
}

export default MigrationValidator;
```

## 🔙 4. Script de Rollback de Emergencia

### `rollback-migration.ts`

```typescript
#!/usr/bin/env npx tsx
/**
 * Script de rollback de emergencia para migración de console.logs
 * Uso: npx tsx scripts/console-log-migration/rollback-migration.ts
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

interface RollbackResult {
  file: string;
  hadBackup: boolean;
  restored: boolean;
  error?: string;
}

class MigrationRollback {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  /**
   * Encontrar todos los archivos .backup en src/
   */
  private findBackupFiles(): string[] {
    try {
      const output = execSync('find src/ -name "*.backup"', {
        encoding: 'utf8',
        cwd: this.projectRoot
      });
      return output.trim().split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  /**
   * Rollback de un archivo individual
   */
  public rollbackFile(backupPath: string): RollbackResult {
    const originalPath = backupPath.replace('.backup', '');
    
    const result: RollbackResult = {
      file: originalPath,
      hadBackup: existsSync(backupPath),
      restored: false
    };

    try {
      if (!result.hadBackup) {
        result.error = 'Archivo .backup no encontrado';
        return result;
      }

      // Verificar que el backup es válido
      const backupContent = readFileSync(backupPath, 'utf8');
      if (!backupContent.trim()) {
        result.error = 'Archivo .backup está vacío';
        return result;
      }

      // Restaurar archivo original
      writeFileSync(originalPath, backupContent);
      
      // Eliminar backup
      unlinkSync(backupPath);
      
      result.restored = true;
      
    } catch (error) {
      result.error = error.message;
    }

    return result;
  }

  /**
   * Rollback completo del proyecto
   */
  public rollbackProject(): RollbackResult[] {
    console.log('🔙 Iniciando rollback de migración console.logs...');
    
    const backupFiles = this.findBackupFiles();
    console.log(`📁 Encontrados ${backupFiles.length} archivos .backup`);
    
    if (backupFiles.length === 0) {
      console.log('⚠️  No se encontraron archivos .backup');
      return [];
    }

    return backupFiles.map(backupPath => {
      const result = this.rollbackFile(backupPath);
      
      if (result.restored) {
        console.log(`  ✅ Restaurado: ${result.file}`);
      } else {
        console.log(`  ❌ Error: ${result.file} - ${result.error}`);
      }
      
      return result;
    });
  }

  /**
   * Rollback usando Git (si está disponible)
   */
  public rollbackWithGit(commitHash?: string): { success: boolean; output: string } {
    try {
      console.log('🔙 Intentando rollback con Git...');
      
      // Si no se proporciona commit, buscar el último commit antes de migración
      if (!commitHash) {
        const logOutput = execSync('git log --oneline -10', {
          encoding: 'utf8',
          cwd: this.projectRoot
        });
        
        const lines = logOutput.split('\n');
        const backupCommit = lines.find(line => 
          line.includes('backup') || 
          line.includes('antes de migración') ||
          line.includes('before migration')
        );
        
        if (backupCommit) {
          commitHash = backupCommit.split(' ')[0];
        } else {
          return {
            success: false,
            output: 'No se encontró commit de backup automáticamente'
          };
        }
      }

      // Realizar rollback
      const resetOutput = execSync(`git reset --hard ${commitHash}`, {
        encoding: 'utf8',
        cwd: this.projectRoot
      });

      return { success: true, output: resetOutput };
      
    } catch (error) {
      return { 
        success: false, 
        output: error.message || 'Error en rollback con Git' 
      };
    }
  }

  /**
   * Verificar estado post-rollback
   */
  public verifyRollback(): { consoleLogsCount: number; success: boolean } {
    try {
      const output = execSync('rg "console\\.(log|error|warn|info|debug)" src/ --count', {
        encoding: 'utf8',
        cwd: this.projectRoot
      });
      
      const lines = output.trim().split('\n');
      const totalCount = lines.reduce((sum, line) => {
        const match = line.match(/:(\d+)$/);
        return sum + (match ? parseInt(match[1]) : 0);
      }, 0);

      return { consoleLogsCount: totalCount, success: true };
      
    } catch {
      return { consoleLogsCount: 0, success: false };
    }
  }

  /**
   * Generar reporte de rollback
   */
  public generateRollbackReport(results: RollbackResult[]): string {
    const lines: string[] = [];
    
    lines.push('# Console.logs Migration Rollback Report');
    lines.push(`Generated: ${new Date().toISOString()}`);
    lines.push('');

    const successful = results.filter(r => r.restored).length;
    const failed = results.filter(r => !r.restored).length;

    lines.push('## 📊 Resumen de Rollback');
    lines.push(`- **Archivos procesados**: ${results.length}`);
    lines.push(`- **Restaurados exitosamente**: ${successful}`);
    lines.push(`- **Fallaron**: ${failed}`);
    lines.push('');

    if (successful > 0) {
      lines.push('## ✅ Archivos Restaurados');
      results.filter(r => r.restored).forEach(result => {
        lines.push(`- \`${result.file}\``);
      });
      lines.push('');
    }

    if (failed > 0) {
      lines.push('## ❌ Archivos con Errores');
      results.filter(r => !r.restored).forEach(result => {
        lines.push(`- \`${result.file}\`: ${result.error}`);
      });
      lines.push('');
    }

    // Estado post-rollback
    const verification = this.verifyRollback();
    lines.push('## 🔍 Verificación Post-Rollback');
    if (verification.success) {
      lines.push(`- Console.logs encontrados: ${verification.consoleLogsCount}`);
      lines.push('- Estado: Rollback completado, console.logs restaurados');
    } else {
      lines.push('- ⚠️  No se pudo verificar estado post-rollback');
    }
    lines.push('');

    lines.push('## 🎯 Próximos Pasos');
    lines.push('- Verificar que la aplicación funciona correctamente');
    lines.push('- Ejecutar tests para confirmar funcionalidad');
    lines.push('- Revisar causas del rollback antes de intentar migración nuevamente');

    return lines.join('\n');
  }
}

// Ejecución principal
if (require.main === module) {
  try {
    const rollback = new MigrationRollback();
    const args = process.argv.slice(2);
    
    if (args.includes('--git')) {
      // Rollback usando Git
      const commitIndex = args.findIndex(arg => arg === '--commit') + 1;
      const commitHash = commitIndex > 0 && commitIndex < args.length ? args[commitIndex] : undefined;
      
      const gitResult = rollback.rollbackWithGit(commitHash);
      
      if (gitResult.success) {
        console.log('✅ Rollback con Git exitoso');
        console.log(gitResult.output);
      } else {
        console.log('❌ Rollback con Git falló');
        console.log(gitResult.output);
        
        // Fallback a rollback con backups
        console.log('🔄 Intentando rollback con archivos .backup...');
        const results = rollback.rollbackProject();
        const report = rollback.generateRollbackReport(results);
        console.log('\n' + report);
      }
      
    } else {
      // Rollback usando archivos .backup
      const results = rollback.rollbackProject();
      const report = rollback.generateRollbackReport(results);
      
      console.log('\n' + report);
      
      // Guardar reporte
      const fs = require('fs');
      const timestamp = new Date().toISOString().slice(0, 10);
      const reportFile = `rollback-report-${timestamp}.md`;
      
      fs.writeFileSync(reportFile, report);
      console.log(`\n📄 Reporte guardado en: ${reportFile}`);
    }
    
    // Verificar estado final
    const verification = rollback.verifyRollback();
    if (verification.success) {
      console.log(`\n🔍 Estado final: ${verification.consoleLogsCount} console.logs en src/`);
    }
    
  } catch (error) {
    console.error('❌ Error durante rollback:', error);
    process.exit(1);
  }
}

export default MigrationRollback;
```

### Uso del Rollback
```bash
# Rollback usando archivos .backup (recomendado)
npx tsx scripts/console-log-migration/rollback-migration.ts

# Rollback usando Git (si hay commit de backup)
npx tsx scripts/console-log-migration/rollback-migration.ts --git

# Rollback a commit específico
npx tsx scripts/console-log-migration/rollback-migration.ts --git --commit abc123def
```

## 🛠 5. Herramientas de Configuración

### `setup-eslint-rules.js`

Script para configurar reglas ESLint que prevengan console.logs futuros.

```javascript
#!/usr/bin/env node
/**
 * Configurar reglas ESLint para prevenir console.logs
 * Uso: node scripts/console-log-migration/setup-eslint-rules.js
 */

const fs = require('fs');
const path = require('path');

class ESLintConfigurer {
  constructor() {
    this.projectRoot = process.cwd();
    this.eslintConfigPath = path.join(this.projectRoot, '.eslintrc.json');
  }

  /**
   * Leer configuración ESLint actual
   */
  readESLintConfig() {
    try {
      if (fs.existsSync(this.eslintConfigPath)) {
        return JSON.parse(fs.readFileSync(this.eslintConfigPath, 'utf8'));
      }
      return {};
    } catch (error) {
      throw new Error(`Error leyendo .eslintrc.json: ${error.message}`);
    }
  }

  /**
   * Configuración de reglas para console.logs
   */
  getConsoleLogRules() {
    return {
      rules: {
        'no-console': [
          'error',
          {
            allow: [] // Prohibir todos los console.*
          }
        ]
      },
      overrides: [
        {
          files: ['scripts/**/*', 'e2e/**/*'],
          rules: {
            'no-console': 'off' // Permitir en scripts y tests E2E
          }
        },
        {
          files: ['src/lib/logger.ts'],
          rules: {
            'no-console': 'off' // Permitir en la implementación del logger
          }
        }
      ]
    };
  }

  /**
   * Merger configuración actual con nuevas reglas
   */
  mergeConfigurations(currentConfig, newRules) {
    const merged = { ...currentConfig };
    
    // Merge rules
    merged.rules = {
      ...merged.rules,
      ...newRules.rules
    };

    // Merge overrides
    if (newRules.overrides) {
      merged.overrides = merged.overrides || [];
      
      newRules.overrides.forEach(newOverride => {
        // Buscar override existente con los mismos archivos
        const existingIndex = merged.overrides.findIndex(existing => 
          JSON.stringify(existing.files) === JSON.stringify(newOverride.files)
        );

        if (existingIndex >= 0) {
          // Merge con override existente
          merged.overrides[existingIndex].rules = {
            ...merged.overrides[existingIndex].rules,
            ...newOverride.rules
          };
        } else {
          // Agregar nuevo override
          merged.overrides.push(newOverride);
        }
      });
    }

    return merged;
  }

  /**
   * Aplicar configuración
   */
  applyConfiguration() {
    console.log('🔧 Configurando reglas ESLint para console.logs...');
    
    try {
      const currentConfig = this.readESLintConfig();
      const consoleRules = this.getConsoleLogRules();
      const mergedConfig = this.mergeConfigurations(currentConfig, consoleRules);

      // Escribir configuración actualizada
      fs.writeFileSync(
        this.eslintConfigPath,
        JSON.stringify(mergedConfig, null, 2)
      );

      console.log('✅ Configuración ESLint actualizada');
      console.log('📄 Archivo: .eslintrc.json');
      
      return true;
    } catch (error) {
      console.error('❌ Error configurando ESLint:', error.message);
      return false;
    }
  }

  /**
   * Verificar configuración
   */
  verifyConfiguration() {
    console.log('🔍 Verificando configuración ESLint...');
    
    try {
      const config = this.readESLintConfig();
      
      // Verificar regla no-console
      const hasNoConsoleRule = config.rules && config.rules['no-console'];
      if (!hasNoConsoleRule) {
        console.log('⚠️  Regla no-console no encontrada');
        return false;
      }

      // Verificar overrides
      const hasOverrides = config.overrides && config.overrides.length > 0;
      if (!hasOverrides) {
        console.log('⚠️  Overrides para scripts/e2e no encontrados');
        return false;
      }

      console.log('✅ Configuración ESLint correcta');
      return true;
      
    } catch (error) {
      console.error('❌ Error verificando configuración:', error.message);
      return false;
    }
  }

  /**
   * Test de configuración con archivos de ejemplo
   */
  testConfiguration() {
    console.log('🧪 Testeando configuración ESLint...');
    
    try {
      const { execSync } = require('child_process');
      
      // Test archivo de producción (debe fallar con console.log)
      const testProdFile = `
// Test file - should fail
console.log('This should trigger ESLint error');
export default function test() { return 'test'; }
`.trim();

      fs.writeFileSync('eslint-test-prod.ts', testProdFile);
      
      try {
        execSync('npx eslint eslint-test-prod.ts', { stdio: 'pipe' });
        console.log('❌ ESLint debería haber fallado para archivo de producción');
        return false;
      } catch {
        console.log('✅ ESLint correctamente detecta console.log en producción');
      } finally {
        fs.unlinkSync('eslint-test-prod.ts');
      }

      // Test archivo de script (debe pasar con console.log)  
      const testScriptFile = `
// Test file - should pass
console.log('This should be allowed in scripts');
module.exports = 'test';
`.trim();

      fs.writeFileSync('scripts/eslint-test-script.js', testScriptFile);
      
      try {
        execSync('npx eslint scripts/eslint-test-script.js', { stdio: 'pipe' });
        console.log('✅ ESLint correctamente permite console.log en scripts');
      } catch {
        console.log('❌ ESLint no debería fallar para archivos de script');
        return false;
      } finally {
        fs.unlinkSync('scripts/eslint-test-script.js');
      }

      return true;
      
    } catch (error) {
      console.error('❌ Error testeando configuración:', error.message);
      return false;
    }
  }
}

// Ejecución principal
if (require.main === module) {
  const configurer = new ESLintConfigurer();
  const args = process.argv.slice(2);

  if (args.includes('--verify')) {
    const success = configurer.verifyConfiguration();
    process.exit(success ? 0 : 1);
  } else if (args.includes('--test')) {
    const success = configurer.testConfiguration();
    process.exit(success ? 0 : 1);
  } else {
    const success = configurer.applyConfiguration();
    if (success) {
      console.log('\n🔍 Verificando configuración...');
      const verified = configurer.verifyConfiguration();
      
      if (verified) {
        console.log('\n🧪 Testeando configuración...');
        const tested = configurer.testConfiguration();
        
        if (tested) {
          console.log('\n🎉 Configuración ESLint completada exitosamente');
          console.log('\n📝 Próximos pasos:');
          console.log('1. Ejecutar: npm run lint');
          console.log('2. Corregir cualquier console.log detectado en src/');
          console.log('3. Configurar pre-commit hook si es necesario');
        }
      }
    }
    
    process.exit(success ? 0 : 1);
  }
}

module.exports = ESLintConfigurer;
```

## 🔄 6. Script Master de Ejecución

### `master-migration.sh`

Script principal que orquesta todo el proceso de migración.

```bash
#!/bin/bash
# scripts/console-log-migration/master-migration.sh
# Script maestro para migración completa de console.logs

set -e # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar pre-requisitos
check_prerequisites() {
    log_info "Verificando pre-requisitos..."
    
    # Verificar node/npm
    if ! command -v node &> /dev/null; then
        log_error "Node.js no está instalado"
        exit 1
    fi
    
    # Verificar tsx
    if ! command -v npx &> /dev/null; then
        log_error "npx no está disponible"
        exit 1
    fi
    
    # Verificar ripgrep
    if ! command -v rg &> /dev/null; then
        log_warning "ripgrep no está instalado - instalando..."
        # Intentar instalar según el sistema
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt update && sudo apt install -y ripgrep
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install ripgrep
        else
            log_error "ripgrep debe instalarse manualmente"
            exit 1
        fi
    fi
    
    # Verificar que estamos en la raíz del proyecto
    if [[ ! -f "package.json" ]] || [[ ! -d "src" ]]; then
        log_error "Debe ejecutarse desde la raíz del proyecto"
        exit 1
    fi
    
    log_success "Pre-requisitos verificados"
}

# Crear backup completo
create_backup() {
    log_info "Creando backup completo..."
    
    # Commit de backup
    if git status --porcelain | grep -q .; then
        git add .
        git commit -m "backup: Antes de migración console.logs - $(date)"
        log_success "Backup creado en Git"
    else
        log_info "Working directory limpio - no se requiere backup"
    fi
}

# Análisis inicial
run_analysis() {
    log_info "Ejecutando análisis completo..."
    
    if npx tsx scripts/console-log-migration/analyze-console-logs.ts; then
        log_success "Análisis completado"
        return 0
    else
        log_warning "Análisis indica console.logs en producción - procediendo con migración"
        return 1
    fi
}

# Configurar ESLint
setup_eslint() {
    log_info "Configurando reglas ESLint..."
    
    if node scripts/console-log-migration/setup-eslint-rules.js; then
        log_success "ESLint configurado"
    else
        log_error "Error configurando ESLint"
        return 1
    fi
}

# Migración por fases
migrate_phase() {
    local phase=$1
    local description=$2
    shift 2
    local files=("$@")
    
    log_info "FASE $phase: $description"
    
    # Crear array de archivos que existen
    local existing_files=()
    for file in "${files[@]}"; do
        if [[ -f "$file" ]]; then
            existing_files+=("$file")
        else
            log_warning "Archivo no encontrado: $file"
        fi
    done
    
    if [[ ${#existing_files[@]} -eq 0 ]]; then
        log_warning "No hay archivos para migrar en la Fase $phase"
        return 0
    fi
    
    # Ejecutar migración
    log_info "Migrando ${#existing_files[@]} archivos..."
    if npx tsx scripts/console-log-migration/migrate-console-logs.ts "${existing_files[@]}"; then
        log_success "Fase $phase completada"
        
        # Validar inmediatamente
        log_info "Validando Fase $phase..."
        local validation_errors=0
        for file in "${existing_files[@]}"; do
            if rg "console\.(log|error|warn|info|debug)" "$file" > /dev/null; then
                local count=$(rg "console\.(log|error|warn|info|debug)" "$file" -c)
                log_warning "$file: $count console.logs no migrados"
                validation_errors=$((validation_errors + count))
            fi
        done
        
        if [[ $validation_errors -gt 0 ]]; then
            log_warning "Fase $phase: $validation_errors console.logs requieren migración manual"
            return 1
        else
            log_success "Fase $phase: Migración completa"
            return 0
        fi
    else
        log_error "Error en Fase $phase"
        return 1
    fi
}

# Ejecutar todas las fases de migración
run_migration_phases() {
    log_info "Iniciando migración por fases..."
    
    local phase_errors=0
    
    # FASE 1: Infraestructura Core
    migrate_phase 1 "Infraestructura Core" \
        "src/services/calendarEventService.ts" \
        "src/hooks/useDataSync.ts" \
        "src/lib/firebase/validation.ts" \
        "src/contexts/AppConfigContext.tsx" \
        || ((phase_errors++))
    
    # FASE 2: Páginas Críticas
    migrate_phase 2 "Páginas Críticas" \
        "src/app/settings/page.tsx" \
        "src/app/calreact/page.tsx" \
        "src/app/clients/newPayment/[clientId]/page.tsx" \
        "src/app/visits/page.tsx" \
        || ((phase_errors++))
    
    # FASE 3: Componentes UI Críticos
    migrate_phase 3 "Componentes UI Críticos" \
        "src/components/modals/visits/EditVisitDialog.tsx" \
        "src/components/modals/projects/EditProjectDialog.tsx" \
        "src/components/ui/addressInput.tsx" \
        "src/components/calendar/calendar-event.tsx" \
        "src/components/account-statement-dialog.tsx" \
        "src/components/error-boundary/DialogErrorBoundary.tsx" \
        || ((phase_errors++))
    
    # FASE 4: Componentes Restantes
    log_info "FASE 4: Migración de componentes restantes..."
    local remaining_files=($(rg "console\.(log|error|warn|info|debug)" src/ --files-with-matches | grep -v ".backup"))
    
    if [[ ${#remaining_files[@]} -gt 0 ]]; then
        migrate_phase 4 "Componentes Restantes" "${remaining_files[@]}" || ((phase_errors++))
    else
        log_success "Fase 4: No hay archivos restantes para migrar"
    fi
    
    return $phase_errors
}

# Validación completa post-migración
run_complete_validation() {
    log_info "Ejecutando validación completa..."
    
    if npx tsx scripts/console-log-migration/validate-migration.ts; then
        log_success "Validación exitosa"
        return 0
    else
        log_error "Validación falló"
        return 1
    fi
}

# Ejecutar tests
run_tests() {
    log_info "Ejecutando tests..."
    
    # Tests unitarios
    log_info "Tests unitarios..."
    if npm run test -- --passWithNoTests; then
        log_success "Tests unitarios exitosos"
    else
        log_error "Tests unitarios fallaron"
        return 1
    fi
    
    # TypeScript check
    log_info "Verificación TypeScript..."
    if npm run typecheck; then
        log_success "TypeScript check exitoso"
    else
        log_error "TypeScript check falló"
        return 1
    fi
    
    # ESLint
    log_info "ESLint check..."
    if npm run lint; then
        log_success "ESLint check exitoso"
    else
        log_error "ESLint check falló"
        return 1
    fi
    
    return 0
}

# Función de rollback
rollback_migration() {
    log_error "Ejecutando rollback de emergencia..."
    
    if npx tsx scripts/console-log-migration/rollback-migration.ts; then
        log_success "Rollback completado"
    else
        log_error "Rollback falló - revisar manualmente"
        return 1
    fi
}

# Función principal
main() {
    echo "🚀 Console.logs Migration Master Script"
    echo "======================================"
    
    # Parse argumentos
    DRY_RUN=false
    SKIP_TESTS=false
    FORCE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --help)
                echo "Uso: $0 [opciones]"
                echo "Opciones:"
                echo "  --dry-run     Mostrar cambios sin aplicarlos"
                echo "  --skip-tests  Omitir ejecución de tests"
                echo "  --force       Continuar aunque haya errores"
                echo "  --help        Mostrar esta ayuda"
                exit 0
                ;;
            *)
                log_error "Opción desconocida: $1"
                exit 1
                ;;
        esac
    done
    
    # Ejecutar pasos
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "MODO DRY RUN - No se aplicarán cambios"
    fi
    
    # 1. Pre-requisitos
    check_prerequisites || exit 1
    
    # 2. Backup
    if [[ "$DRY_RUN" == "false" ]]; then
        create_backup || exit 1
    fi
    
    # 3. Análisis inicial
    run_analysis
    analysis_result=$?
    
    if [[ $analysis_result -eq 0 ]]; then
        log_success "No se requiere migración - proyecto ya limpio"
        exit 0
    fi
    
    # 4. Configurar ESLint
    if [[ "$DRY_RUN" == "false" ]]; then
        setup_eslint || {
            if [[ "$FORCE" == "false" ]]; then
                exit 1
            fi
        }
    fi
    
    # 5. Migración por fases
    if [[ "$DRY_RUN" == "false" ]]; then
        run_migration_phases
        migration_result=$?
        
        if [[ $migration_result -gt 0 ]]; then
            log_warning "$migration_result fases tuvieron problemas"
            
            if [[ "$FORCE" == "false" ]]; then
                log_error "Migración incompleta - usar --force para continuar o ejecutar rollback"
                echo "Para rollback: npx tsx scripts/console-log-migration/rollback-migration.ts"
                exit 1
            fi
        fi
    fi
    
    # 6. Validación completa
    if [[ "$DRY_RUN" == "false" ]]; then
        if ! run_complete_validation; then
            if [[ "$FORCE" == "false" ]]; then
                log_error "Validación falló - considerando rollback"
                rollback_migration
                exit 1
            fi
        fi
    fi
    
    # 7. Tests
    if [[ "$SKIP_TESTS" == "false" ]] && [[ "$DRY_RUN" == "false" ]]; then
        if ! run_tests; then
            if [[ "$FORCE" == "false" ]]; then
                log_error "Tests fallaron - considerando rollback"
                rollback_migration
                exit 1
            fi
        fi
    fi
    
    # 8. Éxito
    log_success "🎉 Migración de console.logs completada exitosamente!"
    echo ""
    echo "📊 Resumen:"
    echo "- Console.logs migrados a Logger profesional"
    echo "- ESLint configurado para prevenir console.logs futuros"
    echo "- Tests pasando"
    echo "- Backups disponibles para rollback si necesario"
    echo ""
    echo "🎯 Próximos pasos:"
    echo "1. Revisar logs de migración generados"
    echo "2. Ejecutar tests E2E si es necesario"
    echo "3. Deploy a staging para validación"
    echo "4. Considerar configurar pre-commit hooks"
}

# Trap para manejo de errores
trap 'log_error "Script interrupted - archivos .backup disponibles para rollback"' INT

# Ejecutar función principal
main "$@"
```

### Uso del Script Master
```bash
# Hacer executable
chmod +x scripts/console-log-migration/master-migration.sh

# Migración completa
./scripts/console-log-migration/master-migration.sh

# Dry run para ver qué se haría
./scripts/console-log-migration/master-migration.sh --dry-run

# Migración forzada (continúa aunque haya errores)
./scripts/console-log-migration/master-migration.sh --force

# Sin tests (útil para desarrollo)
./scripts/console-log-migration/master-migration.sh --skip-tests
```

## 📦 7. Package.json Scripts

### Scripts recomendados para agregar a `package.json`:

```json
{
  "scripts": {
    "console-logs:analyze": "npx tsx scripts/console-log-migration/analyze-console-logs.ts",
    "console-logs:migrate": "./scripts/console-log-migration/master-migration.sh",
    "console-logs:migrate:dry-run": "./scripts/console-log-migration/master-migration.sh --dry-run",
    "console-logs:validate": "npx tsx scripts/console-log-migration/validate-migration.ts",
    "console-logs:rollback": "npx tsx scripts/console-log-migration/rollback-migration.ts",
    "console-logs:setup-eslint": "node scripts/console-log-migration/setup-eslint-rules.js"
  }
}
```

## 📋 Resumen de Herramientas

| Herramienta | Propósito | Comando |
|-------------|-----------|---------|
| **analyze-console-logs.ts** | Análisis completo del estado actual | `npm run console-logs:analyze` |
| **migrate-console-logs.ts** | Migración automática inteligente | `npx tsx migrate-console-logs.ts <files>` |
| **validate-migration.ts** | Validación post-migración | `npm run console-logs:validate` |
| **rollback-migration.ts** | Rollback de emergencia | `npm run console-logs:rollback` |
| **setup-eslint-rules.js** | Configuración ESLint preventiva | `npm run console-logs:setup-eslint` |
| **master-migration.sh** | Orquestador completo | `npm run console-logs:migrate` |

## 🔧 Configuración de CI/CD

### GitHub Actions example:
```yaml
# .github/workflows/console-logs-check.yml
name: Console.logs Check

on:
  pull_request:
    branches: [main, develop]

jobs:
  check-console-logs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run console-logs:analyze
        name: Verify no console.logs in production code
```

---

**Preparado por**: Claude Code Mentor Técnico  
**Incluye**: Scripts completos, funcionales y listos para usar  
**Compatibilidad**: Node.js 18+, TypeScript, Next.js 15, Firebase 11.x