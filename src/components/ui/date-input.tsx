import * as React from "react"
import { cn } from "@/lib/utils"

export interface DateInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  /**
   * The format of the date input
   * @default "date"
   */
  dateType?: "date" | "datetime-local" | "month" | "week" | "time"
}

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, dateType = "date", ...props }, ref) => {
    return (
      <input
        type={dateType}
        ref={ref}
        data-slot="date-input"
        className={cn(
          // Base styles (compatibles con Input estándar)
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-1",
          "text-sm ring-offset-background",
          "placeholder:text-muted-foreground",
          // Focus styles
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // Disabled styles
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Date input specific styles
          "[color-scheme:light] dark:[color-scheme:dark]",
          "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
          "[&::-webkit-calendar-picker-indicator]:opacity-60",
          "hover:[&::-webkit-calendar-picker-indicator]:opacity-100",
          "dark:[&::-webkit-calendar-picker-indicator]:invert",
          className
        )}
        {...props}
      />
    )
  }
)

DateInput.displayName = "DateInput"

export { DateInput }
