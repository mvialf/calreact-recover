'use client';

import React from 'react';
import { ProjectForm } from '@/components/forms/compound/ProjectFormCompound';
import type { ProjectFormData } from '@/components/forms/compound/ProjectFormCompound';

/**
 * Ejemplo de uso del ProjectForm compound component
 * 
 * Este ejemplo demuestra cómo usar el patrón compound component
 * para crear formularios flexibles y reutilizables.
 */
export function ProjectFormCompoundExample() {
  const handleSubmit = (data: ProjectFormData) => {

    // Aquí iría la lógica de guardado
  };

  const handleCancel = () => {

  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Proyecto</h1>
      
      {/* Ejemplo 1: Formulario completo estándar */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Formulario Estándar</h2>
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitButtonText="Crear Proyecto"
        >
          <ProjectForm.BasicInfo />
          <ProjectForm.ContactInfo />
          <ProjectForm.ServiceDetails />
          <ProjectForm.Actions />
        </ProjectForm>
      </div>

      {/* Ejemplo 2: Formulario personalizado (solo información básica) */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Formulario Simplificado</h2>
        <ProjectForm
          onSubmit={handleSubmit}
          showDefaultButtons={false}
        >
          <ProjectForm.BasicInfo />
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Guardar Borrador
            </button>
          </div>
        </ProjectForm>
      </div>

      {/* Ejemplo 3: Formulario con orden personalizado */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Orden Personalizado</h2>
        <ProjectForm
          onSubmit={handleSubmit}
          submitButtonText="Actualizar Proyecto"
        >
          <ProjectForm.ServiceDetails />
          <ProjectForm.BasicInfo />
          <ProjectForm.ContactInfo />
          <ProjectForm.Actions />
        </ProjectForm>
      </div>

      {/* Ejemplo 4: Formulario con secciones intercaladas con contenido custom */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Con Contenido Personalizado</h2>
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        >
          <ProjectForm.BasicInfo />
          
          {/* Contenido personalizado entre secciones */}
          <div className="bg-blue-50 p-4 rounded-lg border">
            <h4 className="font-medium text-blue-900 mb-2">💡 Consejo</h4>
            <p className="text-sm text-blue-800">
              Asegúrate de verificar la información del cliente antes de continuar.
            </p>
          </div>
          
          <ProjectForm.ContactInfo />
          <ProjectForm.ServiceDetails />
          <ProjectForm.Actions />
        </ProjectForm>
      </div>
    </div>
  );
}

export default ProjectFormCompoundExample;