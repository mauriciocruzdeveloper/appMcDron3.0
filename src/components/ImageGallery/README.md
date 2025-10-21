# ImageGallery Component

Componente de galería de imágenes con visualizador a pantalla completa para la aplicación McDron.

## Características

### 📸 Vista de Galería
- Grid responsive adaptable a diferentes tamaños de pantalla
- Miniaturas con efecto hover
- Contador de imágenes por cada miniatura
- Overlay de zoom al pasar el mouse

### 🖼️ Visor de Pantalla Completa
- Navegación con flechas izquierda/derecha
- Navegación con teclado (←, →, ESC)
- Zoom in/out (teclas +, -)
- Barra de miniaturas inferior para navegación rápida
- Botón de descarga
- Indicador de posición (imagen X de Y)

### 🎨 Diseño Responsive
- Grid adaptable: 3 columnas en desktop, 2 en tablet, 1-2 en móvil
- Controles optimizados para touch
- Layout adaptado para pantallas pequeñas

### 🔒 Funcionalidad de Admin
- Botones de descarga y eliminación (solo para admins)
- Control de permisos mediante prop `isAdmin`

## Uso

### Importación

```tsx
import { ImageGallery } from '../components/ImageGallery';
```

### Ejemplo Básico

```tsx
<ImageGallery
  images={['url1.jpg', 'url2.jpg', 'url3.jpg']}
/>
```

### Ejemplo con Funcionalidad de Admin

```tsx
<ImageGallery
  images={reparacion.data.urlsFotos || []}
  onDelete={handleDeleteFoto}
  isAdmin={true}
/>
```

## Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `images` | `string[]` | Sí | Array de URLs de las imágenes a mostrar |
| `onDelete` | `(url: string) => void` | No | Callback ejecutado al eliminar una imagen |
| `isAdmin` | `boolean` | No | Muestra controles de administrador (default: `false`) |

## Controles de Teclado

Cuando el visor está en modo pantalla completa:

| Tecla | Acción |
|-------|--------|
| `←` | Imagen anterior |
| `→` | Imagen siguiente |
| `ESC` | Cerrar visor |
| `+` o `=` | Acercar zoom |
| `-` | Alejar zoom |

## Integración

### En Componente de Reparación

```tsx
{seccionesVisibles.fotos && (
  <div className="card mb-3">
    <div className="card-body">
      <h5 className="card-title bluemcdron">FOTOS</h5>
      <ImageGallery
        images={reparacion.data.urlsFotos || []}
        onDelete={isAdmin ? handleDeleteFoto : undefined}
        isAdmin={isAdmin}
      />
    </div>
  </div>
)}
```

### En Componente de Drone

```tsx
{!isNew && fotosDrone.length > 0 && (
  <div className="card mb-3">
    <div className="card-body">
      <h5 className="card-title bluemcdron">GALERÍA DE IMÁGENES DEL DRONE</h5>
      <p className="text-muted small mb-3">
        Fotos de todas las reparaciones de este drone
      </p>
      <ImageGallery
        images={fotosDrone}
        isAdmin={false}
      />
    </div>
  </div>
)}
```

## Selector Personalizado para Drones

Para obtener todas las fotos de las reparaciones de un drone:

```tsx
import { selectFotosByDrone } from '../redux-tool-kit/reparacion';

// En el componente
const fotosDrone = useAppSelector(state =>
  selectFotosByDrone(droneId)(state)
);
```

## Estilos

Los estilos están definidos en `ImageGallery.styles.css` e incluyen:

- Animaciones suaves
- Transiciones de hover
- Media queries para responsive
- Efectos de zoom y overlay
- Scrollbar personalizado

## Estado Vacío

Cuando no hay imágenes disponibles, se muestra un mensaje amigable:

```
[Icono de imagen]
No hay imágenes disponibles
```

## Notas Técnicas

### Optimización de Rendimiento
- Uso de `lazy loading` en miniaturas
- Memoización de callbacks con `useCallback`
- Event listeners limpios en `useEffect`

### Accesibilidad
- Atributos `alt` en todas las imágenes
- Títulos descriptivos en botones
- Navegación por teclado completa

### Compatibilidad
- Compatible con todos los navegadores modernos
- Soporte touch para dispositivos móviles
- Fallback para imágenes que no cargan

## Estructura de Archivos

```
ImageGallery/
├── ImageGallery.component.tsx  # Componente principal
├── ImageGallery.styles.css     # Estilos CSS
└── index.ts                     # Re-exportación
```

## Mejoras Futuras

- [ ] Soporte para gestos de swipe en móviles
- [ ] Rotación de imágenes
- [ ] Filtros y edición básica
- [ ] Descarga múltiple
- [ ] Modo presentación con autoplay
- [ ] Compartir imágenes

## Licencia

Parte del proyecto McDron - © 2025
