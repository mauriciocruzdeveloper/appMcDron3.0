import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { UserRole } from 'types/usuario';

/**
 * Hook para gestión de permisos basado en capacidades (capabilities).
 * Usa el patrón "can*" en lugar de "is*" para mejor semántica y flexibilidad.
 * 
 * @example
 * const { canViewAdminContent, canEditReparacion } = usePermissions();
 * if (canViewAdminContent) { // renderizar contenido admin }
 */
export const usePermissions = () => {
  const userRole = useAppSelector(state => state.app.usuario?.data.Role);
  const userId = useAppSelector(state => state.app.usuario?.id);
  
  // Capacidades básicas por rol
  const isAdmin = userRole === 'admin';
  const isPartner = userRole === 'partner';
  const isCliente = userRole === 'cliente' || !userRole;

  return {
    // ============================================================================
    // CAPACIDADES DE LECTURA (Read)
    // ============================================================================
    
    /** Puede ver contenido exclusivo de administración */
    canViewAdminContent: isAdmin,
    
    /** Puede ver casos de uso (recepción, tránsito) */
    canViewCasosDeUso: isAdmin,
    
    /** Puede ver sección de repuestos agotados */
    canViewRepuestosAgotados: isAdmin,
    
    /** Puede ver sección de repuestos en pedido */
    canViewRepuestosPedidos: isAdmin,
    
    /** Puede ver todas las reparaciones (admin) o solo las propias (partner/cliente) */
    canViewAllReparaciones: isAdmin,
    
    /** Puede ver una reparación específica */
    canViewReparacion: (ownerId?: string) => {
      if (isAdmin) return true;
      return ownerId === userId;
    },
    
    /** Puede ver estadísticas */
    canViewEstadisticas: isAdmin,
    
    /** Puede ver usuarios */
    canViewUsuarios: isAdmin,
    
    /** Puede ver repuestos */
    canViewRepuestos: isAdmin,
    
    /** Puede ver modelos de drones */
    canViewModelosDrone: isAdmin,
    
    /** Puede ver galería de reparaciones */
    canViewGaleria: isAdmin,

    // ============================================================================
    // CAPACIDADES DE ESCRITURA (Write)
    // ============================================================================
    
    /** Puede crear una nueva reparación */
    canCreateReparacion: true, // Todos pueden crear consultas
    
    /** Puede editar una reparación */
    canEditReparacion: (ownerId?: string) => {
      if (isAdmin) return true;
      if (isPartner) return ownerId === userId;
      return false;
    },
    
    /** Puede cambiar estado de reparación */
    canChangeEstadoReparacion: isAdmin,
    
    /** Puede crear/editar usuarios */
    canManageUsuarios: isAdmin,
    
    /** Puede crear/editar repuestos */
    canManageRepuestos: isAdmin,
    
    /** Puede crear/editar modelos de drones */
    canManageModelosDrone: isAdmin,

    // ============================================================================
    // CAPACIDADES DE ELIMINACIÓN (Delete)
    // ============================================================================
    
    /** Puede eliminar reparaciones */
    canDeleteReparacion: isAdmin,
    
    /** Puede eliminar usuarios */
    canDeleteUsuario: isAdmin,

    // ============================================================================
    // CAPACIDADES ESPECIALES
    // ============================================================================
    
    /** Puede acceder al presupuesto/workflow de recepción */
    canAccessPresupuesto: isAdmin,
    
    /** Puede enviar emails */
    canSendEmails: isAdmin,
    
    /** Puede ver mensajes (todos los roles) */
    canViewMensajes: true,
    
    /** Puede gestionar intervenciones */
    canManageIntervenciones: isAdmin,

    // ============================================================================
    // UTILIDADES
    // ============================================================================
    
    /** Verifica si tiene permiso para un array de roles */
    hasRole: (allowedRoles: UserRole[]) => 
      allowedRoles.includes(userRole || 'cliente'),
    
    /** Devuelve el rol actual del usuario */
    currentRole: userRole || 'cliente',
    
    /** Devuelve el ID del usuario actual */
    currentUserId: userId,
  };
};
