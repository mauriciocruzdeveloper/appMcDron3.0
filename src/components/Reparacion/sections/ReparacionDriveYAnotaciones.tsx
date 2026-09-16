import React from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { selectReparacionById } from "../../../redux-tool-kit/reparacion";
import { useDebouncedField } from "../../../hooks/useDebouncedField";
import TextareaAutosize from "react-textarea-autosize";
import { ReparacionSeccionColapsable } from "./ReparacionSeccionColapsable";

interface ReparacionInformacionAdminProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionAnotacionesConfidenciales: React.FC<ReparacionInformacionAdminProps> = ({
    reparacionId, 
    isAdmin 
}) => {
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const anotaciones = useDebouncedField({
        reparacionId,
        campo: 'AnotacionesRep',
        valorInicial: reparacion?.data.AnotacionesRep || ""
    });

    if (!isAdmin || !reparacion) return null;

    return (
        <div className="card mb-3" style={{ backgroundColor: "#FF0000" }}>
            <div className="card-body">
                <h5 className="card-title text-white">ANOTACIONES CONFIDENCIALES</h5>
                <div>
                    <label className="form-label text-white">
                        Anotaciones varias
                        {anotaciones.isSaving && <small className="text-white ms-2">Guardando...</small>}
                    </label>
                    <TextareaAutosize
                        onChange={(e) => anotaciones.onChange(e.target.value)}
                        className="form-control"
                        id="AnotacionesRep"
                        value={anotaciones.value}
                        rows={5}
                    />
                </div>
            </div>
        </div>
    );
};

export const ReparacionDrive: React.FC<ReparacionInformacionAdminProps> = ({
    reparacionId,
    isAdmin
}) => {
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const driveLink = useDebouncedField({
        reparacionId,
        campo: 'DriveRep',
        valorInicial: reparacion?.data.DriveRep || ""
    });

    if (!isAdmin || !reparacion) return null;

    return (
        <ReparacionSeccionColapsable id="seccion-drive" titulo="ENLACE A DRIVE">
            <div>
                <label className="form-label">
                    Enlace a Drive
                    {driveLink.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                </label>
                <div className="input-group">
                    <input
                        onChange={(e) => driveLink.onChange(e.target.value)}
                        type="text"
                        className="form-control"
                        id="DriveRep"
                        value={driveLink.value}
                    />
                    <a
                        href={driveLink.value}
                        target="_blank"
                        rel="noreferrer"
                        className={`btn btn-outline-secondary bg-bluemcdron text-white ${driveLink.value ? '' : 'disabled'}`}
                        aria-disabled={!driveLink.value}
                    >
                        Ir
                    </a>
                </div>
            </div>
        </ReparacionSeccionColapsable>
    );
};
