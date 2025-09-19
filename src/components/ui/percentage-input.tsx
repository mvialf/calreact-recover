import * as React from "react";
import { cn } from "@/lib/utils";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import { NUMERIC_LIMITS } from "@/constants/validation";

type InputProps = React.ComponentProps<"input">;

export interface PercentageInputProps
  extends Omit<InputProps, 'onChange' | 'value' | 'defaultValue' | 'type'> {
  /**
   * Valor actual del input (0-100)
   */
  value?: number | null;
  /**
   * Valor por defecto (para componentes no controlados)
   */
  defaultValue?: number | null;
  /**
   * Callback que se ejecuta cuando el valor cambia
   * @param value - Valor numérico entre 0-100 (o undefined si está vacío)
   */
  onValueChange?: (value: number | undefined) => void;
  /**
   * Cantidad de decimales a mostrar (por defecto: 1)
   */
  decimalScale?: number;
  /**
   * Si es true, permite valores fuera del rango 0-100 (por defecto: false)
   */
  allowOutOfRange?: boolean;
}

const PercentageInput = React.forwardRef<HTMLInputElement, PercentageInputProps>(
  (
    {
      className,
      decimalScale = 1,
      onValueChange,
      value,
      defaultValue,
      allowOutOfRange = false,
      ...props
    },
    ref
  ) => {
    const handleValueChange: NumericFormatProps["onValueChange"] = (values) => {
      const { floatValue } = values;
      onValueChange?.(floatValue);
    };

    // Extraemos type de las props para evitar conflictos de manera segura
    const { type: _, ...restProps } = props as { type?: string };

    return (
      <NumericFormat
        {...restProps}
        getInputRef={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        suffix=" %"
        decimalScale={decimalScale}
        value={value ?? ""}
        onValueChange={handleValueChange}
        allowNegative={false}
        isAllowed={(values) => {
          if (allowOutOfRange) return true;
          const { floatValue } = values;
          if (floatValue === undefined) return true;
          return floatValue >= NUMERIC_LIMITS.PERCENTAGE_MIN &&
                 floatValue <= NUMERIC_LIMITS.PERCENTAGE_MAX;
        }}
      />
    );
  }
);

PercentageInput.displayName = "PercentageInput";

export { PercentageInput };

// Ejemplo de uso:
// <PercentageInput
//   value={percentage}
//   onValueChange={(value) => setPercentage(value)}
//   placeholder="0.0"
//   className="w-full"
//   decimalScale={1}
// />