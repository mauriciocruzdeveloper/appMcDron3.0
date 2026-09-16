import React, { createContext, useContext, useEffect, useState } from "react";

interface ReparacionSeccionesContextValue {
    seccionActivaId: string | null;
    colorEstado: string;
}

const ReparacionSeccionesContext = createContext<ReparacionSeccionesContextValue>({
    seccionActivaId: null,
    colorEstado: "",
});

interface ReparacionSeccionesProviderProps extends ReparacionSeccionesContextValue {
    children: React.ReactNode;
}

export const ReparacionSeccionesProvider: React.FC<ReparacionSeccionesProviderProps> = ({
    seccionActivaId,
    colorEstado,
    children,
}) => (
    <ReparacionSeccionesContext.Provider value={{ seccionActivaId, colorEstado }}>
        {children}
    </ReparacionSeccionesContext.Provider>
);

export const obtenerSeccionIdPorEstado = (estado: string): string | null => {
    switch (estado) {
        case "Consulta":
        case "Respondido":
            return "seccion-consulta";
        case "Transito":
            return "seccion-recepcion";
        case "Recibido":
            return "seccion-revision";
        case "Revisado":
        case "Presupuestado":
            return "seccion-presupuesto";
        case "Repuestos":
            return "seccion-repuestos";
        case "Aceptado":
        case "Rechazado":
        case "Reparar":
            return "seccion-reparar";
        case "Reparado":
        case "Diagnosticado":
        case "Cobrado":
        case "Enviado":
        case "Entregado":
            return "seccion-entrega";
        case "Indefinido":
            return "seccion-consulta";
        default:
            return null;
    }
};

const obtenerColorTexto = (color: string): string => {
    const valor = color.replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(valor)) return "#ffffff";

    const rojo = parseInt(valor.slice(0, 2), 16);
    const verde = parseInt(valor.slice(2, 4), 16);
    const azul = parseInt(valor.slice(4, 6), 16);
    const luminosidad = (rojo * 299 + verde * 587 + azul * 114) / 1000;

    return luminosidad > 160 ? "#212529" : "#ffffff";
};

interface ReparacionSeccionColapsableProps {
    id: string;
    titulo: string;
    children: React.ReactNode;
}

export const ReparacionSeccionColapsable: React.FC<ReparacionSeccionColapsableProps> = ({
    id,
    titulo,
    children,
}) => {
    const { seccionActivaId, colorEstado } = useContext(ReparacionSeccionesContext);
    const esSeccionActiva = id === seccionActivaId;
    const [expandida, setExpandida] = useState(esSeccionActiva);
    const contenidoId = `${id}-contenido`;

    useEffect(() => {
        if (esSeccionActiva) setExpandida(true);
    }, [esSeccionActiva]);

    return (
        <section className="card mb-3" id={id}>
            <div
                className={`card-header p-0 ${esSeccionActiva ? "" : "bg-white"}`}
                style={esSeccionActiva ? { backgroundColor: colorEstado } : undefined}
            >
                <button
                    type="button"
                    className="btn w-100 d-flex align-items-center justify-content-between gap-2 px-3 py-3 text-start"
                    aria-expanded={expandida}
                    aria-controls={contenidoId}
                    onClick={() => setExpandida(valorActual => !valorActual)}
                    style={esSeccionActiva ? { color: obtenerColorTexto(colorEstado) } : undefined}
                >
                    <span className={`h5 mb-0 ${esSeccionActiva ? "" : "bluemcdron"}`}>{titulo}</span>
                    <i
                        className={`bi ${expandida ? 'bi-chevron-up' : 'bi-chevron-down'}`}
                        aria-hidden="true"
                    ></i>
                </button>
            </div>
            <div className="card-body" id={contenidoId} hidden={!expandida}>
                {children}
            </div>
        </section>
    );
};