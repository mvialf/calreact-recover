// src/types/payment.ts
import type { Timestamp } from 'firebase/firestore';

// Tipos de pago - constantes definidas en /constants/payment.ts
import { PAYMENT_METHODS, PAYMENT_TYPES } from '@/constants/payment';

export type PaymentMethod = typeof PAYMENT_METHODS[number] | string;
export type PaymentTypeOption = ' ' | typeof PAYMENT_TYPES[number] | string;

export interface Payment {
  id: string;
  projectId: string; // ID of the related project document in the 'projects' collection
  amount?: number;
  date: Date; // Changed from optional to required as per schema
  paymentMethod?: PaymentMethod;
  createdAt: Date; // Changed from optional to required as per schema
  updatedAt?: Date;
  paymentType?: PaymentTypeOption;
  installments?: number; // For credit card payments
  isAdjustment: boolean; // Changed from optional to required as per schema
  notes?: string; // Optional field for notes

  // 🆕 Campos para sistema de batch payments
  batchId?: string;           // UUID para vincular pagos relacionados de cliente
  clientId?: string;          // ID del cliente que realizó el pago
}

// Helper type for Firestore document structure
export interface PaymentDocument extends Omit<Payment, 'id' | 'date' | 'createdAt' | 'updatedAt'> {
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Interface for data used when importing payments
export interface PaymentImportData {
  id: string; // Required for import to use setDoc
  projectId: string;
  amount?: number;
  date: string | Date; // Can be string from JSON or Date object
  paymentMethod?: string; // Acepta string, la validación se hará contra PAYMENT_METHODS
  createdAt: string | Date; // Can be string from JSON or Date object
  paymentType?: string; // Acepta string, la validación se hará contra PAYMENT_TYPES
  installments?: number;
  isAdjustment: boolean;
  notes?: string;
}

// 🆕 Tipos para sistema de batch payments

/**
 * Información resumida de un batch de pagos
 */
export interface BatchPaymentSummary {
  batchId: string;
  clientId: string;
  clientName: string;
  totalAmount: number;
  paymentCount: number;
  date: Date;
  paymentMethod: string;
  payments: Payment[];
}

/**
 * Parámetros para crear un batch de pagos desde cliente
 */
export interface CreateBatchPaymentParams {
  clientId: string;
  totalAmount: number;
  paymentMethod: string;
  date: Date;
  notes?: string;
  allocations: Array<{
    projectId: string;
    amount: number;
  }>;
}

/**
 * Resultado de eliminar un batch de pagos
 */
export interface DeleteBatchResult {
  success: boolean;
  deletedCount: number;
  batchId: string;
  error?: string;
}

/**
 * Grupo de pagos batch para visualización en tabla con row expansion
 * Representa el pago agregado del cliente antes de distribuirse
 */
export interface BatchPaymentGroup {
  id: string;                    // batchId para identificación única
  type: 'batch-parent';          // Discriminador de tipo para TypeScript
  batchId: string;               // UUID del batch
  clientId: string;              // ID del cliente que realizó el pago
  clientName?: string;           // Nombre del cliente (enriquecido)
  totalAmount: number;           // Monto total del pago del cliente
  paymentCount: number;          // Cantidad de pagos en los que se distribuyó
  date: Date;                    // Fecha del pago original
  paymentMethod?: string;        // Método de pago usado
  subRows: Payment[];            // Pagos individuales (distribuciones)
}

/**
 * Union type para filas de tabla de pagos
 * Puede ser un pago individual o un grupo batch con hijos
 */
export type PaymentTableRow = Payment | BatchPaymentGroup;
