/**
 * EJEMPLO: Test de Integración con Firebase Emulator
 * 
 * Demuestra cómo crear tests que usan Firebase Emulator real
 * Template para tests de integración críticos
 * 
 * @author Mentor Técnico AI
 * @date 2025-09-08
 */

// ==========================================
// IMPORTS Y SETUP
// ==========================================

import { 
  initializeTestApp, 
  clearFirestoreData,
  apps
} from '@firebase/rules-unit-testing';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  Timestamp,
  connectFirestoreEmulator,
  Firestore
} from 'firebase/firestore';

// Import del servicio a testear (adaptar según tu caso)
import {
  createProject,
  getProjectById,
  getProjects,
  updateProject,
  deleteProject
} from '../../services/projectService';

// ==========================================
// CONFIGURACIÓN DE EMULATOR
// ==========================================

/**
 * Configuración del proyecto de prueba
 */
const TEST_PROJECT_ID = 'test-project-cobralon';
const FIRESTORE_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';

/**
 * Setup de Firebase Testing
 */
let testApp: any;
let testFirestore: Firestore;

/**
 * Helper para inicializar Firebase Emulator
 */
const setupTestFirebase = async () => {
  // Limpiar apps anteriores
  await Promise.all(apps().map(app => app.delete()));
  
  // Inicializar nueva app de testing
  testApp = initializeTestApp({ 
    projectId: TEST_PROJECT_ID,
    auth: { uid: 'test-user-id', email: 'test@example.com' }
  });
  
  testFirestore = getFirestore(testApp);
  
  // Conectar al emulator si no está conectado
  try {
    connectFirestoreEmulator(testFirestore, 'localhost', 8080);
  } catch (error) {
    // Ya conectado, ignorar error
  }
  
  return testFirestore;
};

/**
 * Helper para limpiar datos entre tests
 */
const clearTestData = async () => {
  if (testApp) {
    await clearFirestoreData({ projectId: TEST_PROJECT_ID });
  }
};

// ==========================================
// DATOS DE PRUEBA
// ==========================================

/**
 * Factory de datos de proyecto de prueba
 */
const createTestProjectData = (overrides = {}) => ({
  name: 'Test Project Integration',
  clientId: 'test-client-id',
  clientName: 'Test Client',
  address: 'Test Address 123',
  phone: '+34123456789',
  email: 'client@test.com',
  status: 'active' as const,
  date: new Date('2025-01-15'),
  totalBudget: 10000,
  advancedPayment: 2000,
  ...overrides
});

/**
 * Factory para múltiples proyectos de prueba
 */
const createMultipleTestProjects = () => [
  createTestProjectData({ 
    name: 'Project A', 
    date: new Date('2025-01-10'),
    totalBudget: 15000 
  }),
  createTestProjectData({ 
    name: 'Project B', 
    date: new Date('2025-01-20'),
    totalBudget: 8000 
  }),
  createTestProjectData({ 
    name: 'Project C', 
    date: new Date('2025-01-25'),
    totalBudget: 12000 
  })
];

// ==========================================
// TEST SUITE PRINCIPAL
// ==========================================

