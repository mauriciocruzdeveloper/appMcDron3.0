# Módulo de Drones - Redux Toolkit

Este módulo gestiona el estado de los drones en la aplicación McDron 3.0, utilizando un patrón de diccionario optimizado para acceso O(1) por ID.

## 📁 Estructura del Módulo

```
src/redux-tool-kit/drone/
├── drone.slice.ts      # Slice principal con reducers
├── drone.actions.ts    # Acciones asíncronas (thunks)
├── drone.selectors.ts  # Selectores memoizados
├── index.ts           # Exportaciones centralizadas
└── README.md          # Esta documentación
```

## 🏗️ Arquitectura del Estado

### Estado Global
```typescript
interface DroneState {
  coleccionDrones: Drones;          // Diccionario { [id]: Drone }
  selectedDrone: Drone | null;      // Drone seleccionado
  filter: string;                   // Filtro de búsqueda activo
  isFetchingDrone: boolean;        // Estado de carga
}
```

### Estructura de Datos
```typescript
// Tipo base
interface Drone {
  id: string;
  data: DroneData;
}

interface DroneData {
  ModeloDroneId: string; // Referencia al modelo
  Propietario: string;
  Observaciones?: string;
}

// Diccionario optimizado (O(1) acceso por ID)
interface Drones {
  [id: string]: Drone;
}
```

## 🚀 Ventajas del Patrón de Diccionario

### Antes (Array)
```typescript
// ❌ Buscar: O(n) - Lento con muchos drones
const drone = drones.find(d => d.id === droneId);

// ❌ Actualizar: O(n) - Requiere búsqueda + actualización
const index = drones.findIndex(d => d.id === droneId);
if (index !== -1) drones[index] = nuevoDrone;

// ❌ Eliminar: O(n) - Requiere filtrar todo el array
drones = drones.filter(d => d.id !== droneId);
```

### Después (Diccionario)
```typescript
// ✅ Buscar: O(1) - Acceso directo instantáneo
const drone = drones[droneId];

// ✅ Actualizar: O(1) - Asignación directa
drones[droneId] = nuevoDrone;

// ✅ Eliminar: O(1) - Eliminación directa
delete drones[droneId];
```

## 📚 Guía de Uso

### 1. Importación
```typescript
import {
  // Selectores más usados
  selectDroneById,
  selectDronesFiltrados,
  selectDronesOrderedByPropietario,
  
  // Acciones
  setDrones,
  addDrone,
  updateDrone,
  setSelectedDrone,
  
  // Acciones asíncronas
  guardarDroneAsync,
  eliminarDroneAsync,
} from '../redux-tool-kit/drone';
```

### 2. Selectores Básicos

#### Acceso por ID (O(1))
```typescript
// Obtener un drone específico
const drone = useSelector(selectDroneById(droneId));

// Obtener múltiples drones
const drones = useSelector(selectDronesByIds(['id1', 'id2', 'id3']));

// Verificar existencia
const existe = useSelector(selectDroneExists(droneId));
```

#### Conversión a Array (solo cuando sea necesario)
```typescript
// Todos los drones como array
const dronesArray = useSelector(selectDronesArray);

// Solo los IDs
const ids = useSelector(selectDroneIds);
```

### 3. Filtrado y Búsqueda

#### Filtrado General
```typescript
// Drones filtrados por el filtro activo del estado
const filtrados = useSelector(selectDronesFiltrados);

// Búsqueda por término específico
const resultados = useSelector(selectDronesBySearch('DJI'));
```

#### Filtrado por Propietario
```typescript
// Drones de un propietario específico
const dronesJuan = useSelector(selectDronesByPropietario('Juan'));
```

#### Filtrado por Modelo
```typescript
// Drones de un modelo específico
const dronesModelo = useSelector(selectDronesByModelo(modeloId));

// Drones agrupados por modelo
const agrupadosPorModelo = useSelector(selectDronesGroupedByModelo);
// Resultado: { "modelo1": [drone1, drone2], "modelo2": [drone3] }
```

### 4. Ordenamiento

```typescript
// Ordenados por propietario (alfabéticamente)
const porPropietario = useSelector(selectDronesOrderedByPropietario);

// Ordenados por ID
const porId = useSelector(selectDronesOrderedById);

// Por campo específico
const porPropietarioDesc = useSelector(selectDronesOrderBy('Propietario', false));
const porModelo = useSelector(selectDronesOrderBy('ModeloDroneId', true));
```

### 5. Estadísticas

```typescript
// Total de drones
const total = useSelector(selectTotalDrones);

// Por modelo
const estadisticasModelo = useSelector(selectEstadisticasPorModelo);
// Resultado: { "modelo1": 5, "modelo2": 3, "modelo3": 2 }

// Por propietario
const estadisticasPropietario = useSelector(selectEstadisticasPorPropietario);
// Resultado: { "Juan": 3, "María": 2, "Carlos": 1 }
```

### 6. Componentes Específicos

#### Paginación
```typescript
const { items, total, hasMore } = useSelector(
  selectDronesPaginados(currentPage, pageSize)
);
```

#### Dashboard
```typescript
const dashboard = useSelector(selectDronesDashboard);
// Resultado: {
//   total: 20,
//   estadisticasPorModelo: {...},
//   estadisticasPorPropietario: {...},
//   totalModelos: 5,
//   totalPropietarios: 8
// }
```

### 7. Selectores Avanzados

```typescript
// Drones con observaciones
const conObservaciones = useSelector(selectDronesConObservaciones);

// Drones sin observaciones
const sinObservaciones = useSelector(selectDronesSinObservaciones);
```

