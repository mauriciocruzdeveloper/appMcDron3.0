/**
 * usePermissions.hook.ts
 * 
 * Hook para gestionar permisos del usuario actual.
 * 
 * **Phase 4 - T4.5:** Sistema de Permisos
 * - Verificación de permisos
 * - Verificación de roles
 * - Estados permitidos
 * 
 * @module Hooks/Permissions
 */

import { useMemo } from 'react';
import { 
    UserRole, 
    PermissionAction,
    getRolePermissions,
    hasPermission as checkPermission,
    canChangeEstado as checkEstado,
    getAllowedEstados,
    requiresConfirmation
} from '../config/permissions.config';

/**
 * Información del usuario actual.
 * En producción, esto vendría de un contexto de autenticación.
 */
interface CurrentUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

/**
 * Resultado del hook usePermissions.
 */
interface UsePermissionsResult {
    /** Usuario actual */
    user: CurrentUser | null;
    
    /** Rol del usuario */
    role: UserRole | null;
    
    /** Verificar si tiene un permiso específico */
    hasPermission: (action: PermissionAction) => boolean;
    
    /** Verificar si puede cambiar a un estado */
    canChangeEstado: (estado: string) => boolean;
    
    /** Obtener estados permitidos */
    allowedEstados: string[];
    
    /** Verificar si es admin */
    isAdmin: boolean;
    
    /** Verificar si es técnico */
    isTecnico: boolean;
    
    /** Verificar si es recepción */
    isRecepcion: boolean;
    
    /** Verificar si es cliente */
    isCliente: boolean;
    
    /** Verificar si una acción requiere confirmación */
    needsConfirmation: (action: PermissionAction) => boolean;
    
    /** Todos los permisos del rol */
    permissions: PermissionAction[];
}

/**
 * Hook para gestionar permisos del usuario.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasPermission, canChangeEstado, isAdmin } = usePermissions();
 *   
 *   if (!hasPermission(PermissionAction.EDIT_REPARACION)) {
 *     return <Alert>No tienes permiso</Alert>;
 *   }
 *   
 *   return (
 *     <Button 
 *       disabled={!canChangeEstado('diagnosticado')}
 *       onClick={handleEstadoChange}
 *     >
 *       Cambiar Estado
 *     </Button>
 *   );
 * }
 * ```
 */
export function usePermissions(): UsePermissionsResult {
    // TODO: En producción, obtener del contexto de autenticación
    // Por ahora, simulamos un usuario admin
    const user: CurrentUser = useMemo(() => ({
        id: '1',
        name: 'Usuario Demo',
        email: 'demo@mcdron.com',
        role: UserRole.ADMIN
    }), []);
    
    const role = user?.role || null;
    
    // Calcular permisos
    const permissions = useMemo(() => {
        if (!role) return [];
        return getRolePermissions(role);
    }, [role]);
    
    // Estados permitidos
    const allowedEstados = useMemo(() => {
        if (!role) return [];
        return getAllowedEstados(role);
    }, [role]);
    
    // Verificaciones de rol
    const isAdmin = role === UserRole.ADMIN;
    const isTecnico = role === UserRole.TECNICO;
    const isRecepcion = role === UserRole.RECEPCION;
    const isCliente = role === UserRole.CLIENTE;
    
    // Función para verificar permisos
    const hasPermissionFn = (action: PermissionAction): boolean => {
        if (!role) return false;
        return checkPermission(role, action);
    };
    
    // Función para verificar estados
    const canChangeEstadoFn = (estado: string): boolean => {
        if (!role) return false;
        return checkEstado(role, estado);
    };
    
    // Función para verificar confirmación
    const needsConfirmationFn = (action: PermissionAction): boolean => {
        return requiresConfirmation(action);
    };
    
    return {
        user,
        role,
        hasPermission: hasPermissionFn,
        canChangeEstado: canChangeEstadoFn,
        allowedEstados,
        isAdmin,
        isTecnico,
        isRecepcion,
        isCliente,
        needsConfirmation: needsConfirmationFn,
        permissions
    };
}

/**
 * Hook simplificado para verificar un permiso específico.
 * 
 * @example
 * ```tsx
 * function EditButton() {
 *   const canEdit = useHasPermission(PermissionAction.EDIT_REPARACION);
 *   
 *   if (!canEdit) return null;
 *   
 *   return <Button>Editar</Button>;
 * }
 * ```
 */
export function useHasPermission(action: PermissionAction): boolean {
    const { hasPermission } = usePermissions();
    return hasPermission(action);
}

/**
 * Hook para verificar múltiples permisos.
 * 
 * @example
 * ```tsx
 * function ComplexComponent() {
 *   const { canEdit, canDelete } = useHasPermissions({
 *     canEdit: PermissionAction.EDIT_REPARACION,
 *     canDelete: PermissionAction.DELETE_REPARACION
 *   });
 *   
 *   return (
 *     <div>
 *       {canEdit && <EditButton />}
 *       {canDelete && <DeleteButton />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useHasPermissions<T extends Record<string, PermissionAction>>(
    actions: T
): Record<keyof T, boolean> {
    const { hasPermission } = usePermissions();
    
    return useMemo(() => {
        const result: Record<keyof T, boolean> = {} as Record<keyof T, boolean>;
        for (const [key, action] of Object.entries(actions)) {
            result[key as keyof T] = hasPermission(action);
        }
        return result;
    }, [hasPermission, actions]);
}
