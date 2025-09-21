// src/__tests__/helpers/uninstall-tags-helpers.ts
// Helper centralizado para mocks de uninstall tags

import type { UninstallTag } from '@/types/uninstall-tags';
import type { Tag } from '@/components/ui/tags';

// Mock data para uninstall tags
export const mockUninstallTags: UninstallTag[] = [
  {
    id: 'tag-1',
    name: 'Cortina',
    color: 'sky',
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'tag-2',
    name: 'Persiana',
    color: 'complete',
    createdAt: new Date('2025-01-02'),
  },
  {
    id: 'tag-3',
    name: 'Toldo',
    color: 'destructive',
    createdAt: new Date('2025-01-03'),
  },
];

// Mock para el hook useUninstallTags
export const createMockUseUninstallTags = (
  availableTags: UninstallTag[] = mockUninstallTags
) => ({
  availableTags,
  loading: false,
  error: null,
  createTag: jest.fn().mockImplementation(async (tagData: Partial<UninstallTag>) => {
    const newTag: UninstallTag = {
      id: `tag-${Date.now()}`,
      name: tagData.name || 'Nueva Tag',
      color: tagData.color || 'primary',
      createdAt: new Date(),
    };
    return newTag;
  }),
  editTag: jest.fn().mockImplementation(async (id: string, updates: Partial<UninstallTag>) => {
    const existingTag = availableTags.find(tag => tag.id === id);
    if (existingTag) {
      return { ...existingTag, ...updates };
    }
    throw new Error('Tag not found');
  }),
  deleteTag: jest.fn().mockImplementation(async (id: string) => {
    return true;
  }),
});

// Helper para conversión de tipos (mirrors the real helper)
export const convertUninstallTagToTag = (uninstallTag: UninstallTag): Tag => ({
  ...uninstallTag,
  color: uninstallTag.color as Tag['color'], // Type cast como en el código real
});

// Mock global para el módulo useUninstallTags
export const mockUseUninstallTagsModule = (
  availableTags: UninstallTag[] = mockUninstallTags
) => {
  const mockHook = createMockUseUninstallTags(availableTags);

  jest.doMock('@/hooks/useUninstallTags', () => ({
    useUninstallTags: jest.fn(() => mockHook),
  }));

  return mockHook;
};

// Helper para resetear mocks
export const resetUninstallTagsMocks = () => {
  jest.clearAllMocks();
};

// Factory para crear tags de prueba
export const createTestUninstallTag = (overrides: Partial<UninstallTag> = {}): UninstallTag => ({
  id: `test-tag-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Test Tag',
  color: 'primary',
  createdAt: new Date(),
  ...overrides,
});

// Factory para crear arrays de tags de prueba
export const createTestUninstallTags = (count: number = 3): UninstallTag[] => {
  return Array.from({ length: count }, (_, index) =>
    createTestUninstallTag({
      id: `test-tag-${index + 1}`,
      name: `Test Tag ${index + 1}`,
      color: ['sky', 'complete', 'destructive', 'yellow', 'purple'][index % 5] as any,
    })
  );
};

// Tests básicos para verificar que los helpers funcionan
describe('UninstallTags Helpers', () => {
  it('debe crear tags de prueba correctamente', () => {
    const tag = createTestUninstallTag();
    expect(tag).toMatchObject({
      id: expect.any(String),
      name: 'Test Tag',
      color: 'primary',
      createdAt: expect.any(Date),
    });
  });

  it('debe convertir UninstallTag a Tag correctamente', () => {
    const uninstallTag = mockUninstallTags[0];
    const convertedTag = convertUninstallTagToTag(uninstallTag);

    expect(convertedTag).toMatchObject({
      id: uninstallTag.id,
      name: uninstallTag.name,
      color: uninstallTag.color,
      createdAt: uninstallTag.createdAt,
    });
  });

  it('debe crear mock de useUninstallTags correctamente', () => {
    const mock = createMockUseUninstallTags();

    expect(mock).toMatchObject({
      availableTags: expect.any(Array),
      loading: false,
      error: null,
      createTag: expect.any(Function),
      editTag: expect.any(Function),
      deleteTag: expect.any(Function),
    });
  });
});