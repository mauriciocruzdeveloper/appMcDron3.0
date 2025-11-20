/**
 * useReparacionList.ts
 * 
 * Hook para obtener la lista completa de reparaciones.
 * 
 * **Phase 4 - T4.2:** Soporte para Dashboard de Métricas
 * 
 * @module Hooks
 */

import { useState, useEffect } from 'react';
import { ReparacionType } from '../types/reparacion';

/**
 * Hook para obtener lista de reparaciones desde localStorage o API.
 */
export function useReparacionList(): {
    reparaciones: ReparacionType[];
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
} {
    const [reparaciones, setReparaciones] = useState<ReparacionType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        loadReparaciones();
    }, []);
    
    const loadReparaciones = async () => {
        try {
            setIsLoading(true);
            
            // TODO: En producción, llamar a la API
            // const response = await fetch('/api/reparaciones');
            // const data = await response.json();
            
            // Por ahora, cargar desde localStorage
            const stored = localStorage.getItem('reparaciones');
            const data: ReparacionType[] = stored ? JSON.parse(stored) : [];
            
            setReparaciones(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar reparaciones');
            setReparaciones([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return {
        reparaciones,
        isLoading,
        error,
        reload: loadReparaciones
    };
}
