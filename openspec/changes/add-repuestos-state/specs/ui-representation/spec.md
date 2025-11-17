# Spec: UI Representation - Estado Repuestos

**Capability:** `ui-representation`  
**Change ID:** `add-repuestos-state`  
**Status:** Draft  

---

## ADDED Requirements

### Requirement: REQ-UI-001 - Badge Visual para Estado Repuestos

El estado "Repuestos" DEBE tener una representación visual distintiva que lo diferencie claramente de otros estados, especialmente de "Aceptado".

**Rationale:** Permitir identificación rápida y visual de reparaciones bloqueadas por falta de repuestos.

#### Scenario: Badge en lista de reparaciones

**Given** una lista de reparaciones con al menos una en estado "Repuestos"  
**When** la lista se renderiza  
**Then** el badge del estado DEBE mostrar:
- Color de fondo: `#009688` (verde azulado)
- Ícono: `BoxSeam` de react-bootstrap-icons
- Texto: "Repuestos"
- Borde redondeado y padding adecuado

**Acceptance Criteria:**
- ✅ Color exacto: `#009688`
- ✅ Ícono visible a la izquierda del texto
- ✅ Contraste suficiente para legibilidad (WCAG AA)
- ✅ Responsive en móvil y desktop

**Visual Mock:**
```
┌────────────────────────┐
│ 📦 Repuestos           │  ← Color #009688
└────────────────────────┘
```

---

#### Scenario: Badge en detalle de reparación

**Given** el detalle de una reparación en estado "Repuestos"  
**When** se muestra el estado actual  
**Then** el badge DEBE usar el mismo estilo que en la lista  
**And** DEBE ser más grande (variant="lg" o similar)  
**And** PUEDE incluir tooltip con información adicional

**Acceptance Criteria:**
- ✅ Consistencia visual con lista
- ✅ Tamaño apropiado para contexto de detalle
- ✅ Tooltip opcional con "Esperando llegada de repuestos"

---

### Requirement: REQ-UI-002 - Componente de Cambio de Estado

El componente de cambio de estado DEBE adaptar su UI dinámicamente según el estado seleccionado, mostrando campos adicionales para "Repuestos".

**Rationale:** Capturar información contextual relevante solo cuando es necesaria.

#### Scenario: Cambiar de Aceptado a Repuestos

**Given** una reparación en estado "Aceptado"  
**When** el técnico selecciona "Repuestos" en el dropdown  
**Then** el formulario DEBE mostrar campos adicionales:
- Textarea para `ObsRepuestos` (opcional, placeholder sugerente)
- Selector múltiple para `RepuestosSolicitados` (opcional)
- Botón "Guardar" habilitado
- Mensaje informativo sobre qué significa este estado

**Acceptance Criteria:**
- ✅ Campos adicionales aparecen solo para estado "Repuestos"
- ✅ Textarea tiene mínimo 3 filas de alto
- ✅ Placeholder: "Detalle qué repuestos se necesitan..."
- ✅ Selector carga repuestos disponibles desde Firestore
- ✅ Contador de caracteres visible (opcional)
- ✅ Mensaje: "⚠️ La reparación quedará pausada hasta que lleguen los repuestos"

**Visual Mock:**
```
┌─────────────────────────────────────────┐
│ Cambiar Estado de Reparación            │
├─────────────────────────────────────────┤
│                                          │
│ Estado Actual: Aceptado                  │
│                                          │
│ Nuevo Estado: [Repuestos ▼]             │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Repuestos Solicitados               │ │
│ │ [Select multiple...]                │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ Observaciones                        │ │
│ │ Detalle qué repuestos se necesitan...│ │
│ │                                      │ │
│ │                                      │ │
│ └─────────────────────────────────────┘ │
│                                          │
│ ⚠️ La reparación quedará pausada hasta  │
│    que lleguen los repuestos            │
│                                          │
│      [Cancelar]  [Cambiar Estado]       │
└─────────────────────────────────────────┘
```

---

#### Scenario: Cambiar de Repuestos a Aceptado

**Given** una reparación en estado "Repuestos"  
**When** el técnico selecciona "Aceptado" en el dropdown  
**Then** el formulario DEBE mostrar mensaje confirmativo:
- "✅ Los repuestos han llegado y se retomará la reparación"
- NO mostrar campos adicionales (ya se capturaron antes)
- Botón "Cambiar Estado" habilitado

**Acceptance Criteria:**
- ✅ Mensaje de confirmación visible
- ✅ Color verde para indicar acción positiva
- ✅ No se pierden los datos de `ObsRepuestos` y `RepuestosSolicitados`
- ✅ Cambio es inmediato al confirmar

