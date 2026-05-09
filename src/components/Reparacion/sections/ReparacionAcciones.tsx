import React from "react";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useHistory } from "../../../hooks/useHistory";
import { useModal } from "../../Modal/useModal";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { selectReparacionById } from "../../../redux-tool-kit/reparacion";
import { crearAmpliacionReparacionAsync, eliminarReparacionAsync } from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { getPublicIdDisplay } from "../../../utils/publicIdHelper";
import { AppButton } from "../../ui";

interface ReparacionAccionesProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionAcciones: React.FC<ReparacionAccionesProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const { openModal } = useModal();
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));

    if (!isAdmin || !reparacion) return null;

    const handleCrearAmpliacion = () => {
        openModal({
            mensaje: `Se creará una nueva reparación vinculada a ${getPublicIdDisplay(reparacion)}.`,
            tipo: "warning",
            titulo: "Crear Ampliación",
            confirmCallback: async () => {
                try {
                    const nuevaReparacion = await dispatch(crearAmpliacionReparacionAsync(reparacionId)).unwrap();
                    openModal({
                        mensaje: `Ampliación creada: ${getPublicIdDisplay(nuevaReparacion)}.`,
                        tipo: "success",
                        titulo: "Crear Ampliación",
                    });
                    history.push(`/inicio/reparaciones/${nuevaReparacion.id}`);
                } catch (error: unknown) {
                    console.error("Error al crear la ampliación:", error);
                    openModal({
                        mensaje: "No se pudo crear la ampliación.",
                        tipo: "danger",
                        titulo: "Crear Ampliación",
                    });
                }
            },
        });
    };

    const handleEliminarReparacion = () => {
        openModal({
            mensaje: "¿Eliminar Reparación?",
            tipo: "danger",
            titulo: "Atención",
            confirmCallback: async () => {
                try {
                    await dispatch(eliminarReparacionAsync(reparacionId)).unwrap();
                    openModal({
                        mensaje: "Reparación eliminada correctamente.",
                        tipo: "success",
                        titulo: "Eliminar Reparación",
                    });
                    history.goBack();
                } catch (error: unknown) {
                    console.error("Error al eliminar la reparación:", error);
                    openModal({
                        mensaje: (error as { code?: string })?.code || "Error al eliminar la reparación.",
                        tipo: "danger",
                        titulo: "Eliminar Reparación",
                    });
                }
            },
        });
    };

    return (
        <div className="text-center">
            <AppButton variant="primary" className="w-100 mb-2" onClick={handleCrearAmpliacion}>
                Crear Ampliación
            </AppButton>
            <AppButton variant="danger" className="w-100" onClick={handleEliminarReparacion}>
                Eliminar
            </AppButton>
        </div>
    );
};
