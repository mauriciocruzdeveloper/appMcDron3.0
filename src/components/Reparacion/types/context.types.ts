/**
 * Types para Context de Reparación
 * 
 * Define la estructura del contexto compartido entre todos los componentes
 * de la reparación refactorizada.
 */

import { ReparacionType } from '../../../types/reparacion';
import { Usuario } from '../../../types/usuario';
import { Drone } from '../../../types/drone';
import { ModeloDrone } from '../../../types/modeloDrone';

/**
 * Valor del contexto de Reparación
 */
export interface ReparacionContextValue {
  // Estado
  reparacion: ReparacionType;
  reparacionOriginal: ReparacionType;
  usuario: Usuario | null;
  drone: Drone | null;
  modelo: ModeloDrone | null;
  isAdmin: boolean;
  isNew: boolean;
  hasChanges: boolean;
  
  // Acciones básicas
  updateField: (field: string, value: unknown) => void;
  updateMultipleFields: (fields: Record<string, unknown>) => void;
  resetChanges: () => void;
  
  // Acciones de persistencia
  save: () => Promise<boolean>;
  deleteReparacion: () => Promise<boolean>;
  
  // Acciones de estado
  cambiarEstado: (nuevoEstado: string) => Promise<boolean>;
  canChangeState: (estado: string) => boolean;
  getNextStates: () => string[];
  
  // Upload/Delete
  uploadFoto: (file: File) => Promise<string>;
  deleteFoto: (url: string) => Promise<void>;
  uploadDocumento: (file: File) => Promise<string>;
  deleteDocumento: (url: string) => Promise<void>;
  
  // Validaciones
  canSave: boolean;
  canDelete: boolean;
  validationErrors: Record<string, string>;
  
  // Helpers
  formatPrice: (price: number) => string;
  formatDate: (timestamp: number) => string;
}

/**
 * Props del Provider de Reparación
 */
export interface ReparacionProviderProps {
  children: React.ReactNode;
  reparacion: ReparacionType;
  reparacionOriginal: ReparacionType;
  usuario: Usuario | null;
  drone: Drone | null;
  modelo: ModeloDrone | null;
  isAdmin: boolean;
  isNew: boolean;
  onSave: (reparacion: ReparacionType) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onChangeState: (estado: string) => Promise<boolean>;
  onUploadFoto: (file: File) => Promise<string>;
  onDeleteFoto: (url: string) => Promise<void>;
  onUploadDocumento: (file: File) => Promise<string>;
  onDeleteDocumento: (url: string) => Promise<void>;
}
