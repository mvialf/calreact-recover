"use client"

import { useState, useCallback } from "react"
import { MultiSelect, type MultiSelectItem } from "@/components/ui/multi-select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"

// Datos de ejemplo
const tecnologias: MultiSelectItem[] = [
  { value: "react", label: "React" },
  { value: "nextjs", label: "Next.js" },
  { value: "typescript", label: "TypeScript" },
  { value: "tailwind", label: "Tailwind CSS" },
  { value: "nodejs", label: "Node.js" },
  { value: "python", label: "Python" },
  { value: "docker", label: "Docker" },
  { value: "kubernetes", label: "Kubernetes" },
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mongodb", label: "MongoDB" },
  { value: "redis", label: "Redis" },
  { value: "graphql", label: "GraphQL" },
]

const empleados: MultiSelectItem[] = [
  { value: "1", label: "Ana García", role: "Developer", avatar: "AG" },
  { value: "2", label: "Carlos López", role: "Designer", avatar: "CL" },
  { value: "3", label: "María Rodríguez", role: "Manager", avatar: "MR" },
  { value: "4", label: "Juan Martínez", role: "Developer", avatar: "JM" },
  { value: "5", label: "Laura Sánchez", role: "QA", avatar: "LS" },
  { value: "6", label: "Pedro Gómez", role: "DevOps", avatar: "PG" },
  { value: "7", label: "Sofía Ruiz", role: "Product Owner", avatar: "SR" },
  { value: "8", label: "Diego Hernández", role: "Developer", avatar: "DH" },
]

const categorias: MultiSelectItem[] = [
  { value: "frontend", label: "Frontend", icon: "🎨" },
  { value: "backend", label: "Backend", icon: "⚙️" },
  { value: "mobile", label: "Mobile", icon: "📱" },
  { value: "devops", label: "DevOps", icon: "🚀" },
  { value: "database", label: "Database", icon: "🗄️" },
  { value: "security", label: "Security", icon: "🔒" },
  { value: "ai", label: "AI/ML", icon: "🤖" },
  { value: "cloud", label: "Cloud", icon: "☁️" },
]

const ciudades: MultiSelectItem[] = [
  { value: "madrid", label: "Madrid", country: "España" },
  { value: "barcelona", label: "Barcelona", country: "España" },
  { value: "valencia", label: "Valencia", country: "España" },
  { value: "sevilla", label: "Sevilla", country: "España" },
  { value: "bilbao", label: "Bilbao", country: "España" },
  { value: "malaga", label: "Málaga", country: "España" },
  { value: "zaragoza", label: "Zaragoza", country: "España" },
  { value: "murcia", label: "Murcia", country: "España" },
]

const prioridades: MultiSelectItem[] = [
  { value: "critical", label: "Crítica", color: "red" },
  { value: "high", label: "Alta", color: "orange" },
  { value: "medium", label: "Media", color: "yellow" },
  { value: "low", label: "Baja", color: "green" },
]

