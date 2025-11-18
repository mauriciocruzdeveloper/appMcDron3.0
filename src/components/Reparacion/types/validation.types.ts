/**
 * Types para validaciones de Reparación
 * 
 * Define los tipos para el sistema de validación del formulario.
 */

/**
 * Errores de validación por campo
 */
export type ValidationErrors = Record<string, string>;

/**
 * Resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

/**
 * Regla de validación
 */
export interface ValidationRule {
  field: string;
  validate: (value: unknown, allData: unknown) => string | null;
  message: string;
}

/**
 * Opciones de validación
 */
export interface ValidationOptions {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
}
