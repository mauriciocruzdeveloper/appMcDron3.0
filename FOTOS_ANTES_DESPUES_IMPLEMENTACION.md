# Implementación de Fotos ANTES/DESPUÉS en Reparaciones

## 📋 Resumen

Se ha implementado la funcionalidad para seleccionar y marcar fotos de "ANTES" y "DESPUÉS" de una reparación. Esta característica permite identificar visualmente el estado del drone antes de la reparación y después de completada.

## ✅ Cambios Realizados en Frontend

### 1. Tipos de Datos Actualizados

**Archivo:** `/src/types/reparacion.ts`

Se agregaron dos nuevos campos al interface `DataReparacion`:

```typescript
FotoAntes?: string;      // URL de la foto "antes" de la reparación
FotoDespues?: string;    // URL de la foto "después" de la reparación
```

**Nota:** Aunque el frontend usa nombres en español (`FotoAntes`, `FotoDespues`), la base de datos usa nombres en inglés (`photo_before`, `photo_after`). El mapeo se realiza automáticamente en la capa de persistencia.

### 2. Componente ImageGallery Mejorado

**Archivo:** `/src/components/ImageGallery/ImageGallery.component.tsx`

**Nuevas Props:**
- `photoBeforeUrl?: string` - URL de la foto marcada como "antes"
- `photoAfterUrl?: string` - URL de la foto marcada como "después"
- `onSelectBefore?: (url: string) => void` - Callback para seleccionar foto "antes"
- `onSelectAfter?: (url: string) => void` - Callback para seleccionar foto "después"
- `enableSelection?: boolean` - Habilita los controles de selección

**Características Visuales:**
- ✨ **Badge indicador**: Las fotos seleccionadas muestran badges distintivos
  - 🟡 **ANTES**: Badge amarillo con icono de flecha izquierda
  - 🟢 **DESPUÉS**: Badge verde con icono de flecha derecha
- 🎨 **Borde de color**: Las fotos tienen bordes de colores para identificación rápida
  - Amarillo para "ANTES"
  - Verde para "DESPUÉS"
- 🔘 **Botones de selección**: Dos botones para marcar cada foto
  - Solo se puede seleccionar una foto como "ANTES" y otra como "DESPUÉS"
  - Los botones se deshabilitan si la foto ya está marcada con el rol contrario

### 3. Componente Reparación

**Archivo:** `/src/components/Reparacion/Reparacion.component.tsx`

**Nuevas Funciones:**
- `handleSelectFotoAntes(url: string)` - Selecciona/deselecciona foto como "ANTES"
- `handleSelectFotoDespues(url: string)` - Selecciona/deselecciona foto como "DESPUÉS"

**Características:**
- ℹ️ **Alert informativo**: Muestra instrucciones sobre cómo seleccionar fotos
- 💾 **Guardado automático**: Al seleccionar una foto, se guarda automáticamente en la base de datos
- 🔄 **Toggle functionality**: Hacer clic nuevamente en la misma selección la deselecciona
- 🔐 **Solo Admins**: Solo los administradores pueden seleccionar fotos

### 4. Componente Galería de Reparaciones

**Archivo:** `/src/components/GaleriaReparaciones.component.tsx`

**Mejoras:**
- 📊 **Indicador visual**: Muestra un alert cuando una reparación tiene fotos marcadas
- 👁️ **Vista de badges**: Los badges se muestran en las fotos seleccionadas
- 📖 **Modo lectura**: Los usuarios no-admin pueden ver las fotos marcadas pero no modificarlas
- ✨ **Selección desde galería (Admin)**: Los administradores pueden seleccionar fotos ANTES/DESPUÉS directamente desde la galería sin entrar al detalle de cada reparación
- 🔍 **Filtro de fotos seleccionadas**: 
  - **Todas**: Muestra todas las reparaciones con fotos
  - **⚪ Sin fotos seleccionadas**: Muestra solo reparaciones que NO tienen fotos ANTES/DESPUÉS marcadas
  - **✅ Con fotos seleccionadas**: Muestra solo reparaciones que tienen al menos una foto ANTES o DESPUÉS marcada

**Funcionalidades para Admin:**
- `handleSelectFotoAntes(reparacion, url)` - Selecciona/deselecciona foto como "ANTES" desde la galería
- `handleSelectFotoDespues(reparacion, url)` - Selecciona/deselecciona foto como "DESPUÉS" desde la galería
- Guardado automático al seleccionar/deseleccionar
- Logs detallados con prefijo `[Galería]` para depuración
- Alert informativo indicando que está en modo Admin

## 🗄️ CAMBIOS REQUERIDOS EN BACKEND

### ⚠️ Convención de Nombres Importante

**Frontend (español):** `FotoAntes` y `FotoDespues`  
**Base de Datos (inglés):** `photo_before` y `photo_after`

El mapeo automático se realiza en `reparacionesPersistencia.js`.

### Base de Datos - Tabla `repair`

Debes agregar **DOS NUEVOS CAMPOS** a la tabla de reparaciones:

#### SQL para PostgreSQL/Supabase:

