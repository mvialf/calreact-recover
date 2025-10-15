'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AfterSaleForm, AfterSaleFormValues } from '@/components/forms/AfterSaleForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateAfterSales } from '@/services/afterSalesService';
import type { AfterSales } from '@/types/afterSales';
import { DialogErrorBoundary } from '@/components/error-boundary/DialogErrorBoundary';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface EditAfterSaleDialogProps {
  afterSale: AfterSales;
  children: React.ReactNode;
}

export function EditAfterSaleDialog({ afterSale, children }: EditAfterSaleDialogProps) {
  // 🔥 TODOS LOS HOOKS AL INICIO - ANTES DE CUALQUIER EARLY RETURN

  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

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
        // IMPORTANTE: Cerrar dialog ANTES de invalidar queries para evitar race condition
        // que deja pointer-events: none en el body (bug conocido de Radix UI Dialog)
        // Referencias: https://github.com/radix-ui/primitives/issues/1241
        setIsOpen(false);

        // Workaround: Esperar a que Radix UI complete el cleanup del dialog
        setTimeout(() => {
          document.body.style.removeProperty('pointer-events');

          // Invalidar queries relacionadas
          queryClient.invalidateQueries({ queryKey: ['afterSales'] });
          if (afterSale?.id) {
            queryClient.invalidateQueries({ queryKey: ['afterSales', afterSale.id] });
            queryClient.invalidateQueries({ queryKey: ['afterSalesForProject', afterSale.projectId] });
          }

          toast.success('Postventa actualizada correctamente.');
        }, 100);
      } catch (error) {

      }
    },
    onError: (error) => {

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al actualizar postventa', {
        description: `Hubo un problema al actualizar la postventa: ${errorMessage}`,
      });
    },
  });

  const handleSubmit = React.useCallback((data: AfterSaleFormValues) => {
    try {

      mutate(data);
    } catch (error) {

      toast.error('Error inesperado al procesar el formulario');
    }
  }, [mutate]);

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

        toast.error('Error inesperado', {
          description: 'Ha ocurrido un error al cargar el diálogo. Por favor, recarga la página.',
        });
      }}
    >
      <div onClick={handleOpen}>
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
          <DialogHeader>
            <DialogTitle>Editar Postventa</DialogTitle>
            <DialogDescription className="sr-only">
              Formulario para editar postventa existente
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4">
            <AfterSaleForm
              formId="edit-aftersale-form"
              onSubmit={handleSubmit}
              initialData={initialData}
              showDefaultButtons={false}
            />
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="edit-aftersale-form"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando
                </>
              ) : (
                'Actualizar Postventa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DialogErrorBoundary>
  );
}