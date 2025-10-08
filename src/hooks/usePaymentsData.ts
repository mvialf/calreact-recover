import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllPayments } from '@/services/paymentService';
import { getProjects } from '@/services/projectService';
import { getClients } from '@/services/clientService';
import type { Payment } from '@/types/payment';
import type { ProjectType } from '@/types/project';
import type { Client } from '@/types/client';

export interface EnrichedPayment extends Payment {
  clientName?: string;
  projectNumber?: string;
}

export interface BatchedPaymentGroup {
  batchId: string;
  payments: EnrichedPayment[];
  summary: {
    totalAmount: number;
    clientName: string;
    date: Date;
    paymentMethod: string;
    projectCount: number;
  };
}

export const usePaymentsData = () => {
  const { data: payments = [], isLoading: isLoadingPayments, isError: isErrorPayments, error: errorPayments } = useQuery<Payment[], Error>({
    queryKey: ['payments'],
    queryFn: () => getAllPayments(),
  });

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<ProjectType[], Error>({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[], Error>({
    queryKey: ['clients'],
    queryFn: () => getClients(),
  });

  const enrichedPayments = useMemo((): EnrichedPayment[] => {
    if (isLoadingPayments || isLoadingProjects || isLoadingClients || !payments || !projects || !clients) {
      return [];
    }

    const projectMap = new Map(projects.map((p: ProjectType) => [p.id, p]));
    const clientMap = new Map(clients.map((c: Client) => [c.id, c.name]));

    return payments.map((payment: Payment) => {
      const project = projectMap.get(payment.projectId);
      let clientNameDisplay = 'Cliente Desconocido';
      let projectNumberDisplay = 'Proyecto Desconocido';

      if (project) {
        projectNumberDisplay = project.projectNumber;
        if (project.glosa) {
          projectNumberDisplay += ` - ${project.glosa}`;
        }

        const clientName = clientMap.get(project.clientId);
        if (clientName) {
          clientNameDisplay = clientName;
        }
      }

      return {
        ...payment,
        clientName: clientNameDisplay,
        projectNumber: projectNumberDisplay,
      };
    });
  }, [payments, projects, clients, isLoadingPayments, isLoadingProjects, isLoadingClients]);

  const groupedPayments = useMemo((): {
    batches: BatchedPaymentGroup[];
    individual: EnrichedPayment[];
  } => {
    const batchMap = new Map<string, EnrichedPayment[]>();
    const individualPayments: EnrichedPayment[] = [];

    enrichedPayments.forEach(payment => {
      if (payment.batchId) {
        if (!batchMap.has(payment.batchId)) {
          batchMap.set(payment.batchId, []);
        }
        batchMap.get(payment.batchId)!.push(payment);
      } else {
        individualPayments.push(payment);
      }
    });

    const batches: BatchedPaymentGroup[] = Array.from(batchMap.entries())
      .map(([batchId, payments]) => ({
        batchId,
        payments,
        summary: {
          totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
          clientName: payments[0].clientName || 'Desconocido',
          date: payments[0].date,
          paymentMethod: payments[0].paymentMethod || '',
          projectCount: payments.length,
        },
      }))
      // Filtrar batches de 1 solo pago → tratarlos como individuales
      .filter(batch => {
        if (batch.payments.length === 1) {
          individualPayments.push(batch.payments[0]);
          return false;
        }
        return true;
      });

    return { batches, individual: individualPayments };
  }, [enrichedPayments]);

  const isLoading = isLoadingPayments || isLoadingProjects || isLoadingClients;
  const isError = isErrorPayments;
  const error = errorPayments;

  return {
    payments: enrichedPayments,
    groupedPayments,
    isLoading,
    isError,
    error
  };
};
