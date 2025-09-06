import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProjects, calculateProjectBalance } from '@/services/projectService';
import { getClients } from '@/services/clientService';
import { getAllPayments } from '@/services/paymentService';
import type { ProjectType, EnrichedProject } from '@/types/project';
import type { Client } from '@/types/client';
import type { Payment } from '@/types/payment';

export const useProjectsData = () => {
  const { data: projects = [], isLoading: isLoadingProjects, isError: isErrorProjects, error: errorProjects } = useQuery<ProjectType[], Error>({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[], Error>({
    queryKey: ['clients'],
    queryFn: () => getClients(),
  });

  const { data: allPayments = [], isLoading: isLoadingAllPayments } = useQuery<Payment[], Error>({
    queryKey: ['payments'],
    queryFn: () => getAllPayments(),
  });

  const clientMap = useMemo(() => {
    if (isLoadingClients || !clients) return new Map<string, string>();
    return new Map(clients.map(client => [client.id, client.name]));
  }, [clients, isLoadingClients]);

  const enrichedProjects = useMemo((): EnrichedProject[] => {
    if (isLoadingProjects || isLoadingClients || isLoadingAllPayments || !projects || !clients || !allPayments) {
      return [];
    }

    return projects.map(project => {
      const clientName = clientMap.get(project.clientId) || 'Cliente Desconocido';
      
      const sumOfPaymentsForProject = allPayments
        .filter(p => p.projectId === project.id && !p.isAdjustment && typeof p.amount === 'number')
        .reduce((acc, p) => acc + (p.amount || 0), 0);

      const calculatedBalance = calculateProjectBalance(project.total, sumOfPaymentsForProject);
      
      const projectTotalValue = project.total ?? 0;
      let calculatedTotalPaymentPercentage = 0;

      if (projectTotalValue > 0) {
        calculatedTotalPaymentPercentage = (sumOfPaymentsForProject / projectTotalValue) * 100;
      } else if (projectTotalValue === 0 && sumOfPaymentsForProject === 0) {
        calculatedTotalPaymentPercentage = 100;
      } else if (projectTotalValue === 0 && sumOfPaymentsForProject > 0) {
        calculatedTotalPaymentPercentage = 100;
      }

      return {
        ...project,
        clientName,
        totalPayments: sumOfPaymentsForProject,
                balance: calculatedBalance ?? 0,
        totalPaymentPercentage: calculatedTotalPaymentPercentage,
      };
    });
  }, [projects, clients, allPayments, clientMap, isLoadingProjects, isLoadingClients, isLoadingAllPayments]);

  const isLoading = isLoadingProjects || isLoadingClients || isLoadingAllPayments;
  const isError = isErrorProjects;
  const error = errorProjects;

  return { projects: enrichedProjects, isLoading, isError, error };
};