**Visual Mock:**
```
┌─────────────────────────────────────────┐
│ Cambiar Estado de Reparación            │
├─────────────────────────────────────────┤
│                                          │
│ Estado Actual: Repuestos                 │
│                                          │
│ Nuevo Estado: [Aceptado ▼]              │
│                                          │
│ ┌─────────────────────────────────────┐ │
│ │ ✅ Los repuestos han llegado y se    │ │
│ │    retomará la reparación            │ │
│ └─────────────────────────────────────┘ │
│                                          │
│      [Cancelar]  [Cambiar Estado]       │
└─────────────────────────────────────────┘
```

---

### Requirement: REQ-UI-003 - Dashboard Widget de Repuestos

El dashboard principal DEBE incluir un widget que muestre rápidamente cuántas reparaciones están esperando repuestos.

**Rationale:** Visibilidad inmediata de reparaciones bloqueadas para planificación y seguimiento.

#### Scenario: Widget con reparaciones en espera

**Given** existen 3 reparaciones en estado "Repuestos"  
**When** se renderiza el dashboard  
**Then** el widget DEBE mostrar:
- Título: "📦 Esperando Repuestos"
- Contador grande: "3"
- Lista de reparaciones con:
  - Número de reparación
  - Modelo de drone
  - Observaciones (si existen)
  - Badge "En espera"
- Link para ver todas

