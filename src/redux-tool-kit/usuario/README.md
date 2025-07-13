# Selectores de Usuarios - Guía de Uso

## ¿Qué son los Selectores de Usuarios?

Los selectores de usuarios son funciones que extraen y derivan datos del estado de usuarios de manera eficiente. Utilizan memoización para optimizar el rendimiento y evitar re-renderizados innecesarios.

**Estructura del Estado**: La colección de usuarios se almacena como un **diccionario** (`{ [id]: Usuario }`) para acceso eficiente por ID, pero los selectores proporcionan arrays cuando es necesario para mantener la facilidad de uso en los componentes.

## Ventajas del Patrón de Diccionario

### ✅ Acceso Directo por ID
```typescript
// ❌ Array - O(n) - buscar linealmente
const usuario = usuarios.find(u => u.id === 'usuario-123');

// ✅ Diccionario - O(1) - acceso directo
const usuario = selectUsuarioPorId(state, 'usuario-123');
```

### ✅ Actualizaciones Eficientes
```typescript
// ❌ Array - reemplazar toda la colección
state.coleccionUsuarios = usuarios.map(u => 
  u.id === usuarioId ? usuarioActualizado : u
);

// ✅ Diccionario - actualización directa
state.coleccionUsuarios[usuarioId] = usuarioActualizado;
```

### ✅ Eliminación Eficiente
```typescript
// ❌ Array - filtrar toda la colección
state.coleccionUsuarios = usuarios.filter(u => u.id !== usuarioId);

// ✅ Diccionario - eliminación directa
delete state.coleccionUsuarios[usuarioId];
```

### ✅ Mejor Compatibilidad con Normalización
El patrón de diccionario es el estándar recomendado por Redux Toolkit para datos normalizados.

## Selectores de Usuarios Disponibles

### Selectores Básicos de Estado

```typescript
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectColeccionUsuarios,    // Diccionario { [id]: Usuario }
  selectUsuariosArray,        // Array Usuario[]
  selectUsuarioFilter,        // string - filtro actual
  selectTieneUsuarios         // boolean - si hay usuarios
} from '../redux-tool-kit/usuario/usuario.selectors';

// En un componente
const usuarios = useAppSelector(selectUsuariosArray);
const filter = useAppSelector(selectUsuarioFilter);
const hayUsuarios = useAppSelector(selectTieneUsuarios);
```

### Selectores con Parámetros

```typescript
import { 
  selectUsuarioPorId,
  selectUsuariosFiltrados,
  selectUsuariosPorBusqueda,
  selectUsuariosPorProvincia,
  selectUsuariosPorCiudad
} from '../redux-tool-kit/usuario/usuario.selectors';

// Selector con parámetro - requiere función callback
const usuario = useAppSelector(state => selectUsuarioPorId(state, 'usuario-123'));
const usuariosFiltrados = useAppSelector(state => selectUsuariosFiltrados(state, 'Juan'));
const usuariosBusqueda = useAppSelector(state => selectUsuariosPorBusqueda(state, 'juan@email.com'));
const usuariosProvincia = useAppSelector(state => selectUsuariosPorProvincia(state, 'Buenos Aires'));
const usuariosCiudad = useAppSelector(state => selectUsuariosPorCiudad(state, 'CABA'));
```

### Selectores Especializados

```typescript
import { 
  selectUsuariosAdmin,
  selectUsuariosNoAdmin,
  selectUsuariosConFoto,
  selectUsuariosSinFoto,
  selectUsuariosConTelefono
} from '../redux-tool-kit/usuario/usuario.selectors';

const administradores = useAppSelector(selectUsuariosAdmin);
const usuariosRegulares = useAppSelector(selectUsuariosNoAdmin);
const usuariosConFoto = useAppSelector(selectUsuariosConFoto);
const usuariosSinFoto = useAppSelector(selectUsuariosSinFoto);
const usuariosConTelefono = useAppSelector(selectUsuariosConTelefono);
```

### Selectores por Búsqueda Exacta

```typescript
import { 
  selectUsuarioPorEmailExacto,
  selectUsuarioPorNickExacto
} from '../redux-tool-kit/usuario/usuario.selectors';

const usuarioEmail = useAppSelector(state => 
  selectUsuarioPorEmailExacto(state, 'juan@email.com')
);
const usuarioNick = useAppSelector(state => 
  selectUsuarioPorNickExacto(state, 'juan123')
);
```

### Selectores de Ordenamiento

```typescript
import { 
  selectUsuariosOrdenados,
  selectUsuariosOrdenadosPorEmail
} from '../redux-tool-kit/usuario/usuario.selectors';

const usuariosOrdenados = useAppSelector(selectUsuariosOrdenados); // por nombre completo
const usuariosPorEmail = useAppSelector(selectUsuariosOrdenadosPorEmail);
```

### Selectores de Datos Geográficos

