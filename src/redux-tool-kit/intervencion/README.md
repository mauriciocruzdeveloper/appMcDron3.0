# Selectores de Intervenciones - Guía de Uso

## ¿Qué son los Selectores de Intervenciones?

Los selectores de intervenciones son funciones que extraen y derivan datos del estado de intervenciones de manera eficiente. Utilizan memoización para optimizar el rendimiento y evitar re-renderizados innecesarios.

**Estructura del Estado**: La colección de intervenciones se almacena como un **diccionario** (`{ [id]: Intervencion }`) para acceso eficiente por ID, pero los selectores proporcionan arrays cuando es necesario para mantener la facilidad de uso en los componentes.

## Ventajas del Patrón de Diccionario

### ✅ Acceso Directo por ID
```typescript
// ❌ Array - O(n) - buscar linealmente
const intervencion = intervenciones.find(i => i.id === 'intervencion-123');

// ✅ Diccionario - O(1) - acceso directo
const intervencion = selectIntervencionPorId(state, 'intervencion-123');
```

### ✅ Actualizaciones Eficientes
```typescript
// ❌ Array - reemplazar toda la colección
state.coleccionIntervenciones = intervenciones.map(i => 
  i.id === intervencionId ? intervencionActualizada : i
);

// ✅ Diccionario - actualización directa
state.coleccionIntervenciones[intervencionId] = intervencionActualizada;
```

### ✅ Eliminación Eficiente
```typescript
// ❌ Array - filtrar toda la colección
state.coleccionIntervenciones = intervenciones.filter(i => i.id !== intervencionId);

// ✅ Diccionario - eliminación directa
delete state.coleccionIntervenciones[intervencionId];
```

### ✅ Mejor Compatibilidad con Normalización
El patrón de diccionario es el estándar recomendado por Redux Toolkit para datos normalizados.

## Selectores de Intervenciones Disponibles

### Selectores Básicos de Estado

```typescript
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectColeccionIntervenciones,    // Diccionario { [id]: Intervencion }
  selectIntervencionesArray,        // Array Intervencion[]
  selectIntervencionFilter,         // string - filtro actual
  selectTieneIntervenciones,        // boolean - si hay intervenciones
  selectSelectedIntervencion,       // Intervencion | null - intervención seleccionada
  selectIsFetchingIntervencion      // boolean - estado de carga
} from '../redux-tool-kit/intervencion/intervencion.selectors';

// En un componente
const intervenciones = useAppSelector(selectIntervencionesArray);
const filter = useAppSelector(selectIntervencionFilter);
const hayIntervenciones = useAppSelector(selectTieneIntervenciones);
const seleccionada = useAppSelector(selectSelectedIntervencion);
const cargando = useAppSelector(selectIsFetchingIntervencion);
```

### Selectores con Parámetros

```typescript
import { 
  selectIntervencionPorId,
  selectIntervencionesFiltradas,
  selectIntervencionesPorBusqueda,
  selectIntervencionesPorModeloDrone,
  selectIntervencionesPorRepuesto
} from '../redux-tool-kit/intervencion/intervencion.selectors';

// Selector con parámetro - requiere función callback
const intervencion = useAppSelector(state => selectIntervencionPorId(state, 'intervencion-123'));
const intervencionesFiltradas = useAppSelector(state => selectIntervencionesFiltradas(state, 'reparación'));
const intervencionesBusqueda = useAppSelector(state => selectIntervencionesPorBusqueda(state, 'hélices'));
const intervencionesModelo = useAppSelector(state => selectIntervencionesPorModeloDrone(state, 'modelo-mavic'));
const intervencionesRepuesto = useAppSelector(state => selectIntervencionesPorRepuesto(state, 'repuesto-123'));
```

### Selectores de Ordenamiento

```typescript
import { 
  selectIntervencionesOrdenadas,
  selectIntervencionesOrdendasPorPrecio,
  selectIntervencionesOrdenadasPorDuracion
} from '../redux-tool-kit/intervencion/intervencion.selectors';

const intervencionesOrdenadas = useAppSelector(selectIntervencionesOrdenadas); // por nombre
const intervencionesPorPrecio = useAppSelector(selectIntervencionesOrdendasPorPrecio);
const intervencionesPorDuracion = useAppSelector(selectIntervencionesOrdenadasPorDuracion);
```

### Selectores por Rangos

```typescript
import { 
  selectIntervencionesPorRangoPrecio,
  selectIntervencionesPorRangoDuracion
} from '../redux-tool-kit/intervencion/intervencion.selectors';

const intervencionesEconomicas = useAppSelector(state => 
  selectIntervencionesPorRangoPrecio(state, 0, 50000)
);
const intervencionesRapidas = useAppSelector(state => 
  selectIntervencionesPorRangoDuracion(state, 0, 60) // hasta 60 minutos
);
```

