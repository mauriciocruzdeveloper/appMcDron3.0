## ADDED Requirements

### Requirement: Origen canonico unico
El sitio SHALL declarar `https://mauriciocruzdrones.com.ar/` como origen canonico
y SHALL evitar servir el mismo contenido indexable desde dominios alternativos.

#### Scenario: URL canonica
- **WHEN** un rastreador solicita `https://mauriciocruzdrones.com.ar/`
- **THEN** el servidor responde HTTP 200
- **AND** el documento declara esa misma URL mediante `rel="canonical"`

#### Scenario: Variante alternativa
- **WHEN** un cliente solicita el sitio por HTTP, con `www` o mediante el dominio `.com`
- **THEN** el servidor responde HTTP 301 hacia la misma ruta en `https://mauriciocruzdrones.com.ar`
- **AND** conserva los parametros de consulta

### Requirement: Descubrimiento para rastreadores
El sitio SHALL publicar instrucciones de rastreo coherentes con el origen canonico.

#### Scenario: Archivos SEO
- **WHEN** un rastreador solicita `/robots.txt` o `/sitemap.xml`
- **THEN** ambos recursos responden HTTP 200
- **AND** referencian solamente URLs del dominio canonico