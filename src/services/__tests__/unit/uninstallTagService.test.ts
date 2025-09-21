/**
 * @fileoverview Tests para uninstallTagService
 * Valida operaciones CRUD para tags de desinstalación en Firebase
 */

import {
  getUninstallTags,
  createUninstallTag,
  updateUninstallTag,
  deleteUninstallTag
} from '../../uninstallTagService';
import { Timestamp } from 'firebase/firestore';
import type { UninstallTag } from '@/types/uninstall-tags';
import type { TagColor } from '@/types/tags';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
  Timestamp: jest.fn().mockImplementation((seconds, nanoseconds) => ({
    seconds,
    nanoseconds,
    toDate: () => new Date(seconds * 1000)
  }))
}));

// Mock de db
jest.mock('@/lib/firebase/client', () => ({
  db: {}
}));

// Mock firestore-helpers
jest.mock('@/utils/firestore-helpers', () => ({
  docSnapshotsToEntities: jest.fn(),
  prepareDataForFirestore: jest.fn()
}));

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { docSnapshotsToEntities, prepareDataForFirestore } from '@/utils/firestore-helpers';

const mockedGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockedAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockedUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockedDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockedDocSnapshotsToEntities = docSnapshotsToEntities as jest.MockedFunction<typeof docSnapshotsToEntities>;
const mockedPrepareDataForFirestore = prepareDataForFirestore as jest.MockedFunction<typeof prepareDataForFirestore>;

describe('uninstallTagService', () => {
  const mockTagColor: TagColor = 'primary';

  const mockUninstallTag: UninstallTag = {
    id: 'tag-123',
    name: 'Aluminio',
    color: mockTagColor,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUninstallTags', () => {
    it('debe obtener todas las tags de desinstalación ordenadas por fecha', async () => {
      const mockSnapshot = {
        docs: [
          {
            id: 'tag-1',
            data: () => ({
              name: 'Aluminio',
              color: 'primary',
              createdAt: new Timestamp(1640995200, 0),
              updatedAt: new Timestamp(1640995200, 0)
            })
          }
        ]
      };

      mockedGetDocs.mockResolvedValue(mockSnapshot as any);
      mockedDocSnapshotsToEntities.mockReturnValue([mockUninstallTag]);

      const result = await getUninstallTags();

      expect(collection).toHaveBeenCalledWith({}, 'uninstall-tags');
      expect(query).toHaveBeenCalled();
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(docSnapshotsToEntities).toHaveBeenCalledWith(mockSnapshot.docs, expect.any(Function));
      expect(result).toEqual([mockUninstallTag]);
    });

    it('debe manejar errores al obtener tags', async () => {
      const mockError = new Error('Firebase error');
      mockedGetDocs.mockRejectedValue(mockError);

      await expect(getUninstallTags()).rejects.toThrow('Firebase error');
    });
  });

  describe('createUninstallTag', () => {
    it('debe crear una nueva tag de desinstalación', async () => {
      const mockDocRef = { id: 'new-tag-id' };
      const mockCollectionRef = { path: 'uninstall-tags' };
      const mockPreparedData = {
        name: 'Madera',
        color: 'brown',
        createdAt: { seconds: 1640995200, nanoseconds: 0 },
        updatedAt: { seconds: 1640995200, nanoseconds: 0 }
      };

      (collection as jest.Mock).mockReturnValue(mockCollectionRef);
      mockedPrepareDataForFirestore.mockReturnValue(mockPreparedData as any);
      mockedAddDoc.mockResolvedValue(mockDocRef as any);

      const result = await createUninstallTag('Madera', 'brown');

      expect(prepareDataForFirestore).toHaveBeenCalledWith(
        { name: 'Madera', color: 'brown' },
        false
      );
      expect(addDoc).toHaveBeenCalledWith(
        mockCollectionRef,
        mockPreparedData
      );
      expect(result).toBe('new-tag-id');
    });

    it('debe trim el nombre de la tag', async () => {
      const mockDocRef = { id: 'new-tag-id' };
      mockedPrepareDataForFirestore.mockReturnValue({} as any);
      mockedAddDoc.mockResolvedValue(mockDocRef as any);

      await createUninstallTag('  PVC  ', 'sky');

      expect(prepareDataForFirestore).toHaveBeenCalledWith(
        { name: 'PVC', color: 'sky' },
        false
      );
    });

    it('debe manejar errores al crear tag', async () => {
      const mockError = new Error('Creation failed');
      mockedAddDoc.mockRejectedValue(mockError);

      await expect(createUninstallTag('Error Tag', 'destructive')).rejects.toThrow('Creation failed');
    });
  });

  describe('updateUninstallTag', () => {
    it('debe actualizar una tag existente', async () => {
      const mockPreparedData = {
        name: 'Aluminio Modificado',
        color: 'secondary',
        updatedAt: { seconds: 1640995200, nanoseconds: 0 }
      };

      const mockDocRef = { path: 'uninstall-tags/tag-123' };
      (doc as jest.Mock).mockReturnValue(mockDocRef);
      mockedPrepareDataForFirestore.mockReturnValue(mockPreparedData as any);
      mockedUpdateDoc.mockResolvedValue(undefined);

      await updateUninstallTag('tag-123', {
        name: 'Aluminio Modificado',
        color: 'secondary'
      });

      expect(doc).toHaveBeenCalledWith({}, 'uninstall-tags', 'tag-123');
      expect(prepareDataForFirestore).toHaveBeenCalledWith(
        { name: 'Aluminio Modificado', color: 'secondary' },
        true
      );
      expect(updateDoc).toHaveBeenCalledWith(
        mockDocRef,
        mockPreparedData
      );
    });

    it('debe manejar errores al actualizar tag', async () => {
      const mockError = new Error('Update failed');
      mockedUpdateDoc.mockRejectedValue(mockError);

      await expect(updateUninstallTag('tag-123', { name: 'Error' })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteUninstallTag', () => {
    it('debe eliminar una tag existente', async () => {
      const mockDocRef = { path: 'uninstall-tags/tag-123' };
      (doc as jest.Mock).mockReturnValue(mockDocRef);
      mockedDeleteDoc.mockResolvedValue(undefined);

      await deleteUninstallTag('tag-123');

      expect(doc).toHaveBeenCalledWith({}, 'uninstall-tags', 'tag-123');
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('debe manejar errores al eliminar tag', async () => {
      const mockError = new Error('Delete failed');
      mockedDeleteDoc.mockRejectedValue(mockError);

      await expect(deleteUninstallTag('tag-123')).rejects.toThrow('Delete failed');
    });
  });
});