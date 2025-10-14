"use client";

import { useState, useEffect, useMemo } from 'react';
import type { EventType, ViewOption } from '@/types/event';
import { CalendarView } from '@/components/calendar/calendar-view';
import { EventViewDialog } from '@/components/calendar/EventViewDialog';
import { EventDeleteDialog } from '@/components/calendar/EventDeleteDialog';
import { NewProjectEventModal } from '@/components/modals/calendar/NewProjectEventModal';
import { CalendarToolbar } from '@/components/calendar/calendar-toolbar';
import { AppLayout } from '@/components/layout';
import { db } from '@/lib/firebase/client'; // Importar la instancia db configurada
import { updateProjectEvent, deleteProjectEvent } from '@/services/projectEventService';
import { getProjects } from '@/services/projectService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { normalizeSearchText } from '@/utils/search-utils';
import { startOfDay, endOfDay, isSameDay, parseISO, startOfWeek } from '@/lib/calendar-utils';
import { eventLogger } from '@/lib/logger';
import { CalendarDays, Plus, Briefcase, Wrench, Users } from 'lucide-react';


// Skeleton components for loading state
const ToolbarSkeleton = () => (
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-border bg-card rounded-t-lg animate-pulse">
    <div className="flex items-center gap-2 w-full sm:w-auto">
      <div className="h-10 w-20 bg-muted/70 rounded-md"></div> {/* Today Button */}
      <div className="h-10 w-10 bg-muted/70 rounded-md"></div> {/* Prev Button */}
      <div className="h-10 w-10 bg-muted/70 rounded-md"></div> {/* Next Button */}
      <div className="h-6 w-40 bg-muted/70 rounded-md ml-2"></div> {/* Title */}
    </div>
    <div className="flex items-center gap-2 w-full sm:w-auto sm:justify-end">
      <div className="h-10 sm:w-48 w-full bg-muted/70 rounded-md"></div> {/* Filter */}
      <div className="h-10 sm:w-[var(--select-width)] w-full bg-muted/70 rounded-md"></div> {/* View Select */}
      <div className="h-10 sm:w-32 w-full bg-muted/70 rounded-md"></div> {/* Add Event */}
    </div>
  </div>
);

const CalendarViewSkeleton = () => (
  <div className="flex-grow p-0 sm:p-2 md:p-4 animate-pulse">
    <div className="h-full w-full bg-muted/70 rounded-lg"></div> {/* Calendar area */}
  </div>
);

