# Validación de Fechas en Estados de Reparación

## 📋 Resumen

Se implementó validación automática de fechas obligatorias al cambiar estados de reparación, asegurando que:
- **Reparado**: Siempre tenga `completion_date` (fecha de finalización)
- **Finalizado**: Siempre tenga `delivery_date` (fecha de entrega) Y `completion_date`

## 🔧 Cambios Implementados

### 1. Action: `cambiarEstadoReparacionAsync`
**Archivo**: `src/redux-tool-kit/reparacion/reparacion.actions.ts`

#### Validaciones Agregadas:

**Estado: Reparado**
```typescript
// ⚡ LÓGICA ESPECIAL PARA REPARADO: completion_date es OBLIGATORIA
if (nuevoEstado === 'Reparado' && !dataActualizada.FeFinRep) {
  dataActualizada.FeFinRep = new Date().getTime();
}
```
- Si se marca como "Reparado" sin fecha de finalización, se establece automáticamente
- Garantiza que `FeFinRep` (completion_date en Supabase) siempre tenga valor

**Estado: Finalizado**
```typescript
// ⚡ LÓGICA ESPECIAL PARA FINALIZADO: completion_date y delivery_date son OBLIGATORIAS
if (nuevoEstado === 'Finalizado') {
  // Asegurar que tiene delivery_date
  if (!dataActualizada.FeEntRep) {
    dataActualizada.FeEntRep = new Date().getTime();
  }

  // Si no tiene completion_date, usar delivery_date como fallback
  if (!dataActualizada.FeFinRep) {
    dataActualizada.FeFinRep = dataActualizada.FeEntRep;
    usedDeliveryDateAsFallback = true;
  }
}
```
- Garantiza que `FeEntRep` (delivery_date) siempre tenga valor
- Si falta `FeFinRep` (completion_date), usa `FeEntRep` como fallback
- Retorna flag `usedDeliveryDateAsFallback` para notificar al usuario

### 2. Componente: `ReparacionEntrega`
**Archivo**: `src/components/Reparacion/sections/ReparacionEntrega.tsx`

#### Modal de Notificación:
```typescript
const avanzarAFinalizado = async () => {
  const response = await dispatch(cambiarEstadoReparacionAsync({
    reparacionId,
    nuevoEstado: 'Finalizado',
    enviarEmail: false
  }));

  if (response.meta.requestStatus === 'fulfilled') {
    const payload = response.payload as { reparacion: any; usedDeliveryDateAsFallback: boolean };
    
    if (payload.usedDeliveryDateAsFallback) {
      openModal({
        mensaje: "⚠️ La reparación no tenía fecha de finalización. Se ha usado la fecha de entrega como fecha de finalización automáticamente.",
        tipo: "warning",
        titulo: "Fecha de Finalización Ajustada",
      });
    } else {
      openModal({
        mensaje: "Reparación finalizada correctamente.",
        tipo: "success",
        titulo: "Reparación Finalizada",
      });
    }
  }
};
```

## 📊 Mapeo de Campos

| Frontend (React) | Backend (Supabase) | Descripción |
|-----------------|-------------------|-------------|
| `FeFinRep` | `completion_date` | Fecha de finalización de reparación |
| `FeEntRep` | `delivery_date` | Fecha de entrega al cliente |
| `EstadoRep` | `state` | Estado de la reparación |

## 🔄 Flujo de Datos

### Escenario 1: Marcar como Reparado
```
Usuario hace clic en "Marcar como Reparado"
  ↓
cambiarEstadoReparacionAsync ejecuta
  ↓
Verifica si FeFinRep existe
  ↓ (si no existe)
Establece FeFinRep = Date.now()
  ↓
Guarda en Supabase (completion_date)
  ↓
Envía email de notificación
```

### Escenario 2: Marcar como Finalizado (CON fecha de finalización)
```
Usuario hace clic en "Finalizar Reparación"
  ↓
cambiarEstadoReparacionAsync ejecuta
  ↓
Establece FeEntRep si no existe
  ↓
Verifica FeFinRep (existe)
  ↓
Guarda en Supabase
  ↓
Modal: "Reparación finalizada correctamente" (success)
```

### Escenario 3: Marcar como Finalizado (SIN fecha de finalización)
```
Usuario hace clic en "Finalizar Reparación"
  ↓
cambiarEstadoReparacionAsync ejecuta
  ↓
Establece FeEntRep si no existe
  ↓
Verifica FeFinRep (NO existe)
  ↓
FeFinRep = FeEntRep (FALLBACK)
usedDeliveryDateAsFallback = true
  ↓
Guarda en Supabase
  ↓
Modal: "⚠️ La reparación no tenía fecha de finalización..." (warning)
```

## ✅ Garantías

1. **Integridad de Datos**: Nunca habrá reparaciones "Reparadas" o "Finalizadas" sin fechas
2. **Trazabilidad**: El usuario es notificado cuando se usa un fallback
3. **Prevención de Errores**: Validación automática antes de persistir
4. **Sincronización**: Firebase y Supabase mantienen consistencia

## 🧪 Testing Manual

### Caso 1: Reparación sin fecha → Marcar como Reparado
1. Crear/editar reparación en estado "Aceptado"
2. NO llenar campo "Fecha Finalización"
3. Clic en "Marcar como Reparado"
4. **Resultado esperado**: Se guarda con fecha actual en `completion_date`

### Caso 2: Reparación sin fecha → Finalizar directamente
1. Tener reparación en estado "Cobrado" o "Enviado"
2. NO llenar "Fecha Finalización"
3. Llenar "Fecha Entrega"
4. Clic en "Finalizar Reparación"
5. **Resultado esperado**: 
   - Modal warning mostrando fallback
   - `completion_date` = `delivery_date` en BD

### Caso 3: Reparación completa → Finalizar
1. Tener reparación con ambas fechas llenas
2. Clic en "Finalizar Reparación"
3. **Resultado esperado**: Modal success sin warnings

## 📝 Notas Técnicas

- **Timestamps**: Todas las fechas se guardan como Unix timestamp (milisegundos desde epoch)
- **Conversión**: La persistencia de Supabase convierte automáticamente a formato de BD
- **Retrocompatibilidad**: Reparaciones antiguas sin fechas se ajustan automáticamente al cambiar de estado
- **Debounce**: Los campos de fecha usan debounce de 500ms para evitar guardados excesivos

## 🔗 Archivos Relacionados

- `src/redux-tool-kit/reparacion/reparacion.actions.ts` - Lógica de negocio
- `src/components/Reparacion/sections/ReparacionReparar.tsx` - Sección "Reparar"
- `src/components/Reparacion/sections/ReparacionEntrega.tsx` - Sección "Entrega"
- `src/persistencia/persistenciaSupabase/reparacionesPersistencia.js` - Persistencia
- `src/types/reparacion.ts` - Tipos TypeScript

## 🚀 Próximos Pasos

1. ✅ Validación de fechas obligatorias implementada
2. ✅ Modal de notificación de fallback implementado
3. ⏳ Testing en producción con datos reales
4. ⏳ Documentar en manual de usuario
