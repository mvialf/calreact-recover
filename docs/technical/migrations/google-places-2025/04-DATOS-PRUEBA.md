# 📊 Datos de Prueba y Fixtures

## 🎯 Objetivo

Definir todos los datos de prueba necesarios para validar el comportamiento del campo address antes y después de la migración.

## 📁 Estructura de Fixtures

```
e2e/
└── fixtures/
    ├── test-projects.json        # Proyectos de prueba
    ├── test-addresses.json       # Direcciones para autocomplete
    ├── expected-responses.json   # Respuestas esperadas
    └── test-data.ts             # Archivo principal de datos
```

## 🏢 Proyecto Principal de Prueba

### **Proyecto 17870** (Confirmado Funcional)

```json
{
  "project17870": {
    "id": "17870",
    "projectNumber": "17870",
    "clientName": "Sra. Loreto Castañeda",
    "clientDescription": "- Capitán Carrera",
    "fullClientName": "Sra. Loreto Castañeda - Capitán Carrera",
    "status": "montaje",
    "phone": "992323795",
    "windowsCount": 5,
    "squareMeters": 7.4,
    "address": {
      "textoCompleto": "Capitán Ignacio Carrera Pinto 111",
      "detalle": "depto A",
      "location": "Ñuñoa, Región Metropolitana",
      "components": {
        "calle": "Capitán Ignacio Carrera Pinto",
        "numero": "111",
        "comuna": "Ñuñoa",
        "region": "Región Metropolitana",
        "pais": "Chile"
      },
      "coordinates": {
        "latitude": -33.4736,
        "longitude": -70.5875
      }
    },
    "validation": {
      "isValid": true,
      "message": "Proyecto válido para eventos"
    }
  }
}
```

## 🏠 Direcciones para Testing de Autocomplete

### **Archivo:** `e2e/fixtures/test-addresses.json`

```json
{
  "autocompleteTests": {
    "providencia123": {
      "query": "Providencia 123",
      "expectedSuggestions": [
        "Avenida Providencia 123, Providencia, Chile",
        "Providencia 123, Vallenar, Chile", 
        "Providencia 123, Salamanca, Chile",
        "Providencia 123, Maipú, Maipu, Chile",
        "Providencia 123, Quilpué, Chile"
      ],
      "expectedCount": 5,
      "minimumExpected": 3,
      "firstSelection": {
        "text": "Avenida Providencia 123, Providencia, Chile",
        "expectedComponents": {
          "comuna": "Providencia",
          "region": "Región Metropolitana",
          "pais": "Chile"
        }
      }
    },
    "manuelMontt": {
      "query": "Manuel Montt 456",
      "expectedSuggestions": [
        "Manuel Montt 456, Providencia, Chile",
        "Manuel Montt 456, Santiago, Chile"
      ],
      "expectedCount": 2,
      "minimumExpected": 1
    },
    "libertador": {
      "query": "Av. Libertador Bernardo O'Higgins 1234",
      "expectedSuggestions": [
        "Avenida Libertador Bernardo O'Higgins 1234, Santiago, Chile"
      ],
      "expectedCount": 1,
      "minimumExpected": 1
    },
    "invalidQuery": {
      "query": "xyzabc123invalid",
      "expectedSuggestions": [],
      "expectedCount": 0,
      "shouldShowNoResults": true
    }
  }
}
```

## 🗂️ Archivo Principal de Test Data

### **Archivo:** `e2e/fixtures/test-data.ts`

