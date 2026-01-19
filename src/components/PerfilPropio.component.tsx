import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';

/**
 * Componente que redirige al perfil del usuario logueado
 * Accesible para todos los usuarios autenticados
 */
export default function PerfilPropio(): React.ReactElement {
    const usuarioLogueado = useAppSelector(state => state.app.usuario);
    
    if (!usuarioLogueado?.id) {
        return <Navigate to="/inicio" replace />;
    }
    
    // Redirigir a la ruta del usuario con su ID (ruta relativa)
    return <Navigate to={usuarioLogueado.id} replace />;
}
