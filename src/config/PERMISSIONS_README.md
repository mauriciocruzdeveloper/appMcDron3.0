# Sistema de Permisos - Phase 4 T4.5

Sistema granular de permisos para controlar acceso a funcionalidades según roles de usuario.

## 🎯 Características

- ✅ 4 Roles predefinidos (Admin, Técnico, Recepción, Cliente)
- ✅ 30+ acciones con permisos específicos
- ✅ Control de estados por rol
- ✅ Guards de componentes React
- ✅ Hooks personalizados
- ✅ Confirmaciones para acciones críticas

## 📚 Roles y Permisos

### Admin (Acceso Total)
```typescript
- Todas las acciones disponibles
- Todos los estados
- Gestión de usuarios
- Configuración del sistema
- Audit log completo
```

### Técnico
```typescript
- Crear/editar reparaciones
- Cambiar estados de trabajo (diagnosticado, en_reparacion, reparado, probado)
- Gestionar repuestos (sin ver costos)
- Crear/editar presupuestos
- Ver dashboard y métricas
- Enviar notificaciones
```

### Recepción
```typescript
- Crear/ver/editar reparaciones
- Estados de entrada/salida (recepcionado, entregado)
- Enviar presupuestos
- Ver dashboard básico
- Subir archivos
- Enviar notificaciones
```

### Cliente
```typescript
- Ver sus reparaciones
- Ver workflow y archivos
- Aprobar/rechazar presupuestos
```

## 🔧 Uso

### Hook usePermissions

```tsx
import { usePermissions } from '../hooks/usePermissions.hook';
import { PermissionAction } from '../config/permissions.config';

function MyComponent() {
  const { 
    hasPermission, 
    canChangeEstado, 
    isAdmin,
    role,
    allowedEstados 
  } = usePermissions();

  // Verificar permiso específico
  if (hasPermission(PermissionAction.EDIT_REPARACION)) {
    // Mostrar botón de edición
  }

  // Verificar si puede cambiar estado
  if (canChangeEstado('diagnosticado')) {
    // Permitir transición
  }

  // Verificar rol
  if (isAdmin) {
    // Mostrar panel de admin
  }

  return (
    <div>
      <p>Rol actual: {role}</p>
      <p>Estados permitidos: {allowedEstados.join(', ')}</p>
    </div>
  );
}
```

### Hook useHasPermission (simplificado)

```tsx
import { useHasPermission } from '../hooks/usePermissions.hook';
import { PermissionAction } from '../config/permissions.config';

function EditButton() {
  const canEdit = useHasPermission(PermissionAction.EDIT_REPARACION);
  
  if (!canEdit) return null;
  
  return <Button onClick={handleEdit}>Editar</Button>;
}
```

### Hook useHasPermissions (múltiples)

```tsx
import { useHasPermissions } from '../hooks/usePermissions.hook';
import { PermissionAction } from '../config/permissions.config';

function ActionButtons() {
  const { canEdit, canDelete, canExport } = useHasPermissions({
    canEdit: PermissionAction.EDIT_REPARACION,
    canDelete: PermissionAction.DELETE_REPARACION,
    canExport: PermissionAction.EXPORT_REPORTS
  });

  return (
    <div>
      {canEdit && <Button>Editar</Button>}
      {canDelete && <Button variant="danger">Eliminar</Button>}
      {canExport && <Button variant="success">Exportar</Button>}
    </div>
  );
}
```

### PermissionGuard Component

```tsx
import { PermissionGuard } from '../components/Guards';
import { PermissionAction } from '../config/permissions.config';

// Requiere un permiso
<PermissionGuard requires={PermissionAction.EDIT_REPARACION}>
  <EditPanel />
</PermissionGuard>

// Requiere múltiples permisos (todos)
<PermissionGuard 
  requires={[
    PermissionAction.EDIT_REPARACION, 
    PermissionAction.DELETE_REPARACION
  ]}
  mode="all"
>
  <AdminPanel />
</PermissionGuard>

// Requiere al menos uno
<PermissionGuard 
  requires={[
    PermissionAction.VIEW_DASHBOARD, 
    PermissionAction.VIEW_METRICS
  ]}
  mode="any"
  fallback={<Alert variant="warning">Acceso restringido</Alert>}
>
  <Dashboard />
</PermissionGuard>

// Con mensaje personalizado
<PermissionGuard 
  requires={PermissionAction.MANAGE_USERS}
  showDefaultMessage
  errorMessage="Solo administradores pueden gestionar usuarios"
>
  <UserManagement />
</PermissionGuard>
```

### RoleGuard Component

```tsx
import { RoleGuard } from '../components/Guards';
import { UserRole } from '../config/permissions.config';

<RoleGuard 
  allowedRoles={[UserRole.ADMIN, UserRole.TECNICO]}
  fallback={<Alert>Solo para técnicos y admins</Alert>}
>
  <TechnicalSettings />
</RoleGuard>
```

### EstadoGuard Component

```tsx
import { EstadoGuard } from '../components/Guards';

<EstadoGuard 
  estado="diagnosticado"
  fallback={<small className="text-muted">No permitido</small>}
>
  <Button onClick={() => cambiarEstado('diagnosticado')}>
    Marcar como Diagnosticado
  </Button>
</EstadoGuard>
```

## 🔒 Acciones que Requieren Confirmación

Ciertas acciones críticas requieren confirmación del usuario:

