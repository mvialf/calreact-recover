"use client";

import React, { useState, useMemo } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { format as formatDate } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

// Tipos
import type { ProjectType, EnrichedProject } from '@/types/project';
import type { PaymentMethod } from '@/types/payment';

// Hooks
import { useProjectsData } from '@/hooks/useProjectsData';

// Servicios
import { updateProject, deleteProject } from '@/services/projectService';
import { addPayment } from '@/services/paymentService';

// Componentes UI
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PaymentDialog } from '@/components/payment-dialog';
import AccountStatementDialog from '@/components/account-statement-dialog';
import { ProjectClientDisplay } from '@/components/client-display';
import { NewProjectDialog } from '@/components/modals/projects/NewProjectDialog';
import { EditProjectDialog } from '@/components/modals/projects/EditProjectDialog';

// Iconos
import { GanttChartSquare, Loader2, SquarePen, Trash2, DollarSign, FileText, Eye, EyeOff, Search } from 'lucide-react';

// Utils
import { formatCurrency } from '@/utils/format-helpers';
import { getPaymentPercentageBadgeVariant, getStatusBadgeVariant, PROJECT_STATUS_OPTIONS, type ProjectStatusConstant } from '@/lib/constants';

// Definición del tipo para los campos ordenables
type SortableField = keyof EnrichedProject;

const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { projects: enrichedProjects, isLoading, isError, error } = useProjectsData();

  // Estados del componente
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortableField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [hideCompletedAndPaid, setHideCompletedAndPaid] = useState(false);
  
  const [editingProject, setEditingProject] = useState<EnrichedProject | null>(null);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [projectForPayment, setProjectForPayment] = useState<EnrichedProject | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<EnrichedProject | null>(null);
  const [isAccountStatementOpen, setIsAccountStatementOpen] = useState(false);
  const [selectedProjectForAccountStatement, setSelectedProjectForAccountStatement] = useState<EnrichedProject | null>(null);
  const [projectToEdit, setProjectToEdit] = useState<EnrichedProject | null>(null);

  // --- MUTATIONS ---
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
      setSelectedRows(prev => prev.filter(id => id !== deletedId));
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

  // --- MANEJADORES DE EVENTOS ---
  const handleSort = (field: SortableField) => {
    const newSortOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newSortOrder);
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const handleSelectAll = (isChecked: boolean) => {
    setSelectedRows(isChecked ? paginatedProjects.map(p => p.id) : []);
  };

  

  const handleOpenPaymentDialog = (project: EnrichedProject) => {
    setProjectForPayment(project);
    setPaymentDialogOpen(true);
  };

    const handleConfirmPayment = (paymentData: { amount: number; date: Date; paymentMethod: PaymentMethod; installments?: number; isAdjustment: boolean }) => {
    if (projectForPayment) {
            addPaymentMutation.mutate({
        ...paymentData,
        projectId: projectForPayment.id,
        createdAt: new Date(), // El servicio `addPayment` requiere este campo
      });
    }
  };

  const handleOpenDeleteDialog = (project: EnrichedProject) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate(projectToDelete.id);
    }
  };

  const handleOpenAccountStatementDialog = (project: EnrichedProject) => {
    setSelectedProjectForAccountStatement(project);
    setIsAccountStatementOpen(true);
  };

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

  const handleStatusChange = (projectId: string, status: ProjectStatusConstant) => {
    updateStatusMutation.mutate({ projectId, status });
  };

  // Función para abrir el diálogo de edición
  const handleOpenEditDialog = (project: EnrichedProject) => {
    setProjectToEdit(project);
  };

  // Efecto para abrir automáticamente el diálogo cuando projectToEdit cambie
  React.useEffect(() => {
    if (projectToEdit) {
      // Usar setTimeout para asegurar que el DOM esté actualizado
      const timer = setTimeout(() => {
        const editButton = document.querySelector(`[data-edit-trigger="${projectToEdit.id}"]`) as HTMLButtonElement;
        if (editButton) {
          editButton.click();
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [projectToEdit]);

  // --- DATOS FILTRADOS Y ORDENADOS ---
  const filteredProjects = useMemo(() => {
    let projects = enrichedProjects || [];

    if (hideCompletedAndPaid) {
      // Oculta proyectos que están completados Y cuyo saldo es 0 o menor (pagados)
      projects = projects.filter(project => 
        !(project.status === 'completado' && project.isPaid === true)
      );
    }

    if (filter) {
      const lowercasedFilter = filter.toLowerCase();
      projects = projects.filter(p =>
        p.projectNumber.toLowerCase().includes(lowercasedFilter) ||
        (p.clientName || '').toLowerCase().includes(lowercasedFilter) ||
        (p.glosa || '').toLowerCase().includes(lowercasedFilter)
      );
    }
    return projects;
  }, [enrichedProjects, filter, hideCompletedAndPaid]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredProjects, sortBy, sortOrder]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProjects, currentPage, itemsPerPage]);

    // TODO: Reemplazar con nuevo componente de tabla

  // --- RENDERIZADO ---
  if (isError && error) return <div className="text-red-500 p-4">Error al cargar proyectos: {error.message}</div>;

  return (
    <>
      <div className="w-full max-w-none px-4 pb-2 bg-background">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary">Proyectos</h1>
          <NewProjectDialog />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Buscar por presupuesto, cliente o glosa..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-8 w-96 p-2 border rounded"
            />
          </div>
          <Button variant="ghost" size="icon2" onClick={() => setHideCompletedAndPaid(!hideCompletedAndPaid)} title={hideCompletedAndPaid ? 'Mostrar proyectos completados y pagados' : 'Ocultar proyectos completados y pagados'}>
            {hideCompletedAndPaid ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
            <span className="sr-only">
              {hideCompletedAndPaid ? 'Mostrar proyectos completados y pagados' : 'Ocultar proyectos completados y pagados'}
            </span>
          </Button>
        </div>

        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">
            🚧 Tabla temporal eliminada - PageTableLayout removido para reescritura
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Total de proyectos: {enrichedProjects?.length || 0}
          </p>
        </div>
      </div>

      {/* Diálogos */}
      {isPaymentDialogOpen && projectForPayment && (
        <PaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          onConfirm={handleConfirmPayment}
          project={projectForPayment}
        />
      )}

      {isAccountStatementOpen && selectedProjectForAccountStatement && (
        <AccountStatementDialog
          isOpen={isAccountStatementOpen}
          onClose={() => {
            setIsAccountStatementOpen(false);
            setSelectedProjectForAccountStatement(null);
          }}
          project={selectedProjectForAccountStatement}
          clientName={
            `${selectedProjectForAccountStatement.clientName || 'Cliente no encontrado'}${selectedProjectForAccountStatement.glosa?.trim() ? ` - ${selectedProjectForAccountStatement.glosa}` : ''}`
          }
        />
      )}

      {/* Diálogo de Edición de Proyecto */}
      {projectToEdit && (
        <EditProjectDialog project={projectToEdit}>
          <button 
            data-edit-trigger={projectToEdit.id}
            style={{ display: 'none' }}
            aria-hidden="true"
          >
            Hidden Edit Trigger
          </button>
        </EditProjectDialog>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el proyecto "{projectToDelete?.projectNumber}" y todos sus pagos y registros asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteProjectMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteProjectMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sí, eliminar proyecto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
};

export default ProjectsPage;
