"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Eye, Edit, Phone, MapPin, Clock, GanttChartSquare, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Visit, getVisits, deleteVisit, VisitStatus } from '@/services/visitService';
import { NewVisitDialog, EditVisitDialog } from '@/components/modals/visits';
import { PageTableLayout, type TableColumn } from '@/components/layout/PageTableLayout';

const getStatusVariant = (status: VisitStatus) => {
  switch (status) {
    case 'Completada':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Agendada':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Reagendada':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Cancelada':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: // Ingresada
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

export default function VisitsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Cargar visitas desde Firestore
  useEffect(() => {
    const loadVisits = async () => {
      try {
        setLoading(true);
        const visitsData = await getVisits();
        setVisits(visitsData);
        setError(null);
      } catch (err) {
        console.error('Error al cargar visitas:', err);
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

  const handleViewDetails = (visitId?: string) => {
    if (!visitId) return;
    router.push(`/visits/${visitId}`);
  };

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
    setDeleteDialogOpen(true);
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
      console.error('Error al eliminar la visita:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la visita. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setVisitToDelete(null);
    }
  };

  // Filtrar visitas por término de búsqueda y estado
  const filteredVisits = useMemo(() => {
    return visits.filter(visit => {
      if (!visit) return false;
      
      const searchLower = searchTerm.toLowerCase();
      const name = visit.name || '';
      const phone = visit.phone || '';
      const address = visit.address || '';
      
      const matchesSearch = 
        name.toLowerCase().includes(searchLower) ||
        phone.includes(searchTerm) ||
        address.toLowerCase().includes(searchLower);
        
      const matchesStatus = selectedStatus === 'all' || visit.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [visits, searchTerm, selectedStatus]);

  // Paginación
  const paginatedVisits = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVisits.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVisits, currentPage, itemsPerPage]);

  // Selección de filas
  const handleSelectRow = (id: string) => {
    setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
  };

  const handleSelectAll = (isChecked: boolean) => {
    setSelectedRows(isChecked ? paginatedVisits.map(visit => visit.id || '') : []);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy', { locale: es });
  };

  // Definir las columnas de la tabla
  const columns: TableColumn<Visit>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (visit) => <span className="font-medium">{visit.name}</span>
    },
    {
      key: 'phone',
      label: 'Teléfono',
      render: (visit) => (
        <div className="flex items-center">
          <Phone className="mr-1 h-4 w-4 text-muted-foreground" />
          {visit.phone}
        </div>
      )
    },
    {
      key: 'address',
      label: 'Dirección',
      render: (visit) => (
        <div className="flex items-center">
          <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
          <span className="truncate max-w-[200px]" title={visit.address}>
            {visit.address}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (visit) => (
        <Badge className={getStatusVariant(visit.status)}>
          {visit.status}
        </Badge>
      )
    },
    {
      key: 'scheduledDate',
      label: 'Fecha Programada',
      render: (visit) => (
        <div className="flex items-center">
          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
          {formatDate(new Date(visit.scheduledDate))}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'right',
      render: (visit) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon2">
              <span className="sr-only">Abrir menú</span>
              <GanttChartSquare className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetails(visit.id)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>Ver detalles</span>
            </DropdownMenuItem>
            <EditVisitDialog 
              visit={visit}
              onSuccess={handleEditSuccess}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
            </EditVisitDialog>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(visit);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

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
      <PageTableLayout
        title="Visitas"
        actionButton={<NewVisitDialog />}
        searchPlaceholder="Buscar visitas..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        columns={columns}
        data={paginatedVisits}
        loading={loading}
        emptyStateTitle="No se encontraron visitas"
        emptyStateSubtitle="No hay datos que coincidan con los filtros actuales."
        selectable={true}
        selectedRows={selectedRows}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        getRowId={(visit) => visit.id || ''}
        pagination={{
          currentPage,
          itemsPerPage,
          totalItems: filteredVisits.length,
          onPageChange: setCurrentPage,
          onPageSizeChange: setItemsPerPage
        }}
      />

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
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


