# Persistencia Supabase

Esta carpeta contiene todos los módulos relacionados con la persistencia usando Supabase como backend.

## Estructura de archivos

### Archivos principales
- `index.js` - Punto de entrada principal que re-exporta todas las funciones
- `supabaseClient.js` - Configuración y cliente de Supabase

### Módulos especializados por dominio
- `reparacionesPersistencia.js` - Gestión de reparaciones y presupuestos
- `usuariosPersistencia.js` - Gestión de usuarios y clientes
- `repuestosPersistencia.js` - Manejo de repuestos y piezas
- `dronesPersistencia.js` - Gestión de drones y modelos
- `intervencionesPersistencia.js` - Gestión de intervenciones
- `archivosPersistencia.js` - Subida y gestión de archivos
- `mensajesPersistencia.js` - Sistema de mensajería
- `autenticacionPersistencia.js` - Login, registro y autenticación
- `utilidadesPersistencia.js` - Utilidades y datos estáticos
- `websocketDiagnostico.js` - Diagnósticos y gestión de WebSocket

### Archivos de tipos y errores
- `supabaseAuthErrors.ts` - Tipos de errores de autenticación
- `supabaseRegisterErrors.ts` - Tipos de errores de registro

## Uso

Todas las funciones están disponibles a través del archivo `index.js`:

```javascript
import { 
  getReparacionesPersistencia,
  guardarReparacionPersistencia,
  getUsuariosPersistencia,
  // ... otras funciones
} from './persistenciaSupabase/index.js';
```

O a través del archivo principal de persistencia (recomendado):
```javascript
import { 
  getReparacionesPersistencia,
  guardarReparacionPersistencia 
} from './persistencia.js';
```
