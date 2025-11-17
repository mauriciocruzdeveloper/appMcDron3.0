# Spec: State Transitions - Estado Repuestos

**Capability:** `state-transitions`  
**Change ID:** `add-repuestos-state`  
**Status:** Draft  

---

## MODIFIED Requirements

### Requirement: REQ-ST-001 - Validación de Transiciones de Estado

El sistema DEBE validar que las transiciones entre estados de reparación sean lógicas y permitidas según las reglas de negocio del taller.

**Rationale:** Prevenir transiciones inválidas que no tienen sentido en el flujo de trabajo real (ej: ir de "Consulta" directamente a "Reparado").

#### Scenario: Transición desde Aceptado a Repuestos

**Given** una reparación en estado "Aceptado"  
**When** el técnico descubre que faltan repuestos necesarios  
**Then** el sistema DEBE permitir cambiar el estado a "Repuestos"  
**And** el cambio DEBE ser válido según `esTransicionValida("Aceptado", "Repuestos")`  
**And** la reparación DEBE aparecer en la lista filtrada de "Repuestos"

**Acceptance Criteria:**
- ✅ La función `esTransicionValida("Aceptado", "Repuestos")` retorna `true`
- ✅ El dropdown de cambio de estado muestra "Repuestos" como opción
- ✅ El cambio persiste en Firestore correctamente
- ✅ Funciona offline y sincroniza después

---

#### Scenario: Transición desde Repuestos a Aceptado

**Given** una reparación en estado "Repuestos"  
**When** los repuestos solicitados llegan al taller  
**Then** el sistema DEBE permitir cambiar el estado de vuelta a "Aceptado"  
**And** el cambio DEBE ser válido según `esTransicionValida("Repuestos", "Aceptado")`  
**And** la reparación DEBE salir de la lista filtrada de "Repuestos"

**Acceptance Criteria:**
- ✅ La función `esTransicionValida("Repuestos", "Aceptado")` retorna `true`
- ✅ El técnico puede retomar el trabajo inmediatamente
- ✅ El histórico de cambios de estado se mantiene
- ✅ Contador de reparaciones en "Repuestos" se decrementa

---

#### Scenario: Ciclo bidireccional ilimitado Aceptado ↔ Repuestos

**Given** una reparación que ya estuvo en "Repuestos" una vez  
**When** se necesitan más repuestos en una etapa posterior de la reparación  
**Then** el sistema DEBE permitir volver a cambiar a "Repuestos"  
**And** DEBE permitir ciclos ilimitados entre estos estados  
**And** cada ciclo DEBE ser rastreado en el histórico

**Acceptance Criteria:**
- ✅ No hay límite de veces que puede ir/volver a "Repuestos"
- ✅ Cada transición se registra correctamente
- ✅ La UI no muestra errores o advertencias por ciclos repetidos

---

#### Scenario: Transición inválida desde Repuestos a Reparado

**Given** una reparación en estado "Repuestos"  
**When** se intenta cambiar directamente a "Reparado"  
**Then** el sistema DEBE rechazar la transición  
**And** `esTransicionValida("Repuestos", "Reparado")` DEBE retornar `false`  
**And** la UI NO DEBE mostrar "Reparado" como opción disponible

**Acceptance Criteria:**
- ✅ La función de validación retorna `false`
- ✅ El dropdown no incluye "Reparado" en las opciones
- ✅ Si se intenta forzar por API, se rechaza

---

#### Scenario: Transición desde Repuestos a Cancelado/Abandonado

**Given** una reparación en estado "Repuestos"  
**When** el cliente decide cancelar o el caso se abandona por tiempo de espera  
**Then** el sistema DEBE permitir cambiar a "Cancelado" o "Abandonado"  
**And** estas transiciones DEBEN ser válidas

**Acceptance Criteria:**
- ✅ `esTransicionValida("Repuestos", "Cancelado")` retorna `true`
- ✅ `esTransicionValida("Repuestos", "Abandonado")` retorna `true`
- ✅ Ambas opciones aparecen en el dropdown