### Selectores Especializados

```typescript
import { 
  selectIntervencionesSoloManoObra,
  selectIntervencionesConRepuestos
} from '../redux-tool-kit/intervencion/intervencion.selectors';

const soloManoObra = useAppSelector(selectIntervencionesSoloManoObra);
const conRepuestos = useAppSelector(selectIntervencionesConRepuestos);
```

### Selectores por Búsqueda Exacta

```typescript
import { selectIntervencionPorNombreExacto } from '../redux-tool-kit/intervencion/intervencion.selectors';

const intervencionNombre = useAppSelector(state => 
  selectIntervencionPorNombreExacto(state, 'Reemplazo de hélices')
);
```

### Selectores de Estadísticas

```typescript
import { selectEstadisticasIntervenciones } from '../redux-tool-kit/intervencion/intervencion.selectors';

const estadisticas = useAppSelector(selectEstadisticasIntervenciones);
/* Retorna:
{
  total: number,
  conRepuestos: number,
  soloManoObra: number,
  precioPromedio: number,
  duracionPromedio: number,
  precioMinimo: number,
  precioMaximo: number,
  duracionMinima: number,
  duracionMaxima: number,
  porModeloDrone: { [modeloId: string]: number }
}
*/
```

### Selectores para Select Options

```typescript
import { selectIntervencionesSelectOptions } from '../redux-tool-kit/intervencion/intervencion.selectors';

const intervencionesOptions = useAppSelector(selectIntervencionesSelectOptions);
/* Retorna:
[
  { value: 'intervencion-1', label: 'Reemplazo de hélices - $20000' },
  { value: 'intervencion-2', label: 'Cambio de batería - $35000' }
]
*/
```

### Selectores Utilitarios

```typescript
import { 
  selectTotalIntervenciones,
  selectExisteIntervencion
} from '../redux-tool-kit/intervencion/intervencion.selectors';

const total = useAppSelector(selectTotalIntervenciones);
const existe = useAppSelector(state => selectExisteIntervencion(state, 'intervencion-123'));
```

## Ejemplos de Uso en Componentes

### 1. Lista de Intervenciones con Filtro

```typescript
import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { selectIntervencionesFiltradasPorEstado } from '../redux-tool-kit/intervencion/intervencion.selectors';
import { setFilter } from '../redux-tool-kit/intervencion/intervencion.slice';

function ListaIntervenciones() {
  const dispatch = useAppDispatch();
  const intervencionesFiltradas = useAppSelector(selectIntervencionesFiltradasPorEstado);
  const filter = useAppSelector(selectIntervencionFilter);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFilter(e.target.value));
  };

  const formatPrice = (precio: number) => 
    precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  return (
    <div>
      <input 
        type="text" 
        value={filter} 
        onChange={handleFilterChange}
        placeholder="Buscar intervenciones..."
      />
      {intervencionesFiltradas.map(intervencion => (
        <div key={intervencion.id} className="card mb-2">
          <div className="card-body">
            <h5>{intervencion.data.NombreInt}</h5>
            <p>{intervencion.data.DescripcionInt}</p>
            <div className="d-flex justify-content-between">
              <span>Precio: {formatPrice(intervencion.data.PrecioTotal)}</span>
              <span>Duración: {intervencion.data.DuracionEstimada} min</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 2. Selector de Intervención en Formulario

```typescript
import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectIntervencionesSelectOptions } from '../redux-tool-kit/intervencion/intervencion.selectors';
import Select from 'react-select';

function FormularioConIntervencion() {
  const intervencionesOptions = useAppSelector(selectIntervencionesSelectOptions);

  return (
    <Select
      options={intervencionesOptions}
      placeholder="Seleccionar intervención..."
      isSearchable
    />
  );
}
```

### 3. Detalle de Intervención por ID

```typescript
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectIntervencionPorId } from '../redux-tool-kit/intervencion/intervencion.selectors';

