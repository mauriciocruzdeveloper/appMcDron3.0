## 1. Implementation
- [x] 1.1 Quitar `Rechazado` de `transicionesPermitidas.Aceptado` (dominio)
- [x] 1.2 Mantener bloqueo Aceptado ⇄ Rechazado en `selectPuedeAvanzarA` (defensa en profundidad)
- [x] 1.3 Agregar botón "Cancelar Reparación" en `ReparacionPresupuesto` vía `selectPuedeAvanzarA('Cancelado')`
- [x] 1.4 Tests: Aceptado -> Cancelado válido; Aceptado -> Rechazado inválido (45 tests pasando)
- [x] 1.5 Verificar liberación de compromiso de stock al cancelar (ya cubierta por `cambiarEstadoReparacionAsync`)
