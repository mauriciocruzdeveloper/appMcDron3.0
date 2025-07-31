# Selectores de Modelos de Drone - Guía de Uso

## ¿Qué son los Selectores de Modelos de Drone?

Los selectores de modelos de drone son funciones que extraen y derivan datos del estado de modelos de drone de manera eficiente. Utilizan memoización para optimizar el rendimiento y evitar re-renderizados innecesarios.

**Estructura del Estado**: La colección de modelos de drone se almacena como un **diccionario** (`{ [id]: ModeloDrone }`) para acceso eficiente por ID, pero los selectores proporcionan arrays cuando es necesario para mantener la facilidad de uso en los componentes.

## Ventajas del Patrón de Diccionario

### ✅ Acceso Directo por ID
```typescript
// ❌ Array - O(n) - buscar linealmente
const modelo = modelos.find(m => m.id === 'modelo-123');

// ✅ Diccionario - O(1) - acceso directo
const modelo = selectModeloDronePorId(state, 'modelo-123');
```

### ✅ Actualizaciones Eficientes
```typescript
// ❌ Array - reemplazar toda la colección
state.coleccionModelosDrone = modelos.map(m => 
  m.id === modeloId ? modeloActualizado : m
);

// ✅ Diccionario - actualización directa
state.coleccionModelosDrone[modeloId] = modeloActualizado;
```

### ✅ Eliminación Eficiente
```typescript
// ❌ Array - filtrar toda la colección
state.coleccionModelosDrone = modelos.filter(m => m.id !== modeloId);

// ✅ Diccionario - eliminación directa
delete state.coleccionModelosDrone[modeloId];
```

### ✅ Mejor Compatibilidad con Normalizacion
El patrón de diccionario es el estándar recomendado por Redux Toolkit para datos normalizados.

## Selectores de Modelos de Drone Disponibles

### Selectores Básicos de Estado

```typescript
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectColeccionModelosDrone,    // Diccionario { [id]: ModeloDrone }
  selectModelosDroneArray,        // Array de ModeloDrone[]
  selectModeloDroneFilter,        // Filtro actual del estado
  selectSelectedModeloDrone,      // Modelo seleccionado
  selectIsFetchingModeloDrone,    // Estado de carga
  selectTieneModelosDrone,        // Boolean si hay modelos
  selectModelosDroneOrdenados     // Array ordenado por nombre
} from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

// En un componente
const coleccionDiccionario = useAppSelector(selectColeccionModelosDrone); // { [id]: ModeloDrone }
const modelos = useAppSelector(selectModelosDroneArray);                  // ModeloDrone[]
const filtro = useAppSelector(selectModeloDroneFilter);                   // string
const modeloSeleccionado = useAppSelector(selectSelectedModeloDrone);     // ModeloDrone | null
const cargando = useAppSelector(selectIsFetchingModeloDrone);            // boolean
const hayModelos = useAppSelector(selectTieneModelosDrone);              // boolean
const modelosOrdenados = useAppSelector(selectModelosDroneOrdenados);    // ModeloDrone[]
```

### Selectores que Usan el Filtro del Estado

```typescript
import { 
  selectModelosDroneFiltradosPorEstado,
  selectModeloDroneFilter 
} from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

// Obtener el filtro actual
const filtroActual = useAppSelector(selectModeloDroneFilter);

// Obtener modelos filtrados automáticamente por el filtro del estado
const modelosFiltrados = useAppSelector(selectModelosDroneFiltradosPorEstado);

// Este selector usa internamente el filtro almacenado en el estado,
// así no necesitas pasar el filtro como parámetro
```

### Selectores con Parámetros

```typescript
import { 
  selectModeloDronePorId, 
  selectModelosDroneFiltrados,
  selectModelosPorFabricante 
} from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

// Selector con parámetro - requiere función callback
const modelo = useAppSelector(state => selectModeloDronePorId(state, 'modelo-123'));
const modelosFiltrados = useAppSelector(state => selectModelosDroneFiltrados(state, 'DJI'));
const modelosDJI = useAppSelector(state => selectModelosPorFabricante(state, 'DJI'));
```

### Selectores de Estadísticas

