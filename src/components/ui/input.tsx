import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suffix?: string;
  label?: string;
  labelClassName?: string;
  required?: boolean;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    suffix, 
    label,
    labelClassName,
    required = false,
    containerClassName,
    id: propId,
    ...props 
  }, ref) => {
    // Generar un ID único si no se proporciona uno
    const id = React.useId()
    const inputId = propId || `input-${id}`

    // Crear el elemento input común
    const inputElement = (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          suffix ? 'pr-0' : '',
          className
        )}
        ref={ref}
        id={inputId}
        required={required}
        {...props}
      />
    )

    // Si hay un suffix, envolver el input en un contenedor
    const inputWithSuffix = suffix ? (
      <div className={cn(
        "flex items-center h-10 rounded-md border border-input bg-background ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        props.disabled && "opacity-50"
      )}>
        {inputElement}
        <span className="pr-0.5 py-2 text-muted-foreground">{suffix}</span>
      </div>
    ) : inputElement

    // Si no hay label, retornar solo el input con el sufijo si existe
    if (!label) {
      return suffix ? inputWithSuffix : inputElement;
    }

    // Si hay label, retornar el contenedor con label + input
    return (
      <div className={cn("space-y-1 w-full", containerClassName)}>
        <label 
          htmlFor={inputId} 
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {suffix ? inputWithSuffix : inputElement}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }