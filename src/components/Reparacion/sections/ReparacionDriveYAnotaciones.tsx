import React, { ChangeEvent } from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { selectReparacionById } from "../../../redux-tool-kit/reparacion";
import { actualizarCampoReparacionAsync } from "../../../redux-tool-kit/reparacion/reparacion.actions";
import TextareaAutosize from "react-textarea-autosize";

interface ReparacionDriveYAnotacionesProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionDriveYAnotaciones: React.FC<ReparacionDriveYAnotacionesProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));

    if (!isAdmin || !reparacion) return null;

    const handleOnChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const target = event.target;
        const field = target.id;
        const value = target.value;
        
        dispatch(actualizarCampoReparacionAsync({ 
            reparacionId, 
            campo: field as any, 
            valor: value 
        }));
    };

    return (
        <>
            <div className="card mb-3">
                <div className="card-body">
                    <h5 className="card-title bluemcdron">ENLACE A DRIVE</h5>
                    <div>
                        <label className="form-label">Enlace a Drive</label>
                        <div className="input-group">
                            <input
                                onChange={handleOnChange}
                                type="text"
                                className="form-control"
                                id="DriveRep"
                                value={reparacion.data.DriveRep || ""}
                            />
                            <div className="input-group-append">
                                <a href={reparacion.data.DriveRep} target="_blank" rel="noreferrer">
                                    <button className="btn btn-outline-secondary bg-bluemcdron text-white" type="button">
                                        Ir
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card mb-3" style={{ backgroundColor: "#FF0000" }}>
                <div className="card-body">
                    <h5 className="card-title bluemcdron">ANOTACIONES CONFIDENCIALES</h5>
                    <div>
                        <label className="form-label text-white">Anotaciones varias</label>
                        <TextareaAutosize
                            onChange={handleOnChange}
                            className="form-control"
                            id="AnotacionesRep"
                            value={reparacion.data.AnotacionesRep || ""}
                            rows={5}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
