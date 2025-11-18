# Estado Actual del Componente Reparacion

**Archivo:** `src/components/Reparacion/Reparacion.component.tsx`  
**Líneas:** 1,757  
**Fecha Análisis:** 18 de noviembre de 2025

---

## 📊 Métricas del Componente

| Métrica | Valor | Evaluación |
|---------|-------|------------|
| **Líneas totales** | 1,757 | 🔴 Muy Alto |
| **useState hooks** | 2 | 🟢 Bajo |
| **useEffect hooks** | 3 | 🟡 Medio |
| **Funciones internas** | ~30+ | 🔴 Muy Alto |
| **Imports** | 35 | 🔴 Alto |
| **Secciones de UI** | 12 | 🔴 Alto |
| **Responsabilidades** | 10+ | 🔴 Muy Alto |

---

## 🏗️ Estructura del Componente

### Imports (líneas 1-38)

```typescript
// React Core
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

// Redux
import { useAppSelector, useAppDispatch } from "../../redux-tool-kit/hooks";
import { eliminarReparacionAsync, guardarReparacionAsync } from "../../redux-tool-kit/reparacion/reparacion.actions";
import { selectReparacionById, selectIntervencionesDeReparacionActual } from "../../redux-tool-kit/reparacion";
import { selectUsuarioPorId } from "../../redux-tool-kit/usuario/usuario.selectors";
import { selectDroneById, selectDronesByPropietario } from "../../redux-tool-kit/drone/drone.selectors";
import { selectModeloDronePorId } from "../../redux-tool-kit/modeloDrone/modeloDrone.selectors";

// Actions
import {
    borrarFotoAsync,
    enviarReciboAsync,
    enviarDroneReparadoAsync,
    enviarDroneDiagnosticadoAsync,
    borrarDocumentoAsync,
    subirFotoYActualizarReparacionAsync,
    subirDocumentoYActualizarReparacionAsync,
} from "../../redux-tool-kit/app/app.actions";

// Utils
import { enviarSms, generarAutoDiagnostico, convertTimestampCORTO } from "../../utils/utils";
import { obtenerEstadoSeguro, esEstadoLegacy, obtenerMensajeMigracion } from "../../utils/estadosHelper";
import { enviarEmailVacio } from "../../utils/sendEmails";

// Types
import { Estado } from "../../types/estado";
import { ReparacionType } from "../../types/reparacion";

// Components
import IntervencionesReparacion from '../IntervencionesReparacion.component';
import { ImageGallery } from '../ImageGallery';
import TextareaAutosize from "react-textarea-autosize";

// Data
import { estados } from '../../datos/estados';
```

**Observaciones:**
- ✅ Imports bien organizados por categoría
- ❌ Demasiados imports (35 total)
- ❌ Dependencia directa de muchos módulos

---

### Estado Local (líneas 102-103)

```typescript
const [reparacionOriginal, setReparacionOriginal] = useState<ReparacionType | undefined>(
    isNew ? reparacionVacia : reparacionStore
);
const [reparacion, setReparacion] = useState<ReparacionType | undefined>(
    isNew ? reparacionVacia : reparacionStore
);
```

**Responsabilidades:**
1. `reparacionOriginal` - Mantiene copia para dirty checking
2. `reparacion` - Estado actual del formulario

**Observaciones:**
- ✅ Solo 2 useState (bien contenido)
- ✅ Dirty checking implementado
- ⚠️ Lógica de sincronización con Redux en useEffect

---

### useEffect Hooks (3 totales)

#### useEffect #1: Sincronización con Redux (líneas 122-131)
```typescript
useEffect(() => {
    if (isNew) return;
    if (reparacionStore) {
        setReparacionOriginal(reparacionStore);
        setReparacion(reparacionStore);
    }
}, [reparacionStore, isNew]);
```

**Propósito:** Sincronizar estado local cuando Redux cambia  
**Trigger:** Cambios en `reparacionStore`

