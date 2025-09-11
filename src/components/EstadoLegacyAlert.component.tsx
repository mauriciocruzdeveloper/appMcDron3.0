import React from "react";
import { esEstadoLegacy, obtenerMensajeMigracion, mapearEstadoLegacy } from "../utils/estadosHelper";

interface EstadoLegacyAlertProps {
  estadoActual: string;
  onMigrar?: (nuevoEstado: string) => void;
  className?: string;
}

export const EstadoLegacyAlert: React.FC<EstadoLegacyAlertProps> = ({ 
  estadoActual, 
  onMigrar,
  className = ""
}) => {
  if (!esEstadoLegacy(estadoActual)) {
    return null;
  }

  const estadoSugerido = mapearEstadoLegacy(estadoActual);
  const mensaje = obtenerMensajeMigracion(estadoActual);

  const handleMigrar = () => {
    if (onMigrar && estadoSugerido !== "Indefinido") {
      onMigrar(estadoSugerido);
    }
  };

  return (
    <div className={`alert alert-warning d-flex align-items-center ${className}`} role="alert">
      <div className="flex-grow-1">
        <strong>⚠️ Estado Legacy Detectado:</strong>
        <div className="mt-1">
          <small>{mensaje}</small>
        </div>
        {estadoSugerido !== "Indefinido" && (
          <div className="mt-2">
            <small className="text-muted">
              Sugerencia: Migrar a &quot;<strong>{estadoSugerido}</strong>&quot;
            </small>
          </div>
        )}
      </div>
      {onMigrar && estadoSugerido !== "Indefinido" && (
        <button 
          className="btn btn-sm btn-outline-warning ms-2"
          onClick={handleMigrar}
          title={`Migrar a ${estadoSugerido}`}
        >
          Migrar
        </button>
      )}
    </div>
  );
};

export default EstadoLegacyAlert;
