# 📋 Migración Google Places API v2 - 2025

## 🚨 CONTEXTO CRÍTICO

### **Cambio Disruptivo - Marzo 1, 2025**
Google ha implementado una **discontinuación parcial** de APIs de Places para **nuevos clientes** desde el 1 de marzo de 2025:

```
⚠️ As of March 1st, 2025, google.maps.places.AutocompleteService 
   is not available to new customers. 
   Please use google.maps.places.AutocompleteSuggestion instead.

⚠️ As of March 1st, 2025, google.maps.places.PlacesService 
   is not available to new customers. 
   Please use google.maps.places.Place instead.
```

### **Estado del Proyecto**
- **Archivos afectados**: `src/components/ui/addressInput.tsx` (líneas 169-170)
- **APIs en uso**: `AutocompleteService` y `PlacesService` (deprecated para nuevos clientes)
- **Error detectado**: Consola del navegador muestra warnings de deprecación

---

## 🔄 TRANSICIÓN DE APIs

### **AutocompleteService → AutocompleteSuggestion**

**ANTES (API deprecated):**
```javascript
const service = new google.maps.places.AutocompleteService();
service.getPlacePredictions(request, callback);
```

**DESPUÉS (Nueva API):**
```javascript
const { AutocompleteSuggestion } = await google.maps.importLibrary("places");
const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
```

### **PlacesService → Place**

**ANTES (API deprecated):**
```javascript
const service = new google.maps.places.PlacesService(element);
service.getDetails(request, callback);
```

**DESPUÉS (Nueva API):**
```javascript
const { Place } = await google.maps.importLibrary("places");
const place = new Place({ id: placeId });
await place.fetchFields({ fields: ['displayName', 'location'] });
```

---

## 📊 DIFERENCIAS ARQUITECTURALES

### **Cambio de Patrón: Callbacks → Promises**

| Aspecto | API Antigua | Nueva API |
|---------|-------------|-----------|
| **Patrón** | Callbacks | Promises/Async-Await |
| **Inicialización** | Constructor directo | Dynamic imports |
| **Manejo errores** | Callback con status | Try-catch blocks |
| **Sesiones** | Implícito | Explicit session tokens |
| **Performance** | Menos optimizada | Optimizada y cacheada |

### **Nuevos Conceptos**

#### **1. Session Tokens**
```javascript
const sessionToken = new google.maps.places.AutocompleteSessionToken();
const request = {
  input: "pizza near",
  sessionToken: sessionToken
};
```

#### **2. Dynamic Library Loading**
```javascript
// ✅ Nuevo patrón requerido
const { AutocompleteSuggestion } = await google.maps.importLibrary("places");

// ❌ Patrón antiguo (ya no funciona para nuevos clientes)
const service = new google.maps.places.AutocompleteService();
```

---

## ⚡ IMPACTO EN EL CODEBASE

### **Archivos a Modificar**
1. **`src/components/ui/addressInput.tsx`** - Componente principal
2. **`src/components/ui/__tests__/addressInput.test.tsx`** - Tests unitarios
3. **Posibles hooks personalizados** - Si existen wrappers

### **Breaking Changes Identificados**

#### **1. Inicialización Asíncrona**
- La nueva API requiere `await google.maps.importLibrary("places")`
- No se puede inicializar de forma síncrona en `useEffect`

#### **2. Cambio de Interface**
```typescript
// ANTES
interface AutocompleteService {
  getPlacePredictions(
    request: google.maps.places.AutocompletionRequest,
    callback: (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => void
  ): void;
}

// DESPUÉS  
interface AutocompleteSuggestion {
  static fetchAutocompleteSuggestions(
    request: AutocompleteSuggestionRequest
  ): Promise<AutocompleteSuggestionResponse>;
}
```

#### **3. Manejo de Errores**
```typescript
// ANTES - Status codes en callback
service.getPlacePredictions(request, (results, status) => {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    // Éxito
  }
});

// DESPUÉS - Try-catch con promises
try {
  const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
  // Éxito implícito si no hay exception
} catch (error) {
  // Manejo de error
}
```

---

## 🎯 ESTRATEGIA RECOMENDADA

### **Migración Gradual con Feature Detection**
1. **Detectar disponibilidad** de nueva API
2. **Fallback temporal** a API antigua si está disponible
3. **Migración completa** a nueva API como objetivo final
4. **Monitoreo** de errores durante transición

### **Prioridad de Implementación**
1. 🔥 **CRÍTICO**: Actualizar `addressInput.tsx`
2. 🔴 **ALTO**: Tests unitarios
3. 🟡 **MEDIO**: Optimizaciones de performance
4. 🟢 **BAJO**: Limpieza de código legacy

---

## 📚 RECURSOS OFICIALES

### **Documentación Google**
- [Places Migration Guide](https://developers.google.com/maps/documentation/javascript/places-migration-overview)
- [AutocompleteSuggestion API](https://developers.google.com/maps/documentation/javascript/reference/places-suggestion-service)
- [Place Class API](https://developers.google.com/maps/documentation/javascript/reference/place)

### **Consideraciones de Compatibilidad**
- **Clientes existentes**: Pueden seguir usando APIs antiguas por al menos 12 meses
- **Nuevos clientes**: Deben usar exclusivamente nuevas APIs
- **Soporte**: APIs antiguas solo recibirán fixes críticos, no nuevas features

---

## 🚀 PRÓXIMOS PASOS

Ver documentos de implementación:
- **`07-NUEVA-ARQUITECTURA.md`** - Patrones de implementación
- **`08-CODIGO-MIGRACION.md`** - Código antes/después
- **`09-ROLLBACK-STRATEGY.md`** - Plan de contingencia

---

*Documento creado: Septiembre 2025 - Estado: Planificación inicial*