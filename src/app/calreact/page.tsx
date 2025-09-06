"use client";

import { useState, useEffect, useMemo } from 'react';
import type { EventType, ViewOption } from '@/types/event';
import { CalendarView } from '@/components/calendar/calendar-view';
import { EventModal } from '@/components/calendar/event-modal';
import { CalendarToolbar } from '@/components/calendar/calendar-toolbar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FolderOpen,
  CalendarDays,
  Settings,
  Users,
  DollarSign,
  LayoutDashboard,
  Wrench,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeaderNav } from '@/components/ui/headernav';
import { db } from '@/lib/firebase/client'; // Importar la instancia db configurada
import { getAllCalendarEvents } from '@/services/calendarEventService';
import { updateProjectEvent } from '@/services/projectEventService';
import { useToast } from '@/components/ui/use-toast';
import { normalizeSearchText } from '@/utils/search-utils';
import { startOfDay, endOfDay, isSameDay, parseISO } from '@/lib/calendar-utils';
import { eventLogger } from '@/lib/logger';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';

const navItems = [
  { 
    href: '/dashboard', 
    icon: LayoutDashboard, 
    label: 'Panel Principal', 
    altPaths: ['/'] 
  },
  { 
    href: '/projects', 
    icon: FolderOpen, 
    label: 'Proyectos' 
  },
  { 
    href: '/calreact', 
    icon: CalendarDays, 
    label: 'Calendario' 
  },
  { 
    href: '/aftersales', 
    icon: Wrench, 
    label: 'Postventas' 
  },
  { 
    href: '/visits', 
    icon: Home, 
    label: 'Visitas' 
  },
  { 
    href: '/payments', 
    icon: DollarSign, 
    label: 'Pagos' 
  },
  { 
    href: '/clients', 
    icon: Users, 
    label: 'Clientes' 
  },
  { 
    href: '/settings', 
    icon: Settings, 
    label: 'Configuración' 
  },
];

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
      <div className="h-10 sm:w-[120px] w-full bg-muted/70 rounded-md"></div> {/* View Select */}
      <div className="h-10 sm:w-32 w-full bg-muted/70 rounded-md"></div> {/* Add Event */}
    </div>
  </div>
);

const CalendarViewSkeleton = () => (
  <div className="flex-grow overflow-auto p-0 sm:p-2 md:p-4 animate-pulse">
    <div className="h-full w-full bg-muted/70 rounded-lg"></div> {/* Calendar area */}
  </div>
);

