/**
 * Dependency Injection utilities for Firebase services
 * Implementa patrón de inyección de dependencias requerido por CLAUDE.md
 */

import { Firestore } from 'firebase/firestore';
import { db } from './client';

/**
 * Tipo para funciones que aceptan instancia de Firestore como primer parámetro
 */
export type FirestoreFunction<T extends any[], R> = (firestore: Firestore, ...args: T) => R;

/**
 * Tipo para funciones legacy que usan instancia global
 */
export type LegacyFunction<T extends any[], R> = (...args: T) => R;

/**
 * Crea una función que puede usar tanto inyección de dependencias como instancia global
 * para mantener compatibilidad hacia atrás
 */
export function createFirestoreFunction<T extends any[], R>(
  implementation: FirestoreFunction<T, R>
): LegacyFunction<T, R> & { withFirestore: FirestoreFunction<T, R> } {
  // Función legacy que usa instancia global
  const legacyFunction = (...args: T): R => {
    return implementation(db, ...args);
  };

  // Agregar método para inyección de dependencias
  legacyFunction.withFirestore = implementation;

  return legacyFunction;
}

/**
 * Obtiene la instancia de Firestore por defecto
 * Permite configuraciones dinámicas en el futuro
 */
export function getDefaultFirestore(): Firestore {
  return db;
}

/**
 * Tipo helper para servicios que soportan inyección de dependencias
 */
export type FirestoreService = {
  [K: string]: LegacyFunction<any[], any> & { withFirestore?: FirestoreFunction<any[], any> };
};