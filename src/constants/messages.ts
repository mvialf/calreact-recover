/**
 * Constantes de mensajes de la aplicación
 * 
 * Centraliza todos los mensajes de texto, notificaciones, errores y validaciones
 * para facilitar mantenimiento y futura internacionalización.
 */

// ===== MENSAJES GENERALES =====

export const GENERAL_MESSAGES = {
  // Acciones genéricas
  SAVE: 'Guardar',
  CANCEL: 'Cancelar',
  DELETE: 'Eliminar',
  EDIT: 'Editar',
  CREATE: 'Crear',
  UPDATE: 'Actualizar',
  CONFIRM: 'Confirmar',
  CLOSE: 'Cerrar',
  BACK: 'Volver',
  CONTINUE: 'Continuar',
  SEARCH: 'Buscar',
  FILTER: 'Filtrar',
  RESET: 'Restablecer',
  LOADING: 'Cargando...',
  
  // Estados
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  ENABLED: 'Habilitado',
  DISABLED: 'Deshabilitado',
  AVAILABLE: 'Disponible',
  UNAVAILABLE: 'No disponible',
  
  // Genéricos
  YES: 'Sí',
  NO: 'No',
  NONE: 'Ninguno',
  ALL: 'Todos',
  OPTIONAL: 'Opcional',
  REQUIRED: 'Requerido',
} as const;

// ===== MENSAJES DE ÉXITO =====

export const SUCCESS_MESSAGES = {
  // CRUD genérico
  CREATED: 'Elemento creado exitosamente',
  UPDATED: 'Elemento actualizado exitosamente',
  DELETED: 'Elemento eliminado exitosamente',
  SAVED: 'Cambios guardados exitosamente',
  
  // Proyectos
  PROJECT_CREATED: 'Proyecto creado exitosamente',
  PROJECT_UPDATED: 'Proyecto actualizado exitosamente',
  PROJECT_DELETED: 'Proyecto eliminado exitosamente',
  
  // Clientes
  CLIENT_CREATED: 'Cliente creado exitosamente',
  CLIENT_UPDATED: 'Cliente actualizado exitosamente',
  CLIENT_DELETED: 'Cliente eliminado exitosamente',
  
  // Pagos
  PAYMENT_CREATED: 'Pago registrado exitosamente',
  PAYMENT_UPDATED: 'Pago actualizado exitosamente',
  PAYMENT_DELETED: 'Pago eliminado exitosamente',
  
  // Visitas
  VISIT_CREATED: 'Visita programada exitosamente',
  VISIT_UPDATED: 'Visita actualizada exitosamente',
  VISIT_DELETED: 'Visita eliminada exitosamente',
  
  // Postventa
  AFTERSALE_CREATED: 'Servicio postventa creado exitosamente',
  AFTERSALE_UPDATED: 'Servicio postventa actualizado exitosamente',
  AFTERSALE_DELETED: 'Servicio postventa eliminado exitosamente',
  
  // Otras acciones
  DATA_SYNCED: 'Datos sincronizados exitosamente',
  SETTINGS_SAVED: 'Configuración guardada exitosamente',
  EXPORT_COMPLETED: 'Exportación completada exitosamente',
  IMPORT_COMPLETED: 'Importación completada exitosamente',
  COPY_SUCCESS: 'Copiado al portapapeles exitosamente',
} as const;

// ===== MENSAJES DE ERROR =====

