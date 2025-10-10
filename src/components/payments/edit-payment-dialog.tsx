"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentLogger } from '@/lib/logger';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MoneyInput } from '@/components/ui/money-input';
import { DateInput } from '@/components/ui/date-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updatePayment } from '@/services/paymentService';
import type { Payment } from '@/types/payment';
import { PAYMENT_METHODS, PAYMENT_TYPES } from '@/constants/payment';

const formSchema = z.object({
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  date: z.date({
    required_error: 'La fecha es requerida',
  }),
  paymentMethod: z.string().min(1, 'El método de pago es requerido'),
  paymentType: z.string().min(1, 'El tipo de pago es requerido'),
  installments: z.number().min(1, 'Debe tener al menos 1 cuota').optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
}

export function EditPaymentDialog({ open, onOpenChange, payment }: EditPaymentDialogProps) {
  const queryClient = useQueryClient();
  const [isCreditCard, setIsCreditCard] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: payment?.amount || 0,
      date: payment?.date ? new Date(payment.date) : new Date(),
      paymentMethod: payment?.paymentMethod || '',
      paymentType: payment?.paymentType || 'proyecto',
      installments: payment?.installments || 1,
      notes: payment?.notes || '',
    },
  });

  // Actualizar el formulario cuando cambia el pago
  useEffect(() => {
    if (payment) {
      form.reset({
        amount: payment.amount || 0,
        date: payment.date ? new Date(payment.date) : new Date(),
        paymentMethod: payment.paymentMethod || '',
        paymentType: payment.paymentType || 'proyecto',
        installments: payment.installments || 1,
        notes: payment.notes || '',
      });
      setIsCreditCard(payment.paymentMethod === 'tarjeta de crédito');
    }
  }, [payment, form]);

  // Manejar cambios en el método de pago
  const handlePaymentMethodChange = (value: string) => {
    form.setValue('paymentMethod', value);
    const isCredit = value === 'tarjeta de crédito';
    setIsCreditCard(isCredit);
    
    if (!isCredit) {
      form.setValue('installments', 1);
    } else if (!form.getValues('installments')) {
      form.setValue('installments', 1);
    }
  };

  const updatePaymentMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!payment) throw new Error('No se ha seleccionado ningún pago');
      
      const updatedPayment = {
        ...payment,
        amount: data.amount,
        date: data.date,
        paymentMethod: data.paymentMethod as any,
        paymentType: data.paymentType as any,
        installments: data.installments,
        notes: data.notes,
        updatedAt: new Date(),
      };

      await updatePayment(payment.id, updatedPayment);
      return updatedPayment;
    },
    onSuccess: () => {
      toast.success('Pago actualizado', {
        description: 'El pago se ha actualizado correctamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error('Error al actualizar el pago', {
        description: error.message || 'No se pudo actualizar el pago. Inténtalo de nuevo.',
      });
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!payment) return;
    
    try {
      await updatePaymentMutation.mutateAsync(data);
    } catch (error) {
      paymentLogger.error('Error al actualizar el pago', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Pago</DialogTitle>
          <DialogDescription>
            Modifica los detalles del pago. Los cambios se guardarán automáticamente.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto</FormLabel>
                    <FormControl>
                      <MoneyInput
                        value={field.value}
                        onValueChange={(value) => field.onChange(value || 0)}
                        placeholder="Ingrese el monto"
                        disabled={updatePaymentMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Pago</FormLabel>
                    <FormControl>
                      <DateInput
                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          const date = e.target.value ? new Date(e.target.value) : undefined;
                          field.onChange(date);
                        }}
                        disabled={updatePaymentMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago</FormLabel>
                    <Select onValueChange={handlePaymentMethodChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un método de pago" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method.charAt(0).toUpperCase() + method.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo de pago" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isCreditCard && (
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Cuotas</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="36"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Agrega alguna nota sobre este pago"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updatePaymentMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updatePaymentMutation.isPending}>
                {updatePaymentMutation.isPending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
