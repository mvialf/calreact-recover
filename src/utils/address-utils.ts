/**
 * Utilidades para el manejo y validación de direcciones
 */

// Declaración de tipos para Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

export interface AddressSuggestion {
  id: string;
  description: string;
  mainText: string;
  secondaryText: string;
  placeId: string;
  structuredFormatting: {
    mainText: string;
    secondaryText: string;
  };
  terms: Array<{ offset: number; value: string }>;
  types: string[];
  reference?: string;
}

export interface AddressComponents {
  streetNumber?: string;
  route?: string;
  locality?: string;
  administrativeArea?: string;
  country?: string;
  postalCode?: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

/**
 * Extrae los componentes de una dirección a partir de los detalles de Google Places
 */
// Interfaz para los componentes de dirección de Google Maps
interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export function extractAddressComponents(place: any): AddressComponents {
  const components: AddressComponents = {};
  const addressComponents: GoogleAddressComponent[] = place.address_components || [];
  
  if (place.formatted_address) {
    components.formattedAddress = place.formatted_address;
  }
  
  if (place.place_id) {
    components.placeId = place.place_id;
  }
  
  if (place.geometry?.location) {
    const location = place.geometry.location as google.maps.LatLng;
    components.latitude = location.lat();
    components.longitude = location.lng();
  }

  addressComponents.forEach((component: GoogleAddressComponent) => {
    const componentType = component.types[0];
    
    switch (componentType) {
      case 'street_number':
        components.streetNumber = component.long_name;
        break;
      case 'route':
        components.route = component.long_name;
        break;
      case 'locality':
        components.locality = component.long_name;
        break;
      case 'administrative_area_level_1':
        components.administrativeArea = component.long_name;
        break;
      case 'country':
        components.country = component.long_name;
        break;
      case 'postal_code':
        components.postalCode = component.long_name;
        break;
      default:
        break;
    }
  });

  return components;
}

/**
 * Formatea una dirección en un formato legible
 */
export function formatAddress(components: AddressComponents): string {
  const parts: string[] = [];
  
  if (components.streetNumber && components.route) {
    parts.push(`${components.route} ${components.streetNumber}`);
  } else if (components.route) {
    parts.push(components.route);
  } else if (components.formattedAddress) {
    return components.formattedAddress;
  }
  
  if (components.locality) {
    parts.push(components.locality);
  }
  
  if (components.administrativeArea) {
    parts.push(components.administrativeArea);
  }
  
  if (components.country) {
    parts.push(components.country);
  }
  
  if (components.postalCode) {
    parts.push(components.postalCode);
  }
  
  return parts.join(', ');
}

/**
 * Valida si una dirección tiene los componentes mínimos requeridos
 */
export function isValidAddress(components: AddressComponents): boolean {
  return !!(components.route && components.locality && components.country);
}

/**
 * Crea un objeto de sugerencia de dirección a partir de una predicción de Google Places
 */
// Interfaz para la predicción de autocompletado de Google Places
interface GoogleAutocompletePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  terms: Array<{ offset: number; value: string }>;
  types: string[];
}

export function createAddressSuggestion(
  prediction: GoogleAutocompletePrediction
): AddressSuggestion {
  const terms = prediction.terms || [];
  const mainText = terms[0]?.value || '';
  const secondaryText = terms.slice(1).map(term => term.value).join(', ');
  
  return {
    id: prediction.place_id,
    description: prediction.description,
    mainText,
    secondaryText,
    placeId: prediction.place_id,
    structuredFormatting: {
      mainText,
      secondaryText
    },
    terms: [...terms],
    types: [...(prediction.types || [])]
  };
}
