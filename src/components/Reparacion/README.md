# Componente de Reparación

## Descripción General

El componente `Reparacion.component.tsx` es responsable de gestionar todo el ciclo de vida de una reparación de drones, desde la consulta inicial hasta la finalización del proceso. Implementa un sistema de estados progresivos que determina qué secciones y campos están disponibles en cada momento del proceso.

## Estados de Reparación

El sistema maneja 11 estados principales organizados en etapas progresivas:

### Estados Activos (Sistema Actual)

| Estado | Etapa | Prioridad | Acción | Color | Descripción |
|--------|-------|-----------|---------|-------|-------------|
| **Consulta** | 1 | 1 | Responder consulta | #ff9500 | Estado inicial cuando el cliente hace una consulta |
| **Respondido** | 2 | 3 | Esperar decisión del cliente | #5ac8fa | Se ha respondido la consulta, esperando respuesta |
| **Transito** | 3 | 2 | Esperar a que llegue | #cddc39 | El drone está en camino al taller |
| **Recibido** | 4 | 1 | Revisar | #ffcc00 | El drone ha llegado al taller |
| **Revisado** | 5 | 1 | Presupuestar | #ff6b22 | Se ha completado la revisión técnica |
| **Presupuestado** | 6 | 2 | Esperar decisión de cliente | #ff2d55 | Se ha enviado el presupuesto |
| **Aceptado** | 7 | 1 | Reparar | #007aff | El cliente aceptó el presupuesto |
| **Reparado** | 10 | 3 | Cobrar reparación | #34c759 | Se completó la reparación |
| **Cobrado** | 12 | 4 | Enviar al cliente | #673ab7 | Se ha cobrado el servicio |
| **Enviado** | 13 | 3 | Esperar confirmación de entrega | #af52de | El drone está en camino al cliente |
| **Finalizado** | 14 | 5 | Proceso completado | #8e8e93 | Proceso completamente terminado |

### Estados Legacy (Sistema Anterior)

Estos estados se mantienen por retrocompatibilidad pero se recomienda migrarlos:

- **Entregado** → Migrar a "Finalizado"
- **Reparar** → Migrar a "Aceptado"
- **Repuestos** → Migrar a "Aceptado"

## Secciones del Formulario

### 1. CONSULTA (Etapa ≥ 1)
**Campos:**
- `FeConRep` - Fecha de consulta (automática)
- `EmailUsu` - Email del cliente (heredado del usuario)
- `NombreUsu` - Nombre del cliente (heredado del usuario)
- `ApellidoUsu` - Apellido del cliente (heredado del usuario)
- `TelefonoUsu` - Teléfono del cliente (heredado del usuario)
- `DroneId` - Selección del drone del cliente
- `ModeloDroneNameRep` - Modelo del drone (automático)
- `DescripcionUsuRep` - Descripción de los desperfectos
- `DiagnosticoRep` - Autodiagnóstico generado

**Funcionalidades:**
- Envío de emails al cliente
- Envío de SMS al cliente
- Generación automática de diagnóstico
- Navegación al perfil del cliente

**Botones de Avance (Solo Admin):**
- "Marcar como Respondido" → Estado: Respondido
- "Marcar en Tránsito" → Estado: Transito

### 2. RECEPCIÓN (Etapa ≥ 3)
**Campos:**
- `FeRecRep` - Fecha de recepción

**Funcionalidades:**
- Envío de recibo por email
- Alerta de estado actual si no está recibido

**Botones de Avance (Solo Admin):**
- "Marcar como Recibido" → Estado: Recibido

### 3. REVISIÓN (Etapa ≥ 4)
**Campos:**
- `NumeroSerieRep` - Número de serie del drone
- `DescripcionTecRep` - Observaciones del técnico

**Botones de Avance (Solo Admin):**
- "Marcar como Revisado" → Estado: Revisado

### 4. PRESUPUESTO (Etapa ≥ 5)
**Campos:**
- `IntervencionesIds` - Lista de intervenciones aplicadas
- `PresuMoRep` - Presupuesto mano de obra
- `PresuReRep` - Presupuesto repuestos
- `PresuFiRep` - Presupuesto final (calculado automáticamente)
- `PresuDiRep` - Costo del diagnóstico

**Funcionalidades:**
- Gestión de intervenciones con precios
- Cálculo automático del precio final
- Visualización del total de intervenciones

**Botones de Avance (Solo Admin):**
- "Marcar como Presupuestado" → Estado: Presupuestado
- "Presupuesto Aceptado" → Estado: Aceptado

