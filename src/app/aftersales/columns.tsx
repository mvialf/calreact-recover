"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SquarePen,
  Trash2,
  Eye,
  MoreHorizontal
} from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { ProjectSummary } from '@/components/summary'
import { formatDateForTable } from '@/utils/date-helpers'
import type { AfterSales } from '@/types/afterSales'
import type { ProjectType } from '@/types/project'

// Estados definidos para postventas
const AFTERSALES_STATUS_OPTIONS = [
  { value: 'Ingresada', label: 'Ingresada' },
  { value: 'Agendada', label: 'Agendada' },
  { value: 'Reagendar', label: 'Reagendar' },
  { value: 'Completada', label: 'Completada' },
]

// Función para obtener la variante del badge según el estado
const getAfterSaleStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Ingresada':
      return 'outline'
    case 'Agendada':
      return 'secondary'
    case 'Reagendar':
      return 'destructive'
    case 'Completada':
      return 'complete'
    default:
      return 'default'
  }
}

// Tipo para AfterSales con información del proyecto
interface AfterSalesWithProject extends AfterSales {
  project?: ProjectType
}

interface AfterSalesColumnsProps {
  onEdit: (afterSale: AfterSales) => void
  onDelete: (afterSale: AfterSales) => void
  onViewDetails: (afterSale: AfterSales) => void
  projectsMap: Record<string, ProjectType>
}

export const createAfterSalesColumns = ({
  onEdit,
  onDelete,
  onViewDetails,
  projectsMap,
}: AfterSalesColumnsProps): ColumnDef<AfterSales>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todas"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "projectId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Proyecto" />
    ),
    cell: ({ row }) => {
      const afterSale = row.original
      const project = projectsMap[afterSale.projectId]

      if (!project) {
        return <span className="text-muted-foreground">Proyecto no encontrado</span>
      }

      return (
        <div className="space-y-1">
          <ProjectSummary
            project={{
              projectNumber: project.projectNumber,
              clientName: project.clientName,
              glosa: project.description
            }}
          />
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const afterSale = row.original
      const project = projectsMap[afterSale.projectId]
      if (!project) return false

      const searchTerm = value.toLowerCase()
      return (
        (project.clientName || '').toLowerCase().includes(searchTerm) ||
        project.projectNumber.toLowerCase().includes(searchTerm) ||
        (project.description || '').toLowerCase().includes(searchTerm)
      )
    },
  },
  {
    accessorKey: "entryDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Ingreso" />
    ),
    cell: ({ row }) => {
      const entryDate = row.getValue("entryDate") as Date | null

      return (
        <div className="text-sm">
          {formatDateForTable(entryDate)}
        </div>
      )
    },
  },
  {
    accessorKey: "afterSalesStatus",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("afterSalesStatus") as string
      const variant = getAfterSaleStatusBadgeVariant(status)

      return (
        <Badge variant={variant as any}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descripción" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string

      if (!description) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <div className="max-w-[300px]">
          <span className="text-sm truncate block">
            {description}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const afterSale = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onViewDetails(afterSale)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onEdit(afterSale)}
            >
              <SquarePen className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(afterSale)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Exportar opciones de estado para uso en filtros
export { AFTERSALES_STATUS_OPTIONS }