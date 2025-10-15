'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { VisitForm, type VisitFormValues } from '@/components/forms/VisitForm';
import { addVisit, type VisitStatus } from '@/services/visitService';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { visitLogger } from '@/lib/logger';

export function NewVisitDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

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
      // IMPORTANTE: Cerrar dialog ANTES de invalidar queries para evitar race condition
      // que deja pointer-events: none en el body (bug conocido de Radix UI Dialog)
      // Referencias: https://github.com/radix-ui/primitives/issues/1241
      setIsOpen(false);

      // Workaround: Esperar a que Radix UI complete el cleanup del dialog
      setTimeout(() => {
        document.body.style.removeProperty('pointer-events');

        // Invalidar las queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['visits'] });

        toast.success('Visita creada', {
          description: `La visita para ${newVisit.name} ha sido creada exitosamente.`,
        });

        router.refresh(); // Refrescar la página para mostrar la nueva visita
      }, 100);
    },
    onError: (error: Error) => {
      visitLogger.error('Error al crear la visita', error);
      toast.error('Error al crear visita', {
        description: error.message || 'No se pudo crear la visita.',
      });
    },
  });

  // Manejador de envío del formulario
  const handleFormSubmit = async (formData: VisitFormValues) => {
    try {
      await createVisitMutation.mutateAsync(formData);
    } catch (error) {
      visitLogger.error('Error al crear la visita', error);
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto max-w-xl">
          <DialogHeader>
            <DialogTitle>Nueva Visita</DialogTitle>
            <DialogDescription className="sr-only">
              Formulario para crear una nueva visita
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4">
            <VisitForm
              formId="new-visit-form"
              onSubmit={handleFormSubmit}
              showDefaultButtons={false}
              isSubmitting={createVisitMutation.isPending}
            />
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createVisitMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="new-visit-form"
              disabled={createVisitMutation.isPending}
            >
              {createVisitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando
                </>
              ) : (
                'Crear Visita'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