describe('projectService - Integration Tests', () => {
  
  // ==========================================
  // SETUP Y TEARDOWN
  // ==========================================
  
  beforeAll(async () => {
    // Verificar que emulator está disponible
    if (!process.env.FIRESTORE_EMULATOR_HOST) {
      console.warn('⚠️ Firebase Emulator no detectado. Tests de integración pueden fallar.');
      console.warn('   Ejecutar: firebase emulators:start --only firestore');
    }
    
    // Setup inicial
    testFirestore = await setupTestFirebase();
  }, 30000); // Timeout extendido para setup

  afterAll(async () => {
    // Cleanup final
    if (testApp) {
      await testApp.delete();
    }
  });

  beforeEach(async () => {
    // Limpiar datos antes de cada test
    await clearTestData();
  });

  // ==========================================
  // TESTS DE CREACIÓN
  // ==========================================

  describe('createProject', () => {
    
    it('✅ should create project successfully', async () => {
      // Arrange
      const projectData = createTestProjectData();

      // Act
      const result = await createProject(testFirestore, projectData);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.id).toHaveLength(20); // Firebase auto-generated ID length
      
      // Verificar que se creó en Firestore real
      const docRef = doc(testFirestore, 'projects', result.id);
      const docSnap = await getDoc(docRef);
      
      expect(docSnap.exists()).toBe(true);
      
      const savedData = docSnap.data();
      expect(savedData?.name).toBe(projectData.name);
      expect(savedData?.clientId).toBe(projectData.clientId);
      expect(savedData?.totalBudget).toBe(projectData.totalBudget);
      
      // Verificar timestamps reales
      expect(savedData?.createdAt).toBeInstanceOf(Timestamp);
      expect(savedData?.updatedAt).toBeInstanceOf(Timestamp);
      expect(savedData?.date).toBeInstanceOf(Timestamp);
    });

    it('✅ should handle concurrent project creation', async () => {
      // Arrange
      const projectsData = createMultipleTestProjects();

      // Act - Crear proyectos concurrentemente
      const promises = projectsData.map(data => 
        createProject(testFirestore, data)
      );
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      
      // Verificar que todos tienen IDs únicos
      const ids = results.map(r => r.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
      
      // Verificar que todos existen en Firestore
      const collectionRef = collection(testFirestore, 'projects');
      const querySnapshot = await getDocs(collectionRef);
      expect(querySnapshot.size).toBe(3);
    });

  });

  // ==========================================
  // TESTS DE LECTURA
  // ==========================================

  describe('getProjectById', () => {
    
    it('✅ should return project when exists', async () => {
      // Arrange - Crear proyecto primero
      const projectData = createTestProjectData();
      const created = await createProject(testFirestore, projectData);

      // Act
      const result = await getProjectById(testFirestore, created.id);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(created.id);
      expect(result?.name).toBe(projectData.name);
      expect(result?.clientId).toBe(projectData.clientId);
      
      // Verificar conversión de timestamps
      expect(result?.date).toBeInstanceOf(Date);
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
    });

    it('✅ should return null when not found', async () => {
      // Arrange
      const nonExistentId = 'non-existent-project-id';

      // Act
      const result = await getProjectById(testFirestore, nonExistentId);

      // Assert
      expect(result).toBeNull();
    });

  });

  describe('getProjects', () => {
    
    it('✅ should return projects sorted by date', async () => {
      // Arrange - Crear múltiples proyectos con fechas diferentes
      const project1Data = { ...createTestProjectData(), date: new Date('2025-01-10') };
      const project2Data = { ...createTestProjectData(), date: new Date('2025-01-20') };
      const project3Data = { ...createTestProjectData(), date: new Date('2025-01-05') };

      await createProject(testFirestore, project1Data);
      await createProject(testFirestore, project2Data);  
      await createProject(testFirestore, project3Data);

      // Act
      const results = await getProjects(testFirestore);

      // Assert
      expect(results).toHaveLength(3);
      
      // Verificar orden por fecha (más reciente primero)
      expect(results[0].date.getTime()).toBeGreaterThan(results[1].date.getTime());
      expect(results[1].date.getTime()).toBeGreaterThan(results[2].date.getTime());
    });

    it('✅ should return empty array when no projects', async () => {
      // Act
      const results = await getProjects(testFirestore);

      // Assert
      expect(results).toEqual([]);
    });

    it('✅ should handle large number of projects', async () => {
      // Arrange - Crear muchos proyectos
      const projectsData = Array.from({ length: 50 }, (_, i) => 
        createTestProjectData({ 
          name: `Project ${i}`, 
          date: new Date(2025, 0, i + 1) 
        })
      );

      // Crear en batches para evitar límites
      for (const projectData of projectsData) {
        await createProject(testFirestore, projectData);
      }

      // Act
      const results = await getProjects(testFirestore);

      // Assert
      expect(results).toHaveLength(50);
    });

  });

  // ==========================================
  // TESTS DE ACTUALIZACIÓN
  // ==========================================

  describe('updateProject', () => {
    
    it('✅ should update project successfully', async () => {
      // Arrange
      const originalData = createTestProjectData();
      const created = await createProject(testFirestore, originalData);

      const updateData = {
        name: 'Updated Project Name',
        totalBudget: 15000,
        status: 'completed' as const
      };

      // Act
      await updateProject(testFirestore, created.id, updateData);

      // Assert
      const updated = await getProjectById(testFirestore, created.id);
      
      expect(updated?.name).toBe(updateData.name);
      expect(updated?.totalBudget).toBe(updateData.totalBudget);
      expect(updated?.status).toBe(updateData.status);
      
      // Verificar que updatedAt cambió pero createdAt no
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(updated?.createdAt.getTime());
      expect(updated?.clientId).toBe(originalData.clientId); // No modificado
    });

    it('✅ should handle partial updates', async () => {
      // Arrange
      const originalData = createTestProjectData();
      const created = await createProject(testFirestore, originalData);

      // Act - Solo actualizar un campo
      await updateProject(testFirestore, created.id, { name: 'New Name Only' });

      // Assert
      const updated = await getProjectById(testFirestore, created.id);
      
      expect(updated?.name).toBe('New Name Only');
      expect(updated?.clientId).toBe(originalData.clientId); // Sin cambios
      expect(updated?.totalBudget).toBe(originalData.totalBudget); // Sin cambios
    });

  });

  // ==========================================
  // TESTS DE ELIMINACIÓN
  // ==========================================

  describe('deleteProject', () => {
    
    it('✅ should delete project successfully', async () => {
      // Arrange
      const projectData = createTestProjectData();
      const created = await createProject(testFirestore, projectData);

      // Verificar que existe
      let project = await getProjectById(testFirestore, created.id);
      expect(project).toBeDefined();

      // Act
      await deleteProject(testFirestore, created.id);

      // Assert
      project = await getProjectById(testFirestore, created.id);
      expect(project).toBeNull();
      
      // Verificar que no existe en Firestore
      const docRef = doc(testFirestore, 'projects', created.id);
      const docSnap = await getDoc(docRef);
      expect(docSnap.exists()).toBe(false);
    });

  });

  // ==========================================
  // TESTS DE TRANSACCIONES
  // ==========================================

  describe('transaction operations', () => {
    
    it('✅ should handle transaction rollback on error', async () => {
      // Arrange
      const projectData = createTestProjectData();
      const created = await createProject(testFirestore, projectData);

      // Act - Simular operación transaccional que falla
      const transactionPromise = testFirestore.runTransaction(async (transaction) => {
        const docRef = doc(testFirestore, 'projects', created.id);
        transaction.update(docRef, { name: 'Updated in transaction' });
        
        // Simular error
        throw new Error('Transaction failed');
      });

      // Assert
      await expect(transactionPromise).rejects.toThrow('Transaction failed');
      
      // Verificar que no hubo cambios (rollback exitoso)
      const project = await getProjectById(testFirestore, created.id);
      expect(project?.name).toBe(projectData.name); // Sin cambios
    });

  });

  // ==========================================
  // TESTS DE PERFORMANCE
  // ==========================================

  describe('performance tests', () => {
    
    it('✅ should handle batch operations efficiently', async () => {
      // Arrange
      const startTime = Date.now();
      const projectsCount = 20;
      const projectsData = Array.from({ length: projectsCount }, (_, i) => 
        createTestProjectData({ name: `Batch Project ${i}` })
      );

      // Act - Crear proyectos en batch
      const promises = projectsData.map(data => createProject(testFirestore, data));
      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Assert
      const projects = await getProjects(testFirestore);
      expect(projects).toHaveLength(projectsCount);
      
      // Performance assertion (ajustar según necesidades)
      expect(duration).toBeLessThan(10000); // 10 segundos max
      
      console.log(`📊 Batch operation (${projectsCount} projects): ${duration}ms`);
    });

  });

});

