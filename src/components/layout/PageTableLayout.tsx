"use client";

import React, { ReactNode, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ArrowUpDown, ChevronUp, ChevronDown, Briefcase } from 'lucide-react';
import TablePagination from '@/components/table/table-pagination';

// Tipos para el componente base
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (item: T, index: number) => ReactNode;
}

export interface PageTableLayoutProps<T = any> {
  // Header
  title: string;
  actionButton?: ReactNode;
  
  // Filtros
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  additionalFilters?: ReactNode;
  
  // Tabla
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyStateIcon?: ReactNode;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  
  // Selección múltiple (opcional)
  selectable?: boolean;
  selectedRows?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAll?: (isChecked: boolean) => void;
  getRowId?: (item: T) => string;
  
  // Ordenamiento (opcional)
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  
  // Paginación (opcional)
  pagination?: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  
  // Personalización
  rowClassName?: (item: T, index: number) => string;
  skeletonRowCount?: number;
}

export function PageTableLayout<T = any>({
  title,
  actionButton,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  additionalFilters,
  columns,
  data,
  loading = false,
  emptyStateIcon = <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-2" />,
  emptyStateTitle = "No se encontraron registros",
  emptyStateSubtitle = "No hay datos que coincidan con los filtros actuales.",
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  getRowId = (item: any) => item.id,
  sortBy,
  sortOrder = 'desc',
  onSort,
  pagination,
  rowClassName,
  skeletonRowCount = 10
}: PageTableLayoutProps<T>) {

  // Renderizar ícono de ordenamiento
  const renderSortIcon = (field: string) => {
    if (!onSort) return null;
    if (sortBy === field) {
      return sortOrder === 'asc' ? 
        <ChevronUp className="h-4 w-4 ml-1" /> : 
        <ChevronDown className="h-4 w-4 ml-1" />;
    }
    return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
  };

  // Calcular si todos los elementos están seleccionados
  const allSelected = useMemo(() => {
    if (!selectable || data.length === 0) return false;
    return selectedRows.length === data.length && data.every(item => selectedRows.includes(getRowId(item)));
  }, [selectable, selectedRows, data, getRowId]);

  return (
    <div className="w-full max-w-none px-4 pb-2 bg-background">
      {/* Header de la página */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">{title}</h1>
        {actionButton}
      </div>
      
      {/* Tabla principal */}
      <Card>
        {/* Controles de Filtro y Acciones */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 w-96"
            />
          </div>
          {additionalFilters && (
            <div className="flex items-center gap-4">
              {additionalFilters}
            </div>
          )}
        </div>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Checkbox de selección múltiple */}
                {selectable && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => onSelectAll?.(!!checked)}
                    />
                  </TableHead>
                )}
                
                {/* Headers de columnas */}
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`${column.sortable && onSort ? 'cursor-pointer' : ''} ${
                      column.align === 'center' ? 'text-center justify-center' :
                      column.align === 'right' ? 'text-right' : ''
                    } ${column.width || ''}`}
                    onClick={column.sortable && onSort ? () => onSort(column.key) : undefined}
                  >
                    <div className={`flex items-center ${
                      column.align === 'center' ? 'justify-center' :
                      column.align === 'right' ? 'justify-end' : ''
                    }`}>
                      {column.label}
                      {column.sortable && renderSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {loading ? (
                // Skeletons durante carga
                Array.from({ length: skeletonRowCount }).map((_, i) => (
                  <TableRow key={i}>
                    {selectable && (
                      <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        <Skeleton className={`h-4 ${
                          column.align === 'right' ? 'ml-auto' : ''
                        } ${column.key === 'title' ? 'w-32' : 'w-20'}`} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data.length > 0 ? (
                // Datos reales
                data.map((item, index) => (
                  <TableRow 
                    key={getRowId(item)} 
                    data-state={selectable && selectedRows.includes(getRowId(item)) ? 'selected' : undefined}
                    className={rowClassName?.(item, index)}
                  >
                    {selectable && (
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.includes(getRowId(item))}
                          onCheckedChange={() => onSelectRow?.(getRowId(item))}
                        />
                      </TableCell>
                    )}
                    
                    {columns.map((column) => (
                      <TableCell 
                        key={column.key}
                        className={
                          column.align === 'center' ? 'text-center' :
                          column.align === 'right' ? 'text-right' : ''
                        }
                      >
                        {column.render ? column.render(item, index) : (item as any)[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // Estado vacío
                <TableRow>
                  <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="h-24 text-center">
                    {emptyStateIcon}
                    <p className="font-medium">{emptyStateTitle}</p>
                    <p className="text-sm text-muted-foreground">{emptyStateSubtitle}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Paginación */}
          {pagination && pagination.totalItems > pagination.itemsPerPage && (
            <div className="flex items-center justify-between p-4 border-b">
              <TablePagination 
                className="flex justify-between items-center"
                currentPage={pagination.currentPage}
                onPageChange={pagination.onPageChange}
                pageSize={pagination.itemsPerPage}
                onPageSizeChange={pagination.onPageSizeChange}
                totalItems={pagination.totalItems}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PageTableLayout;