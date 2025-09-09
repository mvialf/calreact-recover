/**
 * EJEMPLO: Test Unitario Correcto
 * 
 * Demuestra cómo corregir el error "instanceof Timestamp not callable"
 * Template para tests de servicios Firebase con mocks
 * 
 * @author Mentor Técnico AI
 * @date 2025-09-08
 */

// ==========================================
// IMPORTS Y SETUP
// ==========================================

import { mockFirestore, MockTimestamp, createMockAfterSalesDoc } from '../mocks/firebase-v11-mocks';

// ✅ CRÍTICO: Mock ANTES de imports de Firebase
jest.mock('firebase/firestore', () => mockFirestore);

// Ahora sí, importar el servicio a testear
// (Adaptar este import a tu servicio específico)
import { 
  afterSalesFromDoc, 
  addAfterSales, 
  getAfterSalesById 
} from '../../services/afterSalesService';

// ==========================================
// DATOS DE PRUEBA
// ==========================================

/**
 * Factory de datos de prueba
 */
const createTestAfterSalesData = (overrides = {}) => ({
  projectId: 'test-project-id',
  description: 'Test after sales service',
  status: 'pending' as const,
  entryDate: new Date('2025-01-15'),
  resolutionDate: null,
  notes: 'Test notes',
  ...overrides
});

/**
 * Mock document de Firestore
 */
const createMockDocumentSnapshot = (data: any) => ({
  id: 'test-doc-id',
  exists: () => true,
  data: () => ({
    ...data,
    // ✅ Timestamps como MockTimestamp (no objetos planos)
    entryDate: data.entryDate ? MockTimestamp.fromDate(data.entryDate) : null,
    resolutionDate: data.resolutionDate ? MockTimestamp.fromDate(data.resolutionDate) : null,
    createdAt: MockTimestamp.now(),
    updatedAt: MockTimestamp.now()
  })
});

// ==========================================
// TEST SUITE PRINCIPAL
// ==========================================

describe('afterSalesService - Unit Tests', () => {
  
  // ==========================================
  // SETUP Y CLEANUP
  // ==========================================
  
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup adicional si es necesario
    jest.restoreAllMocks();
  });

  // ==========================================
  // TESTS DE TRANSFORMACIÓN (afterSalesFromDoc)
  // ==========================================

  describe('afterSalesFromDoc', () => {
    
    it('✅ should transform document correctly with timestamps', () => {
      // Arrange
      const testData = createTestAfterSalesData();
      const mockDoc = createMockDocumentSnapshot(testData);

      // Act
      const result = afterSalesFromDoc(mockDoc);

      // Assert
      expect(result.id).toBe('test-doc-id');
      expect(result.projectId).toBe(testData.projectId);
      expect(result.description).toBe(testData.description);
      expect(result.status).toBe(testData.status);
      
      // ✅ CLAVE: Verificar que timestamps se convierten correctamente
      expect(result.entryDate).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('✅ should handle null resolutionDate', () => {
      // Arrange
      const testData = createTestAfterSalesData({ resolutionDate: null });
      const mockDoc = createMockDocumentSnapshot(testData);

      // Act
      const result = afterSalesFromDoc(mockDoc);

      // Assert
      expect(result.resolutionDate).toBeUndefined();
    });

    it('✅ should handle missing timestamps gracefully', () => {
      // Arrange
      const mockDoc = {
        id: 'test-doc-id',
        exists: () => true,
        data: () => ({
          projectId: 'test-project',
          description: 'Test',
          status: 'pending',
          // Sin timestamps (edge case)
        })
      };

      // Act
      const result = afterSalesFromDoc(mockDoc);

      // Assert - Debe usar fechas por defecto
      expect(result.entryDate).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

  });

  // ==========================================
  // TESTS DE CREACIÓN (addAfterSales)
  // ==========================================

  describe('addAfterSales', () => {
    
    it('✅ should create after sales record successfully', async () => {
      // Arrange
      const testData = createTestAfterSalesData();
      const mockFirestoreInstance = mockFirestore.getFirestore();
      
      // Mock de collection y add
      const mockAdd = jest.fn().mockResolvedValue({
        id: 'new-doc-id'
      });
      
      mockFirestoreInstance.collection.mockReturnValue({
        add: mockAdd
      });

      // Act
      const result = await addAfterSales(mockFirestoreInstance, testData);

      // Assert
      expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('afterSales');
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: testData.projectId,
          description: testData.description,
          status: testData.status,
          // Timestamps deben ser MockTimestamp
          entryDate: expect.any(MockTimestamp),
          createdAt: expect.any(MockTimestamp),
          updatedAt: expect.any(MockTimestamp)
        })
      );
      expect(result.id).toBe('new-doc-id');
    });

    it('✅ should handle creation errors gracefully', async () => {
      // Arrange
      const testData = createTestAfterSalesData();
      const mockFirestoreInstance = mockFirestore.getFirestore();
      
      mockFirestoreInstance.collection.mockReturnValue({
        add: jest.fn().mockRejectedValue(new Error('Firestore error'))
      });

      // Act & Assert
      await expect(addAfterSales(mockFirestoreInstance, testData))
        .rejects
        .toThrow('Error al crear registro de postventa: Firestore error');
    });

  });

  // ==========================================
  // TESTS DE LECTURA (getAfterSalesById)
  // ==========================================

  describe('getAfterSalesById', () => {
    
    it('✅ should retrieve after sales by id', async () => {
      // Arrange
      const testId = 'test-after-sales-id';
      const testData = createTestAfterSalesData();
      const mockDoc = createMockDocumentSnapshot(testData);
      
      const mockFirestoreInstance = mockFirestore.getFirestore();
      mockFirestoreInstance.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockDoc)
        })
      });

      // Act
      const result = await getAfterSalesById(mockFirestoreInstance, testId);

      // Assert
      expect(mockFirestoreInstance.collection).toHaveBeenCalledWith('afterSales');
      expect(result).toBeDefined();
      expect(result?.id).toBe('test-doc-id');
      expect(result?.projectId).toBe(testData.projectId);
      
      // ✅ Verificar timestamps convertidos
      expect(result?.entryDate).toBeInstanceOf(Date);
    });

    it('✅ should return null for non-existent document', async () => {
      // Arrange
      const testId = 'non-existent-id';
      
      const mockFirestoreInstance = mockFirestore.getFirestore();
      mockFirestoreInstance.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: () => false
          })
        })
      });

      // Act
      const result = await getAfterSalesById(mockFirestoreInstance, testId);

      // Assert
      expect(result).toBeNull();
    });

    it('✅ should handle retrieval errors', async () => {
      // Arrange
      const testId = 'error-id';
      
      const mockFirestoreInstance = mockFirestore.getFirestore();
      mockFirestoreInstance.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockRejectedValue(new Error('Network error'))
        })
      });

      // Act & Assert
      await expect(getAfterSalesById(mockFirestoreInstance, testId))
        .rejects
        .toThrow('Error al obtener registro de postventa: Network error');
    });

  });

  // ==========================================
  // TESTS DE VALIDACIÓN
  // ==========================================

  describe('data validation', () => {
    
    it('✅ should validate required fields', async () => {
      // Arrange
      const invalidData = {
        // Falta projectId requerido
        description: 'Test'
      } as any;
      
      const mockFirestoreInstance = mockFirestore.getFirestore();

      // Act & Assert
      await expect(addAfterSales(mockFirestoreInstance, invalidData))
        .rejects
        .toThrow(); // Debe fallar validación
    });

    it('✅ should validate status enum', async () => {
      // Arrange
      const invalidData = createTestAfterSalesData({ 
        status: 'invalid-status' 
      });
      
      const mockFirestoreInstance = mockFirestore.getFirestore();

      // Act & Assert
      await expect(addAfterSales(mockFirestoreInstance, invalidData))
        .rejects
        .toThrow(); // Debe fallar validación de enum
    });

  });

});

