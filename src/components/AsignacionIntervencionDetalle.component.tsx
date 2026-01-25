import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { actualizarDescripcionAsignacionAsync, actualizarFotosAsignacionAsync } from '../redux-tool-kit/reparacion/reparacion.actions';
import { subirArchivoPersistencia, eliminarArchivoPersistencia } from '../persistencia/persistencia';
import { useModal } from './Modal/useModal';

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

  const [descripcion, setDescripcion] = useState(descripcionInicial);
  const [fotos, setFotos] = useState<string[]>(fotosIniciales);
  const [isSavingDescripcion, setIsSavingDescripcion] = useState(false);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  // Sincronizar cuando cambia desde el store
  useEffect(() => {
    setDescripcion(descripcionInicial);
  }, [descripcionInicial]);

  useEffect(() => {
    setFotos(fotosIniciales);
  }, [fotosIniciales]);

  const handleDescripcionBlur = async () => {
    // Solo guardar si cambió
    if (descripcion === descripcionInicial) return;

    setIsSavingDescripcion(true);
    try {
      await dispatch(actualizarDescripcionAsignacionAsync({
        asignacionId,
        descripcion
      })).unwrap();
    } catch (error) {
      openModal({
        mensaje: 'Error al guardar la descripción',
        tipo: 'danger',
        titulo: 'Error'
      });
    } finally {
      setIsSavingDescripcion(false);
    }
  };

  const handleAgregarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      openModal({
        mensaje: 'Solo se permiten archivos de imagen',
        tipo: 'danger',
        titulo: 'Error'
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      openModal({
        mensaje: 'La imagen no debe superar los 5MB',
        tipo: 'danger',
        titulo: 'Error'
      });
      return;
    }

    setIsUploadingFoto(true);
    try {
      // Subir archivo a Supabase Storage
      const ruta = `asignaciones/${asignacionId}/${Date.now()}_${file.name}`;
      const url = await subirArchivoPersistencia(ruta, file);

      // Agregar la URL al array de fotos
      const nuevasFotos = [...fotos, url];
      setFotos(nuevasFotos);

      // Guardar en la BD
      await dispatch(actualizarFotosAsignacionAsync({
        asignacionId,
        fotos: nuevasFotos
      })).unwrap();

      openModal({
        mensaje: 'Foto agregada correctamente',
        tipo: 'success',
        titulo: 'Éxito'
      });
    } catch (error) {
      openModal({
        mensaje: 'Error al subir la foto',
        tipo: 'danger',
        titulo: 'Error'
      });
    } finally {
      setIsUploadingFoto(false);
      // Limpiar el input
      e.target.value = '';
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
              {isSavingDescripcion && <small className="text-muted ms-2">Guardando...</small>}
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              onBlur={handleDescripcionBlur}
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
                        src={url}
                        alt={`Foto ${index + 1}`}
                        className="img-fluid rounded"
                        style={{ width: '100%', height: '120px', objectFit: 'cover' }}
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAgregarFoto}
                  disabled={isUploadingFoto}
                  className="form-control form-control-sm"
                  id={`foto-input-${asignacionId}`}
                />
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
