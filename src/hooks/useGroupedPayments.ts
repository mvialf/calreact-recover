// src/hooks/useGroupedPayments.ts
import { useMemo } from 'react';
import type { Payment, BatchPaymentGroup, PaymentTableRow } from '@/types/payment';

/**
 * Hook para agrupar pagos batch en estructura jerárquica padre-hijo
 *
 * Convierte array plano de pagos en estructura con row expansion:
 * - Pagos con batchId se agrupan en fila padre expandible
 * - Pagos sin batchId permanecen como filas standalone
 *
 * @param payments - Array de pagos a agrupar
 * @returns Array de PaymentTableRow (Payment | BatchPaymentGroup)
 *
 * @example
 * const payments = [
 *   { id: '1', amount: 150k, batchId: 'uuid-123' },
 *   { id: '2', amount: 200k, batchId: 'uuid-123' },
 *   { id: '3', amount: 80k } // standalone
 * ];
 *
 * const grouped = useGroupedPayments(payments);
 * // Result:
 * // [
 * //   { type: 'batch-parent', totalAmount: 350k, subRows: [payment1, payment2] },
 * //   payment3
 * // ]
 */
export const useGroupedPayments = (payments: Payment[]): PaymentTableRow[] => {
  return useMemo(() => {
    // Map para acumular grupos batch
    const batches = new Map<string, BatchPaymentGroup>();

    // Array para pagos standalone (sin batch)
    const standalone: Payment[] = [];

    // Iterar una sola vez sobre todos los pagos (O(n))
    payments.forEach(payment => {
      if (payment.batchId) {
        // Pago pertenece a batch → agrupar

        if (!batches.has(payment.batchId)) {
          // Crear nuevo grupo batch si no existe
          batches.set(payment.batchId, {
            id: payment.batchId,
            type: 'batch-parent',
            batchId: payment.batchId,
            clientId: payment.clientId || '',
            clientName: undefined,  // Se enriquecerá en columnas si es necesario
            totalAmount: 0,
            paymentCount: 0,
            date: payment.date,
            paymentMethod: payment.paymentMethod,
            subRows: []
          });
        }

        // Acumular datos del batch
        const batch = batches.get(payment.batchId)!;
        batch.totalAmount += payment.amount || 0;
        batch.paymentCount++;
        batch.subRows.push(payment);

      } else {
        // Pago standalone → agregar directamente
        standalone.push(payment);
      }
    });

    // Combinar: grupos batch + pagos standalone
    // Ordenar batches por fecha descendente (más recientes primero)
    const sortedBatches = Array.from(batches.values())
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return [
      ...sortedBatches,
      ...standalone
    ];
  }, [payments]);
};
