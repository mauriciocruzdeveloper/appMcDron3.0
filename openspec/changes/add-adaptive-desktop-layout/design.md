## Context

El contenedor raíz ya puede crecer hasta 1320 px, pero las vistas internas siguen apilando bloques pensados para celular. Bootstrap 5 ya está disponible y varios componentes usan sus breakpoints.

## Goals / Non-Goals

- Goals: aprovechar monitores 16:9, 16:10 y tamaños habituales de 20 a 24 pulgadas; conservar una buena experiencia móvil; evitar duplicar lógica o markup por plataforma.
- Non-Goals: unificar componentes, rediseñar formularios de detalle, cambiar reglas de negocio o introducir una nueva librería visual.

## Decisions

- Usar CSS Grid y breakpoints compatibles con Bootstrap: una columna por debajo de 992 px y composición desktop desde 992 px.
- En el inicio administrativo, ubicar accesos rápidos en una franja superior; reparaciones prioritarias y en espera en el área principal; agotados y pedidos en un lateral.
- En desktop, mostrar accesos de navegación frecuentes en la barra superior y reservar el dropdown para opciones secundarias y cuenta.
- Aplicar grillas a colecciones de tarjetas mediante clases de layout, sin cambiar los componentes que calculan o renderizan cada entidad.
- Mantener DOM único y reordenar solo con contenedores/clases responsive para evitar divergencias entre mobile y desktop.

## Risks / Trade-offs

- Las listas con contenido muy largo pueden producir columnas de distinta altura; se acepta scroll vertical de página y cada sección conserva su expansión actual.
- Algunos textos de navegación pueden no caber entre 992 y 1200 px; se mostrarán menos accesos directos en ese rango y el resto seguirá disponible en el dropdown.

## Validation

- Verificar visualmente a 390x844, 1024x768, 1280x800 y 1920x1080.
- Confirmar que no exista overflow horizontal y que rutas, dropdowns, filtros y tarjetas sigan siendo accionables.
- Ejecutar build de producción.