```sql
ALTER TABLE repair 
ADD COLUMN photo_before VARCHAR(500),
ADD COLUMN photo_after VARCHAR(500);
```

### Descripción de los Campos

| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `photo_before` | VARCHAR(500) | URL completa de la foto que muestra el estado del drone ANTES de la reparación | Opcional, debe ser una URL válida |
| `photo_after` | VARCHAR(500) | URL completa de la foto que muestra el estado del drone DESPUÉS de la reparación | Opcional, debe ser una URL válida |

### Capa de Persistencia (YA IMPLEMENTADA ✅)

**Archivo:** `/src/persistencia/persistenciaSupabase/reparacionesPersistencia.js`

#### Lectura desde Base de Datos (BD → Frontend)
```javascript
// En getReparacionesPersistencia y getReparacionPersistencia
FotoAntes: item.photo_before || undefined,    // Mapeo automático
FotoDespues: item.photo_after || undefined    // Mapeo automático
```

#### Escritura a Base de Datos (Frontend → BD)
```javascript
// En guardarReparacionPersistencia
photo_before: reparacion.data.FotoAntes || null,   // Mapeo automático
photo_after: reparacion.data.FotoDespues || null    // Mapeo automático
```

### Validaciones Backend Recomendadas

```sql
-- Opcional: Agregar restricciones en la base de datos
-- Verificar que las URLs existan en photo_urls (requiere función custom)
-- Verificar que photo_before != photo_after si ambas existen
ALTER TABLE repair 
ADD CONSTRAINT check_different_photos 
CHECK (photo_before IS NULL OR photo_after IS NULL OR photo_before != photo_after);
```

O en código JavaScript/TypeScript:

```javascript
// Pseudo-código de validaciones
if (photo_before) {
    // Verificar que la URL esté en el array photo_urls de la misma reparación
    if (!reparacion.photo_urls.includes(photo_before)) {
        throw new Error("photo_before debe ser una URL de foto existente en la reparación");
    }
}

if (photo_after) {
    // Verificar que la URL esté en el array photo_urls de la misma reparación
    if (!reparacion.photo_urls.includes(photo_after)) {
        throw new Error("photo_after debe ser una URL de foto existente en la reparación");
    }
}

// Verificar que no sean la misma foto
if (photo_before && photo_after && photo_before === photo_after) {
    throw new Error("photo_before y photo_after no pueden ser la misma foto");
}
```

## 🎯 Casos de Uso

### Caso 1: Seleccionar Foto "ANTES" desde Detalle de Reparación
1. Admin entra a la vista de reparación
2. Ve la galería de fotos con botones de selección
3. Hace clic en el botón "ANTES" (amarillo) de una foto
4. La foto se marca con badge amarillo "ANTES"
5. Se guarda automáticamente en la base de datos

### Caso 2: Seleccionar Foto "DESPUÉS" desde Detalle de Reparación
1. Admin hace clic en el botón "DESPUÉS" (verde) de otra foto
2. La foto se marca con badge verde "DESPUÉS"
3. Se guarda automáticamente

### Caso 3: Seleccionar Fotos desde Galería de Reparaciones (NUEVO ✨)
1. Admin navega a "Galería de Reparaciones"
2. Expande una reparación haciendo clic en ella
3. Ve un alert azul indicando "Modo Admin" con instrucciones
4. Hace clic en el botón "ANTES" o "DESPUÉS" de cualquier foto
5. La foto se marca con el badge correspondiente
6. Se guarda automáticamente SIN necesidad de entrar al detalle
7. La selección se ve reflejada inmediatamente con los badges

### Caso 4: Filtrar Reparaciones sin Fotos Seleccionadas (NUEVO 🔍)
1. Usuario o Admin navega a "Galería de Reparaciones"
2. En el filtro "Fotos Antes/Después" selecciona "⚪ Sin fotos seleccionadas"
3. Solo se muestran las reparaciones que NO tienen fotos ANTES ni DESPUÉS marcadas
4. Esto facilita identificar qué reparaciones necesitan que se marquen las fotos
5. El contador muestra cuántas reparaciones cumplen el criterio

### Caso 5: Filtrar Reparaciones con Fotos Seleccionadas (NUEVO 🔍)
1. Usuario o Admin navega a "Galería de Reparaciones"
2. En el filtro "Fotos Antes/Después" selecciona "✅ Con fotos seleccionadas"
3. Solo se muestran las reparaciones que tienen al menos una foto ANTES o DESPUÉS marcada
4. Útil para revisar qué reparaciones ya tienen las fotos configuradas

### Caso 6: Cambiar Selección
1. Admin hace clic en el botón "ANTES" de una foto ya marcada
2. La selección se quita (toggle)
3. Puede seleccionar otra foto como "ANTES"

### Caso 7: Vista en Galería de Reparaciones
1. Usuario navega a "Galería de Reparaciones"
2. Expande una reparación que tiene fotos marcadas
3. Ve un alert indicando que hay fotos marcadas
4. Las fotos muestran los badges correspondientes

## 🎨 Diseño Visual

### Badges

