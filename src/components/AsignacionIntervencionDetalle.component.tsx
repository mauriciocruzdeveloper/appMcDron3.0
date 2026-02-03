import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { actualizarDescripcionAsignacionAsync, actualizarFotosAsignacionAsync } from '../redux-tool-kit/reparacion/reparacion.actions';
import { subirImagenConMiniaturaPersistencia, eliminarArchivoPersistencia } from '../persistencia/persistencia';
import { sanitizeBaseName, addTimestampToBase, buildUploadPath } from '../utils/fileUtils';
import { subirFotoAsignacionAsync } from '../redux-tool-kit/app/app.actions';
import { useModal } from './Modal/useModal';
import { getThumbnailUrl } from '../utils/imageUtils';
import { useDebounce } from '../hooks/useDebounce';

interface AsignacionIntervencionDetalleProps {
  asignacionId: string;
  descripcionInicial: string;
  fotosIniciales: string[];
  readOnly?: boolean;
  collapsed?: boolean; // Para controlar si está colapsado o no
}

export const AsignacionIntervencionDetalle: React.FC<AsignacionIntervencionDetalleProps> = ({
  asignacionId,
  descripcionInicial,
  fotosIniciales,
  readOnly = false,
  collapsed = true
}) => {
  const dispatch = useAppDispatch();
  const { openModal } = useModal();

  // Usar hook de debounce para la descripción
  const descripcion = useDebounce({
    valorInicial: descripcionInicial,
    onSave: async (valor) => {
      await dispatch(actualizarDescripcionAsignacionAsync({
        asignacionId,
        descripcion: valor
      })).unwrap();
    },
    delay: 1500
  });

  const [fotos, setFotos] = useState<string[]>(fotosIniciales);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  // Sincronizar fotos cuando cambian desde el store
  useEffect(() => {
    setFotos(fotosIniciales);
  }, [fotosIniciales]);

  const handleAgregarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    setIsUploadingFoto(true);
    try {
      const response = await dispatch(subirFotoAsignacionAsync({
        asignacionId,
        file
      }));

      // SOLO si fue exitoso actualizamos el estado local
      if (response.meta.requestStatus === 'fulfilled') {
        const nuevasFotos = response.payload as string[];
        // Protección extra: si por alguna razón el payload no es array, usamos el anterior o vacío
        setFotos(Array.isArray(nuevasFotos) ? nuevasFotos : fotos);
        openModal({ mensaje: 'Foto agregada correctamente', tipo: 'success', titulo: 'Éxito' });
      } else {
        // Si llegamos acá, es porque el Thunk falló
        throw new Error("Fallo en la respuesta");
      }
    } catch (error: any) {
      openModal({
        mensaje: "No se pudo subir la foto. Intente de nuevo.",
        tipo: "danger",
        titulo: "Error de Subida",
      });
    } finally {
      setIsUploadingFoto(false);
      e.target.value = ''; // Limpiar el input al final de todo
    }
  };

  const handleEliminarFoto = async (url: string) => {
    openModal({
      mensaje: '¿Está seguro de que desea eliminar esta foto?',
      tipo: 'danger',
      titulo: 'Eliminar Foto',
      confirmCallback: async () => {
        try {
          // Eliminar del storage
          await eliminarArchivoPersistencia(url);

          // Actualizar el array
          const nuevasFotos = fotos.filter(f => f !== url);
          setFotos(nuevasFotos);

          // Guardar en la BD
          await dispatch(actualizarFotosAsignacionAsync({
            asignacionId,
            fotos: nuevasFotos
          })).unwrap();

          openModal({
            mensaje: 'Foto eliminada correctamente',
            tipo: 'success',
            titulo: 'Éxito'
          });
        } catch (error) {
          openModal({
            mensaje: 'Error al eliminar la foto',
            tipo: 'danger',
            titulo: 'Error'
          });
        }
      }
    });
  };

  return (
    <div className="mt-3 border-top pt-3">
      <button
        className="btn btn-sm btn-link p-0 mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ textDecoration: 'none' }}
      >
        <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} me-1`}></i>
        {isExpanded ? 'Ocultar' : 'Mostrar'} detalles del presupuesto
      </button>

      {isExpanded && (
        <>
          <div className="mb-3">
            <label className="form-label small fw-bold">
              Descripción del problema
              {descripcion.isSaving && <small className="text-muted ms-2">Guardando...</small>}
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              value={descripcion.value}
              onChange={(e) => descripcion.onChange(e.target.value)}
              disabled={readOnly}
              placeholder="Ej: Articulación delantera derecha quebrada. Se requiere reemplazar la pieza..."
            />
          </div>

          <div className="mb-2">
            <label className="form-label small fw-bold">
              Fotos del problema
            </label>

            {fotos.length > 0 && (
              <div className="row g-2 mb-2">
                {fotos.map((url, index) => (
                  <div key={index} className="col-6 col-md-4 col-lg-3">
                    <div className="position-relative">
                      <img
                        src={getThumbnailUrl(url)}
                        alt={`Foto ${index + 1}`}
                        className="img-fluid rounded"
                        style={{ width: '100%', height: '120px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => window.open(url, '_blank')}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== url) {
                            target.src = url;
                          }
                        }}
                        title="Click para ver en tamaño completo"
                      />
                      {!readOnly && (
                        <button
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                          onClick={() => handleEliminarFoto(url)}
                          style={{ padding: '2px 6px' }}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!readOnly && (
              <div>
                <label className="btn btn-outline-secondary">
                  Subir Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAgregarFoto}
                    disabled={isUploadingFoto}
                    style={{ display: 'none' }}
                  />
                </label>
                {isUploadingFoto && (
                  <small className="text-muted">Subiendo imagen...</small>
                )}
                <small className="form-text text-muted d-block">
                  Máximo 5MB por imagen. Formatos: JPG, PNG, GIF
                </small>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
