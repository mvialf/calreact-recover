/**
 * @fileoverview Tests para afterSalesService
 * Valida operaciones CRUD, validación de datos y transformaciones
 */

import {
  addAfterSales,
  getAfterSalesById,
  getAfterSalesForProject,
  updateAfterSales,
  deleteAfterSales,
  deleteAfterSalesForProject
} from '../../afterSalesService';
import { Timestamp } from 'firebase/firestore';
import type { AfterSales } from '@/types/afterSales';

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
  where: jest.fn(),
  orderBy: jest.fn(),
  getDoc: jest.fn(),
  writeBatch: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    fromDate: jest.fn((date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 }))
  }
}));

// Mock de db
jest.mock('@/lib/firebase/client', () => ({
  db: {}
}));

describe('afterSalesService', () => {
  const mockAfterSalesData: Omit<AfterSales, 'id' | 'createdAt' | 'updatedAt'> = {
    projectId: 'project-123',
    description: 'Test postventa',
    afterSalesStatus: 'Ingresada',
    entryDate: new Date('2025-01-01'),
    tasks: [
      {
        id: 'task-1',
        description: 'Tarea de prueba',
        isCompleted: false,
        createdAt: new Date('2025-01-01')
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addAfterSales', () => {
    it('should create afterSales with valid data', async () => {
      const mockDocRef = { id: 'new-after-sales-id' };
      const mockDocSnap = {
        exists: () => true,
        id: 'new-after-sales-id',
        data: () => ({
          ...mockAfterSalesData,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
          entryDate: { toDate: () => mockAfterSalesData.entryDate }
        })
      };

      const { addDoc, getDoc } = require('firebase/firestore');
      addDoc.mockResolvedValue(mockDocRef);
      getDoc.mockResolvedValue(mockDocSnap);

      const result = await addAfterSales(mockAfterSalesData);

      expect(addDoc).toHaveBeenCalled();
      expect(getDoc).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe('new-after-sales-id');
    });

    it('should throw error with invalid projectId', async () => {
      const invalidData = { ...mockAfterSalesData, projectId: '' };

      await expect(addAfterSales(invalidData)).rejects.toThrow('projectId es requerido');
    });

    it('should throw error with empty description', async () => {
      const invalidData = { ...mockAfterSalesData, description: '' };

      await expect(addAfterSales(invalidData)).rejects.toThrow('description es requerida');
    });
  });

  describe('getAfterSalesById', () => {
    it('should return afterSales when exists', async () => {
      const mockDocSnap = {
        exists: () => true,
        id: 'after-sales-123',
        data: () => ({
          ...mockAfterSalesData,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
          entryDate: { toDate: () => mockAfterSalesData.entryDate }
        })
      };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue(mockDocSnap);

      const result = await getAfterSalesById('after-sales-123');

      expect(getDoc).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result?.id).toBe('after-sales-123');
    });

    it('should return null when not found', async () => {
      const mockDocSnap = { exists: () => false };

      const { getDoc } = require('firebase/firestore');
      getDoc.mockResolvedValue(mockDocSnap);

      const result = await getAfterSalesById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getAfterSalesForProject', () => {
    it('should return afterSales for project', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'after-sales-1',
            data: () => ({
              ...mockAfterSalesData,
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
              entryDate: { toDate: () => mockAfterSalesData.entryDate }
            })
          }
        ]
      };

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await getAfterSalesForProject('project-123');

      expect(getDocs).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('after-sales-1');
    });
  });

  describe('updateAfterSales', () => {
    it('should update afterSales successfully', async () => {
      const updateData = { description: 'Updated description' };
      const { updateDoc } = require('firebase/firestore');

      await updateAfterSales('after-sales-123', updateData);

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('deleteAfterSales', () => {
    it('should delete afterSales successfully', async () => {
      const { deleteDoc } = require('firebase/firestore');

      await deleteAfterSales('after-sales-123');

      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('deleteAfterSalesForProject', () => {
    it('should delete all afterSales for project', async () => {
      const mockQuerySnapshot = {
        empty: false,
        docs: [
          { ref: 'ref1' },
          { ref: 'ref2' }
        ]
      };
      const mockBatch = {
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(undefined)
      };

      const { getDocs, writeBatch } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockQuerySnapshot);
      writeBatch.mockReturnValue(mockBatch);

      await deleteAfterSalesForProject('project-123');

      expect(getDocs).toHaveBeenCalled();
      expect(mockBatch.delete).toHaveBeenCalledTimes(2);
      expect(mockBatch.commit).toHaveBeenCalled();
    });

    it('should handle empty results gracefully', async () => {
      const mockQuerySnapshot = { empty: true, docs: [] };
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockQuerySnapshot);

      await deleteAfterSalesForProject('project-123');

      expect(getDocs).toHaveBeenCalled();
      // Should not throw error
    });
  });
});