**ANTES:**
```
┌─────────────┐
│ ← ANTES     │ (Fondo amarillo, texto negro)
└─────────────┘
```

**DESPUÉS:**
```
┌─────────────┐
│ → DESPUÉS   │ (Fondo verde, texto blanco)
└─────────────┘
```

### Botones en Galería

- **No seleccionado**: Botón con borde del color correspondiente
- **Seleccionado**: Botón con fondo sólido del color correspondiente
- **Deshabilitado**: Cuando la foto ya tiene el rol opuesto

## 📱 Responsive

- ✅ Los badges se adaptan a pantallas pequeñas
- ✅ Los botones se reorganizan verticalmente en móviles
- ✅ Las alertas son responsive

## 🔒 Permisos

| Acción | Admin | Usuario Regular |
|--------|-------|-----------------|
| Ver fotos marcadas (Detalle) | ✅ | ✅ |
| Ver fotos marcadas (Galería) | ✅ | ✅ |
| Seleccionar foto ANTES (Detalle) | ✅ | ❌ |
| Seleccionar foto DESPUÉS (Detalle) | ✅ | ❌ |
| Seleccionar foto ANTES (Galería) | ✅ | ❌ |
| Seleccionar foto DESPUÉS (Galería) | ✅ | ❌ |
| Usar filtro "Sin fotos seleccionadas" | ✅ | ✅ |
| Usar filtro "Con fotos seleccionadas" | ✅ | ✅ |
| Cambiar selección | ✅ | ❌ |

## 🧪 Testing

### Tests Sugeridos para Backend

```javascript
describe('Reparaciones - Fotos Antes/Después', () => {
    test('Debe guardar fotoAntes correctamente', async () => {
        // ... test code
    });

    test('Debe guardar fotoDespues correctamente', async () => {
        // ... test code
    });

    test('Debe rechazar fotoAntes si no está en urlsFotos', async () => {
        // ... test code
    });

    test('Debe permitir deseleccionar fotos (null)', async () => {
        // ... test code
    });

    test('Debe rechazar si fotoAntes === fotoDespues', async () => {
        // ... test code
    });
});
```

## ✨ Nuevas Funcionalidades (Última Actualización)

### 1. Selección desde Galería de Reparaciones
Ahora los administradores pueden seleccionar fotos ANTES/DESPUÉS directamente desde la **Galería de Reparaciones** sin necesidad de entrar al detalle de cada reparación.

**Beneficios:**
- ⚡ **Más rápido**: No necesitas abrir cada reparación individualmente
- 👁️ **Vista previa**: Ves todas las fotos de la reparación a la vez
- 🎯 **Eficiente**: Ideal para marcar fotos en múltiples reparaciones seguidas

**Cómo usar:**
1. Ve a "Galería de Reparaciones"
2. Haz clic en cualquier reparación para expandirla
3. Si eres admin, verás un alert azul con instrucciones
4. Usa los botones amarillo (ANTES) y verde (DESPUÉS) en cada foto
5. Los cambios se guardan automáticamente

### 2. Filtros Avanzados
Nuevos filtros para encontrar rápidamente reparaciones según el estado de sus fotos:

**⚪ Sin fotos seleccionadas:**
- Muestra solo reparaciones que NO tienen fotos ANTES ni DESPUÉS marcadas
- Útil para identificar qué reparaciones necesitan atención
- Ideal para workflow: "Voy a marcar fotos de todas las reparaciones pendientes"

**✅ Con fotos seleccionadas:**
- Muestra solo reparaciones que tienen al menos una foto ANTES o DESPUÉS
- Útil para revisar o verificar reparaciones ya procesadas
- Perfecto para control de calidad

**Cómo usar:**
1. En la Galería de Reparaciones, busca el selector "Fotos Antes/Después"
2. Selecciona el filtro deseado
3. El contador se actualiza mostrando cuántas reparaciones cumplen el criterio
4. Combina con el filtro de estado para mayor precisión

**Ejemplo de uso combinado:**
- Estado: "Reparado"
- Fotos: "Sin fotos seleccionadas"
- Resultado: Todas las reparaciones terminadas que aún no tienen fotos ANTES/DESPUÉS marcadas

## 📝 Notas Adicionales

- Las URLs almacenadas deben coincidir exactamente con las URLs en `urlsFotos`
- Si una foto se elimina del array `urlsFotos`, deberías limpiar automáticamente `fotoAntes` o `fotoDespues` si corresponde
- Los campos son opcionales - una reparación puede no tener fotos marcadas
- Las fotos marcadas son independientes - puede haber solo "ANTES", solo "DESPUÉS", ambas, o ninguna

## 🚀 Próximos Pasos

1. ✅ Frontend implementado
2. ✅ Capa de persistencia con mapeo automático implementada
3. ⏳ Agregar campos `photo_before` y `photo_after` a la base de datos
4. ⏳ Agregar validaciones (opcional)
5. ⏳ Testing
6. ⏳ Deployment

## 📞 Soporte

Para cualquier duda sobre la implementación:
- Revisar el código en los archivos mencionados
- Verificar que los tipos de datos coincidan
- Asegurarse de que las URLs sean consistentes
