/**
 * Types para Context de Reparación
 * 
 * Define la estructura del contexto compartido entre todos los componentes
 * de la reparación refactorizada.
 */

import { ReparacionType } from '../../../store/reparaciones/reparaciones.slice';
import { Usuario } from '../../../store/usuarios/usuarios.slice';
import { Drone } from '../../../store/drones/drones.slice';
import { ModeloDrone } from '../../../store/modelosDrones/modelosDrones.slice';

/**
 * Valor del contexto de Reparación.
 * Contiene todos los datos y acciones disponibles para los componentes hijos.
 */
export interface ReparacionContextValue {
    // Datos principales
    reparacion: ReparacionType;
    reparacionOriginal: ReparacionType;
    usuario: Usuario | null;
    drone: Drone | null;
    modelo: ModeloDrone | null;
    
    // Estado de la UI
    isAdmin: boolean;
    isNew: boolean;
    isDirty: boolean;
    isLoading: boolean;
    isSaving: boolean;
    hasChanges: boolean;
    
    // Acciones de formulario
    onSave: () => Promise<void>;
    onCancel: () => void;
    onChange: (field: string, value: unknown) => void;
    updateField: (field: string, value: unknown) => void;
    updateMultipleFields: (fields: Record<string, unknown>) => void;
    resetForm: () => void;
    
    // Transiciones de estado
    onAdvanceState: (estadoNombre: string) => Promise<void>;
    canAdvanceTo: (estadoNombre: string) => boolean;
    getCurrentEstado: () => string;
    getNextEstados: () => string[];
    
    // Acciones CRUD
    onDelete?: () => Promise<void>;
    
    // Comunicación
    onSendEmail?: (tipo: string) => Promise<void>;
    onSendSMS?: () => void;
    
    // Gestión de archivos
    onUploadFile?: (file: File, tipo: string) => Promise<void>;
    onDeleteFile?: (fileId: string, tipo: string) => Promise<void>;
    
    // Validaciones
    validationErrors: Record<string, string>;
    isValid: boolean;
    validateField: (field: string) => string | null;
    validateAll: () => boolean;
}

/**
 * Props para el ReparacionProvider
 */
export interface ReparacionProviderProps {
    // Datos principales
    reparacion: ReparacionType;
    usuario: Usuario | null;
    drone: Drone | null;
    modelo: ModeloDrone | null;
    
    // Estado de la UI
    isAdmin: boolean;
    isNew: boolean;
    isDirty: boolean;
    isLoading?: boolean;
    isSaving?: boolean;
    
    // Acciones principales
    onSave: () => Promise<void>;
    onCancel: () => void;
    onChange: (field: string, value: unknown) => void;
    
    // Transiciones de estado
    onAdvanceState: (estadoNombre: string) => Promise<void>;
    canAdvanceTo: (estadoNombre: string) => boolean;
    
    // Acciones opcionales
    onDelete?: () => Promise<void>;
    onSendEmail?: (tipo: string) => Promise<void>;
    onSendSMS?: () => void;
    onUploadFile?: (file: File, tipo: string) => Promise<void>;
    onDeleteFile?: (fileId: string, tipo: string) => Promise<void>;
    
    // Validaciones
    validationErrors?: Record<string, string>;
    
    // Children
    children: React.ReactNode;
}


