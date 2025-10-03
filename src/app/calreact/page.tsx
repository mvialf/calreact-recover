"use client";

import { useState, useEffect, useMemo } from 'react';
import type { EventType, ViewOption } from '@/types/event';
import { CalendarView } from '@/components/calendar/calendar-view';
import { EventModal } from '@/components/calendar/event-modal';
import { EventViewDialog } from '@/components/calendar/EventViewDialog';
import { EventDeleteDialog } from '@/components/calendar/EventDeleteDialog';
import { CalendarToolbar } from '@/components/calendar/calendar-toolbar';
import { AppLayout } from '@/components/layout';
import { db } from '@/lib/firebase/client'; // Importar la instancia db configurada
import { getAllCalendarEvents } from '@/services/calendarEventService';
import { updateProjectEvent, deleteProjectEvent } from '@/services/projectEventService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
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

  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined); // Se inicializará en useEffect
  const [isClient, setIsClient] = useState(false);
  const [events, setEvents] = useState<EventType[]>([]);
  const [currentView, setCurrentView] = useState<ViewOption>('week');
  const [filterTerm, setFilterTerm] = useState('');

  // Estados para modales (view, edit, delete)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false); // Legacy - mantener por compatibilidad
  const [selectedEvent, setSelectedEvent] = useState<EventType | Partial<Omit<EventType, 'id'>> | null>(null);
  const [visibleDays, setVisibleDays] = useState<number[]>([1, 2, 3, 4, 5]); // Lun-Vie por defecto
  const { toast } = useToast();

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

  // Efecto para cargar eventos (se ejecuta cuando userId cambia)
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoadingEvents(true);

        
        // Verificar si Firebase está configurado correctamente
        if (!db) {

          setEvents([]);
          return;
        }
        
        // Usar el servicio que combina projectEvents y otros
        const fetchedEvents = await getAllCalendarEvents(db, userId);

        
        setEvents(fetchedEvents);
      } catch (error) {

        
        // No mostrar toast de error en desarrollo si Firebase no está configurado
        const isFirebaseNotConfigured = (error as any)?.message?.includes?.('your-project-id') || 
                                        (error as any)?.code === 'app/invalid-credential';
        
        if (!isFirebaseNotConfigured) {
          toast({ 
            title: "Error", 
            description: "No se pudieron cargar los eventos del calendario.", 
            variant: "destructive" 
          });
        } else {
          eventLogger.warn("Firebase no configurado - funcionando en modo demo");
        }
        
        setEvents([]); // Limpia eventos en caso de error  
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [userId, toast]); // Dependencias actualizadas

  const filteredEvents = useMemo(() => {
    if (!filterTerm.trim()) {
      return events;
    }
    const searchTerm = normalizeSearchText(filterTerm);
    return events.filter(event => {
      const title = normalizeSearchText(event.name);
      const description = event.description ? normalizeSearchText(event.description) : '';
      const location = event.location ? normalizeSearchText(event.location) : '';
      
      return title.includes(searchTerm) ||
             description.includes(searchTerm) ||
             location.includes(searchTerm);
    });
  }, [events, filterTerm]);

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
   * Handler para editar un evento (modal de edición)
   */
  const handleEditEvent = (event: EventType) => {
    setSelectedEvent(event);
    setIsEditModalOpen(true);
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
  const handleConfirmDelete = async (event: EventType) => {
    try {
      setIsDeleting(true);

      // Solo eventos de tipo Proyecto tienen servicio de eliminación
      if (event.type === 'Proyecto') {
        await deleteProjectEvent(event.id, db);

        // Actualizar lista local
        setEvents(prev => prev.filter(e => e.id !== event.id));

        toast({
          title: "Evento eliminado",
          description: `El evento "${event.name}" ha sido eliminado correctamente.`,
        });
      } else {
        toast({
          title: "No disponible",
          description: "La eliminación de este tipo de evento aún no está implementada.",
          variant: "destructive"
        });
      }

      // Cerrar dialog
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      eventLogger.error('Error al eliminar evento', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Legacy handler - redirige a handleViewEvent
  const handleEventClick = (event: EventType) => {
    handleViewEvent(event);
  };

  const handleEventResize = async (eventId: string, newStartDate: Date, newEndDate: Date) => {
    // Deshabilitar redimensionado para eventos de proyecto
    // Los eventos de proyecto deben editarse desde su interfaz específica
    toast({
      title: "Edición no disponible",
      description: "Los eventos de proyecto deben editarse desde su interfaz específica.",
      variant: "destructive"
    });
  };

  /**
   * Handler para mover eventos mediante drag & drop
   * Actualiza el evento en Firebase y en el estado local
   */
  const handleEventDrop = async (eventId: string, newStartDate: Date, newEndDate: Date) => {
    try {
      // Buscar el evento a actualizar
      const eventToUpdate = events.find(e => e.id === eventId);
      if (!eventToUpdate) {
        eventLogger.warn('Evento no encontrado para actualizar', { eventId });
        return;
      }

      // Calcular duración original del evento
      const duration = eventToUpdate.endDate.getTime() - eventToUpdate.startDate.getTime();

      // Ajustar fecha de fin manteniendo la duración
      const adjustedEndDate = new Date(newStartDate.getTime() + duration);

      eventLogger.info('Moviendo evento', {
        eventId,
        oldStart: eventToUpdate.startDate,
        newStart: newStartDate,
        duration
      });

      // Actualizar en Firebase (solo eventos de tipo Proyecto)
      if (eventToUpdate.type === 'Proyecto') {
        await updateProjectEvent(eventId, {
          eventDate: newStartDate  // ProjectEventType usa eventDate, no startDate
        }, db);
      }

      // Actualizar estado local inmediatamente para mejor UX
      setEvents(prev => prev.map(e =>
        e.id === eventId
          ? { ...e, startDate: newStartDate, endDate: adjustedEndDate }
          : e
      ));

      // ✅ No mostrar toast para drag & drop - el feedback visual es suficiente
      // Solo logueamos para debugging
      eventLogger.info('Evento movido exitosamente', {
        eventId,
        newStart: newStartDate,
        newEnd: adjustedEndDate
      });

    } catch (error) {
      eventLogger.error('Error al mover evento', error);
      toast({
        title: "Error al mover evento",
        description: "No se pudo actualizar el evento. Intenta nuevamente.",
        variant: "destructive"
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Función para refrescar eventos del calendario
  const refreshCalendarEvents = async () => {

    try {
      setIsLoadingEvents(true);
      const fetchedEvents = await getAllCalendarEvents(db, userId);

      setEvents(fetchedEvents);
    } catch (error) {

      toast({ 
        title: "Error", 
        description: "No se pudieron refrescar los eventos.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleModalSave = async (eventToSave: Omit<EventType, 'id'> & { id?: string }) => {
    // Solo permitir visualización, no edición
    // Los eventos de proyecto deben editarse desde su interfaz específica
    toast({ 
      title: "Edición no disponible", 
      description: "Los eventos de proyecto deben editarse desde su interfaz específica.", 
      variant: "destructive" 
    });
    handleModalClose();
  };

  const handleModalDelete = async (eventId: string) => {
    // Solo permitir visualización, no eliminación
    // Los eventos de proyecto deben editarse desde su interfaz específica
    toast({ 
      title: "Eliminación no disponible", 
      description: "Los eventos de proyecto deben eliminarse desde su interfaz específica.", 
      variant: "destructive" 
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
        onEventEdit={handleEditEvent}
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
          onEdit={handleEditEvent}
        />
      )}

      {/* Modal de edición */}
      {isEditModalOpen && (
        <EventModal
          isOpen={isEditModalOpen}
          eventData={selectedEvent}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleModalSave}
          onDelete={selectedEvent && 'id' in selectedEvent ? handleModalDelete : undefined}
          preSelectedType={selectedEvent?.type as 'Proyecto' | 'Postventa' | 'Visita' | undefined}
          onEventCreated={refreshCalendarEvents}
        />
      )}

      {/* Dialog de confirmación de eliminación */}
      {isDeleteDialogOpen && selectedEvent && 'id' in selectedEvent && (
        <EventDeleteDialog
          event={selectedEvent}
          isOpen={isDeleteDialogOpen}
          isDeleting={isDeleting}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedEvent(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Legacy modal - mantener por compatibilidad */}
      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          eventData={selectedEvent}
          onClose={handleModalClose}
          onSave={handleModalSave}
          onDelete={selectedEvent && 'id' in selectedEvent ? handleModalDelete : undefined}
          preSelectedType={selectedEvent?.type as 'Proyecto' | 'Postventa' | 'Visita' | undefined}
          onEventCreated={refreshCalendarEvents}
        />
      )}
    </AppLayout>
  );
}
