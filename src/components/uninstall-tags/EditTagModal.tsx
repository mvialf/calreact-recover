import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagBadge } from "./TagBadge";
import { cn } from "@/lib/utils";
import type { Tag, TagColor } from "@/types/tags";
import { TAG_COLOR_MAP, AVAILABLE_TAG_COLORS } from "@/types/tags";

interface EditTagModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEditTag: (tagId: string, name: string, color: TagColor, abbreviation: string) => void;
  tag: Tag | null;
  existingTags: Tag[];
}

/**
 * Modal para editar etiquetas existentes
 */
export const EditTagModal: React.FC<EditTagModalProps> = ({
  isOpen,
  onOpenChange,
  onEditTag,
  tag,
  existingTags,
}) => {
  const [tagName, setTagName] = React.useState("");
  const [tagAbbreviation, setTagAbbreviation] = React.useState("");
  const [tagColor, setTagColor] = React.useState<TagColor>("primary");
  const [isEditing, setIsEditing] = React.useState(false);
  const [error, setError] = React.useState("");

  // Inicializar con los datos de la tag a editar
  React.useEffect(() => {
    if (isOpen && tag) {
      setTagName(tag.name);
      setTagAbbreviation(tag.abbreviation || tag.name.substring(0, 2).toUpperCase());
      setTagColor(tag.color);
      setError("");
    } else if (!isOpen) {
      // Limpiar estado cuando se cierra
      setTagName("");
      setTagAbbreviation("");
      setTagColor("primary");
      setError("");
    }
  }, [isOpen, tag]);

  // Validar nombre duplicado (excluyendo la tag actual)
  const validateTagName = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre es requerido");
      return false;
    }

    const isDuplicate = existingTags.some(
      (existingTag) =>
        existingTag.id !== tag?.id &&
        existingTag.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      setError("Ya existe una etiqueta con este nombre");
      return false;
    }

    setError("");
    return true;
  };

  // Handler para cambiar abbreviation
  const handleAbbreviationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Solo permitir 2 caracteres y convertir a mayúsculas
    const normalized = value.slice(0, 2).toUpperCase();
    setTagAbbreviation(normalized);
  };

  // Handler para guardar cambios
  const handleSave = async () => {
    if (!tag || !validateTagName(tagName)) return;

    setIsEditing(true);
    try {
      // Auto-generar abbreviation si está vacía
      const finalAbbreviation = tagAbbreviation.trim() || tagName.trim().substring(0, 2).toUpperCase();

      onEditTag(tag.id, tagName.trim(), tagColor, finalAbbreviation);
      onOpenChange(false);
    } catch (error) {
      setError("Error al actualizar la etiqueta");
    } finally {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagName.trim() && !error) {
      e.preventDefault();
      handleSave();
    }
  };

  // Vista previa de la etiqueta
  const previewTag: Tag = {
    id: "preview",
    name: tagName.trim() || "Etiqueta",
    color: tagColor,
    abbreviation: tagAbbreviation.trim() || tagName.trim().substring(0, 2).toUpperCase() || "XX",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Etiqueta</DialogTitle>
          <DialogDescription className="sr-only">
            Modifica el nombre, abreviatura o color de la etiqueta seleccionada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nombre de la etiqueta */}
          <div className="space-y-2">
            <Label htmlFor="tag-name">Nombre *</Label>
            <Input
              id="tag-name"
              value={tagName}
              onChange={(e) => {
                setTagName(e.target.value);
                validateTagName(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ej: Aluminio"
              maxLength={30}
            />
          </div>

          {/* Abbreviation (2 letras) */}
          <div className="space-y-2">
            <Label htmlFor="tag-abbreviation">Abreviatura (2 letras) *</Label>
            <Input
              id="tag-abbreviation"
              value={tagAbbreviation}
              onChange={handleAbbreviationChange}
              onKeyDown={handleKeyDown}
              placeholder="AL"
              maxLength={2}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Se genera automáticamente si se deja vacío
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          {/* Selector de color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_TAG_COLORS.map(({ color, label }) => {
                const isSelected = color === tagColor;
                const colorClasses = TAG_COLOR_MAP[color];
                return (
                  <Button
                    key={color}
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-9 w-full p-0 border-2 relative group",
                      isSelected
                        ? "border-primary ring-2 ring-offset-2 ring-primary"
                        : "border-muted hover:border-muted-foreground/50"
                    )}
                    onClick={() => setTagColor(color)}
                    title={label}
                  >
                    <div
                      className={cn(
                        "w-full h-full rounded-sm",
                        colorClasses.bg,
                        "group-hover:opacity-90"
                      )}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            colorClasses.text.replace("text-", "bg-")
                          )}
                        />
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Vista previa */}
          <div className="space-y-2">
            <Label>Vista previa</Label>
            <div className="flex items-center justify-center p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <TagBadge tag={{ ...previewTag, abbreviation: undefined }} className="text-sm" />
                <TagBadge tag={previewTag} className="text-sm" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isEditing}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!tagName.trim() || !!error || isEditing}
          >
            {isEditing ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
