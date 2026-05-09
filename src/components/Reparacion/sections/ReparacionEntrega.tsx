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
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { convertTimestampCORTO } from "../../../utils/utils";
import { SectionCard, FormField, FormTextarea, AppButton } from "../../ui";

interface ReparacionEntregaProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionEntrega: React.FC<ReparacionEntregaProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const { openModal } = useModal();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).entrega
    );
    const puedeAvanzarACobrado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Cobrado')(state)
    );
    const puedeAvanzarAEnviado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Enviado')(state)
    );
    const puedeAvanzarAFinalizado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Finalizado')(state)
    );
    const puedeAvanzarAAbandonado = useAppSelector(state => 
        selectPuedeAvanzarA(reparacionId, 'Abandonado')(state)
    );

    // Usar debounce para campos de texto
    const txtEntrega = useDebouncedField({
        reparacionId,
        campo: 'TxtEntregaRep',
        valorInicial: reparacion?.data.TxtEntregaRep || ""
    });

    const seguimiento = useDebouncedField({
        reparacionId,
        campo: 'SeguimientoEntregaRep',
        valorInicial: reparacion?.data.SeguimientoEntregaRep || ""
    });

    const fechaEntrega = useDebouncedField({
        reparacionId,
        campo: 'FeEntRep',
        valorInicial: reparacion?.data.FeEntRep || "",
        isDateField: true
    });

    if (!seccionVisible || !reparacion) return null;

    const avanzarACobrado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Cobrado',
            enviarEmail: false
        }));
    };

    const avanzarAEnviado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Enviado',
            enviarEmail: false
        }));
    };

    const avanzarAFinalizado = async () => {
        const response = await dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Finalizado',
            enviarEmail: false
        }));

        // Verificar si se usó la fecha de entrega como fallback para la fecha de finalización
        if (response.meta.requestStatus === 'fulfilled') {
            const payload = response.payload as { reparacion: any; usedDeliveryDateAsFallback: boolean };
            
            if (payload.usedDeliveryDateAsFallback) {
                openModal({
                    mensaje: "⚠️ La reparación no tenía fecha de finalización. Se ha usado la fecha de entrega como fecha de finalización automáticamente.",
                    tipo: "warning",
                    titulo: "Fecha de Finalización Ajustada",
                });
            } else {
                openModal({
                    mensaje: "Reparación finalizada correctamente.",
                    tipo: "success",
                    titulo: "Reparación Finalizada",
                });
            }
        }
    };

    const avanzarAAbandonado = () => {
        dispatch(cambiarEstadoReparacionAsync({
            reparacionId,
            nuevoEstado: 'Abandonado',
            enviarEmail: false
        }));
    };

    return (
        <SectionCard title="ENTREGA" id="seccion-entrega">
            <FormField
                label="Fecha Entrega"
                id="FeEntRep"
                type="date"
                value={fechaEntrega.value}
                onChange={fechaEntrega.onChange}
                isSaving={fechaEntrega.isSaving}
                disabled={!isAdmin}
            />
            <FormTextarea
                label="Cliente, Comisionista, Correo, Seguimiento"
                id="TxtEntregaRep"
                value={txtEntrega.value}
                onChange={txtEntrega.onChange}
                isSaving={txtEntrega.isSaving}
                rows={5}
                disabled={!isAdmin}
            />
            <FormField
                label="Nro. de Seguimiento"
                id="SeguimientoEntregaRep"
                value={seguimiento.value}
                onChange={seguimiento.onChange}
                isSaving={seguimiento.isSaving}
                disabled={!isAdmin}
            />

            {isAdmin && (
                <div className="mt-3">
                    <div className="d-flex flex-wrap gap-2 mb-2">
                        {(reparacion.data.EstadoRep === 'Reparado' || reparacion.data.EstadoRep === 'Diagnosticado') && puedeAvanzarACobrado && (
                            <AppButton variant="info" className="flex-fill" onClick={avanzarACobrado}>
                                Marcar como Cobrado
                            </AppButton>
                        )}
                        {puedeAvanzarAEnviado && (
                            <AppButton variant="warning" className="flex-fill" onClick={avanzarAEnviado}>
                                Marcar como Enviado
                            </AppButton>
                        )}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        {puedeAvanzarAFinalizado && (
                            <AppButton variant="success" className="flex-fill" onClick={avanzarAFinalizado}>
                                Finalizar Reparación
                            </AppButton>
                        )}
                        {puedeAvanzarAAbandonado && (
                            <AppButton variant="secondary" className="flex-fill" onClick={avanzarAAbandonado}>
                                Marcar como Abandonado
                            </AppButton>
                        )}
                    </div>
                </div>
            )}
        </SectionCard>
    );
};
