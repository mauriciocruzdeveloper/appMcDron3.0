# Galería de Reparaciones

## Descripción

La **Galería de Reparaciones** es una nueva página que permite visualizar todas las fotos de las reparaciones de forma organizada y agrupada por cada reparación.

## Características Principales

### 📸 Visualización de Fotos
- Muestra todas las reparaciones que tienen fotos adjuntas
- Las fotos están agrupadas por reparación
- Cada reparación se puede expandir/contraer para ver sus fotos

### 🔍 Filtros
- **Filtro por Estado**: Permite filtrar las reparaciones por su estado actual
  - Todas las reparaciones
  - Estados específicos (Consulta, Recibido, Reparado, etc.)

### 📊 Estadísticas
- Contador de reparaciones con fotos
- Contador total de fotos
- Estadísticas filtradas según el estado seleccionado

### 🎨 Interfaz
- Diseño limpio y moderno
- Tarjetas expandibles para cada reparación
- Información detallada de cada reparación:
  - ID de reparación
  - Cliente
  - Modelo de drone
  - Estado actual
  - Fecha de consulta
  - Descripción del problema
  - Cantidad de fotos

### 🖼️ Galería de Imágenes
- Utiliza el componente `ImageGallery` para mostrar las fotos
- Vista en miniatura de las imágenes
- Posibilidad de ampliar las fotos
- Descarga de imágenes

## Acceso

La galería es accesible desde el menú de navegación:
1. Click en el menú del usuario (foto de perfil)
2. Seleccionar "Galería de Reparaciones"
3. O navegar directamente a: `/inicio/galeria-reparaciones`

## Permisos

- **Solo Administradores**: Esta funcionalidad está protegida por `AdminGuard`
- Los usuarios no administradores no tendrán acceso a esta página

## Uso

### Expandir una Reparación
1. Click en cualquier reparación de la lista
2. Se desplegará la galería de fotos correspondiente
3. Click nuevamente para contraer

### Ver Detalle Completo
1. Click en el botón "Ver Detalle" de cualquier reparación
2. Serás redirigido a la página completa de esa reparación

### Filtrar por Estado
1. Usar el selector "Filtrar por Estado"
2. Seleccionar el estado deseado
3. La lista se actualizará automáticamente

## Ordenamiento

Las reparaciones se muestran ordenadas por fecha de consulta, de más reciente a más antigua.

## Tecnologías Utilizadas

- **React** con TypeScript
- **Redux Toolkit** para estado global
- **React Bootstrap** para estilos
- **React Router** para navegación
- **ImageGallery Component** para visualización de fotos

## Componentes Relacionados

- `ImageGallery.component.tsx` - Componente de galería de imágenes
- `selectReparacionesArray` - Selector de Redux para obtener todas las reparaciones

## Estructura de Datos

La página utiliza la propiedad `urlsFotos` del tipo `ReparacionType`:

```typescript
interface DataReparacion {
  // ...otras propiedades
  urlsFotos?: string[];  // Array de URLs de las fotos
}
```

## Navegación

```
/inicio/galeria-reparaciones
```

## Capturas de Pantalla Conceptuales

### Vista Principal
- Filtro de estados en la parte superior
- Tarjeta de estadísticas generales
- Lista de reparaciones con cantidad de fotos

### Reparación Expandida
- Información completa de la reparación
- Galería de fotos en vista de miniatura
- Botón para ver detalle completo

## Mejoras Futuras Posibles

1. Filtro adicional por rango de fechas
2. Búsqueda por cliente o modelo de drone
3. Exportación de fotos por reparación
4. Vista de galería completa (todas las fotos sin agrupar)
5. Comparación de fotos antes/después
6. Etiquetado de fotos
7. Ordenamiento personalizado

## Mantenimiento

Para actualizar o modificar esta página, editar:
- Componente: `/src/components/GaleriaReparaciones.component.tsx`
- Ruta: `/src/routes/Inicio.routes.js`
- Navegación: `/src/components/NavMcDron.component.tsx`

## Notas de Desarrollo

- El componente utiliza `useState` para manejar el estado local de expansión/contracción
- Se utiliza memoización a través de selectores de Redux para optimizar el rendimiento
- Las imágenes se cargan de forma diferida para mejorar el rendimiento
- El componente es totalmente responsive
