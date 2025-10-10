#!/usr/bin/env tsx
/**
 * Migration Script: PaymentType Field Consistency
 *
 * Propósito: Actualizar todos los pagos en Firestore que no tienen `paymentType`
 * definido, infiriendo el tipo correcto basado en contexto (batchId, projectId).
 *
 * Uso:
 *   npx tsx scripts/migrate-payment-types.ts --dry-run    # Preview cambios
 *   npx tsx scripts/migrate-payment-types.ts --execute   # Ejecutar migración
 *
 * Documentación: /docs/technical/payment-type-migration-plan.md
 * Fecha: Octubre 2025
 */

import {
  collection,
  getDocs,
  writeBatch,
  doc,
  Timestamp,
  getCountFromServer,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { PAYMENT_TYPES } from '@/constants/payment';
import type { PaymentDocument, PaymentTypeOption } from '@/types/payment';

// ============================================
// CONFIGURACIÓN
// ============================================

const BATCH_SIZE = 500; // Firestore permite max 500 operaciones por batch
const DRY_RUN_FLAG = '--dry-run';
const EXECUTE_FLAG = '--execute';

// ============================================
// TIPOS Y CONSTANTES
// ============================================

interface MigrationResult {
  totalProcessed: number;
  totalUpdated: number;
  totalSkipped: number;
  totalErrors: number;
  distribution: {
    cliente: number;
    proyecto: number;
    otro: number;
  };
  errors: Array<{ id: string; error: string }>;
  executionTimeMs: number;
}

interface PaymentToMigrate {
  id: string;
  currentType: string | undefined;
  inferredType: PaymentTypeOption;
  batchId?: string;
  projectId: string;
}

// ============================================
// FUNCIONES CORE
// ============================================

/**
 * Infiere el tipo de pago correcto basado en contexto
 */
function inferPaymentType(payment: PaymentDocument): PaymentTypeOption {
  // 1. Si ya tiene paymentType válido, mantenerlo
  if (payment.paymentType && PAYMENT_TYPES.includes(payment.paymentType as any)) {
    return payment.paymentType as PaymentTypeOption;
  }

  // 2. Si tiene batchId → es pago de cliente
  if (payment.batchId) {
    return 'cliente';
  }

  // 3. Si tiene projectId → es pago de proyecto
  if (payment.projectId) {
    return 'proyecto';
  }

  // 4. Fallback (casos edge raros - investigar manualmente)
  return 'otro';
}

/**
 * Obtiene todos los pagos de Firestore
 */
async function getAllPayments(): Promise<Array<PaymentDocument & { id: string }>> {
  console.log('📥 Obteniendo todos los pagos de Firestore...');

  const paymentsRef = collection(db, 'payments');
  const snapshot = await getDocs(paymentsRef);

  const payments = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Array<PaymentDocument & { id: string }>;

  console.log(`✅ ${payments.length} pagos obtenidos\n`);
  return payments;
}

/**
 * Analiza qué pagos necesitan ser migrados
 */
function analyzePayments(
  payments: Array<PaymentDocument & { id: string }>
): {
  toMigrate: PaymentToMigrate[];
  alreadyValid: number;
} {
  console.log('🔍 Analizando pagos...');

  const toMigrate: PaymentToMigrate[] = [];
  let alreadyValid = 0;

  for (const payment of payments) {
    const inferredType = inferPaymentType(payment);

    // Si ya tiene el tipo correcto, skip
    if (payment.paymentType === inferredType) {
      alreadyValid++;
      continue;
    }

    // Necesita migración
    toMigrate.push({
      id: payment.id,
      currentType: payment.paymentType,
      inferredType,
      batchId: payment.batchId,
      projectId: payment.projectId,
    });
  }

  console.log(`✅ ${alreadyValid} pagos ya tienen paymentType correcto (no se tocarán)`);
  console.log(`🔄 ${toMigrate.length} pagos serán actualizados\n`);

  return { toMigrate, alreadyValid };
}

/**
 * Muestra preview de cambios en dry-run mode
 */
function showDryRunPreview(toMigrate: PaymentToMigrate[]) {
  console.log('📊 PREVIEW DE CAMBIOS (DRY RUN):');
  console.log('─'.repeat(80));

  // Agrupar por tipo inferido
  const byType = {
    cliente: toMigrate.filter((p) => p.inferredType === 'cliente'),
    proyecto: toMigrate.filter((p) => p.inferredType === 'proyecto'),
    otro: toMigrate.filter((p) => p.inferredType === 'otro'),
  };

  console.log(`\n📋 Distribución de cambios:`);
  console.log(`   - ${byType.cliente.length} → 'cliente' (tienen batchId)`);
  console.log(`   - ${byType.proyecto.length} → 'proyecto' (tienen projectId)`);
  console.log(`   - ${byType.otro.length} → 'otro' (casos edge)`);

  // Mostrar primeros 5 de cada tipo
  console.log(`\n🔍 Ejemplos de cambios:`);

  if (byType.cliente.length > 0) {
    console.log(`\n   Cliente payments (${Math.min(3, byType.cliente.length)} ejemplos):`);
    byType.cliente.slice(0, 3).forEach((p) => {
      console.log(
        `   - ${p.id}: ${p.currentType || 'undefined'} → '${p.inferredType}' (batchId: ${p.batchId})`
      );
    });
  }

  if (byType.proyecto.length > 0) {
    console.log(`\n   Proyecto payments (${Math.min(3, byType.proyecto.length)} ejemplos):`);
    byType.proyecto.slice(0, 3).forEach((p) => {
      console.log(
        `   - ${p.id}: ${p.currentType || 'undefined'} → '${p.inferredType}' (projectId: ${p.projectId})`
      );
    });
  }

  if (byType.otro.length > 0) {
    console.log(`\n   ⚠️  Pagos marcados como 'otro' (requieren revisión manual):`);
    byType.otro.forEach((p) => {
      console.log(
        `   - ${p.id}: ${p.currentType || 'undefined'} → '${p.inferredType}' (sin batchId ni projectId)`
      );
    });
  }

  console.log('\n' + '─'.repeat(80));
}

/**
 * Ejecuta la migración real en Firestore
 */
async function executeMigration(toMigrate: PaymentToMigrate[]): Promise<MigrationResult> {
  const startTime = Date.now();
  const result: MigrationResult = {
    totalProcessed: toMigrate.length,
    totalUpdated: 0,
    totalSkipped: 0,
    totalErrors: 0,
    distribution: {
      cliente: 0,
      proyecto: 0,
      otro: 0,
    },
    errors: [],
    executionTimeMs: 0,
  };

  console.log('🚀 Ejecutando migración...');

  // Procesar en chunks de BATCH_SIZE
  const chunks: PaymentToMigrate[][] = [];
  for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
    chunks.push(toMigrate.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Procesando ${toMigrate.length} pagos en ${chunks.length} batch(es)...\n`);

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const batch = writeBatch(db);

    try {
      for (const payment of chunk) {
        const paymentRef = doc(db, 'payments', payment.id);

        // Actualizar solo paymentType, mantener updatedAt
        batch.update(paymentRef, {
          paymentType: payment.inferredType,
          updatedAt: Timestamp.now(),
        });

        // Type-safe increment con assertion explícito
        const typeKey = payment.inferredType as keyof typeof result.distribution;
        result.distribution[typeKey]++;
      }

      await batch.commit();

      result.totalUpdated += chunk.length;
      console.log(
        `✅ Batch ${i + 1}/${chunks.length} completado (${chunk.length} pagos actualizados)`
      );
    } catch (error) {
      result.totalErrors += chunk.length;

      chunk.forEach((p) => {
        result.errors.push({
          id: p.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });

      console.error(
        `❌ Error en batch ${i + 1}/${chunks.length}:`,
        error instanceof Error ? error.message : error
      );
    }
  }

  result.executionTimeMs = Date.now() - startTime;
  return result;
}

/**
 * Valida post-migración que no queden pagos sin tipo
 */
async function validatePostMigration(): Promise<void> {
  console.log('\n🔍 Validando migración...');

  const paymentsRef = collection(db, 'payments');

  // Verificar pagos sin tipo
  const nullTypeQuery = query(paymentsRef, where('paymentType', '==', null));
  const undefinedTypeQuery = query(paymentsRef, where('paymentType', '==', undefined));

  const nullCount = await getCountFromServer(nullTypeQuery);
  const undefinedCount = await getCountFromServer(undefinedTypeQuery);

  const totalWithoutType = nullCount.data().count + undefinedCount.data().count;

  if (totalWithoutType === 0) {
    console.log('✅ Validación exitosa: 0 pagos sin paymentType');
  } else {
    console.warn(`⚠️  Advertencia: ${totalWithoutType} pagos aún sin paymentType`);
  }

  // Mostrar distribución final
  const allPayments = await getAllPayments();
  const distribution = allPayments.reduce(
    (acc, p) => {
      const type = (p.paymentType || 'undefined') as string;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  console.log('\n📊 Distribución final de paymentType:');
  Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} pagos`);
    });
}

