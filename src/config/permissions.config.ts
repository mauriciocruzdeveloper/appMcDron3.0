/**
 * permissions.config.ts
 * 
 * Configuración del sistema de permisos granular.
 * 
 * **Phase 4 - T4.5:** Sistema de Permisos
 * - 4 Roles predefinidos
 * - Permisos por acción
 * - Guards de componentes
 * 
 * @module Config/Permissions
 */

/**
 * Roles disponibles en el sistema.
 */
export enum UserRole {
    /** Administrador - Acceso total */
    ADMIN = 'admin',
    
    /** Técnico - Gestiona reparaciones */
    TECNICO = 'tecnico',
    
    /** Recepción - Recibe y entrega drones */
    RECEPCION = 'recepcion',
    
    /** Cliente - Solo visualiza sus reparaciones */
    CLIENTE = 'cliente'
}

/**
 * Acciones que pueden requerir permisos.
 */
export enum PermissionAction {
    // Reparaciones
    CREATE_REPARACION = 'reparacion:create',
    VIEW_REPARACION = 'reparacion:view',
    EDIT_REPARACION = 'reparacion:edit',
    DELETE_REPARACION = 'reparacion:delete',
    
    // Estados
    CHANGE_ESTADO = 'estado:change',
    VIEW_WORKFLOW = 'workflow:view',
    
    // Repuestos
    ADD_REPUESTO = 'repuesto:add',
    EDIT_REPUESTO = 'repuesto:edit',
    DELETE_REPUESTO = 'repuesto:delete',
    VIEW_COSTOS = 'repuesto:view_costos',
    
    // Archivos
    UPLOAD_FILE = 'file:upload',
    DELETE_FILE = 'file:delete',
    VIEW_FILES = 'file:view',
    
    // Presupuestos
    CREATE_PRESUPUESTO = 'presupuesto:create',
    EDIT_PRESUPUESTO = 'presupuesto:edit',
    SEND_PRESUPUESTO = 'presupuesto:send',
    APPROVE_PRESUPUESTO = 'presupuesto:approve',
    
    // Dashboard y reportes
    VIEW_DASHBOARD = 'dashboard:view',
    EXPORT_REPORTS = 'report:export',
    VIEW_METRICS = 'metrics:view',
    
    // Notificaciones
    SEND_NOTIFICATION = 'notification:send',
    CONFIGURE_NOTIFICATIONS = 'notification:configure',
    
    // Sistema
    MANAGE_USERS = 'system:manage_users',
    VIEW_AUDIT_LOG = 'system:audit_log',
    CONFIGURE_SYSTEM = 'system:configure'
}

/**
 * Configuración de permisos por rol.
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
    [UserRole.ADMIN]: [
        // Acceso total a todo
        PermissionAction.CREATE_REPARACION,
        PermissionAction.VIEW_REPARACION,
        PermissionAction.EDIT_REPARACION,
        PermissionAction.DELETE_REPARACION,
        PermissionAction.CHANGE_ESTADO,
        PermissionAction.VIEW_WORKFLOW,
        PermissionAction.ADD_REPUESTO,
        PermissionAction.EDIT_REPUESTO,
        PermissionAction.DELETE_REPUESTO,
        PermissionAction.VIEW_COSTOS,
        PermissionAction.UPLOAD_FILE,
        PermissionAction.DELETE_FILE,
        PermissionAction.VIEW_FILES,
        PermissionAction.CREATE_PRESUPUESTO,
        PermissionAction.EDIT_PRESUPUESTO,
        PermissionAction.SEND_PRESUPUESTO,
        PermissionAction.APPROVE_PRESUPUESTO,
        PermissionAction.VIEW_DASHBOARD,
        PermissionAction.EXPORT_REPORTS,
        PermissionAction.VIEW_METRICS,
        PermissionAction.SEND_NOTIFICATION,
        PermissionAction.CONFIGURE_NOTIFICATIONS,
        PermissionAction.MANAGE_USERS,
        PermissionAction.VIEW_AUDIT_LOG,
        PermissionAction.CONFIGURE_SYSTEM
    ],
    
    [UserRole.TECNICO]: [
        // Gestión de reparaciones
        PermissionAction.CREATE_REPARACION,
        PermissionAction.VIEW_REPARACION,
        PermissionAction.EDIT_REPARACION,
        PermissionAction.CHANGE_ESTADO,
        PermissionAction.VIEW_WORKFLOW,
        
        // Repuestos (sin ver costos)
        PermissionAction.ADD_REPUESTO,
        PermissionAction.EDIT_REPUESTO,
        
        // Archivos
        PermissionAction.UPLOAD_FILE,
        PermissionAction.VIEW_FILES,
        
        // Presupuestos (solo crear/editar)
        PermissionAction.CREATE_PRESUPUESTO,
        PermissionAction.EDIT_PRESUPUESTO,
        
        // Dashboard limitado
        PermissionAction.VIEW_DASHBOARD,
        PermissionAction.VIEW_METRICS,
        
        // Notificaciones básicas
        PermissionAction.SEND_NOTIFICATION
    ],
    
    [UserRole.RECEPCION]: [
        // Crear y ver reparaciones
        PermissionAction.CREATE_REPARACION,
        PermissionAction.VIEW_REPARACION,
        PermissionAction.EDIT_REPARACION,
        
        // Estados limitados (recepción/entrega)
        PermissionAction.CHANGE_ESTADO,
        PermissionAction.VIEW_WORKFLOW,
        
        // Archivos
        PermissionAction.UPLOAD_FILE,
        PermissionAction.VIEW_FILES,
        
        // Presupuestos (solo enviar)
        PermissionAction.SEND_PRESUPUESTO,
        PermissionAction.VIEW_DASHBOARD,
        
        // Notificaciones
        PermissionAction.SEND_NOTIFICATION
    ],
    
    [UserRole.CLIENTE]: [
        // Solo visualización
        PermissionAction.VIEW_REPARACION,
        PermissionAction.VIEW_WORKFLOW,
        PermissionAction.VIEW_FILES,
        
        // Aprobar presupuestos
        PermissionAction.APPROVE_PRESUPUESTO
    ]
};

/**
 * Estados que cada rol puede cambiar.
 * Control granular por estado.
 */
