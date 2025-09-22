'use client';

import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AfterSaleForm, AfterSaleFormValues } from '@/components/forms/AfterSaleForm';
import { Button } from '@/components/ui/button';
import { ModalLayout } from '@/components/modals/modalLayout';
import { useToast } from '@/components/ui/use-toast';
import { updateAfterSales } from '@/services/afterSalesService';
import type { AfterSales } from '@/types/afterSales';
import { DialogErrorBoundary } from '@/components/error-boundary/DialogErrorBoundary';

interface EditAfterSaleDialogProps {
  afterSale: AfterSales;
  children: React.ReactNode;
}

export function EditAfterSaleDialog({ afterSale, children }: EditAfterSaleDialogProps) {
  // 🔥 TODOS LOS HOOKS AL INICIO - ANTES DE CUALQUIER EARLY RETURN
  
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  // Hook useMutation siempre debe ejecutarse
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: AfterSaleFormValues) => {
      if (!afterSale?.id) {
        throw new Error('ID de postventa requerido para actualización');
      }
      
      try {
        // Preparar datos para actualización
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
      } catch (error) {

        throw error;
      }
    },
    onSuccess: () => {
      try {
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['afterSales'] });
        if (afterSale?.id) {
          queryClient.invalidateQueries({ queryKey: ['afterSales', afterSale.id] });
          queryClient.invalidateQueries({ queryKey: ['afterSalesForProject', afterSale.projectId] });
        }
        
        toast({ 
          title: 'Éxito', 
          description: 'Postventa actualizada correctamente.',
          variant: 'default'
        });
        setIsOpen(false);
      } catch (error) {

      }
    },
    onError: (error) => {

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({ 
        title: 'Error al actualizar postventa', 
        description: `Hubo un problema al actualizar la postventa: ${errorMessage}`,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = React.useCallback((data: AfterSaleFormValues) => {
    try {

      mutate(data);
    } catch (error) {

      toast({ 
        title: 'Error', 
        description: 'Error inesperado al procesar el formulario',
        variant: 'destructive',
      });
    }
  }, [mutate, toast]);

  // Mapeo defensivo para asegurar que ningún campo controlado reciba null o undefined
  const initialData: Partial<AfterSaleFormValues> = React.useMemo(() => {
    try {
      if (!afterSale) {
        return {
          projectId: '',
          description: '',
          date: new Date(),
          phone: '',
          address: null,
          tasks: [],
        };
      }
      
      return {
        projectId: afterSale.projectId || '',
        description: afterSale.description || '',
        date: afterSale.entryDate ? new Date(afterSale.entryDate) : new Date(),
        phone: (afterSale as any)?.phone || '', // phone puede no estar en el tipo base
        address: (afterSale as any)?.address || null, // address puede no estar en el tipo base
        tasks: Array.isArray(afterSale.tasks) ? afterSale.tasks.map(task => ({
          id: task.id || crypto.randomUUID(),
          description: task.description || '',
          isCompleted: Boolean(task.isCompleted),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
        })) : [],
      };
    } catch (error) {

      // Retornar datos por defecto seguros
      return {
        projectId: '',
        description: '',
        date: new Date(),
        phone: '',
        address: null,
        tasks: [],
      };
    }
  }, [afterSale]);

  const handleClose = React.useCallback(() => {
    try {
      setIsOpen(false);
    } catch (error) {

    }
  }, []);

  const handleOpen = React.useCallback(() => {
    try {
      setIsOpen(true);
    } catch (error) {

    }
  }, []);

  // 🔥 AHORA SÍ SE PUEDEN HACER EARLY RETURNS
  
  // Validación defensiva de la postventa
  if (!afterSale || !afterSale.id) {

    return null;
  }

  return (
    <DialogErrorBoundary
      onError={(error, errorInfo) => {

        toast({
          title: 'Error inesperado',
          description: 'Ha ocurrido un error al cargar el diálogo. Por favor, recarga la página.',
          variant: 'destructive',
        });
      }}
    >
      <div onClick={handleOpen}>
        {children}
      </div>

      <ModalLayout
        isOpen={isOpen}
        onClose={handleClose}
        title="Editar Postventa"
        className="w-full max-w-xl"
        showDefaultButtons={true}
        formRef={formRef}
        isSubmitting={isPending}
        submitButtonText={isPending ? "Actualizando..." : "Actualizar Postventa"}
      >
        <AfterSaleForm
          onSubmit={handleSubmit}
          initialData={initialData}
          showDefaultButtons={false}
        />
      </ModalLayout>
    </DialogErrorBoundary>
  );
}