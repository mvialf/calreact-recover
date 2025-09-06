'use client';

import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VisitForm, VisitFormValues } from '@/components/forms/VisitForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { updateVisit } from '@/services/visitService';
import type { Visit, VisitStatus } from '@/types/visit';
import { DEFAULT_VISIT_STATUS } from '@/types/visit';
import { DialogErrorBoundary } from '@/components/error-boundary/DialogErrorBoundary';
import { visitLogger } from '@/lib/logger';

interface EditVisitDialogProps {
  visit: Visit;
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function EditVisitDialog({ visit, children, onSuccess }: EditVisitDialogProps) {
  // 🔥 TODOS LOS HOOKS AL INICIO - ANTES DE CUALQUIER EARLY RETURN
  
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Hook useMutation siempre debe ejecutarse
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: VisitFormValues) => {
      if (!visit?.id) {
        throw new Error('ID de visita requerido para actualización');
      }
      
      try {
        // Preparar datos para actualización
        const updateData = {
          name: data.name,
          phone: data.phone,
          status: data.status as VisitStatus,
          address: data.fullAddress?.textoCompleto || data.address || '',
          municipality: data.fullAddress?.componentes?.comuna || data.municipality || '',
          observations: data.observations || '',
        };
        
        await updateVisit(visit.id, updateData);
        return updateData;
      } catch (error) {
        visitLogger.error('Error en mutationFn', error);
        throw error;
      }
    },
    onSuccess: () => {
      try {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['visits'] });
        if (visit?.id) {
          queryClient.invalidateQueries({ queryKey: ['visits', visit.id] });
        }
        
        toast({ 
          title: 'Éxito', 
          description: 'Visita actualizada correctamente.',
          variant: 'default'
        });
        setIsOpen(false);
        onSuccess?.();
      } catch (error) {
        visitLogger.error('Error en onSuccess', error);
      }
    },
    onError: (error) => {
      visitLogger.error('Error en mutación updateVisit', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({ 
        title: 'Error al actualizar visita', 
        description: `Hubo un problema al actualizar la visita: ${errorMessage}`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = React.useCallback((data: VisitFormValues) => {
    try {
      mutate(data);
    } catch (error) {
      visitLogger.error('Error en handleSubmit', error);
      toast({ 
        title: 'Error', 
        description: 'Error inesperado al procesar el formulario',
        variant: 'destructive',
      });
    }
  }, [mutate, toast]);

  // Mapeo defensivo para asegurar que ningún campo controlado reciba null o undefined
  const initialData: Partial<VisitFormValues> = React.useMemo(() => {
    try {
      if (!visit) {
        return {
          name: '',
          phone: '',
          status: DEFAULT_VISIT_STATUS,
          scheduledDate: new Date(),
          observations: '',
          address: '',
          municipality: '',
          fullAddress: {
            textoCompleto: '',
            placeId: '',
            coordenadas: { latitude: 0, longitude: 0 },
            componentes: {
              calle: '',
              numero: '',
              comuna: '',
              ciudad: '',
              region: '',
              pais: '',
              codigoPostal: '',
            },
          },
        };
      }
      
      // Si ya tenemos una estructura fullAddress en la visita, la usamos directamente
      if (visit.fullAddress) {
        return {
          name: visit.name || '',
          phone: visit.phone || '',
          status: visit.status || DEFAULT_VISIT_STATUS,
          scheduledDate: visit.scheduledDate ? new Date(visit.scheduledDate) : new Date(),
          observations: visit.observations || '',
          address: visit.fullAddress.textoCompleto || '',
          municipality: visit.fullAddress.componentes?.comuna || '',
          fullAddress: {
            ...visit.fullAddress,
            placeId: visit.fullAddress.placeId || '',
            textoCompleto: visit.fullAddress.textoCompleto || '',
            // Asegurarse de que las coordenadas existan
            coordenadas: visit.fullAddress.coordenadas || { latitude: 0, longitude: 0 },
            // Asegurarse de que los componentes existan
            componentes: {
              calle: visit.fullAddress.componentes?.calle || '',
              numero: visit.fullAddress.componentes?.numero || '',
              comuna: visit.fullAddress.componentes?.comuna || '',
              ciudad: visit.fullAddress.componentes?.ciudad || '',
              region: visit.fullAddress.componentes?.region || '',
              pais: visit.fullAddress.componentes?.pais || 'Chile',
              codigoPostal: visit.fullAddress.componentes?.codigoPostal || '',
            },
          },
        };
      }
      
      // Si no hay fullAddress, construirlo desde los campos básicos
      return {
        name: visit.name || '',
        phone: visit.phone || '',
        status: visit.status || DEFAULT_VISIT_STATUS,
        scheduledDate: visit.scheduledDate ? new Date(visit.scheduledDate) : new Date(),
        observations: visit.observations || '',
        // Mantener compatibilidad con campos de dirección
        address: visit.address || '',
        municipality: visit.municipality || '',
        // Estructura de fullAddress para el AddressInput
        fullAddress: {
          textoCompleto: visit.address || '',
          placeId: visit.placeId || '',
          coordenadas: visit.coordinates || { latitude: 0, longitude: 0 },
          componentes: {
            calle: '',
            numero: '',
            comuna: visit.municipality || '',
            ciudad: '',
            region: '',
            pais: 'Chile',
            codigoPostal: '',
          },
        },
      };
    } catch (error) {
      visitLogger.error('Error al mapear datos iniciales', error);
      // Retornar datos por defecto seguros
      return {
        name: '',
        phone: '',
        status: DEFAULT_VISIT_STATUS,
        scheduledDate: new Date(),
        observations: '',
        address: '',
        municipality: '',
        fullAddress: {
          textoCompleto: '',
          placeId: '',
          coordenadas: { latitude: 0, longitude: 0 },
          componentes: {
            calle: '',
            numero: '',
            comuna: '',
            ciudad: '',
            region: '',
            pais: '',
            codigoPostal: '',
          },
        },
      };
    }
  }, [visit]);

  const handleClose = React.useCallback(() => {
    try {
      setIsOpen(false);
    } catch (error) {
      visitLogger.error('Error al cerrar modal', error);
    }
  }, []);

  const handleOpen = React.useCallback(() => {
    try {
      setIsOpen(true);
    } catch (error) {
      visitLogger.error('Error al abrir modal', error);
    }
  }, []);

  // 🔥 AHORA SÍ SE PUEDEN HACER EARLY RETURNS
  
  // Validación defensiva de la visita
  if (!visit) {
    visitLogger.error('EditVisitDialog: visita es undefined o null');
    return null;
  }
  
  // Asegurarse de que la visita tenga un ID
  const visitWithId = visit as Visit & { id: string };
  if (!visitWithId.id) {
    visitLogger.error('EditVisitDialog: la visita no tiene un ID válido', { visit });
    return null;
  }

  return (
    <DialogErrorBoundary
      onError={(error, errorInfo) => {
        visitLogger.error('Error en EditVisitDialog', { error, errorInfo });
        toast({
          title: 'Error inesperado',
          description: 'Ha ocurrido un error al cargar el diálogo. Por favor, recarga la página.',
          variant: 'destructive',
        });
      }}
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild onClick={handleOpen}>
          {children}
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Visita</DialogTitle>
            <DialogDescription>
              Modifica los detalles de la visita programada.
            </DialogDescription>
          </DialogHeader>
          
          <VisitForm
            onSubmit={handleSubmit}
            initialData={initialData}
            isSubmitting={isPending}
          />
        </DialogContent>
      </Dialog>
    </DialogErrorBoundary>
  );
}