```typescript
export const testProjects = {
  project17870: {
    id: '17870',
    projectNumber: '17870',
    clientName: 'Sra. Loreto Castañeda',
    clientDescription: '- Capitán Carrera',
    fullClientName: 'Sra. Loreto Castañeda - Capitán Carrera',
    status: 'montaje',
    phone: '992323795',
    windowsCount: 5,
    squareMeters: 7.4,
    address: {
      textoCompleto: 'Capitán Ignacio Carrera Pinto 111',
      detalle: 'depto A',
      location: 'Ñuñoa, Región Metropolitana',
      components: {
        calle: 'Capitán Ignacio Carrera Pinto',
        numero: '111',
        comuna: 'Ñuñoa',
        region: 'Región Metropolitana',
        pais: 'Chile'
      },
      coordinates: {
        latitude: -33.4736,
        longitude: -70.5875
      }
    },
    validation: {
      isValid: true,
      message: 'Proyecto válido para eventos'
    }
  }
};

export const testAddresses = {
  providencia123: {
    query: 'Providencia 123',
    expectedSuggestions: [
      'Avenida Providencia 123, Providencia, Chile',
      'Providencia 123, Vallenar, Chile',
      'Providencia 123, Salamanca, Chile',
      'Providencia 123, Maipú, Maipu, Chile',
      'Providencia 123, Quilpué, Chile'
    ],
    expectedCount: 5,
    minimumExpected: 3,
    firstSelection: {
      text: 'Avenida Providencia 123, Providencia, Chile',
      expectedComponents: {
        comuna: 'Providencia',
        region: 'Región Metropolitana',
        pais: 'Chile'
      }
    }
  },
  manuelMontt: {
    query: 'Manuel Montt 456',
    expectedSuggestions: [
      'Manuel Montt 456, Providencia, Chile',
      'Manuel Montt 456, Santiago, Chile'
    ],
    expectedCount: 2,
    minimumExpected: 1
  },
  invalidQuery: {
    query: 'xyzabc123invalid',
    expectedSuggestions: [],
    expectedCount: 0,
    shouldShowNoResults: true
  }
};

export const expectedResponses = {
  formattedAddressStructure: {
    requiredFields: [
      'textoCompleto',
      'coordenadas',
      'placeId',
      'componentes',
      'comune'
    ],
    coordinatesFields: [
      'latitude',
      'longitude'
    ],
    componentFields: [
      'calle',
      'numero',
      'comuna',
      'region',
      'pais'
    ]
  },
  
  deprecatedWarnings: [
    'google.maps.places.AutocompleteService is not available to new customers',
    'google.maps.places.PlacesService is not available to new customers'
  ],
  
  expectedErrors: [
    'ZERO_RESULTS'
  ]
};

// Tipos TypeScript para mejor autocompletado
export interface TestProject {
  id: string;
  projectNumber: string;
  clientName: string;
  clientDescription: string;
  fullClientName: string;
  status: string;
  phone: string;
  windowsCount: number;
  squareMeters: number;
  address: {
    textoCompleto: string;
    detalle: string;
    location: string;
    components: {
      calle: string;
      numero: string;
      comuna: string;
      region: string;
      pais: string;
    };
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  validation: {
    isValid: boolean;
    message: string;
  };
}

export interface TestAddress {
  query: string;
  expectedSuggestions: string[];
  expectedCount: number;
  minimumExpected: number;
  shouldShowNoResults?: boolean;
  firstSelection?: {
    text: string;
    expectedComponents: {
      comuna: string;
      region: string;
      pais: string;
    };
  };
}
```

## 🔍 Casos de Prueba Específicos

### **1. Auto-población de Dirección**

```typescript
// Datos esperados al seleccionar proyecto 17870
const expectedAutopopulation = {
  project: {
    id: '17870',
    displayed: 'Sra. Loreto Castañeda - Capitán Carrera',
    validation: 'Proyecto válido para eventos'
  },
  address: {
    main: 'Capitán Ignacio Carrera Pinto 111',
    detail: 'depto A', 
    location: 'Ñuñoa, Región Metropolitana'
  },
  fields: {
    phone: '992323795',
    windows: '5',
    squareMeters: '7.4',
    status: 'Montaje'
  },
  date: {
    day: '07',
    month: '09', 
    year: '2025'
  }
};
```

### **2. Validación de Estructura FormattedAddress**

```typescript
const expectedFormattedAddress = {
  textoCompleto: 'Capitán Ignacio Carrera Pinto 111',
  coordenadas: {
    latitude: expect.any(Number),
    longitude: expect.any(Number)
  },
  placeId: expect.stringMatching(/^ChIJ/), // Google Place IDs start with ChIJ
  componentes: {
    calle: expect.any(String),
    numero: expect.any(String),
    comuna: 'Ñuñoa',
    region: 'Región Metropolitana',
    pais: 'Chile'
  },
  detalle: 'depto A',
  comune: 'Ñuñoa' // Campo redundante para optimización
};
```

