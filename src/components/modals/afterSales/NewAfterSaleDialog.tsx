'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormModal } from '@/components/ui/modal';
import { AfterSaleForm, type AfterSaleFormValues } from '@/components/forms/AfterSaleForm';
import { addAfterSales } from '@/services/afterSalesService';
import { useToast } from '@/components/ui/use-toast';
import { afterSalesLogger } from '@/lib/logger';

export function NewAfterSaleDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutación simplificada para crear nueva postventa
  const createAfterSaleMutation = useMutation({
    mutationFn: async (data: AfterSaleFormValues) => {
      const afterSalesData = {
        projectId: data.projectId,
        description: data.description,
        entryDate: data.date,
        phone: data.phone,
        address: data.address,
        afterSalesStatus: 'Ingresada' as const,
        tasks: data.tasks.map(task => ({
          id: task.id,
          description: task.description,
          isCompleted: task.isCompleted,
          createdAt: task.createdAt || new Date(),
          completedAt: task.isCompleted ? (task.completedAt || new Date()) : undefined
        }))
      };
      return await addAfterSales(afterSalesData);
    },
    onSuccess: (newAfterSale) => {
      queryClient.invalidateQueries({ queryKey: ['after-sales'] });
      queryClient.invalidateQueries({ queryKey: ['aftersales'] });
      setIsOpen(false);
      router.refresh();
    },
    onError: (error: Error) => {
      afterSalesLogger.error('Error al crear la postventa', error);
      throw error; // Re-throw para que FormModal maneje el error
    },
  });

  // Manejador simplificado de envío del formulario
  const handleFormSubmit = async (formData: AfterSaleFormValues) => {
    try {
      await createAfterSaleMutation.mutateAsync(formData);
    } catch (error) {
      afterSalesLogger.error('Error al enviar formulario', error);
      throw error; // Re-throw para FormModal
    }
  };

  // Callbacks para FormModal
  const handleSuccess = (data: AfterSaleFormValues) => {
    afterSalesLogger.info('Postventa creada exitosamente', {
      projectId: data.projectId,
      description: data.description
    });
  };

  const handleError = (error: Error) => {
    afterSalesLogger.error('Error en NewAfterSaleDialog', error);
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
          Nueva Postventa
        </span>
      </Button>

      {/* Modal con nuevo sistema FormModal */}
      <FormModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nueva Postventa"
        size="xl"
        formId="new-aftersale-form"
        onSubmit={handleFormSubmit}
        submitText={createAfterSaleMutation.isPending ? "Creando..." : "Crear Postventa"}
        cancelText="Cancelar"
        showCancel={true}
        description="Complete la información para crear una nueva postventa"
        scrollable={true}
        onSuccess={handleSuccess}
        onError={handleError}
        preventCloseOnSubmit={false}
        resetOnClose={true}
      >
        {/* Formulario para modal */}
        <AfterSaleForm
          onSubmit={handleFormSubmit}
          isSubmitting={createAfterSaleMutation.isPending}
          hideButtons={true} // Los botones los maneja FormModal
        />
      </FormModal>
    </>
  );
}
