# Proposal: Sistema de Roles de Usuario

## Status
**DRAFT** - En revisión

## Context

### Problema Actual
El sistema actualmente usa un campo booleano `Admin: boolean` para distinguir entre administradores y usuarios regulares. Esto presenta las siguientes limitaciones:

1. **Nomenclatura inconsistente**: El código mezcla los términos "cliente" y "usuario" indistintamente
2. **Falta de roles intermedios**: No hay forma de definir roles como "Partner" o "Técnico"
3. **Escalabilidad limitada**: Agregar nuevos roles requeriría múltiples booleanos
4. **Permisos rígidos**: Solo hay dos niveles: acceso total o restringido

### Situación Actual en el Código

#### Frontend (TypeScript)
```typescript
// src/types/usuario.ts
interface Usuario {
  id: string;
  data: {
    Admin?: boolean;  // ❌ Solo booleano
    // ...
  }
}
```

#### Backend (Supabase)
- Tabla: `user`
- Campo: `is_admin BOOLEAN`
- No hay distinción entre tipos de usuarios no-admin

### Objetivo
Implementar un sistema de roles flexible que:
- Unifique la nomenclatura (todo es "Usuario")
- Soporte múltiples roles (Admin, Cliente, Partner)
- Permita extensión futura de roles
- Mantenga compatibilidad con datos existentes

## Proposal

### Sistema de Roles

#### Roles Definidos

1. **Admin**
   - Acceso completo al sistema
   - Ve todas las reparaciones
   - Gestiona usuarios, repuestos, modelos, etc.
   - Accede a estadísticas y reportes

2. **Cliente**
   - Ve solo sus propias reparaciones
   - Puede crear nuevas solicitudes
   - Accede a su perfil
   - Sin acceso administrativo

3. **Partner**
   - Puede dar de alta reparaciones en estado "Consulta"
   - Las reparaciones se marcan como "referidas" (identificadas por el usuario que las creó)
   - **Nota:** Funcionalidad específica de Partner se implementará en futura iteración (fuera del alcance actual)

### Cambios Técnicos

#### 1. TypeScript Types

**Antes:**
```typescript
interface Usuario {
  id: string;
  data: {
    Admin?: boolean;
    // ...
  }
}
```

**Después:**
```typescript
type UserRole = 'admin' | 'cliente' | 'partner';

interface Usuario {
  id: string;
  data: {
    Role: UserRole;  // ✅ Reemplaza Admin
    // ...
  }
}
```

#### 2. Base de Datos (Supabase)

**Tabla: `user`**

Cambios:
- Renombrar campo: `is_admin` → `role`
- Tipo: `BOOLEAN` → `VARCHAR(20)` o `ENUM`
- Constraint: Valores válidos ['admin', 'cliente', 'partner']
- Default: 'cliente'

#### 3. Migración de Datos

```sql
-- Convertir booleano a rol
UPDATE user 
SET role = CASE 
  WHEN is_admin = true THEN 'admin'
  ELSE 'cliente'
END;
```

### Nomenclatura Unificada

#### Términos a Estandarizar

| Antes | Después | Ubicación | Criterio |
|-------|---------|-----------|----------|
| Cliente (en persistencia) | Usuario | Nombres de funciones | Entidad del sistema |
| `getClientePersistencia` | `getUsuarioPersistencia` | API | Entidad del sistema |
| `CLIENTES/USUARIOS` | `USUARIOS` | Comentarios | Entidad del sistema |
| "cliente" (variable genérica) | "usuario" | Código | Entidad del sistema |

#### Cuándo usar "Cliente" vs "Usuario"

**✅ Usar "Usuario":**
- En nombres de funciones de persistencia (`getUsuarioPersistencia`)
- En tipos TypeScript (`Usuario`, no `Cliente`)
- En colecciones/tablas de base de datos
- En Redux (store, actions, selectors)
- Cuando se refiere a la entidad del sistema

**✅ Usar "Cliente":**
- En contexto de negocio ("El cliente trajo su drone")
- En UI dirigida al usuario con `role: 'cliente'`
- En emails y comunicaciones externas
- En campos como `NombreCliente` en `Reparacion` (datos del dueño del drone)
- Cuando se refiere al rol específico o al dueño del drone

