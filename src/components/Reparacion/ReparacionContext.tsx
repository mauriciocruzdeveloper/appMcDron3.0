/**
 * ReparacionContext.tsx
 * 
 * Context Provider para el componente de Reparación.
 * Centraliza el estado y las operaciones relacionadas con una reparación,
 * proporcionando acceso a datos, acciones y validaciones para todos los
 * componentes hijos.
 * 
 * **Phase 3 Integration:** Este Context recibe datos del Container que
 * los obtiene de Redux mediante useReparacionRedux hook.
 * 
 * @module Reparacion/ReparacionContext
 */

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { ReparacionContextValue, ReparacionProviderProps } from './types/context.types';

/**
 * Context para compartir el estado de la reparación entre componentes
 */
const ReparacionContext = createContext<ReparacionContextValue | undefined>(undefined);

/**
 * Provider que envuelve los componentes de reparación y proporciona
 * acceso al estado y operaciones compartidas.
 * 
 * @example
 * ```tsx
 * <ReparacionProvider
 *   reparacion={reparacion}
 *   usuario={usuario}
 *   drone={drone}
 *   modelo={modelo}
 *   isAdmin={true}
 *   isNew={false}
 *   isDirty={false}
 *   onSave={handleSave}
 *   onCancel={handleCancel}
 *   onChange={handleChange}
 *   onAdvanceState={handleAdvanceState}
 *   canAdvanceTo={canAdvanceTo}
 * >
 *   <ReparacionLayout />
 * </ReparacionProvider>
 * ```
 */