### 8. Acciones

#### Síncronas
```typescript
// Cargar drones (array → diccionario)
dispatch(setDrones(dronesArray));

// Cargar diccionario directamente
dispatch(setDronesDictionary(dronesDictionary));

// Agregar/Actualizar/Eliminar
dispatch(addDrone(nuevoDrone));
dispatch(updateDrone(droneActualizado));
dispatch(removeDrone(droneId));

// Seleccionar drone
dispatch(setSelectedDrone(drone));

// Filtros
dispatch(setFilter('DJI'));

// Estado de carga
dispatch(setIsFetchingDrone(true));
```

#### Asíncronas
```typescript
// Guardar (crear o actualizar)
dispatch(guardarDroneAsync(drone));

// Eliminar
dispatch(eliminarDroneAsync(droneId));
```

## 🎯 Patrones Recomendados

### ✅ Buenas Prácticas

1. **Usa selectores por ID cuando sea posible**
   ```typescript
   // ✅ Acceso directo O(1)
   const drone = useSelector(selectDroneById(id));
   ```

2. **Evita conversiones innecesarias a array**
   ```typescript
   // ❌ Evitar si no necesitas iterar
   const array = useSelector(selectDronesArray);
   
   // ✅ Mejor: usar selector específico
   const existe = useSelector(selectDroneExists(id));
   ```

3. **Usa selectores memoizados para operaciones costosas**
   ```typescript
   // ✅ Se recalcula solo cuando cambian las dependencias
   const filtrados = useSelector(selectDronesFiltrados);
   ```

4. **Combina selectores para casos específicos**
   ```typescript
   // ✅ Selector personalizado
   const selectDronesDeModeloConObservaciones = createSelector(
     [selectDronesByModelo(modeloId), selectDronesConObservaciones],
     (dronesModelo, dronesConObs) => 
       dronesModelo.filter(drone => dronesConObs.includes(drone))
   );
   ```

### ❌ Anti-patrones

1. **No uses .find() en componentes**
   ```typescript
   // ❌ Nunca hagas esto
   const drones = useSelector(selectDronesArray);
   const drone = drones.find(d => d.id === id);
   
   // ✅ Usa el selector
   const drone = useSelector(selectDroneById(id));
   ```

2. **No filtres manualmente en componentes**
   ```typescript
   // ❌ Filtrado manual
   const todos = useSelector(selectDronesArray);
   const deJuan = todos.filter(d => d.data.Propietario === 'Juan');
   
   // ✅ Usa selector específico
   const deJuan = useSelector(selectDronesByPropietario('Juan'));
   ```

## 🔧 Migración desde Array

Si tienes código que usa el array anterior, aquí están los patrones de migración:

```typescript
// ANTES: Array
const drones = useSelector(state => state.drone.coleccionDrones);

// Buscar
const drone = drones.find(d => d.id === id);

// Filtrar por propietario
const deJuan = drones.filter(d => d.data.Propietario === 'Juan');

// Filtrar por modelo
const delModelo = drones.filter(d => d.data.ModeloDroneId === modeloId);

// DESPUÉS: Diccionario + Selectores
// Buscar (O(1))
const drone = useSelector(selectDroneById(id));

// Filtrar por propietario (memoizado)
const deJuan = useSelector(selectDronesByPropietario('Juan'));

// Filtrar por modelo (memoizado)
const delModelo = useSelector(selectDronesByModelo(modeloId));
```

## 📊 Rendimiento

- **Acceso por ID**: O(1) vs O(n) - hasta 100x más rápido
- **Actualizaciones**: O(1) vs O(n) - sin búsquedas lineales
- **Memoria**: Ligeramente mayor, pero negligible vs beneficios
- **Selectores memoizados**: Se recalculan solo cuando cambian las dependencias

## 🔍 Debugging

```typescript
// Ver estado completo
console.log('Drones:', store.getState().drone.coleccionDrones);

// Ver IDs disponibles
console.log('IDs:', Object.keys(store.getState().drone.coleccionDrones));

// Verificar selector
console.log('Resultado selector:', selectDroneById('123')(store.getState()));
```

## 🎮 Casos de Uso Comunes

### Lista de Drones con Filtro
```typescript
// Componente optimizado
const ListaDrones = () => {
  const dronesOrdenados = useSelector(selectDronesOrderedByPropietario);
  const filtro = useSelector(selectDroneFilter);
  
  // Los drones ya vienen filtrados y ordenados
  return (
    <div>
      {dronesOrdenados.map(drone => (
        <DroneCard key={drone.id} drone={drone} />
      ))}
    </div>
  );
};
```

### Detalle de Drone
```typescript
// Acceso directo O(1)
const DroneDetail = ({ droneId }) => {
  const drone = useSelector(selectDroneById(droneId));
  
  if (!drone) return <div>Drone no encontrado</div>;
  
  return <div>{/* Mostrar detalles */}</div>;
};
```

### Dashboard de Estadísticas
```typescript
const Dashboard = () => {
  const stats = useSelector(selectDronesDashboard);
  
  return (
    <div>
      <h3>Total: {stats.total} drones</h3>
      <h4>Modelos: {stats.totalModelos}</h4>
      <h4>Propietarios: {stats.totalPropietarios}</h4>
    </div>
  );
};
```

---

**Nota**: Este módulo sigue el patrón establecido en los módulos de usuarios, intervenciones, repuestos, modelos de drone y reparaciones. Para dudas o mejoras, consulta la documentación de esos módulos o contacta al equipo de desarrollo.