export const ERROR_MESSAGES = {
  // Errores genéricos
  UNEXPECTED_ERROR: 'Ha ocurrido un error inesperado',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  PERMISSION_DENIED: 'No tiene permisos para realizar esta acción',
  RESOURCE_NOT_FOUND: 'El recurso solicitado no fue encontrado',
  OPERATION_FAILED: 'La operación no pudo completarse',
  
  // CRUD genérico
  CREATE_FAILED: 'Error al crear elemento',
  UPDATE_FAILED: 'Error al actualizar elemento',
  DELETE_FAILED: 'Error al eliminar elemento',
  LOAD_FAILED: 'Error al cargar datos',
  SAVE_FAILED: 'Error al guardar cambios',
  
  // Proyectos
  PROJECT_CREATE_FAILED: 'Error al crear proyecto',
  PROJECT_UPDATE_FAILED: 'Error al actualizar proyecto',
  PROJECT_DELETE_FAILED: 'Error al eliminar proyecto',
  PROJECT_LOAD_FAILED: 'Error al cargar proyectos',
  
  // Clientes
  CLIENT_CREATE_FAILED: 'Error al crear cliente',
  CLIENT_UPDATE_FAILED: 'Error al actualizar cliente',
  CLIENT_DELETE_FAILED: 'Error al eliminar cliente',
  CLIENT_LOAD_FAILED: 'Error al cargar clientes',
  
  // Pagos
  PAYMENT_CREATE_FAILED: 'Error al registrar pago',
  PAYMENT_UPDATE_FAILED: 'Error al actualizar pago',
  PAYMENT_DELETE_FAILED: 'Error al eliminar pago',
  PAYMENT_LOAD_FAILED: 'Error al cargar pagos',
  
  // Visitas
  VISIT_CREATE_FAILED: 'Error al crear visita',
  VISIT_UPDATE_FAILED: 'Error al actualizar visita',
  VISIT_DELETE_FAILED: 'Error al eliminar visita',
  VISIT_LOAD_FAILED: 'Error al cargar visitas',
  
  // Postventa
  AFTERSALE_CREATE_FAILED: 'Error al crear servicio postventa',
  AFTERSALE_UPDATE_FAILED: 'Error al actualizar servicio postventa',
  AFTERSALE_DELETE_FAILED: 'Error al eliminar servicio postventa',
  AFTERSALE_LOAD_FAILED: 'Error al cargar servicios postventa',
  
  // Validación
  REQUIRED_FIELD: 'Este campo es requerido',
  INVALID_FORMAT: 'Formato inválido',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PHONE: 'Número de teléfono inválido',
  INVALID_DATE: 'Fecha inválida',
  INVALID_NUMBER: 'Número inválido',
  MIN_LENGTH: (min: number) => `Mínimo ${min} caracteres`,
  MAX_LENGTH: (max: number) => `Máximo ${max} caracteres`,
  MIN_VALUE: (min: number) => `Valor mínimo: ${min}`,
  MAX_VALUE: (max: number) => `Valor máximo: ${max}`,
  
  // Otros errores
  SYNC_FAILED: 'Error al sincronizar datos',
  EXPORT_FAILED: 'Error al exportar datos',
  IMPORT_FAILED: 'Error al importar datos',
  COPY_FAILED: 'Error al copiar al portapapeles',
} as const;

// ===== MENSAJES DE CONFIRMACIÓN =====

export const CONFIRMATION_MESSAGES = {
  // Eliminación
  DELETE_CONFIRM: (item?: string) => 
    item 
      ? `¿Está seguro de que desea eliminar "${item}"? Esta acción no se puede deshacer.`
      : '¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer.',
  
  DELETE_PROJECT: (projectNumber?: string) => 
    `¿Está seguro de que desea eliminar el proyecto ${projectNumber || 'seleccionado'}? Esta acción no se puede deshacer.`,
  
  DELETE_CLIENT: (clientName?: string) => 
    `¿Está seguro de que desea eliminar el cliente ${clientName || 'seleccionado'}? Esta acción no se puede deshacer.`,
  
  DELETE_PAYMENT: (amount?: number) => 
    `¿Está seguro de que desea eliminar el pago${amount ? ` de $${amount.toLocaleString()}` : ' seleccionado'}? Esta acción no se puede deshacer.`,
  
  // Cambios
  SAVE_CHANGES: '¿Desea guardar los cambios realizados?',
  DISCARD_CHANGES: 'Hay cambios sin guardar. ¿Está seguro de que desea descartarlos?',
  OVERWRITE_DATA: 'Los datos existentes serán sobrescritos. ¿Desea continuar?',
  
  // Acciones específicas
  MARK_COMPLETE: '¿Desea marcar este elemento como completado?',
  CANCEL_OPERATION: '¿Está seguro de que desea cancelar esta operación?',
  RESET_FORM: '¿Desea restablecer el formulario? Se perderán los cambios no guardados.',
} as const;

// ===== PLACEHOLDERS =====

