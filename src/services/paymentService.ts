
// src/services/paymentService.ts
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  getDoc,
  writeBatch,
  setDoc,
  collectionGroup,
  Firestore,
  DocumentSnapshot
} from 'firebase/firestore';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { db } from '@/lib/firebase/client';
import type { Payment, PaymentDocument, PaymentImportData, PaymentMethod, PaymentTypeOption } from '@/types/payment';
import type { ProjectDocument } from '@/types/project'; // Import ProjectDocument for typing
import { docSnapshotToEntity, timestampToDate } from '@/utils/firestore-helpers';
import { paymentLogger } from '@/lib/logger';

const PAYMENTS_COLLECTION = 'payments';
const INSTALLMENTS_COLLECTION = 'installments'; // Colección para almacenar cuotas
const PROJECTS_COLLECTION = 'projects'; // Define projects collection name

// Interfaz para las cuotas
export interface Installment {
  date: Date;
  amount: number;
  isPaid: boolean;
  paymentId: string;
  installmentNumber: number;
  totalInstallments: number;
  projectId?: string;
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const paymentFromDoc = (docSnapshot: DocumentSnapshot): Payment => {
  return docSnapshotToEntity<PaymentDocument, Payment>(
    docSnapshot,
    (data) => ({
      date: timestampToDate(data.date),
    })
  );
};

export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    paymentLogger.debug('Obteniendo todos los pagos');
    
    const paymentsCollectionRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(paymentsCollectionRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const payments = querySnapshot.docs.map(paymentFromDoc);
    
    paymentLogger.info('Pagos obtenidos exitosamente', { count: payments.length });
    return payments;
  } catch (error) {
    paymentLogger.error('Error al obtener todos los pagos', error);
    throw error;
  }
};