export default function CalReactAppPage() {
  // NOTA: En producción, reemplazar con sistema de autenticación real
  // Ej: const userId = useAuth().currentUser?.uid || "anonymous";
  const userId = "mockUserId"; // Placeholder para desarrollo

  const queryClient = useQueryClient();

  // Usar hook de TanStack Query para eventos
  const { events, isLoading: isLoadingEvents, isError, error } = useCalendarEvents(userId);

  // Query para proyectos (necesario para enriquecer eventos con status)
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => getProjects(),
  });

  // Mapear proyectos para lookup rápido
  const projectsMap = useMemo(
    () => new Map(projects?.map(p => [p.id, p]) || []),
    [projects]
  );

  // Enriquecer eventos con status del proyecto
  const eventsWithStatus = useMemo(
    () => events?.map(event => ({
      ...event,
      status: event.type === 'Proyecto'
        ? projectsMap.get((event as any).projectId)?.status
        : undefined
    })),
    [events, projectsMap]
  );

  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined); // Se inicializará en useEffect
  const [isClient, setIsClient] = useState(false);
  const [currentView, setCurrentView] = useState<ViewOption>('week');
  const [filterTerm, setFilterTerm] = useState('');

  // Estados para modales (view, delete)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false); // Legacy - mantener por compatibilidad
  const [selectedEvent, setSelectedEvent] = useState<EventType | Partial<Omit<EventType, 'id'>> | null>(null);
  const [visibleDays, setVisibleDays] = useState<number[]>([1, 2, 3, 4, 5]); // Lun-Vie por defecto

  // Efecto para inicialización del cliente y fecha actual (solo se ejecuta una vez)
  useEffect(() => {
    setIsClient(true);
    // Inicializar con el lunes de la semana actual
    const today = new Date();
    const mondayOfWeek = startOfWeek(today, { weekStartsOn: 1 });
    setCurrentDate(mondayOfWeek);

    // Cargar días visibles desde localStorage
    const savedVisibleDays = localStorage.getItem('calendar-visible-days');
    if (savedVisibleDays) {
      try {
        const parsed = JSON.parse(savedVisibleDays);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVisibleDays(parsed);
        }
      } catch (error) {
        eventLogger.warn('Error al cargar días visibles desde localStorage', error);
      }
    }
  }, []);

  // Efecto para persistir días visibles en localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('calendar-visible-days', JSON.stringify(visibleDays));
    }
  }, [visibleDays, isClient]);

  // Mutaciones de TanStack Query
  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: Partial<any> }) =>
      updateProjectEvent(eventId, data, db),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', userId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Evento actualizado');
    },
    onError: (error: Error) => {
      eventLogger.error('Error al actualizar evento', error);
      toast.error('Error al actualizar evento', {
        description: error.message,
      });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (eventId: string) => deleteProjectEvent(eventId, db),
    onSuccess: () => {
      // IMPORTANTE: Cerrar dialog ANTES de invalidar queries para evitar race condition
      // que deja pointer-events: none en el body (bug conocido de Radix UI AlertDialog)
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);

      // Workaround: Limpiar manualmente el pointer-events del body
      // Radix UI AlertDialog no limpia correctamente el style inline cuando se desmonta
      // durante un re-render causado por invalidación de queries
      setTimeout(() => {
        // Remover el style inline del body
        document.body.style.removeProperty('pointer-events');

        // Invalidar queries y mostrar toast
        queryClient.invalidateQueries({ queryKey: ['calendar-events', userId] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        toast.success('Evento eliminado');
      }, 100);
    },
    onError: (error: Error) => {
      eventLogger.error('Error al eliminar evento', error);
      toast.error('Error al eliminar evento', {
        description: error.message,
      });
    }
  });

  const filteredEvents = useMemo(() => {
    if (!filterTerm.trim()) {
      return eventsWithStatus;
    }
    const searchTerm = normalizeSearchText(filterTerm);
    return eventsWithStatus?.filter(event => {
      const title = normalizeSearchText(event.name);
      const description = event.description ? normalizeSearchText(event.description) : '';
      const location = event.location ? normalizeSearchText(event.location) : '';

      return title.includes(searchTerm) ||
             description.includes(searchTerm) ||
             location.includes(searchTerm);
    }) || [];
  }, [eventsWithStatus, filterTerm]);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    // Si estamos en vista semanal, ir al lunes de la semana actual
    if (currentView === 'week') {
      const mondayOfWeek = startOfWeek(today, { weekStartsOn: 1 });
      setCurrentDate(mondayOfWeek);
    } else {
      setCurrentDate(today);
    }
  };

  const handleViewChange = (newView: ViewOption) => {
    setCurrentView(newView);
  };

  const handleFilterChange = (term: string) => {
    setFilterTerm(term);
  };

  const handleVisibleDaysChange = (days: number[]) => {
    setVisibleDays(days);
  };

  const handleAddEventClick = (type?: 'Proyecto' | 'Postventa' | 'Visita') => {
    const now = new Date();
    setSelectedEvent({
      name: '',
      startDate: startOfDay(now), // Usar startOfDay para tener una fecha de inicio consistente
      endDate: endOfDay(now), // Usar endOfDay para tener una fecha de fin consistente
      description: '',
      color: 'hsl(var(--primary))', // Incluir el color por defecto
      // Incluimos el tipo si fue preseleccionado
      ...(type && { type })
    });
    setIsModalOpen(true);
  };

  /**
   * Handler para ver detalles de un evento (modal de vista rápida)
   */
  const handleViewEvent = (event: EventType) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  /**
   * Handler para eliminar un evento (confirmación)
   */
  const handleDeleteEvent = (event: EventType) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Handler para confirmar eliminación de evento
   */
  const handleConfirmDelete = (event: EventType) => {
    // Solo eventos de tipo Proyecto tienen servicio de eliminación
    if (event.type === 'Proyecto') {
      deleteEventMutation.mutate(event.id);
    } else {
      toast.error('No disponible', {
        description: 'La eliminación de este tipo de evento aún no está implementada.',
      });
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    }
  };

  // Legacy handler - redirige a handleViewEvent
  const handleEventClick = (event: EventType) => {
    handleViewEvent(event);
  };

  const handleEventResize = async (eventId: string, newStartDate: Date, newEndDate: Date) => {
    // Deshabilitar redimensionado para eventos de proyecto
    // Los eventos de proyecto deben editarse desde su interfaz específica
    toast.error('Edición no disponible', {
      description: 'Los eventos de proyecto deben editarse desde su interfaz específica.',
    });
  };

  /**
   * Handler para mover eventos mediante drag & drop
   * Actualiza el evento en Firebase usando TanStack Query mutation
   */
  const handleEventDrop = (eventId: string, newStartDate: Date, newEndDate: Date) => {
    // Buscar el evento a actualizar
    const eventToUpdate = events.find(e => e.id === eventId);
    if (!eventToUpdate) {
      eventLogger.warn('Evento no encontrado para actualizar', { eventId });
      return;
    }

    eventLogger.info('Moviendo evento', {
      eventId,
      oldStart: eventToUpdate.startDate,
      newStart: newStartDate
    });

    // Actualizar en Firebase (solo eventos de tipo Proyecto)
    if (eventToUpdate.type === 'Proyecto') {
      updateEventMutation.mutate({
        eventId,
        data: { eventDate: newStartDate } // ProjectEventType usa eventDate, no startDate
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleModalSave = async (eventToSave: Omit<EventType, 'id'> & { id?: string }) => {
    // Solo permitir visualización, no edición
    // Los eventos de proyecto deben editarse desde su interfaz específica
    toast.error('Edición no disponible', {
      description: 'Los eventos de proyecto deben editarse desde su interfaz específica.',
    });
    handleModalClose();
  };

  const handleModalDelete = async (eventId: string) => {
    // Solo permitir visualización, no eliminación
    // Los eventos de proyecto deben editarse desde su interfaz específica
    toast.error('Eliminación no disponible', {
      description: 'Los eventos de proyecto deben eliminarse desde su interfaz específica.',
    });
    handleModalClose();
  };

  if (!isClient || currentDate === undefined || isLoadingEvents) {
    return (
      <AppLayout
        pageTitle="Calendario"
        pageIcon={CalendarDays}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Calendario' }
        ]}
        headerActions={
          <Button disabled className="bg-primary/50">
            <Plus className="mr-2 h-5 w-5" /> Añadir Evento
          </Button>
        }
      >
        <div className="mb-4">
          <ToolbarSkeleton />
        </div>
        <CalendarViewSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      pageTitle="Calendario"
      pageIcon={CalendarDays}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Calendario' }
      ]}
      headerActions={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-5 w-5" /> Añadir Evento
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAddEventClick('Proyecto')}>
              <Briefcase className="mr-2 h-4 w-4" /> Proyecto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddEventClick('Postventa')}>
              <Wrench className="mr-2 h-4 w-4" /> Postventa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddEventClick('Visita')}>
              <Users className="mr-2 h-4 w-4" /> Visita
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <div className="mb-4">
        <CalendarToolbar
          currentDate={currentDate}
          currentView={currentView}
          filterTerm={filterTerm}
          visibleDays={visibleDays}
          onDateChange={handleDateChange}
          onViewChange={handleViewChange}
          onFilterChange={handleFilterChange}
          onVisibleDaysChange={handleVisibleDaysChange}
          onToday={handleToday}
        />
      </div>

      <CalendarView
        currentDate={currentDate}
        events={filteredEvents}
        currentView={currentView}
        onEventClick={handleViewEvent}
        onEventDelete={handleDeleteEvent}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        enableDragAndDrop={true}
        enableResizing={true}
        weekStartsOn={1}
        visibleDays={visibleDays}
      />

      {/* Modal de vista rápida */}
      {isViewModalOpen && selectedEvent && 'id' in selectedEvent && (
        <EventViewDialog
          event={selectedEvent}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Modal de crear/editar evento de proyecto */}
      {isModalOpen && selectedEvent?.type === 'Proyecto' && (
        <NewProjectEventModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          autoSave={true}
        />
      )}

      {/* Dialog de confirmación de eliminación */}
      {isDeleteDialogOpen && selectedEvent && 'id' in selectedEvent && (
        <EventDeleteDialog
          event={selectedEvent}
          isOpen={isDeleteDialogOpen}
          isDeleting={deleteEventMutation.isPending}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedEvent(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </AppLayout>
  );
}
