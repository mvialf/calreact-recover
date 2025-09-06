'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { addVisit } from '@/services/visitService';
import { toast } from '@/components/ui/use-toast';
import { VisitForm, type VisitFormValues } from '@/components/forms/VisitForm';
import { VisitStatus } from '@/types/visit';

export default function NewVisitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: VisitFormValues) => {
    try {
      setIsSubmitting(true);

      // Preparar los datos para guardar
      const visitData = {
        ...data,
        // Asegurarse de que el status sea del tipo correcto
        status: data.status as VisitStatus,
        // Asegurarse de que la fecha sea un objeto Date
        scheduledDate: data.scheduledDate || new Date(),
        // Manejar fullAddress que puede ser null
        fullAddress: data.fullAddress || undefined,
      };

      // Guardar en Firestore
      await addVisit(visitData);

      // Mostrar mensaje de éxito
      toast({
        title: 'Visita Creada',
        description: 'La visita se ha registrado correctamente.',
      });

      // Redirigir a la lista de visitas
      router.push('/visits');
    } catch (error) {
      console.error('Error al guardar la visita:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la visita. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-6 py-6 px-4 sm:px-6 lg:px-8 max-w-[33rem]">
      <h1 className="text-3xl font-bold mb-6">Nueva Visita</h1>
      <div className="bg-card rounded-lg border p-6">
        <VisitForm 
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
