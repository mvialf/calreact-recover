'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AfterSaleForm, type AfterSaleFormValues } from '@/components/forms/AfterSaleForm';
import { addAfterSales } from '@/services/afterSalesService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { afterSalesLogger } from '@/lib/logger';

export function NewAfterSaleDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

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
      // IMPORTANTE: Cerrar dialog ANTES de invalidar queries para evitar race condition
      // que deja pointer-events: none en el body (bug conocido de Radix UI Dialog)
      // Referencias: https://github.com/radix-ui/primitives/issues/1241
      setIsOpen(false);

      // Workaround: Esperar a que Radix UI complete el cleanup del dialog
      setTimeout(() => {
        document.body.style.removeProperty('pointer-events');

        // Invalidar las queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['after-sales'] });
        queryClient.invalidateQueries({ queryKey: ['aftersales'] });

        toast.success('Postventa creada', {
          description: 'La postventa ha sido creada exitosamente.',
        });

        router.refresh(); // Refrescar la página para mostrar la nueva postventa
      }, 100);
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
          <DialogHeader>
            <DialogTitle>Nueva Postventa</DialogTitle>
            <DialogDescription className="sr-only">
              Formulario para crear una nueva postventa
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4">
            <AfterSaleForm
              formId="new-aftersale-form"
              onSubmit={handleFormSubmit}
              showDefaultButtons={false}
              isSubmitting={createAfterSaleMutation.isPending}
            />
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createAfterSaleMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="new-aftersale-form"
              disabled={createAfterSaleMutation.isPending}
            >
              {createAfterSaleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando
                </>
              ) : (
                'Crear Postventa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