export default function CalReactAppPage() {
  const pathname = usePathname();
  // NOTA: En producción, reemplazar con sistema de autenticación real
  // Ej: const userId = useAuth().currentUser?.uid || "anonymous";
  const userId = "mockUserId"; // Placeholder para desarrollo

  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined); // Se inicializará en useEffect
  const [isClient, setIsClient] = useState(false);
  const [events, setEvents] = useState<EventType[]>([]);
  const [currentView, setCurrentView] = useState<ViewOption>('week');
  const [filterTerm, setFilterTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | Partial<Omit<EventType, 'id'>> | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // Efecto para inicialización del cliente y fecha actual (solo se ejecuta una vez)
  useEffect(() => {
    setIsClient(true);
    setCurrentDate(new Date());
  }, []);

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
    setCurrentDate(new Date());
  };

  const handleViewChange = (newView: ViewOption) => {
    setCurrentView(newView);
  };

  const handleFilterChange = (term: string) => {
    setFilterTerm(term);
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

  const handleEventClick = (event: EventType) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Verificar si se soltó sobre un área válida y no es el mismo elemento
    if (!over || !over.data.current || active.id === over.id) {
      return;
    }

    // Obtener el evento directamente de los datos del elemento arrastrado
    const draggedEventData = active.data.current?.event;
    if (!draggedEventData) {
      eventLogger.error("No se encontraron datos del evento arrastrado", { activeId: active.id });
      return;
    }

    // Reconstruir el evento original con los datos del arrastre
    const originalEvent: EventType = {
      ...draggedEventData,
      startDate: new Date(draggedEventData.startDate),
      endDate: new Date(draggedEventData.endDate),
      name: draggedEventData.name || 'Sin título',
      description: draggedEventData.description || '',
      color: draggedEventData.color || 'hsl(var(--primary))',
    };

    // Verificar si se soltó sobre una celda de día
    if (over.data.current.accepts?.includes('event')) {
      const droppedOnDate = over.data.current.date as Date;
      
      if (!(droppedOnDate instanceof Date) || isNaN(droppedOnDate.getTime())) {
        eventLogger.error("Fecha de destino inválida", { droppedOnDate });
        return;
      }
      
      // Calcular la diferencia en días entre la fecha original y la nueva fecha
      const dayDiff = Math.floor((droppedOnDate.getTime() - originalEvent.startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Crear nuevas fechas manteniendo la hora original
      const newStartDate = new Date(originalEvent.startDate);
      newStartDate.setDate(newStartDate.getDate() + dayDiff);
      
      const newEndDate = new Date(originalEvent.endDate);
      newEndDate.setDate(newEndDate.getDate() + dayDiff);
      
      // Verificar que las fechas resultantes sean válidas
      if (isNaN(newStartDate.getTime()) || isNaN(newEndDate.getTime())) {
        eventLogger.error("Fechas resultantes inválidas", { newStartDate, newEndDate });
        return;
      }
      
      const eventIdToUpdate = active.id as string;

      try {
        // Detectar si es un evento de proyecto por el tipo o referenceId
        const isProjectEvent = originalEvent.type === 'Proyecto' || originalEvent.referenceId;
        
        if (isProjectEvent && originalEvent.referenceId) {
          // Usar API de ProjectEvents para actualizar

          
          await updateProjectEvent(eventIdToUpdate, {
            eventDate: newStartDate
          }, db);
          
          // Refrescar eventos del calendario
          await refreshCalendarEvents();
          
          toast({ 
            title: "Evento de Proyecto Actualizado", 
            description: `El evento se ha movido al ${newStartDate.toLocaleDateString()}.` 
          });
        } else {
          // Para eventos genéricos (futuros), mostrar mensaje
          toast({ 
            title: "Función no disponible", 
            description: "Solo los eventos de proyecto pueden moverse en el calendario.", 
            variant: "destructive" 
          });
        }
      } catch (error) {
        eventLogger.error("Error al actualizar evento (drag and drop)", error);
        toast({ 
          title: "Error al Actualizar", 
          description: "No se pudo cambiar la fecha del evento.", 
          variant: "destructive" 
        });
      }
    }
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
      <div className="flex flex-col h-screen bg-background text-foreground p-0 sm:p-4">
        <header className="p-4 text-center sm:text-left flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">CalReact</h1>
              <p className="text-muted-foreground">Aplicación de Calendario Avanzada</p>
            </div>
        </header>
        <main className="flex-grow flex flex-col overflow-hidden p-0 sm:p-4 rounded-lg shadow-2xl bg-card">
          <ToolbarSkeleton />
          <CalendarViewSkeleton />
        </main>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-background text-foreground p-0 sm:p-4">
        <header className="p-4 text-center sm:text-left flex items-center gap-4">
          
          <h1 className="text-3xl font-bold text-primary">CalReact</h1>
        </header>
        
        <main className="flex-grow  overflow-hidden p-2 sm:p-4 rounded-lg shadow-2xl bg-background">
          <CalendarToolbar 
            currentDate={currentDate}
            currentView={currentView}
            filterTerm={filterTerm}
            onDateChange={handleDateChange}
            onViewChange={handleViewChange}
            onFilterChange={handleFilterChange}
            onAddEvent={handleAddEventClick}
            onToday={handleToday}
          />
          <div className="flex-grow overflow-auto p-0 sm:p-2 md:p-4">
            <CalendarView
              currentDate={currentDate}
              events={filteredEvents}
              currentView={currentView}
              onEventClick={handleEventClick}
              onEventResize={handleEventResize}
              enableDragAndDrop={true} 
              enableResizing={true} 
              weekStartsOn={1} 
            />
          </div>
        </main>

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
      </div>
    </DndContext>
  );
}