export const PLACEHOLDERS = {
  // Búsqueda
  SEARCH: 'Buscar...',
  SEARCH_PROJECTS: 'Buscar proyectos...',
  SEARCH_CLIENTS: 'Buscar clientes...',
  SEARCH_PAYMENTS: 'Buscar pagos...',
  
  // Formularios
  ENTER_NAME: 'Ingrese el nombre',
  ENTER_EMAIL: 'Ingrese el email',
  ENTER_PHONE: 'Ingrese el teléfono',
  ENTER_ADDRESS: 'Ingrese la dirección',
  ENTER_DESCRIPTION: 'Ingrese una descripción',
  ENTER_AMOUNT: 'Ingrese el monto',
  ENTER_DATE: 'Seleccione una fecha',
  
  // Selecciones
  SELECT_OPTION: 'Seleccione una opción',
  SELECT_CLIENT: 'Seleccione un cliente',
  SELECT_PROJECT: 'Seleccione un proyecto',
  SELECT_STATUS: 'Seleccione un estado',
  SELECT_TYPE: 'Seleccione un tipo',
  
  // Texto
  NO_DESCRIPTION: 'Sin descripción',
  NO_COMMENTS: 'Sin comentarios',
  NO_NOTES: 'Sin notas adicionales',
} as const;

// ===== LABELS =====

export const LABELS = {
  // Información personal
  NAME: 'Nombre',
  EMAIL: 'Email',
  PHONE: 'Teléfono',
  ADDRESS: 'Dirección',
  
  // Fechas
  DATE: 'Fecha',
  START_DATE: 'Fecha de inicio',
  END_DATE: 'Fecha de fin',
  CREATED_AT: 'Fecha de creación',
  UPDATED_AT: 'Fecha de actualización',
  
  // Estados y tipos
  STATUS: 'Estado',
  TYPE: 'Tipo',
  CATEGORY: 'Categoría',
  PRIORITY: 'Prioridad',
  
  // Proyecto específico
  PROJECT_NUMBER: 'Número de proyecto',
  CLIENT: 'Cliente',
  DESCRIPTION: 'Descripción',
  TOTAL: 'Total',
  SUBTOTAL: 'Subtotal',
  TAX: 'IVA',
  BALANCE: 'Saldo',
  
  // Pago específico
  AMOUNT: 'Monto',
  PAYMENT_DATE: 'Fecha de pago',
  PAYMENT_METHOD: 'Método de pago',
  REFERENCE: 'Referencia',
  
  // Otros
  COMMENTS: 'Comentarios',
  NOTES: 'Notas',
  OBSERVATIONS: 'Observaciones',
  TASKS: 'Tareas',
} as const;

// ===== ESTADOS COMUNES =====

export const COMMON_STATES = {
  LOADING: 'Cargando',
  LOADED: 'Cargado',
  ERROR: 'Error',
  EMPTY: 'Vacío',
  NO_DATA: 'Sin datos',
  NO_RESULTS: 'Sin resultados',
  NOT_FOUND: 'No encontrado',
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Prohibido',
} as const;

// ===== MENSAJES DE VALIDACIÓN ESPECÍFICOS =====

export const VALIDATION_MESSAGES = {
  // Campos requeridos
  NAME_REQUIRED: 'El nombre es requerido',
  EMAIL_REQUIRED: 'El email es requerido',
  PHONE_REQUIRED: 'El teléfono es requerido',
  ADDRESS_REQUIRED: 'La dirección es requerida',
  DATE_REQUIRED: 'La fecha es requerida',
  AMOUNT_REQUIRED: 'El monto es requerido',
  CLIENT_REQUIRED: 'Debe seleccionar un cliente',
  PROJECT_REQUIRED: 'Debe seleccionar un proyecto',
  STATUS_REQUIRED: 'Debe seleccionar un estado',
  
  // Formatos específicos
  EMAIL_INVALID: 'Email inválido',
  PHONE_INVALID: 'Número de teléfono inválido. Use formato +56912345678 o 912345678',
  AMOUNT_INVALID: 'El monto debe ser un número válido',
  DATE_INVALID: 'Fecha inválida',
  
  // Longitudes
  NAME_MIN_LENGTH: 'El nombre debe tener al menos 3 caracteres',
  DESCRIPTION_MIN_LENGTH: 'La descripción debe tener al menos 10 caracteres',
  PHONE_MIN_LENGTH: 'El teléfono debe tener al menos 9 dígitos',
  
  // Valores numéricos
  AMOUNT_POSITIVE: 'El monto debe ser positivo',
  QUANTITY_POSITIVE: 'La cantidad debe ser positiva',
  PERCENTAGE_RANGE: 'El porcentaje debe estar entre 0 y 100',
  
  // Específicas del dominio
  PROJECT_NUMBER_REQUIRED: 'El número de proyecto es requerido',
  TAX_RATE_INVALID: 'La tasa de IVA debe ser un número entre 0 y 100',
  PLACE_ID_REQUIRED: 'Debe seleccionar una dirección válida de la lista',
} as const;