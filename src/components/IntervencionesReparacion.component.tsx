import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../redux-tool-kit/hooks/useAppDispatch';
import { useAppSelector } from '../redux-tool-kit/hooks/useAppSelector';
import { getIntervencionesPorReparacionAsync, agregarIntervencionAReparacionAsync, eliminarIntervencionDeReparacionAsync } from '../redux-tool-kit/reparacion/reparacion.actions';
import { AsignacionIntervencion } from '../types/intervencion';
import { useModal } from './Modal/useModal';
import Select from 'react-select';
import { setIntervencionesDeReparacionActual } from '../redux-tool-kit/reparacion/reparacion.slice';
import { selectColeccionModelosDrone } from '../redux-tool-kit/modeloDrone/modeloDrone.selectors';
import { selectColeccionRepuestos } from '../redux-tool-kit/repuesto/repuesto.selectors';
import { selectColeccionIntervenciones } from '../redux-tool-kit/intervencion/intervencion.selectors';
import { selectIntervencionesDeReparacionActual } from '../redux-tool-kit/reparacion';

interface IntervencionesReparacionProps {
  reparacionId: string;
  readOnly?: boolean;
  modeloDroneId?: string;
}

export default function IntervencionesReparacion({ reparacionId, readOnly = false, modeloDroneId }: IntervencionesReparacionProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { openModal } = useModal();

  // Usar selectores optimizados
  const intervenciones = useAppSelector(selectIntervencionesDeReparacionActual);
  const todasLasIntervenciones = useAppSelector(selectColeccionIntervenciones);
  const modelosDrone = useAppSelector(selectColeccionModelosDrone);
  const repuestosInventario = useAppSelector(selectColeccionRepuestos);

  const [intervencionSeleccionada, setIntervencionSeleccionada] = useState<string | null>(null);
  const [totalManoObra, setTotalManoObra] = useState<number>(0);
  const [totalRepuestos, setTotalRepuestos] = useState<number>(0);
  const [totalGeneral, setTotalGeneral] = useState<number>(0);

  // Opciones para el selector de intervenciones - filtrado por modelo de drone
  // Se permiten múltiples asignaciones de la misma intervención
  const opcionesIntervenciones = Object.values(todasLasIntervenciones)
    .filter(intervencion => {
      // Si no hay modeloDroneId, mostrar todas las intervenciones
      if (!modeloDroneId) return true;
      // Si la intervención no tiene ModeloDroneId, es compatible con todos los modelos
      if (!intervencion.data.ModeloDroneId) return true;
      // Filtrar por modelo específico
      return intervencion.data.ModeloDroneId === modeloDroneId;
    })
    .map(intervencion => ({
      value: intervencion.id,
      label: `${intervencion.data.NombreInt}`,
    }));

  useEffect(() => {
    // Cargar intervenciones al montar el componente
    dispatch(getIntervencionesPorReparacionAsync(reparacionId));

    return () => {
      // Limpiar el estado de intervenciones al desmontar el componente
      dispatch(setIntervencionesDeReparacionActual([]));
    }
  }, [dispatch, reparacionId]);

  useEffect(() => {
    // Calcular los totales cuando cambian las asignaciones
    let manoObra = 0;
    let repuestos = 0;
    let total = 0;

    intervenciones.forEach(asignacion => {
      manoObra += asignacion.data.PrecioManoObra;
      repuestos += asignacion.data.PrecioPiezas;
      total += asignacion.data.PrecioTotal;
    });

    setTotalManoObra(manoObra);
    setTotalRepuestos(repuestos);
    setTotalGeneral(total);
  }, [intervenciones]);

  const handleAgregarIntervencion = async () => {
    if (!intervencionSeleccionada) return;

    try {
      await dispatch(agregarIntervencionAReparacionAsync({
        reparacionId,
        intervencionId: intervencionSeleccionada
      })).unwrap();

      setIntervencionSeleccionada(null);

      openModal({
        mensaje: "Asignación de intervención agregada correctamente.",
        tipo: "success",
        titulo: "Agregar Intervención",
      });
    } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
      openModal({
        mensaje: (error as { code?: string })?.code || "Error al agregar la intervención.",
        tipo: "danger",
        titulo: "Error",
      });
    }
  };

  const handleEliminarIntervencion = async (asignacionId: string, nombreIntervencion: string) => {
    openModal({
      mensaje: `¿Está seguro de que desea eliminar esta asignación de "${nombreIntervencion}"?`,
      tipo: "danger",
      titulo: "Eliminar Asignación",
      confirmCallback: async () => {
        try {
          await dispatch(eliminarIntervencionDeReparacionAsync({
            reparacionId,
            intervencionId: asignacionId // Este es el ID de la asignación (repair_intervention.id)
          })).unwrap();

          openModal({
            mensaje: "Asignación eliminada correctamente.",
            tipo: "success",
            titulo: "Eliminar Asignación",
          });
        } catch (error: unknown) { // TODO: Hacer tipo de dato para el error
          openModal({
            mensaje: (error as { code?: string })?.code || "Error al eliminar la intervención.",
            tipo: "danger",
            titulo: "Error",
          });
        }
      }
    });
  };

  // Helper para contar cuántas veces está asignada una intervención
  const contarAsignaciones = (intervencionIdBuscado: string): number => {
    return intervenciones.filter(a => a.data.intervencionId === intervencionIdBuscado).length;
  };

  const formatPrice = (precio: number): string => {
    return precio.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
  };

  const getModeloDroneName = (modeloId: string): string => {
    const modelo = modelosDrone[modeloId];
    return modelo ? modelo.data.NombreModelo : modeloId;
  };

  const getRepuestoInfo = (repuestoId: string) => {
    const repuesto = repuestosInventario[repuestoId];
    return repuesto
      ? `${repuesto.data.NombreRepu} (${formatPrice(repuesto.data.PrecioRepu)})`
      : 'Repuesto no encontrado';
  };

  return (
    <div className="mb-3">
      {!readOnly && (
        <div className="mb-4">
          <div className="row g-3 align-items-center">
            <div className="col">
              <Select
                options={opcionesIntervenciones}
                value={opcionesIntervenciones.find(opt => opt.value === intervencionSeleccionada) || null}
                onChange={(selected) => setIntervencionSeleccionada(selected?.value || null)}
                placeholder="Seleccionar una intervención..."
                isClearable
              />
              {modeloDroneId && (
                <small className="form-text text-muted">
                  Mostrando intervenciones compatibles con este modelo de drone
                </small>
              )}
            </div>
            <div className="col-auto">
              <button
                className="btn bg-bluemcdron text-white"
                onClick={handleAgregarIntervencion}
                disabled={!intervencionSeleccionada}
              >
                <i className="bi bi-plus-circle me-1"></i> Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {intervenciones.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          No hay intervenciones asociadas a esta reparación.
        </div>
      ) : (
        <>
          <div>
            {intervenciones.map((asignacion: AsignacionIntervencion) => {
              // Hacer lookup de la intervención del catálogo
              const intervencion = todasLasIntervenciones[asignacion.data.intervencionId];
              if (!intervencion) return null; // Por si acaso la intervención fue eliminada
              
              return (
              <div
                key={asignacion.id}
                className="card mb-3"
              >
                <div className="card-body">
                  <div className="d-flex w-100 justify-content-between mb-2">
                    <h6 className="mb-1">
                      {intervencion.data.NombreInt}
                      {contarAsignaciones(asignacion.data.intervencionId) > 1 && (
                        <span className="badge bg-info ms-2" style={{fontSize: '0.7rem'}}>
                          x{contarAsignaciones(asignacion.data.intervencionId)}
                        </span>
                      )}
                    </h6>
                    <div>
                      <span className="badge bg-bluemcdron">
                        {formatPrice(asignacion.data.PrecioTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-1 small">
                    <strong>Modelo:</strong> {intervencion.data.ModeloDroneId && getModeloDroneName(intervencion.data.ModeloDroneId)}
                  </div>

                  <div className="mb-1 small">
                    <strong>Tiempo estimado:</strong> {intervencion.data.DuracionEstimada} minutos
                  </div>

                  <div className="mb-2 small">
                    <strong>Descripción:</strong> {intervencion.data.DescripcionInt}
                  </div>

                  {intervencion.data.RepuestosIds && intervencion.data.RepuestosIds.length > 0 && (
                    <div className="mb-2 small">
                      <strong>Repuestos:</strong>
                      <ul className="mb-0 ps-3">
                        {intervencion.data.RepuestosIds.map((repuestoId, idx) => (
                          <li key={idx}>
                            {getRepuestoInfo(repuestoId)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div>
                      <span className="badge bg-secondary me-2">
                        Mano de obra: {formatPrice(asignacion.data.PrecioManoObra)}
                      </span>
                      <span className="badge bg-secondary">
                        Repuestos: {formatPrice(asignacion.data.PrecioPiezas)}
                      </span>
                    </div>

                    {!readOnly && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleEliminarIntervencion(asignacion.id, intervencion.data.NombreInt)}
                      >
                        <i className="bi bi-trash"></i> Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );})}
          </div>

          <div className="card bg-light">
            <div className="card-body">
              <h6 className="card-title">Resumen</h6>
              <div className="row">
                <div className="col">
                  <div className="mb-2">Mano de obra:</div>
                  <div className="mb-2">Repuestos:</div>
                  <div className="fw-bold">Total:</div>
                </div>
                <div className="col-auto text-end">
                  <div className="mb-2">{formatPrice(totalManoObra)}</div>
                  <div className="mb-2">{formatPrice(totalRepuestos)}</div>
                  <div className="fw-bold">{formatPrice(totalGeneral)}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
