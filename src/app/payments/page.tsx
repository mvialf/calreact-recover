
// src/app/payments/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient as useQueryClientHook, useMutation } from '@tanstack/react-query';
import type { Payment } from '@/types/payment';
import type { ProjectType } from '@/types/project';
import type { Client } from '@/types/client';
import { getAllPayments, deletePayment } from '@/services/paymentService';
import { deleteBatchPayment } from '@/services/payment/batchPaymentService';
import { EditPaymentDialog } from '@/components/payments/edit-payment-dialog';
import { BatchPaymentDialog } from '@/components/payments/BatchPaymentDialog';
import { getProjects } from '@/services/projectService';
import { getClients } from '@/services/clientService';
import { usePaymentsData } from '@/hooks/usePaymentsData';

// Componentes Layout y DataTable
import { AppLayout } from '@/components/layout';
import { DataTable } from '@/components/data-table/data-table';
import { createPaymentsColumns, PAYMENT_METHOD_OPTIONS, PAYMENT_TYPE_OPTIONS } from './columns';

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/format-utils';


interface EnrichedPayment extends Payment {
  clientName?: string;
  projectNumber?: string;
}

export default function PaymentsPage() {
  const queryClient = useQueryClientHook();

  const [paymentToDelete, setPaymentToDelete] = useState<EnrichedPayment | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<EnrichedPayment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  // Usar hook personalizado para pagos enriquecidos y agrupados
  const { payments: enrichedPayments, groupedPayments, isLoading, isError, error } = usePaymentsData();

  const { data: projects = [] } = useQuery<ProjectType[], Error>({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });

  const { data: clients = [] } = useQuery<Client[], Error>({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  // Crear mapas para acceso rápido en las columnas
  const projectsMap = useMemo(() => {
    return projects.reduce((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {} as Record<string, ProjectType>);
  }, [projects]);

  const clientsMap = useMemo(() => {
    return clients.reduce((acc, client) => {
      acc[client.id] = client.name;
      return acc;
    }, {} as Record<string, string>);
  }, [clients]);

  // Mutations
  const deletePaymentMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: (_, paymentId) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Pago eliminado', { description: 'El pago ha sido eliminado.' });
      setPaymentToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (err: Error) => {
      toast.error('No se pudo eliminar el pago', { description: err.message });
      setPaymentToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  });

  const deleteBatchMutation = useMutation({
    mutationFn: deleteBatchPayment,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Batch eliminado', {
        description: `Se eliminaron ${result.deletedCount} pagos del batch.`
      });
      setExpandedBatch(null);
    },
    onError: (err: Error) => {
      toast.error('No se pudo eliminar el batch', { description: err.message });
    }
  });

  // Funciones handler
  const handleDeletePaymentInitiate = (payment: EnrichedPayment) => {
    setPaymentToDelete(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleEditPayment = (payment: EnrichedPayment) => {
    setPaymentToEdit(payment);
    setIsEditDialogOpen(true);
  };

  const confirmDeletePayment = () => {
    if (paymentToDelete) {
      deletePaymentMutation.mutate(paymentToDelete.id);
    }
  };

  const handleViewBatch = (batchId: string) => {
    setExpandedBatch(batchId);
  };

  const handleDeleteBatch = (batchId: string) => {
    deleteBatchMutation.mutate(batchId);
  };

  // Combinar batches + individuales para tabla
  const tableData = useMemo(() => {
    return [
      ...groupedPayments.batches,
      ...groupedPayments.individual,
    ];
  }, [groupedPayments]);

  // Encontrar batch seleccionado
  const selectedBatch = useMemo(() => {
    return groupedPayments.batches.find(b => b.batchId === expandedBatch);
  }, [expandedBatch, groupedPayments]);

  // Columnas para la DataTable
  const columns = React.useMemo(() => createPaymentsColumns({
    onEdit: handleEditPayment,
    onDelete: handleDeletePaymentInitiate,
    onViewBatch: handleViewBatch,
    onDeleteBatch: handleDeleteBatch,
    projectsMap,
    clientsMap,
  }), [projectsMap, clientsMap, handleEditPayment, handleDeletePaymentInitiate, handleViewBatch, handleDeleteBatch]);

  if (isError) {
    return (
      <div className="text-red-500 p-4">
        <h1 className="text-2xl font-bold mb-2">Error al cargar pagos</h1>
        <p>{error?.message || "Ha ocurrido un error desconocido."}</p>
         <Button onClick={() => queryClient.refetchQueries({ queryKey: ['payments'] })} className="mt-4">
          Intentar de Nuevo
        </Button>
      </div>
    );
  }

  return (
    <AppLayout
      pageTitle="Gestión de Pagos"
      pageDescription="Registro y seguimiento de pagos de proyectos"
      pageIcon={DollarSign}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Pagos' }
      ]}
      headerActions={
        <Button onClick={() => toast.info("Próximamente", { description: "El registro de nuevos pagos estará disponible pronto."})} disabled={isLoading}>
          <DollarSign className="mr-2 h-5 w-5" />
          Registrar Pago
        </Button>
      }
    >
      {/* DataTable con datos agrupados */}
      <DataTable
          columns={columns}
          data={tableData}
          searchKey="projectId"
          searchPlaceholder="Buscar por proyecto, cliente, método..."
          filterableColumns={[
            {
              id: "paymentMethod",
              title: "Método",
              options: PAYMENT_METHOD_OPTIONS,
            },
            {
              id: "paymentType",
              title: "Tipo",
              options: PAYMENT_TYPE_OPTIONS,
            }
          ]}
          enableRowSelection
        />

      {paymentToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el pago de {formatCurrency(paymentToDelete.amount)}
                asociado al proyecto {paymentToDelete.projectNumber} (Cliente: {paymentToDelete.clientName}). La eliminación de este pago también actualizará el saldo del proyecto.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setPaymentToDelete(null); setIsDeleteDialogOpen(false); }}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeletePayment}
                disabled={deletePaymentMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deletePaymentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sí, eliminar pago
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Diálogo de edición de pago */}
      {paymentToEdit && (
        <EditPaymentDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          payment={paymentToEdit}
        />
      )}

      {/* Diálogo de desglose de batch */}
      <BatchPaymentDialog
        open={!!expandedBatch}
        onOpenChange={(open) => !open && setExpandedBatch(null)}
        batch={selectedBatch || null}
      />
    </AppLayout>
  );
}
