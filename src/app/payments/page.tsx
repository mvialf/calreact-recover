
// src/app/payments/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient as useQueryClientHook, useMutation } from '@tanstack/react-query';
import type { Payment } from '@/types/payment';
import type { ProjectType } from '@/types/project';
import type { Client } from '@/types/client';
import { getAllPayments, deletePayment } from '@/services/paymentService';
import { EditPaymentDialog } from '@/components/payments/edit-payment-dialog';
import { getProjects } from '@/services/projectService';
import { getClients } from '@/services/clientService';

// Componentes DataTable
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
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/utils/format-utils';


interface EnrichedPayment extends Payment {
  clientName?: string;
  projectNumber?: string;
}

export default function PaymentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClientHook();

  const [paymentToDelete, setPaymentToDelete] = useState<EnrichedPayment | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<EnrichedPayment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: payments = [], isLoading: isLoadingPayments, isError: isErrorPayments, error: errorPayments } = useQuery<Payment[], Error>({
    queryKey: ['payments'],
    queryFn: getAllPayments,
  });

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<ProjectType[], Error>({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });

  const { data: clients = [], isLoading: isLoadingClients } = useQuery<Client[], Error>({
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

  // Mutation primero
  const deletePaymentMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: (_, paymentId) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // Invalidate projects due to balance change
      toast({ title: "Pago Eliminado", description: `El pago ha sido eliminado.` });
      setPaymentToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Error al Eliminar", description: `No se pudo eliminar el pago: ${err.message}`, variant: "destructive" });
      setPaymentToDelete(null);
      setIsDeleteDialogOpen(false);
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

  // Los pagos con tipo EnrichedPayment para compatibilidad
  const enrichedPayments = useMemo((): EnrichedPayment[] => {
    if (isLoadingPayments || !payments) {
      return [];
    }
    // Ya no necesitamos enriquecer aquí - las columnas lo harán dinámicamente
    return payments as EnrichedPayment[];
  }, [payments, isLoadingPayments]);

  // Columnas para la DataTable
  const columns = React.useMemo(() => createPaymentsColumns({
    onEdit: handleEditPayment,
    onDelete: handleDeletePaymentInitiate,
    projectsMap,
    clientsMap,
  }), [projectsMap, clientsMap]);


  const isLoading = isLoadingPayments || isLoadingProjects || isLoadingClients;

  if (isErrorPayments) {
    return (
      <div className="text-red-500 p-4">
        <h1 className="text-2xl font-bold mb-2">Error al cargar pagos</h1>
        <p>{errorPayments?.message || "Ha ocurrido un error desconocido."}</p>
         <Button onClick={() => queryClient.refetchQueries({ queryKey: ['payments'] })} className="mt-4">
          Intentar de Nuevo
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-none px-4 pb-2 bg-background">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary">Gestión de Pagos</h1>
          <Button onClick={() => toast({ title: "Próximamente", description: "El registro de nuevos pagos estará disponible pronto."})} disabled={isLoading}>
            <DollarSign className="mr-2 h-5 w-5" />
            Registrar Pago
          </Button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={enrichedPayments}
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
      </div>

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
    </>
  );
}
