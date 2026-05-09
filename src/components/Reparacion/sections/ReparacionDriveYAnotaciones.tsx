import React from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { selectReparacionById } from "../../../redux-tool-kit/reparacion";
import { useDebouncedField } from "../../../hooks/useDebouncedField";
import { SectionCard, FormField, FormTextarea, SavingIndicator } from "../../ui";

interface ReparacionDriveYAnotacionesProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionDriveYAnotaciones: React.FC<ReparacionDriveYAnotacionesProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));

    // Usar debounce para campos de texto
    const driveLink = useDebouncedField({
        reparacionId,
        campo: 'DriveRep',
        valorInicial: reparacion?.data.DriveRep || ""
    });

    const anotaciones = useDebouncedField({
        reparacionId,
        campo: 'AnotacionesRep',
        valorInicial: reparacion?.data.AnotacionesRep || ""
    });

    if (!isAdmin || !reparacion) return null;

    return (
        <>
            <SectionCard title="ENLACE A DRIVE">
                <div className="input-group">
                    <FormField
                        label="Enlace a Drive"
                        id="DriveRep"
                        value={driveLink.value}
                        onChange={driveLink.onChange}
                        isSaving={driveLink.isSaving}
                    />
                    <div className="input-group-append mt-4">
                        <a href={driveLink.value} target="_blank" rel="noreferrer">
                            <button className="btn btn-outline-secondary bg-bluemcdron text-white" type="button">
                                Ir
                            </button>
                        </a>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="ANOTACIONES CONFIDENCIALES" backgroundColor="#FF0000">
                <label className="form-label text-white">
                    Anotaciones varias
                    <SavingIndicator isSaving={anotaciones.isSaving} />
                </label>
                <FormTextarea
                    label=""
                    id="AnotacionesRep"
                    value={anotaciones.value}
                    onChange={anotaciones.onChange}
                    rows={5}
                />
            </SectionCard>
        </>
    );
};