/**
 * Muestra resultados de la migración
 */
function showResults(result: MigrationResult) {
  console.log('\n' + '='.repeat(80));
  console.log('🎉 MIGRACIÓN COMPLETADA');
  console.log('='.repeat(80));

  console.log(`\n📊 Resultados:`);
  console.log(`   - Total procesados: ${result.totalProcessed}`);
  console.log(`   - Actualizados: ${result.totalUpdated}`);
  console.log(`   - Errores: ${result.totalErrors}`);
  console.log(`   - Tiempo de ejecución: ${(result.executionTimeMs / 1000).toFixed(2)}s`);

  console.log(`\n📋 Distribución de tipos asignados:`);
  console.log(`   - 'cliente': ${result.distribution.cliente}`);
  console.log(`   - 'proyecto': ${result.distribution.proyecto}`);
  console.log(`   - 'otro': ${result.distribution.otro}`);

  if (result.errors.length > 0) {
    console.log(`\n❌ Errores encontrados (${result.errors.length}):`);
    result.errors.slice(0, 10).forEach((err) => {
      console.log(`   - ${err.id}: ${err.error}`);
    });
    if (result.errors.length > 10) {
      console.log(`   ... y ${result.errors.length - 10} errores más`);
    }
  }
}

/**
 * Solicita confirmación del usuario
 */
