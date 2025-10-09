// src/services/payment/batchPaymentService.ts
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  Timestamp,
  writeBatch,
  Firestore,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type {
  Payment,
  CreateBatchPaymentParams,
  BatchPaymentSummary,
  DeleteBatchResult,
  PaymentDocument
} from '@/types/payment';
import type { ProjectDocument } from '@/types/project';
import { docSnapshotToEntity, timestampToDate } from '@/utils/firestore-helpers';
import { paymentLogger } from '@/lib/logger';

const PAYMENTS_COLLECTION = 'payments';
const PROJECTS_COLLECTION = 'projects';

const paymentFromDoc = (docSnapshot: any): Payment => {
  return docSnapshotToEntity<PaymentDocument, Payment>(
    docSnapshot,
    (data) => ({
      date: timestampToDate(data.date),
    })
  );
};

// 🆕 ==========================================
// FUNCIONES PARA SISTEMA DE BATCH PAYMENTS
// ==========================================

/**
 * Crea múltiples pagos vinculados por batchId en una transacción atómica
 *
 * @param params - Parámetros del batch payment
 * @returns Promise<string> - El batchId generado
 * @throws Error si la operación falla
 *
 * @example
 * const batchId = await createBatchPayment({
 *   clientId: 'client123',
 *   totalAmount: 150000,
 *   paymentMethod: 'Transferencia',
 *   date: new Date(),
 *   allocations: [
 *     { projectId: 'proj1', amount: 100000 },
 *     { projectId: 'proj2', amount: 50000 }
 *   ]
 * });
 */
