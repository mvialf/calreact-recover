/**
 * Tests E2E para gestión de proyectos usando Playwright MCP
 * Prueba de concepto para validar el flujo completo de CRUD de proyectos
 */

import { loginUser, logoutUser, TEST_USERS } from '../helpers/auth.helper';
import { 
  TEST_PROJECTS, 
  generateUniqueProject, 
  SELECTORS,
  WAIT_TIMES 
} from '../helpers/test-data.helper';
import { isFirebaseError } from '../types/forms';

/**
 * PROOF OF CONCEPT: Test de creación completa de proyecto
 * 
 * Este test valida el flujo end-to-end más crítico:
 * 1. Autenticación de usuario
 * 2. Navegación al módulo de proyectos
 * 3. Creación de nuevo proyecto con formulario completo
 * 4. Validación de guardado en Firebase
 * 5. Verificación en listado de proyectos
 */
export const testCreateProjectComplete = async (page: any) => {
  console.log('🚀 Iniciando Proof of Concept: Creación de Proyecto');
  
  try {
    // === FASE 1: AUTENTICACIÓN ===
    console.log('📝 Fase 1: Autenticación de usuario');
    await loginUser(page, TEST_USERS.admin);
    
    // Verificar que estamos en dashboard
    await page.waitFor({ text: 'Dashboard' });
    console.log('✅ Usuario autenticado correctamente');
    
    // === FASE 2: NAVEGACIÓN A PROYECTOS ===
    console.log('📂 Fase 2: Navegación a módulo de proyectos');
    await page.click({
      element: 'enlace de proyectos',
      ref: SELECTORS.navigation.projects
    });
    
    // Esperar que cargue la página de proyectos
    await page.waitFor({ text: 'Proyectos' });
    console.log('✅ Navegación a proyectos exitosa');
    
    // === FASE 3: INICIAR CREACIÓN DE PROYECTO ===
    console.log('➕ Fase 3: Iniciar creación de nuevo proyecto');
    await page.click({
      element: 'botón crear proyecto',
      ref: '[data-testid="create-project-button"]'
    });
    
    // Esperar que aparezca el formulario
    await page.waitFor({ text: 'Crear Nuevo Proyecto' });
    console.log('✅ Formulario de creación abierto');
    
    // === FASE 4: LLENAR FORMULARIO COMPLETO ===
    console.log('📋 Fase 4: Llenado de formulario completo');
    
    const projectData = generateUniqueProject();
    
    // Información del cliente
    await page.fill_form({
      fields: [
        {
          name: 'nombre del cliente',
          type: 'textbox',
          ref: 'input[name="clientName"]',
          value: projectData.clientName
        },
        {
          name: 'teléfono del cliente', 
          type: 'textbox',
          ref: 'input[name="clientPhone"]',
          value: projectData.clientPhone
        },
        {
          name: 'email del cliente',
          type: 'textbox', 
          ref: 'input[name="clientEmail"]',
          value: projectData.clientEmail
        }
      ]
    });
    
    // Dirección del proyecto
    await page.type({
      element: 'campo de dirección',
      ref: 'input[name="address"]',
      text: projectData.address
    });
    
    // Características del proyecto
    await page.fill_form({
      fields: [
        {
          name: 'área en metros',
          type: 'textbox',
          ref: 'input[name="area"]', 
          value: projectData.area.toString()
        },
        {
          name: 'número de plantas',
          type: 'textbox',
          ref: 'input[name="floors"]',
          value: projectData.floors.toString()
        },
        {
          name: 'número de habitaciones',
          type: 'textbox',
          ref: 'input[name="rooms"]',
          value: projectData.rooms.toString()  
        },
        {
          name: 'número de baños',
          type: 'textbox',
          ref: 'input[name="bathrooms"]',
          value: projectData.bathrooms.toString()
        }
      ]
    });
    
    // Presupuesto y fechas
    await page.fill_form({
      fields: [
        {
          name: 'presupuesto',
          type: 'textbox',
          ref: 'input[name="budget"]',
          value: projectData.budget.toString()
        },
        {
          name: 'fecha de inicio',
          type: 'textbox',
          ref: 'input[name="startDate"]',
          value: projectData.startDate
        },
        {
          name: 'fecha estimada de fin',
          type: 'textbox', 
          ref: 'input[name="expectedEndDate"]',
          value: projectData.expectedEndDate
        }
      ]
    });
    
    // Tipo de proyecto (dropdown)
    await page.click({
      element: 'selector tipo de proyecto',
      ref: 'select[name="projectType"]'
    });
    
    await page.select_option({
      element: 'tipo de proyecto',
      ref: 'select[name="projectType"]',
      values: [projectData.projectType]
    });
    
    // Descripción del proyecto
    await page.type({
      element: 'descripción del proyecto',
      ref: 'textarea[name="description"]', 
      text: projectData.description
    });
    
    console.log('✅ Formulario completado correctamente');
    
    // === FASE 5: GUARDAR PROYECTO ===
    console.log('💾 Fase 5: Guardado del proyecto');
    
    await page.click({
      element: 'botón guardar proyecto',
      ref: SELECTORS.buttons.save
    });
    
    // Esperar confirmación de guardado
    await page.waitFor({ text: 'Proyecto creado exitosamente' });
    console.log('✅ Proyecto guardado en Firebase');
    
    // === FASE 6: VERIFICACIÓN EN LISTADO ===
    console.log('🔍 Fase 6: Verificación en listado de proyectos');
    
    // Esperar redirección al listado
    await page.waitFor({ text: 'Lista de Proyectos' });
    
    // Verificar que el proyecto aparece en la lista
    await page.waitFor({ text: projectData.clientName });
    console.log('✅ Proyecto visible en listado');
    
    // === FASE 7: VERIFICAR DETALLES ===
    console.log('👁️ Fase 7: Verificación de detalles del proyecto');
    
    // Hacer click en el proyecto recién creado
    await page.click({
      element: 'proyecto recién creado', 
      ref: `[data-testid="project-${projectData.clientName.replace(/\s+/g, '-').toLowerCase()}"]`
    });
    
    // Verificar que se abre la vista de detalles
    await page.waitFor({ text: 'Detalles del Proyecto' });
    
    // Verificar datos específicos
    await page.waitFor({ text: projectData.clientEmail });
    await page.waitFor({ text: projectData.address });
    await page.waitFor({ text: projectData.budget.toString() });
    
    console.log('✅ Detalles del proyecto verificados');
    
    // === LIMPIEZA: LOGOUT ===
    console.log('🚪 Limpieza: Cerrar sesión');
    await logoutUser(page);
    
    console.log('🎉 PROOF OF CONCEPT EXITOSO - Flujo completo validado');
    
    return {
      success: true,
      projectData,
      message: 'Creación de proyecto E2E completada exitosamente'
    };
    
  } catch (error: unknown) {
    console.error('❌ Error en Proof of Concept:', error);
    
    // Capturar screenshot del error
    await page.take_screenshot({
      filename: `error-project-creation-${Date.now()}.png`,
      fullPage: true
    });
    
    return {
      success: false,
      error: isFirebaseError(error) ? error.message : 'Error desconocido en creación de proyecto',
      message: 'Falló el test de creación de proyecto'
    };
  }
};