export const getPaymentsForProject = async (projectId: string): Promise<Payment[]> => {
  try {
    paymentLogger.debug('Obteniendo pagos para proyecto', { projectId });
    
    const paymentsCollectionRef = collection(db, PAYMENTS_COLLECTION);
    // Eliminamos el orderBy para evitar necesitar un índice compuesto
    const q = query(paymentsCollectionRef, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    // Ordenamos en memoria después de obtener los resultados
    const payments = querySnapshot.docs
      .map(paymentFromDoc)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Orden descendente por fecha
    
    paymentLogger.info('Pagos del proyecto obtenidos exitosamente', { 
      projectId, 
      count: payments.length 
    });
    
    return payments;
  } catch (error) {
    paymentLogger.error('Error al obtener pagos del proyecto', error);
    throw error;
  }
};

export const getPaymentById = async (paymentId: string): Promise<Payment | null> => {
  try {
    paymentLogger.debug('Obteniendo pago por ID', { paymentId });
    
    const paymentDocRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const docSnap = await getDoc(paymentDocRef);
    
    if (docSnap.exists()) {
      const payment = paymentFromDoc(docSnap);
      paymentLogger.debug('Pago encontrado exitosamente', { paymentId });
      return payment;
    }
    
    paymentLogger.warn('Pago no encontrado', { paymentId });
    return null;
  } catch (error) {
    paymentLogger.error('Error al obtener pago por ID', error);
    throw error;
  }
};

/**
 * Convierte una fecha a Timestamp de Firestore con fallback a serverTimestamp
 * @private
 */
const parseTimestamp = (dateValue: string | Date | undefined, isRequired: boolean = false): Timestamp => {
  if (!dateValue) {
    if (isRequired) {
      throw new Error("Payment date is required for addPayment service.");
    }
    return serverTimestamp() as Timestamp;
  }

  try {
    const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
    if (isNaN(date.getTime())) {
      return serverTimestamp() as Timestamp;
    }
    return Timestamp.fromDate(date);
  } catch {
    return serverTimestamp() as Timestamp;
  }
};

/**
 * Prepara los datos del pago para guardar en Firestore
 * @private
 */
const preparePaymentData = (paymentData: PaymentImportData | Omit<Payment, 'id' | 'updatedAt'>): { [key: string]: any } => {
  const createdAtTimestamp = parseTimestamp(paymentData.createdAt);
  const paymentDateTimestamp = parseTimestamp(paymentData.date, true);

  const dataToSave: { [key: string]: any } = {
    projectId: paymentData.projectId,
    amount: paymentData.amount,
    date: paymentDateTimestamp,
    createdAt: createdAtTimestamp,
    updatedAt: serverTimestamp(),
    isAdjustment: paymentData.isAdjustment || false,
  };

  // Añadir campos opcionales
  if (paymentData.paymentMethod) {
    dataToSave.paymentMethod = paymentData.paymentMethod;
  }
  if (paymentData.paymentType) {
    dataToSave.paymentType = paymentData.paymentType;
  }
  if (paymentData.notes) {
    dataToSave.notes = paymentData.notes;
  }
  if (paymentData.installments && paymentData.installments > 0) {
    dataToSave.installments = paymentData.installments;
  }

  return dataToSave;
};

/**
 * Valida los datos de entrada del pago
 * @private
 */
const validatePaymentInput = (paymentData: PaymentImportData | Omit<Payment, 'id' | 'updatedAt'>): void => {
  if (!paymentData.projectId) {
    throw new Error("Project ID is required for addPayment service.");
  }
};

/**
 * Calcula el nuevo saldo del proyecto después del pago
 * @private
 */
const calculateNewBalance = (currentBalance: number, paymentAmount: number, isAdjustment: boolean): number => {
  if (isAdjustment) {
    return currentBalance - paymentAmount;
  }
  return currentBalance + paymentAmount;
};

/**
 * Procesa la transacción de pago y actualización del proyecto
 * @private
 */
const processPaymentTransaction = async (
  paymentData: PaymentImportData | Omit<Payment, 'id' | 'updatedAt'>,
  dataToSave: { [key: string]: any },
  firestore: Firestore
): Promise<Payment> => {
  // Obtener referencia al proyecto
  const projectRef = doc(firestore, PROJECTS_COLLECTION, paymentData.projectId);
  const projectSnapshot = await getDoc(projectRef);

  if (!projectSnapshot.exists()) {
    throw new Error(`Project with ID ${paymentData.projectId} does not exist.`);
  }

  const projectData = projectSnapshot.data() as ProjectDocument;
  const currentBalance = projectData.balance || 0;
  const paymentAmount = paymentData.amount || 0;
  const newBalance = calculateNewBalance(currentBalance, paymentAmount, paymentData.isAdjustment || false);

  // Usar batch para actualizar proyecto y añadir pago
  const batch = writeBatch(firestore);

  // Actualizar saldo del proyecto
  batch.update(projectRef, {
    balance: newBalance,
    updatedAt: serverTimestamp()
  });

  // Añadir nuevo pago
  const paymentCollectionRef = collection(firestore, PAYMENTS_COLLECTION);
  const newPaymentRef = doc(paymentCollectionRef);
  batch.set(newPaymentRef, dataToSave);

  // Ejecutar batch
  await batch.commit();

  // Obtener datos del nuevo pago
  const paymentDoc = await getDoc(newPaymentRef);
  return paymentFromDoc(paymentDoc);
};

/**
 * Procesa las cuotas si el pago las tiene
 * @private
 */
const processInstallments = async (savedPayment: Payment, firestore: Firestore): Promise<void> => {
  const installments = generateInstallments(savedPayment);
  
  const installmentsBatch = writeBatch(firestore);
  
  installments.forEach(installment => {
    const installmentId = `${savedPayment.id}_cuota_${installment.installmentNumber}`;
    const installmentRef = doc(firestore, INSTALLMENTS_COLLECTION, installmentId);
    
    installmentsBatch.set(installmentRef, {
      ...installment,
      date: Timestamp.fromDate(new Date(installment.date)),
      projectId: savedPayment.projectId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });
  
  await installmentsBatch.commit();
};

/**
 * Crea un nuevo pago y actualiza el saldo del proyecto
 * @param paymentData - Datos del pago a crear
 * @param firestore - Instancia de Firestore (opcional)
 * @returns Promise que resuelve con el pago creado
 * @version 2.1.0 - Refactorizado aplicando principios SOLID
 */
export const addPayment = async (paymentData: PaymentImportData | Omit<Payment, 'id' | 'updatedAt'>, firestore = db): Promise<Payment> => {
  try {
    paymentLogger.debug('Iniciando creación de pago', {
      projectId: paymentData.projectId,
      amount: paymentData.amount,
      hasInstallments: paymentData.installments && paymentData.installments > 0
    });

    const dataToSave = preparePaymentData(paymentData);

    // 1. Validar entrada
    validatePaymentInput(paymentData);

    // 2. Procesar transacción de pago
    const savedPayment = await processPaymentTransaction(paymentData, dataToSave, firestore);
    
    // 3. Procesar cuotas si existen
    if (savedPayment.installments && savedPayment.installments > 0) {
      paymentLogger.debug('Procesando cuotas para pago', {
        paymentId: savedPayment.id,
        installments: savedPayment.installments
      });
      await processInstallments(savedPayment, firestore);
    }

    paymentLogger.payment('Pago creado exitosamente', savedPayment.id, savedPayment.amount);
    return savedPayment;
  } catch (error) {
    paymentLogger.error('Error al crear pago', error);
    throw error;
  }
};

export const updatePayment = async (paymentId: string, paymentData: Partial<Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  try {
    paymentLogger.debug('Iniciando actualización de pago', { paymentId });
    
    // Note: This function does not currently recalculate project balance if payment amount changes.
    // That would require fetching the old payment amount, the project, calculating the difference, and then updating.
    // For simplicity, this is left out, but it's a consideration for full financial accuracy.
    const paymentDocRef = doc(db, PAYMENTS_COLLECTION, paymentId);
  
  const dataToUpdate: { [key: string]: any } = { 
    updatedAt: serverTimestamp() as Timestamp,
  };

  (Object.keys(paymentData) as Array<keyof typeof paymentData>).forEach(key => {
    if (paymentData[key] !== undefined) { 
      if (key === 'date' && paymentData.date) {
        dataToUpdate.date = Timestamp.fromDate(new Date(paymentData.date));
      } else {
        dataToUpdate[key] = paymentData[key];
      }
    }
  });

    if (Object.keys(dataToUpdate).length > 1) { // Only update if there's more than just updatedAt
      await updateDoc(paymentDocRef, dataToUpdate);
      paymentLogger.info('Pago actualizado exitosamente', { paymentId });
    } else {
      paymentLogger.debug('No hay cambios para actualizar', { paymentId });
    }
  } catch (error) {
    paymentLogger.error('Error al actualizar pago', error);
    throw error;
  }
};


export const deletePayment = async (paymentId: string): Promise<void> => {
  try {
    paymentLogger.debug('Iniciando eliminación de pago', { paymentId });
    
    const paymentDocRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    const paymentSnap = await getDoc(paymentDocRef);

    if (paymentSnap.exists()) {
      const paymentToDelete = paymentFromDoc(paymentSnap);

      // Restore balance to project if payment is deleted
      if (paymentToDelete.projectId && paymentToDelete.amount && paymentToDelete.amount > 0 && !paymentToDelete.isAdjustment) {
        const projectDocRef = doc(db, PROJECTS_COLLECTION, paymentToDelete.projectId);
        try {
          const projectSnap = await getDoc(projectDocRef);
          if (projectSnap.exists()) {
            const projectData = projectSnap.data() as ProjectDocument;
            const currentBalance = projectData.balance ?? (projectData.total ?? 0);
            const newBalance = currentBalance + paymentToDelete.amount;
            
            const projectUpdateData: { balance: number, updatedAt: Timestamp, isPaid?: boolean } = { 
              balance: newBalance, 
              updatedAt: serverTimestamp() as Timestamp 
            };
            // If balance becomes > 0, it's definitely not fully paid
            if (newBalance > 0 && projectData.isPaid) {
              projectUpdateData.isPaid = false;
            }

            await updateDoc(projectDocRef, projectUpdateData);
            paymentLogger.database('Saldo del proyecto restaurado', {
              projectId: paymentToDelete.projectId,
              newBalance,
              paymentAmount: paymentToDelete.amount
            });
          }
        } catch (error) {
          paymentLogger.error('Error al restaurar saldo del proyecto', error);
        }
      }
    }

    await deleteDoc(paymentDocRef);
    paymentLogger.payment('Pago eliminado exitosamente', paymentId);
  } catch (error) {
    paymentLogger.error('Error al eliminar pago', error);
    throw error;
  }
};

export const deletePaymentsForProject = async (projectId: string): Promise<void> => {
  try {
    paymentLogger.debug('Iniciando eliminación de pagos por proyecto', { projectId });
    
    const paymentsCollectionRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(paymentsCollectionRef, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      paymentLogger.debug('No hay pagos para eliminar en el proyecto', { projectId });
      return;
    }

    const batch = writeBatch(db);
    querySnapshot.docs.forEach(docSnapshot => {
      batch.delete(docSnapshot.ref);
    });
    
    // Note: This function does not adjust project balance when deleting all payments for a project.
    // If a project is deleted, its balance effectively becomes irrelevant, or should be reset/archived.
    await batch.commit();
    
    paymentLogger.info('Pagos del proyecto eliminados exitosamente', {
      projectId,
      deletedCount: querySnapshot.size
    });
  } catch (error) {
    paymentLogger.error('Error al eliminar pagos del proyecto', error);
    throw error;
  }
};

// La interfaz Installment ya está definida al inicio del archivo

/**
 * Genera todas las cuotas para un pago a plazos
 */
export const generateInstallments = (payment: Payment): Installment[] => {
  if (!payment.amount || !payment.installments || !payment.date) {
    return [];
  }

  const installments: Installment[] = [];
  const amountPerInstallment = payment.amount / payment.installments;
  const startDate = new Date(payment.date);
  
  // Si es el primer pago, se toma la fecha original
  installments.push({
    date: startDate,
    amount: amountPerInstallment,
    isPaid: true, // El primer pago se considera pagado
    paymentId: payment.id,
    installmentNumber: 1,
    totalInstallments: payment.installments,
    projectId: payment.projectId
  });

  // Generar las cuotas restantes
  for (let i = 1; i < payment.installments; i++) {
    const installmentDate = new Date(startDate);
    installmentDate.setMonth(startDate.getMonth() + i);
    
    installments.push({
      date: installmentDate,
      amount: amountPerInstallment,
      isPaid: false, // Las cuotas futuras no están pagadas
      paymentId: payment.id,
      installmentNumber: i + 1,
      totalInstallments: payment.installments,
      projectId: payment.projectId
    });
  }

  return installments;
};

/**
 * Guarda las cuotas en Firestore como documentos independientes
 * @param payment El pago del que se generarán las cuotas
 * @param firestore Instancia de Firestore
 * @returns Promesa que se resuelve con las cuotas guardadas
 */
export const saveInstallmentsToFirestore = async (payment: Payment, firestore = db): Promise<Installment[]> => {
  try {
    paymentLogger.debug('Guardando cuotas en Firestore', {
      paymentId: payment.id,
      installments: payment.installments
    });
    
    // 1. Generar las cuotas
    const installments = generateInstallments(payment);
    if (installments.length === 0) {
      paymentLogger.debug('No se generaron cuotas para el pago', { paymentId: payment.id });
      return [];
    }
    
    // 2. Crear lote de escritura para operaciones en batch
    const batch = writeBatch(firestore);
    
    // 3. Para cada cuota, crear un documento en la colección de cuotas
    installments.forEach(installment => {
      const installmentId = `${payment.id}_cuota_${installment.installmentNumber}`;
      const installmentRef = doc(firestore, INSTALLMENTS_COLLECTION, installmentId);
      
      // Datos a guardar para la cuota
      const installmentData = {
        ...installment,
        date: Timestamp.fromDate(new Date(installment.date)),
        projectId: payment.projectId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      batch.set(installmentRef, installmentData);
    });
    
    // 4. Ejecutar el batch
    await batch.commit();
    
    paymentLogger.info('Cuotas guardadas exitosamente en Firestore', {
      paymentId: payment.id,
      installmentCount: installments.length
    });
    
    return installments;
  } catch (error) {
    paymentLogger.error('Error al guardar cuotas en Firestore', error);
    throw error;
  }
};

/**
 * Actualiza el estado de una cuota específica
 * @param installmentId ID de la cuota
 * @param isPaid Estado de pago (true = pagado, false = pendiente)
 * @param firestore Instancia de Firestore
 * @returns Promesa que se resuelve cuando se actualiza el estado
 */
export const updateInstallmentStatus = async (
  installmentId: string, 
  isPaid: boolean, 
  firestore = db
): Promise<boolean> => {
  try {
    paymentLogger.debug('Actualizando estado de cuota', { installmentId, isPaid });
    
    const installmentRef = doc(firestore, INSTALLMENTS_COLLECTION, installmentId);
    await updateDoc(installmentRef, {
      isPaid,
      updatedAt: serverTimestamp()
    });
    
    paymentLogger.info('Estado de cuota actualizado exitosamente', { installmentId, isPaid });
    return true;
  } catch (error) {
    paymentLogger.error('Error al actualizar estado de cuota', error);
    throw error;
  }
};

/**
 * Obtiene todas las cuotas almacenadas en Firestore
 * @param firestore Instancia de Firestore
 * @returns Promesa que se resuelve con un array de cuotas
 */
export const getAllInstallments = async (firestore = db): Promise<Installment[]> => {
  try {
    const installmentsRef = collection(firestore, INSTALLMENTS_COLLECTION);
    const q = query(installmentsRef, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.date?.toDate() || new Date(),
        amount: data.amount || 0,
        isPaid: data.isPaid || false,
        paymentId: data.paymentId || '',
        installmentNumber: data.installmentNumber || 0,
        totalInstallments: data.totalInstallments || 0,
        projectId: data.projectId,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Installment;
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene las cuotas asociadas a un pago específico
 * @param paymentId ID del pago
 * @param firestore Instancia de Firestore
 * @returns Promesa que se resuelve con un array de cuotas del pago
 */
export const getInstallmentsByPayment = async (
  paymentId: string, 
  firestore = db
): Promise<Installment[]> => {
  try {
    const installmentsRef = collection(firestore, INSTALLMENTS_COLLECTION);
    const q = query(
      installmentsRef, 
      where('paymentId', '==', paymentId),
      orderBy('installmentNumber', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        date: data.date?.toDate() || new Date(),
        amount: data.amount || 0,
        isPaid: data.isPaid || false,
        paymentId: data.paymentId || '',
        installmentNumber: data.installmentNumber || 0,
        totalInstallments: data.totalInstallments || 0,
        projectId: data.projectId,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Installment;
    });
  } catch (error) {
    throw error;
  }
};

/**

/**
 * Obtiene el total de cuotas pendientes para el mes actual
 * que cumplan con:
 * 1. Pertenecen al mes y año actual
 * 2. Están marcadas como pendientes (no pagadas)
 * 3. Su fecha de vencimiento es igual o posterior a hoy
 */
export const getCurrentMonthInstallmentSum = async (): Promise<number> => {
  try {
    paymentLogger.debug('Calculando suma de cuotas del mes actual');
    
    // Fechas importantes
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalizar a inicio del día
    
    // Obtener primer y último día del mes actual
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999); // Fin del día
    
    paymentLogger.debug('Rango de fechas para cálculo', {
      firstDay: firstDayOfMonth.toISOString(),
      lastDay: lastDayOfMonth.toISOString()
    });
    
    // Obtenemos todos los pagos a cuotas
    const paymentsCollectionRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsCollectionRef,
      where('installments', '>', 1) // Solo pagos a cuotas
    );

    const querySnapshot = await getDocs(q);
    paymentLogger.debug('Pagos a cuotas encontrados', { count: querySnapshot.size });
    
    let total = 0;
    let processedPayments = 0;
    let validInstallmentsCount = 0;
    
    // Procesar cada pago y generar sus cuotas
    for (const doc of querySnapshot.docs) {
      try {
        const payment = paymentFromDoc(doc);
        const installments = generateInstallments(payment);
        
        // Filtrar cuotas según los criterios:
        // 1. Del mes actual
        // 2. No pagadas
        // 3. Con fecha de vencimiento >= hoy
        const validInstallments = installments.filter(installment => {
          const installmentDate = new Date(installment.date);
          installmentDate.setHours(0, 0, 0, 0); // Normalizar fecha
          
          const isCurrentMonth = 
            installmentDate.getMonth() === now.getMonth() &&
            installmentDate.getFullYear() === now.getFullYear();
            
          const isPending = !installment.isPaid;
          const isDueTodayOrFuture = installmentDate >= now;
          
          return isCurrentMonth && isPending && isDueTodayOrFuture;
        });
        
        if (validInstallments.length > 0) {
          const monthlyTotal = validInstallments.reduce((sum, inst) => sum + inst.amount, 0);
          total += monthlyTotal;
          validInstallmentsCount += validInstallments.length;
        }
        
        processedPayments++;
      } catch (error) {
        paymentLogger.error('Error procesando pago para cuotas mensuales', error);
      }
    }

    paymentLogger.info('Cálculo de cuotas mensuales completado', {
      total,
      processedPayments,
      validInstallmentsCount
    });

    return total;
  } catch (error) {
    paymentLogger.error('Error al calcular suma de cuotas del mes actual', error);
    throw error;
  }
};

/**
 * Obtiene el total de cuotas pendientes de pago
 */
export const getTotalPendingInstallmentSum = async (): Promise<number> => {
  try {
    paymentLogger.debug('Calculando suma total de cuotas pendientes');
    
    // Obtenemos todos los pagos a cuotas
    const paymentsCollectionRef = collection(db, PAYMENTS_COLLECTION);
    const q = query(
      paymentsCollectionRef,
      where('installments', '>', 1) // Solo pagos a cuotas
    );

    const querySnapshot = await getDocs(q);
    paymentLogger.debug('Pagos a cuotas para análisis encontrados', { count: querySnapshot.size });
    
    let total = 0;
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalizar la fecha actual
    let processedPayments = 0;
    let totalPendingInstallments = 0;
    
    // Procesar cada pago y generar sus cuotas
    querySnapshot.forEach((doc) => {
      try {
        const payment = paymentFromDoc(doc);
        const installments = generateInstallments(payment);
        
        // Filtrar cuotas pendientes (no pagadas y con fecha futura o hoy)
        const pendingInstallments = installments.filter(installment => {
          const installmentDate = new Date(installment.date);
          installmentDate.setHours(0, 0, 0, 0);
          return !installment.isPaid && installmentDate >= now;
        });
        
        if (pendingInstallments.length > 0) {
          const pendingTotal = pendingInstallments.reduce((sum, inst) => sum + inst.amount, 0);
          total += pendingTotal;
          totalPendingInstallments += pendingInstallments.length;
        }
        
        processedPayments++;
      } catch (error) {
        paymentLogger.error('Error procesando pago para cuotas pendientes', error);
      }
    });

    paymentLogger.info('Cálculo de cuotas pendientes completado', {
      total,
      processedPayments,
      totalPendingInstallments
    });

    return total;
  } catch (error) {
    paymentLogger.error('Error al calcular suma total de cuotas pendientes', error);
    throw error;
  }
};

