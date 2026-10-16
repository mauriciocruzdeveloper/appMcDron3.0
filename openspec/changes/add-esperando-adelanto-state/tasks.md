## 1. Domain and Metadata
- [x] 1.1 Registrar `Esperando adelanto` en tipos, catalogo y etapas sin renumerar estados existentes.
- [x] 1.2 Permitir entrada solo desde `Aceptado`, retorno a `Aceptado` y cierres validos como en `Repuestos`.
- [x] 1.3 Agregar mensajes de pausa y reanudacion; no exigir ni registrar pago automaticamente.

## 2. Inventory and Persistence
- [x] 2.1 Verificar que demanda y compromiso excluyan `Esperando adelanto` y se recalculen al reanudar.
- [x] 2.2 Excluir la espera de alertas operativas de repuestos faltantes sin ocultar las piezas presupuestadas.
- [x] 2.3 Verificar persistencia simulada y revisar restricciones de estados en el SQL disponible (sin acceso al esquema remoto).

## 3. User Interface
- [x] 3.1 Agregar controles de pausa y retorno manual en la ficha respetando permisos y transiciones.
- [x] 3.2 Mostrar el estado actual en ficha y progreso, y distinguirlo en filtros y contadores existentes.
- [x] 3.3 Mantener accesibles presupuesto, adelanto previsto e intervenciones durante la espera.

## 4. Validation
- [x] 4.1 Probar ciclo repetible, entradas invalidas y prohibicion de saltar desde la espera a `Repuestos` o `Reparado`.
- [x] 4.2 Probar filtrado separado, demanda/compromiso y ausencia de consumo de stock al pausar o reanudar.
- [x] 4.3 Probar que sigue permitido reparar o esperar repuestos sin pasar por la espera de adelanto.
- [x] 4.4 Ejecutar pruebas focalizadas y completas y comprobar controles y texto con pruebas de componentes.

## Manual Follow-Up
- [ ] Inspeccionar una ficha autenticada en escritorio y movil y guardar el nuevo estado en el ambiente de destino.