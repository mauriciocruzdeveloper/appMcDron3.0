import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { actualizarCampoReparacionAsync } from '../redux-tool-kit/reparacion/reparacion.actions';
import { DataReparacion } from '../types/reparacion';

interface UseDebouncedFieldProps {
    reparacionId: string;
    campo: keyof DataReparacion;
    valorInicial: any;
    delay?: number;
}

/**
 * Hook para campos de texto con debounce
 * Mantiene el valor local para UI inmediata y guarda a Redux/Firestore con delay
 * 
 * @param reparacionId - ID de la reparación
 * @param campo - Campo de DataReparacion a actualizar
 * @param valorInicial - Valor inicial del campo
 * @param delay - Milisegundos de espera antes de guardar (default: 1000ms)
 */
export const useDebouncedField = ({ 
    reparacionId, 
    campo, 
    valorInicial,
    delay = 1000 
}: UseDebouncedFieldProps) => {
    const dispatch = useAppDispatch();
    const [localValue, setLocalValue] = useState(valorInicial);
    const [isSaving, setIsSaving] = useState(false);

    // Actualizar valor local cuando cambia el valor inicial (ej: cambio de reparación)
    useEffect(() => {
        setLocalValue(valorInicial);
    }, [valorInicial]);

    // Efecto de debounce para guardar
    useEffect(() => {
        // Si el valor local es igual al inicial, no hacer nada
        if (localValue === valorInicial) return;

        setIsSaving(true);
        const timeoutId = setTimeout(() => {
            dispatch(actualizarCampoReparacionAsync({
                reparacionId,
                campo,
                valor: localValue
            })).finally(() => {
                setIsSaving(false);
            });
        }, delay);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [localValue, reparacionId, campo, delay, dispatch, valorInicial]);

    const handleChange = useCallback((value: any) => {
        setLocalValue(value);
    }, []);

    return {
        value: localValue,
        onChange: handleChange,
        isSaving
    };
};
