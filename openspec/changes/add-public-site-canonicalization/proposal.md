## Why
El sitio publico responde con el mismo contenido en los dominios `.com` y
`.com.ar`. Google detecta estas variantes como duplicadas y no recibe una señal
canonica explicita para consolidar la indexacion.

## What Changes
- Elegir `https://mauriciocruzdrones.com.ar/` como origen canonico.
- Redirigir permanentemente HTTP, `www` y el dominio `.com` al origen canonico.
- Declarar la URL canonica en el HTML y publicar un `robots.txt` con el sitemap.
- Verificar todas las variantes de dominio despues del despliegue.

## Impact
- Affected specs: public-site-seo
- Affected code:
  - `mcdron-web-php/.htaccess`
  - `mcdron-web-php/index.html`
  - `mcdron-web-php/robots.txt`
- External systems: Google Search Console y rastreadores web.