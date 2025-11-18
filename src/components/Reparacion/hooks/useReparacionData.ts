/**
 * useReparacionData.ts
 * 
 * Hook personalizado para gestionar la obtención y sincronización de datos
 * relacionados con una reparación desde Redux Store.
 * 
 * Responsabilidades:
 * - Fetch de reparación desde Redux
 * - Obtención de entidades relacionadas (usuario, drone, modelo)
 * - Manejo de estados de carga
 * - Gestión de modo nuevo vs edición
 * 
 * @module Reparacion/hooks/useReparacionData
 */

import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../../redux-tool-kit/hooks/useAppSelector';
import { ReparacionType } from '../../../types/reparacion';
import { Usuario } from '../../../types/usuario';
import { Drone } from '../../../types/drone';
import { ModeloDrone } from '../../../types/modeloDrone';
import { RootState } from '../../../redux-tool-kit/store';

/**
 * Parámetros de la ruta para el componente de reparación
 */
type ParamTypes = {
    id?: string;
};

/**
 * Datos retornados por el hook useReparacionData
 */
export interface ReparacionData {
    /** La reparación actual (puede ser undefined si es nueva o no se encontró) */
    reparacion: ReparacionType | undefined;
    
    /** Usuario asociado a la reparación */
    usuario: Usuario | null;
    
    /** Drone asociado a la reparación */
    drone: Drone | null;
    
    /** Modelo del drone */
    modelo: ModeloDrone | null;
    
    /** Indica si es una nueva reparación */
    isNew: boolean;
    
    /** Indica si los datos están cargando */
    isLoading: boolean;
    
    /** Error si la reparación no se encontró */
    notFound: boolean;
    
    /** ID de la reparación (null si es nueva) */
    reparacionId: string | null;
}

/**
 * Hook para obtener todos los datos relacionados con una reparación.
 * 
 * Obtiene la reparación desde Redux y automáticamente resuelve las
 * entidades relacionadas (usuario, drone, modelo).
 * 
 * @returns {ReparacionData} Objeto con todos los datos de la reparación
 * 
 * @example
 * ```tsx
 * function ReparacionContainer() {
 *   const {
 *     reparacion,
 *     usuario,
 *     drone,
 *     modelo,
 *     isNew,
 *     isLoading,
 *     notFound
 *   } = useReparacionData();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (notFound) return <NotFound />;
 *   
 *   return <ReparacionLayout reparacion={reparacion} usuario={usuario} />;
 * }
 * ```
 */
export function useReparacionData(): ReparacionData {
    // Obtener ID de la URL
    const { id } = useParams<ParamTypes>();
    
    // Determinar si es una nueva reparación
    const isNew = id === 'new';
    const reparacionId = isNew ? null : id;
    
    /**
     * Obtener reparación desde Redux
     * Si es nueva, retorna undefined
     */
    const reparacion = useAppSelector((state: RootState) => {
        if (isNew) return undefined;
        
        // Buscar en el estado de reparacion (singular, diccionario)
        const reparacionesState = state.reparacion;
        
        // Obtener del diccionario por ID
        const found = reparacionesState.coleccionReparaciones[id || ''];
        
        return found;
    });
    
    /**
     * Obtener usuario asociado a la reparación
     */
    const usuario = useAppSelector((state: RootState) => {
        if (!reparacion?.data.UsuarioRep) return null;
        
        const usuariosState = state.usuario;
        const found = usuariosState.coleccionUsuarios[reparacion.data.UsuarioRep];
        
        return found || null;
    });
    
    /**
     * Obtener drone asociado a la reparación
     */
    const drone = useAppSelector((state: RootState) => {
        if (!reparacion?.data.DroneId) return null;
        
        const dronesState = state.drone;
        const found = dronesState.coleccionDrones[reparacion.data.DroneId];
        
        return found || null;
    });
    
    /**
     * Obtener modelo del drone
     */
    const modelo = useAppSelector((state: RootState) => {
        if (!drone?.data.ModeloDroneId) return null;
        
        const modelosState = state.modeloDrone;
        const found = modelosState.coleccionModelosDrone[drone.data.ModeloDroneId];
        
        return found || null;
    });
    
    /**
     * Determinar si los datos están cargando
     * Se considera cargando si:
     * - No es nueva Y no se encontró la reparación
     * - Se encontró reparación pero faltan entidades relacionadas
     */
    const isLoading = useMemo(() => {
        // Si es nueva, no hay nada que cargar
        if (isNew) return false;
        
        // Si no encontramos la reparación, podría estar cargando
        // (esto debería manejarse mejor con un estado de loading en Redux)
        if (!reparacion) return false;
        
        // Por ahora, consideramos que no está cargando si tenemos la reparación
        return false;
    }, [isNew, reparacion]);
    
    /**
     * Verificar si la reparación no fue encontrada
     * Solo aplica cuando NO es nueva y no existe en Redux
     */
    const notFound = useMemo(() => {
        return !isNew && !reparacion;
    }, [isNew, reparacion]);
    
    return {
        reparacion,
        usuario,
        drone,
        modelo,
        isNew,
        isLoading,
        notFound,
        reparacionId: reparacionId || null
    };
}

