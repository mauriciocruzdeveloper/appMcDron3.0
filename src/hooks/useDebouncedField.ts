import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { actualizarCampoReparacionAsync } from '../redux-tool-kit/reparacion/reparacion.actions';
import { DataReparacion } from '../types/reparacion';
import { useDebounce } from './useDebounce';

interface UseDebouncedFieldProps {
    reparacionId: string;
    campo: keyof DataReparacion;
    valorInicial: any;
    delay?: number;
    isDateField?: boolean;
}

/**
 * Hook para campos de reparación con debounce
 * Wrapper sobre useDebounce que configura automáticamente el guardado en reparaciones
 * 
 * @param reparacionId - ID de la reparación
 * @param campo - Campo de DataReparacion a actualizar
 * @param valorInicial - Valor inicial del campo
 * @param delay - Milisegundos de espera antes de guardar (default: 1500ms)
 * @param isDateField - Si es un campo de fecha, se convierte a timestamp antes de guardar
 */
export const useDebouncedField = ({ 
    reparacionId, 
    campo, 
    valorInicial,
    delay = 1500,
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
    
    // Transformación para campos de fecha
    const transformBeforeSave = isDateField 
        ? (localValue: any) => {
            if (typeof localValue === 'string' && localValue) {
                const anio = Number(localValue.substr(0, 4));
                const mes = Number(localValue.substr(5, 2)) - 1;
                const dia = Number(localValue.substr(8, 2));
                return String(Number(new Date(anio, mes, dia).getTime()) + 10800001);
            }
            return localValue;
          }
        : undefined;
    
    // Usar el hook genérico con la configuración específica para reparaciones
    return useDebounce({
        valorInicial: getInitialValue(),
        onSave: async (valor) => {
            await dispatch(actualizarCampoReparacionAsync({
                reparacionId,
                campo,
                valor
            })).unwrap();
        },
        delay,
        transformBeforeSave
    });
};
