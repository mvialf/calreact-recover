import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { TagBadgeProps } from "@/types/tags";
import { TAG_COLOR_MAP } from "@/types/tags";

/**
 * Componente TagBadge - Muestra una etiqueta individual estilo Trello
 * Utiliza los colores personalizados definidos en globals.css
 */
export const TagBadge = React.forwardRef<HTMLDivElement, TagBadgeProps>(
  ({ tag, removable = false, onRemove, className, ...props }, ref) => {
    const colorClasses = TAG_COLOR_MAP[tag.color];

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.(tag.id);
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Estilos base del badge estilo Trello
          "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium",
          "rounded-md border transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          // Colores dinámicos usando CSS variables
          colorClasses.bg,
          colorClasses.text,
          colorClasses.border + "/20",
          className
        )}
        {...props}
      >
        <span className="truncate max-w-[120px]" title={tag.name}>
          {tag.name}
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
