'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormModal } from '@/components/ui/modal';
import { VisitForm, type VisitFormValues } from '@/components/forms/VisitForm';
import { addVisit, type VisitStatus } from '@/services/visitService';
import { useToast } from '@/components/ui/use-toast';
import { visitLogger } from '@/lib/logger';

export function NewVisitDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutación simplificada para crear nueva visita
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
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      setIsOpen(false);
      router.refresh();
    },
    onError: (error: Error) => {
      visitLogger.error('Error al crear la visita', error);
      throw error; // Re-throw para que FormModal maneje el error
    },
  });

  // Manejador simplificado de envío del formulario
  const handleFormSubmit = async (formData: VisitFormValues) => {
    try {
      await createVisitMutation.mutateAsync(formData);
    } catch (error) {
      visitLogger.error('Error al enviar formulario', error);
      throw error; // Re-throw para FormModal
    }
  };

  // Callbacks para FormModal
  const handleSuccess = (data: VisitFormValues) => {
    visitLogger.info('Visita creada exitosamente', {
      name: data.name,
      scheduledDate: data.scheduledDate
    });
  };

  const handleError = (error: Error) => {
    visitLogger.error('Error en NewVisitDialog', error);
  };

  return (
    <>
      {/* Trigger Button */}
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

      {/* Modal con nuevo sistema FormModal */}
      <FormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nueva Visita"
        size="xl"
        formId="new-visit-form"
        onSubmit={handleFormSubmit}
        submitText={createVisitMutation.isPending ? "Creando..." : "Crear Visita"}
        cancelText="Cancelar"
        showCancel={true}
        description="Complete la información para crear una nueva visita"
        scrollable={true}
        onSuccess={handleSuccess}
        onError={handleError}
        preventCloseOnSubmit={false}
        resetOnClose={true}
      >
        {/* Formulario para modal */}
        <VisitForm
          onSubmit={handleFormSubmit}
          isSubmitting={createVisitMutation.isPending}
          hideButtons={true} // Los botones los maneja FormModal
        />
      </FormModal>
    </>
  );
}
