# Documentación del Componente: AddressInput

## 1. Resumen

El componente `AddressInput` es un campo de entrada avanzado y reutilizable, diseñado para buscar, seleccionar y mostrar direcciones de forma interactiva utilizando la API de Google Maps Places.

No es un simple `input`, sino un componente con estado que gestiona la lógica de autocompletado, la obtención de detalles del lugar (incluidas coordenadas) y una interfaz de usuario enriquecida para mostrar la dirección seleccionada y realizar acciones comunes sobre ella.

## 2. Características Principales

- **Búsqueda y Autocompletado:** Sugiere direcciones en tiempo real mientras el usuario escribe, restringido a Chile (`cl`) para mayor precisión.
- **Visualización Dual:**
  - **Modo Búsqueda:** Un campo de texto estándar para iniciar la búsqueda.
  - **Modo Display:** Una vez seleccionada una dirección, se transforma en una tarjeta informativa que muestra los componentes de la dirección (calle, número, comuna, etc.) y un menú de acciones.
- **Información Adicional:** Permite al usuario añadir y guardar información contextual (ej. "Depto 405", "Block C").
- **Acciones Rápidas:** Menú contextual para:
  - **Ver en Mapa:** Abre una vista previa del mapa en una nueva pestaña.
  - **Copiar Dirección:** Copia el texto completo de la dirección al portapapeles.
  - **Compartir Ubicación:** Utiliza la Web Share API (con fallback a WhatsApp) para compartir un enlace a la ubicación.
- **Manejo de Estado Integrado:** Gestiona internamente los estados de carga, las sugerencias y la dirección seleccionada.

## 3. API del Componente (Props)

Estas son las props que puedes pasar al componente `AddressInput`.

| Prop                | Tipo                               | Por Defecto              | Descripción                                                                                             |
| ------------------- | ---------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------- |
| `value`             | `FormattedAddress \| null`         | `null`                   | El objeto de la dirección seleccionada. Úsalo para controlar el componente desde fuera.                 |
| `onSelect`          | `(addr) => void`                   | `undefined`              | Callback que se ejecuta cuando el usuario selecciona o limpia una dirección. Devuelve el objeto `FormattedAddress` o `null`. |
| `onPlaceSelected`   | `(addr) => void`                   | `undefined`              | Alias para `onSelect`.                                                                                  |
| `placeholder`       | `string`                           | `"Buscar dirección"`     | Texto que se muestra en el input cuando está vacío.                                                     |
| `className`         | `string`                           | `""`                     | Clases CSS para el contenedor principal del componente.                                                 |
| `inputClassName`    | `string`                           | `""`                     | Clases CSS específicas para el elemento `<Input />` en modo búsqueda.                                   |
| `disabled`          | `boolean`                          | `false`                  | Si `true`, deshabilita toda interacción con el componente.                                              |
| `externalLoading`   | `boolean`                          | `false`                  | Si `true`, muestra un indicador de carga. Útil si la dirección se está cargando desde una fuente externa. |

## 4. Estructura de Datos: `FormattedAddress`

El componente opera con un objeto `FormattedAddress` bien definido, que se encuentra en `src/types/project.ts`. Esta es la estructura que recibirás en el callback `onSelect`.

```typescript
export interface FormattedAddress {
  textoCompleto: string; // La dirección completa como string.
  coordenadas: {
    latitude: number;
    longitude: number;
  };
  placeId?: string | null; // ID de Google Places.
  componentes: {
    calle?: string;
    numero?: string;
    comuna?: string;
    ciudad?: string;
    region?: string;
    pais?: string;
    codigoPostal?: string;
  };
  detalle?: string; // Alias de textoCompleto.
  informacionAdicional?: string; // Campo para datos extra (ej. "Depto 405").
}
```

## 5. Guía de Reutilización en Otro Proyecto

Para utilizar este componente fuera del proyecto actual, sigue estos pasos:

#### Paso 1: Instalar Dependencias

Asegúrate de que tu proyecto tenga las siguientes dependencias:

```bash
npm install @react-google-maps/api lucide-react clsx tailwind-merge
```

#### Paso 2: Componentes de UI (Shadcn/ui)

El componente depende de una serie de componentes UI base de `shadcn/ui`. Debes tenerlos disponibles en tu proyecto:

- `Input`
- `Popover`, `PopoverContent`, `PopoverAnchor`
- `Command`, `CommandEmpty`, `CommandItem`, `CommandList`
- `Button`
- `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuTrigger`

#### Paso 3: Copiar Archivos de Utilidad

Necesitarás copiar los siguientes archivos de este proyecto al tuyo:

1.  **`src/utils/address-utils.ts`**: Contiene la función `extractAddressComponents`, que es **crítica** para parsear la respuesta de la API de Google.
2.  **`src/lib/utils.ts`**: Contiene la función `cn` para la fusión de clases de Tailwind.

#### Paso 4: Definir Tipos

Copia la definición de la interfaz `FormattedAddress` (mostrada arriba) a tu archivo de tipos (ej. `types/index.ts`).

#### Paso 5: Variable de Entorno

El componente requiere una API Key de Google Maps.

1.  Crea un archivo `.env.local` en la raíz de tu proyecto.
2.  Añade tu clave de la siguiente manera:

    ```
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
    ```

3.  **Importante:** En Google Cloud Console, asegúrate de restringir el uso de esta API Key a tu dominio para evitar el uso no autorizado.

#### Paso 6: Ejemplo de Implementación

Una vez completados los pasos anteriores, puedes usar el componente de la siguiente manera en tu aplicación:

```tsx
"use client";

import { useState } from "react";
import { AddressInput } from "@/components/ui/addressInput"; // Ajusta la ruta
import type { FormattedAddress } from "@/types"; // Ajusta la ruta

export const MyFormComponent = () => {
  const [address, setAddress] = useState<FormattedAddress | null>(null);

  const handleAddressSelect = (selectedAddress: FormattedAddress | null) => {
    console.log("Dirección seleccionada:", selectedAddress);
    setAddress(selectedAddress);
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Dirección de Envío</h2>
      <AddressInput
        value={address}
        onSelect={handleAddressSelect}
        placeholder="Ingresa y selecciona tu dirección"
      />

      {address && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <h3 className="font-medium">Dirección Guardada:</h3>
          <p>{address.textoCompleto}</p>
          <p>Coordenadas: {address.coordenadas.latitude}, {address.coordenadas.longitude}</p>
        </div>
      )}
    </div>
  );
};
```