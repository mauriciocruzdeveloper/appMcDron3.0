## Why

La aplicación conserva una composición móvil de una sola columna en monitores, por lo que el ancho disponible no mejora la lectura ni la operación. Se necesita una adaptación responsive que reorganice las mismas funciones según el viewport, sin unificar componentes ni modificar reglas de negocio.

## What Changes

- Mantener una columna y navegación compacta en celular.
- Presentar navegación principal visible y agrupada en desktop, conservando el menú para opciones secundarias.
- Reorganizar el inicio administrativo como dashboard: accesos rápidos a ancho completo y dos zonas operativas para reparaciones e inventario.
- Usar grillas responsive en listados repetitivos cuando el contenido lo permita, sin alterar formularios ni componentes de dominio.
- Preservar el orden semántico, las rutas y todas las acciones existentes.

## Impact

- Affected specs: `adaptive-layout`
- Affected code: `src/components/NavMcDron.component.tsx`, `src/components/Inicio/`, listados principales y estilos responsive.
- No cambia persistencia, Redux, selectores, casos de uso ni contratos de datos.
