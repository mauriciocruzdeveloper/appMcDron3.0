# Componentes Auxiliares - Reparación

Esta carpeta contiene componentes auxiliares reutilizables para el layout de Reparación.

## Estructura

### Header/
Componentes relacionados con el encabezado de la reparación:
- `ReparacionHeader.tsx` - Header principal con estado actual
- `ProgressBar.tsx` - Barra de progreso visual
- `QuickActions.tsx` - Botones de acciones rápidas

### Tabs/
Componentes relacionados con la navegación por tabs:
- `TabNavigation.tsx` - Navegación entre tabs
- `TabPanel.tsx` - Panel contenedor de tabs

### Shared/
Componentes compartidos entre múltiples secciones:
- `EstadoBadge.tsx` - Badge de estado
- `SectionCard.tsx` - Card wrapper para secciones
- `ActionButton.tsx` - Botón de acción personalizado
- `FormField.tsx` - Input field genérico

## Convenciones

- Usar TypeScript estricto
- Cada componente debe tener props interface
- Documentar con JSDoc
- Componentes presentacionales (sin lógica de negocio)
- Usar React.memo para optimización cuando sea necesario