---

## ADDED Requirements

### Requirement: REQ-ST-002 - Estados con Prioridad Alta

Estados que requieren atención inmediata del técnico DEBEN tener `prioridad: 1` para destacarse en visualizaciones y reportes.

**Rationale:** Facilitar la priorización del trabajo técnico basándose en estados que requieren acción inmediata.

#### Scenario: Estado Repuestos tiene alta prioridad

**Given** el estado "Repuestos" en la configuración de estados  
**When** se consulta su metadata  
**Then** la propiedad `prioridad` DEBE ser `1`  
**And** DEBE aparecer destacado en vistas de prioridad  
**And** DEBE incluirse en filtros de "tareas prioritarias"

**Acceptance Criteria:**
- ✅ `estados.Repuestos.prioridad === 1`
- ✅ Aparece en dashboard de tareas prioritarias
- ✅ Se incluye en notificaciones de alta prioridad (futuro)

---

### Requirement: REQ-ST-003 - Metadata de Estado Actualizada

Cada estado DEBE tener metadata completa y actualizada que refleje su rol actual en el sistema, no su rol legacy.

**Rationale:** Evitar confusión entre administradores y desarrolladores sobre qué estados están activos vs. deprecados.

#### Scenario: Estado Repuestos tiene metadata principal (no legacy)

**Given** el estado "Repuestos" en el archivo `estados.ts`  
**When** se consulta su metadata  
**Then** `etapa` DEBE ser un número en el rango principal (1-15), no en rango legacy (100+)  
**And** `accion` DEBE describir la acción actual esperada  
**And** NO DEBE mencionar "migrar" o "retrocompatibilidad"

**Acceptance Criteria:**
- ✅ `estados.Repuestos.etapa === 8` (o número apropiado entre Aceptado y Reparado)
- ✅ `estados.Repuestos.accion === "Esperar llegada de repuestos"`
- ✅ No contiene referencias a legacy en propiedades
- ✅ Enum `Etapas.Repuestos === 8`

---

## Implementation Notes

### Transiciones Permitidas (Mapa Completo)

```typescript
const transicionesPermitidas: Record<string, string[]> = {
  Consulta: ["Respondido", "Cancelado"],
  Respondido: ["Transito", "Rechazado", "Cancelado"],
  Transito: ["Recibido", "Cancelado"],
  Recibido: ["Revisado"],
  Revisado: ["Presupuestado"],
  Presupuestado: ["Aceptado", "Rechazado", "Cancelado"],
  Aceptado: ["Repuestos", "Reparado", "Rechazado", "Cancelado", "Abandonado"], // ← MODIFICADO
  Repuestos: ["Aceptado", "Cancelado", "Abandonado"], // ← AGREGADO
  Rechazado: ["Diagnosticado", "Cancelado", "Abandonado"],
  Reparado: ["Cobrado", "Finalizado"],
  Diagnosticado: ["Cobrado", "Finalizado"],
  Cobrado: ["Enviado", "Finalizado"],
  Enviado: ["Finalizado"],
  Finalizado: [],
  Abandonado: [],
  Cancelado: []
};
```

### Edge Cases

1. **Múltiples ciclos:** Permitido y esperado
2. **Estado inicial "Repuestos":** NO permitido (debe venir de otro estado)
3. **Repuestos sin observaciones:** Permitido (campo opcional)

---

## Related Specs

- `data-model` (campos adicionales)
- `ui-representation` (visualización de transiciones)

---

## Validation

### Unit Tests
```bash
npm test -- --testPathPattern=estadosReparacion.test
```

### Integration Tests
```bash
npm test -- --testPathPattern=CambioEstado.test
```

### Manual Testing
1. Crear reparación en "Aceptado"
2. Cambiar a "Repuestos"
3. Verificar que aparece en filtros
4. Cambiar de vuelta a "Aceptado"
5. Repetir ciclo 3 veces
6. Verificar histórico de cambios
