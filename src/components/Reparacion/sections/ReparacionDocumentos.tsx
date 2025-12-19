import React from "react";
import { useAppSelector } from "../../../redux-tool-kit/hooks/useAppSelector";
import { useAppDispatch } from "../../../redux-tool-kit/hooks/useAppDispatch";
import { useModal } from "../../Modal/useModal";
import { 
    selectReparacionById, 
    selectSeccionesVisibles,
} from "../../../redux-tool-kit/reparacion";
import { 
    subirDocumentoYActualizarReparacionAsync,
    borrarDocumentoAsync,
} from "../../../redux-tool-kit/app/app.actions";

interface ReparacionDocumentosProps {
    reparacionId: string;
    isAdmin: boolean;
}

export const ReparacionDocumentos: React.FC<ReparacionDocumentosProps> = ({ 
    reparacionId, 
    isAdmin 
}) => {
    const dispatch = useAppDispatch();
    const { openModal } = useModal();
    
    const reparacion = useAppSelector(state => selectReparacionById(reparacionId)(state));
    const seccionVisible = useAppSelector(state => 
        selectSeccionesVisibles(reparacionId, isAdmin)(state).documentos
    );

    if (!seccionVisible || !reparacion) return null;

    const handleDocumentoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length || !reparacion) return;
        const file = e.target.files[0];

        try {
            const response = await dispatch(subirDocumentoYActualizarReparacionAsync({
                reparacion,
                file
            }));

            if (response.meta.requestStatus !== 'fulfilled') {
                openModal({
                    mensaje: "Error al subir el documento.",
                    tipo: "danger",
                    titulo: "Subir Documento",
                });
            }
        } catch (error) {
            openModal({
                mensaje: "Error al subir el documento.",
                tipo: "danger",
                titulo: "Subir Documento",
            });
        }
    };

    const handleDeleteDocumento = async (docUrl: string) => {
        const response = await dispatch(borrarDocumentoAsync({ reparacionId, documentoUrl: docUrl }));
        if (response.meta.requestStatus !== 'fulfilled') {
            openModal({
                mensaje: "Error al eliminar el documento.",
                tipo: "danger",
                titulo: "Eliminar Documento",
            });
        }
    };

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="d-flex w-100 justify-content-between align-items-center">
                    <h5 className="card-title bluemcdron">DOCUMENTOS</h5>
                    {isAdmin && (
                        <div className="d-flex justify-content-start mb-2">
                            <label className="btn btn-outline-secondary bg-bluemcdron text-white">
                                Subir Documento
                                <input
                                    type="file"
                                    onChange={handleDocumentoChange}
                                    style={{ display: "none" }}
                                />
                            </label>
                        </div>
                    )}
                </div>
                <div className="mt-3">
                    {reparacion.data.urlsDocumentos?.length ? (
                        <div className="list-group">
                            {reparacion.data.urlsDocumentos.map((url, idx) => {
                                let fileName = decodeURIComponent(url);
                                fileName = fileName.split('/').pop() || `Documento ${idx + 1}`;
                                fileName = fileName.split('?')[0];

                                return (
                                    <div
                                        key={idx}
                                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-2"
                                    >
                                        <div className="text-truncate" style={{ maxWidth: "70%" }}>
                                            <i className="bi bi-file-earmark-text me-2"></i>
                                            <span className="text-truncate">{fileName}</span>
                                        </div>
                                        <div>
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn btn-sm btn-success me-3"
                                                download
                                            >
                                                <i className="bi bi-cloud-download"></i>
                                            </a>
                                            {isAdmin && (
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDeleteDocumento(url)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-muted">
                            <p>No hay documentos adjuntos</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
