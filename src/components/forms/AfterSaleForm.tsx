"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { AddressInput } from "@/components/ui/addressInput";
import { Autocomplete, type AutocompleteItem } from "@/components/ui/autocomplete";
import { CheckList, type CheckListItem } from "@/components/ui/check-list";
import { InputDate } from "@/components/ui/date-picker";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectClientDisplay } from "@/components/client-display";

// Icons
import { Loader2, Calendar, Plus, Trash2, ListTodo, X } from "lucide-react";

// Services
import { getProjects } from "@/services/projectService";
import { addAfterSales } from "@/services/afterSalesService";

// Types
import type { ProjectType } from "@/types/project";
import type { FormattedAddress } from "@/types/project";

// Esquemas de validación centralizados
import { 
  requiredSelection, 
  descriptionSchema, 
  requiredDate,
  phoneSchema,
  tasksArraySchema
} from "@/utils/validation-schemas";

// Schema de validación
const formSchema = z.object({
  projectId: requiredSelection("un proyecto"),
  description: descriptionSchema(10),
  date: requiredDate("La fecha"),
  phone: phoneSchema,
  address: z.any().optional(), // FormattedAddress | null
  tasks: tasksArraySchema,
});

export type AfterSaleFormValues = z.infer<typeof formSchema>;

interface AfterSaleFormProps {
  initialData?: any;
  isSubmitting?: boolean;
  onSubmitSuccess?: () => void;
  formRef?: React.RefObject<HTMLFormElement>;
  onSubmit?: (data: AfterSaleFormValues) => void | Promise<void>;
  hideButtons?: boolean;
}

