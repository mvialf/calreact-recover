#!/bin/bash

# Script de configuración para usar Chromium del sistema con Playwright
# Evita descargar navegadores adicionales

echo "🔧 Configurando Playwright para usar Chromium del sistema..."

# Variables de entorno para usar Chromium del sistema
export PLAYWRIGHT_BROWSERS_PATH=0
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Verificar que Chromium está instalado
if command -v chromium-browser &> /dev/null; then
    echo "✅ Chromium encontrado: $(chromium-browser --version)"
    echo "📍 Ubicación: $(which chromium-browser)"
else
    echo "❌ Error: Chromium no está instalado"
    echo "Instalar con: sudo apt install chromium-browser"
    exit 1
fi

# Verificar permisos de ejecución
if [ -x "/usr/bin/chromium-browser" ]; then
    echo "✅ Chromium tiene permisos de ejecución"
else
    echo "⚠️  Advertencia: Verificar permisos de Chromium"
fi

echo "🚀 Configuración completada. Usar scripts npm run test:e2e:system"