export default function MultiSelectDemo() {
  // Estados para cada ejemplo
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([])
  const [searchableItems, setSearchableItems] = useState<string[]>([])

  // Estado para búsqueda dinámica
  const [dynamicItems, setDynamicItems] = useState<MultiSelectItem[]>([])
  const [isLoadingDynamic, setIsLoadingDynamic] = useState(false)

  // Simulación de búsqueda dinámica
  const handleDynamicSearch = useCallback(async (query: string) => {
    if (!query) {
      setDynamicItems([])
      return
    }

    setIsLoadingDynamic(true)
    // Simular llamada a API
    setTimeout(() => {
      const filtered = tecnologias.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
      setDynamicItems(filtered)
      setIsLoadingDynamic(false)
    }, 500)
  }, [])

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Multi Select Component Demo</h1>
        <p className="text-muted-foreground">
          Ejemplos interactivos del componente MultiSelect con diferentes configuraciones y casos de uso
        </p>
      </div>

      {/* Ejemplo Básico */}
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo Básico</CardTitle>
          <CardDescription>
            Selección múltiple simple con búsqueda local
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultiSelect
            items={tecnologias}
            selectedValues={selectedTech}
            onSelectionChange={setSelectedTech}
            placeholder="Seleccionar tecnologías..."
          />
          <div className="text-sm text-muted-foreground">
            Seleccionados: {selectedTech.length > 0 ? selectedTech.join(", ") : "Ninguno"}
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo con Límite */}
      <Card>
        <CardHeader>
          <CardTitle>Con Límite Máximo</CardTitle>
          <CardDescription>
            Máximo 3 elementos seleccionables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MultiSelect
            items={categorias}
            selectedValues={selectedCategories}
            onSelectionChange={setSelectedCategories}
            placeholder="Seleccionar hasta 3 categorías..."
            maxItems={3}
            renderItem={(item) => (
              <span className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </span>
            )}
            renderSelectedBadge={(item) => (
              <span className="flex items-center gap-1">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </span>
            )}
          />
          {selectedCategories.length >= 3 && (
            <p className="text-sm text-amber-600">
              Has alcanzado el límite máximo de selección
            </p>
          )}
        </CardContent>
      </Card>

      {/* Ejemplo con Renderizado Personalizado */}
      <Card>
        <CardHeader>
          <CardTitle>Renderizado Personalizado</CardTitle>
          <CardDescription>
            Items y badges con diseño personalizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelect
            items={empleados}
            selectedValues={selectedEmployees}
            onSelectionChange={setSelectedEmployees}
            placeholder="Seleccionar miembros del equipo..."
            renderItem={(item) => (
              <div className="flex items-center gap-2 w-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                  {item.avatar}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.role}</span>
                </div>
              </div>
            )}
            renderSelectedBadge={(item) => (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {item.label}
              </span>
            )}
          />
        </CardContent>
      </Card>

      {/* Ejemplo con Búsqueda Dinámica */}
      <Card>
        <CardHeader>
          <CardTitle>Búsqueda Dinámica (API)</CardTitle>
          <CardDescription>
            Búsqueda con debounce que simula llamadas a API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiSelect
            items={tecnologias} // Usar items estáticos temporalmente
            selectedValues={searchableItems}
            onSelectionChange={setSearchableItems}
            placeholder="Buscar tecnologías..."
            searchPlaceholder="Escribe para buscar..."
            emptyText="No se encontraron tecnologías"
            debounceMs={300}
          />
        </CardContent>
      </Card>

      {/* Ejemplo con Estados */}
      <Card>
        <CardHeader>
          <CardTitle>Estados del Componente</CardTitle>
          <CardDescription>
            Diferentes estados: deshabilitado, sin limpiar, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Deshabilitado</label>
            <MultiSelect
              items={prioridades}
              selectedValues={["critical", "high"]}
              onSelectionChange={() => {}}
              disabled={true}
              placeholder="Componente deshabilitado..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sin botón de limpiar</label>
            <MultiSelect
              items={prioridades}
              selectedValues={selectedPriorities}
              onSelectionChange={setSelectedPriorities}
              clearable={false}
              placeholder="Seleccionar prioridades..."
              renderSelectedBadge={(item) => {
                const colors = {
                  red: "bg-red-100 text-red-800",
                  orange: "bg-orange-100 text-orange-800",
                  yellow: "bg-yellow-100 text-yellow-800",
                  green: "bg-green-100 text-green-800",
                }
                return (
                  <span className={cn("px-2 py-1 rounded text-xs font-medium", colors[item.color as keyof typeof colors])}>
                    {item.label}
                  </span>
                )
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sin mostrar seleccionados en dropdown</label>
            <MultiSelect
              items={ciudades}
              selectedValues={selectedCities}
              onSelectionChange={setSelectedCities}
              showSelectedInDropdown={false}
              placeholder="Seleccionar ciudades..."
              renderItem={(item) => (
                <div className="flex items-center justify-between w-full">
                  <span>{item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.country}</span>
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ejemplo Complejo con Todas las Características */}
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo Completo</CardTitle>
          <CardDescription>
            Todas las características combinadas en un caso de uso real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <MultiSelect
              items={[
                ...tecnologias.map(t => ({ ...t, type: "tech" })),
                ...categorias.map(c => ({ ...c, type: "category" })),
              ]}
              selectedValues={[]}
              onSelectionChange={(values) => {/* Seleccionados: ${values} */}}
              placeholder="Buscar tecnologías o categorías..."
              searchPlaceholder="Escribe para filtrar..."
              emptyText="No se encontraron resultados"
              maxItems={5}
              debounceMs={200}
              renderItem={(item) => (
                <div className="flex items-center gap-2 w-full">
                  {item.type === "category" && <span>{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.type === "tech" ? "Tecnología" : "Categoría"}
                  </Badge>
                </div>
              )}
              renderSelectedBadge={(item) => (
                <span className="flex items-center gap-1">
                  {item.type === "category" && <span className="text-xs">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}
            />
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Este ejemplo combina:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Múltiples tipos de items (tecnologías y categorías)</li>
                <li>• Renderizado personalizado con badges e iconos</li>
                <li>• Límite de 5 selecciones máximo</li>
                <li>• Búsqueda con debounce de 200ms</li>
                <li>• Badges personalizados para items seleccionados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Utility function para clases condicionales
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}