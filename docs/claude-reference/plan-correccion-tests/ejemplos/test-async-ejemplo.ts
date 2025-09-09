/**
 * EJEMPLO: Tests Asíncronos y Manejo de Promises
 * 
 * Demuestra patrones correctos para testing async/await
 * Template para APIs externas, timeouts, y operaciones asíncronas
 * 
 * @author Mentor Técnico AI
 * @date 2025-09-08
 */

// ==========================================
// IMPORTS Y SETUP
// ==========================================

import { mockFirestore, MockTimestamp } from '../mocks/firebase-v11-mocks';
import { mockGoogleMaps, setupJestGoogleMapsMocks } from '../mocks/google-maps-mocks';

// ✅ Setup mocks
jest.mock('firebase/firestore', () => mockFirestore);
setupJestGoogleMapsMocks();

// Servicio/adapter a testear (adaptar según tu caso)
import { PlacesServiceAdapter } from '../../lib/places/PlacesServiceAdapter';
import { eventEnrichmentService } from '../../services/eventEnrichmentService';

// ==========================================
// MOCK DE TIMERS Y ASYNC UTILITIES
// ==========================================

/**
 * Helper para crear delays controlados en tests
 */
const createDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper para crear Promise que falla después de timeout
 */
const createTimeoutPromise = <T>(ms: number, value?: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (value !== undefined) {
        resolve(value);
      } else {
        reject(new Error(`Operation timed out after ${ms}ms`));
      }
    }, ms);
  });
};

/**
 * Helper para crear operación que se puede cancelar
 */
const createCancellableOperation = () => {
  let cancelled = false;
  
  const operation = async (duration: number) => {
    await createDelay(duration);
    if (cancelled) {
      throw new Error('Operation was cancelled');
    }
    return 'success';
  };
  
  const cancel = () => { cancelled = true; };
  
  return { operation, cancel };
};

// ==========================================
// TEST SUITE PRINCIPAL
// ==========================================