function DetalleIntervencion() {
  const { id } = useParams<{ id: string }>();
  const intervencion = useAppSelector(state => selectIntervencionPorId(state, id || ''));

  if (!intervencion) {
    return <div>Intervención no encontrada</div>;
  }

  const formatPrice = (precio: number) => 
    precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  return (
    <div>
      <h1>{intervencion.data.NombreInt}</h1>
      <p>{intervencion.data.DescripcionInt}</p>
      <div className="row">
        <div className="col-md-6">
          <p><strong>Precio Mano de Obra:</strong> {formatPrice(intervencion.data.PrecioManoObra)}</p>
          <p><strong>Precio Total:</strong> {formatPrice(intervencion.data.PrecioTotal)}</p>
        </div>
        <div className="col-md-6">
          <p><strong>Duración Estimada:</strong> {intervencion.data.DuracionEstimada} minutos</p>
          <p><strong>Repuestos:</strong> {intervencion.data.RepuestosIds.length} items</p>
        </div>
      </div>
    </div>
  );
}
```

### 4. Dashboard de Estadísticas

```typescript
import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectEstadisticasIntervenciones,
  selectIntervencionesSoloManoObra,
  selectIntervencionesConRepuestos
} from '../redux-tool-kit/intervencion/intervencion.selectors';

function DashboardIntervenciones() {
  const estadisticas = useAppSelector(selectEstadisticasIntervenciones);
  const soloManoObra = useAppSelector(selectIntervencionesSoloManoObra);
  const conRepuestos = useAppSelector(selectIntervencionesConRepuestos);

  const formatPrice = (precio: number) => 
    precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  return (
    <div>
      <h2>Estadísticas de Intervenciones</h2>
      <div className="row">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3>{estadisticas.total}</h3>
              <p>Total de Intervenciones</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3>{formatPrice(estadisticas.precioPromedio)}</h3>
              <p>Precio Promedio</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3>{estadisticas.duracionPromedio} min</h3>
              <p>Duración Promedio</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body text-center">
              <h3>{estadisticas.conRepuestos}/{estadisticas.soloManoObra}</h3>
              <p>Con/Sin Repuestos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <h4>Rango de Precios</h4>
          <p>Mínimo: {formatPrice(estadisticas.precioMinimo)}</p>
          <p>Máximo: {formatPrice(estadisticas.precioMaximo)}</p>
        </div>
        <div className="col-md-6">
          <h4>Rango de Duración</h4>
          <p>Mínima: {estadisticas.duracionMinima} minutos</p>
          <p>Máxima: {estadisticas.duracionMaxima} minutos</p>
        </div>
      </div>
    </div>
  );
}
```

### 5. Búsqueda Avanzada por Rangos

```typescript
import React, { useState } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectIntervencionesPorRangoPrecio,
  selectIntervencionesPorRangoDuracion,
  selectIntervencionesPorModeloDrone
} from '../redux-tool-kit/intervencion/intervencion.selectors';
import { selectModelosDroneArray } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

