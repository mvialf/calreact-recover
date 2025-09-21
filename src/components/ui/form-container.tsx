"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const formContainerVariants = cva("w-full", {
  variants: {
    spacing: {
      tight: "space-y-3",    // 10px - Formularios compactos
      normal: "space-y-4",   // 16px - Estándar (default)
      loose: "space-y-6",    // 24px - Formularios con más respiración
      extra: "space-y-8"     // 32px - Máximo spacing
    }
  },
  defaultVariants: {
    spacing: "normal"
  }
})

const formGridVariants = cva("grid gap-4", {
  variants: {
    columns: {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-4",
      "3-1": "grid-cols-1 md:grid-cols-4",  // Para 3/4 + 1/4 layout
      "2-1": "grid-cols-1 md:grid-cols-3",  // Para 2/3 + 1/3 layout
    }
  },
  defaultVariants: {
    columns: 2
  }
})

// Variants para elementos hijos específicos
const getChildClasses = (columns: string | number | null | undefined, index: number) => {
  if (columns === "3-1") {
    return index === 0 ? "md:col-span-3" : "md:col-span-1"
  }
  if (columns === "2-1") {
    return index === 0 ? "md:col-span-2" : "md:col-span-1"
  }
  return ""
}

export interface FormContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
          VariantProps<typeof formContainerVariants> {}

export interface FormGridProps
  extends React.HTMLAttributes<HTMLDivElement>,
          VariantProps<typeof formGridVariants> {}

export const FormContainer = React.forwardRef<
  HTMLDivElement,
  FormContainerProps
>(({ className, spacing, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(formContainerVariants({ spacing }), className)}
    {...props}
  />
))
FormContainer.displayName = "FormContainer"

export const FormGrid = React.forwardRef<
  HTMLDivElement,
  FormGridProps
>(({ className, columns, children, ...props }, ref) => {
  // Clone children and add appropriate col-span classes
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      const childClasses = getChildClasses(columns, index)
      return React.cloneElement(child, {
        ...child.props,
        className: cn(childClasses, child.props.className)
      } as any)
    }
    return child
  })

  return (
    <div
      ref={ref}
      className={cn(formGridVariants({ columns }), className)}
      {...props}
    >
      {enhancedChildren}
    </div>
  )
})
FormGrid.displayName = "FormGrid"

export const FormSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", className)}
    {...props}
  />
))
FormSection.displayName = "FormSection"