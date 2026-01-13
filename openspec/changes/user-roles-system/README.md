# Sistema de Roles de Usuario

## 🎯 Quick Summary

**Problema:** Sistema actual usa `Admin: boolean`, mezclando nomenclatura Usuario/Cliente.

**Solución:** Migrar a `Role: 'admin' | 'cliente' | 'partner'` y unificar nomenclatura a "Usuario".

## 📊 Status

- **Estado:** DRAFT
- **Prioridad:** Alta
- **Esfuerzo Estimado:** 6-8 horas
- **Fecha Creación:** 2026-01-13

## 🚀 Quick Start

### Para Ejecutar la Migración de Base de Datos

```bash
# 1. Conectar a Supabase
# 2. Ejecutar la migración principal
psql -f sql/migration_add_user_roles.sql

# 3. Verificar que todo está OK
# (las queries de verificación están al final del script)
```

### Para Revisar el Cambio

1. **Leer propuesta completa:** [proposal.md](./proposal.md)
2. **Ver spec de base de datos:** [specs/database/spec.md](./specs/database/spec.md)
3. **Revisar archivos SQL:** `/sql/migration_add_user_roles.sql`

## 📋 Cambios Principales

### Base de Datos (Supabase)
- ✅ Nueva columna: `role VARCHAR(20)`
- ✅ Constraint: valores válidos ('admin', 'cliente', 'partner')
- ✅ Índice: `idx_user_role` para mejorar queries
- ✅ Migración de datos: `is_admin` → `role`
- ✅ Eliminación de `is_admin` (reemplazo completo)

### TypeScript
- ⏳ Cambio de `Admin?: boolean` a `Role: UserRole`
- ⏳ Nuevo tipo: `UserRole = 'admin' | 'cliente' | 'partner'`
- ⏳ Actualizar mapeos en persistencia

### Nomenclatura
- ⏳ Unificar a "Usuario" en código (ya no "Cliente" en persistencia)
- ⏳ Mantener "cliente" en UI/negocio para usuarios con `role='cliente'`

## 🔄 Fases de Implementación

### ✅ Fase 1: Especificación (Completada)
- [x] Análisis del código actual
- [x] Creación de proposal
- [x] Spec de base de datos
- [x] Scripts SQL de migración

### ⏳ Fase 2: Base de Datos (Siguiente)
- [ ] Revisar y aprobar specs
- [ ] Backup de base de datos
- [ ] Ejecutar `migration_add_user_roles.sql`
- [ ] Verificar integridad de datos
- [ ] Confirmar que no hay errores

### 📅 Fase 3: Backend/Persistencia (Después)
- [ ] Actualizar `src/types/usuario.ts`
- [ ] Actualizar `persistenciaSupabase/usuariosPersistencia.js`
- [ ] Actualizar `persistenciaSupabase/autenticacionPersistencia.js`
- [ ] Renombrar funciones `getCliente*` → `getUsuario*`

### 📅 Fase 4: Redux
- [ ] Actualizar selectores en `usuario.selectors.ts`
- [ ] Agregar `selectUsuariosPorRole(role)`
- [ ] Actualizar acciones si es necesario

### 📅 Fase 5: Guards y Rutas
- [ ] Crear `RoleGuard` (reemplazo de `AdminGuard`)
- [ ] Actualizar verificaciones de permisos
- [ ] Actualizar rutas protegidas

### 📅 Fase 6: UI y Componentes
- [ ] Actualizar componentes que usan `.Admin`
- [ ] Actualizar lógica de permisos en reparaciones
- [ ] Actualizar mensajes y etiquetas

### 📅 Fase 7: Limpieza
- [ ] Buscar y eliminar referencias legacy a `Admin` en comentarios
- [ ] Actualizar documentación
- [ ] Verificar que no quedan referencias a `is_admin`

## 🎯 Roles y Permisos

| Funcionalidad | Admin | Partner | Cliente |
|---------------|-------|---------|---------|
| Ver todas las reparaciones | ✅ | ❌ | ❌ |
| Ver propias reparaciones | ✅ | ✅ | ✅ |
| Crear reparación (Consulta) | ✅ | ✅ | ✅ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Ver estadísticas | ✅ | ❌ | ❌ |

_*Funcionalidad específica de Partner (reparaciones referidas) se implementará en futura iteración_
antes de ejecutar
- **Usuarios sin acceso:** Default a 'cliente', verificación incluida en script
- **Código roto por cambio de API:** Actualizar toda referencia a `Admin` y `is_admin`
- **Pérdida de datos:** Mitigado con backup y dry-run
- **Usuarios sin acceso:** Default a 'cliente', verificación post-migración
- **Código legacy roto:** Mantener `is_admin` temporalmente

## 📁 Archivos Clave

### Documentación
- [`proposal.md`](./proposal.md) - Propuesta completa
- [`specs/database/spec.md`](./specs/database/spec.md) - Spec de migración

### SQL
- [`/sql/migration_add_user_roles.sql`](../../sql/migration_add_user_roles.sql) - Migración completa (agrega role + elimina is_admin)

### Código Afectado
- `src/types/usuario.ts` - Tipos TypeScript
- `src/persistencia/persistenciaSupabase/usuariosPersistencia.js` - Persistencia
- `src/redux-tool-kit/usuario/usuario.selectors.ts` - Selectores
- `src/components/AdminGuard.component.tsx` - Guards
- `src/routes/Inicio.routes.js` - Rutas

## 🤔 Preguntas Abiertas
Decisiones Tomadas

1. **Partner**: Podrá crear reparaciones en estado Consulta. Funcionalidad de reparaciones referidas → futura iteración
2. **is_admin**: Se elimina completamente, reemplazado por `role` (sin período de transición)
3. **Nomenclatura**: Cliente → Usuario en código. "Cliente" solo en contexto de negocio
4. **Futuros roles**: Habrá más roles, pero fuera del alcance actual
## 🔗 Links Relacionados

- [OpenSpec Changes Index](../index.md)
- [Project Context](../../project.md)

---

**Última actualización:** 2026-01-13  
**Próximos pasos:** Revisar propuesta → Aprobar → Ejecutar migración SQL
