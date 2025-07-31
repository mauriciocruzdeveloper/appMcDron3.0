# Selectores de Redux - Guía de Uso

## ¿Qué son los Selectores?

Los selectores son funciones que extraen y derivan datos del estado de Redux de manera eficiente. Utilizan memoización para optimizar el rendimiento y evitar re-renderizados innecesarios.

## Ventajas de Usar Selectores

### 1. **Memoización Automática**
Los selectores creados con `createSelector` solo se recalculan cuando sus dependencias cambian.

### 2. **Reutilización de Código**
Los selectores pueden reutilizarse en múltiples componentes sin duplicar lógica.

### 3. **Rendimiento Optimizado**
Evitan cálculos innecesarios y re-renderizados de componentes.

### 4. **Código más Limpio**
Mantienen la lógica de transformación de datos fuera de los componentes.

## Selectores de Repuestos Disponibles

### Selectores Básicos

```typescript
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectRepuestosArray,
  selectRepuestoFilter,
  selectTieneRepuestos 
} from '../redux-tool-kit/repuesto/repuesto.selectors';

// En un componente
const repuestos = useAppSelector(selectRepuestosArray);
const filter = useAppSelector(selectRepuestoFilter);
const hayRepuestos = useAppSelector(selectTieneRepuestos);
```

### Selectores con Parámetros

```typescript
import { selectRepuestoPorId, selectRepuestosFiltrados } from '../redux-tool-kit/repuesto/repuesto.selectors';

// Selector con parámetro - requiere función callback
const repuesto = useAppSelector(state => selectRepuestoPorId(state, 'repuesto-123'));
const repuestosFiltrados = useAppSelector(state => selectRepuestosFiltrados(state, filtroModelo));
```

### Selectores de Estadísticas

```typescript
import { selectEstadisticasRepuestos } from '../redux-tool-kit/repuesto/repuesto.selectors';

const estadisticas = useAppSelector(selectEstadisticasRepuestos);
// Retorna: { total, disponibles, agotados, enPedido, porcentajeDisponibles }
```

### Selectores por Estado de Stock

```typescript
import { 
  selectRepuestosDisponibles,
  selectRepuestosAgotados,
  selectRepuestosEnPedido,
  selectRepuestosStockBajo 
} from '../redux-tool-kit/repuesto/repuesto.selectors';

const disponibles = useAppSelector(selectRepuestosDisponibles);
const agotados = useAppSelector(selectRepuestosAgotados);
const enPedido = useAppSelector(selectRepuestosEnPedido);
const stockBajo = useAppSelector(state => selectRepuestosStockBajo(state, 3)); // umbral de 3
```

### Selectores por Filtros

```typescript
import { 
  selectRepuestosPorModeloDrone,
  selectRepuestosPorProveedor 
} from '../redux-tool-kit/repuesto/repuesto.selectors';

const repuestosModelo = useAppSelector(state => 
  selectRepuestosPorModeloDrone(state, 'modelo-123')
);
const repuestosProveedor = useAppSelector(state => 
  selectRepuestosPorProveedor(state, 'DronePartes')
);
```

## Ejemplo de Uso en Componente

```typescript
import React, { useState } from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { 
  selectRepuestosFiltrados,
  selectEstadisticasRepuestos,
  selectTieneRepuestos 
} from '../redux-tool-kit/repuesto/repuesto.selectors';

export function MiComponente() {
  const [filtroModelo, setFiltroModelo] = useState('');
  
  // Usar selectores
  const tieneRepuestos = useAppSelector(selectTieneRepuestos);
  const estadisticas = useAppSelector(selectEstadisticasRepuestos);
  const repuestosFiltrados = useAppSelector(state => 
    selectRepuestosFiltrados(state, filtroModelo)
  );

  if (!tieneRepuestos) {
    return <div>No hay repuestos cargados</div>;
  }

  return (
    <div>
      <h3>Estadísticas</h3>
      <p>Total: {estadisticas.total}</p>
      <p>Disponibles: {estadisticas.disponibles}</p>
      <p>Agotados: {estadisticas.agotados}</p>
      
      <h3>Repuestos Filtrados</h3>
      {repuestosFiltrados.map(repuesto => (
        <div key={repuesto.id}>{repuesto.data.NombreRepu}</div>
      ))}
    </div>
  );
}
```

## Creando Selectores Personalizados

### Selector Simple

```typescript
import { createSelector } from '@reduxjs/toolkit';

export const selectMiDatoCustom = createSelector(
  [selectRepuestosArray], // dependencia
  (repuestos) => {
    // transformación de datos
    return repuestos.filter(r => r.data.PrecioRepu > 1000);
  }
);
```

### Selector con Parámetros

```typescript
export const selectRepuestosPorRangoPrecio = createSelector(
  [
    selectRepuestosArray,
    (state: RootState, minimo: number) => minimo,
    (state: RootState, minimo: number, maximo: number) => maximo
  ],
  (repuestos, minimo, maximo) => {
    return repuestos.filter(r => 
      r.data.PrecioRepu >= minimo && r.data.PrecioRepu <= maximo
    );
  }
);

// Uso:
const repuestos = useAppSelector(state => 
  selectRepuestosPorRangoPrecio(state, 1000, 5000)
);
```

## Mejores Prácticas

### 1. **Usar Memoización**
Siempre usa `createSelector` para selectores complejos.

### 2. **Mantener Selectores Simples**
Cada selector debe tener una responsabilidad específica.

### 3. **Componer Selectores**
Reutiliza selectores simples para crear otros más complejos.

### 4. **Nomenclatura Consistente**
- `select` + `NombreDelDato`
- `selectTodos` + `Entidad` + `Array`
- `select` + `Entidad` + `Por` + `Criterio`

### 5. **Organización de Archivos**
```
redux-tool-kit/
  repuesto/
    repuesto.slice.ts      # Slice principal
    repuesto.actions.ts    # Acciones async
    repuesto.selectors.ts  # Selectores
    index.ts              # Exportaciones
```

## Migración de useAppSelector a Selectores

### Antes:
```typescript
const repuestos = useAppSelector(state => 
  Object.values(state.repuesto.coleccionRepuestos)
    .filter(r => r.data.StockRepu > 0)
);
```

### Después:
```typescript
const repuestos = useAppSelector(selectRepuestosDisponibles);
```

## Beneficios de la Migración

1. **Rendimiento**: Memoización automática
2. **Mantenibilidad**: Lógica centralizada
3. **Reutilización**: Un selector, múltiples componentes
4. **Testing**: Fácil de testear por separado
5. **TypeScript**: Mejor inferencia de tipos
