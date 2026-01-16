import { Navigate } from 'react-router-dom';
import { UserRole } from '../types/usuario';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
    userRole?: UserRole;
    redirectTo?: string;
}

/**
 * Componente para proteger rutas según el rol del usuario
 * @param allowedRoles - Array de roles permitidos para acceder
 * @param userRole - Rol actual del usuario
 * @param redirectTo - Ruta a la que redirigir si no tiene permisos
 */
export default function RoleGuard({ 
    children, 
    allowedRoles, 
    userRole = 'cliente',
    redirectTo = '/inicio' 
}: RoleGuardProps): JSX.Element {
    
    // Verificar si el rol del usuario está en la lista de roles permitidos
    const hasPermission = allowedRoles.includes(userRole);
    
    if (!hasPermission) {
        return <Navigate to={redirectTo} replace />;
    }
    
    return <>{children}</>;
}
