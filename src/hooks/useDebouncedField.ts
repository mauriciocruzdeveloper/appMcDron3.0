import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { actualizarCampoReparacionAsync } from '../redux-tool-kit/reparacion/reparacion.actions';
import { DataReparacion } from '../types/reparacion';

interface UseDebouncedFieldProps {
    reparacionId: string;
    campo: keyof DataReparacion;
    valorInicial: any;
    delay?: number;
    isDateField?: boolean;
}

/**
 * Hook para campos de texto con debounce
 * Mantiene el valor local para UI inmediata y guarda a Redux/Firestore con delay
 * 
 * @param reparacionId - ID de la reparación
 * @param campo - Campo de DataReparacion a actualizar
 * @param valorInicial - Valor inicial del campo
 * @param delay - Milisegundos de espera antes de guardar (default: 1000ms)
 * @param isDateField - Si es un campo de fecha, se convierte a timestamp antes de guardar
 */
export const useDebouncedField = ({ 
    reparacionId, 
    campo, 
    valorInicial,
    delay = 1000,
    isDateField = false
}: UseDebouncedFieldProps) => {
    const dispatch = useAppDispatch();
    
    // Si es campo de fecha, convertir timestamp inicial a formato YYYY-MM-DD
    const getInitialValue = () => {
        if (isDateField && valorInicial && !isNaN(valorInicial)) {
            const d = new Date(parseInt(valorInicial) * 1);
            const yyyy = d.getFullYear();
            const mm = ('0' + (d.getMonth() + 1)).slice(-2);
            const dd = ('0' + d.getDate()).slice(-2);
            return yyyy + '-' + mm + '-' + dd;
        }
        return valorInicial;
    };
    
    const [localValue, setLocalValue] = useState(getInitialValue());
    const [isSaving, setIsSaving] = useState(false);

    // Actualizar valor local cuando cambia el valor inicial (ej: cambio de reparación)
    useEffect(() => {
        setLocalValue(getInitialValue());
    }, [valorInicial]);

    // Efecto de debounce para guardar
    useEffect(() => {
        // Comparar con el valor inicial apropiado
        const valorInicialComparable = isDateField ? getInitialValue() : valorInicial;
        
        // Si el valor local es igual al inicial, no hacer nada
        if (localValue === valorInicialComparable) {
            setIsSaving(false);
            return;
        }

        // Marcar como "guardando" solo después del delay
        const timeoutId = setTimeout(() => {
            setIsSaving(true);
            let valorAGuardar = localValue;
            
            // Si es un campo de fecha, convertir a timestamp
            if (isDateField && typeof localValue === 'string' && localValue) {
                const anio = Number(localValue.substr(0, 4));
                const mes = Number(localValue.substr(5, 2)) - 1;
                const dia = Number(localValue.substr(8, 2));
                valorAGuardar = String(Number(new Date(anio, mes, dia).getTime()) + 10800001);
            }
            
            dispatch(actualizarCampoReparacionAsync({
                reparacionId,
                campo,
                valor: valorAGuardar
            })).finally(() => {
                setIsSaving(false);
            });
        }, delay);

        return () => {
            clearTimeout(timeoutId);
            setIsSaving(false); // Limpiar el estado al cancelar
        };
    }, [localValue, reparacionId, campo, delay, dispatch, valorInicial, isDateField]);

    const handleChange = useCallback((value: any) => {
        setLocalValue(value);
    }, []);

    return {
        value: localValue,
        onChange: handleChange,
        isSaving
    };
};
