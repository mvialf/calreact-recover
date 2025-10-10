"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TagSelector, TagBadge, type Tag, type TagColor } from "@/components/ui/custom/tags";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTags } from "@/hooks/useTags";

/**
 * Demostración del Sistema de Etiquetas estilo Trello
 * Ejemplo de uso de los componentes TagSelector y TagBadge
 */
export const TagSystemDemo: React.FC = () => {
  // Hook personalizado para manejar etiquetas
  const {
    availableTags,
    selectedTags,
    addAvailableTag,
    updateAvailableTag,
    removeAvailableTag,
    setSelectedTags,
    clearSelectedTags
  } = useTags({
    initialTags: [
      { id: "1", name: "Urgente", color: "destructive", abbreviation: "UR" },
      { id: "2", name: "En Progreso", color: "sky", abbreviation: "EP" },
      { id: "3", name: "Completado", color: "complete", abbreviation: "CO" },
      { id: "4", name: "Revisión", color: "orange", abbreviation: "RE" },
      { id: "5", name: "Cliente VIP", color: "purple", abbreviation: "VIP" },
      { id: "6", name: "Pendiente", color: "yellow", abbreviation: "PE" },
      { id: "7", name: "Importante", color: "brown", abbreviation: "IM" }
    ]
  });

  // Estado para segundo ejemplo
  const [selectedTags2, setSelectedTags2] = React.useState<Tag[]>([
    availableTags[0], // Urgente
    availableTags[2]  // Completado
  ]);

  // Función para crear una nueva etiqueta
  const handleCreateTag = React.useCallback((name: string, color: TagColor) => {
    addAvailableTag(name, color);
  }, [addAvailableTag]);

  // Función para limpiar todas las selecciones
  const handleClearAll = () => {
    clearSelectedTags();
    setSelectedTags2([]);
  };

  // Función para agregar etiqueta aleatoria
  const handleAddRandomTag = () => {
    const colors: TagColor[] = ["yellow", "sky", "orange", "brown", "complete", "purple"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const timestamp = Date.now();
    addAvailableTag(`Etiqueta ${timestamp}`, randomColor);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Sistema de Etiquetas CalReact</h1>
        <p className="text-muted-foreground">
          Componentes de etiquetas estilo Trello con colores personalizados
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Ejemplo 1: Selector vacío */}
        <Card>
          <CardHeader>
            <CardTitle>Selector Vacío</CardTitle>
            <CardDescription>
              Ejemplo de TagSelector sin etiquetas seleccionadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TagSelector
              selectedTags={selectedTags}
              availableTags={availableTags}
              onTagsChange={setSelectedTags}
              onCreateTag={handleCreateTag}
              onEditTag={(tagId, name, color) => {
                updateAvailableTag(tagId, { name, color });
              }}
              onDeleteTag={(tagId) => {
                removeAvailableTag(tagId);
              }}
              placeholder="Seleccionar etiquetas del proyecto..."
              label="Etiquetas del Proyecto"
            />
            

          </CardContent>
        </Card>

        {/* Ejemplo 2: Selector con etiquetas preseleccionadas */}
        <Card>
          <CardHeader>
            <CardTitle>Con Etiquetas Preseleccionadas</CardTitle>
            <CardDescription>
              Ejemplo con etiquetas ya seleccionadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TagSelector
              selectedTags={selectedTags2}
              availableTags={availableTags}
              onTagsChange={setSelectedTags2}
              onCreateTag={handleCreateTag}
              onEditTag={(tagId, name, color) => {
                updateAvailableTag(tagId, { name, color });
              }}
              onDeleteTag={(tagId) => {
                removeAvailableTag(tagId);
              }}
              placeholder="Gestionar etiquetas..."
              label="Categorías de Tarea"
            />
            
            <div className="text-sm text-muted-foreground">
              Etiquetas seleccionadas: {selectedTags2.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ejemplo de TagBadge individuales */}
      <Card>
        <CardHeader>
          <CardTitle>Todas las Etiquetas Disponibles</CardTitle>
          <CardDescription>
            Vista de todas las etiquetas con sus colores personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  removable={false}
                />
              ))}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <h4 className="font-medium">Etiquetas con opción de remover:</h4>
              <div className="flex flex-wrap gap-2">
                {availableTags.slice(0, 3).map((tag) => (
                  <TagBadge
                    key={`removable-${tag.id}`}
                    tag={tag}
                    removable
                    onRemove={(tagId) => {

                    }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Haz clic en la X para remover etiquetas (solo demo)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles de demostración */}
      <Card>
        <CardHeader>
          <CardTitle>Controles de Demostración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleClearAll} variant="outline">
              Limpiar Todas las Selecciones
            </Button>
            <Button onClick={handleAddRandomTag} variant="outline">
              Agregar Etiqueta Aleatoria
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información técnica */}
      <Card>
        <CardHeader>
          <CardTitle>Información Técnica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Colores disponibles:</strong> yellow, sky, orange, brown, complete, purple, primary, secondary, destructive</p>
          <p><strong>Funcionalidades:</strong> Selección múltiple, creación de etiquetas, remoción, popover interactivo</p>
          <p><strong>Integración:</strong> Compatible con React Hook Form, TypeScript completo</p>
          <p><strong>Accesibilidad:</strong> Soporte completo para teclado y lectores de pantalla</p>
          <p><strong>Colores:</strong> Utiliza las variables CSS personalizadas definidas en globals.css</p>
        </CardContent>
      </Card>
    </div>
  );
};