function BusquedaAvanzadaIntervenciones() {
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(100000);
  const [duracionMin, setDuracionMin] = useState(0);
  const [duracionMax, setDuracionMax] = useState(240);
  const [modeloSeleccionado, setModeloSeleccionado] = useState('');
  
  const intervencionesPrecio = useAppSelector(state => 
    selectIntervencionesPorRangoPrecio(state, precioMin, precioMax)
  );
  const intervencionesDuracion = useAppSelector(state => 
    selectIntervencionesPorRangoDuracion(state, duracionMin, duracionMax)
  );
  const intervencionesModelo = useAppSelector(state => 
    selectIntervencionesPorModeloDrone(state, modeloSeleccionado)
  );
  const modelosDrone = useAppSelector(selectModelosDroneArray);

  // Combinar filtros
  const intervencionesFiltradas = intervencionesPrecio
    .filter(i => intervencionesDuracion.some(d => d.id === i.id))
    .filter(i => !modeloSeleccionado || intervencionesModelo.some(m => m.id === i.id));

  const formatPrice = (precio: number) => 
    precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

  return (
    <div>
      <h3>Búsqueda Avanzada de Intervenciones</h3>
      
      <div className="row mb-4">
        <div className="col-md-4">
          <h5>Rango de Precio</h5>
          <div className="mb-2">
            <label>Mínimo:</label>
            <input
              type="number"
              className="form-control"
              value={precioMin}
              onChange={(e) => setPrecioMin(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Máximo:</label>
            <input
              type="number"
              className="form-control"
              value={precioMax}
              onChange={(e) => setPrecioMax(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="col-md-4">
          <h5>Rango de Duración (minutos)</h5>
          <div className="mb-2">
            <label>Mínimo:</label>
            <input
              type="number"
              className="form-control"
              value={duracionMin}
              onChange={(e) => setDuracionMin(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Máximo:</label>
            <input
              type="number"
              className="form-control"
              value={duracionMax}
              onChange={(e) => setDuracionMax(Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="col-md-4">
          <h5>Modelo de Drone</h5>
          <select 
            className="form-control"
            value={modeloSeleccionado}
            onChange={(e) => setModeloSeleccionado(e.target.value)}
          >
            <option value="">Todos los modelos</option>
            {modelosDrone.map(modelo => (
              <option key={modelo.id} value={modelo.id}>
                {modelo.data.NombreModelo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h4>Resultados ({intervencionesFiltradas.length} intervenciones)</h4>
      <div>
        {intervencionesFiltradas.map(intervencion => (
          <div key={intervencion.id} className="card mb-2">
            <div className="card-body">
              <h6>{intervencion.data.NombreInt}</h6>
              <div className="d-flex justify-content-between">
                <span>{formatPrice(intervencion.data.PrecioTotal)}</span>
                <span>{intervencion.data.DuracionEstimada} min</span>
              </div>
            </div>
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
const intervencion = useAppSelector(state => selectIntervencionPorId(state, intervencionId));
const intervenciones = useAppSelector(selectIntervencionesArray);
```

### ❌ DON'T - Acceder directamente al estado

```typescript
// ❌ Incorrecto - no optimizado
const intervencion = useAppSelector(state => state.intervencion.coleccionIntervenciones[intervencionId]);
const intervenciones = useAppSelector(state => Object.values(state.intervencion.coleccionIntervenciones));
```

### ✅ DO - Usar selectores memoizados para transformaciones complejas

```typescript
// ✅ Correcto - el selector maneja la memoización
const intervencionesOrdenadas = useAppSelector(selectIntervencionesOrdenadas);
const estadisticas = useAppSelector(selectEstadisticasIntervenciones);
```

### ❌ DON'T - Transformar datos en el componente

```typescript
// ❌ Incorrecto - se recalcula en cada render
const intervencionesOrdenadas = intervenciones.sort((a, b) => 
  a.data.NombreInt.localeCompare(b.data.NombreInt)
);
```

### ✅ DO - Combinar selectores para lógica compleja

```typescript
// ✅ Correcto - usar múltiples selectores especializados
const intervenciones = useAppSelector(selectIntervencionesArray);
const soloManoObra = useAppSelector(selectIntervencionesSoloManoObra);
const estadisticas = useAppSelector(selectEstadisticasIntervenciones);
```

### ✅ DO - Usar el patrón de callback para selectores parametrizados

```typescript
// ✅ Correcto
const intervencion = useAppSelector(state => selectIntervencionPorId(state, intervencionId));
const intervencionesModelo = useAppSelector(state => selectIntervencionesPorModeloDrone(state, modeloId));
```

## Selectores Disponibles - Referencia Rápida

| Selector | Descripción | Parámetros |
|----------|-------------|------------|
| `selectColeccionIntervenciones` | Diccionario de intervenciones | - |
| `selectIntervencionesArray` | Array de intervenciones | - |
| `selectIntervencionFilter` | Filtro actual | - |
| `selectTieneIntervenciones` | Si hay intervenciones | - |
| `selectSelectedIntervencion` | Intervención seleccionada | - |
| `selectIsFetchingIntervencion` | Estado de carga | - |
| `selectIntervencionPorId` | Intervención por ID | `id: string` |
| `selectIntervencionesFiltradasPorEstado` | Intervenciones filtradas por estado | - |
| `selectIntervencionesOrdenadas` | Intervenciones ordenadas por nombre | - |
| `selectIntervencionesOrdendasPorPrecio` | Intervenciones ordenadas por precio | - |
| `selectIntervencionesOrdenadasPorDuracion` | Intervenciones ordenadas por duración | - |
| `selectIntervencionesSelectOptions` | Opciones para select | - |
| `selectIntervencionesPorBusqueda` | Intervenciones por búsqueda | `busqueda: string` |
| `selectIntervencionesFiltradas` | Intervenciones filtradas | `filtro?: string` |
| `selectIntervencionesPorModeloDrone` | Intervenciones por modelo | `modeloDroneId: string` |
| `selectIntervencionesPorRangoPrecio` | Intervenciones por rango de precio | `minPrecio: number, maxPrecio: number` |
| `selectIntervencionesPorRangoDuracion` | Intervenciones por rango duración | `minDuracion: number, maxDuracion: number` |
| `selectIntervencionesPorRepuesto` | Intervenciones por repuesto | `repuestoId: string` |
| `selectIntervencionesSoloManoObra` | Intervenciones sin repuestos | - |
| `selectIntervencionesConRepuestos` | Intervenciones con repuestos | - |
| `selectEstadisticasIntervenciones` | Estadísticas de intervenciones | - |
| `selectIntervencionPorNombreExacto` | Intervención por nombre exacto | `nombre: string` |
| `selectTotalIntervenciones` | Total de intervenciones | - |
| `selectExisteIntervencion` | Si existe una intervención | `intervencionId: string` |
