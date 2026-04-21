import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { selectReparacionById, selectReparacionesByParentId } from "../../../redux-tool-kit/reparacion";
import { selectUsuarioPorId } from "../../../redux-tool-kit/usuario/usuario.selectors";
import { selectDroneById } from "../../../redux-tool-kit/drone/drone.selectors";
import { selectModeloDronePorId } from "../../../redux-tool-kit/modeloDrone/modeloDrone.selectors";
import { esEstadoLegacy, obtenerMensajeMigracion } from "../../../utils/estadosHelper";
import { getPublicIdDisplay } from "../../../utils/publicIdHelper";

interface ReparacionHeaderProps {
    reparacionId: string;
}

export const ReparacionHeader: React.FC<ReparacionHeaderProps> = ({ reparacionId }) => {
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const usuario = useAppSelector(state => 
        selectUsuarioPorId(state, reparacion?.data.UsuarioRep || "")
    );
    const drone = useAppSelector(state => 
        selectDroneById(reparacion?.data.DroneId || "")(state)
    );
    const modeloDrone = useAppSelector(state => 
        selectModeloDronePorId(state, drone?.data.ModeloDroneId || "")
    );
    const reparacionPadre = useAppSelector(state =>
        reparacion?.data.ParentRepairId
            ? selectReparacionById(reparacion.data.ParentRepairId)(state)
            : undefined
    );
    const ampliaciones = useAppSelector(state =>
        selectReparacionesByParentId(reparacionId)(state)
    );

    if (!reparacion) return null;

    return (
        <div className="card mb-3" style={{ backgroundColor: "#CCCCCC" }}>
            <div className="card-body">
                <h3 className="card-title">REPARACIÓN</h3>

                {esEstadoLegacy(reparacion.data.EstadoRep) && (
                    <div className="alert alert-warning alert-dismissible fade show" role="alert">
                        <strong>⚠️ Estado Legacy Detectado:</strong> Esta reparación tiene el estado &quot;{reparacion.data.EstadoRep}&quot;
                        que pertenece al sistema anterior.
                        <br />
                        <small>
                            <strong>Recomendación:</strong> {obtenerMensajeMigracion(reparacion.data.EstadoRep)}
                        </small>
                    </div>
                )}

                <div>Nro: {getPublicIdDisplay(reparacion)}</div>
                <div>Drone: {drone?.data?.Nombre || 'Sin nombre'}</div>
                <div>Modelo: {modeloDrone?.data?.NombreModelo || reparacion.data.ModeloDroneNameRep || 'Modelo no disponible'}</div>
                <div>Cliente: {usuario?.data?.NombreUsu}{usuario?.data?.ApellidoUsu ? ` ${usuario?.data?.ApellidoUsu}` : ''}</div>

                {(reparacionPadre || ampliaciones.length > 0) && (
                    <div className="mt-2 pt-2 border-top">
                        {reparacionPadre && (
                            <div>
                                <strong>Ampliación de:</strong>{' '}
                                <Link to={`/inicio/reparaciones/${reparacionPadre.id}`}>
                                    {getPublicIdDisplay(reparacionPadre)}
                                </Link>
                            </div>
                        )}

                        {ampliaciones.length > 0 && (
                            <div>
                                <strong>Ampliaciones:</strong>{' '}
                                {ampliaciones.map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        {index > 0 ? ', ' : ''}
                                        <Link to={`/inicio/reparaciones/${item.id}`}>
                                            {getPublicIdDisplay(item)}
                                        </Link>
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
