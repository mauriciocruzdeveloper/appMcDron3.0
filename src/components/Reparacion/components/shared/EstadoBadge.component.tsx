/**
 * EstadoBadge.component.tsx
 * 
 * Badge para mostrar el estado de una reparación con colores semánticos.
 * 
 * @module Reparacion/components/shared
 */

import React from 'react';
import { Badge } from 'react-bootstrap';
import { EstadoReparacion } from '../../../../usecases/estadosReparacion';

interface EstadoBadgeProps {
    /** Estado actual de la reparación */
    estado: EstadoReparacion;
    
    /** Clase CSS adicional opcional */
    className?: string;
}

/**
 * Mapea estados a variantes de Bootstrap Badge.
 */
const ESTADO_COLORS: Partial<Record<EstadoReparacion, string>> = {
    Consulta: 'secondary',
    Respondido: 'info',
    Transito: 'info',
    Recibido: 'primary',
    Revisado: 'primary',
    Presupuestado: 'warning',
    Aceptado: 'success',
    Repuestos: 'warning',
    Rechazado: 'danger',
    Reparado: 'success',
    Diagnosticado: 'info',
    Cobrado: 'success',
    Enviado: 'primary',
    Finalizado: 'dark',
    Abandonado: 'danger',
    Cancelado: 'danger',
    Reparar: 'secondary',
    Entregado: 'dark',
    Venta: 'secondary',
    Liquidación: 'secondary',
    Indefinido: 'secondary',
};

/**
 * Mapea estados a etiquetas legibles (mismas que el estado).
 */
const ESTADO_LABELS: Partial<Record<EstadoReparacion, string>> = {
    Consulta: 'Consulta',
    Respondido: 'Respondido',
    Transito: 'En Tránsito',
    Recibido: 'Recibido',
    Revisado: 'Revisado',
    Presupuestado: 'Presupuestado',
    Aceptado: 'Aceptado',
    Repuestos: 'Esperando Repuestos',
    Rechazado: 'Rechazado',
    Reparado: 'Reparado',
    Diagnosticado: 'Diagnosticado',
    Cobrado: 'Cobrado',
    Enviado: 'Enviado',
    Finalizado: 'Finalizado',
    Abandonado: 'Abandonado',
    Cancelado: 'Cancelado',
    Reparar: 'Reparar',
    Entregado: 'Entregado',
    Venta: 'Venta',
    Liquidación: 'Liquidación',
    Indefinido: 'Indefinido',
};

/**
 * Componente Badge para mostrar el estado de una reparación.
 * 
 * @example
 * ```tsx
 * <EstadoBadge estado={EstadoReparacion.Diagnosticado} />
 * ```
 */
export function EstadoBadge({ estado, className = '' }: EstadoBadgeProps): React.ReactElement {
    const color = ESTADO_COLORS[estado] || 'secondary';
    const label = ESTADO_LABELS[estado] || estado;
    
    return (
        <Badge 
            bg={color} 
            className={`fs-6 ${className}`}
            pill
        >
            {label}
        </Badge>
    );
}
