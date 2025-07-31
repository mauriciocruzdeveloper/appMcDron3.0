# Módulo de Reparaciones - Redux Toolkit

Este módulo gestiona el estado de las reparaciones de drones en la aplicación McDron 3.0, utilizando un patrón de diccionario optimizado para acceso O(1) por ID.

## 📁 Estructura del Módulo

```
src/redux-tool-kit/reparacion/
├── reparacion.slice.ts      # Slice principal con reducers
├── reparacion.actions.ts    # Acciones asíncronas (thunks)
├── reparacion.selectors.ts  # Selectores memoizados
├── index.ts                # Exportaciones centralizadas
└── README.md               # Esta documentación
```

## 🏗️ Arquitectura del Estado

### Estado Global
```typescript
interface ReparacionState {
  coleccionReparaciones: Reparaciones;  // Diccionario { [id]: ReparacionType }
  filter: Filtro;                      // Filtros activos
  intervencionesDeReparacionActual: Intervencion[];  // Intervenciones de reparación actual
}
```

### Estructura de Datos
```typescript
// Tipo base
interface ReparacionType {
  id: string;
  data: DataReparacion;
}

// Diccionario optimizado (O(1) acceso por ID)
interface Reparaciones {
  [id: string]: ReparacionType;
}
```

## 🚀 Ventajas del Patrón de Diccionario

### Antes (Array)
```typescript
// ❌ Buscar: O(n) - Lento con muchas reparaciones
const reparacion = reparaciones.find(r => r.id === reparacionId);

// ❌ Actualizar: O(n) - Requiere búsqueda + actualización
const index = reparaciones.findIndex(r => r.id === reparacionId);
if (index !== -1) reparaciones[index] = nuevaReparacion;

// ❌ Eliminar: O(n) - Requiere filtrar todo el array
reparaciones = reparaciones.filter(r => r.id !== reparacionId);
```

### Después (Diccionario)
```typescript
// ✅ Buscar: O(1) - Acceso directo instantáneo
const reparacion = reparaciones[reparacionId];

// ✅ Actualizar: O(1) - Asignación directa
reparaciones[reparacionId] = nuevaReparacion;

// ✅ Eliminar: O(1) - Eliminación directa
delete reparaciones[reparacionId];
```

## 📚 Guía de Uso

### 1. Importación
```typescript
import {
  // Selectores más usados
  selectReparacionById,
  selectReparacionesFiltradas,
  selectReparacionesOrdenadas,
  
  // Acciones
  setReparaciones,
  addReparacion,
  updateReparacion,
  
  // Acciones asíncronas
  guardarReparacionAsync,
  eliminarReparacionAsync,
} from '../redux-tool-kit/reparacion';
```

### 2. Selectores Básicos

#### Acceso por ID (O(1))
```typescript
// Obtener una reparación específica
const reparacion = useSelector(selectReparacionById(reparacionId));

// Obtener múltiples reparaciones
const reparaciones = useSelector(selectReparacionesByIds(['id1', 'id2', 'id3']));

// Verificar existencia
const existe = useSelector(selectReparacionExists(reparacionId));
```

#### Conversión a Array (solo cuando sea necesario)
```typescript
// Todas las reparaciones como array
const reparacionesArray = useSelector(selectReparacionesArray);

// Solo los IDs
const ids = useSelector(selectReparacionIds);
```

### 3. Filtrado y Búsqueda

#### Filtrado por Estado
```typescript
// Reparaciones por estado específico
const recibidas = useSelector(selectReparacionesByEstado('Recibido'));
const diagnosticadas = useSelector(selectReparacionesByEstado('Diagnosticado'));

// Estados prioritarios (todos excepto: Entregado, Liquidación, Trabado, Respondido)
const prioritarias = useSelector(selectReparacionesEstadosPrioritarios);

// Pendientes vs Completadas
const pendientes = useSelector(selectReparacionesPendientes);
const completadas = useSelector(selectReparacionesCompletadas);
```

#### Filtrado por Usuario/Cliente
```typescript
// Por ID de usuario
const reparacionesUsuario = useSelector(selectReparacionesByUsuario(usuarioId));

// Por email
const reparacionesEmail = useSelector(selectReparacionesByEmail('usuario@email.com'));
```

#### Filtrado por Drone
```typescript
// Por ID de drone
const reparacionesDrone = useSelector(selectReparacionesByDrone(droneId));

// Por número de serie
const reparacionesSerie = useSelector(selectReparacionesByNumeroSerie('ABC123'));
```

#### Búsqueda de Texto y Filtrado Optimizado
```typescript
// Búsqueda en múltiples campos
const resultados = useSelector(selectReparacionesBySearch('DJI'));

// Reparaciones filtradas (sin ordenamiento)
const filtradas = useSelector(selectReparacionesFiltradas);

// 🚀 RECOMENDADO: Reparaciones filtradas Y ordenadas por prioridad de estado
// Combina filtrado y ordenamiento en una sola operación memoizada
const filtradasYOrdenadas = useSelector(selectReparacionesFitradasYOrdenadas);
```

**Nota sobre el rendimiento**: El selector `selectReparacionesFitradasYOrdenadas` es la opción más eficiente para mostrar listas de reparaciones ya que combina filtrado y ordenamiento en una sola operación memoizada, evitando re-cálculos innecesarios en cada render.

### 4. Ordenamiento

```typescript
// Ordenadas por fecha (más recientes primero)
const ordenadas = useSelector(selectReparacionesOrdenadas);

// Por prioridad
const porPrioridad = useSelector(selectReparacionesByPrioridad);

// Por campo específico
const porEstado = useSelector(selectReparacionesOrderBy('EstadoRep', true));
const porFecha = useSelector(selectReparacionesOrderBy('FeConRep', false));
```

