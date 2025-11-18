/**
 * SeccionCard.component.tsx
 * 
 * Card wrapper para secciones con título y contenido.
 * 
 * @module Reparacion/components/shared
 */

import React from 'react';
import { Card } from 'react-bootstrap';

interface SeccionCardProps {
    /** Título de la sección */
    title: string;
    
    /** Subtítulo opcional */
    subtitle?: string;
    
    /** Contenido de la card */
    children: React.ReactNode;
    
    /** Icono Bootstrap Icons (sin el prefijo bi-) */
    icon?: string;
    
    /** Clase CSS adicional */
    className?: string;
    
    /** Acciones adicionales en el header (botones, etc) */
    actions?: React.ReactNode;
}

/**
 * Card para agrupar secciones de contenido con título y opcionalmente iconos/acciones.
 * 
 * @example
 * ```tsx
 * <SeccionCard 
 *   title="Datos del Cliente" 
 *   icon="person-circle"
 *   actions={<Button size="sm">Editar</Button>}
 * >
 *   <p>Contenido...</p>
 * </SeccionCard>
 * ```
 */
export function SeccionCard({
    title,
    subtitle,
    children,
    icon,
    className = '',
    actions,
}: SeccionCardProps): React.ReactElement {
    return (
        <Card className={`mb-3 ${className}`}>
            <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <div className="d-flex align-items-center">
                    {icon && <i className={`bi bi-${icon} fs-5 me-2`}></i>}
                    <div>
                        <h5 className="mb-0">{title}</h5>
                        {subtitle && <small className="text-muted">{subtitle}</small>}
                    </div>
                </div>
                {actions && <div className="ms-auto">{actions}</div>}
            </Card.Header>
            <Card.Body>
                {children}
            </Card.Body>
        </Card>
    );
}
