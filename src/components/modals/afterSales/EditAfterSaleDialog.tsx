'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AfterSaleForm, AfterSaleFormValues } from '@/components/forms/AfterSaleForm';
import { FormModal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/use-toast';
import { updateAfterSales } from '@/services/afterSalesService';
import type { AfterSales } from '@/types/afterSales';
import { DialogErrorBoundary } from '@/components/error-boundary/DialogErrorBoundary';
import { afterSalesLogger } from '@/lib/logger';

interface EditAfterSaleDialogProps {
  afterSale: AfterSales;
  children: React.ReactNode;
}

export function EditAfterSaleDialog({ afterSale, children }: EditAfterSaleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutación simplificada para actualizar postventa
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: AfterSaleFormValues) => {
      if (!afterSale?.id) {
        throw new Error('ID de postventa requerido para actualización');
      }

      const updateData = {
        projectId: data.projectId,
        description: data.description,
        entryDate: data.date,
        phone: data.phone,
        address: data.address,
        tasks: data.tasks,
      };

      await updateAfterSales(afterSale.id, updateData);
      return updateData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['afterSales'] });
      if (afterSale?.id) {
        queryClient.invalidateQueries({ queryKey: ['afterSales', afterSale.id] });
        queryClient.invalidateQueries({ queryKey: ['afterSalesForProject', afterSale.projectId] });
      }
      setIsOpen(false);
    },
    onError: (error) => {
      afterSalesLogger.error('Error al actualizar postventa', error);
      throw error; // Re-throw para que FormModal maneje el error
    },
  });

  // Manejador simplificado de envío del formulario
  const handleFormSubmit = async (data: AfterSaleFormValues) => {
    try {
      await mutate(data);
    } catch (error) {
      afterSalesLogger.error('Error al enviar formulario', error);
      throw error; // Re-throw para FormModal
    }
  };

  // Mapeo simplificado de datos iniciales
  const initialData: Partial<AfterSaleFormValues> = React.useMemo(() => {
    if (!afterSale) return {};

    return {
      projectId: afterSale.projectId || '',
      description: afterSale.description || '',
      date: afterSale.entryDate ? new Date(afterSale.entryDate) : new Date(),
      phone: (afterSale as any)?.phone || '',
      address: (afterSale as any)?.address || null,
      tasks: Array.isArray(afterSale.tasks) ? afterSale.tasks.map(task => ({
        id: task.id || crypto.randomUUID(),
        description: task.description || '',
        isCompleted: Boolean(task.isCompleted),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
      })) : [],
    };
  }, [afterSale]);

  // Callbacks para manejo del modal
  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);

  // Callbacks para FormModal
  const handleSuccess = (data: AfterSaleFormValues) => {
    afterSalesLogger.info('Postventa actualizada exitosamente', {
      afterSaleId: afterSale.id,
      description: data.description
    });
  };

  const handleError = (error: Error) => {
    afterSalesLogger.error('Error en EditAfterSaleDialog', error);
  };

  // Validación defensiva de la postventa
  if (!afterSale || !afterSale.id) {
    afterSalesLogger.error('EditAfterSaleDialog: postventa inválida o sin ID', { afterSale });
    return null;
  }

  return (
    <DialogErrorBoundary
      onError={(error, errorInfo) => {
        afterSalesLogger.error('Error en EditAfterSaleDialog', { error, errorInfo });
        toast({
          title: 'Error inesperado',
          description: 'Ha ocurrido un error al cargar el diálogo. Por favor, recarga la página.',
          variant: 'destructive',
        });
      }}
    >
      {/* Trigger Button */}
      <div onClick={handleOpen}>
        {children}
      </div>

      {/* Modal con nuevo sistema FormModal */}
      <FormModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Editar Postventa"
        size="xl"
        formId="edit-aftersale-form"
        onSubmit={handleFormSubmit}
        submitText={isPending ? "Actualizando..." : "Actualizar Postventa"}
        cancelText="Cancelar"
        showCancel={true}
        description="Modifique la información de la postventa"
        scrollable={true}
        onSuccess={handleSuccess}
        onError={handleError}
        preventCloseOnSubmit={false}
        resetOnClose={false}
      >
        {/* Formulario con datos iniciales */}
        <AfterSaleForm
          onSubmit={handleFormSubmit}
          initialData={initialData}
          isSubmitting={isPending}
          hideButtons={true} // Los botones los maneja FormModal
        />
      </FormModal>
    </DialogErrorBoundary>
  );
}