```typescript
import { selectEstadisticasModelosDrone } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

const estadisticas = useAppSelector(selectEstadisticasModelosDrone);
// Retorna: { total, porFabricante, fabricantesUnicos, precioPromedio, precioMinimo, precioMaximo }
```

### Selectores por Fabricante

```typescript
import { 
  selectFabricantesUnicos,
  selectModelosPorFabricante 
} from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

const fabricantes = useAppSelector(selectFabricantesUnicos);
const modelosDJI = useAppSelector(state => 
  selectModelosPorFabricante(state, 'DJI')
);
```

### Selectores por Precio

```typescript
import { 
  selectModelosPorRangoPrecio 
} from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

const modelosEconomicos = useAppSelector(state => 
  selectModelosPorRangoPrecio(state, 0, 50000)
);
const modelosPremium = useAppSelector(state => 
  selectModelosPorRangoPrecio(state, 100000, 500000)
);
```

### Selectores de Integración con Repuestos

```typescript
import { 
  selectModeloTieneRepuestosDisponibles,
  selectRepuestosDeModelo,
  selectModelosMasPopulares 
} from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

const tieneRepuestos = useAppSelector(state => 
  selectModeloTieneRepuestosDisponibles(state, 'modelo-123')
);
const repuestosDelModelo = useAppSelector(state => 
  selectRepuestosDeModelo(state, 'modelo-123')
);
const modelosPopulares = useAppSelector(state => 
  selectModelosMasPopulares(state, 5) // Top 5
);
```

### Selectores para Formularios

```typescript
import { selectModelosDroneSelect } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

const opcionesSelect = useAppSelector(selectModelosDroneSelect);
// Retorna: [{ value: 'id', label: 'Nombre del Modelo' }, ...]
```

## Ejemplo de Uso en Componente

```typescript
import React, { useState } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectModelosDroneFiltrados,
  selectEstadisticasModelosDrone,
  selectFabricantesUnicos,
  selectTieneModelosDrone 
} from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

export function ListaModelosDrone() {
  const [filtro, setFiltro] = useState('');
  const [fabricanteSeleccionado, setFabricanteSeleccionado] = useState('');
  
  // Usar selectores
  const tieneModelos = useAppSelector(selectTieneModelosDrone);
  const estadisticas = useAppSelector(selectEstadisticasModelosDrone);
  const fabricantes = useAppSelector(selectFabricantesUnicos);
  const modelosFiltrados = useAppSelector(state => 
    selectModelosDroneFiltrados(state, filtro)
  );

  if (!tieneModelos) {
    return <div>No hay modelos de drone cargados</div>;
  }

  return (
    <div>
      <h3>Estadísticas de Modelos</h3>
      <p>Total: {estadisticas.total}</p>
      <p>Fabricantes: {estadisticas.fabricantesUnicos}</p>
      <p>Precio Promedio: ${estadisticas.precioPromedio.toFixed(2)}</p>
      
      <h3>Filtros</h3>
      <input 
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        placeholder="Buscar modelos..."
      />
      
      <select 
        value={fabricanteSeleccionado}
        onChange={(e) => setFabricanteSeleccionado(e.target.value)}
      >
        <option value="">Todos los fabricantes</option>
        {fabricantes.map(fabricante => (
          <option key={fabricante} value={fabricante}>
            {fabricante}
          </option>
        ))}
      </select>
      
      <h3>Modelos</h3>
      {modelosFiltrados.map(modelo => (
        <div key={modelo.id}>
          <h4>{modelo.data.NombreModelo}</h4>
          <p>Fabricante: {modelo.data.Fabricante}</p>
          <p>Precio: ${modelo.data.PrecioReferencia}</p>
        </div>
      ))}
    </div>
  );
}
```

## Selectores Avanzados

### Comparación de Precios

```typescript
import { selectModelosMasCaros, selectModelosMasBaratos } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

const modelosCaros = useAppSelector(state => selectModelosMasCaros(state, 5));
const modelosBaratos = useAppSelector(state => selectModelosMasBaratos(state, 5));
```

### Búsqueda Avanzada

```typescript
import { selectModelosPorRangoPrecio, selectModelosPorNombre } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';

// Buscar modelos en rango de precio específico
const modelosRango = useAppSelector(state => 
  selectModelosPorRangoPrecio(state, 10000, 50000)
);

// Buscar por nombre parcial
const modelosEncontrados = useAppSelector(state => 
  selectModelosPorNombre(state, 'Phantom')
);
```

