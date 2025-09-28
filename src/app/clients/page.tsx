
// src/app/clients/page.tsx
"use client";
import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Client } from '@/types/client';
import { getClients, addClient, updateClient, deleteClient } from '@/services/clientService';

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
import { PlusCircle, Users, Loader2 } from 'lucide-react';
import ClientModal from '@/components/client-modal';
import { useToast } from '@/components/ui/use-toast';

// Componentes DataTable
import { DataTable } from '@/components/data-table/data-table';
import { createClientsColumns } from './columns';

export default function ClientsPage() {
  const { toast } = useToast();
  const queryClientHook = useQueryClient();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);


  const { data: clients = [], isLoading, isError, error } = useQuery<Client[], Error>({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const addClientMutation = useMutation({
    mutationFn: addClient,
    onSuccess: (newClient) => {
      queryClientHook.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Cliente Añadido", description: `"${newClient.name}" ha sido añadido.` });
      handleCloseModal();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: `No se pudo añadir el cliente: ${err.message}`, variant: "destructive" });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: (variables: { clientId: string; clientData: Partial<Omit<Client, 'id'>> }) => 
      updateClient(variables.clientId, variables.clientData),
    onSuccess: (_, variables) => {
      queryClientHook.invalidateQueries({ queryKey: ['clients'] });
      const updatedClient = clients.find(c => c.id === variables.clientId);
      toast({ title: "Cliente Actualizado", description: `"${updatedClient?.name || 'El cliente'}" ha sido actualizado.` });
      handleCloseModal();
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: `No se pudo actualizar el cliente: ${err.message}`, variant: "destructive" });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: (_, clientId) => {
      queryClientHook.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: "Cliente Eliminado", description: `"${clientToDelete?.name || 'El cliente'}" ha sido eliminado.`, variant: "destructive" });
      setClientToDelete(null);
      setIsDeleteDialogOpen(false);
    },
    onError: (err: any) => {
      let description = `No se pudo eliminar el cliente: ${err.message}`;
      if (err.code) {
        description += ` (Código: ${err.code})`;
      }
      toast({ title: "Error al Eliminar", description, variant: "destructive" });
      setClientToDelete(null);
      setIsDeleteDialogOpen(false);
    },
  });


  const handleOpenModal = (client?: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(undefined);
  };

  const handleDeleteClientInitiate = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteClient = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id);
    }
  };

  // Handlers específicos para DataTable
  const handleRegisterPayment = React.useCallback((clientId: string) => {
    router.push(`/clients/newPayment/${clientId}`);
  }, [router]);

  const handleAccountStatement = React.useCallback(() => {
    toast({
      title: "Próximamente",
      description: "La función de estado de cuenta para clientes estará disponible pronto."
    });
  }, [toast]);

  // Función para determinar si una fila está en estado de mutación
  const isRowMutating = React.useCallback((client: Client) => {
    const isCurrentRowEditing = updateClientMutation.isPending && updateClientMutation.variables?.clientId === client.id;
    const isCurrentRowDeleting = deleteClientMutation.isPending && clientToDelete?.id === client.id;
    return isCurrentRowEditing || isCurrentRowDeleting;
  }, [updateClientMutation.isPending, updateClientMutation.variables?.clientId, deleteClientMutation.isPending, clientToDelete?.id]);

  const handleSaveClient = (savedClient: Client) => {
    if (savedClient.id) {
      const { id, ...clientData } = savedClient;
      updateClientMutation.mutate({ clientId: id, clientData });
    } else {
      const { id, ...newClientData } = savedClient; 
      addClientMutation.mutate(newClientData as Omit<Client, 'id' | 'createdAt' | 'updatedAt'>);
    }
  };

  // Crear columnas para la DataTable
  const columns = React.useMemo(() => createClientsColumns({
    onEdit: handleOpenModal,
    onDelete: handleDeleteClientInitiate,
    onRegisterPayment: handleRegisterPayment,
    onAccountStatement: handleAccountStatement,
    isRowMutating,
  }), [handleRegisterPayment, handleAccountStatement, isRowMutating]);


  if (isError) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-destructive">
        <h1 className="text-2xl font-bold mb-2">Error al cargar clientes</h1>
        <p>{error?.message || "Ha ocurrido un error desconocido."}</p>
        <Button onClick={() => queryClientHook.refetchQueries({ queryKey: ['clients'] })} className="mt-4">
          Intentar de Nuevo
        </Button>
      </div>
    );
  }
  
  const isMutating = addClientMutation.isPending || updateClientMutation.isPending || deleteClientMutation.isPending;


  return (
    <div className="flex flex-col h-full ">
      <header className="flex items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Gestión de Clientes</h1>
            <p className="text-muted-foreground">Administra la información de tus clientes.</p>
          </div>
        </div>
        <Button onClick={() => handleOpenModal()} disabled={isMutating && addClientMutation.isPending && !selectedClient}>
          {isMutating && addClientMutation.isPending && !selectedClient ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
          Nuevo Cliente
        </Button>
      </header>
      <main className="flex-grow">
        <div className="w-full max-w-none  pb-2 bg-background">
          {isLoading || clients.length > 0 ? (
            /* DataTable */
            <DataTable
              columns={columns}
              data={clients}
              searchKey="name"
              searchPlaceholder="Buscar clientes por nombre o email..."
              enableRowSelection
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">No hay clientes registrados.</p>
              <p className="text-sm">Empieza añadiendo tu primer cliente.</p>
            </div>
          )}
        </div>
      </main>
      <ClientModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSaveClient} clientData={selectedClient} />
      
      {clientToDelete && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente al cliente "{clientToDelete.name}"
                y todos sus proyectos, pagos y registros de postventa asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setClientToDelete(null); setIsDeleteDialogOpen(false); }}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteClient}
                disabled={deleteClientMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteClientMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sí, eliminar cliente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