export function ReparacionProvider({
    reparacion,
    usuario,
    drone,
    modelo,
    isAdmin,
    isNew,
    isDirty,
    onSave,
    onCancel,
    onChange,
    onAdvanceState,
    canAdvanceTo,
    onDelete,
    onSendEmail,
    onSendSMS,
    onUploadFile,
    onDeleteFile,
    validationErrors,
    isLoading,
    isSaving,
    children
}: ReparacionProviderProps): React.ReactElement {
    
    /**
     * Crea una copia original de la reparación para dirty checking
     * En el futuro esto vendrá del hook useReparacionForm
     */
    const reparacionOriginal = useMemo(() => reparacion, []);
    
    /**
     * Verifica si hay cambios pendientes
     */
    const hasChanges = useMemo(() => {
        return JSON.stringify(reparacion) !== JSON.stringify(reparacionOriginal);
    }, [reparacion, reparacionOriginal]);
    
    /**
     * Helper para actualizar un solo campo
     */
    const updateField = useCallback((field: string, value: unknown) => {
        onChange(field, value);
    }, [onChange]);
    
    /**
     * Helper para actualizar múltiples campos a la vez
     */
    const updateMultipleFields = useCallback((fields: Record<string, unknown>) => {
        Object.entries(fields).forEach(([field, value]) => {
            onChange(field, value);
        });
    }, [onChange]);
    
    /**
     * Resetea el formulario al estado original
     */
    const resetForm = useCallback(() => {
        Object.entries(reparacionOriginal.data).forEach(([field, value]) => {
            onChange(field, value);
        });
    }, [reparacionOriginal, onChange]);
    
    /**
     * Obtiene el estado actual de la reparación
     */
    const getCurrentEstado = useCallback(() => {
        return reparacion.data.EstadoRep;
    }, [reparacion.data.EstadoRep]);
    
    /**
     * Obtiene la lista de posibles próximos estados
     */
    const getNextEstados = useCallback(() => {
        const estadoActual = reparacion.data.EstadoRep;
        
        // Define las transiciones válidas según el estado actual
        const transiciones: Record<string, string[]> = {
            'Consulta': ['Respondido', 'Transito'],
            'Respondido': ['Transito'],
            'Transito': ['Recibido'],
            'Recibido': ['Revisado', 'Repuestos'],
            'Revisado': ['Presupuestado', 'Repuestos'],
            'Presupuestado': ['Aceptado', 'Rechazado', 'Repuestos'],
            'Aceptado': ['Reparado', 'Diagnosticado', 'Repuestos'],
            'Reparado': ['Enviado', 'Finalizado'],
            'Diagnosticado': ['Enviado', 'Finalizado'],
            'Repuestos': ['Recibido', 'Revisado', 'Presupuestado', 'Aceptado'],
            'Enviado': ['Finalizado'],
            'Finalizado': ['Cobrado'],
            'Cobrado': [],
            'Rechazado': []
        };
        
        return transiciones[estadoActual] || [];
    }, [reparacion.data.EstadoRep]);
    
    /**
     * Validaciones - implementaciones placeholder
     */
    const isValid = useMemo(() => {
        return Object.keys(validationErrors || {}).length === 0;
    }, [validationErrors]);
    
    const validateField = useCallback((field: string): string | null => {
        return (validationErrors || {})[field] || null;
    }, [validationErrors]);
    
    const validateAll = useCallback((): boolean => {
        return isValid;
    }, [isValid]);
    
    /**
     * Memoiza el valor del contexto para evitar re-renders innecesarios
     * Solo se recalcula cuando cambian las dependencias
     */
    const contextValue = useMemo<ReparacionContextValue>(() => ({
        // Datos principales
        reparacion,
        reparacionOriginal,
        usuario,
        drone,
        modelo,
        
        // Estado de la UI
        isAdmin,
        isNew,
        isDirty,
        hasChanges,
        isLoading: isLoading || false,
        isSaving: isSaving || false,
        
        // Acciones principales
        onSave,
        onCancel,
        onChange,
        updateField,
        updateMultipleFields,
        resetForm,
        
        // Transiciones de estado
        onAdvanceState,
        canAdvanceTo,
        getCurrentEstado,
        getNextEstados,
        
        // Acciones opcionales
        onDelete: onDelete || undefined,
        onSendEmail: onSendEmail || undefined,
        onSendSMS: onSendSMS || undefined,
        onUploadFile: onUploadFile || undefined,
        onDeleteFile: onDeleteFile || undefined,
        
        // Validaciones
        validationErrors: validationErrors || {},
        isValid,
        validateField,
        validateAll
    }), [
        reparacion,
        reparacionOriginal,
        usuario,
        drone,
        modelo,
        isAdmin,
        isNew,
        isDirty,
        hasChanges,
        isLoading,
        isSaving,
        onSave,
        onCancel,
        onChange,
        updateField,
        updateMultipleFields,
        resetForm,
        onAdvanceState,
        canAdvanceTo,
        getCurrentEstado,
        getNextEstados,
        onDelete,
        onSendEmail,
        onSendSMS,
        onUploadFile,
        onDeleteFile,
        validationErrors,
        isValid,
        validateField,
        validateAll
    ]);
    
    return (
        <ReparacionContext.Provider value={contextValue}>
            {children}
        </ReparacionContext.Provider>
    );
}

/**
 * Hook personalizado para acceder al contexto de reparación.
 * 
 * @throws {Error} Si se usa fuera de un ReparacionProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { reparacion, onChange, isDirty } = useReparacion();
 *   
 *   return (
 *     <input
 *       value={reparacion.data.DescripcionUsuRep}
 *       onChange={(e) => onChange('DescripcionUsuRep', e.target.value)}
 *     />
 *   );
 * }
 * ```
 */
export function useReparacion(): ReparacionContextValue {
    const context = useContext(ReparacionContext);
    
    if (context === undefined) {
        throw new Error(
            'useReparacion debe ser usado dentro de un ReparacionProvider. ' +
            'Asegúrate de envolver tu componente con <ReparacionProvider>.'
        );
    }
    
    return context;
}

/**
 * Tipo de retorno para useReparacionPermissions
 */
interface ReparacionPermissions {
    canEdit: () => boolean;
    canDelete: () => boolean;
    canAdvance: (estadoNombre: string) => boolean;
    canSave: () => boolean;
}

