/**
 * Reparacion.container.tsx
 * 
 * Container Component (Smart Component) para la gestión de reparaciones.
 * 
 * Responsabilidades:
 * - Coordinar hooks de datos y acciones
 * - Gestionar estado local del formulario
 * - Integración con Redux
 * - Proveer contexto a componentes hijos
 * - NO contiene UI directamente (solo lógica)
 * 
 * @module Reparacion/Reparacion.container
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useAppSelector } from '../../redux-tool-kit/hooks/useAppSelector';
import { ReparacionProvider } from './ReparacionContext';
import { useReparacionData } from './hooks/useReparacionData';
import { useReparacionActions } from './hooks/useReparacionActions';
import { ReparacionType } from '../../types/reparacion';

// TODO: Importar ReparacionLayout cuando esté creado
// import { ReparacionLayout } from './ReparacionLayout.component';

/**
 * Container component principal para reparaciones.
 * 
 * Este componente actúa como el "cerebro" del módulo de reparación,
 * coordinando todos los hooks y proporcionando el contexto necesario
 * a los componentes de presentación.
 * 
 * @example
 * ```tsx
 * // En Routes.tsx
 * <Route path="/reparacion/:id" component={ReparacionContainer} />
 * ```
 */
export default function ReparacionContainer(): React.ReactElement | null {
    // ========================================================================
    // DATOS DESDE REDUX
    // ========================================================================
    
    /**
     * Obtener información del usuario actual (admin check)
     */
    const usuarioActual = useAppSelector(state => state.app.usuario);
    const isAdmin = useMemo(() => {
        return usuarioActual?.data.Admin === true;
    }, [usuarioActual]);
    
    /**
     * Obtener datos de la reparación y entidades relacionadas
     */
    const {
        reparacion: reparacionFromRedux,
        usuario,
        drone,
        modelo,
        isNew,
        isLoading,
        notFound,
        reparacionId
    } = useReparacionData();
    
    // ========================================================================
    // ESTADO LOCAL DEL FORMULARIO
    // ========================================================================
    
    /**
     * Estado local de la reparación (para edición)
     * Si es nueva, inicializar con estructura vacía
     */
    const [reparacion, setReparacion] = useState<ReparacionType>(() => {
        if (reparacionFromRedux) {
            return reparacionFromRedux;
        }
        
        // Crear nueva reparación vacía
        return {
            id: 'new',
            data: {
                UsuarioRep: '',
                DroneId: '',
                EstadoRep: 'Consulta',
                EstadoAnterior: '',
                DescripcionUsuRep: '',
                DiagnosticoTecRep: '',
                DescripcionTecRep: '',
                FechaConsultaRep: Date.now(),
                FechaRecibidoRep: 0,
                FechaRevisadoRep: 0,
                FechaPresupuestadoRep: 0,
                FechaAceptadoRep: 0,
                FechaReparadoRep: 0,
                FechaEntregadoRep: 0,
                FechaFinalizadoRep: 0,
                PrecioPresupuestoDiag: 0,
                PrecioManoObra: 0,
                PrecioReparacion: 0,
                PrecioFinal: 0,
                ObservacionesRep: '',
                AnotacionesPrivRep: '',
                TextoEntregaRep: '',
                SeguimientoRep: '',
                EnlaceDriveRep: '',
                ObsRepuestos: '',
                TxtRepuestosRep: '',
                FotosRep: [],
                FotoAntesRep: '',
                FotoDespuesRep: '',
                DocumentosRep: []
            }
        };
    });
    
    /**
     * Copia original para dirty checking
     */
    const [reparacionOriginal] = useState<ReparacionType>(reparacion);
    
    /**
     * Calcular si hay cambios sin guardar (dirty)
     */
    const isDirty = useMemo(() => {
        return JSON.stringify(reparacion) !== JSON.stringify(reparacionOriginal);
    }, [reparacion, reparacionOriginal]);
    
    /**
     * Estados de UI
     */
    const [isSaving, setIsSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    
    // ========================================================================
    // HANDLERS DE CAMBIOS
    // ========================================================================
    
    /**
     * Maneja cambios en campos individuales del formulario
     */
    const handleChange = useCallback((field: string, value: unknown) => {
        setReparacion(prev => ({
            ...prev,
            data: {
                ...prev.data,
                [field]: value
            }
        }));
        
        // Limpiar error de validación del campo si existe
        if (validationErrors[field]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [validationErrors]);
    
    // ========================================================================
    // ACCIONES
    // ========================================================================
    
    /**
     * Callback después de guardar exitosamente
     */
    const handleSaveSuccess = useCallback((savedReparacion: ReparacionType) => {
        // Actualizar estado local con la reparación guardada
        setReparacion(savedReparacion);
        
        // Si era nueva, redirigir a la URL con el ID real
        if (isNew && savedReparacion.id !== 'new') {
            // TODO: Redirigir a /reparacion/{id}
            console.log('Redireccionar a:', `/reparacion/${savedReparacion.id}`);
        }
    }, [isNew]);
    
    /**
     * Obtener acciones disponibles (save, delete, changeState, etc.)
     */
    const {
        save,
        deleteReparacion,
        changeState,
        cancel,
        sendEmail,
        sendSMS,
        uploadFile,
        deleteFile
    } = useReparacionActions(reparacion, isDirty, isNew, handleSaveSuccess);
    
    /**
     * Wrapper para save que maneja el estado de loading
     */
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            await save({ showConfirmation: true });
        } finally {
            setIsSaving(false);
        }
    }, [save]);
    
    /**
     * Wrapper para changeState (avanzar a nuevo estado)
     */
    const handleAdvanceState = useCallback(async (nuevoEstado: string) => {
        setIsSaving(true);
        try {
            await changeState(nuevoEstado, {
                showConfirmation: true,
                sendEmail: false // TODO: Configurar según el estado
            });
        } finally {
            setIsSaving(false);
        }
    }, [changeState]);
    
    /**
     * Verifica si se puede avanzar a un estado específico
     */
    const canAdvanceTo = useCallback((): boolean => {
        if (!isAdmin) return false;
        if (!reparacion) return false;
        
        // TODO: Implementar lógica de validación de transiciones
        // Por ahora, permitir cualquier transición para admin
        return true;
    }, [isAdmin, reparacion]);
    
    // ========================================================================
    // VALIDACIONES
    // ========================================================================
    
    // TODO: Implementar validateForm cuando se necesite validación específica
    // const validateForm = useCallback((): boolean => {
    //     const errors: Record<string, string> = {};
    //     
    //     // Validar usuario
    //     if (!reparacion.data.UsuarioRep) {
    //         errors.UsuarioRep = 'El cliente es requerido';
    //     }
    //     
    //     // ... más validaciones
    //     
    //     setValidationErrors(errors);
    //     return Object.keys(errors).length === 0;
    // }, [reparacion]);
    
    // ========================================================================
    // MANEJO DE ESTADOS ESPECIALES
    // ========================================================================
    
    /**
     * Si está cargando, mostrar spinner
     */
    if (isLoading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando reparación...</p>
            </div>
        );
    }
    
    /**
     * Si no se encontró (404)
     */
    if (notFound) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Reparación no encontrada</h4>
                    <p>
                        La reparación con ID <strong>{reparacionId}</strong> no existe
                        o no tienes permisos para acceder a ella.
                    </p>
                    <hr />
                    <button 
                        className="btn btn-secondary"
                        onClick={() => window.history.back()}
                    >
                        Volver atrás
                    </button>
                </div>
            </div>
        );
    }
    
    /**
     * Si no es admin y no es nueva, no permitir edición
     */
    if (!isAdmin && !isNew) {
        return (
            <div className="container mt-5">
                <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Acceso Denegado</h4>
                    <p>
                        No tienes permisos para editar reparaciones.
                        Solo los administradores pueden realizar esta acción.
                    </p>
                    <hr />
                    <button 
                        className="btn btn-secondary"
                        onClick={() => window.history.back()}
                    >
                        Volver atrás
                    </button>
                </div>
            </div>
        );
    }
    
    // ========================================================================
    // RENDER CON PROVIDER
    // ========================================================================
    
    /**
     * Preparar props para el Provider
     */
    const providerProps = {
        // Datos principales
        reparacion,
        usuario,
        drone,
        modelo,
        
        // Estado UI
        isAdmin,
        isNew,
        isDirty,
        isLoading: false, // Ya manejado arriba
        isSaving,
        
        // Acciones principales
        onSave: handleSave,
        onCancel: cancel,
        onChange: handleChange,
        
        // Transiciones de estado
        onAdvanceState: handleAdvanceState,
        canAdvanceTo,
        
        // Acciones opcionales
        onDelete: deleteReparacion,
        onSendEmail: sendEmail,
        onSendSMS: sendSMS,
        onUploadFile: uploadFile,
        onDeleteFile: deleteFile,
        
        // Validaciones
        validationErrors
    };
    
    return (
        <ReparacionProvider {...providerProps}>
            {/* TODO: Reemplazar con ReparacionLayout cuando esté implementado */}
            <div className="container mt-4">
                <div className="alert alert-info">
                    <h4>Container Component Funcionando ✅</h4>
                    <p>Datos cargados correctamente:</p>
                    <ul>
                        <li>Usuario: {usuario?.data.NombreUsu || 'No asignado'}</li>
                        <li>Drone: {drone?.data.Nombre || 'No asignado'}</li>
                        <li>Modelo: {modelo?.data.NombreModelo || 'No asignado'}</li>
                        <li>Estado: {reparacion.data.EstadoRep}</li>
                        <li>Es Nueva: {isNew ? 'Sí' : 'No'}</li>
                        <li>Es Admin: {isAdmin ? 'Sí' : 'No'}</li>
                        <li>Tiene Cambios: {isDirty ? 'Sí' : 'No'}</li>
                    </ul>
                    <button 
                        className="btn btn-primary me-2"
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => cancel()}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </ReparacionProvider>
    );
}
