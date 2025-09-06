import * as React from "react";
import { Plus, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TagBadge } from "@/components/ui/tag-badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Tag, TagColor } from "@/types/tags";
import { TAG_COLOR_MAP, AVAILABLE_TAG_COLORS } from "@/types/tags";

interface CreateTagModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTag: (name: string, color: TagColor) => Tag | void;
  existingTags: Tag[];
}

/**
 * Modal para crear nuevas etiquetas con vista previa en tiempo real
 */
export const CreateTagModal: React.FC<CreateTagModalProps> = ({
  isOpen,
  onOpenChange,
  onCreateTag,
  existingTags,
}) => {
  const [tagName, setTagName] = React.useState("");
  const [tagColor, setTagColor] = React.useState<TagColor>("primary");
  const [createAnother, setCreateAnother] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState("");

  // Limpiar estado cuando se cierra la modal
  React.useEffect(() => {
    if (!isOpen) {
      setTagName("");
      setTagColor("primary");
      setCreateAnother(false);
      setError("");
    }
  }, [isOpen]);

  // Validar nombre duplicado
  const validateTagName = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre es requerido");
      return false;
    }
    
    const isDuplicate = existingTags.some(
      tag => tag.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      setError("Ya existe una etiqueta con este nombre");
      return false;
    }
    
    setError("");
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setTagName(newName);
    if (newName) {
      validateTagName(newName);
    } else {
      setError("");
    }
  };

  const handleCreate = async () => {
    const trimmedName = tagName.trim();
    if (!validateTagName(trimmedName)) return;

    setIsCreating(true);
    try {
      const result = await onCreateTag(trimmedName, tagColor);
      
      if (createAnother) {
        // Limpiar para crear otra
        setTagName("");
        setError("");
        // Mantener el mismo color si el usuario lo prefiere
      } else {
        // Cerrar la modal
        onOpenChange(false);
      }
    } catch (error) {
      setError("Error al crear la etiqueta");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagName.trim() && !error) {
      e.preventDefault();
      handleCreate();
    }
  };

  // Vista previa de la etiqueta
  const previewTag: Tag = {
    id: "preview",
    name: tagName.trim() || "Nueva etiqueta",
    color: tagColor,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crear nueva etiqueta</DialogTitle>
          <DialogDescription>
            Ingresa un nombre y selecciona un color para tu nueva etiqueta.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Campo de nombre */}
          <div className="space-y-2">
            <Label htmlFor="tag-name">Nombre</Label>
            <Input
              id="tag-name"
              placeholder="Nombre de la etiqueta..."
              value={tagName}
              onChange={handleNameChange}
              onKeyDown={handleKeyDown}
              autoFocus
              className={cn(error && "border-destructive")}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Selector de color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_TAG_COLORS.map(({ color, label }) => {
                const colorClasses = TAG_COLOR_MAP[color];
                const isSelected = tagColor === color;
                
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
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          colorClasses.text.replace("text-", "bg-")
                        )} />
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
              <TagBadge tag={previewTag} className="text-sm" />
            </div>
          </div>

          {/* Opción de crear otra */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="create-another"
              checked={createAnother}
              onCheckedChange={(checked) => setCreateAnother(checked as boolean)}
            />
            <Label
              htmlFor="create-another"
              className="text-sm font-normal cursor-pointer"
            >
              Crear otra etiqueta después de esta
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!tagName.trim() || !!error || isCreating}
          >
            {isCreating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Creando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Crear etiqueta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};