### 5. Filtrado por Fechas

```typescript
// Rango específico
const timestamp1 = new Date('2024-01-01').getTime();
const timestamp2 = new Date('2024-12-31').getTime();
const delAño = useSelector(selectReparacionesByFechas(timestamp1, timestamp2));

// Mes actual
const delMes = useSelector(selectReparacionesMesActual);
```

### 6. Estadísticas

```typescript
// Totales
const total = useSelector(selectTotalReparaciones);
const totalPresupuestos = useSelector(selectTotalPresupuestos);

// Por estado
const estadisticas = useSelector(selectEstadisticasPorEstado);
// Resultado: { "Recibido": 5, "Diagnosticado": 3, "Reparado": 8 }

// Por prioridad
const porPrioridad = useSelector(selectEstadisticasPorPrioridad);
// Resultado: { 1: 10, 2: 5, 3: 2 }
```

### 7. Componentes Específicos

#### Paginación
```typescript
const { items, total, hasMore } = useSelector(
  selectReparacionesPaginadas(currentPage, pageSize)
);
```

#### Dashboard
```typescript
const dashboard = useSelector(selectReparacionesDashboard);
// Resultado: {
//   total: 50,
//   pendientes: 30,
//   completadas: 20,
//   estadisticasPorEstado: {...},
//   totalPresupuestos: 15000,
//   porcentajeCompletadas: 40
// }
```

### 8. Acciones

#### Síncronas
```typescript
// Cargar reparaciones (array → diccionario)
dispatch(setReparaciones(reparacionesArray));

// Cargar diccionario directamente
dispatch(setReparacionesDictionary(reparacionesDictionary));

// Agregar/Actualizar/Eliminar
dispatch(addReparacion(nuevaReparacion));
dispatch(updateReparacion(reparacionActualizada));
dispatch(removeReparacion(reparacionId));

// Filtros
dispatch(setFilter({ search: 'DJI', estadosPrioritarios: true }));
```

#### Asíncronas
```typescript
// Guardar (crear o actualizar)
dispatch(guardarReparacionAsync(reparacion));

// Eliminar
dispatch(eliminarReparacionAsync(reparacionId));
```

## 🎯 Patrones Recomendados

### ✅ Buenas Prácticas

1. **Usa selectores por ID cuando sea posible**
   ```typescript
   // ✅ Acceso directo O(1)
   const reparacion = useSelector(selectReparacionById(id));
   ```

2. **Evita conversiones innecesarias a array**
   ```typescript
   // ❌ Evitar si no necesitas iterar
   const array = useSelector(selectReparacionesArray);
   
   // ✅ Mejor: usar selector específico
   const existe = useSelector(selectReparacionExists(id));
   ```

3. **Usa selectores memoizados para operaciones costosas**
   ```typescript
   // ✅ Se recalcula solo cuando cambian las dependencias
   const filtradas = useSelector(selectReparacionesFiltradas);
   ```

4. **Combina selectores para casos específicos**
   ```typescript
   // ✅ Selector personalizado
   const selectReparacionesUrgentes = createSelector(
     [selectReparacionesByPrioridad],
     (reparaciones) => reparaciones.filter(r => r.data.PrioridadRep >= 3)
   );
   ```

### ❌ Anti-patrones

1. **No uses .find() en componentes**
   ```typescript
   // ❌ Nunca hagas esto
   const reparaciones = useSelector(selectReparacionesArray);
   const reparacion = reparaciones.find(r => r.id === id);
   
   // ✅ Usa el selector
   const reparacion = useSelector(selectReparacionById(id));
   ```

2. **No filtres manualmente en componentes**
   ```typescript
   // ❌ Filtrado manual
   const todas = useSelector(selectReparacionesArray);
   const pendientes = todas.filter(r => r.data.EstadoRep !== 'Entregado');
   
   // ✅ Usa selector específico
   const pendientes = useSelector(selectReparacionesPendientes);
   ```

## 🔧 Migración desde Array

Si tienes código que usa el array anterior, aquí están los patrones de migración:

```typescript
// ANTES: Array
const reparaciones = useSelector(state => state.reparacion.coleccionReparaciones);

// Buscar
const reparacion = reparaciones.find(r => r.id === id);

// Filtrar por estado
const recibidas = reparaciones.filter(r => r.data.EstadoRep === 'Recibido');

// Buscar por usuario
const delUsuario = reparaciones.filter(r => r.data.UsuarioRep === usuarioId);

// DESPUÉS: Diccionario + Selectores
// Buscar (O(1))
const reparacion = useSelector(selectReparacionById(id));

// Filtrar por estado (memoizado)
const recibidas = useSelector(selectReparacionesByEstado('Recibido'));

// Buscar por usuario (memoizado)
const delUsuario = useSelector(selectReparacionesByUsuario(usuarioId));
```

## 📊 Rendimiento

- **Acceso por ID**: O(1) vs O(n) - hasta 100x más rápido
- **Actualizaciones**: O(1) vs O(n) - sin búsquedas lineales
- **Memoria**: Ligeramente mayor, pero negligible vs beneficios
- **Selectores memoizados**: Se recalculan solo cuando cambian las dependencias

## 🔍 Debugging

```typescript
// Ver estado completo
console.log('Reparaciones:', store.getState().reparacion.coleccionReparaciones);

// Ver IDs disponibles
console.log('IDs:', Object.keys(store.getState().reparacion.coleccionReparaciones));

// Verificar selector
console.log('Resultado selector:', selectReparacionById('123')(store.getState()));
```

---

**Nota**: Este módulo sigue el patrón establecido en los módulos de usuarios, intervenciones, repuestos y modelos de drone. Para dudas o mejoras, consulta la documentación de esos módulos o contacta al equipo de desarrollo.