### **3. Performance Benchmarks**

```typescript
const performanceExpectations = {
  autocomplete: {
    maxResponseTime: 2000, // 2 segundos
    averageExpected: 800,  // 800ms promedio
    timeout: 5000          // Timeout máximo
  },
  placeDetails: {
    maxResponseTime: 3000, // 3 segundos
    averageExpected: 1200  // 1.2 segundos promedio
  }
};
```

## 🚨 Datos para Testing de Errores

### **Errores Esperados Pre-Migración**

```typescript
const expectedWarnings = {
  deprecated: [
    'As of March 1st, 2025, google.maps.places.AutocompleteService is not available to new customers',
    'As of March 1st, 2025, google.maps.places.PlacesService is not available to new customers'
  ],
  zeroResults: [
    '⚠️ [UI] Error en búsqueda de direcciones {status: ZERO_RESULTS}'
  ],
  preload: [
    'The resource https://maps.googleapis.com/maps/api/js?key=AIzaSy... was preloaded using link preload but not used within a few seconds'
  ]
};
```

### **Estado Esperado Post-Migración**

```typescript
const postMigrationExpectations = {
  warnings: {
    deprecated: 0, // No debería haber warnings deprecated
    zeroResults: 'permitidos', // Pueden seguir apareciendo para queries inválidas
    preload: 'permitidos' // Pueden seguir apareciendo (no crítico)
  },
  functionality: {
    autocomplete: 'preservado',
    autopopulation: 'preservado', 
    persistence: 'preservado',
    performance: 'igual_o_mejor'
  }
};
```

## 🎯 Variaciones de Prueba

### **Direcciones Adicionales para Testing**

```json
{
  "additionalTestCases": {
    "complexAddress": {
      "query": "Avenida Las Condes 12345, piso 15, oficina 1501",
      "expected": "Manejo correcto de direcciones complejas"
    },
    "shortQuery": {
      "query": "San",
      "expected": "Múltiples sugerencias con 'San'"
    },
    "numbersOnly": {
      "query": "123",
      "expected": "ZERO_RESULTS o error"
    },
    "specialChars": {
      "query": "Ñuñoa 123",
      "expected": "Manejo correcto de caracteres especiales"
    },
    "accentedChars": {
      "query": "José María Caro 456",
      "expected": "Manejo correcto de acentos"
    }
  }
}
```

## 📋 Instrucciones de Uso

### **1. Para Tests Automatizados**

```typescript
// Importar en tests
import { testProjects, testAddresses, expectedResponses } from '../fixtures/test-data';

// Usar en test
const project = testProjects.project17870;
await page.getByRole('textbox', { name: 'Buscar proyecto...' }).fill(project.id);
```

### **2. Para Validación Manual**

```bash
# Datos confirmados para pruebas manuales
Proyecto: 17870
Cliente: Sra. Loreto Castañeda - Capitán Carrera
Dirección: Capitán Ignacio Carrera Pinto 111, depto A, Ñuñoa
Teléfono: 992323795
```

### **3. Para Debugging**

```javascript
// Usar en consola del navegador para verificar datos
console.log('🧪 Verificación datos proyecto 17870:', {
  id: '17870',
  client: 'Sra. Loreto Castañeda - Capitán Carrera', 
  address: 'Capitán Ignacio Carrera Pinto 111',
  details: 'depto A',
  location: 'Ñuñoa, Región Metropolitana'
});
```

## 🎯 Resultado Esperado

Con estos datos de prueba:

- ✅ **Cobertura 100%** de casos críticos
- ✅ **Datos reales** confirmados como funcionales 
- ✅ **Casos edge** incluidos para robustez
- ✅ **Benchmarks de performance** definidos
- ✅ **Validación pre/post migración** completa

---

> **💡 Siguiente paso:** Proceder con `05-CHECKLIST-VALIDACION.md` para crear la lista definitiva de verificación.