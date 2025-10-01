/**
 * Hook para exponer API de formulario mediante refs
 *
 * Unifica el patrón de refs entre formularios usando forwardRef + useImperativeHandle
 */

import { useImperativeHandle, type Ref } from 'react';
import type { UseFormReturn, FieldValues, SubmitHandler } from 'react-hook-form';

/**
 * API estándar expuesta por refs de formularios
 */
export interface FormRef<T extends FieldValues = FieldValues> {
  /**
   * Submittear el formulario programáticamente
   */
  submit: () => void;

  /**
   * Resetear el formulario a valores por defecto
   */
  reset: (values?: Partial<T>) => void;

  /**
   * Obtener valores actuales del formulario
   */
  getValues: () => T;

  /**
   * Setear un error en un campo específico
   */
  setError: (field: keyof T, message: string) => void;

  /**
   * Limpiar errores del formulario
   */
  clearErrors: (field?: keyof T | (keyof T)[]) => void;

  /**
   * Verificar si el formulario es válido
   */
  isValid: () => boolean;

  /**
   * Verificar si el formulario está sucio (tiene cambios)
   */
  isDirty: () => boolean;
}

/**
 * Hook para exponer API de formulario mediante ref
 *
 * @param ref - Ref forwarded desde el componente padre
 * @param form - Instancia de useForm de React Hook Form
 * @param onSubmit - Handler de submit
 *
 * @example
 * export const MyForm = forwardRef<FormRef<MyFormValues>, MyFormProps>(
 *   (props, ref) => {
 *     const form = useForm<MyFormValues>(...);
 *
 *     useFormRef(ref, form, onSubmit);
 *
 *     return <form>...</form>;
 *   }
 * );
 *
 * // Uso en componente padre
 * const formRef = useRef<FormRef<MyFormValues>>(null);
 * <MyForm ref={formRef} ... />
 * <Button onClick={() => formRef.current?.submit()}>Submit</Button>
 */
export const useFormRef = <T extends FieldValues>(
  ref: Ref<FormRef<T>>,
  form: UseFormReturn<T>,
  onSubmit: SubmitHandler<T>
) => {
  useImperativeHandle(ref, () => ({
    submit: () => {
      form.handleSubmit(onSubmit)();
    },

    reset: (values?: Partial<T>) => {
      if (values) {
        form.reset(values as any);
      } else {
        form.reset();
      }
    },

    getValues: () => {
      return form.getValues();
    },

    setError: (field: keyof T, message: string) => {
      form.setError(field as any, {
        type: 'manual',
        message,
      });
    },

    clearErrors: (field?: keyof T | (keyof T)[]) => {
      form.clearErrors(field as any);
    },

    isValid: () => {
      return form.formState.isValid;
    },

    isDirty: () => {
      return form.formState.isDirty;
    },
  }), [form, onSubmit]);
};
