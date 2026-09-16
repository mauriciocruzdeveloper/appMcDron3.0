## Why
La página de una reparación acumula muchas secciones extensas y obliga a recorrer contenido que no siempre es relevante para la tarea actual. Además, las anotaciones confidenciales están debajo del enlace a Drive aunque necesitan mayor visibilidad operativa.

## What Changes
- Hacer colapsables todas las secciones de contenido de la reparación excepto cabecera, progreso, anotaciones confidenciales y acciones.
- Mostrar inicialmente abierta solo la sección asociada al estado actual y colapsar las demás.
- Pintar la cabecera de la sección activa con el color del estado actual.
- Mover las anotaciones confidenciales al tercer lugar, inmediatamente después del progreso y antes del enlace a Drive.
- Incorporar controles accesibles con estado expandido/colapsado e indicador visual.

## Impact
- Affected specs: `reparacion-ui`
- Affected code: contenedor y secciones de `src/components/Reparacion/`
- Sin cambios de esquema, persistencia ni reglas de negocio