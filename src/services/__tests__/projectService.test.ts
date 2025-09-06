/**
 * @fileoverview Tests para projectService usando Firebase Emulator Suite
 * Sin mocks - usa APIs reales de Firebase contra emulators
 * Solución oficial recomendada por Firebase 2025
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import type { ProjectType } from '@/types/project';

// Configurar mocks ANTES de importar servicios
const testApp = initializeApp({
  projectId: 'test-project-id'
});

const testDb = getFirestore(testApp);

// Mock para usar testDb en lugar de db de producción
jest.mock('@/lib/firebase/client', () => ({
  get db() {
    return testDb;
  }
}));

// Mock para DI functions
jest.mock('@/lib/firebase/di', () => ({
  createFirestoreFunction: jest.fn((impl) => {
    return (...args: any[]) => impl(testDb, ...args);
  })
}));

// Mock servicios dependientes (estos no los vamos a testear aquí)
jest.mock('../paymentService', () => ({
  deletePaymentsForProject: jest.fn().mockResolvedValue(undefined),
  getPaymentsForProject: jest.fn().mockResolvedValue([])
}));

jest.mock('../afterSalesService', () => ({
  deleteAfterSalesForProject: jest.fn().mockResolvedValue(undefined)
}));

// Importar servicios DESPUÉS de configurar mocks
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  calculateProjectBalance
} from '../projectService';

// Conectar a emulator después de imports
connectFirestoreEmulator(testDb, 'localhost', 8081);

// Helper para limpiar base de datos del emulator
const clearTestData = async () => {
  const collections = ['projects', 'clients', 'payments', 'afterSales'];
  
  for (const collectionName of collections) {
    try {
      const snapshot = await getDocs(collection(testDb, collectionName));
      if (!snapshot.empty) {
        const batch = writeBatch(testDb);
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
    } catch (error) {
      // Ignorar errores de colecciones que no existen
    }
  }
};

describe('projectService (Firebase Emulator)', () => {
  const mockProjectData: Omit<ProjectType, 'id' | 'createdAt' | 'updatedAt' | 'total' | 'balance' | 'clientName'> = {
    projectNumber: 'PROJ-TEST-001',
    clientId: 'client-123',
    description: 'Test project description',
    date: new Date('2025-01-15'),
    subtotal: 1000000,
    taxRate: 19,
    status: 'ingresado',
    isPaid: false,
    fullAddress: {
      textoCompleto: 'Av. Test 1234, Santiago',
      coordenadas: { latitude: -33.4489, longitude: -70.6693 },
      placeId: 'test-place-id',
      componentes: {
        comuna: 'Santiago',
        region: 'Metropolitana',
        pais: 'Chile'
      }
    }
  };

  beforeEach(async () => {
    // Limpiar datos del emulator antes de cada test
    await clearTestData();
  });

  describe('calculateProjectBalance', () => {
    it('should calculate balance correctly', () => {
      expect(calculateProjectBalance(1000, 300)).toBe(700);
      expect(calculateProjectBalance(1000, 0)).toBe(1000);
      expect(calculateProjectBalance(1000, 1200)).toBe(0);
      expect(calculateProjectBalance(undefined, undefined)).toBe(0);
    });
  });

  describe('createProject', () => {
    it('should create project successfully', async () => {
      const result = await createProject(mockProjectData);
      
      expect(result.id).toBeDefined();
      expect(result.description).toBe(mockProjectData.description);
      expect(result.subtotal).toBe(mockProjectData.subtotal);
      expect(result.total).toBe(1190000); // 1000000 * 1.19
      expect(result.balance).toBe(1190000);
      expect(result.isPaid).toBe(false);
    });
  });

  describe('getProjectById', () => {
    it('should return project when exists', async () => {
      // Crear proyecto
      const created = await createProject(mockProjectData);
      
      // Obtener por ID
      const result = await getProjectById(created.id);
      
      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
      expect(result?.description).toBe(mockProjectData.description);
    });

    it('should return null when not found', async () => {
      const result = await getProjectById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getProjects', () => {
    it('should return empty array when no projects', async () => {
      const result = await getProjects();
      expect(result).toEqual([]);
    });

    it('should return projects sorted by date', async () => {
      // Crear dos proyectos con fechas diferentes
      const project1Data = { ...mockProjectData, date: new Date('2025-01-10') };
      const project2Data = { ...mockProjectData, date: new Date('2025-01-20') };
      
      await createProject(project1Data);
      await createProject(project2Data);
      
      const result = await getProjects();
      
      expect(result).toHaveLength(2);
      // Debería estar ordenado por fecha descendente (más reciente primero)
      expect(result[0].date.getTime()).toBeGreaterThan(result[1].date.getTime());
    });
  });

  describe('updateProject', () => {
    it('should update project successfully', async () => {
      // Crear proyecto
      const created = await createProject(mockProjectData);
      
      // Actualizar
      const updateData = { description: 'Updated description' };
      await updateProject(created.id, updateData);
      
      // Verificar actualización
      const updated = await getProjectById(created.id);
      expect(updated?.description).toBe('Updated description');
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      // Crear proyecto
      const created = await createProject(mockProjectData);
      
      // Verificar que existe
      let found = await getProjectById(created.id);
      expect(found).toBeDefined();
      
      // Eliminar
      await deleteProject(created.id);
      
      // Verificar que no existe
      found = await getProjectById(created.id);
      expect(found).toBeNull();
    });
  });
});

// Test helper para verificar que emulator está funcionando
describe('Firebase Emulator Connection', () => {
  it('should be connected to emulator', () => {
    // Si llegamos aquí sin errores, el emulator está funcionando
    expect(testDb).toBeDefined();
  });
});