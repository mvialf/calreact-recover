"use client";

import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DateInput } from '@/components/ui/date-input';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Icons
import { Plus, Trash2, Calendar, User, Phone, FileText, CheckSquare, Info } from 'lucide-react';

// Types y Constants
import type { ProjectType, ProjectStatus, ChecklistItem } from '@/types/project';
import { PROJECT_STATUS_OPTIONS } from '@/constants/project';

// Utilidades
import { formLogger } from '@/lib/logger';

const logger = formLogger;

// === ESQUEMA DE VALIDACIÓN ===

const checklistItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, 'Descripción requerida'),
  isCompleted: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.string().optional(),
  notes: z.string().optional(),
});

const newProjectEventLeanSchema = z.object({
  projectId: z.string().min(1, 'Proyecto requerido'),
  eventDate: z.date({
    required_error: 'Fecha del evento requerida',
    invalid_type_error: 'Fecha inválida'
  }),
  checklist: z.array(checklistItemSchema).default([]),
  
  // Campos opcionales para override del proyecto
  customDescription: z.string().optional(),
  customPhone: z.string().optional(),
  customStatus: z.enum(['ingresado', 'programar', 'fabricación', 'montaje', 'sello', 'continuación', 'complicación', 'completado']).optional(),
  eventNotes: z.string().optional(),
});

export type NewProjectEventLeanFormValues = z.infer<typeof newProjectEventLeanSchema>;

// === PROPS DEL COMPONENTE ===

export interface NewProjectEventLeanFormProps {
  onSubmit: (data: NewProjectEventLeanFormValues) => void;
  initialData?: Partial<NewProjectEventLeanFormValues>;
  isSubmitting?: boolean;
  project?: ProjectType; // Datos del proyecto para mostrar información de referencia
  className?: string;
}

// === COMPONENTE PRINCIPAL ===

