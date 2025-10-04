import { useQuery } from '@tanstack/react-query';
import { getAllCalendarEvents } from '@/services/calendarEventService';
import { db } from '@/lib/firebase/client';
import type { EventType } from '@/types/event';

export const useCalendarEvents = (userId: string) => {
  const {
    data: events = [],
    isLoading,
    isError,
    error
  } = useQuery<EventType[], Error>({
    queryKey: ['calendar-events', userId],
    queryFn: () => getAllCalendarEvents(db, userId),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    enabled: !!userId, // Solo ejecutar si userId está disponible
  });

  return { events, isLoading, isError, error };
};