/**
 * Hook auxiliar para verificar si una reparación tiene todas sus
 * entidades relacionadas cargadas.
 * 
 * @param reparacion - La reparación a verificar
 * @returns true si todas las entidades están disponibles
 * 
 * @example
 * ```tsx
 * function ReparacionStatus() {
 *   const { reparacion, usuario, drone } = useReparacionData();
 *   const isComplete = useReparacionDataComplete(reparacion);
 *   
 *   return isComplete ? <FullView /> : <PartialView />;
 * }
 * ```
 */
export function useReparacionDataComplete(
    reparacion: ReparacionType | undefined
): boolean {
    const { usuario, drone, modelo } = useReparacionData();
    
    return useMemo(() => {
        if (!reparacion) return false;
        
        // Verificar que las entidades requeridas existan
        const hasUsuario = reparacion.data.UsuarioRep ? usuario !== null : true;
        const hasDrone = reparacion.data.DroneId ? drone !== null : true;
        const hasModelo = drone?.data.ModeloDroneId ? modelo !== null : true;
        
        return hasUsuario && hasDrone && hasModelo;
    }, [reparacion, usuario, drone, modelo]);
}

/**
 * Tipo de retorno para useReparacionSummary
 */
interface ReparacionSummary {
    titulo: string;
    subtitulo: string;
    estado: string;
    numeroReparacion: string | null;
}

/**
 * Hook auxiliar para obtener información resumida de la reparación.
 * Útil para mostrar títulos, breadcrumbs, etc.
 * 
 * @returns Objeto con información resumida
 * 
 * @example
 * ```tsx
 * function ReparacionHeader() {
 *   const { titulo, subtitulo, estado } = useReparacionSummary();
 *   
 *   return (
 *     <h1>{titulo}</h1>
 *     <p>{subtitulo}</p>
 *     <Badge>{estado}</Badge>
 *   );
 * }
 * ```
 */
export function useReparacionSummary(): ReparacionSummary {
    const { reparacion, usuario, drone, modelo, isNew } = useReparacionData();
    
    const titulo = useMemo(() => {
        if (isNew) return 'Nueva Reparación';
        
        if (drone && modelo) {
            return `${modelo.data.NombreModelo} - ${drone.data.NumeroSerie || 'Sin Serie'}`;
        }
        
        return `Reparación #${reparacion?.id || ''}`;
    }, [isNew, reparacion, drone, modelo]);
    
    const subtitulo = useMemo(() => {
        if (isNew) return 'Completa los datos para crear una nueva reparación';
        
        if (usuario) {
            return `Cliente: ${usuario.data.NombreUsu} ${usuario.data.ApellidoUsu}`;
        }
        
        return '';
    }, [isNew, usuario]);
    
    const estado = useMemo(() => {
        return reparacion?.data.EstadoRep || 'Consulta';
    }, [reparacion]);
    
    const numeroReparacion = useMemo(() => {
        return reparacion?.id || null;
    }, [reparacion]);
    
    return {
        titulo,
        subtitulo,
        estado,
        numeroReparacion
    };
}