#### useEffect #2: Auto-actualizar Modelo Drone (líneas 133-143)
```typescript
useEffect(() => {
    if (reparacion?.data.DroneId && modeloDrone) {
        setReparacion(prev => ({
            ...prev!,
            data: {
                ...prev!.data,
                ModeloDroneNameRep: modeloDrone.data.NombreModelo
            }
        }));
    }
}, [reparacion?.data.DroneId, modeloDrone]);
```

**Propósito:** Actualizar nombre del modelo cuando cambia el drone  
**Trigger:** Cambios en `DroneId` o `modeloDrone`

#### useEffect #3: Scroll Automático (líneas 146-212)
```typescript
useEffect(() => {
    const scrollToSection = () => {
        if (!reparacion) return;
        const estadoInfo = obtenerEstadoSeguro(reparacion.data.EstadoRep);
        
        // Mapeo de estados a IDs de sección
        const seccionPorEstado: Record<string, string> = {
            'Consulta': 'seccion-consulta',
            'Respondido': 'seccion-consulta',
            'Transito': 'seccion-recepcion',
            // ... más mappings
        };
        
        const seccionId = seccionPorEstado[estadoInfo.nombre];
        // ... lógica de scroll
    };
    
    scrollToSection();
}, [reparacion?.data.EstadoRep]);
```

**Propósito:** Scroll automático a sección activa al cambiar estado  
**Líneas:** 66 líneas (¡muy complejo!)  
**Observaciones:**
- ❌ Lógica muy compleja para una sola responsabilidad
- ❌ Hardcoded IDs de secciones
- ❌ Difícil de mantener y testear

---

## 🔧 Funciones Principales

### Gestión de Formulario

#### `changeInputRep(field, value)` (línea 216)
```typescript
const changeInputRep = (field: string, value: string) => {
    setReparacion((prevReparacion) => ({
        ...prevReparacion!,
        data: {
            ...prevReparacion!.data,
            [field]: value,
        },
    }));
};
```
**Propósito:** Actualizar campo individual  
**Uso:** ~50 veces en el componente

#### `handleOnChange(event)` (línea 226)
**Propósito:** Handler genérico para inputs  
**Uso:** Inputs de texto, números, fechas

#### `handleDroneChange(event)` (línea 240)
**Propósito:** Handler especializado para selección de drone

---

### Transiciones de Estado (20+ funciones)

```typescript
// Consulta → Respondido/Transito
const avanzarARespondido = () => setEstado(estados.Respondido);
const avanzarATransito = () => setEstado(estados.Transito);

// Recepción → Revisado
const avanzarARevisado = () => setEstado(estados.Revisado);

// Revisión → Presupuestado
const avanzarAPresupuestado = () => setEstado(estados.Presupuestado);

// Presupuesto → Aceptado/Rechazado
const avanzarAAceptado = () => setEstado(estados.Aceptado);
const avanzarARechazado = () => setEstado(estados.Rechazado);

// Estado Repuestos
const avanzarARepuestos = () => setEstado(estados.Repuestos);
const reanudarDesdeRepuestos = () => setEstado(estadoAnteriorARepuestos);

// Reparación → Reparado/Diagnosticado (con emails)
const avanzarAReparado = async () => {
    await enviarEmailDroneReparado();
    setEstado(estados.Reparado);
};
const avanzarADiagnosticado = async () => {
    await enviarEmailDroneDiagnosticado();
    setEstado(estados.Diagnosticado);
};

// Entrega → Cobrado/Enviado/Finalizado
const avanzarACobrado = () => setEstado(estados.Cobrado);
const avanzarAEnviado = () => setEstado(estados.Enviado);
const avanzarAFinalizado = () => setEstado(estados.Finalizado);
```

**Observaciones:**
- ✅ Nombres descriptivos
- ❌ Mucha duplicación de código
- ❌ No validación antes de transición
- ❌ Lógica de negocio mezclada con UI

---

### Funciones de Validación

#### `puedeAvanzarA(estadoNombre)` (línea 250)
```typescript
const puedeAvanzarA = (estadoNombre: string): boolean => {
    if (!reparacion || !isAdmin) return false;
    
    const estadoActualInfo = obtenerEstadoSeguro(reparacion.data.EstadoRep);
    const estadoObjetivoInfo = obtenerEstadoSeguro(estadoNombre);
    
    // Validaciones específicas por estado
    // ... ~80 líneas de lógica condicional
    
    return true;
};
```

