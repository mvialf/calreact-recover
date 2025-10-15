"use client";

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format as formatDate } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos
import type { AfterSales } from '@/types/afterSales';
import type { ProjectType } from '@/types/project';

// Servicios
import { getProjects } from '@/services/projectService';

import { getAfterSalesForProject, deleteAfterSales } from '@/services/afterSalesService';
import { afterSalesLogger } from '@/lib/logger';

// Componentes
import { AppLayout } from '@/components/layout';
import { DataTable } from '@/components/custom/data-table';
import { createAfterSalesColumns } from './columns';
import { AFTERSALES_STATUS_OPTIONS } from '@/constants/afterSales';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { NewAfterSaleDialog, EditAfterSaleDialog } from '@/components/modals/afterSales';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

// Iconos
import { Wrench, Loader2 } from 'lucide-react';


// Adaptación para usar la nueva versión del servicio que acepta instancia de Firestore
const getAllAfterSales = async () => {
  // Esta función es provisional y deberá ser actualizada para usar
  // un contexto de base de datos que proporcione la instancia de Firestore
  try {
    // Obtener todos los proyectos primero
    const projects = await getProjects();
    
    // Luego obtener todos los casos de posventa para cada proyecto
    const afterSalesPromises = projects.map(project => 
      getAfterSalesForProject(project.id)
    );
    
    const allAfterSalesArrays = await Promise.all(afterSalesPromises);
    
    // Combinar todos los resultados en un único array
    return allAfterSalesArrays.flat();
  } catch (error) {
    afterSalesLogger.error("Error al obtener casos de postventa", error);
    throw error;
  }
};

const AfterSalesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedAfterSales, setSelectedAfterSales] = useState<AfterSales[]>([]);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [isDetailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedAfterSale, setSelectedAfterSale] = useState<AfterSales | null>(null);
  const [afterSaleToEdit, setAfterSaleToEdit] = useState<AfterSales | null>(null);

  // Manejadores de eventos
  const handleEdit = (afterSale: AfterSales) => {
    setAfterSaleToEdit(afterSale);
  };

  const handleDelete = (afterSale: AfterSales) => {
    setSelectedAfterSale(afterSale);
    setDeleteAlertOpen(true);
  };

  const handleViewDetails = (afterSale: AfterSales) => {
    setSelectedAfterSale(afterSale);
    setDetailsDialogOpen(true);
  };
  
  // Obtener todas las postventas
  const { data: afterSalesData = [], isLoading: isLoadingAfterSales, isError, error } = useQuery({
    queryKey: ['afterSales'],
    queryFn: () => getAllAfterSales(),
  });

  // Obtener todos los proyectos para mostrar nombres
  const { data: projectsData = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });

  const deleteMutation = useMutation({
    mutationFn: (afterSalesId: string) => deleteAfterSales(afterSalesId),
    onSuccess: () => {
      toast.success('Postventa eliminada con éxito');
      queryClient.invalidateQueries({ queryKey: ['afterSales'] });
      setDeleteAlertOpen(false);
      setSelectedAfterSale(null);
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
      afterSalesLogger.error('Error deleting after-sale', error);
    },
  });

  const handleConfirmDelete = () => {
    if (selectedAfterSale) {
      deleteMutation.mutate(selectedAfterSale.id);
    }
  };

  // Crear un mapa de proyectos por ID para acceso rápido
  const projectsMap = useMemo(() => {
    return projectsData.reduce((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {} as Record<string, ProjectType>);
  }, [projectsData]);

  // Efecto para abrir automáticamente el diálogo cuando afterSaleToEdit cambie
  React.useEffect(() => {
    if (afterSaleToEdit) {
      const timer = setTimeout(() => {
        const editButton = document.querySelector(`[data-edit-trigger="${afterSaleToEdit.id}"]`) as HTMLButtonElement;
        if (editButton) {
          editButton.click();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [afterSaleToEdit]);

  // Columnas para la DataTable
  const columns = React.useMemo(() => createAfterSalesColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onViewDetails: handleViewDetails,
    projectsMap,
  }), [projectsMap]);

  // Opciones para filtros
  const statusFilterOptions = AFTERSALES_STATUS_OPTIONS.map(option => ({
    label: option.label,
    value: option.value,
  }));
  if (isLoadingAfterSales) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando postventas...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar las postventas: {error?.message}</p>
      </div>
    );
  }

  return (
    <AppLayout
      pageTitle="Postventas"
      pageDescription="Gestión de servicios postventa y mantenimiento"
      pageIcon={Wrench}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Postventas' }
      ]}
      headerActions={<NewAfterSaleDialog />}
    >
      {/* DataTable */}
      <DataTable
        columns={columns}
        data={afterSalesData}
        searchKey="projectId"
        searchPlaceholder="Buscar por proyecto..."
        filterableColumns={[
          {
            id: "afterSalesStatus",
            title: "Estado",
            options: statusFilterOptions,
          }
        ]}
        onRowSelectionChange={setSelectedAfterSales}
        enableRowSelection
      />

      {/* Diálogos */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles de la Postventa</DialogTitle>
            <DialogDescription>
              {selectedAfterSale && projectsMap[selectedAfterSale.projectId]?.clientName}
            </DialogDescription>
          </DialogHeader>
          {selectedAfterSale && (
            <div className="space-y-4">
              <div><strong>Proyecto:</strong> {projectsMap[selectedAfterSale.projectId]?.description}</div>
              <div><strong>Fecha de Ingreso:</strong> {selectedAfterSale.entryDate ? formatDate(selectedAfterSale.entryDate, 'PPP', { locale: es }) : 'N/A'}</div>
              <div><strong>Estado:</strong> {selectedAfterSale.afterSalesStatus}</div>
              <div className="pt-2"><strong>Descripción:</strong><p className="text-sm text-muted-foreground">{selectedAfterSale.description}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el registro de postventa
              {selectedAfterSale && ` para el proyecto "${projectsMap[selectedAfterSale.projectId]?.projectNumber || 'desconocido'}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {afterSaleToEdit && (
        <EditAfterSaleDialog afterSale={afterSaleToEdit}>
          <button
            data-edit-trigger={afterSaleToEdit.id}
            style={{ display: 'none' }}
          />
        </EditAfterSaleDialog>
      )}
    </AppLayout>
  );
};

export default AfterSalesPage;
