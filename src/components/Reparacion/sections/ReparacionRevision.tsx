import React from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "../../Modal/useModal";
import { useDebouncedField } from "../../../hooks/useDebouncedField";
import { 
    selectReparacionById, 
    selectSeccionesVisibles,
    selectPuedeAvanzarA,
} from "../../../redux-tool-kit/reparacion";
import { 
    cambiarEstadoReparacionAsync,
    generarYGuardarDiagnosticoAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { SectionCard, FormField, FormTextarea, AppButton } from "../../ui";

interface ReparacionRevisionProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionRevision: React.FC<ReparacionRevisionProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const { openModal } = useModal();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).revision
    );
    const puedeAvanzarARevisado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Revisado')(state)
    );

    // Usar debounce para campos de texto
    const numeroSerie = useDebouncedField({
        reparacionId,
        campo: 'NumeroSerieRep',
        valorInicial: reparacion?.data.NumeroSerieRep || ""
    });

    const diagnostico = useDebouncedField({
        reparacionId,
        campo: 'DiagnosticoRep',
        valorInicial: reparacion?.data.DiagnosticoRep || ""
    });

    if (!seccionVisible || !reparacion) return null;

    const handleGenerarAutoDiagnostico = async () => {
        const response = await dispatch(generarYGuardarDiagnosticoAsync(reparacionId));
        if (response.meta.requestStatus === 'rejected') {
            openModal({
                mensaje: "Error al generar el diagnóstico.",
                tipo: "danger",
                titulo: "Generar Diagnóstico",
            });
        }
    };

    const avanzarARevisado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Revisado',
            enviarEmail: false
        }));
    };

    return (
        <SectionCard title="REVISIÓN" id="seccion-revision">
            <FormField
                label="Número de Serie"
                id="NumeroSerieRep"
                value={numeroSerie.value}
                onChange={numeroSerie.onChange}
                isSaving={numeroSerie.isSaving}
                disabled={!isAdmin}
            />

            <div className="d-flex w-100 justify-content-between align-items-center">
                <label className="form-label">Autodiagnóstico</label>
                {isAdmin && (
                    <AppButton
                        variant="outline-secondary"
                        className="bg-bluemcdron text-white"
                        onClick={handleGenerarAutoDiagnostico}
                    >
                        <i className="bi bi-arrow-repeat"></i>
                    </AppButton>
                )}
            </div>

            <FormTextarea
                label="Observaciones del Técnico"
                id="DiagnosticoRep"
                value={diagnostico.value}
                onChange={diagnostico.onChange}
                isSaving={diagnostico.isSaving}
                rows={5}
                disabled={!isAdmin}
            />

            {isAdmin && puedeAvanzarARevisado && (
                <div className="mt-3">
                    <AppButton variant="info" onClick={avanzarARevisado}>
                        Marcar como Revisado
                    </AppButton>
                </div>
            )}
        </SectionCard>
    );
};