**Complejidad:** ~80 líneas  
**Responsabilidad:** Validar si se puede avanzar a un estado  
**Observaciones:**
- ❌ Lógica de negocio muy compleja
- ❌ Difícil de testear
- ❌ Muchas condiciones anidadas

---

### Gestión de Archivos

```typescript
// Fotos
const subirFoto = (e: ChangeEvent<HTMLInputElement>) => { /* ... */ };
const eliminarFoto = (urlFoto: string) => { /* ... */ };
const seleccionarFotoAntes = (url: string) => { /* ... */ };
const seleccionarFotoDespues = (url: string) => { /* ... */ };

// Documentos
const subirDocumento = (e: ChangeEvent<HTMLInputElement>) => { /* ... */ };
const eliminarDocumento = (urlDoc: string) => { /* ... */ };
```

**Observaciones:**
- ✅ Funciones bien definidas
- ⚠️ Podrían extraerse a un custom hook

---

### Acciones de Usuario

```typescript
// Navegación
const handleCancelar = () => history.goBack();
const handleVolver = () => history.goBack();

// Persistencia
const handleGuardar = async () => { /* ... */ };
const handleEliminar = async () => { /* ... */ };

// Comunicación
const enviarRecibo = async () => { /* ... */ };
const enviarEmailVacioFn = () => { /* ... */ };
const enviarSMS = () => { /* ... */ };

// Diagnóstico IA
const generarAutoDiagnosticoHandler = async () => { /* ... */ };
```

---

## 📐 Secciones de UI (12 totales)

### 1. Header y Navegación (líneas ~800-900)
- Botón volver
- Estado actual (badge)
- Alertas de estado legacy
- Botones de acción rápida (SMS, Email, Eliminar)

### 2. Sección Cliente y Drone (líneas ~900-1000)
- Información del cliente (nombre, apellido, email, teléfono)
- Selección de drone
- Mostrar modelo de drone

### 3. Sección Anotaciones (líneas ~1000-1050)
**Visibilidad:** Solo admin  
**Campos:**
- Anotaciones confidenciales (textarea)
- Enlace Google Drive

### 4. Sección Consulta (líneas ~1050-1150)
**Estado mínimo:** Consulta  
**Campos:**
- Fecha consulta
- Descripción del problema (2000 chars)
- Botón Auto-diagnóstico IA

**Acciones:**
- Avanzar a Respondido
- Avanzar a Tránsito

### 5. Sección Recepción (líneas ~1150-1250)
**Estado mínimo:** Tránsito  
**Campos:**
- Fecha recepción
- Número de serie
- Botón enviar recibo

**Acciones:**
- Avanzar a Revisado

### 6. Sección Revisión (líneas ~1250-1350)
**Estado mínimo:** Revisado  
**Campos:**
- Diagnóstico técnico (textarea)

**Acciones:**
- Avanzar a Presupuestado

### 7. Sección Presupuesto (líneas ~1350-1500)
**Estado mínimo:** Presupuestado  
**Componentes:**
- IntervencionesReparacion (componente externo)
- Presupuesto diagnóstico
- Presupuesto mano de obra
- Presupuesto reparación
- Presupuesto final
- Total intervenciones

**Acciones:**
- Aceptar Presupuesto
- Rechazar Presupuesto

### 8. Sección Reparación (líneas ~1500-1550)
**Estado mínimo:** Aceptado  
**Campos:**
- Descripción técnica reparación

**Acciones:**
- Avanzar a Reparado (envía email)
- Avanzar a Diagnosticado (envía email)

### 9. Sección Estado Repuestos (líneas ~1550-1620)
**Estado especial:** Repuestos  
**Campos:**
- Observaciones repuestos (2000 chars)
- Repuestos solicitados (máx 50)
- Campo legacy TxtRepuestosRep

**Acciones:**
- Pausar por Repuestos
- Reanudar desde Repuestos