export const NewProjectEventLeanForm = forwardRef<HTMLFormElement, NewProjectEventLeanFormProps>(
  function NewProjectEventLeanForm({
    onSubmit,
    initialData,
    isSubmitting = false,
    project,
    className
  }, ref) {
    
    const form = useForm<NewProjectEventLeanFormValues>({
      resolver: zodResolver(newProjectEventLeanSchema),
      defaultValues: {
        projectId: initialData?.projectId || '',
        eventDate: initialData?.eventDate || new Date(),
        checklist: initialData?.checklist || [],
        customDescription: initialData?.customDescription || '',
        customPhone: initialData?.customPhone || '',
        customStatus: initialData?.customStatus || undefined,
        eventNotes: initialData?.eventNotes || '',
      },
    });

    const { handleSubmit, control, watch, setValue, formState: { errors } } = form;

    // Watch checklist para updates reactivos
    const watchedChecklist = watch('checklist');

    // Expose form ref for parent component
    useImperativeHandle(ref, () => ({
      requestSubmit: () => {
        handleSubmit(onSubmit)();
      }
    } as any), [handleSubmit, onSubmit]);

    // === FUNCIONES DE CHECKLIST ===

    const addChecklistItem = () => {
      const newItem: ChecklistItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: '',
        isCompleted: false,
        priority: 'medium',
        category: 'general'
      };

      const currentChecklist = watchedChecklist || [];
      setValue('checklist', [...currentChecklist, newItem] as Array<{
        description: string;
        isCompleted: boolean;
        priority: "low" | "medium" | "high";
        id?: string | undefined;
        category?: string | undefined;
        notes?: string | undefined;
      }>);
      
      logger.debug('Item agregado al checklist', { itemId: newItem.id });
    };

    const removeChecklistItem = (index: number) => {
      const currentChecklist = watchedChecklist || [];
      const removedItem = currentChecklist[index];
      const updatedChecklist = currentChecklist.filter((_, i) => i !== index);
      setValue('checklist', updatedChecklist);
      
      logger.debug('Item removido del checklist', { itemId: removedItem?.id, index });
    };

    const updateChecklistItem = (index: number, field: keyof ChecklistItem, value: any) => {
      const currentChecklist = [...(watchedChecklist || [])];
      if (currentChecklist[index]) {
        (currentChecklist[index] as any)[field] = value;
        setValue('checklist', currentChecklist);
        
        logger.debug('Item del checklist actualizado', { 
          index, 
          field, 
          itemId: currentChecklist[index].id 
        });
      }
    };

    // === EFECTOS ===

    useEffect(() => {
      if (initialData) {
        Object.entries(initialData).forEach(([key, value]) => {
          if (value !== undefined) {
            setValue(key as keyof NewProjectEventLeanFormValues, value as any);
          }
        });
      }
    }, [initialData, setValue]);

    // === RENDER ===

    return (
      <Form {...form}>
        <form 
          ref={ref}
          onSubmit={handleSubmit(onSubmit)} 
          className={`space-y-6 ${className || ''}`}
        >
          {/* Información del Proyecto (Read-only) */}
          {project && (
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Datos del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Cliente:</span>
                    <p className="font-medium">{project.clientName || 'Sin cliente'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge variant="outline" className="ml-1">{project.status}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Descripción:</span>
                    <p className="truncate">{project.description || 'Sin descripción'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Teléfono:</span>
                    <p>{project.phone || 'Sin teléfono'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fecha del Evento */}
          <FormField
            control={control}
            name="eventDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha del Evento *
                </FormLabel>
                <FormControl>
                  <DateInput
                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : undefined
                      field.onChange(date)
                    }}
                    placeholder="Seleccionar fecha..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Campos de Override Opcionales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Personalización del Evento (Opcional)</CardTitle>
              <p className="text-xs text-muted-foreground">
                Estos campos solo se usan si quieres valores diferentes a los del proyecto
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Custom Description */}
              <FormField
                control={control}
                name="customDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Descripción Específica del Evento
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={project?.description || "Descripción específica para este evento..."}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Custom Phone */}
              <FormField
                control={control}
                name="customPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono Específico del Evento
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        placeholder={project?.phone || "Teléfono específico para este evento"}
                        value={field.value || ''}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Custom Status */}
              <FormField
                control={control}
                name="customStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      Estado Específico del Evento
                    </FormLabel>
                    <Select value={field.value as string} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={`Estado actual: ${project?.status || 'Seleccionar estado'}`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROJECT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Lista de Verificación
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addChecklistItem}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" />
                Agregar Item
              </Button>
            </CardHeader>
            <CardContent>
              {watchedChecklist && watchedChecklist.length > 0 ? (
                <div className="space-y-3">
                  {watchedChecklist.map((item, index) => (
                    <div key={item.id || index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Descripción del item..."
                            value={item.description}
                            onChange={(e) => updateChecklistItem(index, 'description', e.target.value)}
                            className="flex-1"
                          />
                          <Select
                            value={item.priority}
                            onValueChange={(value) => updateChecklistItem(index, 'priority', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baja</SelectItem>
                              <SelectItem value="medium">Media</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {item.notes !== undefined && (
                          <Input
                            placeholder="Notas adicionales (opcional)..."
                            value={item.notes || ''}
                            onChange={(e) => updateChecklistItem(index, 'notes', e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChecklistItem(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay items en la lista de verificación</p>
                  <p className="text-xs">Agrega items para organizar las tareas del evento</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Notes */}
          <FormField
            control={control}
            name="eventNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notas del Evento</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Notas específicas para este evento..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Debug info en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs text-muted-foreground">
              <summary>Debug Info</summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                {JSON.stringify({ 
                  formData: watch(), 
                  errors,
                  checklistCount: watchedChecklist?.length || 0
                }, null, 2)}
              </pre>
            </details>
          )}
        </form>
      </Form>
    );
  }
);