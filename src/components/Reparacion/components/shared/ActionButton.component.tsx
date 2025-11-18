/**
 * ActionButton.component.tsx
 * 
 * Botón reutilizable para acciones con loading state y iconos.
 * 
 * @module Reparacion/components/shared
 */

import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';

interface ActionButtonProps extends Omit<ButtonProps, 'onClick'> {
    /** Texto del botón */
    children: React.ReactNode;
    
    /** Callback al hacer clic */
    onClick: () => void | Promise<void>;
    
    /** Icono Bootstrap Icons (sin el prefijo bi-) */
    icon?: string;
    
    /** Si está en estado de carga */
    loading?: boolean;
    
    /** Texto mientras está cargando */
    loadingText?: string;
}

/**
 * Botón de acción con estado de carga y iconos opcionales.
 * 
 * @example
 * ```tsx
 * <ActionButton 
 *   variant="primary" 
 *   icon="save" 
 *   onClick={handleSave}
 *   loading={isSaving}
 *   loadingText="Guardando..."
 * >
 *   Guardar
 * </ActionButton>
 * ```
 */
export function ActionButton({
    children,
    onClick,
    icon,
    loading = false,
    loadingText,
    disabled,
    ...restProps
}: ActionButtonProps): React.ReactElement {
    const handleClick = () => {
        if (!loading && !disabled) {
            onClick();
        }
    };
    
    return (
        <Button
            {...restProps}
            onClick={handleClick}
            disabled={disabled || loading}
        >
            {loading ? (
                <>
                    <span 
                        className="spinner-border spinner-border-sm me-2" 
                        role="status" 
                        aria-hidden="true"
                    />
                    {loadingText || children}
                </>
            ) : (
                <>
                    {icon && <i className={`bi bi-${icon} me-2`}></i>}
                    {children}
                </>
            )}
        </Button>
    );
}
