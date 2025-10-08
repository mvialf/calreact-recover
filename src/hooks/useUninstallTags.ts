/**
 * Hook para manejo de tags de desinstalación con persistencia en Firebase
 * Reutiliza el hook base useTags y extiende con operaciones Firebase
 */

import * as React from 'react';
import type { Tag, TagColor } from '@/types/tags';
import { useTags, type UseTagsOptions } from './useTags';
import {
  getUninstallTags,
  createUninstallTag,
  updateUninstallTag,
  deleteUninstallTag,
} from '@/services/uninstallTagService';

interface UseUninstallTagsOptions {
  initialSelected?: Tag[];
}

interface UseUninstallTagsReturn {
  // Reutiliza interfaz completa del hook base
  availableTags: Tag[];
  selectedTags: Tag[];
  selectTag: (tag: Tag) => void;
  unselectTag: (tagId: string) => void;
  toggleTag: (tag: Tag) => void;
  setSelectedTags: (tags: Tag[]) => void;
  clearSelectedTags: () => void;
  isTagSelected: (tagId: string) => boolean;
  getUnselectedTags: () => Tag[];
  getTagById: (tagId: string) => Tag | undefined;

  // Extiende con operaciones Firebase
  createTag: (name: string, color: TagColor, abbreviation: string) => Promise<void>;
  editTag: (tagId: string, name: string, color: TagColor, abbreviation: string) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;
  refreshTags: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useUninstallTags = ({
  initialSelected = []
}: UseUninstallTagsOptions = {}): UseUninstallTagsReturn => {

  // Estado para tags disponibles desde Firebase
  const [availableTags, setAvailableTags] = React.useState<Tag[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reutiliza el hook base para toda la lógica de selección
  const {
    selectedTags,
    selectTag,
    unselectTag,
    toggleTag,
    setSelectedTags,
    clearSelectedTags,
    isTagSelected,
    getUnselectedTags,
    getTagById,
  } = useTags({
    initialTags: availableTags,
    initialSelected
  });

  // Operaciones Firebase
  const refreshTags = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tags = await getUninstallTags();
      setAvailableTags(tags);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar tags';
      setError(errorMessage);
      console.error('Error cargando uninstall tags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTag = React.useCallback(async (name: string, color: TagColor, abbreviation: string) => {
    try {
      setError(null);
      await createUninstallTag(name, color, abbreviation);
      await refreshTags(); // Recargar lista
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear tag';
      setError(errorMessage);
      throw err;
    }
  }, [refreshTags]);

  const editTag = React.useCallback(async (tagId: string, name: string, color: TagColor, abbreviation: string) => {
    try {
      setError(null);
      await updateUninstallTag(tagId, { name, color, abbreviation });
      await refreshTags();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al editar tag';
      setError(errorMessage);
      throw err;
    }
  }, [refreshTags]);

  const deleteTag = React.useCallback(async (tagId: string) => {
    try {
      setError(null);
      await deleteUninstallTag(tagId);
      // Remover de seleccionadas si estaba seleccionada
      if (isTagSelected(tagId)) {
        unselectTag(tagId);
      }
      await refreshTags();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar tag';
      setError(errorMessage);
      throw err;
    }
  }, [refreshTags, isTagSelected, unselectTag]);

  // Cargar tags al montar el componente
  React.useEffect(() => {
    refreshTags();
  }, [refreshTags]);

  return {
    // Interfaz completa del hook base reutilizada
    availableTags,
    selectedTags,
    selectTag,
    unselectTag,
    toggleTag,
    setSelectedTags,
    clearSelectedTags,
    isTagSelected,
    getUnselectedTags,
    getTagById,

    // Operaciones Firebase extendidas
    createTag,
    editTag,
    deleteTag,
    refreshTags,
    loading,
    error,
  };
};