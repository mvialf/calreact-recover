
// src/app/payments/page.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient as useQueryClientHook, useMutation } from '@tanstack/react-query';
import type { Payment } from '@/types/payment';
import type { ProjectType } from '@/types/project';
import type { Client } from '@/types/client';
import { getAllPayments, deletePayment } from '@/services/paymentService';
import { EditPaymentDialog } from '@/components/payments/edit-payment-dialog';
import { getProjects } from '@/services/projectService';
import { getClients } from '@/services/clientService';
import { format as formatDate } from '@/lib/calendar-utils';
import { es } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { DollarSign, Edit, Trash2, GanttChartSquare, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { normalizeSearchText } from '@/utils/search-utils';

const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return 'N/A';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
};


interface EnrichedPayment extends Payment {
  clientName?: string;
  projectNumber?: string;
}

export default function PaymentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClientHook();

  const [filterText, setFilterText] = useState('');
  const [paymentToDelete, setPaymentToDelete] = useState<EnrichedPayment | null>(null);
  const [paymentToEdit, setPaymentToEdit] = useState<EnrichedPayment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Estandarizado como Projects

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

  const enrichedPayments = useMemo((): EnrichedPayment[] => {
    if (isLoadingPayments || isLoadingProjects || isLoadingClients || !payments || !projects || !clients) {
      return [];
    }

    const projectMap = new Map(projects.map(p => [p.id, p]));
    const clientMap = new Map(clients.map(c => [c.id, c.name]));

    return payments.map(payment => {
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
        } else {
          clientNameDisplay = `Cliente no encontrado (ID: ${project.clientId})`;
        }
      } else {
        projectNumberDisplay = `Proyecto no encontrado (ID: ${payment.projectId})`;
      }
      
      return {
        ...payment,
        clientName: clientNameDisplay,
        projectNumber: projectNumberDisplay,
      };
    });
  }, [payments, projects, clients, isLoadingPayments, isLoadingProjects, isLoadingClients]);

  const filteredPayments = useMemo(() => {
    const searchTerm = normalizeSearchText(filterText);
    return enrichedPayments.filter(payment => {
      const projectNumber = payment.projectNumber ? normalizeSearchText(payment.projectNumber) : '';
      const clientName = payment.clientName ? normalizeSearchText(payment.clientName) : '';
      const paymentType = payment.paymentType ? normalizeSearchText(payment.paymentType) : '';
      const paymentMethod = payment.paymentMethod ? normalizeSearchText(payment.paymentMethod) : '';
      
      return projectNumber.includes(searchTerm) ||
             clientName.includes(searchTerm) ||
             paymentType.includes(searchTerm) ||
             paymentMethod.includes(searchTerm);
    });
  }, [enrichedPayments, filterText]);

  const deletePaymentMutation = useMutation({
    mutationFn: deletePayment,
    onSuccess: (_, paymentId) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // Invalidate projects due to balance change
      toast({ title: "Pago Eliminado", description: `El pago ha sido eliminado.`, variant: "destructive" });
      setPaymentToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Error al Eliminar", description: `No se pudo eliminar el pago: ${err.message}`, variant: "destructive" });
      setPaymentToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  });


  const handleDeletePaymentInitiate = (payment: EnrichedPayment) => {
    setPaymentToDelete(payment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePayment = () => {
    if (paymentToDelete) {
      deletePaymentMutation.mutate(paymentToDelete.id);
    }
  };

  const handleEditPayment = (payment: EnrichedPayment) => {
    setPaymentToEdit(payment);
    setIsEditDialogOpen(true);
  };


  // Calcular pagos paginados
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPayments.slice(startIndex, startIndex + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  const isLoading = isLoadingPayments || isLoadingProjects || isLoadingClients;
  const isMutating = deletePaymentMutation.isPending;

  // TODO: Reemplazar con nuevo componente de tabla

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

        <div className="text-center p-8 border rounded-lg">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            🚧 Tabla temporal eliminada - PageTableLayout removido para reescritura
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Total de pagos: {enrichedPayments?.length || 0}
          </p>
        </div>
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
