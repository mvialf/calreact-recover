import * as React from "react";
import type { Tag, TagColor } from "@/types/tags";

/**
 * Hook personalizado para manejar etiquetas
 * Proporciona funcionalidades comunes para el sistema de etiquetas estilo Trello
 */
export interface UseTagsOptions {
  initialTags?: Tag[];
  initialSelected?: Tag[];
}

export interface UseTagsReturn {
  // Estado
  availableTags: Tag[];
  selectedTags: Tag[];
  
  // Acciones para etiquetas disponibles
  addAvailableTag: (name: string, color: TagColor) => void;
  removeAvailableTag: (tagId: string) => void;
  updateAvailableTag: (tagId: string, updates: Partial<Omit<Tag, 'id'>>) => void;
  
  // Acciones para etiquetas seleccionadas
  selectTag: (tag: Tag) => void;
  unselectTag: (tagId: string) => void;
  toggleTag: (tag: Tag) => void;
  setSelectedTags: (tags: Tag[]) => void;
  clearSelectedTags: () => void;
  
  // Utilidades
  isTagSelected: (tagId: string) => boolean;
  getUnselectedTags: () => Tag[];
  getTagById: (tagId: string) => Tag | undefined;
}

export const useTags = ({
  initialTags = [],
  initialSelected = []
}: UseTagsOptions = {}): UseTagsReturn => {
  // Estado para etiquetas disponibles
  const [availableTags, setAvailableTags] = React.useState<Tag[]>(initialTags);
  
  // Estado para etiquetas seleccionadas
  const [selectedTags, setSelectedTagsState] = React.useState<Tag[]>(initialSelected);

  // Funciones para manejar etiquetas disponibles
  const addAvailableTag = React.useCallback((name: string, color: TagColor) => {
    const newTag: Tag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: name.trim(),
      color,
      createdAt: new Date()
    };
    setAvailableTags(prev => [...prev, newTag]);
  }, []);

  const removeAvailableTag = React.useCallback((tagId: string) => {
    setAvailableTags(prev => prev.filter(tag => tag.id !== tagId));
    // También remover de seleccionadas si estaba seleccionada
    setSelectedTagsState(prev => prev.filter(tag => tag.id !== tagId));
  }, []);

  const updateAvailableTag = React.useCallback((tagId: string, updates: Partial<Omit<Tag, 'id'>>) => {
    setAvailableTags(prev => prev.map(tag => 
      tag.id === tagId ? { ...tag, ...updates } : tag
    ));
    
    // Actualizar también en seleccionadas si está presente
    setSelectedTagsState(prev => prev.map(tag =>
      tag.id === tagId ? { ...tag, ...updates } : tag
    ));
  }, []);

  // Funciones para manejar etiquetas seleccionadas
  const selectTag = React.useCallback((tag: Tag) => {
    setSelectedTagsState(prev => {
      const isAlreadySelected = prev.some(selected => selected.id === tag.id);
      return isAlreadySelected ? prev : [...prev, tag];
    });
  }, []);

  const unselectTag = React.useCallback((tagId: string) => {
    setSelectedTagsState(prev => prev.filter(tag => tag.id !== tagId));
  }, []);

  const toggleTag = React.useCallback((tag: Tag) => {
    setSelectedTagsState(prev => {
      const isSelected = prev.some(selected => selected.id === tag.id);
      return isSelected 
        ? prev.filter(selected => selected.id !== tag.id)
        : [...prev, tag];
    });
  }, []);

  const setSelectedTags = React.useCallback((tags: Tag[]) => {
    setSelectedTagsState(tags);
  }, []);

  const clearSelectedTags = React.useCallback(() => {
    setSelectedTagsState([]);
  }, []);

  // Funciones de utilidad
  const isTagSelected = React.useCallback((tagId: string) => {
    return selectedTags.some(tag => tag.id === tagId);
  }, [selectedTags]);

  const getUnselectedTags = React.useCallback(() => {
    return availableTags.filter(tag => !isTagSelected(tag.id));
  }, [availableTags, isTagSelected]);

  const getTagById = React.useCallback((tagId: string) => {
    return availableTags.find(tag => tag.id === tagId);
  }, [availableTags]);

  return {
    // Estado
    availableTags,
    selectedTags,
    
    // Acciones para etiquetas disponibles
    addAvailableTag,
    removeAvailableTag,
    updateAvailableTag,
    
    // Acciones para etiquetas seleccionadas
    selectTag,
    unselectTag,
    toggleTag,
    setSelectedTags,
    clearSelectedTags,
    
    // Utilidades
    isTagSelected,
    getUnselectedTags,
    getTagById
  };
};