```typescript
import { 
  selectProvinciasUnicas,
  selectCiudadesUnicas
} from '../redux-tool-kit/usuario/usuario.selectors';

const provincias = useAppSelector(selectProvinciasUnicas);
const ciudades = useAppSelector(selectCiudadesUnicas);
```

### Selectores de Estadísticas

```typescript
import { selectEstadisticasUsuarios } from '../redux-tool-kit/usuario/usuario.selectors';

const estadisticas = useAppSelector(selectEstadisticasUsuarios);
/* Retorna:
{
  total: number,
  administradores: number,
  noAdministradores: number,
  porProvincia: { [provincia: string]: number },
  porCiudad: { [ciudad: string]: number },
  provinciasUnicas: number,
  ciudadesUnicas: number
}
*/
```

### Selectores para Select Options

```typescript
import { selectUsuariosSelectOptions } from '../redux-tool-kit/usuario/usuario.selectors';

const usuariosOptions = useAppSelector(selectUsuariosSelectOptions);
/* Retorna:
[
  { value: 'usuario-1', label: 'Juan Pérez (juanp)' },
  { value: 'usuario-2', label: 'María García (maria_g)' }
]
*/
```

## Ejemplos de Uso en Componentes

### 1. Lista de Usuarios con Filtro

```typescript
import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { selectUsuariosFiltradosPorEstado } from '../redux-tool-kit/usuario/usuario.selectors';
import { setFilter } from '../redux-tool-kit/usuario/usuario.slice';

function ListaUsuarios() {
  const dispatch = useAppDispatch();
  const usuariosFiltrados = useAppSelector(selectUsuariosFiltradosPorEstado);
  const filter = useAppSelector(selectUsuarioFilter);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter(e.target.value));
  };

  return (
    <div>
      <input 
        type="text" 
        value={filter} 
        onChange={handleFilterChange}
        placeholder="Buscar usuarios..."
      />
      {usuariosFiltrados.map(usuario => (
        <div key={usuario.id}>
          {usuario.data.NombreUsu} {usuario.data.ApellidoUsu}
        </div>
      ))}
    </div>
  );
}
```

### 2. Selector de Usuario en Formulario

```typescript
import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectUsuariosSelectOptions } from '../redux-tool-kit/usuario/usuario.selectors';
import Select from 'react-select';

function FormularioConUsuario() {
  const usuariosOptions = useAppSelector(selectUsuariosSelectOptions);

  return (
    <Select
      options={usuariosOptions}
      placeholder="Seleccionar usuario..."
      isSearchable
    />
  );
}
```

### 3. Detalle de Usuario por ID

```typescript
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectUsuarioPorId } from '../redux-tool-kit/usuario/usuario.selectors';

function DetalleUsuario() {
  const { id } = useParams<{ id: string }>();
  const usuario = useAppSelector(state => selectUsuarioPorId(state, id || ''));

  if (!usuario) {
    return <div>Usuario no encontrado</div>;
  }

  return (
    <div>
      <h1>{usuario.data.NombreUsu} {usuario.data.ApellidoUsu}</h1>
      <p>Email: {usuario.data.EmailUsu}</p>
      <p>Teléfono: {usuario.data.TelefonoUsu}</p>
      <p>Administrador: {usuario.data.Admin ? 'Sí' : 'No'}</p>
    </div>
  );
}
```

### 4. Dashboard de Estadísticas

```typescript
import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectEstadisticasUsuarios,
  selectUsuariosAdmin,
  selectProvinciasUnicas
} from '../redux-tool-kit/usuario/usuario.selectors';

function DashboardUsuarios() {
  const estadisticas = useAppSelector(selectEstadisticasUsuarios);
  const administradores = useAppSelector(selectUsuariosAdmin);
  const provincias = useAppSelector(selectProvinciasUnicas);

  return (
    <div>
      <h2>Estadísticas de Usuarios</h2>
      <p>Total de usuarios: {estadisticas.total}</p>
      <p>Administradores: {estadisticas.administradores}</p>
      <p>Usuarios regulares: {estadisticas.noAdministradores}</p>
      <p>Provincias con usuarios: {estadisticas.provinciasUnicas}</p>
      <p>Ciudades con usuarios: {estadisticas.ciudadesUnicas}</p>
      
      <h3>Administradores del sistema:</h3>
      {administradores.map(admin => (
        <div key={admin.id}>
          {admin.data.NombreUsu} {admin.data.ApellidoUsu} ({admin.data.EmailUsu})
        </div>
      ))}
    </div>
  );
}
```

### 5. Búsqueda Avanzada