### 10. Sección Fotos Antes/Después (líneas ~1620-1680)
**Estado mínimo:** Recibido  
**Funcionalidad:**
- Selector foto "Antes"
- Selector foto "Después"
- Botones para marcar/desmarcar

### 11. Sección Galería de Fotos (líneas ~1680-1720)
**Componente:** ImageGallery  
**Funcionalidad:**
- Subir fotos
- Ver galería
- Eliminar fotos

### 12. Sección Documentos (líneas ~1720-1757)
**Funcionalidad:**
- Subir documentos PDF
- Lista de documentos
- Eliminar documentos

---

## 🔄 Flujos Críticos

### Flujo 1: Alta de Nueva Reparación
```
1. Usuario crea nueva reparación (id="new")
2. Inicializar con reparacionVacia
3. Usuario completa campos requeridos:
   - Email cliente
   - Modelo drone
   - Descripción problema
4. Guardar → dispatch(guardarReparacionAsync)
5. Redirección a lista
```

**Validaciones:**
- Email requerido
- Modelo drone requerido
- Estado inicial: "Consulta"

---

### Flujo 2: Edición de Reparación Existente
```
1. Cargar reparación desde Redux (selectReparacionById)
2. Cargar usuario, drone, modelo (selectores)
3. Sincronizar estado local con Redux (useEffect)
4. Usuario edita campos
5. Dirty checking activo (reparacion !== reparacionOriginal)
6. Guardar → dispatch(guardarReparacionAsync)
```

---

### Flujo 3: Transición de Estado con Email
```
1. Usuario clickea "Avanzar a Reparado"
2. Validar si puede avanzar (puedeAvanzarA)
3. Ejecutar avanzarAReparado():
   a. Enviar email (enviarDroneReparadoAsync)
   b. Cambiar estado
   c. Guardar automáticamente
4. Scroll a nueva sección (useEffect)
```

**Estados con email:**
- Reparado → envía "Drone Reparado"
- Diagnosticado → envía "Drone Diagnosticado"

---

### Flujo 4: Estado Repuestos (Pausar/Reanudar)
```
1. Usuario clickea "Pausar por Repuestos"
2. Guardar estadoAnterior en reparacion.data.EstadoAnterior
3. Cambiar a estados.Repuestos
4. Usuario completa observaciones repuestos
5. Usuario clickea "Reanudar"
6. Restaurar estado anterior
7. Limpiar EstadoAnterior
```

**Edge cases:**
- Si no hay EstadoAnterior, usar "Aceptado" por defecto
- Validar que haya observaciones antes de reanudar

---

### Flujo 5: Subida de Fotos
```
1. Usuario selecciona archivo
2. Validar tamaño/tipo (implementado en action)
3. dispatch(subirFotoYActualizarReparacionAsync)
4. Action sube a servidor
5. Action actualiza reparacion.data.urlsFotos
6. Redux actualiza automáticamente
7. useEffect sincroniza estado local
8. ImageGallery re-renderiza
```

---

## 🐛 Edge Cases Conocidos

### 1. Estados Legacy
**Problema:** Componente debe soportar estados antiguos y nuevos  
**Solución Actual:**
```typescript
const estadoInfo = obtenerEstadoSeguro(reparacion.data.EstadoRep);
if (esEstadoLegacy(estadoInfo.nombre)) {
    // Mostrar alerta warning
}
```

**Estados Legacy:**
- "Reparar" → migrado a "Aceptado"
- "Recibido" → migrado a "Revisado"
- Etc.

---

### 2. Sincronización Estado Local ↔ Redux
**Problema:** Cambios en Redux pueden no reflejarse en estado local  
**Solución Actual:** useEffect que escucha `reparacionStore`

**Edge Cases:**
- Usuario edita localmente
- Otro tab actualiza en Redux
- ¿Sobrescribir cambios locales?

**Comportamiento Actual:** Sobrescribe cambios locales (puede perder datos)

---

### 3. Scroll Automático vs Manual
**Problema:** Usuario hace scroll manual mientras componente intenta auto-scroll  
**Solución Actual:** Timeout de 100ms antes de scroll

