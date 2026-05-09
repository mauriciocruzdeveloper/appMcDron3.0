import React from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useDebouncedField } from "../../../hooks/useDebouncedField";
import { 
    selectReparacionById, 
    selectSeccionesVisibles,
    selectPuedeAvanzarA,
} from "../../../redux-tool-kit/reparacion";
import { 
    actualizarCampoReparacionAsync,
    cambiarEstadoReparacionAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { SectionCard, FormTextarea, AppButton } from "../../ui";

interface ReparacionRepuestosProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionRepuestos: React.FC<ReparacionRepuestosProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).repuestos
    );
    const puedeAvanzarARepuestos = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Repuestos')(state)
    );
    const puedeAvanzarAAceptado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Aceptado')(state)
    );

    // Usar debounce para campos de texto
    const obsRepuestos = useDebouncedField({
        reparacionId,
        campo: 'ObsRepuestos',
        valorInicial: reparacion?.data.ObsRepuestos || ""
    });

    const txtRepuestos = useDebouncedField({
        reparacionId,
        campo: 'TxtRepuestosRep',
        valorInicial: reparacion?.data.TxtRepuestosRep || ""
    });

    if (!seccionVisible || !reparacion || !isAdmin) return null;

    const avanzarARepuestos = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Repuestos',
            enviarEmail: false
        }));
    };

    const avanzarAAceptado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Aceptado',
            enviarEmail: false
        }));
    };

    return (
        <SectionCard title="REPUESTOS" id="seccion-repuestos">
            <div className="mb-3">
                <label className="form-label">
                    Observaciones de Repuestos
                    <small className="text-muted ms-2">
                        ({(obsRepuestos.value || "").length}/2000 caracteres)
                    </small>
                    {obsRepuestos.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                </label>
                <FormTextarea
                    label=""
                    id="ObsRepuestos"
                    value={obsRepuestos.value}
                    onChange={obsRepuestos.onChange}
                    isSaving={false}
                    rows={3}
                    placeholder="Ej: Motor delantero izquierdo DJI Mini 3 Pro, tornillos M2x6 (x4)"
                />
                <small className="form-text text-muted">
                    Especificar qué repuestos se necesitan para continuar con la reparación
                </small>
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Seguimiento de Repuestos (Legacy)
                    <span className="badge bg-secondary ms-2">Opcional</span>
                    {txtRepuestos.isSaving && <small className="text-muted ms-2">Guardando...</small>}
                </label>
                <FormTextarea
                    label=""
                    id="TxtRepuestosRep"
                    value={txtRepuestos.value}
                    onChange={txtRepuestos.onChange}
                    isSaving={false}
                    rows={3}
                    placeholder="Información de transportista, seguimiento, etc."
                />
                <small className="form-text text-muted">
                    Información adicional: transportista, número de seguimiento, etc.
                </small>
            </div>

            {isAdmin && (
                <div className="mt-3">
                    {reparacion.data.EstadoRep === 'Aceptado' && puedeAvanzarARepuestos && (
                        <AppButton variant="warning" className="me-2 mb-2" onClick={avanzarARepuestos}>
                            ⏸️ Pausar - Esperando Repuestos
                        </AppButton>
                    )}
                    {reparacion.data.EstadoRep === 'Repuestos' && puedeAvanzarAAceptado && (
                        <AppButton variant="success" className="me-2 mb-2" onClick={avanzarAAceptado}>
                            ✅ Repuestos Llegaron - Continuar Reparación
                        </AppButton>
                    )}
                    {reparacion.data.EstadoRep === 'Repuestos' && (
                        <div className="alert alert-warning mt-2" role="alert">
                            <strong>⚠️ Estado: Esperando Repuestos</strong>
                            <p className="mb-0 mt-1">
                                La reparación está pausada hasta que lleguen los repuestos necesarios.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </SectionCard>
    );
};
