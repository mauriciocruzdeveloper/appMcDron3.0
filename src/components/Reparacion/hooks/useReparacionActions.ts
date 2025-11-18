/**
 * useReparacionActions.ts
 * 
 * Hook personalizado para gestionar todas las acciones relacionadas con
 * una reparación (guardar, eliminar, cambiar estado, comunicaciones, archivos).
 * 
 * Responsabilidades:
 * - Operaciones CRUD (crear, actualizar, eliminar)
 * - Transiciones de estado
 * - Validaciones
 * - Comunicaciones (email, SMS)
 * - Gestión de archivos
 * 
 * @module Reparacion/hooks/useReparacionActions
 */

import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppDispatch } from '../../../redux-tool-kit/hooks/useAppDispatch';
import { guardarReparacionAsync, eliminarReparacionAsync } from '../../../redux-tool-kit/reparacion/reparacion.actions';
import { ReparacionType } from '../../../types/reparacion';
import { useModal } from '../../../hooks/useModal';

/**
 * Tipo para el resultado de operaciones async
 */
interface OperationResult {
    success: boolean;
    error?: string;
    data?: unknown;
}

/**
 * Opciones para la operación de guardado
 */
interface SaveOptions {
    /** Mostrar modal de confirmación al guardar */
    showConfirmation?: boolean;
    /** Redirigir después de guardar */
    redirectOnSuccess?: boolean;
    /** Ruta de redirección personalizada */
    redirectPath?: string;
    /** Callback personalizado después de guardar */
    onSuccess?: (reparacion: ReparacionType) => void;
    /** Callback personalizado en caso de error */
    onError?: (error: string) => void;
}

/**
 * Opciones para la operación de eliminación
 */
interface DeleteOptions {
    /** Mostrar modal de confirmación antes de eliminar */
    showConfirmation?: boolean;
    /** Ruta de redirección después de eliminar */
    redirectPath?: string;
    /** Callback personalizado después de eliminar */
    onSuccess?: () => void;
    /** Callback personalizado en caso de error */
    onError?: (error: string) => void;
}

/**
 * Opciones para cambio de estado
 */
interface StateChangeOptions {
    /** Mostrar modal de confirmación */
    showConfirmation?: boolean;
    /** Enviar email al cambiar estado */
    sendEmail?: boolean;
    /** Tipo de email a enviar */
    emailType?: string;
    /** Callback después del cambio */
    onSuccess?: (nuevoEstado: string) => void;
    /** Callback en caso de error */
    onError?: (error: string) => void;
}

/**
 * Datos retornados por el hook useReparacionActions
 */
export interface ReparacionActions {
    /** Guarda la reparación actual */
    save: (options?: SaveOptions) => Promise<OperationResult>;
    
    /** Elimina la reparación actual */
    deleteReparacion: (options?: DeleteOptions) => Promise<OperationResult>;
    
    /** Cambia el estado de la reparación */
    changeState: (nuevoEstado: string, options?: StateChangeOptions) => Promise<OperationResult>;
    
    /** Cancela la edición y vuelve atrás */
    cancel: (force?: boolean) => void;
    
    /** Envía un email relacionado con la reparación */
    sendEmail: (tipo: string) => Promise<OperationResult>;
    
    /** Envía un SMS al cliente */
    sendSMS: () => Promise<OperationResult>;
    
    /** Sube un archivo (foto o documento) */
    uploadFile: (file: File, tipo: 'foto' | 'documento') => Promise<OperationResult>;
    
    /** Elimina un archivo */
    deleteFile: (fileId: string, tipo: 'foto' | 'documento') => Promise<OperationResult>;
    
    /** Indica si hay una operación en progreso */
    isProcessing: boolean;
}

