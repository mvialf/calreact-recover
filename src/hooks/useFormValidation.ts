/**
 * Custom hook para manejo estandardizado de formularios con validación
 * 
 * Proporciona funcionalidades comunes para formularios usando React Hook Form,
 * Zod para validación, y patrones consistentes para manejo de errores.
 */

import { useForm, UseFormProps, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useState, useCallback } from 'react';

export interface UseFormValidationOptions<TFormData extends FieldValues> extends Omit<UseFormProps<TFormData>, 'resolver'> {
  schema: z.ZodSchema<TFormData>;
  onSubmit: (data: TFormData) => Promise<void> | void;
  onSuccess?: (data: TFormData) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  resetOnSuccess?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormValidationReturn<TFormData extends FieldValues> extends UseFormReturn<TFormData> {
  handleSubmitForm: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  
  // Utilidades de validación
  validateField: (fieldName: Path<TFormData>) => Promise<boolean>;
  validateAllFields: () => Promise<boolean>;
  
  // Utilidades de formulario
  resetForm: () => void;
  setFieldError: (fieldName: Path<TFormData>, message: string) => void;
  clearFieldError: (fieldName: Path<TFormData>) => void;
  clearAllErrors: () => void;
  
  // Estado
  hasErrors: boolean;
  isDirty: boolean;
  isValid: boolean;
}

export const useFormValidation = <TFormData extends FieldValues>({
  schema,
  onSubmit,
  onSuccess,
  onError,
  successMessage = 'Operación completada exitosamente',
  errorMessage = 'Error al procesar el formulario',
  resetOnSuccess = false,
  validateOnChange = true,
  validateOnBlur = true,
  ...formOptions
}: UseFormValidationOptions<TFormData>): UseFormValidationReturn<TFormData> => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Configurar React Hook Form con Zod resolver
  const form = useForm<TFormData>({
    resolver: zodResolver(schema),
    mode: validateOnChange ? 'onChange' : validateOnBlur ? 'onBlur' : 'onSubmit',
    ...formOptions,
  });

  const {
    handleSubmit,
    trigger,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty, isValid }
  } = form;

  // Función para manejar el submit del formulario
  const handleSubmitForm = useCallback(async (e?: React.BaseSyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await handleSubmit(async (data: TFormData) => {
        try {
          await onSubmit(data);
          
          toast({
            title: 'Éxito',
            description: successMessage,
          });

          if (resetOnSuccess) {
            reset();
          }

          onSuccess?.(data);
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : errorMessage;
          setSubmitError(errorMsg);
          
          toast({
            title: 'Error',
            description: errorMsg,
            variant: 'destructive',
          });

          onError?.(error instanceof Error ? error : new Error(errorMsg));
          throw error;
        }
      })(e);
    } catch (error) {
      // Error ya manejado en el catch interno
    } finally {
      setIsSubmitting(false);
    }
  }, [handleSubmit, onSubmit, toast, successMessage, errorMessage, resetOnSuccess, onSuccess, onError, reset]);

  // Validar un campo específico
  const validateField = useCallback(async (fieldName: Path<TFormData>): Promise<boolean> => {
    return await trigger(fieldName);
  }, [trigger]);

  // Validar todos los campos
  const validateAllFields = useCallback(async (): Promise<boolean> => {
    return await trigger();
  }, [trigger]);

  // Resetear formulario
  const resetForm = useCallback(() => {
    reset();
    setSubmitError(null);
  }, [reset]);

  // Establecer error en un campo específico
  const setFieldError = useCallback((fieldName: Path<TFormData>, message: string) => {
    setError(fieldName, {
      type: 'manual',
      message,
    });
  }, [setError]);

  // Limpiar error de un campo específico
  const clearFieldError = useCallback((fieldName: Path<TFormData>) => {
    clearErrors(fieldName);
  }, [clearErrors]);

  // Limpiar todos los errores
  const clearAllErrors = useCallback(() => {
    clearErrors();
    setSubmitError(null);
  }, [clearErrors]);

  return {
    ...form,
    handleSubmitForm,
    isSubmitting,
    submitError,
    
    // Utilidades de validación
    validateField,
    validateAllFields,
    
    // Utilidades de formulario
    resetForm,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    
    // Estado
    hasErrors: Object.keys(errors).length > 0 || !!submitError,
    isDirty,
    isValid,
  };
};