**Ejemplo:**
```typescript
// ✅ Correcto
const usuario = getUsuarioPersistencia(id);  // Entidad del sistema
if (usuario.data.Role === 'cliente') {       // Rol específico
  console.log('Este cliente trajo un drone'); // Contexto de negocio
}

// ❌ Incorrecto
const cliente = getClientePersistencia(id);  // Confunde entidad con rol
```
|---------------|-------|---------|---------|
| Ver todas las reparaciones | ✅ | ❌ | ❌ |
| Ver propias reparaciones | ✅ | ✅ | ✅ |
| Crear reparación (Consulta) | ✅ | ✅ | ✅ |
| Editar cualquier reparación | ✅ | ❌ | ❌ |
| Editar reparación propia | ✅ | 🔮* | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Gestionar repuestos | ✅ | ❌ | ❌ |
| Ver estadísticas | ✅ | ❌ | ❌ |
| Gestionar intervenciones | ✅ | ❌ | ❌ |

🔮* = Funcionalidad futura (fuera del alcance actual)

### Fase 1: Preparación ✅
- [x] Análisis del código actual
- [x] Creación del spec
- [ ] Revisión y aprobación del spec

### Fase 2: Base de Datos
1. Crear migración SQL para Supabase
2. Agregar columna `role` con valores por defecto
3. Migrar datos de `is_admin` a `role`
4. Verificar integridad de datos
5. (Opcional) Eliminar columna `is_admin` después de pruebas

### Fase 3: Backend/Persistencia
1. Actualizar tipos TypeScript (`usuario.ts`)
2. Actualizar capa de persistencia Supabase
   - Mapeo de `role` en lugar de `is_admin`
   - Actualizar queries y filtros
3. Renombrar funciones: `getCliente*` → `getUsuario*`

### Fase 4: Redux
1. Actualizar selectores:
   - `selectUsuariosAdmin` → usar `role === 'admin'`
   - Agregar `selectUsuariosPorRole(role)`
2. Actualizar acciones si es necesario

### Fase 5: Guards y Rutas
1. Actualizar `AdminGuard` → `RoleGuard`
2. Agregar soporte para verificación de múltiples roles
3. Actualizar rutas que usan verificación de admin

### Fase 6: UI/Componentes
1. Actualizar componentes que verifican `Admin`
2. Actualizar lógica de permisos en reparaciones
3. Actualizar mensajes y etiquetas

### Fase 7: Pruebas y Migración
1. Script de migración de usuarios existentes
2. Pruebas de regresión
3. Verificación de permisos por rol
4. Deploy gradual

## Risks & Mitigations

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Pérdida de datos en migración | Baja | Alto | Backup antes de migrar, dry-run |
| Usuarios sin acceso después de migración | Media | Alto | Default a 'cliente', verificación post-migración |
| Inconsistencias Admin vs Role | Media | Medio | Mantener ambos campos temporalmente |
| Código legacy roto | Alta | Medio | Búsqueda exhaustiva de `.Admin` |

## Decisions Made

### ✅ Resuelto

1. **Partner**: 
   - Podrá dar de alta reparaciones en estado "Consulta"
   - Funcionalidad específica de reparaciones referidas se implementará después (fuera del alcance)
   
2. **Transición**: 
   - **NO** se mantiene `is_admin` temporalmente
   - Se reemplaza completamente por `role`
   - Migración directa sin período de transición
   
3. **Nombres de funciones**: 
   - SÍ, renombrar `getClientePersistencia` → `getUsuarioPersistencia` en esta fase
   - Unificar toda nomenclatura relacionada con la entidad Usuario
   
4. **Nuevos roles futuros**: 
   - Habrá más roles en el futuro (ej: Técnico, Supervisor)
   - Definición de roles adicionales queda **fuera del alcance** actual
   - Sistema preparado para extensión (usar enum/string, no boolean)

### 🔮 Para Futuras Iteraciones

- Funcionalidad específica de Partner (reparaciones referidas)
- Roles adicionales (Técnico, Supervisor, etc.)
- Sistema de permisos granular por funcionalidad
- Asignación de reparaciones a Partners/Técnicos

## References

- Archivo de tipos: `src/types/usuario.ts`
- Persistencia Supabase: `src/persistencia/persistenciaSupabase/usuariosPersistencia.js`
- Selectores: `src/redux-tool-kit/usuario/usuario.selectors.ts`
- Guards: `src/components/AdminGuard.component.tsx`
- Rutas: `src/routes/Inicio.routes.js`

## Next Steps

1. Aprobar este spec
2. Crear specs detallados para cada fase
3. Comenzar con migración de base de datos
4. Implementar cambios en orden de dependencias
