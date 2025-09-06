// src/constants/project.ts
// Constantes relacionadas con proyectos y su gestión

export const UNINSTALL_TYPE_OPTIONS = [
  { value: "Aluminio", label: "Aluminio" },
  { value: "Madera", label: "Madera" },
  { value: "Fierro", label: "Fierro" },
  { value: "PVC", label: "PVC" },
  { value: "Americano", label: "Americano" }
];

export const PROJECT_STATUS_OPTIONS = [
  { value: 'ingresado', label: 'Ingresado' },
  { value: 'programar', label: 'Programar' },
  { value: 'fabricación', label: 'Fabricación' },
  { value: 'montaje', label: 'Montaje' },
  { value: 'sello', label: 'Sello' },
  { value: 'continuación', label: 'Continuación' },
  { value: 'complicación', label: 'Complicación' },
  { value: 'completado', label: 'Completado' }
] as const;

export type ProjectStatusConstant = typeof PROJECT_STATUS_OPTIONS[number]['value'];