**Acceptance Criteria:**
- ✅ Widget visible en dashboard principal
- ✅ Actualización en tiempo real (Firebase listeners)
- ✅ Color de fondo suave (#009688 con alpha 0.1)
- ✅ Máximo 5 reparaciones visibles, resto en "Ver todas"
- ✅ Click en reparación abre detalle

**Visual Mock:**
```
┌────────────────────────────────────────┐
│ 📦 Esperando Repuestos           [>]   │
├────────────────────────────────────────┤
│                                        │
│         3                              │
│    Reparaciones                        │
│                                        │
├────────────────────────────────────────┤
│ #1234 - DJI Mini 3 Pro      [En espera]│
│ Motor delantero izquierdo              │
├────────────────────────────────────────┤
│ #1235 - Mavic 3             [En espera]│
│ Cámara gimbal                          │
├────────────────────────────────────────┤
│ #1238 - Air 2S              [En espera]│
│                                        │
└────────────────────────────────────────┘
```

---

#### Scenario: Widget sin reparaciones en espera

**Given** NO existen reparaciones en estado "Repuestos"  
**When** se renderiza el dashboard  
**Then** el widget NO DEBE renderizarse  
**Or** alternativamente, mostrar mensaje: "✅ No hay reparaciones esperando repuestos"

**Acceptance Criteria:**
- ✅ Widget oculto cuando contador es 0 (preferido)
- ✅ O mensaje positivo de estado ok
- ✅ No ocupa espacio visual innecesario

---

### Requirement: REQ-UI-004 - Filtros de Estado

Los filtros de estado en lista de reparaciones DEBEN incluir "Repuestos" como opción seleccionable.

**Rationale:** Permitir ver solo reparaciones bloqueadas por repuestos.

#### Scenario: Filtrar por estado Repuestos

**Given** una lista de reparaciones con múltiples estados  
**When** el usuario selecciona filtro "Repuestos"  
**Then** la lista DEBE mostrar solo reparaciones en ese estado  
**And** el contador DEBE actualizarse  
**And** el filtro DEBE persistir en navegación

**Acceptance Criteria:**
- ✅ "Repuestos" aparece en dropdown de filtros
- ✅ Filtro funciona correctamente
- ✅ Contador muestra cantidad filtrada
- ✅ Se puede combinar con otros filtros (ej: modelo de drone)
- ✅ URL refleja filtro activo (opcional pero recomendado)

---

### Requirement: REQ-UI-005 - Detalle de Reparación

La vista de detalle de reparación DEBE mostrar información completa sobre repuestos cuando el estado es "Repuestos".

**Rationale:** Proporcionar contexto completo al técnico sobre qué se está esperando.

#### Scenario: Detalle de reparación en Repuestos

**Given** una reparación en estado "Repuestos" con observaciones  
**When** se abre el detalle  
**Then** DEBE mostrarse una sección destacada con:
- Título: "Repuestos Solicitados"
- Observaciones en texto legible
- Lista de repuestos (si existen IDs)
- Botón: "Marcar como Recibidos"
- Ícono de alerta o información

**Acceptance Criteria:**
- ✅ Sección visible solo cuando estado es "Repuestos"
- ✅ Observaciones formateadas (saltos de línea respetados)
- ✅ Repuestos muestran nombre (no solo ID)
- ✅ Botón "Marcar como Recibidos" cambia estado a "Aceptado"
- ✅ Sección destacada visualmente (borde o fondo suave)

**Visual Mock:**
```
┌────────────────────────────────────────┐
│ Reparación #1234                       │
│ Estado: 📦 Repuestos                   │
├────────────────────────────────────────┤
│                                        │
│ ╔══════════════════════════════════╗  │
│ ║ ⚠️  Repuestos Solicitados         ║  │
│ ╠══════════════════════════════════╣  │
│ ║                                  ║  │
│ ║ Observaciones:                   ║  │
│ ║ Motor delantero izquierdo DJI    ║  │
│ ║ Mini 3 Pro, tornillos M2x6 (x4)  ║  │
│ ║                                  ║  │
│ ║ Repuestos:                       ║  │
│ ║ • Motor DJI Mini 3 Pro - Front L ║  │
│ ║ • Tornillo M2x6 (pack x10)       ║  │
│ ║                                  ║  │
│ ║     [✓ Marcar como Recibidos]    ║  │
│ ╚══════════════════════════════════╝  │
│                                        │
│ Información General                    │
│ ...                                    │
└────────────────────────────────────────┘
```

---

## MODIFIED Requirements

### Requirement: REQ-UI-006 - Dropdown de Estados Disponibles

El dropdown de selección de estados DEBE filtrar dinámicamente las opciones según el estado actual de la reparación.

**Rationale:** Prevenir transiciones inválidas desde la UI.

#### Scenario: Opciones desde estado Aceptado

**Given** una reparación en estado "Aceptado"  
**When** se abre el dropdown de cambio de estado  
**Then** las opciones DEBEN incluir:
- Repuestos ← NUEVO
- Reparado
- Rechazado
- Cancelado
- Abandonado

**And** NO DEBEN incluir:
- Consulta
- Transito
- Recibido
- etc. (estados previos o no permitidos)

**Acceptance Criteria:**
- ✅ Solo estados válidos según `esTransicionValida()`
- ✅ "Repuestos" aparece como opción desde "Aceptado"
- ✅ Orden lógico de opciones (primero las más comunes)

---

## Accessibility (A11Y)

### Color Contrast
- Badge #009688 con texto blanco: **Ratio 4.5:1** ✅ (WCAG AA)
- Verificar con herramientas de contraste

### Keyboard Navigation
- Dropdown de estados: navegable con teclado
- Textarea: foco visible
- Botones: accesibles con Tab + Enter

### Screen Readers
- Badge: `aria-label="Estado: Repuestos"`
- Dropdown: `aria-describedby` para mensajes contextuales
- Widget: encabezado semántico `<h3>`

---

## Responsive Design

### Mobile (< 768px)
- Badge: tamaño reducido pero legible
- Widget: ancho completo, lista vertical
- Formulario de cambio: campos apilados verticalmente
- Textarea: altura automática

### Tablet (768px - 1024px)
- Widget: 50% ancho en grid de 2 columnas
- Formulario: modal centrado

### Desktop (> 1024px)
- Widget: 33% ancho en grid de 3 columnas
- Formulario: modal con ancho máximo 600px

---

## Performance

### Lazy Loading
- Selector de repuestos: cargar opciones solo al abrir
- Widget: suscripción Firebase solo si está visible

### Memoization
- Badge component: `React.memo()` para evitar re-renders
- Selector: `useMemo()` para filtrar estados disponibles

### Optimization
```typescript
// Ejemplo de optimización
const EstadoBadge = React.memo(({ estado }: { estado: string }) => {
  if (estado === "Repuestos") {
    return (
      <Badge bg="info" style={{ backgroundColor: "#009688" }}>
        <BoxSeam className="me-2" />
        Repuestos
      </Badge>
    );
  }
  // ...otros estados
});
```

---

## Related Specs

- `state-transitions` (validación de estados disponibles)
- `data-model` (campos a mostrar)

---

## Validation

### Visual Testing
```bash
npm start
# Checklist manual:
# ✅ Badge se ve correcto en lista
# ✅ Formulario de cambio muestra campos adicionales
# ✅ Widget aparece en dashboard
# ✅ Filtros funcionan
# ✅ Detalle muestra sección de repuestos
```

### Accessibility Testing
```bash
npm run test:a11y
# O usar herramientas manuales:
# - axe DevTools
# - WAVE
# - Lighthouse
```

### Cross-browser Testing
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (si disponible)
- ✅ Android WebView (Cordova)

### Responsive Testing
```bash
# Usar DevTools responsive mode
# Probar en:
# - iPhone SE (375px)
# - iPad (768px)
# - Desktop (1920px)
```
