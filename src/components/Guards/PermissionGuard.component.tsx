/**
 * PermissionGuard.component.tsx
 * 
 * Componente guard para proteger UI según permisos.
 * 
 * **Phase 4 - T4.5:** Sistema de Permisos
 * - Renderizado condicional por permisos
 * - Mensaje de fallback personalizable
 * - Modo require all/any
 * 
 * @module Components/Guards
 */

import React from 'react';
import { Alert } from 'react-bootstrap';
import { PermissionAction } from '../../config/permissions.config';
import { usePermissions } from '../../hooks/usePermissions.hook';

interface PermissionGuardProps {
    /** Permiso(s) requerido(s) */
    requires: PermissionAction | PermissionAction[];
    
    /** Modo de verificación: 'all' requiere todos, 'any' requiere al menos uno */
    mode?: 'all' | 'any';
    
    /** Componente a renderizar si NO tiene permiso */
    fallback?: React.ReactNode;
    
    /** Mostrar mensaje de error por defecto */
    showDefaultMessage?: boolean;
    
    /** Mensaje personalizado de error */
    errorMessage?: string;
    
    /** Hijos a renderizar si tiene permiso */
    children: React.ReactNode;
}

/**
 * Guard que controla el renderizado según permisos del usuario.
 * 
 * @example
 * ```tsx
 * // Requiere un permiso específico
 * <PermissionGuard requires={PermissionAction.EDIT_REPARACION}>
 *   <EditButton />
 * </PermissionGuard>
 * 
 * // Requiere múltiples permisos (todos)
 * <PermissionGuard 
 *   requires={[PermissionAction.EDIT_REPARACION, PermissionAction.DELETE_REPARACION]}
 *   mode="all"
 * >
 *   <AdminPanel />
 * </PermissionGuard>
 * 
 * // Requiere al menos uno de varios permisos
 * <PermissionGuard 
 *   requires={[PermissionAction.VIEW_DASHBOARD, PermissionAction.VIEW_METRICS]}
 *   mode="any"
 *   fallback={<Alert variant="warning">Acceso restringido</Alert>}
 * >
 *   <Dashboard />
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
    requires,
    mode = 'all',
    fallback,
    showDefaultMessage = false,
    errorMessage = 'No tienes permisos suficientes para acceder a esta sección.',
    children
}: PermissionGuardProps): React.ReactElement | null {
    const { hasPermission } = usePermissions();
    
    // Convertir a array si es un solo permiso
    const requiredPermissions = Array.isArray(requires) ? requires : [requires];
    
    // Verificar permisos según el modo
    let hasAccess = false;
    if (mode === 'all') {
        // Requiere TODOS los permisos
        hasAccess = requiredPermissions.every(permission => hasPermission(permission));
    } else {
        // Requiere AL MENOS UNO
        hasAccess = requiredPermissions.some(permission => hasPermission(permission));
    }
    
    // Si tiene acceso, renderizar children
    if (hasAccess) {
        return <>{children}</>;
    }
    
    // Si no tiene acceso, renderizar fallback
    if (fallback) {
        return <>{fallback}</>;
    }
    
    // Si showDefaultMessage, mostrar alerta
    if (showDefaultMessage) {
        return (
            <Alert variant="warning" className="m-3">
                <Alert.Heading>Acceso Denegado</Alert.Heading>
                <p>{errorMessage}</p>
            </Alert>
        );
    }
    
    // Por defecto, no renderizar nada
    return null;
}

/**
 * Guard específico para verificar roles.
 * 
 * @example
 * ```tsx
 * <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.TECNICO]}>
 *   <AdminSettings />
 * </RoleGuard>
 * ```
 */
interface RoleGuardProps {
    /** Roles permitidos */
    allowedRoles: string[];
    
    /** Fallback si no tiene el rol */
    fallback?: React.ReactNode;
    
    /** Hijos */
    children: React.ReactNode;
}

export function RoleGuard({
    allowedRoles,
    fallback,
    children
}: RoleGuardProps): React.ReactElement | null {
    const { role } = usePermissions();
    
    if (!role || !allowedRoles.includes(role)) {
        return fallback ? <>{fallback}</> : null;
    }
    
    return <>{children}</>;
}

/**
 * Guard para verificar si puede cambiar a un estado específico.
 * 
 * @example
 * ```tsx
 * <EstadoGuard estado="diagnosticado">
 *   <Button>Cambiar a Diagnosticado</Button>
 * </EstadoGuard>
 * ```
 */
interface EstadoGuardProps {
    /** Estado que se quiere cambiar */
    estado: string;
    
    /** Fallback si no puede cambiar */
    fallback?: React.ReactNode;
    
    /** Hijos */
    children: React.ReactNode;
}

export function EstadoGuard({
    estado,
    fallback,
    children
}: EstadoGuardProps): React.ReactElement | null {
    const { canChangeEstado } = usePermissions();
    
    if (!canChangeEstado(estado)) {
        return fallback ? <>{fallback}</> : null;
    }
    
    return <>{children}</>;
}
