import React from "react";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useHistory } from "../../../hooks/useHistory";
import { useModal } from "../../Modal/useModal";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { selectReparacionById } from "../../../redux-tool-kit/reparacion";
import { eliminarReparacionAsync } from "../../../redux-tool-kit/reparacion/reparacion.actions";

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
            <button
                key="botonEliminar"
                onClick={handleEliminarReparacion}
                className="w-100 btn bg-danger text-white"
            >
                Eliminar
            </button>
        </div>
    );
};
