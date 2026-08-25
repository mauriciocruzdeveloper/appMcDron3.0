## Context

Una reparación referencia un drone mediante `DroneId`; el drone referencia el catálogo mediante `ModeloDroneId`. `FeFinRep` representa la fecha en la que la reparación pasó a `Reparado`, por lo que permite medir trabajos realmente completados sin confundirlos con consultas o recepciones.

El catálogo de modelos contiene `Fabricante` y `NombreModelo`, pero no una familia explícita. La recomendación debe ser determinista, explicable y útil aunque haya menos cajas que modelos reparados.

## Goals / Non-Goals

- Goals: rankear demanda reciente por modelo, conservar el conteo histórico visible y proponer una distribución concreta para una cantidad de cajas.
- Goals: mantener toda la lógica como funciones puras comprobables.
- Non-Goals: predecir cantidades de cada repuesto, modificar stock, reservar inventario o persistir la distribución física.
- Non-Goals: incorporar aprendizaje automático o crear una taxonomía editable de familias en esta primera versión.

## Decisions

### Puntaje temporal

Cada reparación completada aporta un peso con decaimiento exponencial y vida media de 180 días:

`peso = 2 ^ (-diasDesdeFinalizacion / 180)`

Así, una reparación de hoy aporta `1`, una de hace 180 días aporta `0,5` y una de hace 360 días aporta `0,25`. El puntaje de un modelo es la suma de los pesos de sus reparaciones. Las fechas futuras se tratan como ocurridas hoy.

Solo se consideran reparaciones con `FeFinRep` válida y con una relación resoluble `reparación -> drone -> modelo`. Las reparaciones no resolubles se contabilizan en una advertencia de calidad de datos, pero no se asignan a una caja para evitar mezclar modelos por coincidencias de texto ambiguas.

El orden usa puntaje descendente, luego fecha de reparación más reciente y finalmente fabricante/modelo alfabético para resolver empates de forma estable.

### Familias inferidas

La clave de familia se forma con el fabricante, la serie y el primer número de generación de `NombreModelo`, quitando del comienzo una repetición del fabricante. Los sufijos de variante posteriores a la generación no crean otra familia. Por ejemplo, `Phantom 3 Standard` y `Phantom 3 Pro` producen `DJI / Phantom 3`; `Phantom 4 Pro` produce `DJI / Phantom 4`; `Air 3` y `Air 3S` producen `DJI / Air 3`. Cuando no hay número de generación, se usan los dos primeros términos significativos, como `Autel / EVO Nano`.

Esta familia solo orienta cajas compartidas. La interfaz siempre enumera los modelos exactos incluidos para que una inferencia imperfecta sea visible y no altere los datos del catálogo.

### Asignación de cajas

1. Si no hay modelos con reparaciones, no se proponen asignaciones.
2. Si hay al menos tantas cajas como modelos activos, cada modelo recibe una caja exclusiva y todas las cajas adicionales se distribuyen proporcionalmente según el puntaje, garantizando una caja mínima por modelo y resolviendo restos por mayor fracción.
3. Si hay menos cajas que modelos, se calcula la carga promedio `puntaje total / cantidad de cajas`.
4. En orden de puntaje, recibe caja exclusiva cada modelo cuyo puntaje sea igual o mayor que la carga promedio, reservando al menos una caja compartida mientras queden modelos sin asignar.
5. Los demás modelos se agrupan primero por familia. Si hay más familias que cajas compartidas, las familias de menor puntaje se combinan buscando equilibrar el puntaje acumulado de las cajas.
6. Una sola caja agrupa todos los modelos cuando la cantidad ingresada es uno.

Cada resultado identifica número de caja, tipo `exclusiva` o `compartida`, modelos incluidos, familia cuando corresponda, cantidad histórica y puntaje acumulado. Ninguna caja ingresada queda sin asignación.

### Ubicación de la lógica

El cálculo se implementará en un caso de uso puro o selector de dominio bajo `src/usecases/` o `src/redux-tool-kit/`, y la página se limitará a capturar la cantidad de cajas y representar el resultado. No habrá cálculos de dominio en `persistencia/`.

## Risks / Trade-offs

- Una vida media fija de 180 días privilegia cambios recientes, pero no representa estacionalidad. Se mitiga mostrando también el conteo histórico y explicando la escala del puntaje.
- La familia inferida puede no coincidir con compatibilidad real de repuestos. Se mitiga enumerando modelos exactos y presentando la salida como propuesta, no como asignación automática persistida.
- Las reparaciones legacy sin relaciones válidas quedan fuera del ranking. Se mitiga mostrando cuántas fueron omitidas para facilitar su corrección.

## Validation

- Pruebas unitarias con una fecha de referencia fija para comprobar los pesos `1`, `0,5` y `0,25`.
- Pruebas de asignación con una, menos, igual y más cajas que modelos activos.
- Pruebas de relaciones faltantes, fechas inválidas, empates y agrupamiento por familia.
- Compilación de producción y revisión responsive en mobile y desktop.
