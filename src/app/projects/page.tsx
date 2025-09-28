"use client";

import React, { useState } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

// Tipos
import type { ProjectType, EnrichedProject } from '@/types/project';
import type { PaymentMethod } from '@/types/payment';

// Hooks
import { useProjectsData } from '@/hooks/useProjectsData';

// Servicios
import { updateProject, deleteProject } from '@/services/projectService';
import { addPayment } from '@/services/paymentService';

// Componentes
import { DataTable } from '@/components/data-table';
import { createProjectsColumns } from './columns';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PaymentDialog } from '@/components/payment-dialog';
import AccountStatementDialog from '@/components/account-statement-dialog';
import { NewProjectDialog } from '@/components/modals/projects/NewProjectDialog';
import { EditProjectDialog } from '@/components/modals/projects/EditProjectDialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Iconos
import { GanttChartSquare, Loader2, PlusCircle } from 'lucide-react';

// Utils
import { PROJECT_STATUS_OPTIONS, type ProjectStatusConstant } from '@/lib/constants';

const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { projects: enrichedProjects, isLoading, isError, error } = useProjectsData();

  // Estados para modales y diálogos
  const [selectedProjects, setSelectedProjects] = useState<EnrichedProject[]>([]);
  const [hideCompletedAndPaid, setHideCompletedAndPaid] = useState(false);

  const [editingProject, setEditingProject] = useState<EnrichedProject | null>(null);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [projectForPayment, setProjectForPayment] = useState<EnrichedProject | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<EnrichedProject | null>(null);
  const [isAccountStatementOpen, setIsAccountStatementOpen] = useState(false);
  const [selectedProjectForAccountStatement, setSelectedProjectForAccountStatement] = useState<EnrichedProject | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<EnrichedProject | null>(null);

  // Mutations
  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectType> }) => updateProject(id, data),
    onSuccess: () => {
      toast.success('Proyecto actualizado con éxito');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditingProject(null);
    },
    onError: (err: Error) => toast.error(`Error al actualizar: ${err.message}`),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: (_, deletedId) => {
      toast.success('Proyecto eliminado con éxito');
      queryClient.invalidateQueries({ queryKey: ['projects', 'payments'] });
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    },
    onError: (err: Error) => toast.error(`Error al eliminar: ${err.message}`),
  });

  const addPaymentMutation = useMutation({
    mutationFn: addPayment,
    onSuccess: () => {
      toast.success('Pago registrado con éxito');
      queryClient.invalidateQueries({ queryKey: ['projects', 'payments'] });
      setPaymentDialogOpen(false);
      setProjectForPayment(null);
    },
    onError: (err: Error) => toast.error(`Error al registrar el pago: ${err.message}`),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ projectId, status }: { projectId: string; status: ProjectStatusConstant }) =>
      updateProject(projectId, { status }),
    onSuccess: () => {
      toast.success('Estado del proyecto actualizado correctamente.');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      toast.error(`Error al actualizar el estado: ${error.message}`);
    },
  });

  // Manejadores de eventos
  const handleEdit = (project: EnrichedProject) => {
    setProjectToEdit(project);
  };

  const handleDelete = (project: EnrichedProject) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleAddPayment = (project: EnrichedProject) => {
    setProjectForPayment(project);
    setPaymentDialogOpen(true);
  };

  const handleViewAccountStatement = (project: EnrichedProject) => {
    setSelectedProjectForAccountStatement(project);
    setIsAccountStatementOpen(true);
  };

  const handleStatusChange = (projectId: string, status: ProjectStatusConstant) => {
    updateStatusMutation.mutate({ projectId, status });
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
    }
  };

  const handleConfirmPayment = (paymentData: {
    amount: number;
    date: Date;
    paymentMethod: PaymentMethod;
    installments?: number;
    isAdjustment: boolean;
  }) => {
    if (projectForPayment) {
      addPaymentMutation.mutate({
        ...paymentData,
        projectId: projectForPayment.id,
        createdAt: new Date(),
      });
    }
  };

  // Efecto para abrir automáticamente el diálogo cuando projectToEdit cambie
  React.useEffect(() => {
    if (projectToEdit) {
      const timer = setTimeout(() => {
        const editButton = document.querySelector(`[data-edit-trigger="${projectToEdit.id}"]`) as HTMLButtonElement;
        if (editButton) {
          editButton.click();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [projectToEdit]);

  // Datos filtrados
  const filteredProjects = React.useMemo(() => {
    if (!enrichedProjects) return [];

    let projects = enrichedProjects;

    if (hideCompletedAndPaid) {
      projects = projects.filter(project =>
        !(project.status === 'completado' && project.isPaid === true)
      );
    }

    return projects;
  }, [enrichedProjects, hideCompletedAndPaid]);

  // Columnas para la DataTable
  const columns = React.useMemo(() => createProjectsColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onAddPayment: handleAddPayment,
    onViewAccountStatement: handleViewAccountStatement,
  }), []);

  // Opciones para filtros
  const statusFilterOptions = PROJECT_STATUS_OPTIONS.map(option => ({
    label: option.label,
    value: option.value,
  }));

  const paymentStatusFilterOptions = [
    { label: "Pagado", value: "true" },
    { label: "Pendiente", value: "false" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando proyectos...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar los proyectos: {error?.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <GanttChartSquare className="w-8 h-8 mr-3 text-primary" />
            Proyectos
          </h1>
         </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="hide-completed-paid"
              checked={hideCompletedAndPaid}
              onCheckedChange={setHideCompletedAndPaid}
            />
            <Label htmlFor="hide-completed-paid" className="text-sm">
              Ocultar completados y pagados
            </Label>
          </div>
          <NewProjectDialog />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredProjects}
        searchKey="projectNumber"
        searchPlaceholder="Buscar por número de proyecto..."
        filterableColumns={[
          {
            id: "status",
            title: "Estado",
            options: statusFilterOptions,
          }
        ]}
        onRowSelectionChange={setSelectedProjects}
        enableRowSelection
        meta={{
          handleStatusChange,
          updateStatusMutation,
        }}
      />

      {/* Diálogos */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el proyecto
              {projectToDelete && ` "${projectToDelete.projectNumber}"`} y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteProjectMutation.isPending}
            >
              {deleteProjectMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        project={projectForPayment}
        onConfirm={handleConfirmPayment}
      />

      <AccountStatementDialog
        isOpen={isAccountStatementOpen}
        onClose={() => setIsAccountStatementOpen(false)}
        project={selectedProjectForAccountStatement}
      />

      {projectToEdit && (
        <EditProjectDialog project={projectToEdit}>
          <button
            data-edit-trigger={projectToEdit.id}
            style={{ display: 'none' }}
          />
        </EditProjectDialog>
      )}
    </div>
  );
};

export default ProjectsPage;