import React from "react";

interface SectionCardProps {
    title: string;
    id?: string;
    children: React.ReactNode;
    /** Color de fondo de la card (por defecto blanco). */
    backgroundColor?: string;
    /** Elemento opcional que se muestra a la derecha del título en el header. */
    headerAction?: React.ReactNode;
}

/**
 * Contenedor de sección estándar de la app.
 * Agrupa un título y contenido dentro de una card Bootstrap.
 */
export const SectionCard: React.FC<SectionCardProps> = ({
    title,
    id,
    children,
    backgroundColor,
    headerAction,
}) => {
    return (
        <div className="card mb-3" id={id} style={backgroundColor ? { backgroundColor } : undefined}>
            <div className="card-body">
                {headerAction ? (
                    <div className="d-flex w-100 justify-content-between align-items-center">
                        <h5 className="card-title bluemcdron">{title}</h5>
                        {headerAction}
                    </div>
                ) : (
                    <h5 className="card-title bluemcdron">{title}</h5>
                )}
                {children}
            </div>
        </div>
    );
};
