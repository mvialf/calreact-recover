'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AfterSaleForm, type AfterSaleFormValues } from '@/components/forms/AfterSaleForm';
import { addAfterSales } from '@/services/afterSalesService';
import { toast } from 'sonner';
import { ModalLayout } from '@/components/modals/modalLayout';
import { afterSalesLogger } from '@/lib/logger';

export function NewAfterSaleDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const formRef = React.useRef<HTMLFormElement>(null);

  // Mutación para crear una nueva postventa
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
      // Invalidar las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['after-sales'] });
      queryClient.invalidateQueries({ queryKey: ['aftersales'] });
      
      toast.success('Postventa creada', {
        description: 'La postventa ha sido creada exitosamente.',
      });
      
      setIsOpen(false); // Cerrar el diálogo después de crear la postventa
      router.refresh(); // Refrescar la página para mostrar la nueva postventa
    },
    onError: (error: Error) => {
      afterSalesLogger.error('Error al crear la postventa', error);
      toast.error('Error al crear postventa', {
        description: error.message || 'No se pudo crear la postventa.',
      });
    },
  });

  // Manejador de envío del formulario
  const handleFormSubmit = async (formData: AfterSaleFormValues) => {
    try {
      await createAfterSaleMutation.mutateAsync(formData);
    } catch (error) {
      afterSalesLogger.error('Error al crear la postventa', error);
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
          Nueva Postventa
        </span>
      </Button>

      <ModalLayout
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Nueva Postventa"
        showDefaultButtons={true}
        formRef={formRef}
        isSubmitting={createAfterSaleMutation.isPending}
        submitButtonText="Crear Postventa"
        className="w-full max-w-xl"
      >
        <div className="space-y-4 py-2">
          <AfterSaleForm
            formRef={formRef}
            onSubmit={handleFormSubmit}
            showDefaultButtons={false}
            isSubmitting={createAfterSaleMutation.isPending}
          />
        </div>
      </ModalLayout>
    </>
  );
}