describe('Async Operations Testing', () => {
  
  // ==========================================
  // SETUP Y CLEANUP
  // ==========================================
  
  beforeEach(() => {
    // Limpiar mocks
    jest.clearAllMocks();
    
    // Reset timers to real timers
    jest.useRealTimers();
  });

  afterEach(() => {
    // Cleanup
    jest.restoreAllMocks();
  });

  // ==========================================
  // TESTS BÁSICOS ASYNC/AWAIT
  // ==========================================

  describe('basic async patterns', () => {
    
    it('✅ should handle simple async operation', async () => {
      // Arrange
      const mockAsyncFunction = jest.fn().mockResolvedValue('success');

      // Act
      const result = await mockAsyncFunction();

      // Assert
      expect(result).toBe('success');
      expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
    });

    it('✅ should handle async operation with parameters', async () => {
      // Arrange
      const mockApiCall = jest.fn()
        .mockResolvedValueOnce({ id: 1, name: 'First' })
        .mockResolvedValueOnce({ id: 2, name: 'Second' });

      // Act
      const result1 = await mockApiCall('param1');
      const result2 = await mockApiCall('param2');

      // Assert
      expect(result1).toEqual({ id: 1, name: 'First' });
      expect(result2).toEqual({ id: 2, name: 'Second' });
      expect(mockApiCall).toHaveBeenCalledWith('param1');
      expect(mockApiCall).toHaveBeenCalledWith('param2');
    });

    it('✅ should handle rejected promises', async () => {
      // Arrange
      const mockFailingFunction = jest.fn()
        .mockRejectedValue(new Error('Operation failed'));

      // Act & Assert
      await expect(mockFailingFunction()).rejects.toThrow('Operation failed');
      expect(mockFailingFunction).toHaveBeenCalledTimes(1);
    });

  });

  // ==========================================
  // TESTS DE GOOGLE PLACES API
  // ==========================================

  describe('PlacesServiceAdapter async tests', () => {
    
    let adapter: PlacesServiceAdapter;

    beforeEach(() => {
      adapter = new PlacesServiceAdapter();
    });

    it('✅ should initialize without timeout', async () => {
      // Act
      await adapter.initialize();

      // Assert
      expect(adapter.isInitialized()).toBe(true);
    }, 10000); // 10s timeout para inicialización

    it('✅ should get place predictions asynchronously', async () => {
      // Arrange
      await adapter.initialize();

      // Act
      const results = await adapter.getPlacePredictions('Madrid');

      // Assert
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      
      if (results.length > 0) {
        expect(results[0]).toHaveProperty('description');
        expect(results[0]).toHaveProperty('place_id');
      }
    });

    it('✅ should handle API errors gracefully', async () => {
      // Arrange
      await adapter.initialize();
      
      // Mock que simula error de API
      const mockError = new Error('API_ERROR');
      jest.spyOn(adapter as any, 'callPlacesAPI').mockRejectedValue(mockError);

      // Act & Assert
      await expect(adapter.getPlacePredictions('invalid')).rejects.toThrow('API_ERROR');
    });

    it('✅ should handle concurrent requests', async () => {
      // Arrange
      await adapter.initialize();
      const queries = ['Madrid', 'Barcelona', 'Valencia'];

      // Act - Ejecutar requests concurrentemente
      const promises = queries.map(query => adapter.getPlacePredictions(query));
      const results = await Promise.all(promises);

      // Assert
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

  });

  // ==========================================
  // TESTS CON TIMERS Y DELAYS
  // ==========================================

  describe('timer and delay handling', () => {
    
    beforeEach(() => {
      // Usar fake timers para controlar tiempo
      jest.useFakeTimers();
    });

    afterEach(() => {
      // Limpiar timers pendientes
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    it('✅ should handle debouncing with fake timers', async () => {
      // Arrange
      const mockCallback = jest.fn();
      const debouncedFn = debounce(mockCallback, 500);

      // Act
      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');

      // Fast-forward time
      jest.advanceTimersByTime(500);

      // Assert
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith('call3'); // Solo la última llamada
    });

    it('✅ should handle timeouts with fake timers', async () => {
      // Arrange
      const mockTimeoutFunction = jest.fn();
      
      setTimeout(mockTimeoutFunction, 1000);

      // Act
      jest.advanceTimersByTime(999);
      expect(mockTimeoutFunction).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);

      // Assert
      expect(mockTimeoutFunction).toHaveBeenCalledTimes(1);
    });

    it('✅ should handle intervals with fake timers', () => {
      // Arrange
      const mockIntervalFunction = jest.fn();
      
      setInterval(mockIntervalFunction, 100);

      // Act & Assert
      expect(mockIntervalFunction).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockIntervalFunction).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(200);
      expect(mockIntervalFunction).toHaveBeenCalledTimes(3);
    });

  });

  // ==========================================
  // TESTS DE RETRY Y CIRCUIT BREAKER
  // ==========================================

  describe('retry and resilience patterns', () => {
    
    it('✅ should retry failed operations', async () => {
      // Arrange
      const mockOperation = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('Success on third try');

      const retryOperation = async (operation: Function, maxRetries: number) => {
        let lastError;
        
        for (let i = 0; i <= maxRetries; i++) {
          try {
            return await operation();
          } catch (error) {
            lastError = error;
            if (i === maxRetries) throw error;
            
            // Exponential backoff
            await createDelay(Math.pow(2, i) * 100);
          }
        }
      };

      // Act
      const result = await retryOperation(mockOperation, 3);

      // Assert
      expect(result).toBe('Success on third try');
      expect(mockOperation).toHaveBeenCalledTimes(3);
    });

    it('✅ should respect maximum retry limit', async () => {
      // Arrange
      const mockFailingOperation = jest.fn()
        .mockRejectedValue(new Error('Always fails'));

      const retryOperation = async (operation: Function, maxRetries: number) => {
        for (let i = 0; i <= maxRetries; i++) {
          try {
            return await operation();
          } catch (error) {
            if (i === maxRetries) throw error;
            await createDelay(50);
          }
        }
      };

      // Act & Assert
      await expect(retryOperation(mockFailingOperation, 2)).rejects.toThrow('Always fails');
      expect(mockFailingOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

  });

  // ==========================================
  // TESTS DE RACE CONDITIONS
  // ==========================================

  describe('race conditions and concurrent operations', () => {
    
    it('✅ should handle Promise.race correctly', async () => {
      // Arrange
      const fastOperation = createDelay(100).then(() => 'fast');
      const slowOperation = createDelay(300).then(() => 'slow');

      // Act
      const result = await Promise.race([fastOperation, slowOperation]);

      // Assert
      expect(result).toBe('fast');
    });

    it('✅ should handle Promise.allSettled', async () => {
      // Arrange
      const successPromise = Promise.resolve('success');
      const failurePromise = Promise.reject(new Error('failure'));
      const slowSuccess = createDelay(200).then(() => 'slow success');

      // Act
      const results = await Promise.allSettled([
        successPromise, 
        failurePromise, 
        slowSuccess
      ]);

      // Assert
      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({ status: 'fulfilled', value: 'success' });
      expect(results[1]).toEqual({ status: 'rejected', reason: expect.any(Error) });
      expect(results[2]).toEqual({ status: 'fulfilled', value: 'slow success' });
    });

    it('✅ should handle operation cancellation', async () => {
      // Arrange
      const { operation, cancel } = createCancellableOperation();

      // Act
      const operationPromise = operation(500);
      
      // Cancelar después de 100ms
      setTimeout(cancel, 100);

      // Assert
      await expect(operationPromise).rejects.toThrow('Operation was cancelled');
    });

  });

  // ==========================================
  // TESTS DE FIREBASE ASYNC OPERATIONS
  // ==========================================

  describe('Firebase async operations', () => {
    
    it('✅ should handle Firestore operations asynchronously', async () => {
      // Arrange
      const mockCollection = mockFirestore.collection('test');
      const testData = {
        name: 'Test Document',
        createdAt: MockTimestamp.now()
      };

      // Act
      const addResult = await mockCollection.add(testData);
      const getResult = await mockCollection.doc(addResult.id).get();

      // Assert
      expect(addResult.id).toBeDefined();
      expect(getResult.exists()).toBe(true);
      expect(getResult.data().name).toBe(testData.name);
    });

    it('✅ should handle batch operations', async () => {
      // Arrange
      const batch = mockFirestore.writeBatch();
      const collection = mockFirestore.collection('test');
      
      const documents = [
        { name: 'Doc 1', value: 1 },
        { name: 'Doc 2', value: 2 },
        { name: 'Doc 3', value: 3 }
      ];

      // Act - Agregar documentos al batch
      documents.forEach(doc => {
        const docRef = collection.doc();
        batch.set(docRef, doc);
      });

      await batch.commit();

      // Assert
      expect(batch.set).toHaveBeenCalledTimes(3);
      expect(batch.commit).toHaveBeenCalledTimes(1);
    });

    it('✅ should handle transaction rollback', async () => {
      // Arrange
      const mockDoc = mockFirestore.collection('test').doc('test-id');
      
      // Mock transaction que falla
      mockFirestore.runTransaction.mockImplementation(async (updateFunction) => {
        try {
          await updateFunction({
            get: jest.fn().mockResolvedValue({ data: () => ({ value: 10 }) }),
            set: jest.fn(),
            update: jest.fn()
          });
        } catch (error) {
          throw new Error('Transaction failed');
        }
      });

      // Act & Assert
      await expect(mockFirestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(mockDoc);
        transaction.update(mockDoc, { value: doc.data().value + 1 });
        throw new Error('Simulated error');
      })).rejects.toThrow();
    });

  });

  // ==========================================
  // TESTS DE ERROR HANDLING AVANZADO
  // ==========================================

  describe('advanced error handling', () => {
    
    it('✅ should handle network errors with exponential backoff', async () => {
      // Arrange
      let attempts = 0;
      const mockNetworkCall = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error('Network timeout'));
        }
        return Promise.resolve('Success after retries');
      });

      const networkCallWithRetry = async (maxRetries = 3) => {
        for (let i = 0; i <= maxRetries; i++) {
          try {
            return await mockNetworkCall();
          } catch (error) {
            if (i === maxRetries) throw error;
            
            const delay = Math.min(1000 * Math.pow(2, i), 10000);
            await createDelay(delay);
          }
        }
      };

      // Act
      const result = await networkCallWithRetry();

      // Assert
      expect(result).toBe('Success after retries');
      expect(mockNetworkCall).toHaveBeenCalledTimes(3);
    });

    it('✅ should handle timeout with AbortController', async () => {
      // Arrange
      const controller = new AbortController();
      const timeoutMs = 1000;

      const mockLongOperation = jest.fn().mockImplementation(
        (signal: AbortSignal) => {
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => resolve('completed'), 2000);
            
            signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('Operation aborted'));
            });
          });
        }
      );

      // Act
      const operationPromise = mockLongOperation(controller.signal);
      setTimeout(() => controller.abort(), timeoutMs);

      // Assert
      await expect(operationPromise).rejects.toThrow('Operation aborted');
    });

  });

});

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Simple debounce implementation for testing
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Helper para simular operaciones de red con variabilidad
 */