// ==========================================
// CUSTOM MATCHERS (OPCIONAL)
// ==========================================

/**
 * Matcher personalizado para verificar objetos de AfterSales
 */
expect.extend({
  toBeValidAfterSales(received) {
    const pass = received && 
                  typeof received.id === 'string' &&
                  typeof received.projectId === 'string' &&
                  typeof received.description === 'string' &&
                  ['pending', 'in_progress', 'resolved'].includes(received.status) &&
                  received.entryDate instanceof Date;
    
    return {
      message: () => pass 
        ? `expected ${received} not to be a valid AfterSales object`
        : `expected ${received} to be a valid AfterSales object with required fields`,
      pass
    };
  }
});

// ==========================================
// TYPESCRIPT DECLARATIONS
// ==========================================

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidAfterSales(): R;
    }
  }
}

// ==========================================
// NOTAS DE USO
// ==========================================

/*
CÓMO ADAPTAR ESTE EJEMPLO:

1. Cambiar imports:
   - Reemplazar 'afterSalesService' por tu servicio
   - Actualizar tipos y funciones específicas

2. Adaptar datos de prueba:
   - Modificar createTestAfterSalesData() con tus campos
   - Actualizar createMockDocumentSnapshot() según tu schema

3. Actualizar tests:
   - Cambiar nombres de métodos por los de tu servicio
   - Adaptar assertions a tu lógica específica
   - Agregar edge cases específicos de tu dominio

4. Ejecutar:
   npm test -- tu-servicio.unit.test.ts

ERRORES SOLUCIONADOS:
✅ "instanceof Timestamp not callable" - MockTimestamp es clase real
✅ Timeouts - Mocks responden inmediatamente
✅ Inconsistencias - Datos de prueba consistentes
✅ Cleanup - Limpieza correcta entre tests

PATRÓN REPLICABLE:
- Mock antes de imports
- Datos de prueba reutilizables
- Setup/cleanup apropiado
- Assertions específicas y claras
- Error handling testing
*/