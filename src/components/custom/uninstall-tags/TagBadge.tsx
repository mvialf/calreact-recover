import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Tag } from "@/types/tags";
import { TAG_COLORS } from "./colors";

/**
 * Componente TagBadge - Muestra una etiqueta individual estilo Trello
 *
 * Utiliza colores hex directos para renderizado dinámico sin limitaciones de Tailwind.
 */
interface TagBadgeProps {
  tag: Tag;
  removable?: boolean;
  onRemove?: (tagId: string) => void;
  className?: string;
}

export const TagBadge = React.forwardRef<HTMLDivElement, TagBadgeProps>(
  ({ tag, removable = false, onRemove, className, ...props }, ref) => {
    const colors = TAG_COLORS[tag.color];

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.(tag.id);
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Estilos base del badge estilo Trello moderno (sin borde)
          "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium",
          "rounded-md transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        style={{
          backgroundColor: colors.bg,
          color: colors.text
        }}
        {...props}
      >
        <span className="truncate max-w-[120px]" title={tag.name}>
          {tag.abbreviation || tag.name}
        </span>
        
        {removable && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-3 w-3 p-0  ml-1 hover:bg-black/10 rounded-sm",
              "focus:ring-1 focus:ring-offset-0 focus:ring-current",
              "transition-colors"
            )}
            onClick={handleRemove}
            aria-label={`Remover etiqueta ${tag.name}`}
          >
            <X className="h-2.5 w-2.5" />
          </Button>
        )}
      </div>
    );
  }
);

TagBadge.displayName = "TagBadge";