```typescript
import React, { useState } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectUsuariosPorBusqueda,
  selectUsuariosPorProvincia,
  selectProvinciasUnicas
} from '../redux-tool-kit/usuario/usuario.selectors';

function BusquedaAvanzadaUsuarios() {
  const [busqueda, setBusqueda] = useState('');
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState('');
  
  const usuariosBusqueda = useAppSelector(state => 
    selectUsuariosPorBusqueda(state, busqueda)
  );
  const usuariosProvincia = useAppSelector(state => 
    selectUsuariosPorProvincia(state, provinciaSeleccionada)
  );
  const provincias = useAppSelector(selectProvinciasUnicas);

  // Combinar filtros
  const usuariosFiltrados = busqueda 
    ? usuariosBusqueda.filter(u => 
        !provinciaSeleccionada || u.data.ProvinciaUsu === provinciaSeleccionada
      )
    : usuariosProvincia;

  return (
    <div>
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre, email, nick..."
      />
      
      <select 
        value={provinciaSeleccionada}
        onChange={(e) => setProvinciaSeleccionada(e.target.value)}
      >
        <option value="">Todas las provincias</option>
        {provincias.map(provincia => (
          <option key={provincia} value={provincia}>{provincia}</option>
        ))}
      </select>

      <div>
        {usuariosFiltrados.map(usuario => (
          <div key={usuario.id}>
            {usuario.data.NombreUsu} {usuario.data.ApellidoUsu} - {usuario.data.ProvinciaUsu}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Mejores Prácticas

### ✅ DO - Usar selectores con useAppSelector

```typescript
// ✅ Correcto
const usuario = useAppSelector(state => selectUsuarioPorId(state, userId));
const usuarios = useAppSelector(selectUsuariosArray);
```

### ❌ DON'T - Acceder directamente al estado

```typescript
// ❌ Incorrecto - no optimizado
const usuario = useAppSelector(state => state.usuario.coleccionUsuarios[userId]);
const usuarios = useAppSelector(state => Object.values(state.usuario.coleccionUsuarios));
```

### ✅ DO - Usar selectores memoizados para transformaciones complejas

```typescript
// ✅ Correcto - el selector maneja la memoización
const usuariosOrdenados = useAppSelector(selectUsuariosOrdenados);
```

### ❌ DON'T - Transformar datos en el componente

```typescript
// ❌ Incorrecto - se recalcula en cada render
const usuariosOrdenados = usuarios.sort((a, b) => 
  a.data.NombreUsu.localeCompare(b.data.NombreUsu)
);
```

### ✅ DO - Combinar selectores para lógica compleja

```typescript
// ✅ Correcto - usar múltiples selectores especializados
const usuarios = useAppSelector(selectUsuariosArray);
const administradores = useAppSelector(selectUsuariosAdmin);
const estadisticas = useAppSelector(selectEstadisticasUsuarios);
```

### ✅ DO - Usar el patrón de callback para selectores parametrizados

```typescript
// ✅ Correcto
const usuario = useAppSelector(state => selectUsuarioPorId(state, userId));
const usuariosProvincia = useAppSelector(state => selectUsuariosPorProvincia(state, provincia));
```

## Selectores Disponibles - Referencia Rápida

| Selector | Descripción | Parámetros |
|----------|-------------|------------|
| `selectColeccionUsuarios` | Diccionario de usuarios | - |
| `selectUsuariosArray` | Array de usuarios | - |
| `selectUsuarioFilter` | Filtro actual | - |
| `selectTieneUsuarios` | Si hay usuarios | - |
| `selectUsuarioPorId` | Usuario por ID | `id: string` |
| `selectUsuariosFiltradosPorEstado` | Usuarios filtrados por estado | - |
| `selectUsuariosOrdenados` | Usuarios ordenados por nombre | - |
| `selectUsuariosSelectOptions` | Opciones para select | - |
| `selectUsuariosPorBusqueda` | Usuarios por búsqueda | `busqueda: string` |
| `selectUsuariosFiltrados` | Usuarios filtrados | `filtro?: string` |
| `selectProvinciasUnicas` | Provincias únicas | - |
| `selectUsuariosPorProvincia` | Usuarios por provincia | `provincia: string` |
| `selectCiudadesUnicas` | Ciudades únicas | - |
| `selectUsuariosPorCiudad` | Usuarios por ciudad | `ciudad: string` |
| `selectUsuariosAdmin` | Usuarios administradores | - |
| `selectUsuariosNoAdmin` | Usuarios no administradores | - |
| `selectEstadisticasUsuarios` | Estadísticas de usuarios | - |
| `selectUsuarioPorEmailExacto` | Usuario por email exacto | `email: string` |
| `selectUsuarioPorNickExacto` | Usuario por nick exacto | `nick: string` |
| `selectUsuariosConFoto` | Usuarios con foto | - |
| `selectUsuariosSinFoto` | Usuarios sin foto | - |
| `selectUsuariosConTelefono` | Usuarios con teléfono | - |
| `selectUsuariosOrdenadosPorEmail` | Usuarios ordenados por email | - |