/**
 * Hook auxiliar para verificar si el usuario puede realizar una acción específica.
 * Combina permisos de admin con estado de la reparación.
 * 
 * @returns Objeto con funciones de verificación de permisos
 * 
 * @example
 * ```tsx
 * function ActionButton() {
 *   const { canEdit, canDelete, canAdvance } = useReparacionPermissions();
 *   
 *   return (
 *     <>
 *       <button disabled={!canEdit()}>Editar</button>
 *       <button disabled={!canDelete()}>Eliminar</button>
 *       <button disabled={!canAdvance('Presupuestado')}>Presupuestar</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useReparacionPermissions(): ReparacionPermissions {
    const { isAdmin, reparacion, canAdvanceTo, isDirty } = useReparacion();
    
    /**
     * Verifica si el usuario puede editar la reparación
     */
    const canEdit = useCallback((): boolean => {
        return isAdmin;
    }, [isAdmin]);
    
    /**
     * Verifica si el usuario puede eliminar la reparación
     */
    const canDelete = useCallback((): boolean => {
        // Solo admin puede eliminar y solo si no está en estados finales
        if (!isAdmin) return false;
        
        const estadosFinales = ['Finalizado', 'Cobrado', 'Rechazado'];
        return !estadosFinales.includes(reparacion.data.EstadoRep);
    }, [isAdmin, reparacion.data.EstadoRep]);
    
    /**
     * Verifica si se puede avanzar a un estado específico
     */
    const canAdvance = useCallback((estadoNombre: string): boolean => {
        return canAdvanceTo(estadoNombre);
    }, [canAdvanceTo]);
    
    /**
     * Verifica si se puede guardar (hay cambios pendientes)
     */
    const canSave = useCallback((): boolean => {
        return isDirty && isAdmin;
    }, [isDirty, isAdmin]);
    
    return {
        canEdit,
        canDelete,
        canAdvance,
        canSave
    };
}

/**
 * Tipo de retorno para useReparacionStatus
 */
interface ReparacionStatus {
    estadoActual: string;
    esEstadoFinal: boolean;
    esEstadoPausado: boolean;
    colorEstado: string;
}

/**
 * Hook auxiliar para obtener información de estado de la reparación.
 * Proporciona helpers útiles para trabajar con el estado actual.
 * 
 * @returns Objeto con información y helpers del estado
 * 
 * @example
 * ```tsx
 * function StatusBadge() {
 *   const { estadoActual, esEstadoFinal, colorEstado } = useReparacionStatus();
 *   
 *   return (
 *     <Badge bg={colorEstado}>
 *       {estadoActual}
 *       {esEstadoFinal && ' ✓'}
 *     </Badge>
 *   );
 * }
 * ```
 */
export function useReparacionStatus(): ReparacionStatus {
    const { reparacion } = useReparacion();
    
    const estadoActual = useMemo(() => {
        return reparacion.data.EstadoRep;
    }, [reparacion.data.EstadoRep]);
    
    const esEstadoFinal = useMemo(() => {
        const estadosFinales = ['Finalizado', 'Cobrado', 'Rechazado', 'Cancelado'];
        return estadosFinales.includes(estadoActual);
    }, [estadoActual]);
    
    const esEstadoPausado = useMemo(() => {
        return estadoActual === 'Repuestos';
    }, [estadoActual]);
    
    const colorEstado = useMemo(() => {
        const colores: Record<string, string> = {
            'Consulta': 'secondary',
            'Transito': 'info',
            'Respondido': 'info',
            'Recibido': 'primary',
            'Revisado': 'warning',
            'Presupuestado': 'warning',
            'Aceptado': 'success',
            'Reparado': 'success',
            'Diagnosticado': 'success',
            'Enviado': 'info',
            'Finalizado': 'dark',
            'Cobrado': 'dark',
            'Rechazado': 'danger',
            'Repuestos': 'danger',
            'Cancelado': 'secondary'
        };
        
        return colores[estadoActual] || 'secondary';
    }, [estadoActual]);
    
    return {
        estadoActual,
        esEstadoFinal,
        esEstadoPausado,
        colorEstado
    };
}