export const createBatchPayment = async (
  params: CreateBatchPaymentParams,
  firestore = db
): Promise<string> => {
  const batchId = crypto.randomUUID();
  const batch = writeBatch(firestore);

  try {
    paymentLogger.debug('Creando batch payment', {
      clientId: params.clientId,
      totalAmount: params.totalAmount,
      allocationsCount: params.allocations.length,
      batchId
    });

    // Crear cada pago en el batch
    for (const allocation of params.allocations) {
      const paymentRef = doc(collection(firestore, PAYMENTS_COLLECTION));

      const paymentData = {
        projectId: allocation.projectId,
        amount: allocation.amount,
        paymentMethod: params.paymentMethod,
        date: Timestamp.fromDate(params.date),
        notes: params.notes || `Pago de cliente distribuido`,

        // Campos de batch
        batchId: batchId,
        clientId: params.clientId,
        paymentType: 'cliente' as const,

        isAdjustment: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      batch.set(paymentRef, paymentData);

      // Actualizar balance del proyecto
      const projectRef = doc(firestore, PROJECTS_COLLECTION, allocation.projectId);
      const projectSnapshot = await getDoc(projectRef);

      if (projectSnapshot.exists()) {
        const projectData = projectSnapshot.data() as ProjectDocument;
        const currentBalance = projectData.balance || 0;
        const newBalance = currentBalance + allocation.amount;

        batch.update(projectRef, {
          balance: newBalance,
          updatedAt: Timestamp.now()
        });
      }
    }

    // Commit atómico
    await batch.commit();

    paymentLogger.info('Batch payment creado exitosamente', {
      batchId,
      paymentsCreated: params.allocations.length,
      totalAmount: params.totalAmount
    });

    return batchId;

  } catch (error) {
    paymentLogger.error('Error creando batch payment', error);
    throw new Error(`Failed to create batch payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Obtiene todos los pagos relacionados a un batchId
 *
 * @param batchId - UUID del batch
 * @returns Promise<Payment[]> - Lista de pagos del batch
 *
 * @example
 * const payments = await getBatchPayments('uuid-123-456');
 * console.log(`Batch contains ${payments.length} payments`);
 */
export const getBatchPayments = async (
  batchId: string,
  firestore = db
): Promise<Payment[]> => {
  try {
    paymentLogger.debug('Obteniendo pagos del batch', { batchId });

    const paymentsRef = collection(firestore, PAYMENTS_COLLECTION);
    const q = query(paymentsRef, where('batchId', '==', batchId));

    const snapshot = await getDocs(q);

    const payments = snapshot.docs.map(paymentFromDoc);

    paymentLogger.debug('Pagos del batch obtenidos', {
      batchId,
      count: payments.length
    });

    return payments;

  } catch (error) {
    paymentLogger.error('Error obteniendo pagos del batch', error);
    throw error;
  }
};

/**
 * Elimina todos los pagos de un batch de manera atómica
 *
 * @param batchId - UUID del batch a eliminar
 * @returns Promise<DeleteBatchResult> - Resultado de la operación
 *
 * @example
 * const result = await deleteBatchPayment('uuid-123');
 * if (result.success) {
 *   console.log(`Deleted ${result.deletedCount} payments`);
 * }
 */
export const deleteBatchPayment = async (
  batchId: string,
  firestore = db
): Promise<DeleteBatchResult> => {
  try {
    paymentLogger.debug('Eliminando batch payment', { batchId });

    // 1. Obtener todos los pagos del batch
    const payments = await getBatchPayments(batchId, firestore);

    if (payments.length === 0) {
      paymentLogger.warn('No se encontraron pagos para el batch', { batchId });
      return {
        success: false,
        deletedCount: 0,
        batchId,
        error: 'No payments found for this batch'
      };
    }

    // 2. Eliminar en batch write y restaurar balances
    const batch = writeBatch(firestore);

    for (const payment of payments) {
      // Eliminar pago
      const paymentRef = doc(firestore, PAYMENTS_COLLECTION, payment.id);
      batch.delete(paymentRef);

      // Restaurar balance del proyecto si el pago no es ajuste
      if (payment.amount && payment.amount > 0 && !payment.isAdjustment) {
        const projectRef = doc(firestore, PROJECTS_COLLECTION, payment.projectId);
        const projectSnapshot = await getDoc(projectRef);

        if (projectSnapshot.exists()) {
          const projectData = projectSnapshot.data() as ProjectDocument;
          const currentBalance = projectData.balance ?? (projectData.total ?? 0);
          const newBalance = currentBalance + payment.amount;

          const projectUpdateData: { balance: number; updatedAt: Timestamp; isPaid?: boolean } = {
            balance: newBalance,
            updatedAt: Timestamp.now()
          };

          // Si el balance se vuelve > 0, definitivamente no está completamente pagado
          if (newBalance > 0 && projectData.isPaid) {
            projectUpdateData.isPaid = false;
          }

          batch.update(projectRef, projectUpdateData);
        }
      }
    }

    await batch.commit();

    paymentLogger.info('Batch payment eliminado exitosamente', {
      batchId,
      deletedCount: payments.length
    });

    return {
      success: true,
      deletedCount: payments.length,
      batchId
    };

  } catch (error) {
    paymentLogger.error('Error eliminando batch payment', error);
    return {
      success: false,
      deletedCount: 0,
      batchId,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Obtiene resumen completo de un batch payment con datos enriquecidos
 *
 * @param batchId - UUID del batch
 * @returns Promise<BatchPaymentSummary | null>
 *
 * @example
 * const summary = await getBatchPaymentSummary('uuid-123');
 * console.log(`Total: $${summary.totalAmount}, Pagos: ${summary.paymentCount}`);
 */
export const getBatchPaymentSummary = async (
  batchId: string,
  firestore = db
): Promise<BatchPaymentSummary | null> => {
  try {
    paymentLogger.debug('Obteniendo resumen del batch', { batchId });

    const payments = await getBatchPayments(batchId, firestore);

    if (payments.length === 0) {
      paymentLogger.warn('No se encontraron pagos para el resumen del batch', { batchId });
      return null;
    }

    const firstPayment = payments[0];

    // Obtener información del cliente
    let clientName = 'Cliente Desconocido';
    if (firstPayment.clientId) {
      const clientDoc = await getDoc(doc(firestore, 'clients', firstPayment.clientId));
      if (clientDoc.exists()) {
        clientName = clientDoc.data().name || 'Cliente Desconocido';
      }
    }

    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    const summary: BatchPaymentSummary = {
      batchId,
      clientId: firstPayment.clientId || '',
      clientName,
      totalAmount,
      paymentCount: payments.length,
      date: firstPayment.date,
      paymentMethod: firstPayment.paymentMethod || '',
      payments: payments.sort((a, b) => b.date.getTime() - a.date.getTime())
    };

    paymentLogger.debug('Resumen del batch obtenido', {
      batchId,
      totalAmount,
      paymentCount: payments.length
    });

    return summary;

  } catch (error) {
    paymentLogger.error('Error obteniendo resumen del batch', error);
    throw error;
  }
};
