import * as React from "react";
import { Plus, EllipsisVertical, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TagBadge } from "./TagBadge";
import { CreateTagModal } from "../modals/CreateTagModal";
import { EditTagModal } from "../modals/EditTagModal";
import type { TagSelectorProps, Tag, TagColor, CreateTagData } from "@/types/tags";

/**
 * Componente TagSelector - Selector de etiquetas con popover estilo Trello
 * Permite seleccionar múltiples etiquetas y crear nuevas
 */
export const TagSelector = React.forwardRef<HTMLDivElement, TagSelectorProps>(
  ({ 
    selectedTags, 
    availableTags, 
    onTagsChange, 
    onCreateTag,
    onEditTag,
    onDeleteTag,
    placeholder = "Seleccionar etiquetas...",
    label,
    className,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isCreatingTag, setIsCreatingTag] = React.useState(false);
    const [isEditingTag, setIsEditingTag] = React.useState(false);
    const [tagToEdit, setTagToEdit] = React.useState<Tag | null>(null);

    // Estado temporal para las selecciones en el diálogo
    const [tempSelectedTags, setTempSelectedTags] = React.useState<Tag[]>([]);

    // Inicializar estado temporal cuando se abre el diálogo
    React.useEffect(() => {
      if (isOpen) {
        setTempSelectedTags([...selectedTags]);
      }
    }, [isOpen, selectedTags]);

    const handleTagToggle = (tag: Tag) => {
      const isSelected = tempSelectedTags.some(selected => selected.id === tag.id);
      
      if (isSelected) {
        // Remover etiqueta del estado temporal
        setTempSelectedTags(tempSelectedTags.filter(selected => selected.id !== tag.id));
      } else {
        // Agregar etiqueta al estado temporal
        setTempSelectedTags([...tempSelectedTags, tag]);
      }
    };
    
    const handleAccept = () => {
      // Aplicar cambios
      onTagsChange(tempSelectedTags);
      setIsOpen(false);
    };
    
    const handleCancel = () => {
      // Descartar cambios
      setTempSelectedTags(selectedTags);
      setIsOpen(false);
    };

    const handleRemoveTag = (tagId: string) => {
      onTagsChange(selectedTags.filter(tag => tag.id !== tagId));
    };

    const handleCreateTag = (name: string, color: TagColor, abbreviation: string) => {
      if (!onCreateTag) return;

      // Crear la nueva etiqueta con abbreviation (obligatoria)
      onCreateTag(name, color, abbreviation);

      // Nota: onCreateTag no retorna la nueva etiqueta,
      // la etiqueta se agregará automáticamente a availableTags
    };

    const handleEditTag = (tagId: string, name: string, color: TagColor, abbreviation: string) => {
      if (!onEditTag) return;

      // Actualizar la etiqueta
      onEditTag(tagId, name, color, abbreviation);

      // Cerrar modal de edición
      setIsEditingTag(false);
      setTagToEdit(null);
    };

    const handleOpenEditModal = (tag: Tag) => {
      setTagToEdit(tag);
      setIsEditingTag(true);
    };

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {/* Label con botón de tag */}
        {label && (
          <div className="flex items-center justify-start gap-2">
            <Label className="text-sm font-medium">{label}</Label>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  aria-label="Gestionar etiquetas"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Etiquetas</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  
                  {/* Lista unificada de todas las etiquetas */}
                  {availableTags.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-muted-foreground">
                          Etiquetas ({tempSelectedTags.length} seleccionadas)
                        </Label>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto space-y-1">
                        {availableTags.map((tag) => {
                          const isSelected = tempSelectedTags.some(selected => selected.id === tag.id);
                          return (
                            <div
                              key={tag.id}
                              className={cn(
                                "group flex items-center space-x-2 px-2 rounded-md cursor-pointer transition-colors",
                                isSelected ? "bg-muted/70 hover:bg-muted" : "hover:bg-muted/50"
                              )}
                              onClick={() => handleTagToggle(tag)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleTagToggle(tag)}
                                className="shrink-0"
                              />
                              {/* Mostrar badges: nombre completo + abbreviation */}
                              <div className="flex-1 flex items-center gap-2 py-2">
                                <TagBadge tag={{ ...tag, abbreviation: undefined }} className="text-sm" />
                                <TagBadge tag={tag} className="text-sm" />
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6  p-0 shrink-0"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <EllipsisVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {onEditTag && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditModal(tag);
                                      }}
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                  )}
                                  {onDeleteTag && (
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTag(tag.id);
                                      }}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Botón para crear nueva etiqueta */}
                  {onCreateTag && (
                    <>
                      {availableTags.length > 0 && <Separator className="my-3" />}
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => setIsCreatingTag(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Crear nueva etiqueta
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Botones de acción del diálogo */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleAccept}
                  >
                    Aceptar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
        
        {/* Etiquetas seleccionadas */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <TagBadge
                key={tag.id}
                tag={{ ...tag, abbreviation: undefined }}
                removable
                onRemove={handleRemoveTag}
              />
            ))}
          </div>
        )}

        {/* Modal de creación de etiquetas */}
        {onCreateTag && (
          <CreateTagModal
            isOpen={isCreatingTag}
            onOpenChange={setIsCreatingTag}
            onCreateTag={handleCreateTag}
            existingTags={availableTags}
          />
        )}

        {/* Modal de edición de etiquetas */}
        {onEditTag && (
          <EditTagModal
            isOpen={isEditingTag}
            onOpenChange={setIsEditingTag}
            onEditTag={handleEditTag}
            tag={tagToEdit}
            existingTags={availableTags}
          />
        )}
      </div>
    );
  }
);

TagSelector.displayName = "TagSelector";