const simulateNetworkCall = async <T>(
  data: T, 
  options: { 
    delay?: number, 
    failureRate?: number,
    timeoutAfter?: number 
  } = {}
): Promise<T> => {
  const { 
    delay = 100, 
    failureRate = 0, 
    timeoutAfter 
  } = options;

  // Simular timeout si está configurado
  if (timeoutAfter) {
    const timeoutPromise = createDelay(timeoutAfter).then(() => {
      throw new Error('Network timeout');
    });
    
    const dataPromise = createDelay(delay).then(() => {
      if (Math.random() < failureRate) {
        throw new Error('Network error');
      }
      return data;
    });

    return Promise.race([dataPromise, timeoutPromise]);
  }

  // Operación normal
  await createDelay(delay);
  
  if (Math.random() < failureRate) {
    throw new Error('Random network failure');
  }
  
  return data;
};

// ==========================================
// CUSTOM ASSERTIONS
// ==========================================

/**
 * Matcher para verificar que una promesa se resuelve en tiempo específico
 */
expect.extend({
  async toResolveWithin(received: Promise<any>, timeMs: number) {
    const start = Date.now();
    
    try {
      await received;
      const elapsed = Date.now() - start;
      const pass = elapsed <= timeMs;
      
      return {
        message: () => pass
          ? `expected promise not to resolve within ${timeMs}ms (resolved in ${elapsed}ms)`
          : `expected promise to resolve within ${timeMs}ms (took ${elapsed}ms)`,
        pass
      };
    } catch (error) {
      return {
        message: () => `expected promise to resolve within ${timeMs}ms but it rejected with: ${error}`,
        pass: false
      };
    }
  }
});

