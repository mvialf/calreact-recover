/**
 * @fileoverview Tests para visitService
 * Valida operaciones CRUD, conversión de timestamps y funciones de ejemplo
 */

import {
  addVisit,
  getVisits,
  updateVisit,
  deleteVisit,
  seedExampleVisits
} from '../visitService';
import type { Visit } from '@/types/visit';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  collection: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
  Timestamp: {
    now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    fromDate: jest.fn((date: Date) => ({ seconds: date.getTime() / 1000, nanoseconds: 0 }))
  }
}));

// Mock de db
jest.mock('@/lib/firebase', () => ({
  db: {}
}));

describe('visitService', () => {
  const mockVisitData: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'> = {
    name: 'Juan Pérez',
    phone: '+56 9 1234 5678',
    address: 'Av. Principal 1234, Santiago',
    municipality: 'Santiago',
    status: 'Agendada',
    scheduledDate: new Date('2025-06-20T10:30:00'),
    observations: 'Cliente interesado en departamento de 2 dormitorios'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addVisit', () => {
    it('should create visit with valid data', async () => {
      const mockDocRef = { id: 'new-visit-id' };
      const { addDoc } = require('firebase/firestore');
      addDoc.mockResolvedValue(mockDocRef);

      const result = await addVisit(mockVisitData);

      expect(addDoc).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.id).toBe('new-visit-id');
      expect(result.name).toBe(mockVisitData.name);
    });

    it('should throw error on Firebase failure', async () => {
      const { addDoc } = require('firebase/firestore');
      addDoc.mockRejectedValue(new Error('Firebase error'));

      await expect(addVisit(mockVisitData)).rejects.toThrow('Error al crear visita: Firebase error');
    });
  });

  describe('getVisits', () => {
    it('should return all visits with converted timestamps', async () => {
      const mockQuerySnapshot = {
        docs: [
          {
            id: 'visit-1',
            data: () => ({
              ...mockVisitData,
              scheduledDate: { toDate: () => mockVisitData.scheduledDate },
              createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() }
            })
          }
        ]
      };

      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue(mockQuerySnapshot);

      const result = await getVisits();

      expect(getDocs).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('visit-1');
      expect(result[0].scheduledDate).toBeInstanceOf(Date);
    });

    it('should throw error on Firebase failure', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Firebase error'));

      await expect(getVisits()).rejects.toThrow('Error al cargar visitas: Firebase error');
    });
  });

  describe('updateVisit', () => {
    it('should update visit successfully', async () => {
      const updateData = { status: 'Completada' as any };
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockResolvedValue(undefined);

      await updateVisit('visit-123', updateData);

      expect(updateDoc).toHaveBeenCalled();
    });

    it('should throw error on Firebase failure', async () => {
      const { updateDoc } = require('firebase/firestore');
      updateDoc.mockRejectedValue(new Error('Firebase error'));

      await expect(updateVisit('visit-123', {})).rejects.toThrow('Error al actualizar visita visit-123: Firebase error');
    });
  });

  describe('deleteVisit', () => {
    it('should delete visit successfully', async () => {
      const { deleteDoc } = require('firebase/firestore');
      deleteDoc.mockResolvedValue(undefined);

      await deleteVisit('visit-123');

      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should throw error on Firebase failure', async () => {
      const { deleteDoc } = require('firebase/firestore');
      deleteDoc.mockRejectedValue(new Error('Firebase error'));

      await expect(deleteVisit('visit-123')).rejects.toThrow('Error al eliminar visita visit-123: Firebase error');
    });
  });

  describe('seedExampleVisits', () => {
    it('should create example visits when database is empty', async () => {
      // Mock getVisits to return empty array
      const { getDocs, addDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ docs: [] });
      addDoc.mockResolvedValue({ id: 'example-visit-id' });

      const result = await seedExampleVisits();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
    });

    it('should not create visits when database has existing visits', async () => {
      // Mock getVisits to return existing visits
      const { getDocs } = require('firebase/firestore');
      getDocs.mockResolvedValue({
        docs: [{ id: 'existing-visit', data: () => mockVisitData }]
      });

      const result = await seedExampleVisits();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Ya existen visitas');
    });

    it('should handle errors gracefully', async () => {
      const { getDocs } = require('firebase/firestore');
      getDocs.mockRejectedValue(new Error('Database error'));

      const result = await seedExampleVisits();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});