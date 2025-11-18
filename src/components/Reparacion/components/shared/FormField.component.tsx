/**
 * FormField.component.tsx
 * 
 * Campo de formulario genérico con label, validación y diferentes tipos de input.
 * 
 * @module Reparacion/components/shared
 */

import React from 'react';
import { Form, FormControlProps } from 'react-bootstrap';

type FormFieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'date' | 'datetime-local';

interface FormFieldProps extends Omit<FormControlProps, 'type' | 'onChange'> {
    /** Tipo de campo */
    type?: FormFieldType;
    
    /** Label del campo */
    label: string;
    
    /** Nombre del campo (para formularios) */
    name: string;
    
    /** Valor actual */
    value: string | number;
    
    /** Callback al cambiar el valor */
    onChange: (name: string, value: string | number) => void;
    
    /** Mensaje de error de validación */
    error?: string;
    
    /** Si el campo es requerido */
    required?: boolean;
    
    /** Placeholder */
    placeholder?: string;
    
    /** Si está deshabilitado */
    disabled?: boolean;
    
    /** Texto de ayuda */
    helpText?: string;
    
    /** Opciones para select */
    options?: Array<{ value: string | number; label: string }>;
    
    /** Número de filas (para textarea) */
    rows?: number;
}

/**
 * Campo de formulario genérico con validación.
 * Soporta text, email, number, textarea, select, date, datetime-local.
 * 
 * @example
 * ```tsx
 * <FormField
 *   type="text"
 *   label="Nombre"
 *   name="nombre"
 *   value={reparacion.nombre}
 *   onChange={handleFieldChange}
 *   error={errors.nombre}
 *   required
 * />
 * ```
 */
export function FormField({
    type = 'text',
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    placeholder,
    disabled = false,
    helpText,
    options = [],
    rows = 3,
    ...restProps
}: FormFieldProps): React.ReactElement {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
        onChange(name, newValue);
    };
    
    const isInvalid = Boolean(error);
    
    return (
        <Form.Group className="mb-3" controlId={`form-${name}`}>
            <Form.Label>
                {label}
                {required && <span className="text-danger ms-1">*</span>}
            </Form.Label>
            
            {type === 'textarea' ? (
                <Form.Control
                    as="textarea"
                    rows={rows}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    isInvalid={isInvalid}
                    {...restProps}
                />
            ) : type === 'select' ? (
                <Form.Select
                    name={name}
                    value={value}
                    onChange={handleChange}
                    disabled={disabled}
                    isInvalid={isInvalid}
                    {...restProps}
                >
                    <option value="">Seleccionar...</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </Form.Select>
            ) : (
                <Form.Control
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    isInvalid={isInvalid}
                    {...restProps}
                />
            )}
            
            {helpText && !error && (
                <Form.Text className="text-muted">
                    {helpText}
                </Form.Text>
            )}
            
            {error && (
                <Form.Control.Feedback type="invalid">
                    {error}
                </Form.Control.Feedback>
            )}
        </Form.Group>
    );
}
