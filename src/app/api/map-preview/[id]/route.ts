import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Await params en Next.js 15
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const address = searchParams.get('address');
  const name = searchParams.get('name') || '';
  const additionalInfo = searchParams.get('additionalInfo') || '';
  
  if (!lat || !lng || !address) {
    return new NextResponse('Faltan parámetros requeridos', { status: 400 });
  }
  
  const redirectUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const userAgent = request.headers.get('user-agent') || '';
  const isSocialMediaBot = /facebook|twitter|whatsapp|telegram|discord|slack|skype/i.test(userAgent);
  
  // Construir título con nombre e información adicional si existe
  let title = address;
  if (name) title = `${name} - ${address}`;
  if (additionalInfo) title += ` (${additionalInfo})`;
  
  if (isSocialMediaBot) {
    const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=16&size=1200x630&markers=color:red%7C${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    
    // Verificar si es una solicitud de depuración
    const isDebug = request.url.includes('debug=1');
    
    const html = `
      <!DOCTYPE html>
      <html prefix="og: https://ogp.me/ns#">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <meta name="description" content="${additionalInfo || 'Ubicación compartida'}">
          
          <!-- Open Graph / Facebook -->
          <meta property="og:type" content="website">
          <meta property="og:url" content="${request.url}">
          <meta property="og:title" content="${title.replace(/"/g, '&quot;')}">
          <meta property="og:description" content="${(additionalInfo || 'Ver ubicación en Google Maps').replace(/"/g, '&quot;')}">
          <meta property="og:image" content="${imageUrl}">
          <meta property="og:image:width" content="1200">
          <meta property="og:image:height" content="630">
          
          <!-- Twitter -->
          <meta property="twitter:card" content="summary_large_image">
          <meta property="twitter:url" content="${request.url}">
          <meta property="twitter:title" content="${title.replace(/"/g, '&quot;')}">
          <meta property="twitter:description" content="${(additionalInfo || 'Ver ubicación en Google Maps').replace(/"/g, '&quot;')}">
          <meta property="twitter:image" content="${imageUrl}">
          
          <!-- Redirección -->
          <meta http-equiv="refresh" content="0;url=${redirectUrl}">
          
          ${isDebug ? `
            <!-- Debug Info -->
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
              .debug-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
              pre { background: #333; color: #fff; padding: 10px; border-radius: 3px; overflow-x: auto; }
            </style>
          ` : ''}
        </head>
        <body>
          ${isDebug ? `
            <div class="debug-info">
              <h2>Información de depuración</h2>
              <p><strong>URL:</strong> ${request.url}</p>
              <p><strong>Título:</strong> ${title}</p>
              <p><strong>Dirección:</strong> ${address}</p>
              ${additionalInfo ? `<p><strong>Info adicional:</strong> ${additionalInfo}</p>` : ''}
              <p><strong>Coordenadas:</strong> ${lat}, ${lng}</p>
              <p><strong>Imagen:</strong> <a href="${imageUrl}" target="_blank">Ver imagen</a></p>
              <h3>Metadatos Open Graph:</h3>
              <pre>${JSON.stringify({
                'og:title': title,
                'og:description': additionalInfo || 'Ver ubicación en Google Maps',
                'og:image': imageUrl,
                'og:url': request.url,
                'og:type': 'website'
              }, null, 2)}</pre>
            </div>
          ` : ''}
          
          <p>Redirigiendo a Google Maps...</p>
          <p>Si no eres redirigido automáticamente, <a href="${redirectUrl}">haz clic aquí</a>.</p>
          
          ${isDebug ? `
            <p><small>Modo depuración activo. Agrega <code>?debug=0</code> a la URL para ocultar esta información.</small></p>
          ` : ''}
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
  
  return NextResponse.redirect(redirectUrl);
}