export function AfterSaleForm({ 
  initialData, 
  isSubmitting = false,
  onSubmitSuccess,
  formRef,
  onSubmit,
  hideButtons = false
}: AfterSaleFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Obtener proyectos para el autocomplete
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });

  // Formulario
  const form = useForm<AfterSaleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      projectId: "",
      description: "",
      date: new Date(),
      phone: "",
      address: null,
      tasks: [{ id: Date.now().toString(), description: "", completed: false }],
    },
  });

  // Estado para el proyecto seleccionado
  const [selectedProject, setSelectedProject] = React.useState<ProjectType | null>(null);

  // Convertir proyectos a items del autocomplete
  // Filtrar solo proyectos completados y pagados
  const projectItems: AutocompleteItem[] = React.useMemo(() => {
    return projects
      .filter(project => project.status === 'completado' && project.isPaid === true)
      .map(project => ({
        value: project.id,
        label: `${project.projectNumber} - ${project.clientName || 'Cliente no especificado'}`,
        project // Guardamos el proyecto completo para acceso posterior
      }));
  }, [projects]);

  // Función para renderizar items del autocomplete
  const renderProjectItem = React.useCallback((item: AutocompleteItem) => {
    if (item.project) {
      return (
        <ProjectClientDisplay 
          project={item.project}
          className="flex-1"
        />
      );
    }
    return <span className="truncate">{item.label}</span>;
  }, []);

  // Manejar selección de proyecto
  const handleProjectSelect = React.useCallback((projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    form.setValue('projectId', projectId);
    
    // Autocompletar campos de teléfono y dirección del proyecto
    if (project) {
      // Cargar teléfono del proyecto si existe
      if (project.phone) {
        form.setValue('phone', project.phone);
      }
      
      // Cargar dirección del proyecto si existe
      if (project.fullAddress) {
        form.setValue('address', project.fullAddress);
      }
    }
  }, [projects, form]);

  // Función para limpiar la selección
  const handleClearSelection = React.useCallback(() => {
    setSelectedProject(null);
    form.setValue('projectId', '');
    
    // Limpiar campos autocompletados
    form.setValue('phone', '');
    form.setValue('address', null);
  }, [form]);

  // Mutación para crear postventa
  const createMutation = useMutation({
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
    onSuccess: () => {
      toast({
        title: "Postventa creada",
        description: "La postventa se ha creado correctamente.",
      });
      if (onSubmitSuccess) {
        onSubmitSuccess();
      } else {
        router.push("/aftersales");
      }
    },
    onError: (error) => {
      console.error("Error al crear la postventa:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la postventa. Intente nuevamente.",
        variant: "destructive",
      });
    },
  });

  // Manejar envío del formulario interno
  const handleInternalSubmit = async (data: AfterSaleFormValues) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  };

  // Manejar agregar tarea
  const handleAddTask = (description: string) => {
    const tasks = form.getValues("tasks");
    const newTask = { 
      id: Date.now().toString(), 
      description, 
      isCompleted: false,
      createdAt: new Date()
    };
    form.setValue("tasks", [...tasks, newTask], { shouldValidate: true });
  };

  // Manejar cambiar estado de tarea
  const handleToggleTask = (id: string, completed: boolean) => {
    const tasks = form.getValues("tasks").map(task => 
      task.id === id 
        ? { 
            ...task, 
            completed,
            completedAt: completed ? new Date() : undefined
          } 
        : task
    );
    form.setValue("tasks", tasks, { shouldValidate: true });
  };

  // Manejar eliminar tarea
  const handleDeleteTask = (id: string) => {
    const tasks = form.getValues("tasks").filter(task => task.id !== id);
    form.setValue("tasks", tasks, { shouldValidate: true });
  };

  // Las tareas ya están en el formato correcto para CheckList
  const checklistItems = form.watch("tasks");

  if (isLoadingProjects) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleInternalSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Proyecto */}
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proyecto</FormLabel>
                {!selectedProject ? (
                  <FormControl>
                    <Autocomplete
                      items={projectItems}
                      value={field.value}
                      onSelect={handleProjectSelect}
                      placeholder="Buscar proyecto..."
                      emptyText="No se encontraron proyectos."
                      searchPlaceholder="Buscar por número o cliente..."
                      disabled={isSubmitting || isLoadingProjects}
                      isLoading={isLoadingProjects}
                      renderItem={renderProjectItem}
                    />
                  </FormControl>
                ) : (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <ProjectClientDisplay 
                          project={selectedProject}
                          className="text-foreground"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearSelection}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Fecha y Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <div className="w-full">
                    <InputDate
                      date={field.value}
                      onSelect={field.onChange}
                      className="w-full"
                      calendarProps={{
                        disabled: isSubmitting,
                        fromDate: new Date(2020, 0, 1),
                        toDate: new Date(),
                      }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teléfono */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <PhoneInput 
                      value={field.value}
                      onChange={(value) => {
                        // Actualizamos el valor del campo con el formato completo (incluyendo código de país)
                        field.onChange(value);
                      }}
                      excludeCountryCode={false} // Aseguramos que siempre incluya el código de país
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Dirección */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección</FormLabel>
                <FormControl>
                  <AddressInput
                    value={field.value}
                    onSelect={field.onChange}
                    placeholder="Ingrese la dirección..."
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Descripción */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descripción de la postventa..."
                    className="min-h-[100px]"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tareas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel className="flex items-center gap-2">
                <ListTodo className="h-4 w-4" />
                Tareas
              </FormLabel>
            </div>
            
            <FormField
              control={form.control}
              name="tasks"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CheckList
                      items={checklistItems}
                      onItemToggle={handleToggleTask}
                      onItemDelete={handleDeleteTask}
                      onAddItem={handleAddTask}
                      title="Lista de tareas de postventa"
                      className="border rounded-md p-4"
                      itemClassName="hover:bg-muted/50 rounded-md p-2 transition-colors"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {form.formState.errors.tasks && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.tasks.message}
              </p>
            )}
        </div>

        {!hideButtons && (
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/aftersales")}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}

// Componente de carga esquelético
function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