export const ESTADO_PERMISSIONS: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: [
        'recepcionado',
        'diagnosticado',
        'presupuestado',
        'aprobado',
        'rechazado',
        'en_reparacion',
        'esperando_repuesto',
        'reparado',
        'probado',
        'entregado',
        'cancelado'
    ],
    
    [UserRole.TECNICO]: [
        'diagnosticado',
        'presupuestado',
        'en_reparacion',
        'esperando_repuesto',
        'reparado',
        'probado'
    ],
    
    [UserRole.RECEPCION]: [
        'recepcionado',
        'entregado'
    ],
    
    [UserRole.CLIENTE]: [
        'aprobado',
        'rechazado'
    ]
};

/**
 * Configuración de permisos especiales.
 */
export interface SpecialPermission {
    /** Acción requerida */
    action: PermissionAction;
    
    /** Descripción */
    description: string;
    
    /** Puede ser delegada a otro rol */
    delegable: boolean;
    
    /** Requiere confirmación del usuario */
    requiresConfirmation: boolean;
}

/**
 * Permisos que requieren confirmación especial.
 */
export const SPECIAL_PERMISSIONS: SpecialPermission[] = [
    {
        action: PermissionAction.DELETE_REPARACION,
        description: 'Eliminar reparación permanentemente',
        delegable: false,
        requiresConfirmation: true
    },
    {
        action: PermissionAction.DELETE_REPUESTO,
        description: 'Eliminar repuesto de la lista',
        delegable: true,
        requiresConfirmation: true
    },
    {
        action: PermissionAction.DELETE_FILE,
        description: 'Eliminar archivo adjunto',
        delegable: true,
        requiresConfirmation: true
    },
    {
        action: PermissionAction.APPROVE_PRESUPUESTO,
        description: 'Aprobar presupuesto y comenzar reparación',
        delegable: false,
        requiresConfirmation: true
    }
];

/**
 * Obtener permisos de un rol.
 */
export function getRolePermissions(role: UserRole): PermissionAction[] {
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Verificar si un rol tiene un permiso específico.
 */
export function hasPermission(role: UserRole, action: PermissionAction): boolean {
    const permissions = getRolePermissions(role);
    return permissions.includes(action);
}

/**
 * Verificar si un rol puede cambiar a un estado específico.
 */
export function canChangeEstado(role: UserRole, estado: string): boolean {
    const allowedEstados = ESTADO_PERMISSIONS[role] || [];
    return allowedEstados.includes(estado);
}

/**
 * Obtener estados permitidos para un rol.
 */
export function getAllowedEstados(role: UserRole): string[] {
    return ESTADO_PERMISSIONS[role] || [];
}

/**
 * Verificar si una acción requiere confirmación.
 */
export function requiresConfirmation(action: PermissionAction): boolean {
    const special = SPECIAL_PERMISSIONS.find(p => p.action === action);
    return special?.requiresConfirmation || false;
}

/**
 * Verificar si un permiso es delegable.
 */
export function isDelegable(action: PermissionAction): boolean {
    const special = SPECIAL_PERMISSIONS.find(p => p.action === action);
    return special?.delegable || false;
}
