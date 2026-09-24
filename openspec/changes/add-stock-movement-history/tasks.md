## 1. Consulta y contrato

- [x] 1.1 Definir el tipo de movimiento visible en la página del repuesto.
- [x] 1.2 Implementar la consulta por repuesto en los backends soportados y exportarla por
  la fachada de persistencia.
- [x] 1.3 Mapear fecha, tipo, `on_hand_delta`, nota y referencias sin aplicar reglas de
  inventario en persistencia.

## 2. Interfaz

- [x] 2.1 Cargar el historial al abrir un repuesto existente y conservar el estado de carga,
  error y vacío.
- [x] 2.2 Agregar un desplegable accesible con los movimientos ordenados del más reciente al
  más antiguo.
- [x] 2.3 Mostrar claramente entradas, salidas y ajustes sin confundirlos con compromiso.

## 3. Validación

- [x] 3.1 Probar consulta y mapeo de movimientos.
- [ ] 3.2 Probar estados vacío/error y renderizado del desplegable.
- [x] 3.3 Ejecutar tests focalizados, suite completa y build.