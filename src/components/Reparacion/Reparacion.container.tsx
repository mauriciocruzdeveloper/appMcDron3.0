/**
 * Reparacion.container.tsx
 * 
 * Container Component (Smart Component) para la gestión de reparaciones.
 * 
 * **Phase 3 Integration:**
 * Este Container ahora usa `useReparacionRedux` para obtener datos de Redux
 * y coordinar las acciones. El flujo es:
 * 1. useReparacionRedux obtiene reparacion, intervenciones, acciones de Redux
 * 2. Container carga entidades relacionadas (usuario, drone, modelo)
 * 3. Container maneja estado local del formulario (dirty tracking)
 * 4. Container pasa todo al Context como props
 * 
 * Responsabilidades:
 * - Coordinar datos desde Redux (useReparacionRedux)
 * - Gestionar estado local del formulario
 * - Cargar entidades relacionadas
 * - Proveer contexto a componentes hijos
 * - NO contiene UI directamente (solo lógica)
 * 
 * @module Reparacion/Reparacion.container
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../redux-tool-kit/hooks/useAppSelector';
import { ReparacionProvider } from './ReparacionContext';
import { useReparacionRedux } from './hooks/useReparacionRedux';
import { ReparacionType } from '../../types/reparacion';
import { 
    selectUsuarioDeReparacion, 
    selectDroneDeReparacion, 
    selectModeloDeReparacion 
} from '../../redux-tool-kit/reparacion/reparacion.selectors';

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
    // URL PARAMS Y NAVIGATION
    // ========================================================================
    
    const { id: reparacionIdParam } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    /**
     * Determinar si es nueva reparación o edición
     */
    const isNew = reparacionIdParam === 'nueva' || !reparacionIdParam;
    const reparacionId = isNew ? undefined : reparacionIdParam;
    
    // ========================================================================
    // DATOS DESDE REDUX (useReparacionRedux)
    // ========================================================================
    
    /**
     * Hook principal que conecta con Redux
     */
    const {
        reparacion: reparacionFromRedux,
        intervenciones,
        isLoading,
        isSaving: isSavingRedux,
        error: reduxError,
        saveReparacion: saveReparacionRedux,
        deleteReparacion: deleteReparacionRedux,
        loadIntervenciones,
        addIntervencion,
        removeIntervencion
    } = useReparacionRedux({ 
        reparacionId, 
        autoLoad: !isNew 
    });
    
    /**
     * Obtener información del usuario actual (admin check)
     */
    const usuarioActual = useAppSelector(state => state.app.usuario);
    const isAdmin = useMemo(() => {
        return usuarioActual?.data.Admin === true;
    }, [usuarioActual]);
    
    /**
     * Cargar entidades relacionadas desde Redux usando selectores optimizados
     * Complejidad: O(1) - Acceso directo por ID en diccionarios
     */
    const usuario = useAppSelector(state => 
        reparacionId ? selectUsuarioDeReparacion(state, reparacionId) : null
    );
    
    const drone = useAppSelector(state => 
        reparacionId ? selectDroneDeReparacion(state, reparacionId) : null
    );
    
    const modelo = useAppSelector(state => 
        reparacionId ? selectModeloDeReparacion(state, reparacionId) : null
    );
    
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
        
        // Crear nueva reparación vacía conforme a DataReparacion
        return {
            id: 'new',
            data: {
                // Campos obligatorios
                EstadoRep: 'Consulta',
                PrioridadRep: null,
                FeConRep: Date.now(),
                ModeloDroneNameRep: '',
                DescripcionUsuRep: '',
                UsuarioRep: '',
                
                // Campos opcionales
                NombreUsu: '',
                EmailUsu: '',
                TelefonoUsu: '',
                ApellidoUsu: '',
                DroneId: '',
                DriveRep: '',
                AnotacionesRep: '',
                DiagnosticoRep: '',
                FeRecRep: null,
                NumeroSerieRep: '',
                DescripcionTecRep: '',
                PresuMoRep: null,
                PresuReRep: null,
                PresuFiRep: null,
                PresuDiRep: null,
                TxtRepuestosRep: '',
                InformeRep: '',
                FeFinRep: null,
                FeEntRep: null,
                TxtEntregaRep: '',
                SeguimientoEntregaRep: '',
                urlsFotos: [],
                urlsDocumentos: [],
                IntervencionesIds: [],
                FotoAntes: '',
                FotoDespues: '',
                ObsRepuestos: '',
                RepuestosSolicitados: []
            }
        };
    });
    
    /**
     * Sincronizar estado local cuando Redux se actualiza
     */
    useEffect(() => {
        if (reparacionFromRedux && !isNew) {
            setReparacion(reparacionFromRedux);
        }
    }, [reparacionFromRedux, isNew]);
    
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
     * Guardar reparación (nueva o actualización)
     */
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const savedReparacion = await saveReparacionRedux(reparacion);
            
            // Si era nueva, redirigir a la URL con el ID real
            if (isNew && savedReparacion?.id && savedReparacion.id !== 'new') {
                navigate(`/reparacion/${savedReparacion.id}`, { replace: true });
            }
            
            // Actualizar estado local con la versión guardada
            if (savedReparacion) {
                setReparacion(savedReparacion);
            }
        } catch (error) {
            console.error('Error al guardar reparación:', error);
            // TODO: Mostrar notificación de error
        } finally {
            setIsSaving(false);
        }
    }, [reparacion, saveReparacionRedux, isNew, navigate]);
    
    /**
     * Cancelar cambios y volver
     */
    const handleCancel = useCallback(() => {
        if (isDirty) {
            // TODO: Mostrar confirmación antes de descartar cambios
            const confirmed = window.confirm('¿Descartar los cambios sin guardar?');
            if (!confirmed) return;
        }
        
        navigate(-1);
    }, [isDirty, navigate]);
    
    /**
     * Eliminar reparación
     */
    const handleDelete = useCallback(async () => {
        if (!reparacionId) return;
        
        // TODO: Mostrar confirmación antes de eliminar
        const confirmed = window.confirm('¿Está seguro de eliminar esta reparación?');
        if (!confirmed) return;
        
        setIsSaving(true);
        try {
            await deleteReparacionRedux(reparacionId);
            navigate('/reparaciones', { replace: true });
        } catch (error) {
            console.error('Error al eliminar reparación:', error);
            // TODO: Mostrar notificación de error
        } finally {
            setIsSaving(false);
        }
    }, [reparacionId, deleteReparacionRedux, navigate]);
    
    /**
     * Avanzar a nuevo estado
     */
    const handleAdvanceState = useCallback(async (nuevoEstado: string) => {
        setIsSaving(true);
        try {
            // Actualizar el estado en la reparación local
            const updatedReparacion: ReparacionType = {
                ...reparacion,
                data: {
                    ...reparacion.data,
                    EstadoRep: nuevoEstado
                    // TODO: Actualizar fechas según el estado
                    // Ej: Si nuevoEstado === 'Recibido', actualizar FeRecRep
                }
            };
            
            // Guardar con el nuevo estado
            await saveReparacionRedux(updatedReparacion);
            
            // Actualizar estado local
            setReparacion(updatedReparacion);
            
            // TODO: Enviar email/SMS según configuración del estado
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            // TODO: Mostrar notificación de error
        } finally {
            setIsSaving(false);
        }
    }, [reparacion, saveReparacionRedux]);
    
    /**
     * Verifica si se puede avanzar a un estado específico
     */
    const canAdvanceTo = useCallback((): boolean => {
        if (!isAdmin) return false;
        if (!reparacion) return false;
        
        // TODO: Implementar lógica de validación de transiciones según targetState
        // Por ahora, permitir cualquier transición para admin
        return true;
    }, [isAdmin, reparacion]);
    
    /**
     * Obtener estado actual
     */
    const getCurrentEstado = useCallback(() => {
        return reparacion.data.EstadoRep;
    }, [reparacion]);
    
    /**
     * Obtener estados siguientes posibles
     */
    const getNextEstados = useCallback(() => {
        // TODO: Implementar lógica de estados siguientes según workflow
        const estadoActual = reparacion.data.EstadoRep;
        
        // Workflow simplificado
        const workflow: Record<string, string[]> = {
            'Consulta': ['Recibido'],
            'Recibido': ['Revisado'],
            'Revisado': ['Presupuestado'],
            'Presupuestado': ['Aceptado', 'Rechazado'],
            'Aceptado': ['Reparado'],
            'Reparado': ['Entregado'],
            'Entregado': ['Finalizado'],
            'Rechazado': ['Finalizado'],
            'Finalizado': []
        };
        
        return workflow[estadoActual] || [];
    }, [reparacion]);
    
    // ========================================================================
    // ACCIONES ADICIONALES (STUBS)
    // ========================================================================
    
    /**
     * TODO: Implementar en fases posteriores
     */
    const handleSendEmail = useCallback(async () => {
        console.log('TODO: Implementar envío de email');
    }, []);
    
    const handleSendSMS = useCallback(async () => {
        console.log('TODO: Implementar envío de SMS');
    }, []);
    
    const handleUploadFile = useCallback(async (file: File) => {
        console.log('TODO: Implementar subida de archivo', file);
    }, []);
    
    const handleDeleteFile = useCallback(async (fileId: string) => {
        console.log('TODO: Implementar eliminación de archivo', fileId);
    }, []);
    
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
     * Si no se encontró (404) - solo para edición
     */
    if (!isNew && !reparacionFromRedux && !isLoading) {
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
                        onClick={() => navigate(-1)}
                    >
                        Volver atrás
                    </button>
                </div>
            </div>
        );
    }
    
    /**
     * Si hay error en Redux
     */
    if (reduxError) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Error al cargar datos</h4>
                    <p>{reduxError}</p>
                    <hr />
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate(-1)}
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
                        onClick={() => navigate(-1)}
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
        isLoading,
        isSaving: isSaving || isSavingRedux,
        hasChanges: isDirty,
        
        // Acciones principales
        onSave: handleSave,
        onCancel: handleCancel,
        onChange: handleChange,
        
        // Transiciones de estado
        onAdvanceState: handleAdvanceState,
        canAdvanceTo,
        getCurrentEstado,
        getNextEstados,
        
        // Acciones opcionales
        onDelete: handleDelete,
        onSendEmail: handleSendEmail,
        onSendSMS: handleSendSMS,
        onUploadFile: handleUploadFile,
        onDeleteFile: handleDeleteFile,
        
        // Validaciones
        validationErrors,
        
        // Intervenciones (para tabs)
        intervenciones,
        onLoadIntervenciones: loadIntervenciones,
        onAddIntervencion: addIntervencion,
        onRemoveIntervencion: removeIntervencion
    };
    
    return (
        <ReparacionProvider {...providerProps}>
            {/* TODO: Reemplazar con ReparacionLayout cuando esté implementado */}
            <div className="container mt-4">
                <div className="alert alert-info">
                    <h4>Container Component con Redux ✅</h4>
                    <p><strong>Phase 3 - T3.3:</strong> Selectores optimizados implementados</p>
                    <p>Datos cargados desde Redux con selectores O(1):</p>
                    <ul>
                        <li><strong>Reparación ID:</strong> {reparacion.id}</li>
                        <li><strong>Usuario:</strong> {usuario?.data.NombreUsu} {usuario?.data.ApellidoUsu || ''}</li>
                        <li><strong>Email:</strong> {usuario?.data.EmailUsu || 'No disponible'}</li>
                        <li><strong>Teléfono:</strong> {usuario?.data.TelefonoUsu || 'No disponible'}</li>
                        <li><strong>Drone:</strong> {drone?.data.Nombre || 'No asignado'}</li>
                        <li><strong>Número Serie:</strong> {drone?.data.NumeroSerie || 'No disponible'}</li>
                        <li><strong>Modelo:</strong> {modelo?.data.NombreModelo || 'No asignado'}</li>
                        <li><strong>Fabricante:</strong> {modelo?.data.Fabricante || 'No disponible'}</li>
                        <li><strong>Estado:</strong> {reparacion.data.EstadoRep}</li>
                        <li><strong>Es Nueva:</strong> {isNew ? 'Sí' : 'No'}</li>
                        <li><strong>Es Admin:</strong> {isAdmin ? 'Sí' : 'No'}</li>
                        <li><strong>Tiene Cambios:</strong> {isDirty ? 'Sí' : 'No'}</li>
                        <li><strong>Intervenciones:</strong> {intervenciones.length}</li>
                    </ul>
                    <button 
                        className="btn btn-primary me-2"
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                    >
                        {isSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button 
                        className="btn btn-secondary me-2"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>
                    {!isNew && (
                        <button 
                            className="btn btn-danger"
                            onClick={handleDelete}
                            disabled={isSaving}
                        >
                            Eliminar
                        </button>
                    )}
                </div>
            </div>
        </ReparacionProvider>
    );
}
