import React from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "../../Modal/useModal";
import { 
    selectReparacionById, 
    selectSeccionesVisibles,
} from "../../../redux-tool-kit/reparacion";
import { 
    seleccionarFotoAntesAsync,
    seleccionarFotoDespuesAsync,
} from "../../../redux-tool-kit/reparacion/reparacion.actions";
import { 
    subirFotoYActualizarReparacionAsync,
    borrarFotoAsync,
} from "../../../redux-tool-kit/app/app.actions";
import { ImageGallery } from '../../ImageGallery';

interface ReparacionFotosProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionFotos: React.FC<ReparacionFotosProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const { openModal } = useModal();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).fotos
    );

    if (!seccionVisible || !reparacion) return null;

    const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !reparacion) return;
        const file = e.target.files[0];

        try {
            const response = await dispatch(subirFotoYActualizarReparacionAsync({
                reparacion,
                file
            }));

            if (response.meta.requestStatus !== 'fulfilled') {
                openModal({
                    mensaje: "Error al subir la foto.",
                    tipo: "danger",
                    titulo: "Subir Foto",
                });
            }
        } catch (error) {
            openModal({
                mensaje: "Error al subir la foto.",
                tipo: "danger",
                titulo: "Subir Foto",
            });
        }

        e.target.value = '';
    };

    const handleDeleteFoto = async (fotoUrl: string) => {
        const response = await dispatch(borrarFotoAsync({ reparacionId, fotoUrl }));
        if (response.meta.requestStatus !== 'fulfilled') {
            openModal({
                mensaje: "Error al eliminar la foto.",
                tipo: "danger",
                titulo: "Eliminar Foto",
            });
        }
    };

    const handleSelectFotoAntes = async (url: string) => {
        const response = await dispatch(seleccionarFotoAntesAsync({ 
            reparacionId, 
            fotoUrl: url 
        }));
        
        if (response.meta.requestStatus !== 'fulfilled') {
            openModal({
                mensaje: "Error al guardar la selección de foto ANTES.",
                tipo: "danger",
                titulo: "Seleccionar Foto",
            });
        }
    };

    const handleSelectFotoDespues = async (url: string) => {
        const response = await dispatch(seleccionarFotoDespuesAsync({ 
            reparacionId, 
            fotoUrl: url 
        }));
        
        if (response.meta.requestStatus !== 'fulfilled') {
            openModal({
                mensaje: "Error al guardar la selección de foto DESPUÉS.",
                tipo: "danger",
                titulo: "Seleccionar Foto",
            });
        }
    };

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="d-flex w-100 justify-content-between align-items-center mb-3">
                    <h5 className="card-title bluemcdron">FOTOS</h5>
                    {isAdmin && (
                        <div className="d-flex justify-content-start">
                            <label className="btn btn-outline-secondary bg-bluemcdron text-white">
                                Subir Foto
                                <input
                                    type="file"
                                    onChange={handleFotoChange}
                                    style={{ display: "none" }}
                                    accept="image/*"
                                />
                            </label>
                        </div>
                    )}
                </div>
                {isAdmin && (
                    <div className="alert alert-info mb-3">
                        <small>
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>Selecciona fotos ANTES/DESPUÉS:</strong> Usa los botones 
                            <span className="badge bg-warning text-dark mx-1">
                                <i className="bi bi-arrow-left-circle"></i> ANTES
                            </span> 
                            y 
                            <span className="badge bg-success mx-1">
                                <i className="bi bi-arrow-right-circle"></i> DESPUÉS
                            </span>
                            para marcar las fotos que muestran el estado del drone antes y después de la reparación.
                        </small>
                    </div>
                )}
                <ImageGallery
                    images={reparacion.data.urlsFotos || []}
                    onDelete={isAdmin ? handleDeleteFoto : undefined}
                    isAdmin={isAdmin}
                    photoBeforeUrl={reparacion.data.FotoAntes}
                    photoAfterUrl={reparacion.data.FotoDespues}
                    onSelectBefore={isAdmin ? handleSelectFotoAntes : undefined}
                    onSelectAfter={isAdmin ? handleSelectFotoDespues : undefined}
                    enableSelection={isAdmin}
                />
            </div>
        </div>
    );
};
