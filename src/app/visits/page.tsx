"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { MapPin, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Visit, getVisits, deleteVisit } from '@/services/visitService';
import { NewVisitDialog, EditVisitDialog } from '@/components/modals/visits';
import { visitLogger } from '@/lib/logger';

// Componentes DataTable
import { DataTable } from '@/components/data-table/data-table';
import { createVisitsColumns, VISIT_STATUS_OPTIONS } from './columns';

export default function VisitsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

  // Cargar visitas desde Firestore
  useEffect(() => {
    const loadVisits = async () => {
      try {
        setLoading(true);
        const visitsData = await getVisits();
        setVisits(visitsData);
        setError(null);
      } catch (err) {
        visitLogger.error('Error al cargar visitas', err);
        setError('No se pudieron cargar las visitas. Por favor, inténtalo de nuevo.');
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las visitas',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadVisits();
  }, [toast]);

  const handleViewDetails = React.useCallback((visitId?: string) => {
    if (!visitId) return;
    router.push(`/visits/${visitId}`);
  }, [router]);

  const handleEdit = (visit: Visit) => {
    setEditingVisit(visit);
  };

  const handleEditSuccess = () => {
    // Forzar recarga de las visitas después de editar
    getVisits().then(visitsData => {
      setVisits(visitsData);
      setEditingVisit(null);
      toast({
        title: 'Visita actualizada',
        description: 'La visita se ha actualizado correctamente.',
      });
    });
  };

  const handleDelete = (visit: Visit) => {
    setVisitToDelete(visit);
  };

  const confirmDelete = async () => {
    if (!visitToDelete?.id) return;

    try {
      await deleteVisit(visitToDelete.id);

      // Actualizar el estado local
      const updatedVisits = visits.filter(v => v.id !== visitToDelete.id);
      setVisits(updatedVisits);

      toast({
        title: 'Visita eliminada',
        description: 'La visita ha sido eliminada correctamente.',
      });
    } catch (error) {
      visitLogger.error('Error al eliminar la visita', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la visita. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setVisitToDelete(null);
    }
  };

  // Efecto para abrir automáticamente el diálogo cuando editingVisit cambie
  React.useEffect(() => {
    if (editingVisit) {
      const timer = setTimeout(() => {
        const editButton = document.querySelector(`[data-edit-trigger="${editingVisit.id}"]`) as HTMLButtonElement;
        if (editButton) {
          editButton.click();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [editingVisit]);

  // Crear columnas para la DataTable
  const columns = React.useMemo(() => createVisitsColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onViewDetails: handleViewDetails,
  }), [handleViewDetails]);


  // Mostrar mensaje de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando visitas...</span>
      </div>
    );
  }
  
  // Mostrar mensaje de error
  if (error) {
    return (
      <div className="text-red-500 p-4">
        <p>{error}</p>
      </div>
    );
  }
  
  // Mostrar mensaje cuando no hay visitas
  if (visits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No hay visitas registradas</p>
        <NewVisitDialog />
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-none px-4 pb-2 bg-background">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary">Visitas</h1>
          <NewVisitDialog />
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={visits}
          searchKey="name"
          searchPlaceholder="Buscar por nombre, teléfono o dirección..."
          filterableColumns={[
            {
              id: "status",
              title: "Estado",
              options: VISIT_STATUS_OPTIONS,
            }
          ]}
          enableRowSelection
        />
      </div>

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={!!visitToDelete} onOpenChange={(open) => !open && setVisitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La visita será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de edición de visita */}
      {editingVisit && (
        <EditVisitDialog
          visit={editingVisit}
          onSuccess={handleEditSuccess}
        >
          <button
            style={{ display: 'none' }}
            data-edit-trigger={editingVisit.id}
          />
        </EditVisitDialog>
      )}
    </>
  );
}


