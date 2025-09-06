'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { VisitForm, type VisitFormValues } from '@/components/forms/VisitForm';
import { addVisit, type VisitStatus } from '@/services/visitService';
import { useToast } from '@/components/ui/use-toast';
import { ModalLayout } from '@/components/modals/modalLayout';

export function NewVisitDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const formRef = React.useRef<HTMLFormElement>(null);

  // Mutación para crear una nueva visita
  const createVisitMutation = useMutation({
    mutationFn: async (data: VisitFormValues) => {
      const visitData = {
        name: data.name,
        phone: data.phone,
        status: data.status as VisitStatus,
        scheduledDate: data.scheduledDate,
        notes: data.observations,
        // Campos de dirección
        ...(data.fullAddress && {
          fullAddress: {
            textoCompleto: data.fullAddress.textoCompleto || '',
            coordenadas: data.fullAddress.coordenadas || { latitude: 0, longitude: 0 },
            componentes: data.fullAddress.componentes || {},
          },
          address: data.fullAddress.textoCompleto || '',
          municipality: data.fullAddress.componentes?.comuna || '',
        }),
        // Campos de compatibilidad
        ...(data.address && { address: data.address }),
        ...(data.municipality && { municipality: data.municipality }),
      };
      
      return await addVisit(visitData);
    },
    onSuccess: (newVisit) => {
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      
      toast({
        title: 'Visita Creada',
        description: `La visita para ${newVisit.name} ha sido creada exitosamente.`,
      });
      
      setIsOpen(false); // Cerrar el diálogo después de crear la visita
      router.refresh(); // Refrescar la página para mostrar la nueva visita
    },
    onError: (error: Error) => {
      console.error('Error al crear la visita:', error);
      toast({
        title: 'Error al Crear Visita',
        description: error.message || 'No se pudo crear la visita.',
        variant: 'destructive',
      });
    },
  });

  // Manejador de envío del formulario
  const handleFormSubmit = async (formData: VisitFormValues) => {
    try {
      await createVisitMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error al crear la visita:', error);
    }
  };

  return (
    <>
      <Button 
        variant="default" 
        size="sm" 
        className="h-8 gap-1"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
          Nueva Visita
        </span>
      </Button>

      <ModalLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nueva Visita"
        showDefaultButtons={true}
        formRef={formRef}
        isSubmitting={createVisitMutation.isPending}
        submitButtonText="Crear Visita"
        className="w-full max-w-lg"
      >
        <div className="space-y-4 py-2">
          <VisitForm
            formRef={formRef}
            onSubmit={handleFormSubmit}
            hideButtons={true}
            isSubmitting={createVisitMutation.isPending}
          />
        </div>
      </ModalLayout>
    </>
  );
}