**Edge Cases:**
- Secciones colapsadas
- Viewport pequeño
- IDs de sección no encontrados

---

### 4. Estado Repuestos sin EstadoAnterior
**Problema:** Reparaciones antiguas pueden no tener `EstadoAnterior`  
**Solución Actual:** Fallback a "Aceptado"

```typescript
const estadoAnterior = reparacion.data.EstadoAnterior || estados.Aceptado;
```

---

### 5. Múltiples Acciones Asíncronas Simultáneas
**Problema:** Usuario puede clickear múltiples botones rápido  
**Protección Actual:** ❌ No implementada

**Ejemplo:**
1. Usuario clickea "Guardar"
2. Antes que termine, clickea "Avanzar Estado"
3. Race condition en Redux

---

## 🔗 Dependencias Externas

### Componentes
- `IntervencionesReparacion` - Widget de intervenciones (reutilizado en Inicio)
- `ImageGallery` - Galería de fotos con upload
- `TextareaAutosize` - Textarea auto-expandible
- `useModal` - Hook para modales
- `useHistory` - React Router hook

### Redux Slices
- `reparacion` - CRUD reparaciones
- `usuario` - Selectores de usuario
- `drone` - Selectores de drones
- `modeloDrone` - Selectores de modelos
- `app` - Actions globales (upload, emails)
- `intervencion` - Selectores de intervenciones

### Utils
- `estadosHelper` - Helpers de estados (legacy/nuevo)
- `utils` - Utilidades generales
- `sendEmails` - Funciones de envío de emails

---

## 💡 Oportunidades de Mejora Identificadas

### 1. Separación de Responsabilidades
**Actual:** Todo en un archivo  
**Propuesta:** 
- Container: Lógica Redux
- Layout: Estructura visual
- Tabs: Secciones separadas
- Hooks: Lógica reutilizable

### 2. Scroll Automático
**Actual:** 66 líneas de useEffect complejo  
**Propuesta:** Tabs eliminan necesidad de scroll

### 3. Transiciones de Estado
**Actual:** 20+ funciones casi idénticas  
**Propuesta:** Hook `useEstadoTransition` con lógica centralizada

### 4. Validaciones
**Actual:** `puedeAvanzarA` con 80 líneas  
**Propuesta:** Hook `useReparacionValidation` con reglas declarativas

### 5. Gestión de Formulario
**Actual:** `changeInputRep` + dirty checking manual  
**Propuesta:** Hook `useReparacionForm` con dirty tracking automático

### 6. Gestión de Archivos
**Actual:** 6 funciones dispersas  
**Propuesta:** Hook `useFileUpload` unificado

---

## 📝 Conclusiones

### Fortalezas
✅ Funcionalidad completa y probada en producción  
✅ Dirty checking implementado  
✅ Manejo de estados legacy  
✅ Componentes externos bien reutilizados (IntervencionesReparacion)  

### Debilidades Críticas
❌ **1,757 líneas** en un solo archivo  
❌ **Scroll automático de 66 líneas** innecesariamente complejo  
❌ **20+ funciones** de transición de estado casi idénticas  
❌ **Validación de 80 líneas** difícil de mantener  
❌ **Testeo imposible** por acoplamiento  
❌ **Re-renders completos** en cada cambio  

### Riesgos de Mantenimiento
🔴 **Alto Riesgo:** Cambios pequeños impactan áreas grandes  
🔴 **Alto Riesgo:** Nuevos desarrolladores tardan días en entender  
🔴 **Alto Riesgo:** Bugs difíciles de reproducir y fixear  
🔴 **Medio Riesgo:** Performance degradada en dispositivos lentos  

### Recomendación
**✅ Refactorización APROBADA y NECESARIA**

La refactorización propuesta con tabs resolverá:
- ✅ 86% reducción en tamaño de archivo
- ✅ Eliminación de scroll automático complejo
- ✅ Centralización de lógica de estado
- ✅ Testabilidad completa
- ✅ Performance mejorada

---

**Documento generado:** 18 de noviembre de 2025  
**Próximo paso:** Phase 1 - Infraestructura Base
