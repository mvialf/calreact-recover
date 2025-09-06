import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { NumericFormat, NumericFormatProps } from "react-number-format";

type InputProps = React.ComponentProps<typeof Input>;

export interface MoneyInputProps
  extends Omit<InputProps, 'onChange' | 'value' | 'defaultValue' | 'type'> {
  /**
   * Prefijo que se muestra antes del valor (por defecto: "$ ")
   */
  prefix?: string;
  /**
   * Separador de miles (por defecto: ".")
   */
  groupSeparator?: string;
  /**
   * Separador decimal (por defecto: ",")
   */
  decimalSeparator?: string;
  /**
   * Cantidad de decimales a mostrar (por defecto: 2)
   */
  decimalScale?: number;
  /**
   * Valor actual del input (opcional, para controlar el componente)
   */
  value?: number | null;
  /**
   * Valor por defecto (para componentes no controlados)
   */
  defaultValue?: number | null;
  /**
   * Callback que se ejecuta cuando el valor cambia
   * @param value - Valor numérico (o undefined si está vacío)
   */
  onValueChange?: (value: number | undefined) => void;
  /**
   * Si es true, permite valores negativos (por defecto: false)
   */
  allowNegative?: boolean;
  /**
   * Texto de la etiqueta
   */
  label?: string;
  /**
   * Clases personalizadas para la etiqueta
   */
  labelClassName?: string;
  /**
   * Si es true, muestra un indicador de campo requerido
   */
  required?: boolean;
  /**
   * Clases personalizadas para el contenedor
   */
  containerClassName?: string;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  (
    {
      className,
      prefix = "$ ",
      groupSeparator = ".",
      decimalSeparator = ",",
      decimalScale = 0,
      onValueChange,
      value,
      defaultValue,
      allowNegative = false,
      label,
      labelClassName,
      required = false,
      containerClassName,
      id: propId,
      ...props
    },
    ref
  ) => {
    // Generar un ID único si no se proporciona uno
    const id = React.useId()
    const inputId = propId || `money-input-${id}`

    const handleValueChange: NumericFormatProps["onValueChange"] = (values) => {
      const { floatValue } = values;
      onValueChange?.(floatValue);
    };

    // Extraemos type de las props para evitar conflictos de manera segura
    const { type: _, ...restProps } = props as { type?: string };
    
    // Si no hay label, retornar solo el input
    if (!label) {
      return (
        <NumericFormat
          {...restProps}
          getInputRef={ref}
          className={cn(
            "flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          thousandSeparator={groupSeparator}
          decimalSeparator={decimalSeparator}
          decimalScale={decimalScale}
          prefix={prefix}
          value={value ?? ""}
          onValueChange={handleValueChange}
          allowNegative={allowNegative}
          id={inputId}
          required={required}
        />
      );
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
        <NumericFormat
          {...restProps}
          getInputRef={ref}
          className={cn(
            "flex h-8 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          thousandSeparator={groupSeparator}
          decimalSeparator={decimalSeparator}
          decimalScale={decimalScale}
          prefix={prefix}
          value={value ?? ""}
          onValueChange={handleValueChange}
          allowNegative={allowNegative}
          id={inputId}
          required={required}
        />
      </div>
    )
  }
);

MoneyInput.displayName = "MoneyInput";

export { MoneyInput };

// Ejemplo de uso:
// <MoneyInput 
//   value={amount} 
//   onValueChange={(value) => setAmount(value)} 
//   placeholder="Ingrese el monto"
//   className="w-full"
// />
