"use client"

import * as React from "react"
import { Check, ListTodo, FilePlus, X, Trash2 } from "lucide-react"
import { Checkbox } from "./checkbox"
import { cn } from "@/lib/utils"
import { Label } from "./label"
import { Button } from "./button"
import { Input } from "./input"
import { Badge } from "./badge"

export interface CheckListItem {
  id: string
  description: string
  isCompleted: boolean
  createdAt?: Date
  completedAt?: Date
}

interface CheckListProps {
  items: CheckListItem[]
  onItemsChange: (items: CheckListItem[]) => void
  className?: string
  itemClassName?: string
  title?: string
}

/**
 * Genera un ID único para un nuevo item
 */
const generateItemId = (): string => {
  return Date.now().toString();
}

/**
 * Crea un nuevo CheckListItem con valores por defecto
 */
const createNewItem = (description: string): CheckListItem => {
  return {
    id: generateItemId(),
    description: description.trim(),
    isCompleted: false,
    createdAt: new Date()
  };
}

/**
 * Actualiza el estado de completado de un item con timestamps
 */
const updateItemCompletion = (item: CheckListItem, completed: boolean): CheckListItem => {
  return {
    ...item,
    isCompleted: completed,
    completedAt: completed ? new Date() : undefined
  };
}

export function CheckList({
  items,
  onItemsChange,
  className,
  itemClassName,
  title
}: CheckListProps) {
  const [isAdding, setIsAdding] = React.useState(false)
  const [newItemText, setNewItemText] = React.useState('')

  // Calcular progreso de tareas
  const completedCount = React.useMemo(
    () => items.filter(item => item.isCompleted).length,
    [items]
  );
  const totalCount = items.length;
  const progressText = `${completedCount}/${totalCount}`;

  const handleAddItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newItemText.trim()) {
      const newItem = createNewItem(newItemText);
      onItemsChange([...items, newItem]);
      setNewItemText('')
      setIsAdding(false)
    } else if (e.key === 'Escape') {
      setNewItemText('')
      setIsAdding(false)
    }
  }

  const handleToggle = (id: string, completed: boolean) => {
    const updatedItems = items.map(item =>
      item.id === id ? updateItemCompletion(item, completed) : item
    );
    onItemsChange(updatedItems);
  }

  const handleDelete = (id: string) => {
    const filteredItems = items.filter(item => item.id !== id);
    onItemsChange(filteredItems);
  }

  const handleAddButtonClick = () => {
    if (newItemText.trim()) {
      const newItem = createNewItem(newItemText);
      onItemsChange([...items, newItem]);
      setNewItemText('')
    }
    setIsAdding(false)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between  mb-2">
        {title && (
          <div className="flex items-center gap-2">
            <ListTodo className="h-6 w-6" />
            <Label className="text-md font-medium">{title}</Label>
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {progressText}
              </Badge>
            )}
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="default"
          className="gap-2"
          onClick={() => {
            setIsAdding(true)
            // Enfocar el input después de que se monte
            setTimeout(() => {
              const input = document.getElementById('new-checklist-item')
              input?.focus()
            }, 0)
          }}
        >
          <FilePlus className="h-4 w-4" />
          <span>Agregar</span>
        </Button>
      </div>
      {isAdding && (
        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-2">
            <Input
              id="new-checklist-item"
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onKeyDown={handleAddItem}
              onBlur={() => {
                if (!newItemText.trim()) {
                  setIsAdding(false)
                }
              }}
              placeholder="Nueva tarea..."
              className="flex-1"
              autoFocus
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={handleAddButtonClick}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                setNewItemText('')
                setIsAdding(false)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>          
        </div>
      )}
      {/* Contenedor de tareas */}
      <div className="space-y-2 my-2 bg-background border border-border rounded-md p-2">
        {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex items-center space-x-3 p-2 rounded-md",
            itemClassName
          )}
        >
          <Checkbox
            id={item.id}
            checked={item.isCompleted}
            onCheckedChange={(checked) => handleToggle(item.id, checked as boolean)}
          />
          <Label
            htmlFor={item.id}
            className={cn(
              "text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1",
              item.isCompleted && "line-through text-muted-foreground"
            )}
          >
            {item.description}
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              handleDelete(item.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar tarea</span>
          </Button>
        </div>
      ))}
      </div>
    </div>
  )
}
