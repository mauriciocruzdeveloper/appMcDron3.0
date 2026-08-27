## 1. Persistencia y Modelo
- [ ] 1.1 Actualizar la interfaz `RepuestoData` en `src/types/repuesto.ts` con el campo opcional `FotoRepu?: string`
- [ ] 1.2 Mapear el campo `photo_url` <-> `FotoRepu` en `repuestosPersistencia.js` (`getRepuestoPersistencia`, `guardarRepuestoPersistencia`, `getRepuestosPersistencia`, etc.)

## 2. Redux Actions
- [ ] 2.1 Crear la acción thunk `subirFotoRepuestoAsync` en `repuesto.actions.ts` (o `app.actions.ts`)
- [ ] 2.2 Crear la acción thunk `borrarFotoRepuestoAsync` en `repuesto.actions.ts` (o `app.actions.ts`)

## 3. Componentes de UI
- [ ] 3.1 Añadir la sección de gestión de foto en `src/components/Repuesto.component.tsx` (subir, previsualizar, eliminar)
- [ ] 3.2 Mostrar la miniatura del repuesto en `src/components/Inicio/items/RepuestoItem.component.tsx`
- [ ] 3.3 Mostrar la miniatura del repuesto en `src/components/ListaRepuestos.component.tsx`

## 4. Verificación
- [ ] 4.1 Probar subida de foto al crear o editar un repuesto
- [ ] 4.2 Probar eliminación de la foto (verificando que se elimine de Storage)
- [ ] 4.3 Verificar el renderizado de la miniatura en las listas