### 5. REPUESTOS (Etapa ≥ 7, Solo Admin)
**Campos:**
- `TxtRepuestosRep` - Seguimiento de repuestos y transportistas

### 6. REPARAR (Etapa ≥ 7)
**Campos:**
- `DescripcionTecRep` - Informe de reparación
- `FeFinRep` - Fecha de finalización

**Botones de Avance (Solo Admin):**
- "Marcar como Reparado" → Estado: Reparado

### 7. ENTREGA (Etapa ≥ 10)
**Campos:**
- `FeEntRep` - Fecha de entrega
- `TxtEntregaRep` - Detalles de entrega (cliente, comisionista, correo)
- `SeguimientoEntregaRep` - Número de seguimiento

**Botones de Avance (Solo Admin):**
- "Marcar como Cobrado" → Estado: Cobrado
- "Marcar como Enviado" → Estado: Enviado
- "Finalizar Reparación" → Estado: Finalizado

### 8. FOTOS (Siempre Visible)
**Funcionalidades:**
- Subida de fotos con preview
- Visualización en modal ampliado
- Descarga de fotos
- Eliminación de fotos (Solo Admin)

### 9. DOCUMENTOS (Siempre Visible)
**Funcionalidades:**
- Subida de documentos
- Descarga de documentos
- Eliminación de documentos (Solo Admin)
- Visualización del nombre de archivo

## Secciones Administrativas (Solo Admin)

### ENLACE A DRIVE
**Campos:**
- `DriveRep` - Enlace a carpeta de Google Drive

### ANOTACIONES CONFIDENCIALES
**Campos:**
- `AnotacionesRep` - Notas internas del taller

## Permisos y Visibilidad

### Administrador
- Ve todas las secciones en todo momento
- Puede editar todos los campos
- Puede avanzar estados
- Puede eliminar fotos y documentos
- Puede guardar y eliminar reparaciones

### Usuario Regular
- Ve secciones según la etapa actual
- Campos en modo solo lectura
- No puede avanzar estados
- No puede eliminar contenido

## Dinámicas del Sistema

### Flujo Normal de Estados
1. **Consulta** → Cliente hace consulta inicial
2. **Respondido** → Se responde al cliente
3. **Transito** → Drone en camino al taller
4. **Recibido** → Drone llega al taller
5. **Revisado** → Se completa revisión técnica
6. **Presupuestado** → Se envía presupuesto
7. **Aceptado** → Cliente acepta presupuesto
8. **Reparado** → Se completa reparación
9. **Cobrado** → Se cobra el servicio
10. **Enviado** → Se envía drone al cliente
11. **Finalizado** → Proceso completado

### Reglas de Negocio

1. **Progresión Lineal**: Solo se puede avanzar al siguiente estado en la secuencia
2. **Campos Automáticos**: Algunos campos se completan automáticamente:
   - Fechas se setean al avanzar estados
   - Modelo de drone se obtiene del drone seleccionado
   - Precio final se calcula desde intervenciones
3. **Validaciones**: 
   - Estado "Recibido" requiere diagnóstico antes de guardar
   - No se puede retroceder a estados anteriores
4. **Visibilidad Progresiva**: Las secciones aparecen según el estado actual

### Integraciones

- **Redux Store**: Gestión centralizada del estado
- **Firebase**: Almacenamiento de fotos y documentos
- **Email Service**: Envío de notificaciones
- **SMS Service**: Comunicación directa con clientes

## Tipos de Datos

### ReparacionType
Estructura principal que contiene todos los campos de la reparación.

### Estado
Objeto que define las propiedades de cada estado (nombre, etapa, color, etc.).

## Componentes Relacionados

- `IntervencionesReparacion.component` - Gestión de intervenciones
- `Modal` - Confirmaciones y alertas
- `EstadoLegacyAlert.component` - Alertas para estados legacy

## Uso del Componente

```tsx
// Para crear nueva reparación
<Route path="/inicio/reparaciones/new" component={ReparacionComponent} />

// Para editar reparación existente
<Route path="/inicio/reparaciones/:id" component={ReparacionComponent} />
```

## Consideraciones de Performance

- Uso de selectores optimizados de Redux
- Lazy loading de imágenes
- Cálculos automáticos memoizados
- Validación en tiempo real

## Mantenimiento

Para agregar nuevos estados:
1. Actualizar el archivo `estados.ts`
2. Modificar la función `obtenerSeccionesAMostrar`
3. Agregar las validaciones correspondientes
4. Actualizar esta documentación
