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
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Phone,
  MapPin
} from "lucide-react"
import { format as formatDate } from 'date-fns'
import { es } from 'date-fns/locale'

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import type { Visit, VisitStatus } from '@/services/visitService'

// Función de estilos de estado - manteniendo la implementación exacta
const getStatusVariant = (status: VisitStatus) => {
  switch (status) {
    case 'Completada':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Agendada':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Reagendada':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Cancelada':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: // Ingresada
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

interface VisitsColumnsProps {
  onEdit: (visit: Visit) => void
  onDelete: (visit: Visit) => void
  onViewDetails: (visitId?: string) => void
}

export const createVisitsColumns = ({
  onEdit,
  onDelete,
  onViewDetails,
}: VisitsColumnsProps): ColumnDef<Visit>[] => [
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string

      if (!name) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <div className="font-medium">
          {name}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const name = row.getValue(id) as string
      return name?.toLowerCase().includes(value.toLowerCase()) ?? false
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Teléfono" />
    ),
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string

      if (!phone) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <div className="flex items-center space-x-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{phone}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const phone = row.getValue(id) as string
      return phone?.includes(value) ?? false
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dirección" />
    ),
    cell: ({ row }) => {
      const visit = row.original
      const address = visit.address
      const municipality = visit.municipality

      if (!address && !municipality) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              {address && (
                <div className="font-medium text-sm truncate">
                  {address}
                </div>
              )}
              {municipality && (
                <div className="text-xs text-muted-foreground">
                  {municipality}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const visit = row.original
      const searchTerm = value.toLowerCase()
      const address = visit.address?.toLowerCase() ?? ''
      const municipality = visit.municipality?.toLowerCase() ?? ''

      return address.includes(searchTerm) || municipality.includes(searchTerm)
    },
  },
  {
    accessorKey: "scheduledDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha Agendada" />
    ),
    cell: ({ row }) => {
      const scheduledDate = row.getValue("scheduledDate") as Date | string | null

      if (!scheduledDate) {
        return <span className="text-muted-foreground">—</span>
      }

      try {
        const date = scheduledDate instanceof Date ? scheduledDate : new Date(scheduledDate)
        return (
          <div className="text-sm">
            {formatDate(date, 'PPP', { locale: es })}
          </div>
        )
      } catch (error) {
        return <span className="text-muted-foreground">Fecha inválida</span>
      }
    },
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.getValue("scheduledDate") as Date | string | null
      const dateB = rowB.getValue("scheduledDate") as Date | string | null

      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      const parsedA = dateA instanceof Date ? dateA : new Date(dateA)
      const parsedB = dateB instanceof Date ? dateB : new Date(dateB)

      return parsedA.getTime() - parsedB.getTime()
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as VisitStatus

      if (!status) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <Badge className={getStatusVariant(status)}>
          {status}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "observations",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Observaciones" />
    ),
    cell: ({ row }) => {
      const observations = row.getValue("observations") as string

      if (!observations) {
        return <span className="text-muted-foreground">—</span>
      }

      return (
        <div className="max-w-[200px]">
          <span className="text-sm truncate block" title={observations}>
            {observations}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const visit = row.original

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
              onClick={() => onViewDetails(visit.id)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onEdit(visit)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar visita
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(visit)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar visita
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Exportar opciones para filtros
export const VISIT_STATUS_OPTIONS = [
  { value: 'Ingresada', label: 'Ingresada' },
  { value: 'Agendada', label: 'Agendada' },
  { value: 'Reagendada', label: 'Reagendada' },
  { value: 'Completada', label: 'Completada' },
  { value: 'Cancelada', label: 'Cancelada' },
]