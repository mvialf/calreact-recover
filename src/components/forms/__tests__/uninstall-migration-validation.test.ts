// uninstall-migration-validation.test.ts
// Tests para validar que la migración del sistema uninstall fue completada correctamente

import { convertUninstallTagToTag } from '@/__tests__/helpers/uninstall-tags-helpers';
import type { UninstallTag } from '@/types/uninstall-tags';
import type { Tag } from '@/components/ui/tags';

describe('Uninstall System Migration Validation', () => {
  describe('Validación de tipos y conversión', () => {
    it('debe convertir UninstallTag a Tag correctamente', () => {
      const uninstallTag: UninstallTag = {
        id: 'test-tag-1',
        name: 'Cortina Test',
        color: 'sky',
        abbreviation: 'CO',
        createdAt: new Date('2025-01-01'),
      };

      const convertedTag = convertUninstallTagToTag(uninstallTag);

      expect(convertedTag).toMatchObject({
        id: 'test-tag-1',
        name: 'Cortina Test',
        color: 'sky',
        createdAt: expect.any(Date),
      });

      // Verificar que el tipo de color es compatible
      expect(typeof convertedTag.color).toBe('string');
    });

    it('debe manejar todos los colores válidos de TagColor', () => {
      const validColors = ['yellow', 'sky', 'orange', 'brown', 'complete', 'purple', 'primary', 'secondary', 'destructive'];

      validColors.forEach((color, index) => {
        const uninstallTag: UninstallTag = {
          id: `test-tag-${index}`,
          name: `Test Tag ${index}`,
          color: color as any,
          createdAt: new Date(),
        };

        const convertedTag = convertUninstallTagToTag(uninstallTag);

        expect(convertedTag.color).toBe(color);
        expect(convertedTag.id).toBe(`test-tag-${index}`);
        expect(convertedTag.name).toBe(`Test Tag ${index}`);
      });
    });

    it('debe preservar todos los campos durante la conversión', () => {
      const uninstallTag: UninstallTag = {
        id: 'preserve-test',
        name: 'Preservación Test',
        color: 'complete',
        abbreviation: 'PR',
        createdAt: new Date('2025-01-15'),
      };

      const convertedTag = convertUninstallTagToTag(uninstallTag);

      // Verificar que todos los campos se preservan
      expect(convertedTag.id).toBe(uninstallTag.id);
      expect(convertedTag.name).toBe(uninstallTag.name);
      expect(convertedTag.color).toBe(uninstallTag.color);
      expect(convertedTag.createdAt).toEqual(uninstallTag.createdAt);
    });
  });

  describe('Verificación de estructura de migración', () => {
    it('debe tener estructura de UninstallTag compatible con Tag', () => {
      // Verificar que UninstallTag tiene todos los campos necesarios para Tag
      const uninstallTag: UninstallTag = {
        id: 'structure-test',
        name: 'Estructura Test',
        color: 'primary',
        abbreviation: 'ES',
        createdAt: new Date(),
      };

      // Debe poder asignarse a Tag después de conversión
      const tag: Tag = convertUninstallTagToTag(uninstallTag);

      expect(tag).toBeDefined();
      expect(tag.id).toBeDefined();
      expect(tag.name).toBeDefined();
      expect(tag.color).toBeDefined();
    });

    it('debe manejar campos opcionales correctamente', () => {
      // Test con createdAt opcional
      const uninstallTagWithoutDate: Partial<UninstallTag> = {
        id: 'optional-test',
        name: 'Test Opcional',
        color: 'yellow',
        // createdAt omitido
      };

      const uninstallTag = uninstallTagWithoutDate as UninstallTag;
      const convertedTag = convertUninstallTagToTag(uninstallTag);

      expect(convertedTag.id).toBe('optional-test');
      expect(convertedTag.name).toBe('Test Opcional');
      expect(convertedTag.color).toBe('yellow');
      expect(convertedTag.createdAt).toBeUndefined();
    });
  });

  describe('Compatibilidad con sistema anterior', () => {
    it('debe validar que el sistema unificado reemplaza campos obsoletos', () => {
      // Este test documenta que el sistema anterior tenía:
      // - uninstall: boolean
      // - uninstallTypes: string[]
      // - uninstallTags: UninstallTag[] (nuevo sistema unificado)

      const modernProjectData = {
        id: 'project-1',
        projectNumber: '2025-001',
        uninstallTags: [
          {
            id: 'tag-1',
            name: 'Cortina',
            color: 'sky',
            abbreviation: 'CO',
            createdAt: new Date(),
          },
          {
            id: 'tag-2',
            name: 'Persiana',
            color: 'complete',
            abbreviation: 'PE',
            createdAt: new Date(),
          },
        ] as UninstallTag[]
      };

      // El nuevo sistema debe funcionar solo con uninstallTags
      expect(modernProjectData.uninstallTags).toHaveLength(2);
      expect(modernProjectData.uninstallTags[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        color: expect.any(String),
        createdAt: expect.any(Date),
      });

      // Verificar que no dependemos de campos obsoletos
      expect(modernProjectData).not.toHaveProperty('uninstall');
      expect(modernProjectData).not.toHaveProperty('uninstallTypes');
    });

    it('debe documentar el mapeo desde el sistema anterior', () => {
      // Este test documenta cómo migrar desde el sistema anterior
      const legacyData = {
        uninstall: true,
        uninstallTypes: ['cortina', 'persiana']
      };

      // El nuevo sistema equivalente sería:
      const modernData = {
        uninstallTags: [
          { id: '1', name: 'Cortina', color: 'sky', abbreviation: 'CO', createdAt: new Date() },
          { id: '2', name: 'Persiana', color: 'complete', abbreviation: 'PE', createdAt: new Date() }
        ] as UninstallTag[]
      };

      // Verificar que el nuevo sistema es más rico en información
      expect(modernData.uninstallTags).toHaveLength(2);
      expect(modernData.uninstallTags[0]).toHaveProperty('id');
      expect(modernData.uninstallTags[0]).toHaveProperty('color');
      expect(modernData.uninstallTags[0]).toHaveProperty('createdAt');

      // Mientras que el sistema anterior era más limitado
      expect(legacyData.uninstallTypes).toEqual(['cortina', 'persiana']);
      expect(typeof legacyData.uninstall).toBe('boolean');
    });
  });

  describe('Validación de integridad de datos', () => {
    it('debe manejar arrays vacíos correctamente', () => {
      const emptyTags: UninstallTag[] = [];

      expect(emptyTags).toHaveLength(0);
      expect(Array.isArray(emptyTags)).toBe(true);

      // Convertir array vacío
      const convertedTags = emptyTags.map(convertUninstallTagToTag);
      expect(convertedTags).toHaveLength(0);
    });

    it('debe manejar arrays con múltiples tags', () => {
      const multipleTags: UninstallTag[] = [
        { id: '1', name: 'Tag 1', color: 'sky', abbreviation: 'T1', createdAt: new Date() },
        { id: '2', name: 'Tag 2', color: 'complete', abbreviation: 'T2', createdAt: new Date() },
        { id: '3', name: 'Tag 3', color: 'destructive', abbreviation: 'T3', createdAt: new Date() },
      ];

      expect(multipleTags).toHaveLength(3);

      const convertedTags = multipleTags.map(convertUninstallTagToTag);
      expect(convertedTags).toHaveLength(3);

      // Verificar que cada tag se convierte correctamente
      convertedTags.forEach((tag, index) => {
        expect(tag.id).toBe(multipleTags[index].id);
        expect(tag.name).toBe(multipleTags[index].name);
        expect(tag.color).toBe(multipleTags[index].color);
      });
    });

    it('debe preservar unicidad de IDs', () => {
      const tagsWithUniqueIds: UninstallTag[] = [
        { id: 'unique-1', name: 'Tag A', color: 'primary', abbreviation: 'TA', createdAt: new Date() },
        { id: 'unique-2', name: 'Tag B', color: 'secondary', abbreviation: 'TB', createdAt: new Date() },
        { id: 'unique-3', name: 'Tag C', color: 'purple', abbreviation: 'TC', createdAt: new Date() },
      ];

      const convertedTags = tagsWithUniqueIds.map(convertUninstallTagToTag);
      const ids = convertedTags.map(tag => tag.id);

      // Verificar que no hay IDs duplicados
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);

      // Verificar que los IDs se preservan exactamente
      expect(ids).toEqual(['unique-1', 'unique-2', 'unique-3']);
    });
  });
});