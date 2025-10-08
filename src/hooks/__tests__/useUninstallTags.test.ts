/**
 * @fileoverview Tests para useUninstallTags hook
 * Valida integración entre hook base useTags y operaciones Firebase
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useUninstallTags } from '../useUninstallTags';
import type { UninstallTag } from '@/types/uninstall-tags';
import type { TagColor } from '@/types/tags';

// Mock del servicio uninstallTagService
jest.mock('../../services/uninstallTagService', () => ({
  getUninstallTags: jest.fn(),
  createUninstallTag: jest.fn(),
  updateUninstallTag: jest.fn(),
  deleteUninstallTag: jest.fn(),
}));

// Mock del hook base useTags
jest.mock('../useTags', () => ({
  useTags: jest.fn()
}));

import {
  getUninstallTags,
  createUninstallTag,
  updateUninstallTag,
  deleteUninstallTag
} from '../../services/uninstallTagService';
import { useTags } from '../useTags';

const mockedGetUninstallTags = getUninstallTags as jest.MockedFunction<typeof getUninstallTags>;
const mockedCreateUninstallTag = createUninstallTag as jest.MockedFunction<typeof createUninstallTag>;
const mockedUpdateUninstallTag = updateUninstallTag as jest.MockedFunction<typeof updateUninstallTag>;
const mockedDeleteUninstallTag = deleteUninstallTag as jest.MockedFunction<typeof deleteUninstallTag>;
const mockedUseTags = useTags as jest.MockedFunction<typeof useTags>;

describe('useUninstallTags', () => {
  const mockTagColor: TagColor = 'primary';

  const mockUninstallTags: UninstallTag[] = [
    {
      id: 'tag-1',
      name: 'Aluminio',
      color: 'primary',
      abbreviation: 'AL',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: 'tag-2',
      name: 'PVC',
      color: 'secondary',
      abbreviation: 'PV',
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02')
    }
  ];

  const mockBaseTagsHook = {
    selectedTags: [],
    selectTag: jest.fn(),
    unselectTag: jest.fn(),
    toggleTag: jest.fn(),
    setSelectedTags: jest.fn(),
    clearSelectedTags: jest.fn(),
    isTagSelected: jest.fn(),
    getUnselectedTags: jest.fn(),
    getTagById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock para useTags base
    mockedUseTags.mockReturnValue(mockBaseTagsHook as any);

    // Setup mock para getUninstallTags por defecto
    mockedGetUninstallTags.mockResolvedValue(mockUninstallTags);
  });

  describe('inicialización', () => {
    it('debe cargar tags al montar el hook', async () => {
      const { result } = renderHook(() => useUninstallTags());

      expect(result.current.loading).toBe(true);
      expect(mockedGetUninstallTags).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.availableTags).toEqual(mockUninstallTags);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar errores al cargar tags iniciales', async () => {
      const mockError = new Error('Failed to load tags');
      mockedGetUninstallTags.mockRejectedValue(mockError);

      const { result } = renderHook(() => useUninstallTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load tags');
      expect(result.current.availableTags).toEqual([]);
    });

    it('debe pasar tags seleccionadas iniciales al hook base', () => {
      const initialSelected = [mockUninstallTags[0]];

      renderHook(() => useUninstallTags({ initialSelected }));

      expect(mockedUseTags).toHaveBeenCalledWith({
        initialTags: [],
        initialSelected
      });
    });
  });

  describe('createTag', () => {
    it('debe crear una nueva tag y refrescar la lista', async () => {
      mockedCreateUninstallTag.mockResolvedValue('new-tag-id');
      const refreshedTags = [...mockUninstallTags, {
        id: 'new-tag-id',
        name: 'Acero',
        color: 'brown' as TagColor,
        abbreviation: 'AC',
        createdAt: new Date(),
        updatedAt: new Date()
      }];
      mockedGetUninstallTags.mockResolvedValueOnce(mockUninstallTags)
                           .mockResolvedValueOnce(refreshedTags);

      const { result } = renderHook(() => useUninstallTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createTag('Acero', 'brown', 'AC');
      });

      expect(mockedCreateUninstallTag).toHaveBeenCalledWith('Acero', 'brown');
      expect(mockedGetUninstallTags).toHaveBeenCalledTimes(2);
      expect(result.current.availableTags).toEqual(refreshedTags);
    });

    it('debe manejar errores al crear tag', async () => {
      const mockError = new Error('Creation failed');
      mockedCreateUninstallTag.mockRejectedValue(mockError);

      const { result } = renderHook(() => useUninstallTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(async () => {
        await act(async () => {
          await result.current.createTag('Error Tag', 'destructive', 'ER');
        });
      }).rejects.toThrow('Creation failed');

      expect(result.current.error).toBe('Creation failed');
    });
  });

  describe('editTag', () => {
    it('debe editar una tag existente y refrescar la lista', async () => {
      mockedUpdateUninstallTag.mockResolvedValue(undefined);
      const refreshedTags = mockUninstallTags.map(tag =>
        tag.id === 'tag-1'
          ? { ...tag, name: 'Aluminio Modificado', color: 'orange' as TagColor }
          : tag
      );
      mockedGetUninstallTags.mockResolvedValueOnce(mockUninstallTags)
                           .mockResolvedValueOnce(refreshedTags);

      const { result } = renderHook(() => useUninstallTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.editTag('tag-1', 'Aluminio Modificado', 'orange', 'AM');
      });

      expect(mockedUpdateUninstallTag).toHaveBeenCalledWith('tag-1', {
        name: 'Aluminio Modificado',
        color: 'orange'
      });
      expect(result.current.availableTags).toEqual(refreshedTags);
    });
  });

  describe('deleteTag', () => {
    it('debe eliminar una tag y refrescar la lista', async () => {
      mockedDeleteUninstallTag.mockResolvedValue(undefined);
      const refreshedTags = mockUninstallTags.filter(tag => tag.id !== 'tag-1');
      mockedGetUninstallTags.mockResolvedValueOnce(mockUninstallTags)
                           .mockResolvedValueOnce(refreshedTags);

      const { result } = renderHook(() => useUninstallTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteTag('tag-1');
      });

      expect(mockedDeleteUninstallTag).toHaveBeenCalledWith('tag-1');
      expect(result.current.availableTags).toEqual(refreshedTags);
    });

    it('debe deseleccionar tag si estaba seleccionada al eliminar', async () => {
      const mockIsTagSelected = jest.fn().mockReturnValue(true);
      const mockUnselectTag = jest.fn();

      mockedUseTags.mockReturnValue({
        ...mockBaseTagsHook,
        isTagSelected: mockIsTagSelected,
        unselectTag: mockUnselectTag
      } as any);

      mockedDeleteUninstallTag.mockResolvedValue(undefined);

      const { result } = renderHook(() => useUninstallTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteTag('tag-1');
      });

      expect(mockIsTagSelected).toHaveBeenCalledWith('tag-1');
      expect(mockUnselectTag).toHaveBeenCalledWith('tag-1');
    });
  });

  describe('refreshTags', () => {
    it('debe refrescar manualmente la lista de tags', async () => {
      const newTags = [mockUninstallTags[0]];
      mockedGetUninstallTags.mockResolvedValueOnce(mockUninstallTags)
                           .mockResolvedValueOnce(newTags);

      const { result } = renderHook(() => useUninstallTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshTags();
      });

      expect(mockedGetUninstallTags).toHaveBeenCalledTimes(2);
      expect(result.current.availableTags).toEqual(newTags);
    });
  });

  describe('integración con hook base useTags', () => {
    it('debe exponer todas las funciones del hook base', () => {
      const { result } = renderHook(() => useUninstallTags());

      // Verificar que todas las funciones del hook base están disponibles
      expect(result.current.selectedTags).toBeDefined();
      expect(result.current.selectTag).toBeDefined();
      expect(result.current.unselectTag).toBeDefined();
      expect(result.current.toggleTag).toBeDefined();
      expect(result.current.setSelectedTags).toBeDefined();
      expect(result.current.clearSelectedTags).toBeDefined();
      expect(result.current.isTagSelected).toBeDefined();
      expect(result.current.getUnselectedTags).toBeDefined();
      expect(result.current.getTagById).toBeDefined();
    });

    it('debe pasar availableTags actualizadas al hook base', async () => {
      const { result } = renderHook(() => useUninstallTags());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Verificar que useTags se llama con las tags cargadas
      expect(mockedUseTags).toHaveBeenCalledWith({
        initialTags: mockUninstallTags,
        initialSelected: []
      });
    });
  });
});