// ==========================================
// TYPESCRIPT DECLARATIONS
// ==========================================

declare global {
  namespace jest {
    interface Matchers<R> {
      toResolveWithin(timeMs: number): Promise<R>;
    }
  }
}

// ==========================================
// NOTAS DE USO
// ==========================================

/*
PATRONES ASYNC CUBIERTOS:

1. ✅ Basic async/await - Simple promises resolution/rejection
2. ✅ API mocking - Mock functions con resolvedValue/rejectedValue  
3. ✅ Timeout handling - Real timers vs fake timers
4. ✅ Debouncing - Fake timers para controlar delays
5. ✅ Retry patterns - Exponential backoff, max attempts
6. ✅ Race conditions - Promise.race, Promise.allSettled
7. ✅ Cancellation - AbortController, cancellable operations
8. ✅ Firebase async - Firestore operations, transactions, batches
9. ✅ Error handling - Network errors, timeouts, retries
10. ✅ Performance - Concurrent operations, batch processing

HERRAMIENTAS CLAVE:

- jest.useFakeTimers() - Control total sobre tiempo
- jest.advanceTimersByTime() - Avanzar tiempo manualmente
- Promise.all/race/allSettled - Patrones de concurrencia
- AbortController - Cancelación de operaciones
- Custom matchers - Assertions específicas de timing

DEBUGGING ASYNC TESTS:

- Usar timeout extendido en tests lentos: it('test', async () => {}, 10000)
- console.time/timeEnd para medir duración real
- jest.setTimeout() para timeout global
- --detectOpenHandles flag para encontrar async handles pendientes

COMMON PITFALLS:

❌ No usar await - Tests pasan pero no verifican nada
❌ No limpiar timers - Tests flaky por interferencia
❌ Timeouts muy cortos - Tests fallan aleatoriamente
❌ No manejar rejections - Unhandled promise rejections
❌ Race conditions - Orden de operations no determinístico

EJEMPLO DE EJECUCIÓN:
npm test -- test-async-ejemplo.ts --verbose
*/