## Creando Selectores Personalizados para Modelos

### Selector Simple

```typescript
import { createSelector } from '@reduxjs/toolkit';
import { selectModelosDroneArray } from './modeloDrone.selectors';

export const selectModelosProfesionales = createSelector(
  [selectModelosDroneArray],
  (modelos) => {
    // Filtrar modelos profesionales (ejemplo: precio > 100000)
    return modelos.filter(modelo => modelo.data.PrecioReferencia > 100000);
  }
);
```

### Selector con Múltiples Criterios

```typescript
export const selectModelosRecomendados = createSelector(
  [
    selectModelosDroneArray,
    (state: RootState) => state.repuesto.coleccionRepuestos
  ],
  (modelos, repuestos) => {
    return modelos.filter(modelo => {
      // Criterios para recomendar:
      // 1. Precio razonable (entre 20k y 100k)
      const precioRazonable = modelo.data.PrecioReferencia >= 20000 && 
                              modelo.data.PrecioReferencia <= 100000;
      
      // 2. Tiene repuestos disponibles
      const tieneRepuestos = Object.values(repuestos).some(repuesto =>
        repuesto.data.ModelosDroneIds?.includes(modelo.id) && 
        repuesto.data.StockRepu > 0
      );
      
      return precioRazonable && tieneRepuestos;
    });
  }
);
```

## Integración con Otros Módulos

### Con Repuestos

```typescript
// Obtener modelos que tienen repuestos en stock bajo
export const selectModelosConRepuestosStockBajo = createSelector(
  [
    selectModelosDroneArray,
    (state: RootState) => state.repuesto.coleccionRepuestos
  ],
  (modelos, repuestos) => {
    return modelos.filter(modelo => {
      const repuestosDelModelo = Object.values(repuestos).filter(repuesto =>
        repuesto.data.ModelosDroneIds?.includes(modelo.id)
      );
      
      return repuestosDelModelo.some(repuesto => 
        repuesto.data.StockRepu > 0 && repuesto.data.StockRepu <= 5
      );
    });
  }
);
```

### Con Drones

```typescript
// Obtener modelos que tienen drones asociados
export const selectModelosConDrones = createSelector(
  [
    selectModelosDroneArray,
    (state: RootState) => state.drone.coleccionDrones
  ],
  (modelos, drones) => {
    return modelos.filter(modelo =>
      Object.values(drones).some(drone =>
        drone.data.ModeloDroneId === modelo.id
      )
    );
  }
);
```

## Mejores Prácticas para Modelos de Drone

### 1. **Usar Selectores Específicos**
```typescript
// ✅ Bueno - específico
const modelosDJI = useAppSelector(state => selectModelosPorFabricante(state, 'DJI'));

// ❌ Malo - filtrado en componente
const modelosDJI = useAppSelector(selectModelosDroneArray).filter(m => m.data.Fabricante === 'DJI');
```

### 2. **Combinar Selectores**
```typescript
// ✅ Bueno - reutilizar selectores
export const selectModelosCarosConRepuestos = createSelector(
  [selectModelosMasCaros, (state: RootState) => state.repuesto.coleccionRepuestos],
  (modelosCaros, repuestos) => {
    // lógica de combinación
  }
);
```

### 3. **Memoización Eficiente**
```typescript
// ✅ Bueno - memoizado
const modelosFiltrados = useAppSelector(state => 
  selectModelosDroneFiltrados(state, filtroActual)
);

// ❌ Malo - se recalcula en cada render
const modelosFiltrados = useMemo(() => 
  modelos.filter(m => m.data.NombreModelo.includes(filtroActual)), 
  [modelos, filtroActual]
);
```

## Beneficios Específicos para Modelos de Drone

1. **🔍 Búsqueda Optimizada**: Filtrado rápido por fabricante, precio, nombre
2. **📊 Estadísticas Automáticas**: Información de precios y distribución por fabricante
3. **🔗 Integración**: Conexión automática con repuestos y drones
4. **💰 Análisis de Precios**: Comparaciones y rangos de precios
5. **🎯 Recomendaciones**: Modelos sugeridos basados en criterios múltiples