// ==========================================
// UTILITIES DE TESTING
// ==========================================

/**
 * Helper para verificar estructura de proyecto
 */
const expectValidProject = (project: any) => {
  expect(project).toBeDefined();
  expect(project.id).toBeDefined();
  expect(typeof project.name).toBe('string');
  expect(typeof project.clientId).toBe('string');
  expect(project.date).toBeInstanceOf(Date);
  expect(project.createdAt).toBeInstanceOf(Date);
  expect(project.updatedAt).toBeInstanceOf(Date);
  expect(['active', 'completed', 'paused']).toContain(project.status);
};

/**
 * Helper para medir tiempo de operación
 */
const measureOperationTime = async <T>(operation: () => Promise<T>): Promise<{ result: T, duration: number }> => {
  const startTime = Date.now();
  const result = await operation();
  const endTime = Date.now();
  
  return {
    result,
    duration: endTime - startTime
  };
};

// ==========================================
// NOTAS DE USO
// ==========================================

/*
REQUISITOS PARA USAR ESTE EJEMPLO:

1. Firebase Emulator instalado y configurado:
   npm install -g firebase-tools
   firebase init emulators
   firebase emulators:start --only firestore

2. Dependencias de testing:
   npm install -D @firebase/rules-unit-testing

3. Configuración Jest:
   - Timeout extendido: testTimeout: 30000
   - Setup/teardown apropiado

4. Variables de entorno:
   FIRESTORE_EMULATOR_HOST=localhost:8080

CÓMO ADAPTAR:

1. Cambiar imports del servicio:
   - Reemplazar 'projectService' por tu servicio
   - Actualizar funciones específicas

2. Adaptar datos de prueba:
   - Modificar createTestProjectData() con tu schema
   - Actualizar fields específicos

3. Actualizar collection names:
   - Cambiar 'projects' por tu collection

4. Ejecutar:
   firebase emulators:start --only firestore
   npm test -- tu-servicio.integration.test.ts

VENTAJAS DE TESTS DE INTEGRACIÓN:
✅ Comportamiento real de Firebase
✅ Validación de transacciones
✅ Testing de performance
✅ Detección de race conditions
✅ Validación de security rules (si se configuran)

DESVENTAJAS:
❌ Más lentos que unit tests
❌ Requieren infraestructura externa
❌ Más complejos de debuggear
❌ Pueden ser flaky si hay problemas de red
*/