```typescript
- DELETE_REPARACION: Eliminar reparación (no delegable)
- DELETE_REPUESTO: Eliminar repuesto (delegable)
- DELETE_FILE: Eliminar archivo (delegable)
- APPROVE_PRESUPUESTO: Aprobar presupuesto (no delegable)
```

Uso:
```tsx
import { requiresConfirmation } from '../config/permissions.config';

function handleDelete() {
  if (requiresConfirmation(PermissionAction.DELETE_REPARACION)) {
    if (window.confirm('¿Estás seguro? Esta acción no se puede deshacer.')) {
      // Proceder con eliminación
    }
  } else {
    // Eliminar directamente
  }
}
```

## 📝 Ejemplo Completo: Botones de Estado

```tsx
import React from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { usePermissions } from '../hooks/usePermissions.hook';
import { EstadoGuard } from '../components/Guards';

function WorkflowActions() {
  const { allowedEstados, role } = usePermissions();

  const handleCambiarEstado = (nuevoEstado: string) => {
    console.log(`Cambiando a: ${nuevoEstado}`);
    // Lógica de cambio de estado
  };

  return (
    <div>
      <p>Estados permitidos para {role}:</p>
      
      <ButtonGroup>
        <EstadoGuard estado="recepcionado">
          <Button onClick={() => handleCambiarEstado('recepcionado')}>
            Recepcionado
          </Button>
        </EstadoGuard>
        
        <EstadoGuard estado="diagnosticado">
          <Button onClick={() => handleCambiarEstado('diagnosticado')}>
            Diagnosticado
          </Button>
        </EstadoGuard>
        
        <EstadoGuard estado="en_reparacion">
          <Button onClick={() => handleCambiarEstado('en_reparacion')}>
            En Reparación
          </Button>
        </EstadoGuard>
        
        <EstadoGuard estado="entregado">
          <Button onClick={() => handleCambiarEstado('entregado')}>
            Entregado
          </Button>
        </EstadoGuard>
      </ButtonGroup>
      
      <p className="mt-2 text-muted">
        Solo verás botones para estados permitidos
      </p>
    </div>
  );
}
```

## 🎨 Ejemplo Completo: Container con Permisos

```tsx
import React from 'react';
import { usePermissions } from '../hooks/usePermissions.hook';
import { PermissionGuard } from '../components/Guards';
import { PermissionAction } from '../config/permissions.config';

function ReparacionContainer() {
  const { hasPermission, isAdmin, role } = usePermissions();

  return (
    <Container>
      <Row>
        <Col>
          <h2>Gestión de Reparaciones</h2>
          <Badge bg="info">{role}</Badge>
        </Col>
        
        <Col className="text-end">
          {/* Botón crear solo si tiene permiso */}
          <PermissionGuard requires={PermissionAction.CREATE_REPARACION}>
            <Button variant="primary">Nueva Reparación</Button>
          </PermissionGuard>
        </Col>
      </Row>

      {/* Tabs con guards */}
      <Tabs>
        <Tab title="General">
          <GeneralTab />
        </Tab>

        {/* Dashboard solo para Admin y Técnico */}
        <PermissionGuard requires={PermissionAction.VIEW_DASHBOARD}>
          <Tab title="Dashboard">
            <DashboardTab />
          </Tab>
        </PermissionGuard>

        {/* Exportar solo con permiso */}
        <PermissionGuard requires={PermissionAction.EXPORT_REPORTS}>
          <Tab title="Reportes">
            <ReportsTab />
          </Tab>
        </PermissionGuard>
      </Tabs>

      {/* Panel de admin solo para admin */}
      {isAdmin && (
        <Alert variant="info">
          <h5>Panel de Administrador</h5>
          <p>Tienes acceso completo al sistema</p>
        </Alert>
      )}
    </Container>
  );
}
```

## 🔄 Integración con Backend (TODO)

En producción, el sistema debe integrarse con autenticación real:

```typescript
// AuthContext.tsx
interface AuthContext {
  user: CurrentUser | null;
  login: (credentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Modificar usePermissions para usar AuthContext
export function usePermissions(): UsePermissionsResult {
  const { user } = useAuth(); // Del contexto de autenticación
  
  // ... resto del código
}
```

## 📊 Estadísticas

- **Roles:** 4
- **Acciones:** 30+
- **Estados controlados:** 11
- **Archivos creados:** 4
  - `permissions.config.ts` (280 líneas)
  - `usePermissions.hook.ts` (215 líneas)
  - `PermissionGuard.component.tsx` (165 líneas)
  - `README.md` (este archivo)

## ✅ Testing

```tsx
import { renderHook } from '@testing-library/react-hooks';
import { usePermissions } from '../usePermissions.hook';

describe('usePermissions', () => {
  it('should have admin permissions', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.hasPermission(PermissionAction.DELETE_REPARACION)).toBe(true);
  });

  it('should allow admin to change any estado', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.canChangeEstado('diagnosticado')).toBe(true);
    expect(result.current.canChangeEstado('entregado')).toBe(true);
  });
});
```

## 🚀 Próximos Pasos

1. ✅ Configuración base de permisos
2. ✅ Hooks de permisos
3. ✅ Guards de componentes
4. ⏸️ Integrar en Container principal
5. ⏸️ Integrar en WorkflowTab
6. ⏸️ Integrar en botones de acción
7. ⏸️ Testing completo
8. ⏸️ Integración con backend real