/**
 * Test de edición de proyecto existente
 */
export const testEditProject = async (page: any) => {
  console.log('✏️ Iniciando test de edición de proyecto');
  
  try {
    await loginUser(page, TEST_USERS.admin);
    
    // Navegar a proyectos
    await page.navigate('http://localhost:3002/projects');
    await page.waitFor({ text: 'Proyectos' });
    
    // Hacer click en el primer proyecto de la lista
    await page.click({
      element: 'primer proyecto en lista',
      ref: '[data-testid^="project-"] button[aria-label="Editar"]'
    });
    
    // Esperar formulario de edición
    await page.waitFor({ text: 'Editar Proyecto' });
    
    // Modificar el presupuesto
    const newBudget = '75000';
    await page.type({
      element: 'campo presupuesto',
      ref: 'input[name="budget"]',
      text: newBudget
    });
    
    // Guardar cambios
    await page.click({
      element: 'botón guardar cambios',
      ref: SELECTORS.buttons.save
    });
    
    // Verificar éxito
    await page.waitFor({ text: 'Proyecto actualizado exitosamente' });
    
    console.log('✅ Edición de proyecto exitosa');
    
    await logoutUser(page);
    
    return { success: true, message: 'Edición completada' };
    
  } catch (error: unknown) {
    console.error('❌ Error en edición de proyecto:', error);
    return { success: false, error: isFirebaseError(error) ? error.message : 'Error desconocido en edición de proyecto' };
  }
};

/**
 * Test de eliminación de proyecto
 */
export const testDeleteProject = async (page: any) => {
  console.log('🗑️ Iniciando test de eliminación de proyecto');
  
  try {
    await loginUser(page, TEST_USERS.admin);
    
    // Navegar a proyectos
    await page.navigate('http://localhost:3002/projects');
    await page.waitFor({ text: 'Proyectos' });
    
    // Hacer click en botón de eliminar del último proyecto
    await page.click({
      element: 'botón eliminar proyecto',
      ref: '[data-testid^="project-"] button[aria-label="Eliminar"]'
    });
    
    // Confirmar eliminación en modal
    await page.waitFor({ text: '¿Estás seguro?' });
    await page.click({
      element: 'confirmar eliminación',
      ref: '[data-testid="confirm-delete"]'
    });
    
    // Verificar éxito
    await page.waitFor({ text: 'Proyecto eliminado exitosamente' });
    
    console.log('✅ Eliminación de proyecto exitosa');
    
    await logoutUser(page);
    
    return { success: true, message: 'Eliminación completada' };
    
  } catch (error: unknown) {
    console.error('❌ Error en eliminación de proyecto:', error);
    return { success: false, error: isFirebaseError(error) ? error.message : 'Error desconocido en eliminación de proyecto' };
  }
};

// Exportar todos los tests
export const PROJECT_E2E_TESTS = {
  testCreateProjectComplete,
  testEditProject,
  testDeleteProject
} as const;