/**
 * Hook para gestionar todas las acciones de una reparación.
 * 
 * Proporciona funciones para guardar, eliminar, cambiar estado y otras
 * operaciones relacionadas con la reparación.
 * 
 * @param reparacion - La reparación actual
 * @param isDirty - Indica si hay cambios sin guardar
 * @param isNew - Indica si es una nueva reparación
 * @param onSaveSuccess - Callback opcional después de guardar exitosamente
 * 
 * @returns {ReparacionActions} Objeto con todas las acciones disponibles
 * 
 * @example
 * ```tsx
 * function ReparacionContainer() {
 *   const { reparacion, isDirty, isNew } = useReparacionData();
 *   const {
 *     save,
 *     deleteReparacion,
 *     changeState,
 *     cancel,
 *     isProcessing
 *   } = useReparacionActions(reparacion, isDirty, isNew);
 *   
 *   return (
 *     <div>
 *       <button onClick={() => save()} disabled={isProcessing}>
 *         Guardar
 *       </button>
 *       <button onClick={() => cancel()}>Cancelar</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useReparacionActions(
    reparacion: ReparacionType | undefined,
    isDirty: boolean,
    isNew: boolean,
    onSaveSuccess?: (reparacion: ReparacionType) => void
): ReparacionActions {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const { openModal } = useModal();
    
    // TODO: Implementar estado de procesamiento
    const isProcessing = false;
    
    /**
     * Guarda la reparación (crear o actualizar)
     */
    const save = useCallback(async (options: SaveOptions = {}): Promise<OperationResult> => {
        const {
            showConfirmation = true,
            redirectOnSuccess = false,
            redirectPath = '/reparaciones',
            onSuccess,
            onError
        } = options;
        
        // Validar que existe la reparación
        if (!reparacion) {
            const error = 'No hay datos de reparación para guardar';
            if (onError) onError(error);
            
            openModal({
                tipo: 'danger',
                titulo: 'Error',
                mensaje: error
            });
            
            return { success: false, error };
        }
        
        try {
            // Dispatch de la acción async de Redux
            const result = await dispatch(guardarReparacionAsync(reparacion));
            
            if (guardarReparacionAsync.fulfilled.match(result)) {
                // Éxito
                const savedReparacion = result.payload as ReparacionType;
                
                // Mostrar confirmación si se solicitó
                if (showConfirmation) {
                    openModal({
                        tipo: 'success',
                        titulo: 'Guardado',
                        mensaje: `Reparación ${isNew ? 'creada' : 'actualizada'} correctamente`
                    });
                }
                
                // Ejecutar callbacks
                if (onSuccess) onSuccess(savedReparacion);
                if (onSaveSuccess) onSaveSuccess(savedReparacion);
                
                // Redirigir si se solicitó
                if (redirectOnSuccess) {
                    history.push(redirectPath);
                }
                
                return { success: true, data: savedReparacion };
            } else {
                // Error
                const error = result.error?.message || 'Error al guardar la reparación';
                
                if (onError) onError(error);
                
                openModal({
                    tipo: 'danger',
                    titulo: 'Error al Guardar',
                    mensaje: error
                });
                
                return { success: false, error };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            
            if (onError) onError(errorMessage);
            
            openModal({
                tipo: 'danger',
                titulo: 'Error',
                mensaje: errorMessage
            });
            
            return { success: false, error: errorMessage };
        }
    }, [reparacion, isNew, dispatch, openModal, history, onSaveSuccess]);
    
    /**
     * Elimina la reparación actual
     */
    const deleteReparacion = useCallback(async (options: DeleteOptions = {}): Promise<OperationResult> => {
        const {
            showConfirmation = true,
            redirectPath = '/reparaciones',
            onSuccess,
            onError
        } = options;
        
        // Validar que existe la reparación
        if (!reparacion || isNew) {
            const error = 'No se puede eliminar una reparación que no existe';
            if (onError) onError(error);
            return { success: false, error };
        }
        
        // Función para ejecutar la eliminación
        const executeDelete = async (): Promise<OperationResult> => {
            try {
                const result = await dispatch(eliminarReparacionAsync(reparacion.id));
                
                if (eliminarReparacionAsync.fulfilled.match(result)) {
                    // Éxito
                    openModal({
                        tipo: 'success',
                        titulo: 'Eliminado',
                        mensaje: 'Reparación eliminada correctamente'
                    });
                    
                    if (onSuccess) onSuccess();
                    
                    // Redirigir
                    history.push(redirectPath);
                    
                    return { success: true };
                } else {
                    // Error
                    const error = result.error?.message || 'Error al eliminar la reparación';
                    
                    if (onError) onError(error);
                    
                    openModal({
                        tipo: 'danger',
                        titulo: 'Error al Eliminar',
                        mensaje: error
                    });
                    
                    return { success: false, error };
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                
                if (onError) onError(errorMessage);
                
                openModal({
                    tipo: 'danger',
                    titulo: 'Error',
                    mensaje: errorMessage
                });
                
                return { success: false, error: errorMessage };
            }
        };
        
        // Mostrar confirmación si se solicitó
        if (showConfirmation) {
            return new Promise((resolve) => {
                openModal({
                    tipo: 'warning',
                    titulo: 'Confirmar Eliminación',
                    mensaje: '¿Estás seguro de que deseas eliminar esta reparación? Esta acción no se puede deshacer.',
                    confirmCallback: async () => {
                        const result = await executeDelete();
                        resolve(result);
                    },
                    cancelCallback: () => {
                        resolve({ success: false, error: 'Operación cancelada por el usuario' });
                    }
                });
            });
        } else {
            return executeDelete();
        }
    }, [reparacion, isNew, dispatch, openModal, history]);
    
    /**
     * Cambia el estado de la reparación
     */
    const changeState = useCallback(async (
        nuevoEstado: string,
        options: StateChangeOptions = {}
    ): Promise<OperationResult> => {
        const {
            showConfirmation = true,
            sendEmail = false,
            emailType,
            onSuccess,
            onError
        } = options;
        
        // Validar que existe la reparación
        if (!reparacion) {
            const error = 'No hay reparación para cambiar de estado';
            if (onError) onError(error);
            return { success: false, error };
        }
        
        // Validar que el estado es diferente
        if (reparacion.data.EstadoRep === nuevoEstado) {
            const error = 'La reparación ya está en ese estado';
            if (onError) onError(error);
            return { success: false, error };
        }
        
        // Función para ejecutar el cambio
        const executeStateChange = async (): Promise<OperationResult> => {
            try {
                // Crear copia con nuevo estado
                const reparacionActualizada: ReparacionType = {
                    ...reparacion,
                    data: {
                        ...reparacion.data,
                        EstadoRep: nuevoEstado,
                        EstadoAnterior: reparacion.data.EstadoRep
                    }
                };
                
                // Guardar con el nuevo estado
                const result = await dispatch(guardarReparacionAsync(reparacionActualizada));
                
                if (guardarReparacionAsync.fulfilled.match(result)) {
                    // Éxito
                    const savedReparacion = result.payload as ReparacionType;
                    
                    if (showConfirmation) {
                        openModal({
                            tipo: 'success',
                            titulo: 'Estado Actualizado',
                            mensaje: `Estado cambiado a: ${nuevoEstado}`
                        });
                    }
                    
                    // Enviar email si se solicitó
                    if (sendEmail && emailType) {
                        // TODO: Implementar envío de email
                        console.log(`Enviando email tipo: ${emailType}`);
                    }
                    
                    if (onSuccess) onSuccess(nuevoEstado);
                    if (onSaveSuccess) onSaveSuccess(savedReparacion);
                    
                    return { success: true, data: savedReparacion };
                } else {
                    // Error
                    const error = result.error?.message || 'Error al cambiar el estado';
                    
                    if (onError) onError(error);
                    
                    openModal({
                        tipo: 'danger',
                        titulo: 'Error',
                        mensaje: error
                    });
                    
                    return { success: false, error };
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
                
                if (onError) onError(errorMessage);
                
                openModal({
                    tipo: 'danger',
                    titulo: 'Error',
                    mensaje: errorMessage
                });
                
                return { success: false, error: errorMessage };
            }
        };
        
        return executeStateChange();
    }, [reparacion, dispatch, openModal, onSaveSuccess]);
    
    /**
     * Cancela la edición y vuelve atrás
     */
    const cancel = useCallback((force = false) => {
        // Si no hay cambios o se fuerza, volver directamente
        if (!isDirty || force) {
            history.goBack();
            return;
        }
        
        // Si hay cambios, mostrar confirmación
        openModal({
            tipo: 'warning',
            titulo: 'Cambios sin Guardar',
            mensaje: '¿Deseas descartar los cambios realizados?',
            confirmCallback: () => {
                history.goBack();
            }
        });
    }, [isDirty, history, openModal]);
    
    /**
     * Envía un email relacionado con la reparación
     */
    const sendEmail = useCallback(async (tipo: string): Promise<OperationResult> => {
        // TODO: Implementar envío de email
        console.log(`Enviando email tipo: ${tipo}`);
        
        openModal({
            tipo: 'info',
            titulo: 'Email',
            mensaje: 'Funcionalidad de email en desarrollo'
        });
        
        return { success: false, error: 'No implementado' };
    }, [openModal]);
    
    /**
     * Envía un SMS al cliente
     */
    const sendSMS = useCallback(async (): Promise<OperationResult> => {
        // TODO: Implementar envío de SMS
        console.log('Enviando SMS...');
        
        openModal({
            tipo: 'info',
            titulo: 'SMS',
            mensaje: 'Funcionalidad de SMS en desarrollo'
        });
        
        return { success: false, error: 'No implementado' };
    }, [openModal]);
    
    /**
     * Sube un archivo (foto o documento)
     */
    const uploadFile = useCallback(async (
        file: File,
        tipo: 'foto' | 'documento'
    ): Promise<OperationResult> => {
        // TODO: Implementar subida de archivos
        console.log(`Subiendo ${tipo}:`, file.name);
        
        openModal({
            tipo: 'info',
            titulo: 'Subir Archivo',
            mensaje: 'Funcionalidad de subida en desarrollo'
        });
        
        return { success: false, error: 'No implementado' };
    }, [openModal]);
    
    /**
     * Elimina un archivo
     */
    const deleteFile = useCallback(async (
        fileId: string,
        tipo: 'foto' | 'documento'
    ): Promise<OperationResult> => {
        // TODO: Implementar eliminación de archivos
        console.log(`Eliminando ${tipo}:`, fileId);
        
        openModal({
            tipo: 'info',
            titulo: 'Eliminar Archivo',
            mensaje: 'Funcionalidad de eliminación en desarrollo'
        });
        
        return { success: false, error: 'No implementado' };
    }, [openModal]);
    
    return {
        save,
        deleteReparacion,
        changeState,
        cancel,
        sendEmail,
        sendSMS,
        uploadFile,
        deleteFile,
        isProcessing
    };
}

/**
 * Tipo de retorno para useActionValidation
 */
interface ActionValidation {
    canSave: () => boolean;
    canDelete: () => boolean;
    canChangeState: (nuevoEstado: string) => boolean;
    canSendEmail: () => boolean;
    canUploadFiles: () => boolean;
}

/**
 * Hook auxiliar para verificar si se puede realizar una acción específica.
 * 
 * @param reparacion - La reparación actual
 * @param isAdmin - Si el usuario es administrador
 * @param isDirty - Si hay cambios sin guardar
 * 
 * @returns Objeto con funciones de verificación
 * 
 * @example
 * ```tsx
 * function ActionButtons() {
 *   const { canSave, canDelete, canChangeState } = useActionValidation(
 *     reparacion,
 *     isAdmin,
 *     isDirty
 *   );
 *   
 *   return (
 *     <>
 *       <button disabled={!canSave()}>Guardar</button>
 *       <button disabled={!canDelete()}>Eliminar</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useActionValidation(
    reparacion: ReparacionType | undefined,
    isAdmin: boolean,
    isDirty: boolean
): ActionValidation {
    const canSave = useCallback(() => {
        return isDirty && isAdmin && reparacion !== undefined;
    }, [isDirty, isAdmin, reparacion]);
    
    const canDelete = useCallback(() => {
        if (!isAdmin || !reparacion) return false;
        
        const estadosFinales = ['Finalizado', 'Cobrado', 'Rechazado'];
        return !estadosFinales.includes(reparacion.data.EstadoRep);
    }, [isAdmin, reparacion]);
    
    const canChangeState = useCallback((nuevoEstado: string) => {
        if (!isAdmin || !reparacion) return false;
        return reparacion.data.EstadoRep !== nuevoEstado;
    }, [isAdmin, reparacion]);
    
    const canSendEmail = useCallback(() => {
        return isAdmin && reparacion !== undefined;
    }, [isAdmin, reparacion]);
    
    const canUploadFiles = useCallback(() => {
        return isAdmin && reparacion !== undefined;
    }, [isAdmin, reparacion]);
    
    return {
        canSave,
        canDelete,
        canChangeState,
        canSendEmail,
        canUploadFiles
    };
}