function askForConfirmation(): Promise<boolean> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise<boolean>((resolve) => {
    rl.question('\n❓ ¿Continuar con la migración? (y/N): ', (answer: string) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// ============================================
// MAIN SCRIPT
// ============================================

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes(DRY_RUN_FLAG);
  const isExecute = args.includes(EXECUTE_FLAG);

  console.log('🔧 Migration Script: PaymentType Field Consistency');
  console.log('='.repeat(80));

  // Validar argumentos
  if (!isDryRun && !isExecute) {
    console.error('\n❌ Error: Debes especificar --dry-run o --execute');
    console.log('\nUso:');
    console.log('  npx tsx scripts/migrate-payment-types.ts --dry-run    # Preview');
    console.log('  npx tsx scripts/migrate-payment-types.ts --execute   # Run\n');
    process.exit(1);
  }

  if (isDryRun && isExecute) {
    console.error('\n❌ Error: No puedes usar --dry-run y --execute juntos\n');
    process.exit(1);
  }

  // Mostrar modo
  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No se harán cambios reales\n');
  } else {
    console.log('⚠️  MODO EJECUCIÓN - Se modificarán datos en Firestore\n');
  }

  try {
    // 1. Obtener todos los pagos
    const allPayments = await getAllPayments();

    // 2. Analizar cuáles necesitan migración
    const { toMigrate, alreadyValid } = analyzePayments(allPayments);

    if (toMigrate.length === 0) {
      console.log('✅ No hay pagos que migrar. Todos tienen paymentType correcto.\n');
      return;
    }

    // 3. Modo dry-run: solo mostrar preview
    if (isDryRun) {
      showDryRunPreview(toMigrate);
      console.log('\n💡 Tip: Ejecuta con --execute para aplicar estos cambios\n');
      return;
    }

    // 4. Modo execute: solicitar confirmación
    const confirmed = await askForConfirmation();
    if (!confirmed) {
      console.log('\n❌ Migración cancelada por el usuario\n');
      return;
    }

    // 5. Ejecutar migración
    const result = await executeMigration(toMigrate);

    // 6. Validar post-migración
    await validatePostMigration();

    // 7. Mostrar resultados
    showResults(result);

    console.log('\n✅ Script completado exitosamente\n');
  } catch (error) {
    console.error('\n❌ Error fatal en el script:');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar script
main();
