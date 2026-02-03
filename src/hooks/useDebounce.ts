import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDebounceProps<T> {
    valorInicial: T;
    onSave: (valor: T) => Promise<void>;
    delay?: number;
    transformBeforeSave?: (valor: T) => any;
}

/**
 * Hook genérico para campos con debounce
 * Mantiene el valor local para UI inmediata y ejecuta la función de guardado con delay
 * 
 * @param valorInicial - Valor inicial del campo
 * @param onSave - Función async que se ejecuta para guardar el valor
 * @param delay - Milisegundos de espera antes de guardar (default: 1500ms)
 * @param transformBeforeSave - Función opcional para transformar el valor antes de guardar
 * 
 * @example
 * // Para una reparación
 * const campo = useDebounce({
 *   valorInicial: reparacion.data.DiagnosticoRep,
 *   onSave: async (valor) => {
 *     await dispatch(actualizarCampoReparacionAsync({
 *       reparacionId,
 *       campo: 'DiagnosticoRep',
 *       valor
 *     })).unwrap();
 *   },
 *   delay: 1500
 * });
 * 
 * @example
 * // Para una asignación
 * const descripcion = useDebounce({
 *   valorInicial: asignacion.data.descripcion,
 *   onSave: async (valor) => {
 *     await dispatch(actualizarDescripcionAsignacionAsync({
 *       asignacionId,
 *       descripcion: valor
 *     })).unwrap();
 *   }
 * });
 */
export const useDebounce = <T = string>({ 
    valorInicial, 
    onSave,
    delay = 1500,
    transformBeforeSave
}: UseDebounceProps<T>) => {
    const [localValue, setLocalValue] = useState<T>(valorInicial);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Ref para trackear el último valor que nosotros guardamos
    // Esto evita sobrescribir cambios del usuario mientras se está guardando
    const lastSavedValue = useRef<T>(valorInicial);

    // Actualizar valor local cuando cambia el valor inicial (ej: cambio de entidad)
    // Solo actualizar si el cambio viene de afuera (no de nuestro propio guardado)
    useEffect(() => {
        // Solo actualizar si es diferente al último valor que guardamos
        // Esto previene sobrescribir lo que el usuario escribió mientras se guardaba
        if (valorInicial !== lastSavedValue.current) {
            setLocalValue(valorInicial);
            lastSavedValue.current = valorInicial;
        }
    }, [valorInicial]);

    // Efecto de debounce para guardar
    useEffect(() => {
        // Si el valor local es igual al inicial, no hacer nada
        if (localValue === valorInicial) {
            setIsSaving(false);
            return;
        }

        // Marcar como "guardando" solo después del delay
        const timeoutId = setTimeout(async () => {
            setIsSaving(true);
            setError(null);
            
            try {
                // Transformar el valor si es necesario
                const valorAGuardar = transformBeforeSave 
                    ? transformBeforeSave(localValue) 
                    : localValue;
                
                await onSave(valorAGuardar);
                
                // Actualizar el ref con el valor que acabamos de guardar
                // Esto previene que se sobrescriba cuando Redux actualice
                lastSavedValue.current = localValue;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al guardar');
                console.error('Error en useDebounce:', err);
            } finally {
                setIsSaving(false);
            }
        }, delay);

        return () => {
            clearTimeout(timeoutId);
            setIsSaving(false); // Limpiar el estado al cancelar
        };
    }, [localValue, valorInicial, delay, onSave, transformBeforeSave]);

    const handleChange = useCallback((value: T) => {
        setLocalValue(value);
        setError(null); // Limpiar error al cambiar
    }, []);

    return {
        value: localValue,
        onChange: handleChange,
        isSaving,
        error
    };
};
